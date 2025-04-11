import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

// Define navigation type
type RootStackParamList = ParamListBase & {
  TeacherDashboard: undefined;
  TeacherClass: undefined;
  TeacherAllClasses: undefined;
  TeacherDiary: undefined;
  Profile: undefined;
};

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

const TeacherBottomNavBar = () => {
  const navigation = useNavigation<NavigationType>();
  const route = useRoute();  const currentScreen = route?.name || "";  // Define screens that are shown in the bottom nav
  const bottomNavScreens = ['TeacherDashboard', 'TeacherAllClasses', 'TeacherDiary', 'Profile'];
  
  // Check if current screen should show bottom nav
  const isBottomNavScreen = bottomNavScreens.includes(currentScreen);  // If current screen is not in bottom nav, we still want to highlight the parent screen
  const getActiveScreen = () => {
    // For screens that are accessible from specific tabs, we want to keep that tab active
    if (currentScreen === 'TeacherAttendance' || currentScreen === 'TeacherClass') {
      return 'TeacherAllClasses';
    }
    return currentScreen;
  };
  
  const activeScreen = getActiveScreen();

  // Helper for navigation with proper state preservation
  const navigateTo = (screenName: keyof RootStackParamList) => {
    // If we're already on this screen, don't navigate again (prevents flickering)
    if (screenName === currentScreen) return;
    
    // Navigate to the target screen
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.bottomNavContainer}>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => navigateTo('TeacherDashboard')}
      >
        <Ionicons name="home" size={24} color={activeScreen === 'TeacherDashboard' ? "#1e3c72" : "#999"} />
        <Text style={[styles.navText, activeScreen === 'TeacherDashboard' && styles.activeNavText]}>Home</Text>
      </TouchableOpacity>      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigateTo('TeacherAllClasses')}
      >
        <Ionicons name="people" size={24} color={activeScreen === 'TeacherAllClasses' ? "#1e3c72" : "#999"} />
        <Text style={[styles.navText, activeScreen === 'TeacherAllClasses' && styles.activeNavText]}>Classes</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigateTo('TeacherDiary')}
      >
        <Ionicons 
          name="book" 
          size={24} 
          color={activeScreen === 'TeacherDiary' ? "#1e3c72" : "#999"} 
        />
        <Text style={[styles.navText, activeScreen === 'TeacherDiary' && styles.activeNavText]}>Diary</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigateTo('Profile')}
      >
        <Ionicons 
          name="person" 
          size={24} 
          color={activeScreen === 'Profile' ? "#1e3c72" : "#999"} 
        />
        <Text style={[styles.navText, activeScreen === 'Profile' && styles.activeNavText]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  navText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  activeNavText: {
    color: "#1e3c72",
    fontWeight: "500",
  },
});

export default TeacherBottomNavBar;