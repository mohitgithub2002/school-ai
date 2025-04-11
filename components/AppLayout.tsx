import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from './BottomNavBar';
import TeacherBottomNavBar from './TeacherBottomNavBar';
import { useRoute } from '@react-navigation/native';
import CustomStatusBar from './CustomStatusBar';

interface AppLayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
  statusBarColor?: string;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  isTeacher?: boolean;
}

const AppLayout = ({ 
  children, 
  hideBottomNav,
  statusBarColor = '#6b4ce6',
  statusBarStyle = 'light-content',
  isTeacher = false
}: AppLayoutProps) => {
  const route = useRoute();
  const currentScreen = route.name;
  
  // Define screens that should have bottom navigation for students
  const studentBottomNavScreens = ['Dashboard', 'Home', 'Results', 'Profile'];  // Define screens that should have bottom navigation for teachers
  const teacherBottomNavScreens = ['TeacherDashboard', 'TeacherClass', 'TeacherDiary', 'Profile', 'TeacherAttendance', 'TeacherAllClasses'];
  
  // Check if the screen should have bottom navigation
  const isStudentNavScreen = studentBottomNavScreens.includes(currentScreen);
  const isTeacherNavScreen = teacherBottomNavScreens.includes(currentScreen);
  
  // Determine if we should show nav bar and which one
  const shouldShowStudentNav = !hideBottomNav && isStudentNavScreen && !isTeacher;
  const shouldShowTeacherNav = !hideBottomNav && isTeacherNavScreen && (isTeacher || currentScreen.startsWith('Teacher'));
  
  // Set the appropriate color based on user role
  const defaultStatusBarColor = isTeacher || currentScreen.startsWith('Teacher') ? '#1e3c72' : '#6b4ce6';

  return (
    <View style={styles.container}>
      <CustomStatusBar 
        backgroundColor={statusBarColor || defaultStatusBarColor} 
        barStyle={statusBarStyle} 
      />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <View style={[
          styles.content, 
          (shouldShowStudentNav || shouldShowTeacherNav) ? styles.contentWithNav : styles.contentWithoutNav
        ]}>
          {children}
        </View>
        {shouldShowStudentNav && <BottomNavBar />}
        {shouldShowTeacherNav && <TeacherBottomNavBar />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentWithNav: {
    paddingBottom: 70, // Space for bottom navigation
  },
  contentWithoutNav: {
    paddingBottom: 0, // No padding when bottom nav is hidden
  },
});

export default AppLayout;