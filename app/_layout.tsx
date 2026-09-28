import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/lib/auth';
import { DataProvider } from '@/lib/data';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <DataProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </DataProvider>
    </AuthProvider>
  );
}
