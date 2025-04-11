import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  Image,
  RefreshControl,
  Platform
} from "react-native";




import { LinearGradient } from "expo-linear-gradient";
import AppLayout from "../components/AppLayout";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { fetchTeacherDashboardData } from "../services/teacherDashboardService";
import { toast } from "sonner-native";

const { width } = Dimensions.get("window");

const TeacherDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);  // Function to load the dashboard data
  const loadData = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      const data = await fetchTeacherDashboardData(forceRefresh);
      setDashboardData(data);
    } catch (error: any) {
      toast.error(`Failed to load dashboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    loadData();
  }, []);  // Removed polling interval for caching based on a 24-hour duration.  
  return (
    <AppLayout isTeacher={true}>      
    <ScrollView 
    style={styles.container} 
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl 
        refreshing={loading}
        onRefresh={() => loadData(true)}
        colors={['#1e3c72']}
        tintColor="#1e3c72"
        title={`Refreshing...`}
        titleColor="#1e3c72"
      />
    }
>
        <LinearGradient
          colors={["#1e3c72", "#2a5298"]}
          style={styles.header}
        >
          <View style={styles.headerInner}>
            <View style={styles.profileSection}>
              <Image
                source={{ uri: "https://api.a0.dev/assets/image?text=teacher%20profile%20icon%20professional&aspect=1:1&seed=teacherProfile" }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.teacherName}>{user?.name || "Teacher"}</Text>
                <View style={styles.departmentBadge}>
                  <Ionicons name="school-outline" size={14} color="white" />
                  <Text style={styles.departmentText}>{user?.department || "Science Department"}</Text>
                </View>
              </View>
            </View>
            {!loading && dashboardData && dashboardData.metrics && (
              <View style={styles.metricsContainer}>
                <View style={styles.metricCard}>
                  <View style={styles.metricIconContainer}>
                    <Ionicons name="people" size={16} color="white" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{dashboardData.metrics.classes}</Text>
                    <Text style={styles.metricTitle}>My Classes</Text>
                  </View>
                </View>
                <View style={styles.metricCard}>
                  <View style={styles.metricIconContainer}>
                    <Ionicons name="school" size={16} color="white" />
                  </View>
                  <View>
                    <Text style={styles.metricValue}>{dashboardData.metrics.students}</Text>
                    <Text style={styles.metricTitle}>Students</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3c72" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          dashboardData &&
          dashboardData.classes && (
            <View style={styles.classesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Classes</Text>
                <TouchableOpacity onPress={() => navigation.navigate("TeacherAllClasses")}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              {dashboardData.classes.map(cls => (               
                 <TouchableOpacity 
                  key={cls.id} 
                  style={styles.classCard} 
                  onPress={() => navigation.navigate("TeacherClass", { classInfo: cls })}
                >
                  <View style={styles.cardTopSection}>
                    <View style={styles.classIconContainer}>
                      <Ionicons 
                        name={cls.subject.toLowerCase().includes('math') ? 'calculator' :
                              cls.subject.toLowerCase().includes('science') ? 'flask' :
                              cls.subject.toLowerCase().includes('english') ? 'book' : 'school'} 
                        size={24} 
                        color="#1e3c72" 
                      />
                    </View>
                    <View style={styles.classMainInfo}>
                      <View style={styles.classNameRow}>
                        <Text style={styles.classLabel}>Class</Text>
                        <Text style={styles.className}>{cls.name}</Text>
                      </View>
                      <View style={styles.classMetaContainer}>
                        <View style={styles.classMetaBadge}>
                          <Ionicons name="people" size={12} color="#1e3c72" />
                          <Text style={styles.classMetaText}>Section {cls.sections[0]}</Text>
                        </View>
                        <View style={styles.classMetaBadge}>
                          <Ionicons name="book" size={12} color="#1e3c72" />
                          <Text style={styles.classMetaText}>{cls.subject}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.studentsContainer}>
                      <Text style={styles.studentsCount}>{cls.students}</Text>
                      <Text style={styles.studentsLabel}>Students</Text>
                    </View>
                  </View>
                  
                  <View style={styles.cardBottomSection}>
                    <View style={styles.scheduleRow}>
                      <Ionicons name="time" size={14} color="#1e3c72" />
                      <Text style={styles.classSchedule}>{cls.schedule}</Text>
                    </View>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View Class</Text>
                      <Ionicons name="chevron-forward" size={16} color="#1e3c72" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 22,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  headerInner: { width: "100%" },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.8)",
    marginRight: 14,
  },
  profileInfo: { justifyContent: "center" },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "500",
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  departmentBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  departmentText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  metricsContainer: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-around",
  },
  metricCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#fff",
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  metricTitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "400",
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#1e3c72",
    fontSize: 16,
    fontWeight: "500",
  },
  classesSection: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  viewAllText: {
    fontSize: 12,
    color: "#1e3c72",
    fontWeight: "500",
  },  classCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTopSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  classIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  classMainInfo: {
    flex: 1,
    marginRight: 10,
  },
  classNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  classLabel: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  classMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  classMetaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  classMetaText: {
    fontSize: 12,
    color: "#1e3c72",
    marginLeft: 4,
    fontWeight: "500",
  },
  studentsContainer: {
    alignItems: "center",
    backgroundColor: "#e8f0fe",
    padding: 8,
    borderRadius: 10,
    minWidth: 70,
  },
  studentsCount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e3c72",
  },
  studentsLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  cardBottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  classSchedule: {
    fontSize: 13,
    color: "#1e3c72",
    marginLeft: 6,
    fontWeight: "500",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 12,
    color: "#1e3c72",
    fontWeight: "500",
    marginRight: 4,
  },
});
export default TeacherDashboardScreen;