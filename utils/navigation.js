 /**
 * Navigation utility functions
 */

/**
 * Determines the parent screen for any given secondary screen
 * @param {string} screenName - Current screen name
 * @returns {string} Parent screen name for navigation
 */
export const getParentScreen = (screenName) => {
  const navigationMap = {
    // Screens accessible from Dashboard
    'Announcements': 'Dashboard',
    'Notifications': 'Dashboard',
    
    // Add other secondary screens and their parents as needed
    // Example:
    // 'ExamDetails': 'Results',
    // 'StudentProfile': 'Profile',
  };
  
  // Return the parent screen if defined, otherwise return Dashboard as default
  return navigationMap[screenName] || 'Dashboard';
};

/**
 * Safely navigate back to parent screen
 * @param {object} navigation - Navigation object
 * @param {string} currentScreen - Current screen name
 */
export const navigateToParent = (navigation, currentScreen) => {
  const parentScreen = getParentScreen(currentScreen);
  navigation.navigate(parentScreen);
}; 