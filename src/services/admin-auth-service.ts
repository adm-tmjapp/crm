import { getApiUrl } from "@/lib/api";
import {
  clearAdminSession,
  hasAdminAccess,
  saveAdminSession,
  type AdminSession
} from "@/lib/auth";

type LoginPayload = {
  token?: string;
  success?: boolean;
  message?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    authStatus?: string;
  };
};

export async function loginAdmin(input: {
  email: string;
  password: string;
  remember: boolean;
}) {
  const response = await fetch(getApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password
    })
  });

  const payload = (await response.json()) as LoginPayload;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Nao foi possivel autenticar.");
  }

  const session: AdminSession = {
    token: payload.token || "",
    user: {
      id: payload.user?.id || "",
      name: payload.user?.name || "",
      email: payload.user?.email || "",
      role: "admin",
      authStatus: payload.user?.authStatus
    }
  };

  if (payload.user?.role !== "admin" || !hasAdminAccess(session)) {
    throw new Error("Acesso restrito a administradores.");
  }

  saveAdminSession(session, input.remember);
  return session;
}

export function logoutAdmin() {
  clearAdminSession();
}
