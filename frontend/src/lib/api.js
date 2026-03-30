function resolveApiBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (typeof window !== "undefined") {
    const { hostname, port, protocol } = window.location;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const backendPort = import.meta.env.VITE_API_PORT || "3000";

      if (port !== backendPort) {
        return `${protocol}//${hostname}:${backendPort}`;
      }
    }
  }

  return "";
}

const API_BASE_URL = resolveApiBaseUrl();

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach the server. Make sure the backend is running.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (data?.message || data?.error) {
      throw new Error(data.message || data.error);
    }

    if (response.status === 404) {
      throw new Error(
        "Login API not found. Make sure the backend is running on port 3000 or set VITE_API_BASE_URL in the frontend."
      );
    }

    throw new Error(`Request failed with status ${response.status}`);
  }

  return data ?? {};
}
