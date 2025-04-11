import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLayout from "../components/AppLayout";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { fetchDashboardData } from "../services/dashboardService";
import { toast } from "sonner-native";

const { width } = Dimensions.get("window");

const DashboardScreen = ({ navigation }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const DASHBOARD_CACHE_KEY = `dashboardCache_${user?.rollNo || user?.id || "default"}`;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const fetchDashboard = async (forceRefresh = false) => {
    if (!user) return; // Don't fetch if user is not available
    
    try {
      setRefreshing(true);
      setIsDataLoading(true);
      const now = Date.now();
      if (!forceRefresh) {
        const cacheString = await AsyncStorage.getItem(DASHBOARD_CACHE_KEY);
        if (cacheString) {
          const cached = JSON.parse(cacheString);
          if (now - cached.timestamp < ONE_DAY_MS) {
            setAnnouncements(cached.data.announcements);
            setDiaryEntries(cached.data.diaryEntries);
            setEvents(cached.data.events);
            setAttendance(cached.data.attendance);
            setRefreshing(false);
            setIsDataLoading(false);
            return;
          }
        }
      }

      const data = await fetchDashboardData();
      setAnnouncements(data.announcements);
      setDiaryEntries(data.diaryEntries);
      setEvents(data.events);
      setAttendance(data.attendance);

      const cacheValue = {
        timestamp: now,
        data
      };
      await AsyncStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(cacheValue));
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setRefreshing(false);
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user]); // Only fetch when user changes

  if (authLoading || isDataLoading) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b4ce6" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No user data available</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.replace("SelectStudentProfile")}
          >
            <Text style={styles.retryButtonText}>Select Profile</Text>
          </TouchableOpacity>
        </View>
      </AppLayout>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff4757";
      case "medium":
        return "#ffa502";
      case "low":
        return "#2ed573";
      default:
        return "#999";
    }
  };

  const formatGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  };  return (
    <AppLayout>
      <View style={styles.container}>      {/* Header */}      <LinearGradient
        colors={["#6b4ce6", "#9d85f2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >  <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View style={styles.profileContainer}>
              <Image
                source={{ uri: "https://api.a0.dev/assets/image?text=abstract%20student%20avatar%20icon%20generic%20profile&aspect=1:1&seed=456" }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.greeting}>{formatGreeting()},</Text>
                <Text style={styles.studentName}>{user?.name || "Student"}</Text>
                <TouchableOpacity 
                  style={styles.switchProfileButton}                  onPress={() => navigation.navigate("SelectStudentProfile")}
                >
                  <Text style={styles.switchProfileText}>
                    <Ionicons name="sync" size={10} color="rgba(255, 255, 255, 0.9)" /> Switch Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>            <TouchableOpacity style={styles.notificationButton}
              onPress={() => navigation.navigate("Notifications")}
              activeOpacity={0.8}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications" size={22} color="white" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.studentDetails}>
            <View style={styles.detailContainer}>
              <Ionicons name="school-outline" size={14} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.detailText}>
                Class: {user?.class || "10A"} | Roll No: {user?.rollNo || "12345"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              await fetchDashboard(true);
            }}
            colors={['#6b4ce6']}
            tintColor="#6b4ce6"
            title={`Refreshing...`}
            titleColor="#6b4ce6"
          />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: "#e1f5fe" }]}>
              <Ionicons name="calendar" size={22} color="#039be5" />
            </View>            <Text style={styles.actionText}>Exam Timetable</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: "#f9fbe7" }]}>
              <Ionicons name="document-text" size={22} color="#afb42b" />
            </View>            <Text style={styles.actionText}>Homework</Text>
          </TouchableOpacity>          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: "#ede7f6" }]}>
              <Ionicons name="checkmark-circle" size={22} color="#7e57c2" />
            </View>
            <Text style={styles.actionText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: "#e0f2f1" }]}>
              <Ionicons name="cash" size={22} color="#26a69a" />
            </View>
            <Text style={styles.actionText}>Fees</Text>
          </TouchableOpacity>
        </View>

        {/* Announcements Section */}
        <View style={styles.sectionContainer}>          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="megaphone" size={18} color="#333" /> Announcements
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Announcements")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {announcements.map((announcement) => (
            <TouchableOpacity key={announcement.announcement_id} style={styles.announcementCard}>
              <View 
                style={[
                  styles.priorityIndicator, 
                  { backgroundColor: getPriorityColor(announcement.priority) }
                ]} 
              />
              <View style={styles.announcementContent}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementDescription}>{announcement.description}</Text>
                <View style={styles.announcementFooter}>
                  <Text style={styles.announcementDate}>
                    <Ionicons name="time-outline" size={12} color="#666" /> {announcement.date}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Diary Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="book" size={18} color="#333" /> Recent Diary
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {diaryEntries.map((entry) => (
            <TouchableOpacity 
              key={entry.entry_id} 
              style={[styles.diaryCard, { borderLeftColor: "#6b4ce6" }]}
            >
              <View style={styles.diaryHeader}>              <View style={styles.subjectContainer}>                <Ionicons 
                  name={
                    entry.subject.toLowerCase() === 'mathematics' ? 'calculator' :
                    entry.subject.toLowerCase() === 'science' ? 'flask' :
                    entry.subject.toLowerCase() === 'english' ? 'text' :
                    entry.subject.toLowerCase() === 'hindi' ? 'language' :
                    entry.subject.toLowerCase() === 'social studies' ? 'earth' :
                    entry.subject.toLowerCase() === 'physical education' ? 'fitness' :
                    entry.subject.toLowerCase() === 'computer science' ? 'desktop' :
                    'book' // default icon for other subjects
                  } 
                  size={20} 
                  color={
                    entry.subject.toLowerCase() === 'mathematics' ? '#4e7eff' :
                    entry.subject.toLowerCase() === 'science' ? '#2ed573' :
                    entry.subject.toLowerCase() === 'english' ? '#ff7eb3' :
                    entry.subject.toLowerCase() === 'hindi' ? '#ffa502' :
                    entry.subject.toLowerCase() === 'social studies' ? '#7158e2' :
                    entry.subject.toLowerCase() === 'physical education' ? '#ff4757' :
                    entry.subject.toLowerCase() === 'computer science' ? '#3498db' :
                    '#6b4ce6' // default color for other subjects
                  }
                />
                <Text style={styles.subjectText}>{entry.subject}</Text>
              </View>
              </View>
              <Text style={styles.diaryContent}>{entry.content}</Text>
              <View style={styles.diaryFooter}>
                <View style={styles.teacherInfo}>
                  <Ionicons name="person" size={12} color="#666" />
                  <Text style={styles.teacherName}>{entry.teachers.name}</Text>
                </View>
                <View style={styles.dueDateContainer}>
                  <Ionicons name="time" size={12} color="#ff4757" />
                  <Text style={styles.dueDate}>{new Date(entry.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>        {/* Attendance Summary */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="checkmark-circle" size={18} color="#333" /> Attendance
            </Text>
          </View>          <View style={styles.attendanceCard}>              
            <View style={styles.attendanceStats}>
                {attendance && (
                  <>
                    <View style={styles.attendanceItem}>
                      <View style={[styles.attendanceCircle, { borderColor: "#2ed573" }]}>
                        <Text style={[styles.attendancePercentage, { color: "#2ed573" }]}>{attendance.present}</Text>
                      </View>
                      <Text style={styles.attendanceLabel}>Present</Text>
                    </View>
                    
                    <View style={styles.attendanceItem}>
                      <View style={[styles.attendanceCircle, { borderColor: "#ff4757" }]}>
                        <Text style={[styles.attendancePercentage, { color: "#ff4757" }]}>{attendance.absent}</Text>
                      </View>
                      <Text style={styles.attendanceLabel}>Absent</Text>
                    </View>
                    
                    <View style={styles.attendanceItem}>
                      <View style={[styles.attendanceCircle, { borderColor: "#ffa502" }]}>
                        <Text style={[styles.attendancePercentage, { color: "#ffa502" }]}>{attendance.leave}</Text>
                      </View>
                      <Text style={styles.attendanceLabel}>Leave</Text>
                    </View>
                  </>
                )}
              </View>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={[styles.sectionContainer, { marginBottom: 100 }]}>          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="calendar" size={18} color="#333" /> Upcoming Events
            </Text>
          </View>
          {events.length > 0 ? (
            <View style={styles.calendarCard}>
              {events.map(event => {
                const eventDate = new Date(event.date);
                return (
                  <View key={event.event_id} style={styles.eventItem}>
                    <View style={styles.eventDate}>
                      <Text style={styles.eventDay}>{eventDate.getDate()}</Text>
                      <Text style={styles.eventMonth}>{eventDate.toLocaleString('default', { month: 'short' })}</Text>
                    </View>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="location" size={12} color="#666" />
                        <Text style={styles.eventLocation}> {event.location}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="time" size={12} color="#666" />
                        <Text style={styles.eventTime}> {event.time}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No upcoming events</Text>
            </View>
          )}
        </View>
      </ScrollView>      {/* Removed bottom navigation bar as it's now in the AppLayout */}      </View>
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
  },  header: {
    padding: 20,
    paddingTop: 22,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  headerContainer: {
    width: '100%',
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  profileInfo: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "500",
    marginBottom: 2,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  studentDetails: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "flex-start",
    marginLeft: 2,
  },
  detailContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "600",
    marginLeft: 8,
  },
  notificationButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  notificationIconContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ff4757",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },
  actionItem: {
    alignItems: "center",
    width: width / 4 - 15,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  viewAllText: {
    fontSize: 12,
    color: "#6b4ce6",
    fontWeight: "500",
  },
  announcementCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden",
  },
  priorityIndicator: {
    width: 4,
    height: "100%",
  },
  announcementContent: {
    padding: 15,
    flex: 1,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  announcementDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  announcementFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  announcementDate: {
    fontSize: 12,
    color: "#666",
  },
  diaryCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  diaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subjectContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  diaryContent: {
    fontSize: 13,
    color: "#333",
    marginBottom: 10,
  },
  diaryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teacherInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  teacherName: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDate: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  attendanceCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  attendanceStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  attendanceItem: {
    alignItems: "center",
  },
  attendanceCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  attendancePercentage: {
    fontSize: 16,
    fontWeight: "bold",
  },
  attendanceLabel: {
    fontSize: 12,
    color: "#666",
  },
  viewDetailsButton: {
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  viewDetailsText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  calendarCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  eventItem: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  eventItem: {
    flexDirection: "row",
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  eventDate: {
    width: 50,
    height: 60,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  eventDay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  eventMonth: {
    fontSize: 12,
    color: "#666",
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
  },
  eventTime: {
    fontSize: 12,
    color: "#666",
  },  // Bottom navigation styles removed as they're now in BottomNavBar component
  switchProfileButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  switchProfileText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 10,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#6b4ce6",
    padding: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 10,
  },
});

export default DashboardScreen;