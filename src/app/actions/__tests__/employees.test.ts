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
  createEmployeeAction,
  updateEmployeeAction,
  deleteEmployeeAction,
} from "../employees";

const VALID_UUID = "00000000-0000-0000-0000-000000000001";
const EMPLOYEE_UUID = "00000000-0000-0000-0000-000000000002";

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

const VALID_EMPLOYEE_FIELDS = {
  name: "Carlos López",
};

// ─── createEmployeeAction ─────────────────────────────────────────────────────

describe("createEmployeeAction", () => {
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

  it("creates an employee successfully with valid input", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await createEmployeeAction(makeFormData(VALID_EMPLOYEE_FIELDS));
    expect(result).toBeUndefined();
  });

  it("rejects an empty name", async () => {
    const result = await createEmployeeAction(makeFormData({ name: "" }));
    expect(result).toEqual({
      error: "El nombre debe tener entre 1 y 100 caracteres",
    });
  });

  it("rejects a name exceeding 100 characters", async () => {
    const result = await createEmployeeAction(
      makeFormData({ name: "a".repeat(101) }),
    );
    expect(result).toEqual({
      error: "El nombre debe tener entre 1 y 100 caracteres",
    });
  });

  it("rejects a name that is only whitespace", async () => {
    const result = await createEmployeeAction(makeFormData({ name: "   " }));
    expect(result).toEqual({
      error: "El nombre debe tener entre 1 y 100 caracteres",
    });
  });

  it("returns connection error when getBusiness throws a non-redirect error", async () => {
    vi.mocked(getBusiness).mockRejectedValue(new Error("DB down"));
    const result = await createEmployeeAction(makeFormData(VALID_EMPLOYEE_FIELDS));
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

    const result = await createEmployeeAction(makeFormData(VALID_EMPLOYEE_FIELDS));
    expect(result).toEqual({
      error: "Error al crear el empleado. Inténtalo de nuevo.",
    });
  });
});

// ─── updateEmployeeAction ─────────────────────────────────────────────────────

describe("updateEmployeeAction", () => {
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

  it("updates an employee successfully with valid input", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateEmployeeAction(
      makeFormData({ ...VALID_EMPLOYEE_FIELDS, id: EMPLOYEE_UUID }),
    );
    expect(result).toBeUndefined();
  });

  it("rejects a missing employee ID", async () => {
    const result = await updateEmployeeAction(
      makeFormData(VALID_EMPLOYEE_FIELDS),
    );
    expect(result).toEqual({ error: "ID de empleado no válido" });
  });

  it("rejects a malformed employee ID", async () => {
    const result = await updateEmployeeAction(
      makeFormData({ ...VALID_EMPLOYEE_FIELDS, id: "not-a-uuid" }),
    );
    expect(result).toEqual({ error: "ID de empleado no válido" });
  });

  it("rejects an empty name", async () => {
    const result = await updateEmployeeAction(
      makeFormData({ id: EMPLOYEE_UUID, name: "" }),
    );
    expect(result).toEqual({
      error: "El nombre debe tener entre 1 y 100 caracteres",
    });
  });

  it("rejects a name exceeding 100 characters", async () => {
    const result = await updateEmployeeAction(
      makeFormData({ id: EMPLOYEE_UUID, name: "a".repeat(101) }),
    );
    expect(result).toEqual({
      error: "El nombre debe tener entre 1 y 100 caracteres",
    });
  });

  it("returns connection error when getBusiness throws", async () => {
    vi.mocked(getBusiness).mockRejectedValue(new Error("DB down"));
    const result = await updateEmployeeAction(
      makeFormData({ ...VALID_EMPLOYEE_FIELDS, id: EMPLOYEE_UUID }),
    );
    expect(result).toEqual({ error: "Error de conexión. Inténtalo de nuevo." });
  });

  it("returns a generic DB error when update fails", async () => {
    const { mockSupabase, mockQueryChain } = buildMocks();
    mockQueryChain.update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: "XXXXX", message: "db error" },
        }),
      }),
    });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateEmployeeAction(
      makeFormData({ ...VALID_EMPLOYEE_FIELDS, id: EMPLOYEE_UUID }),
    );
    expect(result).toEqual({
      error: "Error al actualizar el empleado. Inténtalo de nuevo.",
    });
  });
});

// ─── deleteEmployeeAction ─────────────────────────────────────────────────────

describe("deleteEmployeeAction", () => {
  beforeEach(() => {
    vi.mocked(countActiveBookings).mockResolvedValue(0);
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

  it("deletes an employee successfully when no active bookings exist", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });
    vi.mocked(countActiveBookings).mockResolvedValue(0);

    const result = await deleteEmployeeAction(
      makeFormData({ id: EMPLOYEE_UUID }),
    );
    expect(result).toBeUndefined();
  });

  it("returns an error for a missing ID", async () => {
    const result = await deleteEmployeeAction(makeFormData({}));
    expect(result).toEqual({ error: "ID de empleado no válido" });
  });

  it("returns an error for a malformed ID", async () => {
    const result = await deleteEmployeeAction(makeFormData({ id: "not-a-uuid" }));
    expect(result).toEqual({ error: "ID de empleado no válido" });
  });

  it("blocks deletion when active bookings exist (singular)", async () => {
    vi.mocked(countActiveBookings).mockResolvedValue(1);
    const result = await deleteEmployeeAction(makeFormData({ id: EMPLOYEE_UUID }));
    expect(result?.error).toMatch(/1 reserva activa/);
  });

  it("blocks deletion when multiple active bookings exist (plural)", async () => {
    vi.mocked(countActiveBookings).mockResolvedValue(4);
    const result = await deleteEmployeeAction(makeFormData({ id: EMPLOYEE_UUID }));
    expect(result?.error).toMatch(/4 reservas activas/);
  });

  it("returns connection error when getBusiness throws", async () => {
    vi.mocked(getBusiness).mockRejectedValue(new Error("DB down"));
    const result = await deleteEmployeeAction(makeFormData({ id: EMPLOYEE_UUID }));
    expect(result).toEqual({ error: "Error de conexión. Inténtalo de nuevo." });
  });

  it("returns a generic DB error when delete fails", async () => {
    const { mockSupabase, mockQueryChain } = buildMocks();
    mockQueryChain.delete = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: "XXXXX", message: "db error" },
        }),
      }),
    });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });
    vi.mocked(countActiveBookings).mockResolvedValue(0);

    const result = await deleteEmployeeAction(makeFormData({ id: EMPLOYEE_UUID }));
    expect(result).toEqual({
      error: "Error al eliminar el empleado. Inténtalo de nuevo.",
    });
  });
});
