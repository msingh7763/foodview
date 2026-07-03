import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D0C1D' },
          animation: 'fade_from_bottom'
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </AuthProvider>
  );
}
