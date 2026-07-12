const DEFAULT_DEV_API_ORIGIN = "http://localhost:3000";
const DEFAULT_PROD_API_BASE = "https://tmjapp-api-53m7i55c3q-rj.a.run.app/api/v2";

export function getApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  if (process.env.NODE_ENV === "production") {
    return DEFAULT_PROD_API_BASE;
  }

  return DEFAULT_DEV_API_ORIGIN;
}

export function getApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();

  if (process.env.NODE_ENV === "production") {
    return `${baseUrl}${normalizedPath}`;
  }

  if (baseUrl.includes("/api/v2")) {
    return `${baseUrl}${normalizedPath}`;
  }

  return `${baseUrl}/api/v2${normalizedPath}`;
}
