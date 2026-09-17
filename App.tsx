import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { requestNotificationPermission } from './src/services/notificationService';
import { useBookingStore } from './src/store/useBookingStore';

export default function App() {
  const user = useBookingStore((state) => state.user);
  const initDatabaseSync = useBookingStore((state) => state.initDatabaseSync);

  useEffect(() => {
    // 1. Gracefully ask for notification permissions on app start if enabled
    if (user.notificationEnabled) {
      requestNotificationPermission();
    }

    // 2. Initialize SQLite Relational Database (vku_booking.db) & Supabase Cloud Sync
    initDatabaseSync();
  }, [user.notificationEnabled, initDatabaseSync]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
