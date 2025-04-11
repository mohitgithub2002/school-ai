import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppLayout from '../components/AppLayout';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import useBackButton from '../hooks/useBackButton';

// Define types
type RootStackParamList = ParamListBase & {
  Dashboard: undefined;
  Announcements: undefined;
  // Add other screens as needed
};

type AnnouncementsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Announcements'>;

interface AnnouncementsScreenProps {
  navigation: AnnouncementsScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'Announcements'>;
}

interface Announcement {
  id?: string | number;
  announcement_id?: string | number;
  title: string;
  description: string;
  priority: string;
  date: string;
  type: string;
  displayDate?: string;
}

interface MonthHeader {
  type: 'monthHeader';
  monthYear: string;
}

type ListItem = Announcement | MonthHeader;

// Use a type guard to check if an item is a MonthHeader
function isMonthHeader(item: ListItem): item is MonthHeader {
  return (item as MonthHeader).type === 'monthHeader';
}

const AnnouncementsScreen = ({ navigation }: AnnouncementsScreenProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const itemsPerPage = 20;
  
  // Use our improved hook with just the navigation object
  useBackButton(navigation);
  
  // Define handleGoBack for the UI back button
  const handleGoBack = () => {
    navigation.navigate('Dashboard');
  };
  
  useEffect(() => {
    fetchAnnouncements();
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

  const fetchAnnouncements = async (forceRefresh = false) => {
    setIsLoading(true);
    const CACHE_KEY = "announcementsCache";
    const now = Date.now();
    try {
      const cacheString = await AsyncStorage.getItem(CACHE_KEY);
      let cachedData = cacheString ? JSON.parse(cacheString) : null;
      if (!forceRefresh && cachedData && (now - cachedData.timestamp < 24 * 60 * 60 * 1000)) {
        setAnnouncements(cachedData.data);
        setHasMoreData(cachedData.pagination.hasNextPage);
        setCurrentPage(cachedData.pagination.currentPage);
        setIsLoading(false);
        return;
      }
      
      const authService = await import('../services/authService');
      const token = await authService.getToken();
      const response = await fetch(`https://vps-vert.vercel.app/api/announcements?page=1&pageSize=${itemsPerPage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      let data;
      try {
        data = await response.json();
      } catch (err) {
        const responseClone = response.clone();
        const textData = await responseClone.text();
        console.error("JSON parse error:", textData);
        throw new Error(`JSON Parse error: ${textData}`);
      }
      if (response.ok && data.success) {
        setAnnouncements(data.data);
        setHasMoreData(data.pagination.hasNextPage);
        setCurrentPage(data.pagination.currentPage);
        const cacheValue = {
          timestamp: now,
          data: data.data,
          pagination: data.pagination,
        };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheValue));
      } else {
        console.error("Error fetching announcements:", data.message);
      }
    } catch (error) {
      console.error("Fetch announcements error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoreAnnouncements = React.useCallback(async () => {
    if (isLoadingMore || !hasMoreData) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const token = await (await import('../services/authService')).getToken();
      const response = await fetch(`https://vps-vert.vercel.app/api/announcements?page=${nextPage}&pageSize=${itemsPerPage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      let data;
      try {
        data = await response.json();
      } catch (err) {
        const responseClone = response.clone();
        const textData = await responseClone.text();
        console.error("JSON parse error:", textData);
        throw new Error(`JSON Parse error: ${textData}`);
      }
      if(response.ok && data.success) {
        setAnnouncements(prev => [...prev, ...data.data]);
        setHasMoreData(data.pagination.hasNextPage);
        setCurrentPage(data.pagination.currentPage);
      } else {
        console.error("Error fetching more announcements:", data.message);
      }
    } catch (error) {
      console.error("Fetch more announcement API error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMoreData, isLoadingMore, itemsPerPage]);
  
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "#ff4757";
      case "medium":
        return "#ffa502";
      case "low":
        return "#2ed573";
      default:
        return "#999";
    }
  };
  
  const getAnnouncementIcon = (type: string): any => {
    // Return valid MaterialIcons names with type assertion
    switch (type) {
      case 'event':
        return 'event';
      case 'news':
        return 'campaign';
      case 'reminder':
        return 'notifications-important';
      case 'notice':
        return 'announcement';
      case 'calendar':
        return 'event-note';
      default:
        return 'info';
    }
  };

  interface AnnouncementItemProps {
    item: Announcement;
    index: number;
    isLoading: boolean;
  }

  const AnnouncementItem = React.memo(({ item, index, isLoading }: AnnouncementItemProps) => {
    const staggerDelay = React.useMemo(() => {
      return index < itemsPerPage ? index * 50 : 0;
    }, [index]);
    
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const itemFadeAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      if (!isLoading) {
        if (index >= itemsPerPage) {
          scaleAnim.setValue(1);
          itemFadeAnim.setValue(1);
          return;
        }
        
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 250,
            delay: staggerDelay,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(itemFadeAnim, {
            toValue: 1,
            duration: 300,
            delay: staggerDelay,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [isLoading, staggerDelay, index]);
    
    return (
      <Animated.View 
        style={[
          {
            opacity: itemFadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.announcementCard}>
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
          
          <View style={styles.announcementContent}>
            <View style={styles.cardHeader}>
              <View style={styles.typeContainer}>
                <View style={styles.iconContainer}>
                  <MaterialIcons 
                    name={getAnnouncementIcon(item.type) as any} 
                    size={18} 
                    color="#6b4ce6" 
                  />
                </View>
                <Text style={styles.announcementDate}>
                {item.displayDate}
              </Text>
              </View>
            </View>
            
            <Text style={styles.announcementTitle}>{item.title}</Text>
            <Text style={styles.announcementDescription}>{item.description}</Text>
            
            <View style={styles.cardFooter}>
              <View 
                style={[
                  styles.priorityBadge, 
                  { backgroundColor: getPriorityColor(item.priority) + '15' }
                ]}
              >
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                  {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                </Text>
              </View>
              
              <TouchableOpacity style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>Read more</Text>
                <Ionicons name="chevron-forward" size={14} color="#6b4ce6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  });
  
  const renderAnnouncementItem = (props: any) => {
    return <AnnouncementItem {...props} isLoading={isLoading} />;
  };
  
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#6b4ce6" />
        <Text style={styles.loadingMoreText}>Loading more announcements...</Text>
      </View>
    );
  };

  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  const groupAnnouncementsByMonth = (announcements: Announcement[]): ListItem[] => {
    const grouped: Record<string, Announcement[]> = announcements.reduce((acc: Record<string, Announcement[]>, announcement: Announcement) => {
      const date = new Date(announcement.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      
      const announcementWithFormattedDate = {
        ...announcement,
        displayDate: formatDisplayDate(announcement.date)
      };
      
      acc[monthYear].push(announcementWithFormattedDate);
      return acc;
    }, {});

    return Object.entries(grouped).map(([monthYear, items]) => ({
      monthYear,
      data: items,
      type: 'month'
    })).reduce<ListItem[]>((acc, month: any) => {
      return [...acc, { type: 'monthHeader', monthYear: month.monthYear } as MonthHeader, ...month.data];
    }, []);
  };

  const renderHeader = () => {
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>All Announcements</Text>
      </View>
    );
  };

  const renderMonthHeader = (monthYear: string) => {
    return (
      <View style={styles.monthHeaderContainer}>
        <View style={styles.monthDividerLeft} />
        <Text style={styles.monthHeaderText}>{monthYear}</Text>
        <View style={styles.monthDividerRight} />
      </View>
    );
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    if (isMonthHeader(item)) {
      return renderMonthHeader(item.monthYear);
    }
    
    // Now TypeScript knows this is an Announcement type
    return renderAnnouncementItem({ 
      item, 
      index: typeof item.id === 'number' ? item.id : 0, 
      isLoading 
    });
  };

  return (
    <AppLayout hideBottomNav={true}>
      <View style={styles.container}>
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
            <Text style={styles.headerTitle}>Announcements</Text>
            <TouchableOpacity style={styles.headerRight} onPress={() => fetchAnnouncements(true)}>
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6b4ce6" />
            <Text style={styles.loadingText}>Loading announcements...</Text>
          </View>
        ) : (
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <FlatList
              data={groupAnnouncementsByMonth(announcements)}
              renderItem={renderItem}
              keyExtractor={item => {
                if (isMonthHeader(item)) {
                  return item.monthYear;
                }
                // Using a non-null assertion here since we're checking for existence
                return ((item.id || item.announcement_id) ? 
                  (item.id || item.announcement_id)!.toString() : 
                  Math.random().toString());
              }}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={renderHeader}
              ListFooterComponent={renderFooter}
              onEndReached={hasMoreData ? fetchMoreAnnouncements : null}
              onEndReachedThreshold={0.5}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={itemsPerPage}
              windowSize={5}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Image
                    source={{ uri: "https://api.a0.dev/assets/image?text=empty%20notifications%20inbox%20illustration&aspect=1:1" }}
                    style={styles.emptyImage}
                  />
                  <Text style={styles.emptyText}>No announcements found</Text>
                  <Text style={styles.emptySubText}>
                    Check back later for school announcements
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
  monthHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    monthHeaderText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#666',
      marginHorizontal: 12,
    },    monthDividerLeft: {
      flex: 1,
      height: 1,
      backgroundColor: '#e0e0e0',
      marginRight: 12,
    },
    monthDividerRight: {
      flex: 1,
      height: 1,
      backgroundColor: '#e0e0e0',
      marginLeft: 12,
    },
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
  },  headerRight: {
    width: 40,
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
    paddingTop: 0,
    paddingBottom: 100,
  },
  listHeader: {
    marginTop: 16,
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  announcementCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  priorityIndicator: {
    width: 6,
  },
  announcementContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0eafa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  announcementTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  announcementDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b4ce6',
    marginRight: 2,
  },
  loaderFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 10,
    color: '#6b4ce6',
    fontSize: 14,
    fontWeight: '500',
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

export default AnnouncementsScreen;