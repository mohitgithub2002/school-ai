import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Modal, KeyboardAvoidingView, Platform, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AppLayout from "../components/AppLayout";
import { toast } from "sonner-native";

const TeacherClassScreen = ({ navigation, route }) => {  const [students, setStudents] = useState([]);    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedSection, setSelectedSection] = useState("All");
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [noteSubject, setNoteSubject] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteDate, setNoteDate] = useState(new Date());
  
  // Class info from route params or default values
  const classInfo = route.params?.classInfo || {
    id: 1,
    name: "10A - Mathematics",
    students: 30,
    sections: ["A", "B", "C"]
  };

  useEffect(() => {
    fetchStudents();
  }, []);  const fetchStudents = async (forceRefresh = false) => {
    // When forcing refresh via pull-to-refresh, set refreshing separately
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      // Get the classroomId from route params
      const classroomId = classInfo?.classId || classInfo?.id;
      
      if (!classroomId) {
        toast.error(`Class ID is missing. Cannot fetch students.`);
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Setup cache key and TTL (24 hours)
      const CACHE_KEY = `teacherClassCache_${classroomId}`;
      const TTL = 24 * 60 * 60 * 1000;
      
      if (!forceRefresh) {
        const cachedDataString = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedDataString) {
          const cachedData = JSON.parse(cachedDataString);
          if (Date.now() - cachedData.timestamp < TTL) {
            setStudents(cachedData.students);
            setIsLoading(false);
            return;
          }
        }
      }
      
      // Fetch fresh data from API
      const authService = await import("../services/authService");
      const token = await authService.getToken();
      
      const response = await fetch(`https://vps-vert.vercel.app/api/teacher/studentslist?classroomId=${classroomId}`, {
        method: "GET",
        headers: {
          "Content-Type": `application/json`,
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const formattedStudents = data.data.students.map(student => ({
          id: student.studentId,
          name: student.name,
          rollNumber: student.rollNo.toString(),
          section: student.section,
          classId: student.classId,
          enrollmentId: student.enrollmentId,
          attendance: 90,
          performance: 85
        }));
        setStudents(formattedStudents);
        const cacheValue = { timestamp: Date.now(), students: formattedStudents };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheValue));
      } else {
        toast.error(data.message || `Failed to fetch students`);
        console.error("Failed to fetch students:", data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error(`An error occurred while fetching students`);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchText === "" || 
      student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.rollNumber.includes(searchText);
    
    const matchesSection = selectedSection === "All" || student.section === selectedSection;
    
    return matchesSearch && matchesSection;
  });  const getSectionButtons = () => {
    // Ensure we have sections array, default to empty if undefined
    const sections = classInfo?.sections || [];
    return ["All", ...sections].map(section => (
      <TouchableOpacity
        key={section}
        style={[
          styles.sectionButton,
          selectedSection === section && styles.selectedSectionButton
        ]}
        onPress={() => setSelectedSection(section)}
      >
        <Text 
          style={[
            styles.sectionButtonText,
            selectedSection === section && styles.selectedSectionButtonText
          ]}
        >
          {section}
        </Text>
      </TouchableOpacity>
    ));
  };  const handleAddNote = (student) => {
    setSelectedStudent(student);
    setNoteSubject("Mathematics"); // Default subject
    setNoteContent(""); // Reset content
    setNoteDate(new Date()); // Today's date
    setIsNoteModalVisible(true);
  };  const saveNote = async () => {
    if (!noteSubject) {
      toast.error(`Please select a subject`);
      return;
    }
  
    if (!noteContent.trim()) {
      toast.error(`Please enter note content`);
      return;
    }
  
    try {
      const authService = await import("../services/authService");
      const token = await authService.getToken();
  
      // Ensure we have necessary IDs
      const enrollmentId = selectedStudent?.enrollmentId;
      const classroomId = classInfo?.classId || classInfo?.id;
  
      if (!enrollmentId || !classroomId) {
        toast.error(`Missing student enrollment ID or class ID`);
        return;
      }
  
      const requestBody = {
        enrollmentId: enrollmentId,
        classroomId: classroomId,
        subject: noteSubject,
        content: noteContent,
        entryType: "Personal"
      };
  
      const response = await fetch(`https://vps-vert.vercel.app/api/teacher/diary/addnote`, {
        method: "POST",
        headers: {
          "Content-Type": `application/json`,
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        toast.success(`Note added for ${selectedStudent?.name}`);
        setIsNoteModalVisible(false);
        // Optionally, refresh any local state or notes list if available.
      } else {
        toast.error(data.message || `Failed to add note`);
      }
    } catch (error) {
      console.error(`Save diary entry error:`, error);
      toast.error(`Error adding note`);
    }
  };  
  const renderStudentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.studentCard}
      onPress={() => navigation.navigate("TeacherStudentDetails", { studentInfo: item })}
      activeOpacity={0.7}
    >
      <View style={styles.studentMain}>
        <View style={styles.studentAvatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <View style={styles.studentMeta}>
            <Text style={styles.rollNumber}>Roll No: {item.rollNumber}</Text>
            <View style={styles.sectionBadge}>
              <Ionicons name="layers-outline" size={10} color="#1e3c72" />
              <Text style={styles.sectionBadgeText}>{item.section}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAddNote(item);
            }}
          >
            <Ionicons name="create-outline" size={20} color="#1e3c72" />
          </TouchableOpacity>          
          <TouchableOpacity 
            style={[styles.iconButton, styles.viewIconButton]}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("TeacherStudentDetails", { studentInfo: item });
            }}
          >
            <Ionicons name="person-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );  return (
    <AppLayout isTeacher={true} hideBottomNav={true}>
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
            <Text style={styles.headerTitle}>{classInfo.name}</Text>
            <View style={styles.headerRight} />
          </View>
          
          <View style={styles.searchContainer}>            
          <Ionicons name="search" size={16} color="#1e3c72" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or roll number"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#888"
            />
          </View>
        </LinearGradient>
        
        <View style={styles.content}>
          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sectionButtonsContainer}
            >
              {getSectionButtons()}
            </ScrollView>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1e3c72" />
              <Text style={styles.loadingText}>Loading students...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredStudents}
              renderItem={renderStudentItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.listContainer}            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => fetchStudents(true)}
                colors={['#1e3c72']}
                tintColor="#1e3c72"
                title={`Refreshing...`}
                titleColor="#1e3c72"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No students found</Text>
              </View>
            }
            />
          )}
        </View>        <View style={styles.actionButtonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.attendanceButton]}
            onPress={() => navigation.navigate("TeacherAttendance", { classInfo })}
          >
            <Ionicons name="calendar" size={18} color="white" />
            <Text style={styles.actionButtonText}>Take Attendance</Text>
          </TouchableOpacity>          <TouchableOpacity 
            style={[styles.actionButton, styles.notesButton]}
            onPress={() => navigation.navigate("TeacherDiary", { classInfo })}
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text style={styles.actionButtonText}>Add Notes</Text>
          </TouchableOpacity>
        </View>      </View>
      
      {/* Note Modal */}
      <Modal
        visible={isNoteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNoteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Student Note</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsNoteModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Student</Text>
              <View style={styles.inputDisabled}>
                <Text>{selectedStudent?.name}</Text>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <View style={styles.inputDisabled}>
                <Text>{noteDate.toLocaleDateString()}</Text>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subjectSelector}
              >
                {["Mathematics", "Science", "English", "Social Studies", "Physical Education", "Computer Science"].map(subject => (
                  <TouchableOpacity 
                    key={subject}
                    style={[
                      styles.subjectOption,
                      noteSubject === subject && styles.selectedSubjectOption
                    ]}
                    onPress={() => setNoteSubject(subject)}
                  >
                    <Text 
                      style={[
                        styles.subjectOptionText,
                        noteSubject === subject && styles.selectedSubjectOptionText
                      ]}
                    >
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter note content"
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>            </ScrollView>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveNote}
              >
                <Text style={styles.saveButtonText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  // Modal styles  
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    padding: 20,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 90,
  },
  modalButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  subjectSelector: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  subjectOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 8,
  },
  selectedSubjectOption: {
    backgroundColor: "#1e3c72",
  },
  subjectOptionText: {
    fontSize: 14,
    color: "#555",
  },
  selectedSubjectOptionText: {
    color: "white",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#1e3c72",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    marginBottom: 20,
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
  },  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 5,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  filterContainer: {
    marginBottom: 15,
  },
  sectionButtonsContainer: {
    paddingVertical: 10,
  },
  sectionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 10,
  },
  selectedSectionButton: {
    backgroundColor: "#1e3c72",
  },
  sectionButtonText: {
    fontWeight: "500",
    color: "#666",
  },
  selectedSectionButtonText: {
    color: "white",
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
    paddingBottom: 80,
  },  studentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },  studentMain: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  studentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e1f5fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e3c72",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  studentMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  rollNumber: {
    fontSize: 13,
    color: "#666",
    marginRight: 8,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1f5fe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#1e3c72",
    marginLeft: 2,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#d0e1f9",
  },
  viewIconButton: {
    backgroundColor: "#1e3c72",
    borderColor: "#1e3c72",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },  actionButtonContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 0.48, // Slightly less than half to ensure gap between buttons
  },
  attendanceButton: {
    backgroundColor: "#1e3c72",
  },
  notesButton: {
    backgroundColor: "#2a5298",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default TeacherClassScreen;