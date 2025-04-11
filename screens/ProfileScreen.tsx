import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from "sonner-native";

const { width } = Dimensions.get("window");

const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 day in ms

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const CACHE_KEY = `profileCache_${user?.rollNo || user?.id || "default"}`;  const handleSwitchProfile = () => {
    navigation.navigate("SelectStudentProfile");
  };
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userData, setUserData] = useState(null);  // Academic stats
  const [academicStats, setAcademicStats] = useState({
    attendance: 92,
    performance: 87,
    homeworkCompletion: 95,    examResults: 88,
    switchProfileButton: {
    backgroundColor: "#f0eafa",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginVertical: 15,
  },
  switchProfileText: {
    color: "#6b4ce6",
    fontSize: 16,
    fontWeight: "600",
  },
});  const loadProfile = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      if (!forceRefresh) {
        const cacheString = await AsyncStorage.getItem(CACHE_KEY);
        if (cacheString) {
          const cached = JSON.parse(cacheString);
          setUserData(cached.data);
          setIsLoading(false);
          return;
        }
      }
      const { fetchUserProfile } = await import("../services/ProfileService");
      const result = await fetchUserProfile();
      if (result.success) {
        // Map the API response to our local profile data
        const { personal, contact, academic } = result.profile;
        const data = {
          name: personal.name,
          rollNumber: academic.rollNumber.toString(),
          class: academic.class,
          section: academic.section,
          admissionNumber: personal.nicId?.toString()||"-",
          gender: personal.gender,
          dateOfBirth: personal.dateOfBirth,
          medium: academic.medium,
          // bloodGroup is not provided by API; you may remove it or replace as needed
          parentName: `${contact.fatherName} & ${contact.motherName}`,
          contactNumber: contact.mobile,
          email: contact.email,
          address: contact.address,
          joinedOn: personal.admissionDate? personal.admissionDate:"-"
        };
        setUserData(data);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      } else {
        toast.error(`${result.message}`);
      }
    } catch (error) {
      console.error("Profile load error:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await logout();
              toast.success("Logged out successfully");
              navigation.navigate("Login");
            } catch (error) {
              console.error("Logout error:", error);
              toast.error("Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (isLoading || authLoading) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b4ce6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </AppLayout>
    );
  }  return (
    <AppLayout>
      {userData ? (        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={async () => {
                await loadProfile(true);
              }}
              colors={['#6b4ce6']}
              tintColor="#6b4ce6"
              title={`Refreshing...`}
              titleColor="#6b4ce6"
            />
          }
        >
          <LinearGradient
            colors={["#6b4ce6", "#9d85f2"]}
            style={styles.profileHeader}
          >
            <View style={styles.profileHeaderContent}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: "https://api.a0.dev/assets/image?text=abstract%20student%20avatar%20icon%20generic%20profile&aspect=1:1&seed=456" }}
                  style={styles.profileImage}
                />
                <TouchableOpacity style={styles.editProfileButton}>
                  <MaterialIcons name="edit" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileName}>{userData.name}</Text>
              <View style={styles.profileBadge}>
                <Ionicons name="school" size={14} color="white" />
                <Text style={styles.profileBadgeText}>
                  Class {userData.class} - {userData.section}
                </Text>
              </View>
            </View>          {/*
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{academicStats.attendance}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{academicStats.performance}%</Text>
              <Text style={styles.statLabel}>Performance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{academicStats.examResults}%</Text>
              <Text style={styles.statLabel}>Avg. Score</Text>
            </View>
          </View>
          */}          </LinearGradient>
          <TouchableOpacity style={styles.switchProfileButton} onPress={handleSwitchProfile}>
            <Text style={styles.switchProfileText}>Switch Profile</Text>
          </TouchableOpacity>

        {/* Profile Sections */}
        <View style={styles.sectionContainer}>
          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={22} color="#6b4ce6" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>          <Text style={styles.infoLabel}>Roll No</Text>
          <Text style={styles.infoValue}>{userData.rollNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Admission Number</Text>
                <Text style={styles.infoValue}>{userData.admissionNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{userData.gender}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>{userData.dateOfBirth}</Text>
              </View>                            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Medium</Text>
                <Text style={styles.infoValue}>{userData.medium}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Joined On</Text>
                <Text style={styles.infoValue}>{userData.joinedOn}</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="contact-phone" size={22} color="#6b4ce6" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Parent's Name</Text>
                <Text style={styles.infoValue}>{userData.parentName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Contact Number</Text>
                <View style={styles.infoWithIcon}>
                  <Text style={styles.infoValue}>{userData.contactNumber}</Text>
                  <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="call" size={18} color="#6b4ce6" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <View style={styles.infoWithIcon}>
                  <Text style={styles.infoValue}>{userData.email}</Text>
                  <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="mail" size={18} color="#6b4ce6" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{userData.address}</Text>
              </View>
            </View>
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={22} color="#6b4ce6" />
              <Text style={styles.sectionTitle}>App Settings</Text>
            </View>
            
            <View style={styles.settingsCard}>              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications" size={20} color="#666" />
                  <Text style={styles.settingText}>Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#d1d1d1", true: "#c5b6f2" }}
                  thumbColor={notificationsEnabled ? "#6b4ce6" : "#f4f3f4"}
                />
              </View>
            </View>
          </View>

          {/* Actions */}            <View style={styles.actionsContainer}>
              {/* <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="lock-closed" size={20} color="#6b4ce6" />
                <Text style={styles.actionButtonText}>Change Password</Text>
              </TouchableOpacity> */}
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.dangerButton]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out" size={20} color="#ff4757" />
                <Text style={[styles.actionButtonText, styles.dangerText]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.3</Text>
          </View>
        </View>
      </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b4ce6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      )}
    </AppLayout>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },  loadingText: {
    marginTop: 10,
    color: "#6b4ce6",
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#ff4757",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#6b4ce6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  profileHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeaderContent: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "white",
  },
  editProfileButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6b4ce6",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileBadgeText: {
    color: "white",
    marginLeft: 6,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  statDivider: {
    height: 30,
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  sectionContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "right",
    flex: 1,
  },
  infoWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  iconButton: {
    padding: 5,
    marginLeft: 8,
  },
  settingsCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  actionsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b4ce6",
    marginLeft: 10,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: "#ffebee",
  },
  dangerText: {
    color: "#ff4757",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  versionText: {
    color: "#999",
    fontSize: 14,
  },
  switchProfileButton: {
    backgroundColor: "#f0eafa",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginVertical: 15,
  },
  switchProfileText: {
    color: "#6b4ce6",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;