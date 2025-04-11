import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

const TeacherAllClassesScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      applyFilters();
    }
  }, [searchText, classes]);    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const authService = await import("../services/authService");
        const token = await authService.getToken();
        const url = `https://vps-vert.vercel.app/api/teacher/classlist`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          // The API returns the classes array in data.data.classes
          setClasses(data.data.classes);
          setFilteredClasses(data.data.classes);
        } else {
          console.error("Error fetching classes:", data.message);
        }
      } catch (error) {
        console.error("Fetch classes error:", error);
      } finally {
        setIsLoading(false);
      }
    };

  const applyFilters = () => {
    let result = [...classes];
    
    // Apply search filter
    if (searchText) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredClasses(result);
  };  const renderClassItem = ({ item }) => {
    // Determine icon based on class name/medium
    const getSubjectIcon = () => {
      const name = item.name.toLowerCase();
      const medium = (item.medium || '').toLowerCase();
      
      if (name.includes('math') || medium.includes('math')) return 'calculator';
      if (name.includes('science') || medium.includes('science')) return 'flask';
      if (name.includes('english') || medium.includes('english')) return 'text';
      if (name.includes('social') || medium.includes('social')) return 'earth';
      if (name.includes('computer') || medium.includes('computer')) return 'laptop';
      return 'school';
    };

    // Generate gradient colors based on status
    const getCardGradient = () => {
      return item.status === 'inactive' 
        ? ['#f5f5f5', '#e9e9e9'] 
        : ['#ffffff', '#f7f9ff'];
    };

    return (
      <TouchableOpacity 
        style={[
          styles.classCard,
          item.status === 'inactive' && styles.inactiveCard
        ]}                  onPress={() => navigation.navigate("TeacherClass", { 
                    classInfo: {
                      ...item,
                      // Ensure classId is available for the API call
                      classId: item.classId || item.id
                    } 
                  })}
        activeOpacity={0.7}
      >
        <LinearGradient 
          colors={getCardGradient()}
          style={styles.cardGradient}
        >
          <View style={styles.cardTopRow}>
            {/* Left: Icon and name */}
            <View style={styles.classMainInfo}>
              <View style={[
                styles.classIconContainer, 
                { backgroundColor: item.status === 'inactive' ? '#9e9e9e' : '#1e3c72' }
              ]}>          
                <Ionicons 
                  name={getSubjectIcon()}
                  size={24} 
                  color="white" 
                />
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{item.name}</Text>
                <View style={styles.mediumContainer}>
                  <Ionicons name="book-outline" size={12} color="#666" />
                  <Text style={styles.mediumText}>{item.medium || "English"}</Text>
                </View>
              </View>
            </View>

            {/* Right: Status and students count */}
            <View style={styles.classMetaInfo}>
              {item.status && (
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'active' ? '#e8f5e9' : '#ffebee' }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: item.status === 'active' ? '#4caf50' : '#f44336' }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: item.status === 'active' ? '#2e7d32' : '#c62828' }
                  ]}>
                    {item.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              )}
              <View style={styles.studentsCount}>
                <Text style={styles.studentsNumber}>{item.totalStudents || 0}</Text>
                <Text style={styles.studentsLabel}>Students</Text>
              </View>
            </View>
          </View>

          {/* Middle: Sections */}
          <View style={styles.sectionsRow}>
            <Text style={styles.sectionLabel}>Section(s):</Text>
            <View style={styles.badgeContainer}>          
              {(item.sections ? item.sections : [item.section]).map((section, index) => (
                <View key={index} style={styles.sectionBadge}>
                  <Text style={styles.sectionText}>{section}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Bottom: Schedule and actions */}
          <View style={styles.cardBottomRow}>
            <View style={styles.scheduleContainer}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.scheduleText}>{item.schedule || "No schedule set"}</Text>
            </View>

            {item.isTemporary && item.validUpto && (
              <View style={styles.validityContainer}>
                <Ionicons name="calendar-outline" size={14} color="#ff6d00" />
                <Text style={styles.validityText}>
                  Valid until {new Date(item.validUpto).toLocaleDateString()}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.viewButton}
              activeOpacity={0.7}
            >
              <Text style={styles.viewButtonText}>View Class</Text>
              <Ionicons name="chevron-forward" size={16} color="#1e3c72" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
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
            <Text style={styles.headerTitle}>All Classes</Text>
            <View style={styles.headerRight} />
          </View>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#1e3c72" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search classes..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#888"
            />
          </View>
        </LinearGradient>
        
        <View style={styles.content}>        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{classes.length}</Text>
              <Text style={styles.statLabel}>Total Classes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {classes.reduce((sum, cls) => sum + (cls.totalStudents || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {/* Count unique sections across all classes */}
                {new Set(classes.flatMap(cls => cls.sections || [cls.section])).size}
              </Text>
              <Text style={styles.statLabel}>Sections</Text>
            </View>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1e3c72" />
              <Text style={styles.loadingText}>Loading classes...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredClasses}
              renderItem={renderClassItem}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="class" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>No classes found</Text>
                  <Text style={styles.emptySubText}>
                    Try adjusting your search
                  </Text>
                </View>
              }
            />
          )}
        </View>
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 12,
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
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3c72",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
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
    paddingBottom: 20,
  },  classCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  inactiveCard: {
    opacity: 0.9,
  },
  cardGradient: {
    padding: 16,
    borderRadius: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  classMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  classIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1e3c72",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  mediumContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mediumText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
  },
  classMetaInfo: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  studentsCount: {
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    minWidth: 60,
  },
  studentsNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e3c72",
  },
  studentsLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  sectionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    color: "#666",
    marginRight: 8,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: "#e6f0ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(30, 60, 114, 0.1)",
  },
  sectionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e3c72",
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 14,
  },
  scheduleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  scheduleText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
  },
  validityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  validityText: {
    fontSize: 12,
    color: "#ff6d00",
    marginLeft: 5,
    fontWeight: "500",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f7ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(30, 60, 114, 0.1)",
    marginLeft: 12,
  },
  viewButtonText: {
    fontSize: 13,
    color: "#1e3c72",
    fontWeight: "600",
    marginRight: 4,
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
  },
});

export default TeacherAllClassesScreen;