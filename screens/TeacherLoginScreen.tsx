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
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useAuth } from "../contexts/AuthContext";
import * as authService from "../services/authService";

const { width } = Dimensions.get("window");

const TeacherLoginScreen = ({ navigation }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!employeeId || !password) {
      toast.error(`Please enter both employee ID and password`);
      return;
    }
    setIsLoading(true);
    try {
      // Pass role='teacher' to the login function
      const response = await login(employeeId, password, "teacher");
      if (response.success) {
        toast.success(`${response.data.message || "Teacher login successful!"}`);
        navigation.reset({ routes: [{ name: "TeacherDashboard" }] });
      } else {
        toast.error(`${response.data.message || "Login failed. Please check your credentials."}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred. Please try again.`);
      console.error(`Teacher login error:`, error);
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
        <LinearGradient colors={["#1e3c72", "#2a5298"]} style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity 
              style={styles.backButton}              onPress={() => navigation.navigate("Login")}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.header}>
              <Image
                source={{ uri: "https://api.a0.dev/assets/image?text=teacher%20login%20icon%20education&aspect=1:1&seed=teacher" }}
                style={styles.logo}
              />
              <Text style={styles.title}>Teacher Login</Text>              
              <Text style={styles.subtitle}>Access your teacher management system</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Teacher Login</Text>
                <View style={styles.formDivider} />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#1e3c72" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Employee ID"
                  placeholderTextColor="#999"
                  value={employeeId}
                  onChangeText={setEmployeeId}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#1e3c72" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#1e3c72" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => toast.info("Contact administration to reset password")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.helpContainer}>
                <Text style={styles.helpText}>Need help? Contact school admin</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  formContainer: {
    width: width * 0.9,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 10,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  formDivider: {
    width: 40,
    height: 4,
    backgroundColor: "#1e3c72",
    borderRadius: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#1e3c72",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#1e3c72",
    borderRadius: 12,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#1e3c72",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  helpContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  helpText: {
    color: "#999",
    fontSize: 14,
  }
});

export default TeacherLoginScreen;