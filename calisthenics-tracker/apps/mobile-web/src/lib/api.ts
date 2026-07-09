const API_BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem("cali_auth_token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = (await res.json().catch(() => ({}))) as T & {
    code?: string;
    message?: string;
  };

  if (!res.ok) {
    throw new ApiError(
      data.code ?? "UNKNOWN",
      data.message ?? `Erreur ${res.status}`,
      res.status,
    );
  }

  return data;
}
