import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import * as authService from "../services/authService";

const ResetPasswordScreen = ({ navigation, route }) => {  const mobile = route.params?.mobile ?? "";
const resetToken = route.params?.resetToken ?? "";
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // Verify that we have both mobile and resetToken
  useEffect(() => {
    if (!mobile || !resetToken) {
      toast.error(`Missing required information for password reset`);
      navigation.navigate(`ForgotPassword`);
    }
  }, [mobile, resetToken]);  const validatePassword = (password) => {
    // Password must be at least 6 characters
    return password.length >= 6;
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please enter both passwords");
      return;
    }    if (!validatePassword(newPassword)) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {      const response = await authService.resetPassword(
        mobile,
        resetToken,
        newPassword
      );
      
      if (response.success) {
        toast.success(response.data.message || "Password reset successful!");
        // Navigate to login screen
        navigation.navigate("Login");
      } else {
        toast.error(
          response.data.message || 
          "Failed to reset password. Please try again."
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={["#6b4ce6", "#9d85f2"]}
          style={styles.container}
        >
          <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.header}>
              <Image
                source={{ uri: "https://api.a0.dev/assets/image?text=reset%20password%20lock%20security%20school%20diary&aspect=1:1&seed=789" }}
                style={styles.logo}
              />
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Create a new password for your account
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed" size={20} color="#6b4ce6" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#6b4ce6"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed" size={20} color="#6b4ce6" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#6b4ce6"
                  />
                </TouchableOpacity>              </View>
              
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementTitle}>Password Requirement:</Text>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={newPassword.length >= 6 ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={newPassword.length >= 6 ? "#2ed573" : "#777"}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      newPassword.length >= 6 && styles.validRequirement,
                    ]}
                  >
                    Minimum 6 characters
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (!newPassword || !confirmPassword || newPassword.length < 6 || newPassword !== confirmPassword) && 
                  styles.disabledButton
                ]}
                onPress={handleResetPassword}
                disabled={isLoading || !newPassword || !confirmPassword || newPassword.length < 6 || newPassword !== confirmPassword}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.helpContainer}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.helpText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },  
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },  
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  formContainer: {
    width: width * 0.9,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  iconContainer: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  passwordToggle: {
    padding: 12,
  },
  passwordRequirements: {
    marginVertical: 16,
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: "#777",
    marginLeft: 8,
  },
  validRequirement: {
    color: "#2ed573",
  },
  actionButton: {
    backgroundColor: "#6b4ce6",
    borderRadius: 12,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#6b4ce6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: "#c5b6f2",
    shadowOpacity: 0.1,
  },
  actionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  helpContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  helpText: {
    color: "#6b4ce6",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ResetPasswordScreen;