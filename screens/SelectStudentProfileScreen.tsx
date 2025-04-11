import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner-native";

const SelectStudentProfileScreen = ({ navigation, route }) => {  const { user, availableProfiles, selectProfile, logout } = useAuth();
  const [isSelecting, setIsSelecting] = useState(false);
  let { profiles } = route.params || {};
  // Fallback to availableProfiles
  if (!profiles) {
    profiles = availableProfiles;
  }

  const handleProfileSelect = async (profile) => {
    if (isSelecting) return; // Prevent multiple selections
    
    try {
      setIsSelecting(true);
      // Call the context function to set this as the active profile
      const result = await selectProfile(profile);
      if (result.success) {
        toast.success("Profile switched successfully!");
        // Use setTimeout to ensure state updates are complete
        setTimeout(() => {
          navigation.replace("Dashboard");
        }, 100);
      } else {
        toast.error(result.message || "Failed to switch profile.");
      }
    } catch (error) {
      console.error("Profile selection error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSelecting(false);
    }
  };

  const renderItem = ({ item }) => (    <TouchableOpacity style={[styles.profileCard, item.access === "restricted" && styles.disabledProfile]} 
      disabled={item.access === "restricted"}
      onPress={() => {
        if (item.access !== "restricted") {
          handleProfileSelect(item);
        }
      }}
    >
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle" size={40} color="#6b4ce6" />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{item.user.name}</Text>
          <Text style={styles.profileDetails}>Roll No: {item.user.rollNo || item.user.rollNumber}</Text>
          <Text style={styles.profileDetails}>Class: {item.user.class || "-"} | Section: {item.user.section || "-"}</Text>
        </View>
      </View>
      {item.access === "restricted" && item.message ? (
        <Text style={styles.restrictedMessage}>{item.message}</Text>
      ) : (
        <Text style={styles.accessText}>Access: {item.access}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <AppLayout hideBottomNav={true}>
      <View style={styles.container}>
        <Text style={styles.title}>Select a Profile</Text>
                <FlatList
          data={profiles || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No profiles available.</Text>
              <Text style={styles.emptySubText}>Please contact school administration.</Text>
            </View>
          }
        />        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={async () => {
              try {
                await logout();
                toast.success("Logged out successfully");
                navigation.navigate("Login");
              } catch (error) {
                console.error("Logout error:", error);
                toast.error("Failed to logout. Please try again.");
              }
            }}
          >
            <Ionicons name="log-out" size={20} color="#ff4757" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppLayout>
  );
};

export default SelectStudentProfileScreen;    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
      },
      title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
      },
      listContainer: {
        paddingBottom: 20,
      },
      profileCard: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      },
      disabledProfile: {
        opacity: 0.5,
      },
      profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
      },
      profileInfo: {
        marginLeft: 15,
      },
      profileName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
      },
      profileDetails: {
        fontSize: 14,
        color: "#666",
      },
      restrictedMessage: {
        marginTop: 10,
        fontSize: 14,
        color: "#ff4757",
      },
      accessText: {
        marginTop: 10,
        fontSize: 14,
        color: "#2ed573",
      },
      emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      },
      emptyText: {
        fontSize: 18,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
      },
      backButtonStyle: {
        backgroundColor: "#6b4ce6",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
      },  backButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  logoutButtonText: {
    color: '#ff4757',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});