import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Derive the full API base URL from the current page location.
// This ensures API calls work both in local dev (http://localhost:5000/api/...)
// AND through the Perplexity deploy proxy where the page is served at a
// deep path (e.g. https://sites.pplx.app/sites/proxy/[JWT]/port/5000/).
// We use origin + pathname (stripped of trailing slash) so that
// `${API_BASE}/api/projects` resolves to the correct proxied endpoint.
function getApiBase(): string {
  if (typeof window === "undefined") return "";
  const { origin, pathname } = window.location;
  // Strip trailing slash from pathname
  const base = pathname.replace(/\/$/, "");
  return `${origin}${base}`;
}
const API_BASE = getApiBase();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(`${API_BASE}${queryKey.join("/")}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// v2 — cache bust
export const APP_VERSION = "2.0.0";
