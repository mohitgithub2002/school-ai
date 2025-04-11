import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  FlatList
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AppLayout from "../components/AppLayout";
import { toast } from "sonner-native";
import * as authService from "../services/authService";

const TeacherDiaryScreen = ({ navigation, route }) => {
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Modal for adding new diary note (if needed)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");  const [isSaving, setIsSaving] = useState(false);
  
  // Create a new function to fetch classes for the teacher
  const fetchClasses = async () => {
    try {
      const token = await authService.getToken();
      const response = await fetch(`https://vps-vert.vercel.app/api/teacher/classlist`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setClasses(data.data.classes);
        if (data.data.classes.length > 0) {
          setSelectedClass(data.data.classes[0]);
        }
      } else {
        toast.error(`${data.message || "Error fetching classes"}`);
      }
    } catch (error) {
      console.error("Error in fetchClasses:", error);
      toast.error(`${error.message || "Error fetching classes"}`);
    }
  };

  // Remove Add Note related state/functionality
  // const [isModalVisible, setIsModalVisible] = useState(false);
  // const [entryTitle, setEntryTitle] = useState("");
  // const [entryContent, setEntryContent] = useState("");
  // const handleAddEntry = () => {
  //   setEntryTitle("");
  //   setEntryContent("");
  //   setIsModalVisible(true);
  // };
  // const handleSaveEntry = async () => {
  //    ... (remove add note save logic)
  // };  
  useEffect(() => {
    fetchClasses();
  }, []);
  
  useEffect(() => {
    if (selectedClass) {
      fetchDiaryEntries();
    }
  }, [selectedClass]);
  
  const fetchDiaryEntries = async (forceRefresh = false) => {
    if (!selectedClass) return;
    setIsNotesLoading(true);
    try {
      const token = await authService.getToken();
      // Use the classId from selected class (if not available use id)
      const classroomId = selectedClass.classId || selectedClass.id;
      const url = `https://vps-vert.vercel.app/api/teacher/diary/allnotes?classroomId=${classroomId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setDiaryEntries(data.data.entries);
      } else {
        setError(data.message || "Failed to fetch diary entries");
        toast.error(data.message || "Failed to fetch diary entries");
      }
    } catch (err) {
      console.error("Diary entries error:", err);
      setError(err.message || "Error fetching diary entries");
      toast.error(err.message || "Error fetching diary entries");
    } finally {
      setIsNotesLoading(false);
      setIsLoading(false);
    }
  };  const handleAddEntry = () => {
    setEntryTitle("");
    setEntryContent("");
    setIsModalVisible(true);
  };  const handleSaveEntry = async () => {
    if (!entryTitle.trim() || !entryContent.trim()) {
      toast.error(`Please fill in all fields`);
      return;
    }
    
    setIsSaving(true);
    try {
      const token = await authService.getToken();
      const classroomId = selectedClass.classId || selectedClass.id;
      const payload = {
        subject: entryTitle,
        content: entryContent,
        classroomId,
        entryType: "Broadcast"
      };
      const response = await fetch(`https://vps-vert.vercel.app/api/teacher/diary/addnote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`Diary entry added successfully!`);
        fetchDiaryEntries(true);
        setIsModalVisible(false);
      } else {
        toast.error(data.message || `Failed to add diary entry`);
      }
    } catch (err) {
      console.error("Save diary entry error:", err);
      toast.error(err.message || `Error saving diary entry`);
    } finally {
      setIsSaving(false);
    }
  };  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };
  
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffMin < 1) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} min ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return formatDate(dateString);
    }
  };// You may keep any other helper functions (e.g., isToday) as needed.
  
  const getSubjectColor = (subject) => {
    const subjectMap = {
      'Mathematics': '#4e7eff',
      'Science': '#2ed573',
      'English': '#ff7eb3',
      'Social Studies': '#7158e2',
      'Physics': '#0984e3',
      'Chemistry': '#00b894',
      'Biology': '#00cec9',
      'Hindi': '#fdcb6e',
      'Computer Science': '#6c5ce7',
      'Physical Education': '#e84393'
    };
    
    return subjectMap[subject] || '#1e3c72';
  };
  
  const getSubjectIcon = (subject) => {
    const iconMap = {
      'Mathematics': 'calculator',
      'Science': 'flask',
      'English': 'book',
      'Social Studies': 'earth',
      'Physics': 'flash',
      'Chemistry': 'flask',
      'Biology': 'leaf',
      'Hindi': 'language',
      'Computer Science': 'desktop',
      'Physical Education': 'fitness'
    };
    
    return iconMap[subject] || 'document-text';
  };  const confirmDeleteEntry = (entryId) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              const token = await authService.getToken();
              const response = await fetch(`https://vps-vert.vercel.app/api/teacher/diary/deletenote?entryId=${entryId}`, {
                method: "DELETE",
                headers: {
                  "Authorization": `Bearer ${token}`
                }
              });
              
              const data = await response.json();
              if (response.ok && data.success) {
                // Only remove from local state if API call succeeds
                setDiaryEntries(diaryEntries.filter(entry => entry.id !== entryId));
                toast.success(data.message || "Note deleted successfully");
              } else {
                toast.error(data.message || "Failed to delete note");
              }
            } catch (error) {
              console.error("Delete note error:", error);
              toast.error("Failed to delete note. Please try again.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };  return (
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
            <Text style={styles.headerTitle}>Diary Notes</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddEntry}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.classTabsContainer}
          >
            {classes.map(cls => (
              <TouchableOpacity
                key={cls.id}
                style={[
                  styles.classTab,
                  selectedClass && selectedClass.id === cls.id && styles.selectedClassTab
                ]}
                onPress={() => setSelectedClass(cls)}
              >
                <Text 
                  style={[
                    styles.classTabText,
                    selectedClass && selectedClass.id === cls.id && styles.selectedClassTabText
                  ]}
                >
                  {cls.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e3c72" />
            <Text style={styles.loadingText}>Loading diary entries...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.entriesContainer}
          >
            {diaryEntries.length > 0 ? (          diaryEntries.map(entry => (
            <View key={entry.id} style={[styles.entryCard, { borderLeftColor: getSubjectColor(entry.subject) }]}>
              <View style={styles.entryContent}>
                <View style={styles.subjectRow}>
                  <View style={[styles.subjectBadge, { backgroundColor: `${getSubjectColor(entry.subject)}15` }]}>
                    <Ionicons 
                      name={getSubjectIcon(entry.subject)} 
                      size={20} 
                      color={getSubjectColor(entry.subject)} 
                    />
                    <Text style={[styles.subjectText, { color: getSubjectColor(entry.subject) }]}>
                      {entry.subject}
                    </Text>
                  </View>
                </View>

                <Text style={styles.entryDescription}>{entry.content}</Text>

                <View style={styles.entryFooter}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.teacherName}>Added by {entry.teacher?.name || "You"}</Text>
                  </View>
                  
                  {isToday(new Date(entry.date)) && (
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => confirmDeleteEntry(entry.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ff4757" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="book" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No diary entries found</Text>
                <Text style={styles.emptySubText}>
                  Tap the + button to add a new entry
                </Text>
              </View>
            )}
          </ScrollView>
        )}        {/* Add Entry Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Student Note</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Class</Text>
                <View style={styles.inputDisabled}>
                  <Text>{selectedClass?.name}</Text>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <View style={styles.inputDisabled}>
                  <Text>{new Date().toLocaleDateString('en-US', {day: '2-digit', month: '2-digit', year: 'numeric'})}</Text>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Subject</Text>
                <ScrollView 
                  horizontal={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.subjectPillsContainer}
                >
                  <View style={styles.pillsRow}>
                    {["Mathematics", "Science", "English", "Social Studies", "Physics", "Chemistry", "Biology", "Hindi", "Computer Science", "Physical Education"].map((subject) => (
                      <TouchableOpacity 
                        key={subject}
                        style={[
                          styles.subjectPill,
                          entryTitle === subject && styles.selectedSubjectPill
                        ]}
                        onPress={() => setEntryTitle(subject)}
                      >
                        <Text 
                          style={[
                            styles.subjectPillText,
                            entryTitle === subject && styles.selectedSubjectPillText
                          ]}
                        >
                          {subject}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Content</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter note content"
                  value={entryContent}
                  onChangeText={setEntryContent}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>              </ScrollView>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveEntry}
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
    paddingBottom: 15,
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  classTabsContainer: {
    paddingVertical: 10,
  },
  classTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    marginRight: 10,
  },
  selectedClassTab: {
    backgroundColor: "white",
  },
  classTabText: {
    color: "white",
    fontWeight: "500",
  },
  selectedClassTabText: {
    color: "#1e3c72",
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
  content: {
    flex: 1,
    padding: 15,
  },
  entriesContainer: {
    paddingBottom: 20,
  },  entryCard: {
    backgroundColor: "white",
    borderRadius: 15,
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
    overflow: "hidden",
  },
  entryContent: {
    flex: 1,
    padding: 15,
  },
  subjectRow: {
    marginBottom: 12,
  },
  subjectBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  entryDescription: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  entryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  entryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  entryDate: {
    fontSize: 12,
    color: "#666",
  },
  dotSeparator: {
    fontSize: 12,
    color: "#666",
    marginHorizontal: 8,
  },
  teacherName: {
    fontSize: 12,
    color: "#666",
  },
  deleteButton: {
    backgroundColor: "#ffebee",
    padding: 8,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  subjectPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  subjectPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSubjectPill: {
    backgroundColor: "#1e3c72",
  },
  subjectPillText: {
    fontSize: 14,
    color: "#666",
  },
  selectedSubjectPillText: {
    color: "white",
    fontWeight: "500",
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
  textArea: {
    minHeight: 100,
  },  buttonContainer: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "white",
  },
  saveButton: {
    backgroundColor: "#1e3c72",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },


});

export default TeacherDiaryScreen;