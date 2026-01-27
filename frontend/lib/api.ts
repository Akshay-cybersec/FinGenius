import { useAuth } from "@clerk/nextjs";

export const useApi = () => {
  const { getToken } = useAuth();
  const API_URL = "http://127.0.0.1:8000"; 

  const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    if (!token) {
        console.warn("No Clerk token found. User might not be logged in.");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "API Request Failed");
    }

    return response.json();
  };

  return { fetch: authenticatedFetch };
};