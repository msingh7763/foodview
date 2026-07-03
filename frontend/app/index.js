import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, Animated } from 'react-native';
import { useAuth } from '../context';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  const { loading } = useAuth();
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="star" size={64} color="#FFD700" />
        </Animated.View>
        <Text style={styles.appName}>Food Corner</Text>
        <Text style={styles.subtitle}>Smart Review & Sentiment Rating</Text>
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3E6C" />
        <Text style={styles.loadingText}>Loading App Context...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0C1D',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 20,
    letterSpacing: 1.5
  },
  subtitle: {
    color: '#8A89A6',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center'
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 60
  },
  loadingText: {
    color: '#8A89A6',
    fontSize: 14,
    marginTop: 15
  }
});
