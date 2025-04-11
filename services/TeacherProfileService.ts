import { getToken } from "./authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://vps-vert.vercel.app/api";
const CACHE_KEY = "teacherProfileCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const fetchTeacherProfile = async (forceRefresh = false) => {
  try {
    // Check cache first if not forcing a refresh
    if (!forceRefresh) {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { profile, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          return { success: true, profile, fromCache: true };
        }
      }
    }
    
    // If no cache or cache expired or force refresh, fetch from API
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/teacher/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await response.json();    
    
    if (response.ok && data.success) {
      // Since the API returns a single object (not arrays) we map the teacher's subject as designation.
      // This prevents errors where a .map might be called on an undefined or non‑array field.
      const profile = { ...data.data, designation: data.data.subject || "-" };
      
      // Save to cache with current timestamp
      const cacheData = {
        profile,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      return { success: true, profile, fromCache: false };
    } else {
      return { success: false, message: data.message || "Failed to fetch teacher profile" };
    }
  } catch (error: any) {
    console.error("Error fetching teacher profile:", error);
    return { success: false, message: error.message || "Unknown error" };
  }
};