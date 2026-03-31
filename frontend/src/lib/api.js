function resolveApiBaseUrls() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")

  if (envBaseUrl) {
    return [envBaseUrl]
  }

  if (typeof window !== "undefined") {
    const { hostname, port, protocol } = window.location

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const configuredPort = import.meta.env.VITE_API_PORT
      const candidatePorts = [configuredPort, "3000", "5000"].filter(Boolean)
      const uniquePorts = [...new Set(candidatePorts)].filter(
        (candidatePort) => candidatePort !== port
      )

      return uniquePorts.map(
        (candidatePort) => `${protocol}//${hostname}:${candidatePort}`
      )
    }
  }

  return [""]
}

const API_BASE_URLS = resolveApiBaseUrls()

export async function apiRequest(path, options = {}) {
  let response
  let lastNetworkError

  for (const baseUrl of API_BASE_URLS) {
    try {
      response = await fetch(`${baseUrl}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      })
      break
    } catch (error) {
      lastNetworkError = error
    }
  }

  if (!response) {
    throw new Error(
      "Cannot reach the server. Make sure the backend is running and VITE_API_BASE_URL or VITE_API_PORT is set correctly."
    )
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (data?.message || data?.error) {
      throw new Error(data.message || data.error)
    }

    if (response.status === 404) {
      throw new Error(
        `API endpoint not found for ${path}. Make sure the backend is running and your frontend API configuration is correct.`
      )
    }

    throw new Error(`Request failed with status ${response.status}`)
  }

  return data ?? {}
}
