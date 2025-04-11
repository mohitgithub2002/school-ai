const API_BASE_URL = "https://vps-vert.vercel.app/api";

import { getToken } from "./authService";

export const fetchDashboardData = async () => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || "Failed to fetch dashboard data");
    }
  } catch (error) {
    console.error("Dashboard API error:", error);
    throw error;
  }
};