import React, { useState, useRef, useEffect } from "react";
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

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // Step 1: Enter Roll Number, Step 2: Enter OTP  
  const [mobile, setMobile] = useState("");  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [timer, setTimer] = useState(30);
  const [resendActive, setResendActive] = useState(false);

  // Refs for OTP input fields
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            setResendActive(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = async () => {    if (!mobile) {
      toast.error(`Please enter your mobile number`);
      return;
    }

    setIsLoading(true);
    
    try {      const response = await authService.requestPasswordReset(mobile);
      
      if (response.success) {
        setMobileNumber(response.data.data.maskedMobile);
        setStep(2);
        setTimer(30);
        setResendActive(false);
        toast.success(response.data.message || "OTP sent successfully");
      } else {
        toast.error(
          response.data.message || 
          "Failed to send OTP. Please check your roll number."
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Send OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!resendActive) return;
    
    setIsLoading(true);
    
    try {      const response = await authService.resendOTP(mobile);
      
      if (response.success) {
        setTimer(30);
        setResendActive(false);
        toast.success(response.data.message || "OTP resent successfully");
      } else {
        toast.error(
          response.data.message || 
          "Failed to resend OTP. Please try again."
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Resend OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Move to next input if current input is filled
    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== otp.length) {
      toast.error("Please enter a complete OTP");
      return;
    }

    setIsLoading(true);
    
    try {      const response = await authService.verifyOTP(mobile, otpValue);
      
      if (response.success) {
        toast.success(response.data.message || "OTP verified successfully");
        // Store the reset token for the reset password screen
        const resetToken = response.data.data.resetToken;        navigation.navigate("ResetPassword", { mobile, resetToken });
      } else {
        toast.error(
          response.data.message || 
          "Invalid OTP. Please try again."
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Verify OTP error:", error);
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
              onPress={() => {
                if (step === 1) {
                  navigation.navigate("Login");
                } else {
                  setStep(1);
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.header}>
              <Image
                source={{ uri: "https://api.a0.dev/assets/image?text=forgot%20password%20school%20diary%20recovery&aspect=1:1&seed=456" }}
                style={styles.logo}
              />
              <Text style={styles.title}>
                {step === 1 ? "Forgot Password" : "OTP Verification"}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1 
                  ?                "Enter your mobile number to reset your password" : `Enter the OTP sent to ${mobileNumber}`
                }
              </Text>
            </View>

            <View style={styles.formContainer}>
              {step === 1 ? (
                <>
                  <View style={styles.inputContainer}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="person" size={20} color="#6b4ce6" />
                    </View>
                    <TextInput
                      style={styles.input}                      placeholder="Mobile Number"
                      placeholderTextColor="#999"
                      keyboardType="number-pad"                      value={mobile}                      onChangeText={setMobile}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSendOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.otpContainer}>                    <View style={styles.otpInputsWrapper}>
                      {otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          style={styles.otpInput}
                          keyboardType="number-pad"
                          maxLength={1}
                          value={digit}
                          onChangeText={(text) => handleOtpChange(text, index)}
                          onKeyPress={(e) => handleOtpKeyPress(e, index)}
                        />
                      ))}
                    </View>
                  </View>
                  <View style={styles.timerContainer}>
                    {timer > 0 ? (
                      <Text style={styles.timerText}>
                        Resend OTP in {timer}s
                      </Text>
                    ) : (
                      <TouchableOpacity 
                        style={styles.resendButton}
                        onPress={handleResendOTP}
                        disabled={isLoading}
                      >
                        <Text style={styles.resendButtonText}>Resend OTP</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      otp.join("").length !== otp.length && styles.disabledButton
                    ]}
                    onPress={handleVerifyOTP}
                    disabled={isLoading || otp.join("").length !== otp.length}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.actionButtonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

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
    marginBottom: 24,
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
  },  otpContainer: {
    marginVertical: 20,
  },
  otpInputsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpInput: {
    width: 45,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  timerText: {
    color: "#999",
    fontSize: 14,
  },
  resendText: {
    color: "#6b4ce6",
    fontSize: 14,
    fontWeight: "500",
  },
  resendButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#6b4ce6",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  resendButtonText: {
    color: "#6b4ce6",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButton: {
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
  },
  helpText: {
    color: "#6b4ce6",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ForgotPasswordScreen;