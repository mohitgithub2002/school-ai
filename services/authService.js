import AsyncStorage from "@react-native-async-storage/async-storage";

// Toggle between real API calls and mock data
const USE_MOCK_DATA = true;
const API_BASE_URL = "https://vps-vert.vercel.app/api";

// Mock data for development/testing
const MOCK_USERS = {
  "12345": {
    id: "1001",
    rollNumber: "12345",
    password: "password123", // In real app, this would be hashed
    name: "John Smith",
    class: "10A",
    section: "A",
    role: "student",
    mobileNumber: "+91 98765 43210"
  }
};

// Token operations
export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem("authToken", token);
  } catch (error) {
    console.error("Error storing auth token:", error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};

// User data operations
export const storeUserData = async (userData) => {
  try {
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem("userData");
  } catch (error) {
    console.error("Error removing user data:", error);
  }
};

// Helper function for mock API delays
const mockDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (mobile, password) => {
  
  try {
    // Real API call
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },      body: JSON.stringify({ mobile, password }),
    });
    const data = await response.json();  
    
      if (response.ok) {
      // For student login, if the response contains profiles, handle accordingly    if (data.data?.profiles) {
      if (data.data.profiles.length === 0) {
          const profile = data.data.profiles[0];
          if (profile.token) {
            await storeToken(profile.token);
          }
          await storeUserData(profile.user);      } else if (data.data.profiles.length > 0) {
          // Clear any previously stored token and user data to ensure the profile selection screen appears
          await removeToken();
          await removeUserData();
          console.log("Multiple profiles found:", data.data.profiles);
          await AsyncStorage.setItem("profiles", JSON.stringify(data.data.profiles));
      }
    }   
    
    return {
      success: response.ok,
      data,
      status: response.status
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      data: { 
        status: "error",
        message: "Network error. Please check your connection." 
      },
      status: 0
    };
  }
};

// Teacher Login API
export const teacherLogin = async (teacherId, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/teacher/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teacherId, password }),
    });
    const data = await response.json();
    
    if (response.ok && data.data?.token) {
      await storeToken(data.data.token);
      await storeUserData({ ...data.data.user, role: "teacher" });
    }
    
    return {
      success: response.ok,
      data,
      status: response.status,
    };
  } catch (error) {
    console.error("Teacher login error:", error);
    return {
      success: false,
      data: {
        status: "error",
        message: `Network error. Please check your connection.`,
      },
      status: 0,
    };
  }
};

// Forgot Password API (Request OTP)
export const requestPasswordReset = async (mobile) => {
  try {
    // Use mock data if enabled
    
    // Real API call
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },      body: JSON.stringify({ mobile }),
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      data,
      status: response.status
    };
  } catch (error) {
    console.error("Request password reset error:", error);
    return {
      success: false,
      data: { 
        status: "error",
        message: "Network error. Please check your connection." 
      },
      status: 0
    };
  }
};

// Verify OTP API
export const verifyOTP = async (mobile, otp) => {
  try {
    // Use mock data if enabled
    
    // Real API call
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },      body: JSON.stringify({ mobile, otp }),
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      data,
      status: response.status
    };
  } catch (error) {
    console.error("Verify OTP error:", error);
    return {
      success: false,
      data: { 
        status: "error",
        message: "Network error. Please check your connection." 
      },
      status: 0
    };
  }
};

// Reset Password API
export const resetPassword = async (mobile, resetToken, newPassword) => {
  try {
    // Use mock data if enabled
    
    
    // Real API call
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },      body: JSON.stringify({ mobile, resetToken, newPassword }),
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      data,
      status: response.status
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      data: { 
        status: "error",
        message: "Network error. Please check your connection." 
      },
      status: 0
    };
  }
};

// Resend OTP API
export const resendOTP = async (mobile) => {
  try {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      await mockDelay();      const user = MOCK_USERS[mobile];
      
      if (user) {
        // Mask the mobile number
        const maskedMobile = user.mobileNumber.replace(/\d(?=\d{4})/g, "*");
        
        return {
          success: true,
          data: {
            status: "success",
            message: "OTP resent successfully",
            data: {
              maskedMobile
            }
          },
          status: 200
        };
      } else {
        return {
          success: false,
          data: {
            status: "error",            message: "Mobile number not found"
          },
          status: 404
        };
      }
    }
    
    // Real API call
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },      body: JSON.stringify({ mobile }),
    });

    const data = await response.json();
    
    return {
      success: response.ok,
      data,
      status: response.status
    };
  } catch (error) {
    console.error("Resend OTP error:", error);
    return {
      success: false,
      data: { 
        status: "error",
        message: "Network error. Please check your connection." 
      },
      status: 0
    };
  }
};

// Logout function
export const logout = async () => {
  await removeToken();
  await removeUserData();
  return { success: true };
};