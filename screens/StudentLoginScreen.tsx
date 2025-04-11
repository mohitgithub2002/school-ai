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
import { useAuth } from "../contexts/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  
  const { login, selectProfile } = useAuth();
  
  const handleLogin = async () => {
  if (!mobile || !password) {
    toast.error(`Please enter both mobile number and password`);
    return;
  }
  setIsLoading(true);
  try {
    const response = await login(mobile, password, "student");
    if (response.success) {        const profiles = response.data.data.profiles;
        if (profiles) {
          // Always navigate to SelectStudentProfile, regardless of profile count
          navigation.navigate("SelectStudentProfile", { profiles });
        } else {
          toast.error("No student profiles found for this account.");
        }
    } else {
      toast.error(`${response.data.message || "Login failed. Please check your credentials."}`);
    }
  } catch (error) {
    toast.error(`An unexpected error occurred. Please try again.`);
    console.error(`Login error:`, error);
  } finally {
    setIsLoading(false);
  }
};

  const goToTeacherLogin = () => {
    navigation.navigate("TeacherLogin");
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
            <View style={styles.header}>
              <Image
                source={{ uri: "https://api.a0.dev/assets/image?text=school%20diary%20logo%20with%20books%20and%20pen&aspect=1:1&seed=123" }}
                style={styles.logo}
              />
              <Text style={styles.title}>VPS School</Text>              
              <Text style={styles.subtitle}>Login to get student data</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Student Login</Text>
                <View style={styles.formDivider} />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person" size={20} color="#6b4ce6" />
                </View>
                <TextInput
                  style={styles.input}                  placeholder="Mobile Number"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={mobile}
onChangeText={setMobile}


                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed" size={20} color="#6b4ce6" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#6b4ce6"
                  />
                </TouchableOpacity>
              </View>              
              
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>OR</Text>
                <View style={styles.separatorLine} />
              </View>

              
              
              <TouchableOpacity 
                style={styles.teacherLoginButton}
                onPress={goToTeacherLogin}
              >
                <Ionicons name="person" size={18} color="#1e3c72" />
                <Text style={styles.teacherLoginText}>Login as Teacher</Text>
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
    color: "rgba(255, 255, 255, 0.8)",
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
    backgroundColor: "#6b4ce6",
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#6b4ce6",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#6b4ce6",
    borderRadius: 12,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#6b4ce6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  separatorText: {
    color: "#999",
    paddingHorizontal: 10,
    fontSize: 14,
  },
  parentLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderWidth: 1,
    borderColor: "#6b4ce6",
    borderRadius: 12,
    marginBottom: 12,
  },
  parentLoginText: {
    color: "#6b4ce6",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  teacherLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderWidth: 1,
    borderColor: "#1e3c72",
    borderRadius: 12,
    backgroundColor: "#f0f7ff",
  },
  teacherLoginText: {
    color: "#1e3c72",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  helpContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  helpText: {
    color: "#999",
    fontSize: 14,
  },
});

export default LoginScreen;