import { QueryClient, QueryFunction } from "@tanstack/react-query";

// This creates the main "engine" that manages all your data fetching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't reload data just because I clicked the window
      staleTime: Infinity, // Data stays "fresh" forever unless we say otherwise
      retry: false, // If an API call fails, don't keep retrying immediately
    },
  },
});

// This is a helper function to make API requests (GET, POST, etc.) easier
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || res.statusText);
  }

  return res;
}

// This helper is used by useQuery to automatically fetch data from your API
export const getQueryClient: QueryFunction = async ({ queryKey }) => {
  const url = queryKey[0] as string;
  const res = await apiRequest("GET", url);
  return res.json();
};