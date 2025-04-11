import React, { useState } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import SplashScreen from "./components/SplashScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import DashboardScreen from "./screens/DashboardScreen";
import HomeScreen from "./screens/HomeScreen";
import RoleSelectionScreen from "./screens/RoleSelectionScreen";
import StudentLoginScreen from "./screens/StudentLoginScreen";
import TeacherLoginScreen from "./screens/TeacherLoginScreen";
import SelectStudentProfileScreen from "./screens/SelectStudentProfileScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import ProfileScreen from "./screens/ProfileScreen";
import TeacherProfileScreen from "./screens/TeacherProfileScreen";
import ResultsScreen from "./screens/ResultsScreen";
import AnnouncementsScreen from "./screens/AnnouncementsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import TeacherDashboardScreen from "./screens/TeacherDashboardScreen";
import TeacherClassScreen from "./screens/TeacherClassScreen";
import TeacherAttendanceScreen from "./screens/TeacherAttendanceScreen";
import TeacherDiaryScreen from "./screens/TeacherDiaryScreen";
import TeacherAllClassesScreen from "./screens/TeacherAllClassesScreen";
import TeacherStudentDetailsScreen from "./screens/TeacherStudentDetailsScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const Stack = createNativeStackNavigator();

function AuthStack({ initialRouteName = "Login" }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="Login" component={StudentLoginScreen} />
      <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="SelectStudentProfile" component={SelectStudentProfileScreen} />
    </Stack.Navigator>
  );
}





function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="SelectStudentProfile" component={SelectStudentProfileScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function TeacherStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
      <Stack.Screen name="TeacherClass" component={TeacherClassScreen} />
      <Stack.Screen name="TeacherAttendance" component={TeacherAttendanceScreen} />
      <Stack.Screen name="TeacherDiary" component={TeacherDiaryScreen} />
      <Stack.Screen name="TeacherStudentDetails" component={TeacherStudentDetailsScreen} />
      <Stack.Screen name="TeacherAllClasses" component={TeacherAllClassesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Profile" component={TeacherProfileScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);  const { isAuthenticated, isLoading, userRole, availableProfiles } = useAuth();

  if (!isSplashComplete || isLoading) {
    return <SplashScreen onComplete={() => setIsSplashComplete(true)} />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        userRole === 'teacher' ? <TeacherStack /> : <StudentStack />
      ) : (        <AuthStack initialRouteName={availableProfiles && availableProfiles.length > 0 ? "SelectStudentProfile" : "Login"} />
      )}
    </NavigationContainer>
  );
}



export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider style={styles.container}>
        <Toaster />
        <AppContent />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  }
});