import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const apiFetch = async (path, options = {}, token) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios({
      url: `${API_URL}${path}`,
      method: options.method || "GET",
      data: options.body ? JSON.parse(options.body) : undefined,
      headers
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Request failed";
    throw new Error(message);
  }
};
