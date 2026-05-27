import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}));

import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import {
  registerAction,
  loginAction,
  changePasswordAction,
  resetPasswordAction,
  updatePasswordAction,
} from "../auth";

// ─── Mock factory ─────────────────────────────────────────────────────────────

function buildMocks() {
  const mockInsertChain = {
    eq: vi.fn().mockResolvedValue({ error: null }),
  };

  const mockQueryChain = {
    insert: vi.fn().mockResolvedValue({ error: null }),
  };

  const mockAuth = {
    signUp: vi.fn().mockResolvedValue({
      data: {
        user: { id: "user-1", email: "test@example.com" },
        session: { access_token: "token" },
      },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({}),
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
    }),
    updateUser: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
  };

  const mockSupabase = {
    auth: mockAuth,
    from: vi.fn().mockReturnValue(mockQueryChain),
  };

  return { mockAuth, mockQueryChain, mockInsertChain, mockSupabase };
}

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

const VALID_REGISTER_FIELDS = {
  email: "user@example.com",
  password: "SecurePass1",
  businessName: "Mi Negocio",
};

const VALID_LOGIN_FIELDS = {
  email: "user@example.com",
  password: "SecurePass1",
};

// ─── registerAction ───────────────────────────────────────────────────────────

describe("registerAction", () => {
  beforeEach(() => {
    const { mockSupabase } = buildMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("registers successfully and redirects to dashboard", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    await registerAction(undefined, makeFormData(VALID_REGISTER_FIELDS));
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects when any required field is missing", async () => {
    const result = await registerAction(
      undefined,
      makeFormData({ email: "", password: "", businessName: "" }),
    );
    expect(result).toEqual({ error: "Todos los campos son obligatorios" });
  });

  it("rejects a password shorter than 8 characters", async () => {
    const result = await registerAction(
      undefined,
      makeFormData({ ...VALID_REGISTER_FIELDS, password: "Short1" }),
    );
    expect(result).toEqual({
      error: "La contraseña debe tener al menos 8 caracteres",
    });
  });

  it("rejects a password without uppercase letter", async () => {
    const result = await registerAction(
      undefined,
      makeFormData({ ...VALID_REGISTER_FIELDS, password: "nouppercase1" }),
    );
    expect(result).toEqual({
      error: "La contraseña debe contener al menos una letra mayúscula",
    });
  });

  it("rejects a password without a number", async () => {
    const result = await registerAction(
      undefined,
      makeFormData({ ...VALID_REGISTER_FIELDS, password: "NoNumberPass" }),
    );
    expect(result).toEqual({
      error: "La contraseña debe contener al menos un número",
    });
  });

  it("rejects a business name shorter than 2 characters", async () => {
    const result = await registerAction(
      undefined,
      makeFormData({ ...VALID_REGISTER_FIELDS, businessName: "A" }),
    );
    expect(result).toEqual({
      error: "El nombre del negocio debe tener entre 2 y 100 caracteres",
    });
  });

  it("rejects a business name exceeding 100 characters", async () => {
    const result = await registerAction(
      undefined,
      makeFormData({
        ...VALID_REGISTER_FIELDS,
        businessName: "a".repeat(101),
      }),
    );
    expect(result).toEqual({
      error: "El nombre del negocio debe tener entre 2 y 100 caracteres",
    });
  });

  it("returns success message when email confirmation is required (no session)", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.signUp.mockResolvedValue({
      data: { user: { id: "user-1" }, session: null },
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await registerAction(
      undefined,
      makeFormData(VALID_REGISTER_FIELDS),
    );
    expect(result).toEqual({
      success:
        "Revisa tu bandeja de entrada y confirma tu email para continuar.",
    });
  });

  it("returns a specific error for already registered email", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "User already registered", status: 400 },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await registerAction(
      undefined,
      makeFormData(VALID_REGISTER_FIELDS),
    );
    expect(result).toEqual({ error: "Este email ya está registrado" });
  });

  it("returns a generic error (not raw DB message) when signUp fails", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Internal server error", status: 500 },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await registerAction(
      undefined,
      makeFormData(VALID_REGISTER_FIELDS),
    );
    expect(result).toEqual({
      error: "Error al crear la cuenta. Inténtalo de nuevo.",
    });
    expect(result?.error).not.toMatch(/Internal server error/);
  });

  it("signs out and returns error when business insert fails", async () => {
    const { mockSupabase, mockQueryChain, mockAuth } = buildMocks();
    mockQueryChain.insert.mockResolvedValue({
      error: { code: "XXXXX", message: "db error" },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await registerAction(
      undefined,
      makeFormData(VALID_REGISTER_FIELDS),
    );
    expect(mockAuth.signOut).toHaveBeenCalled();
    expect(result).toEqual({
      error: "Error al crear el negocio. Inténtalo de nuevo.",
    });
  });
});

