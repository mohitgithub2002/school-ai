import React, { useState, useEffect } from "react";
import * as authService from "../services/authService";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import AppLayout from "../components/AppLayout";
import { toast } from "sonner-native";

const TeacherStudentDetailsScreen = ({ navigation, route }) => {
  const { studentInfo } = route.params || { studentInfo: null };
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [studentNotes, setStudentNotes] = useState([]);  
  const [activeTab, setActiveTab] = useState('notes');
  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false);
  const [noteSubject, setNoteSubject] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStudentDetails();
  }, []);  const fetchStudentDetails = async () => {
    setIsLoading(true);

    // If we have studentInfo from route params, use it, otherwise use a default object
    const student = studentInfo || {
      id: 1,
      name: "Student 1",
      rollNumber: "1001",
      section: "A",
      enrollmentId: 0
    };

    // Create a mock student data object with additional information
    const mockStudentData = {
      ...student,
      gender: "Male",
      dateOfBirth: "01/15/2009",
      fatherName: "David Smith",
      motherName: "Sarah Smith",
      contactNumber: "+91 98765 43210",
      email: "parent.smith@gmail.com",
      address: "123 School Lane, Education City - 500001",
      bloodGroup: "O+",
      emergencyContact: "+91 87654 32109",
      joiningDate: "04/05/2020",
      achievements: ["Science Fair Winner 2023", "Perfect Attendance 2022"],
      attendance: {
        present: 156,
        absent: 12,
        total: 172,
        percentage: 90.7
      },
      class: "10A",
      section: student.section || "A",
      subjects: [
        "Mathematics",
        "Science",
        "English",
        "Social Studies",
        "Computer Science"
      ]
    };

    setStudentData(mockStudentData);

    try {
      // Call the API to fetch student notes using the enrollmentId, page number, and limit.
      const enrollmentId = student.enrollmentId || 0;
      console.log(enrollmentId)
      const page = 1;
      const limit = 20;      
      const token = await authService.getToken();
      const response = await fetch(`https://vps-vert.vercel.app/api/teacher/diary/allnotes?enrollmentId=${enrollmentId}&page=${page}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await response.json();
      console.log(result)
      if (result.success && result.data && result.data.entries) {
        setStudentNotes(result.data.entries);
      } else {
        // If API doesn't return success, fallback to mock notes
        toast.error(`Error fetching notes. Falling back to mock data.`);
        const mockNotes = Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          subject: ["Mathematics", "Science", "English", "Social Studies", "Behavior", "General"][i % 6],
          content: [
            "Excellent performance in the recent test. Keep it up!",
            "Having difficulty with algebraic equations. Needs additional support.",
            "Shows great interest in science experiments. Encourage further exploration.",
            "Submitted assignment late. Please ensure timely submission.",
            "Very active in class discussions. Good communication skills.",
            "Demonstrated leadership qualities during group activities."
          ][i % 6],
          date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
          addedBy: "John Teacher"
        }));
        setStudentNotes(mockNotes);
      }
    } catch (error) {
      toast.error(`Error fetching notes: ${error.message}`);
      // Fallback to mock notes in case of error
      const mockNotes = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        subject: ["Mathematics", "Science", "English", "Social Studies", "Behavior", "General"][i % 6],
        content: [
          "Excellent performance in the recent test. Keep it up!",
          "Having difficulty with algebraic equations. Needs additional support.",
          "Shows great interest in science experiments. Encourage further exploration.",
          "Submitted assignment late. Please ensure timely submission.",
          "Very active in class discussions. Good communication skills.",
          "Demonstrated leadership qualities during group activities."
        ][i % 6],
        date: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
        addedBy: "John Teacher"
      }));
      setStudentNotes(mockNotes);
    }

    setIsLoading(false);
  };  const renderNoteItem = ({ item }) => {
    const isToday = new Date(item.date).toDateString() === new Date().toDateString();
    const subjectColor = getSubjectColor(item.subject);

    return (          <View style={styles.noteCard}>
            <View style={[styles.noteBorder, { backgroundColor: subjectColor }]} />
            <View style={styles.noteContent}>
              <View style={[styles.subjectBadge, { backgroundColor: `${subjectColor}15` }]}>
                <Text style={[styles.subjectText, { color: subjectColor }]}>{item.subject}</Text>
              </View>
              <Text style={styles.noteText}>{item.content}</Text>
              <View style={styles.noteFooter}>
                <View style={styles.noteInfo}>
                  <Text style={styles.noteDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.noteTeacher}>• Added by {item.addedBy}</Text>
                </View>                {isToday && (
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNote(item)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff4757" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
    );
  };

  const handleAddNote = () => {
    setNoteSubject("");
    setNoteContent("");
    setIsAddNoteModalVisible(true);
  };

  const saveNote = async () => {
    if (!noteSubject) {
      toast.error("Please select a subject");
      return;
    }

    if (!noteContent.trim()) {
      toast.error("Please enter note content");
      return;
    }

    setIsSaving(true);    // Submit the note via API with entryType "Personal"
    try {
      const token = await authService.getToken();
      // Extract enrollmentId from the selected student and classroomId from student info
      const enrollmentId = studentData?.enrollmentId;
const classroomId = studentData?.classId || studentData?.id; 
      if (!enrollmentId || !classroomId) {
        toast.error("Missing enrollment or classroom ID");
        setIsSaving(false);
        return;
      }
      
      const payload = {
        enrollmentId: Number(enrollmentId),
        classroomId: Number(classroomId),
        subject: noteSubject,
        content: noteContent,
        entryType: "Personal"
      };

      const response = await fetch("https://vps-vert.vercel.app/api/teacher/diary/addnote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Optionally update studentNotes from the returned data if needed
        // Here we just prepend the new note from the API response
        setStudentNotes([data.entry, ...studentNotes]);
        toast.success(data.message || "Diary entry added successfully");
        setIsAddNoteModalVisible(false);
      } else {
        toast.error(data.message || "Failed to add diary entry");
      }
    } catch (error) {
      console.error("Save diary entry error:", error);
      toast.error("An error occurred while saving the diary entry");      } finally {
        setIsSaving(false);
      }
  };

  const handleDeleteNote = async (note) => {
    // Ensure we only allow deletion for today's note
    if (new Date(note.date).toDateString() !== new Date().toDateString()) {
      toast.error("You can only delete today's note.");
      return;
    }
    try {
      const token = await authService.getToken();
      const response = await fetch(
        `https://vps-vert.vercel.app/api/teacher/diary/deletenote?entryId=${note.id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        // Remove the note from the local state
        setStudentNotes(studentNotes.filter((n) => n.id !== note.id));
        toast.success(data.message || "Diary entry deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete diary entry");
      }
    } catch (error) {
      console.error("Delete diary entry error:", error);
      toast.error("An error occurred while deleting the diary entry");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubjectColor = (subject) => {
    switch (subject.toLowerCase()) {
      case 'mathematics':
        return '#4e7eff';
      case 'science':
        return '#2ed573';
      case 'english':
        return '#ff7eb3';
      case 'social studies':
        return '#7158e2';
      case 'computer science':
        return '#3498db';
      case 'behavior':
        return '#ffa502';
      default:
        return '#1e3c72';
    }
  };

  if (isLoading || !studentData) {
    return (
      <AppLayout isTeacher={true} hideBottomNav={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3c72" />
          <Text style={styles.loadingText}>Loading student details...</Text>
        </View>
      </AppLayout>
    );
  }

  return (
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
            <Text style={styles.headerTitle}>Student Details</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.studentProfileContainer}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{studentData.name.charAt(0)}</Text>
            </View>
            <View style={styles.studentBasicInfo}>
              <Text style={styles.studentName}>{studentData.name}</Text>
              <View style={styles.studentMetaContainer}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Roll No:</Text>
                  <Text style={styles.metaValue}>{studentData.rollNumber}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Class:</Text>
                  <Text style={styles.metaValue}>{studentData.class}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Section:</Text>
                  <Text style={styles.metaValue}>{studentData.section}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'notes' && styles.activeTabButton]}
            onPress={() => setActiveTab('notes')}
          >
            <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Notes</Text>
          </TouchableOpacity>
        {/* 
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'attendance' && styles.activeTabButton]}
            onPress={() => setActiveTab('attendance')}
          >
            <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>Attendance</Text>
          </TouchableOpacity>

          */}
        </View>

        {/* Tab Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >

          {activeTab === 'notes' && (
            <View style={styles.notesContent}>
              <View style={styles.notesSectionHeader}>
                <Text style={styles.notesSectionTitle}>Student Notes</Text>
                <TouchableOpacity 
                  style={styles.addNoteButton}
                  onPress={handleAddNote}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.addNoteButtonText}>Add Note</Text>
                </TouchableOpacity>
              </View>

              {studentNotes.length > 0 ? (
                <FlatList
                  data={studentNotes}
                  renderItem={renderNoteItem}            keyExtractor={(item, index) => (item.id !== undefined ? item.id.toString() : index.toString())}
                  scrollEnabled={false}
                  style={styles.notesList}
                />
              ) : (
                <View style={styles.emptyNotesContainer}>
                  <Ionicons name="document-text-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyNotesText}>No notes added yet</Text>
                  <Text style={styles.emptyNotesSubtext}>Add your first note by clicking the button above</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'attendance' && (
            <View style={styles.attendanceContent}>
              <View style={styles.attendanceCard}>
                <Text style={styles.attendanceTitle}>Attendance Summary</Text>
                <View style={styles.attendanceStats}>
                  <View style={styles.statCard}>
                    <View style={[styles.statCircle, styles.presentCircle]}>
                      <Text style={styles.statNumber}>{studentData.attendance.present}</Text>
                    </View>
                    <Text style={styles.statLabel}>Present</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <View style={[styles.statCircle, styles.absentCircle]}>
                      <Text style={styles.statNumber}>{studentData.attendance.absent}</Text>
                    </View>
                    <Text style={styles.statLabel}>Absent</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <View style={[styles.statCircle, styles.percentageCircle]}>
                      <Text style={styles.statNumber}>{studentData.attendance.percentage}%</Text>
                    </View>
                    <Text style={styles.statLabel}>Percentage</Text>
                  </View>
                </View>

                <View style={styles.attendanceNote}>
                  <Ionicons name="information-circle-outline" size={16} color="#666" />
                  <Text style={styles.attendanceNoteText}>
                    Total school days: {studentData.attendance.total}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.viewFullButton}>
                <Text style={styles.viewFullButtonText}>View Full Attendance Record</Text>
                <Ionicons name="chevron-forward" size={16} color="#1e3c72" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Add Note Modal */}
        <Modal
          visible={isAddNoteModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsAddNoteModalVisible(false)}
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
                  onPress={() => setIsAddNoteModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Student</Text>
                <View style={styles.inputDisabled}>
                  <Text>{studentData.name}</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <View style={styles.inputDisabled}>
                  <Text>{new Date().toLocaleDateString()}</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Subject</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.subjectSelector}
                >
                  {["Mathematics", "Science", "English", "Social Studies", "Computer Science", "Behavior", "General"].map(subject => (
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
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Note</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
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
  studentProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "white",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  studentBasicInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 5,
  },
  studentMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    marginRight: 12,
    marginBottom: 4,
  },
  metaLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    marginRight: 4,
    fontSize: 13,
  },
  metaValue: {
    color: "white",
    fontWeight: "500",
    fontSize: 13,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 15,
    marginTop: -15,
    borderRadius: 15,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: "#f0f7ff",
  },
  tabText: {
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#1e3c72",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
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
  overviewContent: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
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
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "right",
    flex: 1,
  },
  valueWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  iconButton: {
    padding: 5,
    marginLeft: 5,
  },
  labelHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  achievementText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  notesContent: {
    flex: 1,
  },
  notesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  notesSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  addNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e3c72",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addNoteButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 13,
    marginLeft: 5,
  },
  notesList: {
    flex: 1,
  },  noteCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noteBorder: {
    width: 4,
  },
  noteContent: {
    flex: 1,
    padding: 12,
  },
  subjectBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: "600",
  },
  noteText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  noteInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteDate: {
    fontSize: 12,
    color: "#666",
  },
  noteTeacher: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  deleteButton: {
    padding: 4,
    backgroundColor: "#ffebee",
    borderRadius: 8,
  },
  emptyNotesContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "white",
    borderRadius: 15,
  },
  emptyNotesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
  },
  emptyNotesSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  attendanceContent: {
    flex: 1,
  },
  attendanceCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  attendanceStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statCard: {
    alignItems: "center",
  },
  statCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  presentCircle: {
    backgroundColor: "#e8f5e9",
    borderWidth: 2,
    borderColor: "#2ed573",
  },
  absentCircle: {
    backgroundColor: "#ffebee",
    borderWidth: 2,
    borderColor: "#ff4757",
  },
  percentageCircle: {
    backgroundColor: "#f0f7ff",
    borderWidth: 2,
    borderColor: "#1e3c72",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  attendanceNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  attendanceNoteText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#666",
  },
  viewFullButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  viewFullButtonText: {
    color: "#1e3c72",
    fontWeight: "500",
    marginRight: 5,
  },  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
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
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
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
});

export default TeacherStudentDetailsScreen;