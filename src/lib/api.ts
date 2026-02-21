// In dev, use relative URL so Vite proxy can forward /api to backend (no CORS).
const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "" : "http://localhost:8000");

export function getApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("fleetflow_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function apiLogin(email: string, password: string): Promise<{ access_token: string; role: string }> {
  const res = await fetch(getApiUrl("/api/v1/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.detail === "string" ? err.detail : "Login failed");
  }
  return res.json();
}

export async function apiMe(): Promise<{ id: number; email: string; role: string }> {
  const res = await fetch(getApiUrl("/api/v1/auth/me"), { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function downloadReport(format: "csv" | "pdf"): Promise<Blob> {
  const res = await fetch(getApiUrl(`/api/v1/reports/financial-summary?format=${format}`), {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error("Report download failed");
  return res.blob();
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
