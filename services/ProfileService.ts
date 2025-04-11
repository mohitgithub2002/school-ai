import { getToken } from "./authService";

const API_BASE_URL = "https://vps-vert.vercel.app/api";

export const fetchUserProfile = async () => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (response.ok && data.success) {
      return { success: true, profile: data.profile };
    } else {
      return { success: false, message: data.message || "Failed to fetch profile" };
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
};