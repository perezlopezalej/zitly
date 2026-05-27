import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/actions", () => ({
  getBusiness: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/booking", () => ({
  countActiveBookings: vi.fn(),
}));

vi.mock("next/dist/client/components/redirect-error", () => ({
  isRedirectError: vi.fn().mockReturnValue(false),
}));

import { getBusiness } from "@/lib/actions";
import { countActiveBookings } from "@/lib/booking";
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from "../services";

const VALID_UUID = "00000000-0000-0000-0000-000000000001";
const SERVICE_UUID = "00000000-0000-0000-0000-000000000002";

// ─── Mock factory ─────────────────────────────────────────────────────────────

function buildMocks() {
  const mockQueryChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  };

  const mockSupabase = {
    from: vi.fn().mockReturnValue(mockQueryChain),
  };

  return { mockQueryChain, mockSupabase };
}

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

const VALID_SERVICE_FIELDS = {
  name: "Corte de pelo",
  description: "Descripción del servicio",
  duration_minutes: "30",
  price: "15.00",
};

// ─── createServiceAction ──────────────────────────────────────────────────────

describe("createServiceAction", () => {
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

  it("creates a service successfully with valid input", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await createServiceAction(
      makeFormData(VALID_SERVICE_FIELDS),
    );
    expect(result).toBeUndefined();
  });

  it("rejects an empty service name", async () => {
    const result = await createServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, name: "" }),
    );
    expect(result).toEqual({
      error: "El nombre debe tener entre 1 y 200 caracteres",
    });
  });

  it("rejects a service name exceeding 200 characters", async () => {
    const result = await createServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, name: "a".repeat(201) }),
    );
    expect(result).toEqual({
      error: "El nombre debe tener entre 1 y 200 caracteres",
    });
  });

  it("rejects a description exceeding 1000 characters", async () => {
    const result = await createServiceAction(
      makeFormData({
        ...VALID_SERVICE_FIELDS,
        description: "x".repeat(1001),
      }),
    );
    expect(result).toEqual({
      error: "La descripción no puede superar los 1000 caracteres",
    });
  });

  it("rejects duration_minutes below 1", async () => {
    const result = await createServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, duration_minutes: "0" }),
    );
    expect(result).toEqual({
      error: "La duración debe estar entre 1 y 480 minutos",
    });
  });

  it("rejects duration_minutes above 480", async () => {
    const result = await createServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, duration_minutes: "481" }),
    );
    expect(result).toEqual({
      error: "La duración debe estar entre 1 y 480 minutos",
    });
  });

  it("rejects a negative price", async () => {
    const result = await createServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, price: "-1" }),
    );
    expect(result).toEqual({
      error: "El precio debe ser un número entre 0 y 99999.99",
    });
  });

  it("rejects a price exceeding 99999.99", async () => {
    const result = await createServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, price: "100000" }),
    );
    expect(result).toEqual({
      error: "El precio debe ser un número entre 0 y 99999.99",
    });
  });

  it("returns connection error when getBusiness throws a non-redirect error", async () => {
    vi.mocked(getBusiness).mockRejectedValue(new Error("DB down"));
    const result = await createServiceAction(
      makeFormData(VALID_SERVICE_FIELDS),
    );
    expect(result).toEqual({ error: "Error de conexión. Inténtalo de nuevo." });
  });

  it("returns a generic DB error when insert fails", async () => {
    const { mockSupabase, mockQueryChain } = buildMocks();
    mockQueryChain.insert.mockResolvedValue({
      error: { code: "XXXXX", message: "some db error" },
    });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await createServiceAction(
      makeFormData(VALID_SERVICE_FIELDS),
    );
    expect(result).toEqual({
      error: "Error al crear el servicio. Inténtalo de nuevo.",
    });
  });
});

// ─── updateServiceAction ──────────────────────────────────────────────────────

