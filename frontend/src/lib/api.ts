/**
 * API utility for making requests to the Django backend
 */

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  // Use absolute URL to point to Django backend
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Read access token if exists (assuming it's stored in localStorage for now)
  let headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Only add Authorization if running in browser and token exists
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }
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
