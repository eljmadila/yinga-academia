/**
 * API utility for making requests to the Django backend
 */

export const DEFAULT_API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://yinga-backend.onrender.com/api"
    : "http://localhost:8000/api")
).trim().replace(/\/+$/, "");

export function resolveApiUrl(path: string): string {
  const rawBase = DEFAULT_API_URL;
  const baseWithoutApi = rawBase.endsWith("/api") ? rawBase.slice(0, -4) : rawBase;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath.startsWith("/api/")) {
    return `${baseWithoutApi}${normalizedPath}`;
  }
  return `${rawBase}${normalizedPath}`;
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:")) return url;
  const origin = (
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
    (process.env.NODE_ENV === "production"
      ? "https://yinga-backend.onrender.com"
      : "http://localhost:8000")
  ).replace(/\/+$/, "");
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function getClientAccessToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
  if (match) return decodeURIComponent(match[1]);
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("accessToken") || localStorage.getItem("access_token") || "";
  }
  return "";
}

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : resolveApiUrl(endpoint);

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  let headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  const token = getClientAccessToken();
  if (token && !("Authorization" in (headers as Record<string, string>))) {
    headers = {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};

// Legacy support if anything else imports `api`
export const api = {
  get: async (endpoint: string) => fetchApi(endpoint, { method: "GET" }),
  post: async (endpoint: string, data: any) => 
    fetchApi(endpoint, { 
      method: "POST", 
      body: JSON.stringify(data) 
    }),
};
