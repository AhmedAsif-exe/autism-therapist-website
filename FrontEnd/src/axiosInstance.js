// utils/axios.js
import axios from "axios";
import { toast } from "react-toastify";
export async function logout() {
  await api.post("/auth/logout").finally(() => {
    // Clear local state or redirect

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    localStorage.removeItem("user");
  });
}
export async function checkAuthStatus() {
  // If already in localStorage, return it

  try {
    const res = await api.get("/auth/me");
    const user = res.data.user;

    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (err) {
    localStorage.removeItem("user");
    return null;
  }
}
const api = axios.create({
  baseURL: "http://localhost:5000/", // Adjust if needed
  withCredentials: true, // This adds credentials (cookies) to every request
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout if session expired or unauthorized
      logout(); // Clear user from context or redirect to login
    }
    return Promise.reject(error);
  }
);
export default api;