describe("updateServiceAction", () => {
  beforeEach(() => {
    const { mockSupabase, mockQueryChain } = buildMocks();

    // update().eq().eq() chain resolves with no error
    const eqChain = {
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockQueryChain.update = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue(eqChain) });

    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates a service successfully with valid input", async () => {
    const { mockSupabase, mockQueryChain } = buildMocks();
    const eqChain = { eq: vi.fn().mockResolvedValue({ error: null }) };
    mockQueryChain.update = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockReturnValue(eqChain) });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, id: SERVICE_UUID }),
    );
    expect(result).toBeUndefined();
  });

  it("rejects a missing service ID", async () => {
    const result = await updateServiceAction(
      makeFormData(VALID_SERVICE_FIELDS),
    );
    expect(result).toEqual({ error: "ID de servicio no válido" });
  });

  it("rejects a malformed service ID", async () => {
    const result = await updateServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, id: "not-a-uuid" }),
    );
    expect(result).toEqual({ error: "ID de servicio no válido" });
  });

  it("rejects an empty service name", async () => {
    const result = await updateServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, id: SERVICE_UUID, name: "" }),
    );
    expect(result).toEqual({
      error: "El nombre debe tener entre 1 y 200 caracteres",
    });
  });

  it("returns connection error when getBusiness throws", async () => {
    vi.mocked(getBusiness).mockRejectedValue(new Error("DB down"));
    const result = await updateServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, id: SERVICE_UUID }),
    );
    expect(result).toEqual({ error: "Error de conexión. Inténtalo de nuevo." });
  });

  it("returns a generic DB error when update fails", async () => {
    const { mockSupabase, mockQueryChain } = buildMocks();
    const eqChain = {
      eq: vi
        .fn()
        .mockResolvedValue({ error: { code: "XXXXX", message: "db error" } }),
    };
    mockQueryChain.update = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockReturnValue(eqChain) });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateServiceAction(
      makeFormData({ ...VALID_SERVICE_FIELDS, id: SERVICE_UUID }),
    );
    expect(result).toEqual({
      error: "Error al actualizar el servicio. Inténtalo de nuevo.",
    });
  });
});

// ─── deleteServiceAction ──────────────────────────────────────────────────────

describe("deleteServiceAction", () => {
  beforeEach(() => {
    vi.mocked(countActiveBookings).mockResolvedValue(0);
    const { mockSupabase, mockQueryChain } = buildMocks();
    const eqChain = { eq: vi.fn().mockResolvedValue({ error: null }) };
    mockQueryChain.delete = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockReturnValue(eqChain) });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a service successfully when no active bookings exist", async () => {
    const { mockSupabase, mockQueryChain } = buildMocks();
    const eqChain = { eq: vi.fn().mockResolvedValue({ error: null }) };
    mockQueryChain.delete = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockReturnValue(eqChain) });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });
    vi.mocked(countActiveBookings).mockResolvedValue(0);

    const result = await deleteServiceAction(SERVICE_UUID);
    expect(result).toBeUndefined();
  });

  it("rejects a malformed service ID", async () => {
    const result = await deleteServiceAction("not-a-uuid");
    expect(result).toEqual({ error: "ID de servicio no válido" });
  });

  it("blocks deletion when active bookings exist (singular)", async () => {
    vi.mocked(countActiveBookings).mockResolvedValue(1);
    const result = await deleteServiceAction(SERVICE_UUID);
    expect(result?.error).toMatch(/1 reserva activa/);
  });

  it("blocks deletion when multiple active bookings exist (plural)", async () => {
    vi.mocked(countActiveBookings).mockResolvedValue(3);
    const result = await deleteServiceAction(SERVICE_UUID);
    expect(result?.error).toMatch(/3 reservas activas/);
  });

  it("returns connection error when getBusiness throws", async () => {
    vi.mocked(getBusiness).mockRejectedValue(new Error("DB down"));
    const result = await deleteServiceAction(SERVICE_UUID);
    expect(result).toEqual({ error: "Error de conexión. Inténtalo de nuevo." });
  });

  it("returns a generic DB error when delete fails", async () => {
    const { mockSupabase, mockQueryChain } = buildMocks();
    const eqChain = {
      eq: vi
        .fn()
        .mockResolvedValue({ error: { code: "XXXXX", message: "db error" } }),
    };
    mockQueryChain.delete = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockReturnValue(eqChain) });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });
    vi.mocked(countActiveBookings).mockResolvedValue(0);

    const result = await deleteServiceAction(SERVICE_UUID);
    expect(result).toEqual({
      error: "Error al eliminar el servicio. Inténtalo de nuevo.",
    });
  });
});
