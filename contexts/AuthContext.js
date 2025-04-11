import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'student' or 'teacher'
  const [availableProfiles, setAvailableProfiles] = useState(null);    // Check for existing active profile on app load
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const activeProfileStr = await AsyncStorage.getItem("activeProfile");
          if (activeProfileStr) {
            const activeProfile = JSON.parse(activeProfileStr);
            setUser(activeProfile.user);
            setUserRole(activeProfile.access === "full" ? "student" : "restricted");
            setIsAuthenticated(true);
          } else {
            const token = await authService.getToken();
            if (token) {
              const userData = await authService.getUserData();
              setUser(userData);
              setUserRole(userData?.role || "student");
              setIsAuthenticated(true);
            }
          }
        } catch (error) {
          console.error("Auth context error:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      checkAuth();
    }, []);
  
    // Load stored profiles from AsyncStorage so we retain them after app relaunch
    useEffect(() => {
      const loadStoredProfiles = async () => {
        try {
          const storedProfiles = await AsyncStorage.getItem("profiles");
          if (storedProfiles) {
            setAvailableProfiles(JSON.parse(storedProfiles));
          }
        } catch (error) {
          console.error("Error loading profiles from AsyncStorage", error);
        }
      };
      loadStoredProfiles();
    }, []);

  // Login function
  const login = async (id, password, role = "student") => {
    setIsLoading(true);
    try {
      if (role === "teacher") {
        const response = await authService.teacherLogin(id, password);
        if (response.success) {
          const userData = response.data.data.user;
          setUser(userData);
          setUserRole(role);
          setIsAuthenticated(true);
          const userWithRole = { ...userData, role };
          await authService.storeUserData(userWithRole);
          return { success: true, data: response.data };
        }
        return { success: false, data: response.data };        } else {
          // For student login, process the response and always route to profile selection
          const response = await authService.login(id, password);
          if (response.success) {
            const profiles = response.data.data.profiles;
            if (profiles && profiles.length >= 1) {
              setAvailableProfiles(profiles);
              await AsyncStorage.setItem("profiles", JSON.stringify(profiles));
            }
          }
          return response;
        }
    } catch (error) {
      console.error("Login error in context:", error);
      return { success: false, data: { message: "An unexpected error occurred" } };
    } finally {
      setIsLoading(false);
    }
  };  // Logout function: Completely logs out by deleting all profiles, tokens, and user data.
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setUserRole(null);
      setAvailableProfiles(null)
      setIsAuthenticated(false);
      // Remove active profile and all stored profiles from AsyncStorage.
      await AsyncStorage.removeItem("activeProfile");
      await AsyncStorage.removeItem("profiles");
      // Also clear token and user data if applicable.
      if (authService.removeToken) {
        await authService.removeToken();
      }
      if (authService.removeUserData) {
        await authService.removeUserData();
      }
      return { success: true };
    } catch (error) {
      console.error("Logout error in context:", error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Select profile function
  const selectProfile = async (profile) => {
    try {
      setIsLoading(true);
      if (profile.token) {
        await authService.storeToken(profile.token);
      }
      setUser(profile.user);
      setUserRole(profile.access === "full" ? "student" : "restricted");
      setIsAuthenticated(true);
      // Store active profile in AsyncStorage for auto-login and cache purposes
      await AsyncStorage.setItem("activeProfile", JSON.stringify(profile));

      return { success: true };
    } catch (error) {
      console.error("Select profile error:", error);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    userRole,
    isLoading,
    availableProfiles,
    login,
    logout,
    selectProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};