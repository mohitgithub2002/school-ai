import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface Subject {
  subject: string;
  marks: number | null;
  maxMarks: number;
  grade: string | null;
}

interface ResultProps {
  id: number;
  examName: string;
  shortName: string;
  month: string;
  isCompleted: boolean;
  subjects: Subject[];
  totalMarks: number | null;
  totalMaxMarks: number;
  percentage: string | null;
  rank: number | null;
  grade: string | null;
}

interface ResultsCardProps {
  result: ResultProps;
  onPress: () => void;
  isExpanded: boolean;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ result, onPress, isExpanded }) => {
  const getStatusColor = () => {
    if (!result.isCompleted) return '#999';
    const percent = parseFloat(result.percentage || '0');
    if (percent >= 80) return '#2ed573';
    if (percent >= 60) return '#ffa502';
    return '#ff4757';
  };

  const getStatusText = () => {
    if (!result.isCompleted) return 'Upcoming';
    const percent = parseFloat(result.percentage || '0');
    if (percent >= 80) return 'Excellent';
    if (percent >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Mathematics':
        return 'calculator';
      case 'Science':
        return 'flask';
      case 'English':
        return 'book';
      case 'Social Studies':
        return 'earth';
      case 'Hindi':
        return 'language';
      case 'Computer Science':
        return 'desktop';
      case 'Physical Education':
        return 'fitness';
      default:
        return 'document-text';
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeader} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.leftSection}>
          <View 
            style={[
              styles.examBadge,
              { backgroundColor: result.isCompleted ? '#f0eafa' : '#f0f0f0' }
            ]}
          >
            <Text 
              style={[
                styles.examBadgeText,
                { color: result.isCompleted ? '#6b4ce6' : '#999' }
              ]}
            >
              {result.shortName}
            </Text>
          </View>
          <View style={styles.examInfo}>
            <Text style={styles.examName}>{result.examName}</Text>
            <Text style={styles.examDate}>{result.month} 2024</Text>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          {result.isCompleted ? (
            <View style={styles.resultPreview}>
              <Text style={styles.percentageText}>{result.percentage}%</Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          ) : (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingText}>Upcoming</Text>
            </View>
          )}
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
            style={styles.expandIcon}
          />
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.expandedContent}>
          {result.isCompleted ? (
            <>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Marks</Text>
                  <Text style={styles.summaryValue}>
                    {result.totalMarks}/{result.totalMaxMarks}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Percentage</Text>
                  <Text style={styles.summaryValue}>{result.percentage}%</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Grade</Text>
                  <Text style={styles.summaryValue}>{result.grade}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Rank</Text>
                  <View style={styles.rankContainer}>
                    <Text style={styles.rankText}>{result.rank}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <Text style={styles.subjectsTitle}>Subject-wise Results</Text>
              
              {result.subjects.map((subject, index) => (
                <View key={index} style={styles.subjectRow}>
                  <View style={styles.subjectNameContainer}>
                    <Ionicons 
                      name={getSubjectIcon(subject.subject)}
                      size={16} 
                      color="#6b4ce6" 
                    />
                    <Text style={styles.subjectName}>{subject.subject}</Text>
                  </View>
                  <View style={styles.subjectMarks}>
                    <Text style={styles.marksText}>
                      {subject.marks !== null ? `${subject.marks}/${subject.maxMarks}` : 'N/A'}
                    </Text>
                    {subject.grade && (
                      <View 
                        style={[
                          styles.gradeBadge,
                          { 
                            backgroundColor: 
                              subject.grade === 'A+' || subject.grade === 'A' ? '#e8f5e9' :
                              subject.grade === 'B+' || subject.grade === 'B' ? '#e3f2fd' :
                              subject.grade === 'C+' || subject.grade === 'C' ? '#fff3e0' : '#ffebee'
                          }
                        ]}
                      >
                        <Text 
                          style={[
                            styles.gradeText,
                            { 
                              color: 
                                subject.grade === 'A+' || subject.grade === 'A' ? '#2e7d32' :
                                subject.grade === 'B+' || subject.grade === 'B' ? '#1565c0' :
                                subject.grade === 'C+' || subject.grade === 'C' ? '#ef6c00' : '#c62828'
                            }
                          ]}
                        >
                          {subject.grade}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.upcomingExamInfo}>
              <Ionicons name="calendar" size={24} color="#999" />
              <Text style={styles.upcomingMessage}>
                This exam is scheduled for {result.month} 2024.
              </Text>
              <Text style={styles.prepareMessage}>
                Keep preparing for the best results!
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  examBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 12,
  },
  examBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  examDate: {
    fontSize: 12,
    color: '#666',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultPreview: {
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  upcomingBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  upcomingText: {
    fontSize: 12,
    color: '#666',
  },
  expandIcon: {
    marginLeft: 10,
  },
  expandedContent: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  rankContainer: {
    backgroundColor: '#ffe082',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff8f00',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  subjectsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  subjectMarks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marksText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  upcomingExamInfo: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  upcomingMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  prepareMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b4ce6',
  },
});

export default ResultsCard;