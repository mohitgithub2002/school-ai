import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import ResultsCard from "../components/ResultsCard";
import TestResultCard from "../components/TestResultCard";
import PerformanceChart from "../components/PerformanceChart";
import FilterModal from "../components/FilterModal";

const { width } = Dimensions.get("window");

const ResultsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResultType, setSelectedResultType] = useState("recent");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedExam, setSelectedExam] = useState(null);

  // Mock data for the results
  const [examResults, setExamResults] = useState([]);
  const [regularTests, setRegularTests] = useState([]);
  const [performanceData, setPerformanceData] = useState({});

  const examTypes = [
    { id: 1, name: "First Test", shortName: "1st Test", month: "May" },
    { id: 2, name: "Half Yearly Exam", shortName: "Half Yearly", month: "Sep" },
    { id: 3, name: "Second Test", shortName: "2nd Test", month: "Dec" },
    { id: 4, name: "Final Exam", shortName: "Final", month: "Mar" }
  ];

  const allSubjects = [
    "Mathematics", "Science", "English", "Social Studies", 
    "Hindi", "Computer Science", "Physical Education"
  ];
  
  useEffect(() => {
    // Simulate API call to fetch results data
    setTimeout(() => {
      fetchMockData();
      setIsLoading(false);
    }, 1200);
  }, []);  const fetchMockData = () => {
    // Initialize empty exam results
    const mockExamResults = examTypes.map(examType => ({
      id: examType.id,
      examName: examType.name,
      shortName: examType.shortName,
      month: examType.month,
      isCompleted: false,
      subjects: allSubjects.map(subject => ({
        subject,
        marks: null,
        maxMarks: 100,
        grade: null
      })),
      totalMarks: null,
      totalMaxMarks: allSubjects.length * 100,
      percentage: null,
      rank: null,
      grade: null
    }));
    
    // Initialize empty test results
    const mockRegularTests = [];
    
    // Initialize empty performance data
    const emptySubjectPerformance = {};
    allSubjects.forEach(subject => {
      emptySubjectPerformance[subject] = 0;
    });
    
    const performanceData = {
      overall: 0,
      subjects: emptySubjectPerformance,
      recentTrend: [0, 0, 0, 0, 0]
    };
    
    setExamResults(mockExamResults);
    setRegularTests(mockRegularTests);
    setPerformanceData(performanceData);
  };

  const getGrade = (marks) => {
    if (marks >= 90) return "A+";
    if (marks >= 80) return "A";
    if (marks >= 70) return "B+";
    if (marks >= 60) return "B";
    if (marks >= 50) return "C+";
    if (marks >= 40) return "C";
    return "D";
  };
  
  const getRandomRemark = (marks) => {
    if (marks >= 90) return "Excellent performance!";
    if (marks >= 80) return "Very good work!";
    if (marks >= 70) return "Good effort, keep it up.";
    if (marks >= 60) return "Satisfactory, but room for improvement.";
    if (marks >= 50) return "Average performance, needs more practice.";
    if (marks >= 40) return "Needs significant improvement.";
    return "Requires immediate attention and extra help.";
  };

  const getFilteredRegularTests = () => {
    let filtered = [...regularTests];
    
    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter(test => test.subject === selectedSubject);
    }
    
    // Filter by date range
    if (selectedDateRange === "month") {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      filtered = filtered.filter(test => new Date(test.date) >= lastMonth);
    } else if (selectedDateRange === "quarter") {
      const lastQuarter = new Date();
      lastQuarter.setMonth(lastQuarter.getMonth() - 3);
      filtered = filtered.filter(test => new Date(test.date) >= lastQuarter);
    }
    
    return filtered;
  };

  const filteredTests = getFilteredRegularTests();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No test results found</Text>
      <Text style={styles.emptySubText}>
        Adjust filters or check back later for new results
      </Text>
    </View>
  );

  const toggleExamDetail = (examId) => {
    setSelectedExam(selectedExam === examId ? null : examId);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b4ce6" />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#6b4ce6", "#9d85f2"]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Results</Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setFilterVisible(true)}
            >
              <Ionicons name="filter" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                selectedResultType === "recent" && styles.selectedTab
              ]}
              onPress={() => setSelectedResultType("recent")}
            >
              <Text style={[
                styles.tabText,
                selectedResultType === "recent" && styles.selectedTabText
              ]}>
                Recent
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab, 
                selectedResultType === "exams" && styles.selectedTab
              ]}
              onPress={() => setSelectedResultType("exams")}
            >
              <Text style={[
                styles.tabText,
                selectedResultType === "exams" && styles.selectedTabText
              ]}>
                Exams
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab, 
                selectedResultType === "tests" && styles.selectedTab
              ]}
              onPress={() => setSelectedResultType("tests")}
            >
              <Text style={[
                styles.tabText,
                selectedResultType === "tests" && styles.selectedTabText
              ]}>
                Tests
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Performance Summary - Always shown */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="stats-chart" size={18} color="#333" /> Performance Summary
              </Text>
            </View>
            
            <View style={styles.performanceCard}>
              <View style={styles.overallPerformance}>
                <View style={styles.performanceCircle}>
                  <Text style={styles.performancePercentage}>
                    {performanceData.overall ? Math.round(performanceData.overall) : 0}%
                  </Text>
                  <Text style={styles.performanceLabel}>Overall</Text>
                </View>
                
                <View style={styles.performanceStats}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Academic Rank:</Text>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>
                        {examResults[0]?.rank || "-"}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Last exam:</Text>
                    <Text style={styles.statValue}>
                      {examResults.find(exam => exam.isCompleted)?.percentage || "-"}%
                    </Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Best subject:</Text>
                    <Text style={styles.statValue}>
                      {Object.entries(performanceData.subjects || {})
                        .sort((a, b) => b[1] - a[1])[0]?.[0] || "-"}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.chartContainer}>
                <PerformanceChart performanceData={performanceData} />
              </View>
            </View>
          </View>
          
          {/* Recent Results - Shown when Recent tab is selected */}
          {selectedResultType === "recent" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="time" size={18} color="#333" /> Recent Results
                </Text>
              </View>
              
              {/* Recent Exam */}
              {examResults.filter(exam => exam.isCompleted).length > 0 && (
                <View>
                  <Text style={styles.subsectionTitle}>Latest Exam</Text>
                  <ResultsCard 
                    result={examResults.filter(exam => exam.isCompleted)[0]} 
                    onPress={() => toggleExamDetail(examResults.filter(exam => exam.isCompleted)[0].id)}
                    isExpanded={selectedExam === examResults.filter(exam => exam.isCompleted)[0].id}
                  />
                </View>
              )}
              
              {/* Recent Tests */}
              <Text style={styles.subsectionTitle}>Latest Tests</Text>
              {regularTests.slice(0, 3).map(test => (
                <TestResultCard key={test.id} test={test} formatDate={formatDate} />
              ))}
              
              {regularTests.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => setSelectedResultType("tests")}
                >
                  <Text style={styles.viewMoreButtonText}>View all tests</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Exams - Shown when Exams tab is selected */}
          {selectedResultType === "exams" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="school" size={18} color="#333" /> Exam Results
                </Text>
              </View>
              
              {examResults.map(exam => (
                <ResultsCard 
                  key={exam.id} 
                  result={exam} 
                  onPress={() => toggleExamDetail(exam.id)}
                  isExpanded={selectedExam === exam.id}
                />
              ))}
            </View>
          )}
          
          {/* Tests - Shown when Tests tab is selected */}
          {selectedResultType === "tests" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="clipboard" size={18} color="#333" /> Test Results
                </Text>
                <TouchableOpacity 
                  style={styles.filterBadge}
                  onPress={() => setFilterVisible(true)}
                >
                  <Ionicons name="options-outline" size={14} color="#6b4ce6" />
                  <Text style={styles.filterBadgeText}>
                    {selectedSubject !== "all" || selectedDateRange !== "all" 
                      ? "Filtered" 
                      : "Filter"}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {filteredTests.length > 0 ? (
                filteredTests.map(test => (
                  <TestResultCard key={test.id} test={test} formatDate={formatDate} />
                ))
              ) : (
                renderEmptyList()
              )}
            </View>
          )}
          
          <View style={styles.footer} />
        </ScrollView>
      </View>
      
      {/* Filter Modal */}
      <FilterModal 
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        subjects={allSubjects}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
      />
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
    color: "#6b4ce6",
    fontSize: 16,
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
    fontWeight: "600",
    color: "white",
  },
  filterButton: {
    padding: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 25,
  },
  selectedTab: {
    backgroundColor: "white",
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  selectedTabText: {
    color: "#6b4ce6",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginBottom: 10,
    marginTop: 5,
  },
  performanceCard: {
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
  overallPerformance: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  performanceCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#f9f5ff",
    borderWidth: 2,
    borderColor: "#6b4ce6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  performancePercentage: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6b4ce6",
  },
  performanceLabel: {
    fontSize: 12,
    color: "#666",
  },
  performanceStats: {
    flex: 1,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  rankBadge: {
    backgroundColor: "#ffe082",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rankText: {
    color: "#ff8f00",
    fontWeight: "bold",
    fontSize: 14,
  },
  chartContainer: {
    height: 200,
  },
  viewMoreButton: {
    backgroundColor: "#f0eafa",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  viewMoreButtonText: {
    color: "#6b4ce6",
    fontWeight: "500",
  },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0eafa",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  filterBadgeText: {
    color: "#6b4ce6",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "white",
    borderRadius: 15,
    marginVertical: 10,
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
  footer: {
    height: 80,
  },
});

export default ResultsScreen;