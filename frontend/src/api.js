const DEFAULT_BASE_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8000"
  : "https://loan-risk-system-production.up.railway.app";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

export async function apiFetch(path, { token, method = "GET", body, headers = {} } = {}) {
  const requestHeaders = {
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  if (!response.ok) {
    const fallbackError = `Request failed: ${response.status}`;
    let message = fallbackError;

    try {
      const errorPayload = await response.json();
      message = errorPayload?.detail || fallbackError;
    } catch {
      message = fallbackError;
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}
