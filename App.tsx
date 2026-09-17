import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { requestNotificationPermission } from './src/services/notificationService';
import { useBookingStore } from './src/store/useBookingStore';

export default function App() {
  const user = useBookingStore((state) => state.user);

  useEffect(() => {
    // Gracefully ask for notification permissions on app start if enabled
    if (user.notificationEnabled) {
      requestNotificationPermission();
    }
  }, [user.notificationEnabled]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
