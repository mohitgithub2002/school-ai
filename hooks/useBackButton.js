import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { navigateToParent } from '../utils/navigation';

/**
 * Custom hook to handle Android hardware back button
 * 
 * @param {object} navigation - Navigation object
 * @param {Function} [customHandler] - Optional custom handler to override default behavior
 */
const useBackButton = (navigation, customHandler = null) => {
  const route = useRoute();
  const currentScreen = route.name;
  
  // Use focus effect to handle back button only when screen is focused
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (customHandler) {
          // Use custom handler if provided
          return customHandler();
        }
        
        // Default behavior: navigate to parent screen
        navigateToParent(navigation, currentScreen);
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation, currentScreen, customHandler])
  );
};

export default useBackButton; 