// ─── loginAction ──────────────────────────────────────────────────────────────

describe("loginAction", () => {
  beforeEach(() => {
    const { mockSupabase } = buildMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("logs in successfully and redirects to dashboard", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    await loginAction(undefined, makeFormData(VALID_LOGIN_FIELDS));
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects when email or password is missing", async () => {
    const result = await loginAction(
      undefined,
      makeFormData({ email: "", password: "" }),
    );
    expect(result).toEqual({ error: "Email y contraseña son obligatorios" });
  });

  it("returns a specific error for invalid credentials", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials", status: 400 },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await loginAction(
      undefined,
      makeFormData(VALID_LOGIN_FIELDS),
    );
    expect(result).toEqual({ error: "Email o contraseña incorrectos" });
  });

  it("returns a specific error for unconfirmed email", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.signInWithPassword.mockResolvedValue({
      error: { message: "Email not confirmed", status: 400 },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await loginAction(
      undefined,
      makeFormData(VALID_LOGIN_FIELDS),
    );
    expect(result).toEqual({
      error:
        "Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.",
    });
  });

  it("returns a generic error (not raw message) for other signIn failures", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.signInWithPassword.mockResolvedValue({
      error: { message: "Something went wrong on the server", status: 500 },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await loginAction(
      undefined,
      makeFormData(VALID_LOGIN_FIELDS),
    );
    expect(result).toEqual({
      error: "Error al iniciar sesión. Inténtalo de nuevo.",
    });
    expect(result?.error).not.toMatch(/Something went wrong/);
  });
});

// ─── changePasswordAction ─────────────────────────────────────────────────────

describe("changePasswordAction", () => {
  beforeEach(() => {
    const { mockSupabase } = buildMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const VALID_CHANGE_FIELDS = {
    currentPassword: "OldPass1",
    newPassword: "NewSecure1",
    confirmPassword: "NewSecure1",
  };

  it("changes password successfully with valid input", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await changePasswordAction(
      undefined,
      makeFormData(VALID_CHANGE_FIELDS),
    );
    expect(result).toEqual({ success: "Contraseña actualizada correctamente" });
  });

  it("rejects when any required field is missing", async () => {
    const result = await changePasswordAction(
      undefined,
      makeFormData({ currentPassword: "", newPassword: "", confirmPassword: "" }),
    );
    expect(result).toEqual({ error: "Todos los campos son obligatorios" });
  });

  it("rejects when new passwords do not match", async () => {
    const result = await changePasswordAction(
      undefined,
      makeFormData({ ...VALID_CHANGE_FIELDS, confirmPassword: "Different1" }),
    );
    expect(result).toEqual({ error: "Las contraseñas nuevas no coinciden" });
  });

  it("rejects a new password shorter than 8 characters", async () => {
    const result = await changePasswordAction(
      undefined,
      makeFormData({
        ...VALID_CHANGE_FIELDS,
        newPassword: "Short1",
        confirmPassword: "Short1",
      }),
    );
    expect(result).toEqual({
      error: "La contraseña debe tener al menos 8 caracteres",
    });
  });

  it("rejects a new password without uppercase letter", async () => {
    const result = await changePasswordAction(
      undefined,
      makeFormData({
        ...VALID_CHANGE_FIELDS,
        newPassword: "nouppercase1",
        confirmPassword: "nouppercase1",
      }),
    );
    expect(result).toEqual({
      error: "La contraseña debe contener al menos una letra mayúscula",
    });
  });

  it("rejects a new password without a number", async () => {
    const result = await changePasswordAction(
      undefined,
      makeFormData({
        ...VALID_CHANGE_FIELDS,
        newPassword: "NoNumberPass",
        confirmPassword: "NoNumberPass",
      }),
    );
    expect(result).toEqual({
      error: "La contraseña debe contener al menos un número",
    });
  });

  it("returns error when current password is wrong", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials", status: 400 },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await changePasswordAction(
      undefined,
      makeFormData(VALID_CHANGE_FIELDS),
    );
    expect(result).toEqual({ error: "La contraseña actual es incorrecta" });
  });

  it("returns a generic error when updateUser fails", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.updateUser.mockResolvedValue({
      error: { message: "update failed", status: 500 },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await changePasswordAction(
      undefined,
      makeFormData(VALID_CHANGE_FIELDS),
    );
    expect(result).toEqual({
      error: "Error al actualizar la contraseña. Inténtalo de nuevo.",
    });
  });
});

// ─── resetPasswordAction ──────────────────────────────────────────────────────

describe("resetPasswordAction", () => {
  beforeEach(() => {
    const { mockSupabase } = buildMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns success message for a valid email (prevents enumeration)", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await resetPasswordAction(
      undefined,
      makeFormData({ email: "user@example.com" }),
    );
    expect(result).toEqual({
      success:
        "Si este email está registrado, recibirás un enlace en tu bandeja de entrada.",
    });
  });

  it("rejects a missing email", async () => {
    const result = await resetPasswordAction(
      undefined,
      makeFormData({ email: "" }),
    );
    expect(result).toEqual({ error: "El email es obligatorio" });
  });

  it("returns the same success message even when the API call fails (prevents enumeration)", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.resetPasswordForEmail.mockResolvedValue({
      error: { message: "Rate limit exceeded", status: 429 },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await resetPasswordAction(
      undefined,
      makeFormData({ email: "unknown@example.com" }),
    );
    // Always returns success to prevent email enumeration
    expect(result).toEqual({
      success:
        "Si este email está registrado, recibirás un enlace en tu bandeja de entrada.",
    });
  });
});

// ─── updatePasswordAction ─────────────────────────────────────────────────────

describe("updatePasswordAction", () => {
  beforeEach(() => {
    const { mockSupabase } = buildMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const VALID_UPDATE_FIELDS = {
    code: "valid-reset-code",
    password: "NewSecure1",
  };

  it("updates password successfully and redirects to dashboard", async () => {
    const { mockSupabase } = buildMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    await updatePasswordAction(undefined, makeFormData(VALID_UPDATE_FIELDS));
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("rejects when code or password is missing", async () => {
    const result = await updatePasswordAction(
      undefined,
      makeFormData({ code: "", password: "" }),
    );
    expect(result).toEqual({
      error: "Datos incompletos. Usa el enlace del email.",
    });
  });

  it("rejects a password shorter than 8 characters", async () => {
    const result = await updatePasswordAction(
      undefined,
      makeFormData({ ...VALID_UPDATE_FIELDS, password: "Short1" }),
    );
    expect(result).toEqual({
      error: "La contraseña debe tener al menos 8 caracteres",
    });
  });

  it("rejects a password without uppercase letter", async () => {
    const result = await updatePasswordAction(
      undefined,
      makeFormData({ ...VALID_UPDATE_FIELDS, password: "nouppercase1" }),
    );
    expect(result).toEqual({
      error: "La contraseña debe contener al menos una letra mayúscula",
    });
  });

  it("rejects a password without a number", async () => {
    const result = await updatePasswordAction(
      undefined,
      makeFormData({ ...VALID_UPDATE_FIELDS, password: "NoNumberPass" }),
    );
    expect(result).toEqual({
      error: "La contraseña debe contener al menos un número",
    });
  });

  it("returns error when reset code is expired or already used", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.exchangeCodeForSession.mockResolvedValue({
      error: { message: "code expired", status: 400 },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await updatePasswordAction(
      undefined,
      makeFormData(VALID_UPDATE_FIELDS),
    );
    expect(result).toEqual({
      error: "El enlace ha expirado o ya fue usado. Solicita uno nuevo.",
    });
  });

  it("returns a generic error when updateUser fails", async () => {
    const { mockSupabase, mockAuth } = buildMocks();
    mockAuth.updateUser.mockResolvedValue({
      error: { message: "update failed", status: 500 },
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      mockSupabase as never,
    );

    const result = await updatePasswordAction(
      undefined,
      makeFormData(VALID_UPDATE_FIELDS),
    );
    expect(result).toEqual({
      error: "Error al actualizar la contraseña. Inténtalo de nuevo.",
    });
  });
});
