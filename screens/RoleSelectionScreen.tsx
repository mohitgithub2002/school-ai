import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const RoleSelectionScreen = ({ navigation }) => {
  return (
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
          <Text style={styles.subtitle}>Select your role to continue</Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.roleCard}
            onPress={() => navigation.navigate("StudentLogin")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#6b4ce6" }]}>
              <Ionicons name="school" size={36} color="white" />
            </View>
            <Text style={styles.roleTitle}>Student</Text>
            <Text style={styles.roleDescription}>
              Access your class diary, exam results, and school updates
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward-circle" size={24} color="#6b4ce6" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.roleCard}
            onPress={() => navigation.navigate("TeacherLogin")}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#1e3c72" }]}>
              <Ionicons name="person" size={36} color="white" />
            </View>
            <Text style={styles.roleTitle}>Teacher</Text>
            <Text style={styles.roleDescription}>
              Manage classes, attendance, and student diary notes
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward-circle" size={24} color="#1e3c72" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.schoolInfo}>
          <Text style={styles.schoolInfoText}>Vivekananda Public School</Text>
          <Text style={styles.versionText}>App Version 1.0.3</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
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
    color: "rgba(255, 255, 255, 0.9)",
  },
  cardsContainer: {
    width: width * 0.9,
    alignItems: "center",
  },
  roleCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 10,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 15,
    lineHeight: 20,
  },
  arrowContainer: {
    alignItems: "flex-end",
  },
  schoolInfo: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
  },
  schoolInfoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 5,
  },
  versionText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  }
});

export default RoleSelectionScreen;