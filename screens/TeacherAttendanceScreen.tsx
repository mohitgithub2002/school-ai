import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Modal,
  ScrollView,
  Animated,
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AppLayout from "../components/AppLayout";
import { toast } from "sonner-native";

const TeacherAttendanceScreen = ({ navigation, route }) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [datePickerAnimation] = useState(new Animated.Value(0));
  
  // Class info from route params or default values
  const classInfo = route.params?.classInfo || {
    id: 1,
    name: "10A - Mathematics",
    students: 30,
  };

  useEffect(() => {
    fetchStudents();
  }, []);  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Retrieve classroomId from route parameters (passed via navigation)
      const classroomId = route.params?.classInfo?.classId || route.params?.classInfo?.id;
      if (!classroomId) {
        toast.error(`Class ID is missing. Cannot fetch students.`);
        setIsLoading(false);
        return;
      }
      
      const token = await (await import("../services/authService")).getToken();
      const page = 1;
      const limit = 50;
      
      const response = await fetch(`https://vps-vert.vercel.app/api/teacher/studentslist?classroomId=${classroomId}&page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        const studentsData = data.data.students.map(student => ({
          id: student.studentId,
          name: student.name,
          rollNumber: student.rollNo.toString(),
          section: student.section,
          classId: student.classId,
          enrollmentId: student.enrollmentId,
          status: "unmarked",
          profileImage: `https://api.a0.dev/assets/image?text=${encodeURIComponent(student.name)}&aspect=1:1`
        }));
        setStudents(studentsData);
      } else {
        toast.error(data.message || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    hideDatePicker();
  };  const showDatePicker = () => {
    setIsDatePickerVisible(true);
    Animated.spring(datePickerAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };  const hideDatePicker = () => {
    Animated.timing(datePickerAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setIsDatePickerVisible(false));
  };

  const updateStudentStatus = (id, newStatus) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, status: newStatus } : student
    ));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "#2ed573";
      case "absent":
        return "#ff4757";
      case "leave":
        return "#ffa502";
      default:
        return "#dfe4ea";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return "checkmark-circle";
      case "absent":
        return "close-circle";
      case "leave":
        return "time";
      default:
        return "ellipse-outline";
    }
  };  const handleSubmitAttendance = async () => {
    // Ensure all students have a marked attendance status
    if (students.some(s => s.status === "unmarked")) {
      toast.error(`Please mark attendance for all students`);
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Retrieve classroomId from route params
      const classroomId = route.params?.classInfo?.classId || route.params?.classInfo?.id;
      if (!classroomId) {
        toast.error(`Class ID is missing. Cannot submit attendance.`);
        setSubmitting(false);
        return;
      }
      
      // Format today's date in YYYY-MM-DD
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;
      
      // Map each student's enrollmentId and status (capitalize first letter)
      const records = students.map(s => {
        const status = s.status.charAt(0).toUpperCase() + s.status.slice(1); // "Present"/"Absent"/"Leave"
        return {
          enrollmentId: s.enrollmentId,
          status,
          remark: ""  // Optional: Add remark if needed
        };
      });
      
      const token = await (await import("../services/authService")).getToken();
      
      const response = await fetch(`https://vps-vert.vercel.app/api/teacher/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          classroomId,
          date: formattedDate,
          records
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(data.message || "Attendance marked successfully");
        navigation.goBack();
      } else {
        toast.error(data.message || "Failed to submit attendance");
      }
    } catch (error) {
      console.error("Attendance submission error:", error);
      toast.error(`An error occurred while submitting attendance`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStudentItem = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>        <View style={styles.studentAvatar}>
          <Text style={styles.avatarText}>{String(item.id).padStart(2, '0')}</Text>
        </View>
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.rollNumber}>Roll No: {item.rollNumber}</Text>
        </View>
      </View>
      
      <View style={styles.attendanceControls}>
        {["present", "absent", "leave"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              item.status === status && styles.activeStatusButton,
              { backgroundColor: item.status === status ? getStatusColor(status) : "#f8f9fa" }
            ]}
            onPress={() => updateStudentStatus(item.id, status)}
          >
            <Ionicons
              name={getStatusIcon(status)}
              size={18}
              color={item.status === status ? "white" : "#666"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const stats = {
    present: students.filter(s => s.status === "present").length,
    absent: students.filter(s => s.status === "absent").length,
    leave: students.filter(s => s.status === "leave").length,
    unmarked: students.filter(s => s.status === "unmarked").length,
  };

  return (
    <AppLayout isTeacher={true}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#1e3c72", "#2a5298"]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Take Attendance</Text>
            <View style={styles.headerRight} />
          </View>
          
          <View style={styles.classInfo}>
            <Text style={styles.className}>{classInfo.name}</Text>
            <TouchableOpacity 
              style={styles.dateSelector}
              onPress={showDatePicker}
            >
              <Ionicons name="calendar" size={20} color="white" />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              <Ionicons name="chevron-down" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: "#e8f5e9" }]}>
            <Text style={[styles.statValue, { color: "#2ed573" }]}>{stats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: "#ffebee" }]}>
            <Text style={[styles.statValue, { color: "#ff4757" }]}>{stats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: "#fff3e0" }]}>
            <Text style={[styles.statValue, { color: "#ffa502" }]}>{stats.leave}</Text>
            <Text style={styles.statLabel}>Leave</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: "#f5f6fa" }]}>
            <Text style={[styles.statValue, { color: "#666" }]}>{stats.unmarked}</Text>
            <Text style={styles.statLabel}>Unmarked</Text>
          </View>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3c72" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            renderItem={renderStudentItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submittingButton
          ]}
          onPress={handleSubmitAttendance}
          disabled={submitting || stats.unmarked > 0}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Attendance</Text>
              <Ionicons name="checkmark-circle" size={20} color="white" style={styles.submitIcon} />
            </>
          )}
        </TouchableOpacity>

        <Modal          visible={isDatePickerVisible}
          transparent
          animationType="none"
          onRequestClose={hideDatePicker}
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.datePickerContainer,
                {
                  transform: [{
                    translateY: datePickerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0]
                    })
                  }]
                }
              ]}
            >
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={hideDatePicker}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.datePickerContent}>
                {[...Array(7)].map((_, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() - index);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dateOption,
                        selectedDate.toDateString() === date.toDateString() && styles.selectedDateOption
                      ]}
                      onPress={() => handleDateChange(date)}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        selectedDate.toDateString() === date.toDateString() && styles.selectedDateOptionText
                      ]}>
                        {date.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  classInfo: {
    marginTop: 5,
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  dateText: {
    color: "white",
    marginHorizontal: 8,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
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
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  studentCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  rollNumber: {
    fontSize: 13,
    color: "#666",
  },
  attendanceControls: {
    flexDirection: "row",
    gap: 8,
  },
  statusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  activeStatusButton: {
    transform: [{ scale: 1.1 }],
  },
  submitButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#1e3c72",
    borderRadius: 15,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1e3c72",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  submittingButton: {
    backgroundColor: "#45578f",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  submitIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  datePickerContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  datePickerContent: {
    marginBottom: 20,
  },
  dateOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedDateOption: {
    backgroundColor: "#f0f7ff",
  },
  dateOptionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedDateOptionText: {
    color: "#1e3c72",
    fontWeight: "600",
  },
});

export default TeacherAttendanceScreen;