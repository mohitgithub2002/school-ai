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
import { toast } from "sonner-native";
import { fetchTeacherProfile } from "../services/TeacherProfileService";

const { width } = Dimensions.get("window");

const TeacherProfileScreen = ({ navigation }) => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Teacher stats
  const [teacherStats, setTeacherStats] = useState({
    classes: 6,
    students: 182,
    experience: 8, // years
    rating: 4.8
  });  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const result = await fetchTeacherProfile(forceRefresh);
      
      if (result.success) {
        setUserData(result.profile);
        
        if (result.fromCache) {
          console.log("Using cached profile data");
        } else if (forceRefresh) {
          toast.success("Profile refreshed successfully");
        }
      } else {
        toast.error(`${result.message}`);
      }
    } catch (error) {
      console.error("Profile load error:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

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
  };  if (isLoading) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3c72" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </AppLayout>
    );
  }  return (
    <AppLayout isTeacher={true}>
      {userData ? (
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadProfile(true);
                setRefreshing(false);
              }}
              colors={['#1e3c72']}
              tintColor="#1e3c72"
              title={`Refreshing...`}
              titleColor="#1e3c72"
            />
          }
        >
          <LinearGradient
            colors={["#1e3c72", "#2a5298"]}
            style={styles.profileHeader}
          >
            <View style={styles.profileHeaderContent}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: "https://api.a0.dev/assets/image?text=teacher%20profile%20icon%20professional&aspect=1:1&seed=teacher123" }}
                  style={styles.profileImage}
                />
                <TouchableOpacity style={styles.editProfileButton}>
                  <MaterialIcons name="edit" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileName}>{userData.name}</Text>
              <View style={styles.profileBadge}>
                <MaterialIcons name="school" size={14} color="white" />
                <Text style={styles.profileBadgeText}>
                  {userData.designation}
                </Text>
              </View>
            </View>
            {/* 
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{teacherStats.classes}</Text>
                <Text style={styles.statLabel}>Classes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{teacherStats.students}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{teacherStats.experience}yr</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{teacherStats.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
             */}
          </LinearGradient>
         

          {/* Profile Sections */}
          <View style={styles.sectionContainer}>
            {/* Professional Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="work" size={22} color="#1e3c72" />
                <Text style={styles.sectionTitle}>Professional Information</Text>
              </View>              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Teacher ID</Text>
                  <Text style={styles.infoValue}>{userData.id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userData.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mobile</Text>
                  <Text style={styles.infoValue}>{userData.mobile}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Designation</Text>
                  <Text style={styles.infoValue}>{userData.designation}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{userData.address}</Text>
                </View>
              </View>
            </View>          
            {/*
         
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="class" size={22} color="#1e3c72" />
              <Text style={styles.sectionTitle}>Classes & Subjects</Text>
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Classes</Text>
                <View style={styles.tagsContainer}>
                  {(userData.classes || []).map((cls, index) => (
                    <View key={index} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{cls}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Subjects</Text>
                <View style={styles.tagsContainer}>
                  {(userData.subjects || []).map((subject, index) => (
                    <View key={index} style={[styles.tagBadge, styles.subjectBadge]}>
                      <Text style={[styles.tagText, styles.subjectText]}>{subject}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
          */}          {/*
         
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="contact-phone" size={22} color="#1e3c72" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <View style={styles.infoWithIcon}>
                  <Text style={styles.infoValue}>{userData.email}</Text>
                  <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="mail" size={18} color="#1e3c72" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <View style={styles.infoWithIcon}>
                  <Text style={styles.infoValue}>{userData.phone}</Text>
                  <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="call" size={18} color="#1e3c72" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{userData.address}</Text>
              </View>
            </View>
          </View>
          */}

            {/* App Settings */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="settings" size={22} color="#1e3c72" />
                <Text style={styles.sectionTitle}>App Settings</Text>
              </View>
              
              <View style={styles.settingsCard}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="notifications" size={20} color="#666" />
                    <Text style={styles.settingText}>Notifications</Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: "#d1d1d1", true: "#c2d1e8" }}
                    thumbColor={notificationsEnabled ? "#1e3c72" : "#f4f3f4"}
                  />
                </View>
              </View>
            </View>

            {/* Actions */}            <View style={styles.actionsContainer}>
              {/* <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="lock-closed" size={20} color="#1e3c72" />
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
            </View>

            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>Version 1.0.3</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3c72" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      )}
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#1e3c72",
    fontSize: 16,
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
    backgroundColor: "#1e3c72",
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
    fontSize: 20,
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
  tagsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 5,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#e6f0ff",
    borderRadius: 12,
    marginLeft: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: "#1e3c72",
    fontWeight: "500",
  },
  subjectBadge: {
    backgroundColor: "#e1f5fe",
  },
  subjectText: {
    color: "#0277bd",
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
    color: "#1e3c72",
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
});

export default TeacherProfileScreen;