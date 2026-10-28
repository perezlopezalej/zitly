import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/actions", () => ({
  getBusiness: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createSupabaseAdminClient } from "@/lib/supabase";
import { getBusiness } from "@/lib/actions";
import { createBookingAction, updateBookingStatusAction } from "../booking";
import type { CreateBookingInput } from "@/types";

const TODAY = "2026-05-22";

// ─── Mocks recreados en cada test para evitar estado compartido ──────────────

function buildMocks() {
  const mockInsertChain = {
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: "b-1", date: "2026-06-01", time: "10:00" },
      error: null,
    }),
  };

  const mockQueryChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    gte: vi.fn().mockResolvedValue({ count: 0 }),
    single: vi.fn().mockResolvedValue({
      data: { id: "svc-1", name: "Corte de pelo" },
      error: null,
    }),
    insert: vi.fn().mockReturnValue(mockInsertChain),
  };

  const mockSupabase = { from: vi.fn().mockReturnValue(mockQueryChain) };

  return { mockInsertChain, mockQueryChain, mockSupabase };
}

// ─── Fake timers por test, no por suite ──────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(TODAY));
  const { mockSupabase } = buildMocks();
  // createSupabaseAdminClient es síncrono — mockReturnValue, no mockResolvedValue
  vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as never);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

const VALID_INPUT: CreateBookingInput = {
  businessId: "00000000-0000-0000-0000-000000000001",
  serviceId:  "00000000-0000-0000-0000-000000000002",
  employeeId: null,
  date:        "2026-06-01",
  time:        "10:00",
  clientName:  "Ana García",
  clientEmail: "ana@example.com",
};

// ─── Date validation ─────────────────────────────────────────────────────────

describe("createBookingAction — date validation", () => {
  it("rejects a date in the past", async () => {
    const result = await createBookingAction({
      ...VALID_INPUT,
      date: "2026-05-21",
    });
    expect(result).toEqual({ error: "La fecha no puede ser en el pasado" });
  });

  it("accepts today as a valid date", async () => {
    const result = await createBookingAction({ ...VALID_INPUT, date: TODAY });
    expect(result?.error).not.toBe("La fecha no puede ser en el pasado");
  });

  it("rejects a date more than one year in the future", async () => {
    const result = await createBookingAction({
      ...VALID_INPUT,
      date: "2027-05-23",
    });
    expect(result).toEqual({
      error: "La fecha no puede ser superior a un año desde hoy",
    });
  });

  it("accepts a date exactly one year from today", async () => {
    const result = await createBookingAction({
      ...VALID_INPUT,
      date: "2027-05-22",
    });
    expect(result?.error).not.toBe(
      "La fecha no puede ser superior a un año desde hoy",
    );
  });
});

// ─── Email validation ────────────────────────────────────────────────────────

describe("createBookingAction — email validation", () => {
  it("rejects an email without @", async () => {
    const result = await createBookingAction({
      ...VALID_INPUT,
      clientEmail: "not-an-email",
    });
    expect(result).toEqual({ error: "Email no válido" });
  });

  it("rejects an email without domain after @", async () => {
    const result = await createBookingAction({
      ...VALID_INPUT,
      clientEmail: "user@",
    });
    expect(result).toEqual({ error: "Email no válido" });
  });

  it("rejects an empty email", async () => {
    const result = await createBookingAction({
      ...VALID_INPUT,
      clientEmail: "",
    });
    expect(result).toEqual({ error: "Email no válido" });
  });
});

// ─── Time range validation ───────────────────────────────────────────────────

describe("createBookingAction — time range validation", () => {
  it("rejects a time before 09:00", async () => {
    const result = await createBookingAction({ ...VALID_INPUT, time: "08:00" });
    expect(result?.error).toMatch(/09:00/);
  });

  it("rejects 18:00 (exclusive upper bound)", async () => {
    const result = await createBookingAction({ ...VALID_INPUT, time: "18:00" });
    expect(result?.error).toMatch(/09:00/);
  });

  it("rejects a time after 18:00", async () => {
    const result = await createBookingAction({ ...VALID_INPUT, time: "19:00" });
    expect(result?.error).toMatch(/09:00/);
  });

  it("accepts 09:00 as the earliest valid slot", async () => {
    const result = await createBookingAction({ ...VALID_INPUT, time: "09:00" });
    expect(result).toHaveProperty("booking");
  });

  it("accepts 17:30 as the last valid slot", async () => {
    const result = await createBookingAction({ ...VALID_INPUT, time: "17:30" });
    expect(result).toHaveProperty("booking");
  });
});

// ─── Client name validation ──────────────────────────────────────────────────

