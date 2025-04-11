import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const logoOpacity = new Animated.Value(0);
  const titleOpacity = new Animated.Value(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete();
    }, 2000);

    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={['#6b4ce6', '#9d85f2']}
      style={styles.container}
    >
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
        <Image
          source={{ uri: "https://api.a0.dev/assets/image?text=school%20diary%20logo%20with%20books%20and%20pen&aspect=1:1&seed=123" }}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
        <Text style={styles.title}>Vivekananda Public School</Text>
        <Text style={styles.subtitle}>Your complete academic companion</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 25,
  },
  titleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: width > 350 ? 28 : 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SplashScreen;