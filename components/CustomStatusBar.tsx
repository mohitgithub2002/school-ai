import React from 'react';
import { StatusBar, View, StyleSheet, Platform } from 'react-native';

interface CustomStatusBarProps {
  backgroundColor?: string;
  barStyle?: 'default' | 'light-content' | 'dark-content';
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

const CustomStatusBar: React.FC<CustomStatusBarProps> = ({ 
  backgroundColor = 'transparent', 
  barStyle = 'dark-content'
}) => {
  return (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <StatusBar
        translucent
        backgroundColor={backgroundColor}
        barStyle={barStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
    width: '100%',
  },
});

export default CustomStatusBar; 