describe("createBookingAction — client name validation", () => {
  it("rejects an empty name", async () => {
    const result = await createBookingAction({
      ...VALID_INPUT,
      clientName: "",
    });
    expect(result).toEqual({ error: "Nombre no válido" });
  });

  it("rejects a name that is only whitespace", async () => {
    const result = await createBookingAction({
      ...VALID_INPUT,
      clientName: "   ",
    });
    expect(result).toEqual({ error: "Nombre no válido" });
  });
});

// ─── Double booking prevention ───────────────────────────────────────────────

describe("createBookingAction — double booking prevention", () => {
  it("returns a slot-unavailable error when UNIQUE constraint is violated", async () => {
    const { mockQueryChain, mockSupabase } = buildMocks();

    // Simula el error 23505 que lanza Supabase al violar el UNIQUE constraint
    mockQueryChain.insert.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: "23505",
          message: "duplicate key value violates unique constraint",
        },
      }),
    });

    vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as never);

    const result = await createBookingAction(VALID_INPUT);

    // El error debe ser explícito sobre la disponibilidad, en español, nunca el error de DB
    expect(result?.error).toBe(
      "Este horario ya no está disponible. Por favor elige otro.",
    );
    expect(result?.error).not.toMatch(/duplicate|unique|constraint/i);
  });

  it("returns a slot-unavailable error on 23505 when an employee is given", async () => {
    const { mockQueryChain, mockSupabase } = buildMocks();
    mockQueryChain.insert.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: "23505", message: "duplicate key value" },
      }),
    });
    vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as never);

    const result = await createBookingAction({
      ...VALID_INPUT,
      employeeId: "00000000-0000-0000-0000-000000000003",
    });

    expect(result?.error).toBe(
      "Este horario ya no está disponible. Por favor elige otro.",
    );
  });

  it("does not run a pre-insert availability query (the DB index is the arbiter)", async () => {
    const { mockQueryChain, mockSupabase } = buildMocks();
    vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as never);

    const result = await createBookingAction(VALID_INPUT);

    expect(result).toHaveProperty("booking");
    expect(mockQueryChain.neq).not.toHaveBeenCalled();
    expect(mockQueryChain.is).not.toHaveBeenCalled();
    expect(mockQueryChain.insert).toHaveBeenCalledTimes(1);
  });
});

// ─── Business hours stored as TEXT ('HH:MM') ─────────────────────────────────

describe("createBookingAction — hours stored as text", () => {
  function mockBusinessHours(opening_time: string, closing_time: string) {
    const { mockQueryChain, mockSupabase } = buildMocks();
    mockQueryChain.single
      .mockResolvedValueOnce({
        data: { name: "Salón", opening_time, closing_time, phone: null, contact_email: null },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: "svc-1", name: "Corte" }, error: null });
    vi.mocked(createSupabaseAdminClient).mockReturnValue(mockSupabase as never);
  }

  it("accepts a slot inside custom '10:00'–'14:00' hours", async () => {
    mockBusinessHours("10:00", "14:00");
    const result = await createBookingAction({ ...VALID_INPUT, time: "13:30" });
    expect(result).toHaveProperty("booking");
  });

  it("rejects a slot outside custom hours with the stored opening time", async () => {
    mockBusinessHours("10:00", "14:00");
    const result = await createBookingAction({ ...VALID_INPUT, time: "09:30" });
    expect(result?.error).toBe("La hora debe estar entre las 10:00 y las 13:30");
  });
});

// ─── updateBookingStatusAction ───────────────────────────────────────────────

describe("updateBookingStatusAction — UNIQUE conflict", () => {
  const BOOKING_ID = "00000000-0000-0000-0000-0000000000aa";

  function formData(status: string) {
    const fd = new FormData();
    fd.set("bookingId", BOOKING_ID);
    fd.set("status", status);
    return fd;
  }

  function mockUpdateResult(error: { code: string; message: string } | null) {
    const chain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    chain.eq
      .mockReturnValueOnce(chain)
      .mockResolvedValueOnce({ error });
    const supabase = { from: vi.fn().mockReturnValue(chain) };
    vi.mocked(getBusiness).mockResolvedValue({
      supabase,
      businessId: "biz-1",
    } as never);
  }

  it("returns a Spanish slot-taken error on 23505 (reactivating a cancelled booking)", async () => {
    mockUpdateResult({ code: "23505", message: "duplicate key value violates unique constraint" });

    const result = await updateBookingStatusAction(undefined, formData("confirmed"));

    expect(result).toEqual({ error: "Ese horario ya está reservado por otra persona." });
    expect(result?.error).not.toMatch(/duplicate|unique|constraint/i);
  });

  it("returns the generic error for other DB errors", async () => {
    mockUpdateResult({ code: "XX000", message: "boom" });

    const result = await updateBookingStatusAction(undefined, formData("cancelled"));

    expect(result).toEqual({ error: "Error al actualizar la reserva. Inténtalo de nuevo." });
  });
});
