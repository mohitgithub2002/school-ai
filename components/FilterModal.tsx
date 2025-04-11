import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  subjects: string[];
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  selectedDateRange: string;
  setSelectedDateRange: (range: string) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  subjects,
  selectedSubject,
  setSelectedSubject,
  selectedDateRange,
  setSelectedDateRange
}) => {
  const handleApplyFilters = () => {
    onClose();
  };

  const handleResetFilters = () => {
    setSelectedSubject('all');
    setSelectedDateRange('all');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Results</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                {/* Subject Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Subject</Text>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.optionButton,
                        selectedSubject === 'all' && styles.selectedOption
                      ]}
                      onPress={() => setSelectedSubject('all')}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          selectedSubject === 'all' && styles.selectedOptionText
                        ]}
                      >
                        All Subjects
                      </Text>
                    </TouchableOpacity>
                    
                    {subjects.map((subject, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={[
                          styles.optionButton,
                          selectedSubject === subject && styles.selectedOption
                        ]}
                        onPress={() => setSelectedSubject(subject)}
                      >
                        <Text 
                          style={[
                            styles.optionText,
                            selectedSubject === subject && styles.selectedOptionText
                          ]}
                        >
                          {subject}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Date Range Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Date Range</Text>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.optionButton,
                        selectedDateRange === 'all' && styles.selectedOption
                      ]}
                      onPress={() => setSelectedDateRange('all')}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          selectedDateRange === 'all' && styles.selectedOptionText
                        ]}
                      >
                        All Time
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.optionButton,
                        selectedDateRange === 'month' && styles.selectedOption
                      ]}
                      onPress={() => setSelectedDateRange('month')}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          selectedDateRange === 'month' && styles.selectedOptionText
                        ]}
                      >
                        Last Month
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.optionButton,
                        selectedDateRange === 'quarter' && styles.selectedOption
                      ]}
                      onPress={() => setSelectedDateRange('quarter')}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          selectedDateRange === 'quarter' && styles.selectedOptionText
                        ]}
                      >
                        Last 3 Months
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={handleResetFilters}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={handleApplyFilters}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
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
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#f0eafa',
    borderWidth: 1,
    borderColor: '#6b4ce6',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#6b4ce6',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#6b4ce6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default FilterModal;