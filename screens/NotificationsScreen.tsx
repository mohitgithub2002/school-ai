import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  SectionList,
  Dimensions,
  RefreshControl,
  BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppLayout from '../components/AppLayout';
import { Swipeable } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';
import { useFocusEffect } from '@react-navigation/native';
import useBackButton from '../hooks/useBackButton';

const { width } = Dimensions.get('window');

// Generate mock data for notifications
const generateMockNotifications = (count: number) => {
  const notifications = [];
  const types = ['academic', 'assignment', 'exam', 'attendance', 'fee', 'message'];
  const typeLabels = {
    'academic': 'Academic',
    'assignment': 'Assignment',
    'exam': 'Exam',
    'attendance': 'Attendance',
    'fee': 'Fees',
    'message': 'Message'
  };
  
  const titles = [
    'Assignment Reminder',
    'New Test Score Added',
    'Attendance Warning',
    'Fee Payment Due',
    'Parent-Teacher Meeting',
    'Exam Schedule Updated',
    'New Document Available',
    'School Trip Registration',
    'Timetable Changes',
    'Holiday Announcement'
  ];
  
  // Generate dates distributed across different time periods
  for (let i = 0; i < count; i++) {
    const date = new Date();
    
    // Distribute notifications across today, yesterday, this week, and earlier
    if (i < count * 0.3) {
      // Today - last 12 hours
      const hoursAgo = Math.floor(Math.random() * 12);
      date.setHours(date.getHours() - hoursAgo);
    } else if (i < count * 0.5) {
      // Yesterday
      date.setDate(date.getDate() - 1);
      date.setHours(Math.floor(Math.random() * 24));
    } else if (i < count * 0.8) {
      // This week (2-6 days ago)
      const daysAgo = Math.floor(Math.random() * 5) + 2;
      date.setDate(date.getDate() - daysAgo);
    } else {
      // Earlier (1-3 weeks ago)
      const daysAgo = Math.floor(Math.random() * 21) + 7;
      date.setDate(date.getDate() - daysAgo);
    }
    
    // Randomize read/unread status but make recent ones more likely to be unread
    let isRead = i < count * 0.3 ? Math.random() > 0.3 : Math.random() > 0.1;
    const type = types[i % types.length];
    const titleIndex = i % titles.length;
    
    let description;
    let actionRequired = Math.random() > 0.6; // 40% chance of requiring action
    
    switch (type) {
      case 'academic':
        description = `Your ${['Mathematics', 'Science', 'English', 'Social Studies'][i % 4]} performance has been updated. ${actionRequired ? 'Review your progress report.' : ''}`;
        break;
      case 'assignment':
        const dueDate = new Date(date.getTime() + (2 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000);
        description = `New ${['homework', 'project', 'essay', 'lab report'][i % 4]} assigned. Due date: ${dueDate.toLocaleDateString()}.`;
        break;
      case 'exam':
        const examDate = new Date(date.getTime() + (5 + Math.floor(Math.random() * 10)) * 24 * 60 * 60 * 1000);
        description = `${['Unit test', 'Quiz', 'Final exam', 'Practice test'][i % 4]} scheduled for ${['Mathematics', 'Science', 'English', 'Social Studies'][i % 4]} on ${examDate.toLocaleDateString()}.`;
        break;
      case 'attendance':
        const percentage = 80 + Math.floor(Math.random() * 20);
        description = `Your attendance for this ${['week', 'month', 'semester'][i % 3]} is ${percentage}%. ${percentage < 90 ? 'Improvement needed.' : 'Keep it up!'}`;
        break;
      case 'fee':
        const dueIn = Math.floor(Math.random() * 10) + 1;
        description = `${['Tuition fee', 'Activity fee', 'Transport fee', 'Lab fee'][i % 4]} payment due in ${dueIn} days. Please pay on time to avoid late fees.`;
        break;
      case 'message':
        description = `New message from ${['Principal', 'Class Teacher', 'Subject Teacher', 'School Admin'][i % 4]}: "${['Please check with the office', 'Congratulations on your performance', 'Reminder about upcoming event', 'Important information regarding schedule changes'][i % 4]}..."`;
        break;
      default:
        description = 'Please check your school portal for details.';
    }
    
    notifications.push({
      id: i + 1,
      title: titles[titleIndex],
      description,
      timestamp: date.getTime(),
      type,
      typeLabel: typeLabels[type],
      isRead,
      actionRequired
    });
  }
  
  // Sort by timestamp (newest first)
  return notifications.sort((a, b) => b.timestamp - a.timestamp);
};

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readAll, setReadAll] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rowRefs = useRef(new Map()).current;
  
  // Use our improved hook with just the navigation object
  useBackButton(navigation);
  
  // Define handleGoBack for the UI back button
  const handleGoBack = () => {
    navigation.navigate('Dashboard');
  };
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, fadeAnim]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const data = generateMockNotifications(25);
      setNotifications(data);
      setIsLoading(false);
    }, 1000);
  };
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const data = generateMockNotifications(25);
      setNotifications(data);
      setRefreshing(false);
      toast.success('Notifications refreshed');
    }, 1500);
  }, []);

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true
    }));
    setNotifications(updatedNotifications);
    setReadAll(true);
    toast.success('All notifications marked as read');
  };

  const handleMarkAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    );
    setNotifications(updatedNotifications);
    
    // Close swipeable
    if (rowRefs.has(notificationId)) {
      rowRefs.get(notificationId).close();
    }
    
    toast.success('Notification marked as read');
  };
  
  const handleDelete = (notificationId) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    setNotifications(updatedNotifications);
    toast.success('Notification deleted');
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    // Convert to appropriate time units
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
    } else if (days < 7) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'academic':
        return 'school';
      case 'assignment':
        return 'document-text';
      case 'exam':
        return 'clipboard';
      case 'attendance':
        return 'calendar-outline';
      case 'fee':
        return 'card';
      case 'message':
        return 'chatbubble-ellipses';
      default:
        return 'notifications';
    }
  };
  
  const getNotificationColor = (type) => {
    switch (type) {
      case 'academic':
        return '#4e7eff';
      case 'assignment':
        return '#ff7eb3';
      case 'exam':
        return '#6b4ce6';
      case 'attendance':
        return '#2ed573';
      case 'fee':
        return '#ffa502';
      case 'message':
        return '#1e88e5';
      default:
        return '#6b4ce6';
    }
  };
  
  // Group notifications by time periods
  const groupNotificationsByDate = (notifications) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const sections = [
      { title: 'Today', data: [] },
      { title: 'Yesterday', data: [] },
      { title: 'This Week', data: [] },
      { title: 'Earlier', data: [] }
    ];
    
    notifications.forEach(notification => {
      const date = new Date(notification.timestamp);
      
      if (date >= today) {
        sections[0].data.push(notification);
      } else if (date >= yesterday) {
        sections[1].data.push(notification);
      } else if (date >= oneWeekAgo) {
        sections[2].data.push(notification);
      } else {
        sections[3].data.push(notification);
      }
    });
    
    // Remove empty sections
    return sections.filter(section => section.data.length > 0);
  };
  
  // Swipeable actions renderer
  const renderRightActions = (notificationId, progress, dragX) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.swipeActionsContainer}>
        {!notification.isRead && (
          <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity 
              style={[styles.swipeAction, styles.markReadAction]}
              onPress={() => handleMarkAsRead(notificationId)}
            >
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.swipeActionText}>Read</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity 
            style={[styles.swipeAction, styles.deleteAction]}
            onPress={() => handleDelete(notificationId)}
          >
            <Ionicons name="trash" size={24} color="white" />
            <Text style={styles.swipeActionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  
  // Notification item component with swipe actions and animation
  const NotificationItem = React.memo(({ item, index, section, isFirstRender }) => {
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const notificationColor = getNotificationColor(item.type);
    
    React.useEffect(() => {
      const delay = Math.min(index * 50, 300);
      
      if (isFirstRender) {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 250,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Don't animate items that are in view
        scaleAnim.setValue(1);
        fadeAnim.setValue(1);
      }
    }, []);
    
    return (
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Swipeable
          ref={ref => {
            if (ref && !rowRefs.has(item.id)) {
              rowRefs.set(item.id, ref);
            }
          }}
          renderRightActions={(progress, dragX) => 
            renderRightActions(item.id, progress, dragX)
          }
          rightThreshold={40}
        >
          <View 
            style={[
              styles.notificationCard,
              !item.isRead && styles.unreadNotification,
            ]}
          >
            <View style={styles.notificationMain}>
              <View 
                style={[
                  styles.iconContainer, 
                  { backgroundColor: notificationColor + '15' }
                ]}
              >
                <Ionicons 
                  name={getNotificationIcon(item.type)} 
                  size={22} 
                  color={notificationColor} 
                />
              </View>
              
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>
                  
                  <View style={styles.metaContainer}>
                    <View 
                      style={[
                        styles.typeBadge, 
                        { backgroundColor: notificationColor + '15' }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.typeText, 
                          { color: notificationColor }
                        ]}
                      >
                        {item.typeLabel}
                      </Text>
                    </View>
                    <Text style={styles.notificationTime}>
                      {formatTimeAgo(item.timestamp)}
                    </Text>
                  </View>
                </View>                <Text style={styles.notificationDescription}>
                  {item.description}
                </Text>



              </View>
            </View>
          </View>
        </Swipeable>
      </Animated.View>
    );
  });

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.title === 'Today' && section.data.some(item => !item.isRead) && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>
            {section.data.filter(item => !item.isRead).length} new
          </Text>
        </View>
      )}
    </View>
  );

  const renderItem = ({ item, index, section }) => {
    return (
      <NotificationItem 
        item={item} 
        index={index} 
        section={section}
        isFirstRender={!isLoading} 
      />
    );
  };
  
  const renderHeader = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    return (
      <View style={styles.listHeader}>
        <View style={styles.listHeaderTop}>
          <Text style={styles.listTitle}>Recent Notifications</Text>
          {unreadCount > 0 && !readAll && (
            <TouchableOpacity 
              style={styles.markAllReadButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllReadText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        
        
      </View>
    );
  };
  
  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <AppLayout hideBottomNav={true}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#6b4ce6", "#9d85f2"]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleGoBack}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchNotifications}>
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6b4ce6" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>            <SectionList
              sections={groupedNotifications}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={renderHeader}
              stickySectionHeadersEnabled={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              initialNumToRender={15}
              windowSize={5}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#6b4ce6']}
                  tintColor="#6b4ce6"
                  title="Refreshing..."
                  titleColor="#6b4ce6"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Image
                    source={{ uri: "https://api.a0.dev/assets/image?text=empty%20notifications%20inbox%20illustration&aspect=1:1" }}
                    style={styles.emptyImage}
                  />
                  <Text style={styles.emptyText}>No notifications</Text>
                  <Text style={styles.emptySubText}>
                    You're all caught up! Check back later for new notifications.
                  </Text>
                </View>
              }
            />
          </Animated.View>
        )}
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b4ce6',
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 20,
  },
  listHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  markAllReadButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0eafa',
    borderRadius: 16,
  },
  markAllReadText: {
    color: '#6b4ce6',
    fontWeight: '600',
    fontSize: 14,
  },
  unreadInfo: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    marginLeft: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#6b4ce6',
    borderRadius: 12,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  notificationMain: {
    flexDirection: 'row',
    padding: 16,
  },
  unreadNotification: {
    backgroundColor: '#f9f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6b4ce6',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6b4ce6',
    marginLeft: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  swipeActionsContainer: {
    flexDirection: 'row',
    width: 160,
    marginRight: -20,
  },
  swipeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  markReadAction: {
    backgroundColor: '#2ed573',
  },
  deleteAction: {
    backgroundColor: '#ff4757',
  },
  swipeActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default NotificationsScreen;