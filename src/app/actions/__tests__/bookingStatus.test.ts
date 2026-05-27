import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// booking.ts imports createSupabaseAdminClient at the module level (used by
// createBookingAction in the same file). Without this mock, supabase.ts throws
// at import time because env vars are absent in the test environment.
// updateBookingStatusAction itself does NOT use the admin client.
vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

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
import { updateBookingStatusAction } from "../booking";

const VALID_UUID = "00000000-0000-0000-0000-000000000001";
const BOOKING_UUID = "00000000-0000-0000-0000-000000000002";

// ─── Mock factory ─────────────────────────────────────────────────────────────

function buildMocks() {
  const mockQueryChain = {
    update: vi.fn().mockReturnValue({
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

// ─── updateBookingStatusAction ────────────────────────────────────────────────

describe("updateBookingStatusAction", () => {
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

  it("updates booking status to confirmed successfully", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateBookingStatusAction(
      undefined,
      makeFormData({ bookingId: BOOKING_UUID, status: "confirmed" }),
    );
    expect(result).toBeUndefined();
  });

  it("updates booking status to cancelled successfully", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateBookingStatusAction(
      undefined,
      makeFormData({ bookingId: BOOKING_UUID, status: "cancelled" }),
    );
    expect(result).toBeUndefined();
  });

  it("silently returns undefined when bookingId is missing", async () => {
    const result = await updateBookingStatusAction(
      undefined,
      makeFormData({ bookingId: "", status: "confirmed" }),
    );
    expect(result).toBeUndefined();
  });

  it("silently returns undefined when status is missing", async () => {
    const result = await updateBookingStatusAction(
      undefined,
      makeFormData({ bookingId: BOOKING_UUID, status: "" }),
    );
    expect(result).toBeUndefined();
  });

  it("silently returns undefined when bookingId is a malformed UUID", async () => {
    const result = await updateBookingStatusAction(
      undefined,
      makeFormData({ bookingId: "not-a-uuid", status: "confirmed" }),
    );
    expect(result).toBeUndefined();
  });

  it("silently returns undefined for a disallowed status value (e.g. 'pending')", async () => {
    const result = await updateBookingStatusAction(
      undefined,
      makeFormData({ bookingId: BOOKING_UUID, status: "pending" }),
    );
    expect(result).toBeUndefined();
  });

  it("silently returns undefined for an arbitrary unknown status string", async () => {
    const result = await updateBookingStatusAction(
      undefined,
      makeFormData({ bookingId: BOOKING_UUID, status: "hacked" }),
    );
    expect(result).toBeUndefined();
  });

  it("returns connection error when getBusiness throws a non-redirect error", async () => {
    vi.mocked(getBusiness).mockRejectedValue(new Error("DB down"));
    const result = await updateBookingStatusAction(
      undefined,
      makeFormData({ bookingId: BOOKING_UUID, status: "confirmed" }),
    );
    expect(result).toEqual({ error: "Error de conexión. Inténtalo de nuevo." });
  });

  it("returns a generic DB error (not raw message) when update fails", async () => {
    const { mockSupabase, mockQueryChain } = buildMocks();
    mockQueryChain.update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { code: "XXXXX", message: "raw db error exposed" },
        }),
      }),
    });
    vi.mocked(getBusiness).mockResolvedValue({
      supabase: mockSupabase as never,
      businessId: VALID_UUID,
      businessName: "Mi negocio",
    });

    const result = await updateBookingStatusAction(
      undefined,
      makeFormData({ bookingId: BOOKING_UUID, status: "confirmed" }),
    );
    expect(result).toEqual({
      error: "Error al actualizar la reserva. Inténtalo de nuevo.",
    });
    expect(result?.error).not.toMatch(/raw db error/i);
  });
});
