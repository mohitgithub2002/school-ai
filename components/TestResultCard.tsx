import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TestResultProps {
  id: number;
  testName: string;
  subject: string;
  date: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  teacherRemarks: string;
}

interface TestResultCardProps {
  test: TestResultProps;
  formatDate: (date: string) => string;
}

const TestResultCard: React.FC<TestResultCardProps> = ({ test, formatDate }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return { background: '#e8f5e9', text: '#2e7d32' };
      case 'B+':
      case 'B':
        return { background: '#e3f2fd', text: '#1565c0' };
      case 'C+':
      case 'C':
        return { background: '#fff3e0', text: '#ef6c00' };
      default:
        return { background: '#ffebee', text: '#c62828' };
    }
  };

  const gradeColors = getGradeColor(test.grade);

  return (
    <>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.leftSection}>
          <View 
            style={[
              styles.iconContainer,
              { backgroundColor: '#f0eafa' }
            ]}
          >
            <Ionicons 
              name={getSubjectIcon(test.subject)} 
              size={20} 
              color="#6b4ce6" 
            />
          </View>
          <View style={styles.testInfo}>
            <Text style={styles.testName}>{test.testName}</Text>
            <Text style={styles.testDate}>{formatDate(test.date)}</Text>
          </View>
        </View>
        
        <View style={styles.marksContainer}>
          <Text style={styles.marksText}>
            {test.marks}/{test.maxMarks}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{test.testName}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Subject:</Text>
                    <View style={styles.subjectTag}>
                      <Ionicons name={getSubjectIcon(test.subject)} size={16} color="#6b4ce6" />
                      <Text style={styles.subjectText}>{test.subject}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(test.date)}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Marks:</Text>
                    <Text style={styles.infoValue}>{test.marks}/{test.maxMarks}</Text>
                  </View>                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Topic:</Text>
                    <Text style={styles.infoValue}>{test.topic || "General Assessment"}</Text>
                  </View>


                  <View style={styles.remarksSection}>
                    <Text style={styles.remarksTitle}>Teacher's Remarks:</Text>
                    <View style={styles.remarksBox}>
                      <Text style={styles.remarksText}>{test.teacherRemarks}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  testDate: {
    fontSize: 12,
    color: '#666',
  },
  marksContainer: {
    alignItems: 'flex-end',
    minWidth: 70,
    flexShrink: 0,
  },
  marksText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0eafa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  subjectText: {
    fontSize: 14,
    color: '#6b4ce6',
    fontWeight: '500',
    marginLeft: 5,
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical:.2,
    borderRadius: 12,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  remarksSection: {
    marginTop: 10,
  },
  remarksTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 10,
  },
  remarksBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  remarksText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default TestResultCard;