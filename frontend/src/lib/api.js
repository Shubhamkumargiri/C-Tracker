import { getToken } from "./auth"

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
const apiCache = new Map()

export async function apiRequest(path, options = {}) {
  const isGet = (!options.method || options.method.toUpperCase() === "GET");
  const isAnalytics = path.includes("/api/github/analytics") || 
                      path.includes("/api/leetcode/analytics") || 
                      path.includes("/api/devpost/analytics");
                      
  if (isGet && isAnalytics) {
    if (apiCache.has(path)) {
      const cached = apiCache.get(path);
      if (Date.now() - cached.timestamp < 1000 * 60 * 5) {
        return cached.promise;
      }
    }
  }

  const doRequest = async () => {
  let response
  let lastNetworkError
  let lastErrorData
  const token = getToken()

  for (const baseUrl of API_BASE_URLS) {
    try {
      const candidateResponse = await fetch(`${baseUrl}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
        ...options,
      })
      const candidateData = await candidateResponse.json().catch(() => null)

      if (candidateResponse.ok) {
        return candidateData ?? {}
      }

      response = candidateResponse
      lastErrorData = candidateData

      // Keep trying other configured base URLs when a candidate simply does not
      // have the route. This helps during local development when ports vary.
      if (candidateResponse.status === 404) {
        continue
      }

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

  const data = lastErrorData

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
  };

  const promise = doRequest();
  
  if (isGet && isAnalytics) {
    apiCache.set(path, { promise, timestamp: Date.now() });
    promise.catch(() => {
      apiCache.delete(path);
    });
  }

  return promise;
}
