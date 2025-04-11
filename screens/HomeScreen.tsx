import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import AppLayout from "../components/AppLayout";
import { LinearGradient } from "expo-linear-gradient";
import * as authService from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

// Define width variable from Dimensions
const { width } = Dimensions.get("window");

const DiaryScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;

  // New state and helper functions for diary entries API  const [diaryEntries, setDiaryEntries] = useState([]);
  const [diaryLoading, setDiaryLoading] = useState(false);  const [refreshing, setRefreshing] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState([]);

  const getSubjectColor = (subject) => {
    switch (subject.toLowerCase()){
      case "mathematics":
        return "#4e7eff";
      case "science":
        return "#2ed573";
      case "english":
        return "#ff7eb3";
      default:
        return "#6b4ce6";
    }
  };

  const getSubjectIcon = (subject) => {
    switch (subject.toLowerCase()){
      case "mathematics":
        return "calculator";
      case "science":
        return "flask";
      case "english":
        return "book";
      default:
        return "book";
    }
  };      // Helper function to format date using local values
      const formatLocalDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };  const { user } = useAuth();
  const fetchDiaryEntries = async (forceRefresh = false) => {
    setDiaryLoading(true);
    try {
      const token = await authService.getToken();
      const dateString = formatLocalDate(selectedDate);
      // Removed duplicate useAuth() hook call. Using user from component scope.
      const CACHE_KEY = `diaryEntriesCache_${user?.rollNo || user?.id || "default"}`;
      let cache = {};
      const cacheString = await AsyncStorage.getItem(CACHE_KEY);
      if (cacheString) {
        cache = JSON.parse(cacheString);
      }
      if (!forceRefresh && cache[dateString]) {
        setDiaryEntries(cache[dateString]);
      } else {
        const response = await fetch(`https://vps-vert.vercel.app/api/diary?date=${dateString}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setDiaryEntries(data.entries);
          const currentDateString = formatLocalDate(new Date());
          // For past dates, cache as usual.
          // For today's date, only cache if there are diary entries (to avoid caching an empty result early in the day).
          if (dateString !== currentDateString || (data.entries && data.entries.length > 0)) {
            cache[dateString] = data.entries;
            // Prune cache: keep only entries for the last 15 days
            const today = new Date();
            const fifteenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 15);
            for (const key in cache) {
              const keyDate = new Date(key);
              if (keyDate < fifteenDaysAgo) {
                delete cache[key];
              }
            }
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
          }
        } else {
          setDiaryEntries([]);
        }
      }
    } catch (error) {
      console.error("Diary fetch error:", error);
      setDiaryEntries([]);
    } finally {
      setDiaryLoading(false);
    }
  };

  useEffect(() => {
    fetchDiaryEntries();
  }, [selectedDate]);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await authService.getToken();
        if (!token) {
          // Redirect to login if no token
          navigation.navigate("Login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigation.navigate("Login");
      }
    };
    
    checkAuth();
  }, []);

  // Calendar data
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const showBottomSheet = () => {
    setIsBottomSheetVisible(true);
    Animated.timing(bottomSheetAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideBottomSheet = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsBottomSheetVisible(false));
  };
  
  // Generate dates for the date picker (including Sundays but marked as disabled)
  const getDates = () => {
    const dates = [];
    const today = new Date(new Date().setHours(23, 59, 59, 999));
    
    // Generate 7 consecutive dates starting from 3 days before selected date
    for (let i = -3; i <= 3; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      
      // Mark Sundays with a special property and future dates
      dates.push({
        date,
        isSunday: date.getDay() === 0,
        isFuture: date > today
      });
    }
    
    return dates;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: 'numeric',
    });
  };
  
  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add actual dates of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add empty cells to complete the last row
    const totalCellsAdded = firstDayOfMonth + daysInMonth;
    const remainder = totalCellsAdded % 7;
    
    if (remainder > 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        days.push(null);
      }
    }
    
    return days;
  };

  const changeMonth = (increment) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setSelectedMonth(newMonth);
  };
  
  const selectDate = (date) => {
    if (date) {
      // Don't allow selection of Sundays
      if (date.getDay() === 0) {
        return;
      }
      
      setSelectedDate(date);
      hideBottomSheet();
      
      // Date picker in header will automatically update since it uses the selectedDate
    }
  };

  const bottomSheetTranslateY = bottomSheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });  
  
  return (
    <AppLayout>
      <View style={styles.container}>
      {/* Header */}      
      <LinearGradient
        colors={["#6b4ce6", "#9d85f2"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>School Diary</Text>
          <TouchableOpacity style={styles.calendarButton} onPress={showBottomSheet}>
            <Ionicons name="calendar" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Date Picker */}        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.datePickerContainer}
        >
          {getDates().map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateItem,
                selectedDate.toDateString() === item.date.toDateString() && styles.selectedDate,
                item.isSunday && styles.sundayDateItem
              ]}              onPress={() => !item.isSunday && !item.isFuture && setSelectedDate(item.date)}
              disabled={item.isSunday || item.isFuture}
            >
              <Text style={[
                styles.dateText,
                selectedDate.toDateString() === item.date.toDateString() && styles.selectedDateText,                item.isSunday && styles.sundayDateText,
                item.isFuture && styles.futureDateText
              ]}>
                {formatDate(item.date)}
              </Text>
            </TouchableOpacity>
          ))}      
        </ScrollView>
      </LinearGradient>      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchDiaryEntries(true);
              setRefreshing(false);
            }}
            colors={['#6b4ce6']}
            tintColor="#6b4ce6"
            title={`Refreshing...`}
            titleColor="#6b4ce6"
          />
        }
      >
        {/* Current Date Display */}
        <Text style={styles.currentDate}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        {diaryLoading ? (
          <ActivityIndicator size="large" color="#6b4ce6" style={{ marginVertical: 20 }} />
        ) : diaryEntries.length === 0 ? (
          <Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginVertical: 20 }}>
            No dairy entries for today
          </Text>
        ) : (
          diaryEntries.map(entry => (
            <View key={entry.id} style={[styles.diaryCard, { borderLeftColor: getSubjectColor(entry.subject) }]}>
              <View style={styles.diaryHeader}>
                <View style={styles.subjectContainer}>
                  <Ionicons name={getSubjectIcon(entry.subject)} size={20} color={getSubjectColor(entry.subject)} />
                  <Text style={styles.subjectText}>{entry.subject}</Text>
                </View>
              </View>
              <View style={styles.teacherInfo}>
                <Ionicons name="person" size={16} color="#666" />
                <Text style={styles.teacherName}>{entry.teacher.name}</Text>
              </View>
              <Text style={styles.noteContent}>{entry.content}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Bottom Sheet Calendar */}
      <Modal
        visible={isBottomSheetVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideBottomSheet}
      >
        <TouchableWithoutFeedback onPress={hideBottomSheet}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.bottomSheet,
                  {
                    transform: [{ translateY: bottomSheetTranslateY }],
                  },
                ]}
              >
                <View style={styles.bottomSheetHeader}>
                  <Text style={styles.bottomSheetTitle}>Select Date</Text>
                  <TouchableOpacity onPress={hideBottomSheet}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => changeMonth(-1)}>
                      <Ionicons name="chevron-back" size={24} color="#6b4ce6" />
                    </TouchableOpacity>
                    <Text style={styles.monthYearText}>
                      {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)}>
                      <Ionicons name="chevron-forward" size={24} color="#6b4ce6" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.weekDaysContainer}>
                    {daysInWeek.map((day, index) => (
                      <Text key={index} style={styles.weekDayText}>
                        {day}
                      </Text>
                    ))}
                  </View>                  <View style={styles.daysContainer}>
                    {getDaysInMonth(selectedMonth).map((date, index) => {
                      const isSunday = date && date.getDay() === 0;                  const isSelected = date && selectedDate.toDateString() === date.toDateString();
                  const isFutureDate = date && date > new Date(new Date().setHours(23, 59, 59, 999));
                      
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dayButton,
                            isSelected && styles.selectedDayButton,
                            isSunday && styles.sundayButton,
                            isFutureDate && styles.futureDate
                          ]}
                          onPress={() => date && !isSunday && !isFutureDate && selectDate(date)}
                          disabled={!date || isSunday || isFutureDate}
                        >                          <Text
                            style={[
                              styles.dayText,
                              isSelected && styles.selectedDayText,
                              isSunday && styles.sundayText,
                              isFutureDate && styles.futureDateText
                            ]}
                          >
                            {date ? date.getDate() : ''}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>      
      </Modal>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },  
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  calendarButton: {
    padding: 5,
  },
  datePickerContainer: {
    marginTop: 10,
  },  dateItem: {
    padding: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  selectedDate: {
    backgroundColor: 'white',
  },
  sundayDateItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dateText: {
    color: 'white',
    fontSize: 14,
  },
  selectedDateText: {
    color: '#6b4ce6',
    fontWeight: '600',
  },
  sundayDateText: {
    color: 'rgba(255,255,255,0.5)',
  },
  futureDateText: {
    color: 'rgba(255,255,255,0.5)',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Add padding to ensure content isn't hidden behind nav bar
  },
  diaryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  teacherName: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  noteContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },  currentDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },

  dueDate: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 450,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
  },  dayButton: {
    width: (width - 80) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  selectedDayButton: {
    backgroundColor: '#6b4ce6',
    borderRadius: 20,
  },
  sundayButton: {
    opacity: 0.5,
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  selectedDayText: {
    color: "white",
    fontWeight: "600",
  },  sundayText: {
    color: "#aaa",
  },
  futureDate: {
    opacity: 0.5,
  },
  futureDateText: {
    color: "#aaa",
  },
});

export default DiaryScreen;