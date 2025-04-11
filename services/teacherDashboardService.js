const API_BASE_URL = "https://vps-vert.vercel.app/api";
import { getToken } from "./authService";

import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = 'teacherDashboardCache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const fetchTeacherDashboardData = async (forceRefresh = false) => {
  try {
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;
        if (!isExpired) {
          return data;
        }
      }
    }

    // Fetch fresh data
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/teacher/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    if (response.ok && result.success) {
      // Cache the new data
      const cacheData = {
        data: result.data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch teacher dashboard data");
    }
  } catch (error) {
    console.error("Teacher Dashboard API error:", error);
    throw error;
  }
};