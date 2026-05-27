import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/actions", () => ({
  getBusiness: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/dist/client/components/redirect-error", () => ({
  isRedirectError: vi.fn().mockReturnValue(false),
}));

import { getBusiness } from "@/lib/actions";
import { updateBusinessAction, updateScheduleAction } from "../business";

const VALID_UUID = "00000000-0000-0000-0000-000000000001";

// ─── Mock factory ─────────────────────────────────────────────────────────────

function buildMocks() {
  const mockQueryChain = {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  };

  const mockSupabase = {
    from: vi.fn().mockReturnValue(mockQueryChain),
  };

  return { mockQueryChain, mockSupabase };
}

function makeFormData(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (Array.isArray(v)) {
      for (const item of v) fd.append(k, item);
    } else {
      fd.append(k, v);
    }
  }
  return fd;
}

const VALID_BUSINESS_FIELDS = {
  name: "Mi Negocio S.L.",
  category: "barberia",
  address: "Calle Mayor 1",
  phone: "+34 600 000 000",
  contact_email: "info@example.com",
};

const VALID_SCHEDULE_FIELDS: Record<string, string | string[]> = {
  opening_time: "09:00",
  closing_time: "18:00",
  active_days: ["lunes", "martes", "miércoles"],
};

// ─── updateBusinessAction ─────────────────────────────────────────────────────

describe("updateBusinessAction", () => {
  beforeEach(() => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates business settings successfully with valid input", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateBusinessAction(
      undefined,
      makeFormData(VALID_BUSINESS_FIELDS),
    );
    expect(result).toEqual({ success: "Cambios guardados correctamente" });
  });

  it("rejects a name shorter than 2 characters", async () => {
    const result = await updateBusinessAction(
      undefined,
      makeFormData({ ...VALID_BUSINESS_FIELDS, name: "A" }),
    );
    expect(result).toEqual({
      error: "El nombre debe tener entre 2 y 100 caracteres",
    });
  });

  it("rejects an empty name", async () => {
    const result = await updateBusinessAction(
      undefined,
      makeFormData({ ...VALID_BUSINESS_FIELDS, name: "" }),
    );
    expect(result).toEqual({
      error: "El nombre debe tener entre 2 y 100 caracteres",
    });
  });

  it("rejects a name exceeding 100 characters", async () => {
    const result = await updateBusinessAction(
      undefined,
      makeFormData({ ...VALID_BUSINESS_FIELDS, name: "a".repeat(101) }),
    );
    expect(result).toEqual({
      error: "El nombre debe tener entre 2 y 100 caracteres",
    });
  });

  it("rejects an invalid contact email", async () => {
    const result = await updateBusinessAction(
      undefined,
      makeFormData({ ...VALID_BUSINESS_FIELDS, contact_email: "not-an-email" }),
    );
    expect(result).toEqual({
      error: "El email de contacto no es válido",
    });
  });

  it("accepts an empty contact email (optional field)", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateBusinessAction(
      undefined,
      makeFormData({ ...VALID_BUSINESS_FIELDS, contact_email: "" }),
    );
    expect(result).toEqual({ success: "Cambios guardados correctamente" });
  });

  it("returns connection error when getBusiness throws a non-redirect error", async () => {
    vi.mocked(getBusiness).mockRejectedValue(new Error("DB down"));
    const result = await updateBusinessAction(
      undefined,
      makeFormData(VALID_BUSINESS_FIELDS),
    );
    expect(result).toEqual({ error: "Error de conexión. Inténtalo de nuevo." });
  });

  it("returns a generic DB error when update fails", async () => {
    const { mockSupabase, mockQueryChain } = buildMocks();
    mockQueryChain.update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        error: { code: "XXXXX", message: "db error" },
      }),
    });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateBusinessAction(
      undefined,
      makeFormData(VALID_BUSINESS_FIELDS),
    );
    expect(result).toEqual({
      error: "Error al guardar los cambios. Inténtalo de nuevo.",
    });
  });
});

// ─── updateScheduleAction ─────────────────────────────────────────────────────

describe("updateScheduleAction", () => {
  beforeEach(() => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates schedule successfully with valid input", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateScheduleAction(
      undefined,
      makeFormData(VALID_SCHEDULE_FIELDS),
    );
    expect(result).toEqual({ success: "Horario guardado correctamente" });
  });

  it("rejects a missing opening time", async () => {
    const result = await updateScheduleAction(
      undefined,
      makeFormData({ ...VALID_SCHEDULE_FIELDS, opening_time: "" }),
    );
    expect(result).toEqual({ error: "Hora de apertura no válida" });
  });

  it("rejects a malformed opening time", async () => {
    const result = await updateScheduleAction(
      undefined,
      makeFormData({ ...VALID_SCHEDULE_FIELDS, opening_time: "9:00" }),
    );
    expect(result).toEqual({ error: "Hora de apertura no válida" });
  });

  it("rejects a missing closing time", async () => {
    const result = await updateScheduleAction(
      undefined,
      makeFormData({ ...VALID_SCHEDULE_FIELDS, closing_time: "" }),
    );
    expect(result).toEqual({ error: "Hora de cierre no válida" });
  });

  it("rejects a malformed closing time", async () => {
    const result = await updateScheduleAction(
      undefined,
      makeFormData({ ...VALID_SCHEDULE_FIELDS, closing_time: "1800" }),
    );
    expect(result).toEqual({ error: "Hora de cierre no válida" });
  });

  it("rejects opening time equal to closing time", async () => {
    const result = await updateScheduleAction(
      undefined,
      makeFormData({
        ...VALID_SCHEDULE_FIELDS,
        opening_time: "09:00",
        closing_time: "09:00",
      }),
    );
    expect(result).toEqual({
      error: "La hora de apertura debe ser anterior a la de cierre",
    });
  });

  it("rejects opening time after closing time", async () => {
    const result = await updateScheduleAction(
      undefined,
      makeFormData({
        ...VALID_SCHEDULE_FIELDS,
        opening_time: "18:00",
        closing_time: "09:00",
      }),
    );
    expect(result).toEqual({
      error: "La hora de apertura debe ser anterior a la de cierre",
    });
  });

  it("returns connection error when getBusiness throws a non-redirect error", async () => {
    vi.mocked(getBusiness).mockRejectedValue(new Error("DB down"));
    const result = await updateScheduleAction(
      undefined,
      makeFormData(VALID_SCHEDULE_FIELDS),
    );
    expect(result).toEqual({ error: "Error de conexión. Inténtalo de nuevo." });
  });

  it("returns a generic DB error when update fails", async () => {
    const { mockSupabase, mockQueryChain } = buildMocks();
    mockQueryChain.update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        error: { code: "XXXXX", message: "db error" },
      }),
    });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateScheduleAction(
      undefined,
      makeFormData(VALID_SCHEDULE_FIELDS),
    );
    expect(result).toEqual({
      error: "Error al guardar el horario. Inténtalo de nuevo.",
    });
  });
});
