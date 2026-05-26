import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/actions", () => ({
  getBusiness: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase";
import { createBookingAction, type CreateBookingInput } from "../booking";

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
    gte: vi.fn().mockResolvedValue({ count: 0 }),
    single: vi.fn().mockResolvedValue({ data: { id: "svc-1" }, error: null }),
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
  vi.mocked(createSupabaseServerClient).mockResolvedValue(
    mockSupabase as never,
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

const VALID_INPUT: CreateBookingInput = {
  businessId: "biz-1",
  serviceId: "svc-1",
  employeeId: null,
  date: "2026-06-01",
  time: "10:00",
  clientName: "Ana García",
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
  it("returns error when UNIQUE constraint is violated", async () => {
    const { mockQueryChain, mockSupabase } = buildMocks();

    // Simula el error que lanza Supabase cuando viola el UNIQUE constraint
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

    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await createBookingAction(VALID_INPUT);
    expect(result?.error).toBeTruthy();
    // El error debe ser un mensaje genérico en español, nunca el error de DB
    expect(result?.error).not.toMatch(/duplicate|unique|constraint/i);
  });
});
