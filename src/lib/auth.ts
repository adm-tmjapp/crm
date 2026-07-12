export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin";
  authStatus?: string;
};

export type AdminSession = {
  token: string;
  user: AdminUser;
};

const STORAGE_KEY = "tmjapp_admin_session";

function isBrowser() {
  return typeof window !== "undefined";
}

type JwtPayload = {
  id?: string;
  role?: string;
  authStatus?: string;
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddingLength = (4 - (normalizedPayload.length % 4)) % 4;
    const paddedPayload = `${normalizedPayload}${"=".repeat(paddingLength)}`;
    const decoded =
      typeof window !== "undefined"
        ? window.atob(paddedPayload)
        : Buffer.from(paddedPayload, "base64").toString("utf-8");

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function isAdminToken(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload || payload.role !== "admin") {
    return false;
  }

  if (typeof payload.exp === "number") {
    const nowInSeconds = Date.now() / 1000;
    return payload.exp > nowInSeconds;
  }

  return true;
}

function parseSession(value: string | null): AdminSession | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as AdminSession;
    if (
      !parsed?.token ||
      parsed.user?.role !== "admin" ||
      !isAdminToken(parsed.token)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getAdminSession(): AdminSession | null {
  if (!isBrowser()) return null;

  return (
    parseSession(window.localStorage.getItem(STORAGE_KEY)) ||
    parseSession(window.sessionStorage.getItem(STORAGE_KEY))
  );
}

export function saveAdminSession(session: AdminSession, remember: boolean) {
  if (!isBrowser()) return;

  const serialized = JSON.stringify(session);
  if (remember) {
    window.localStorage.setItem(STORAGE_KEY, serialized);
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, serialized);
  window.localStorage.removeItem(STORAGE_KEY);
}

export function clearAdminSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function hasAdminAccess(session: AdminSession | null) {
  return Boolean(
    session &&
      session.user.role === "admin" &&
      session.user.id &&
      session.user.email &&
      isAdminToken(session.token)
  );
}
