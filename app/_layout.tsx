import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/contexts/AuthContext'; // Import AuthProvider and useAuth
import { CartProvider } from '@/contexts/CartContext';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/src/design-system';

// This component handles the navigation logic
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is loaded
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is not signed in and not in the auth group, redirect to login
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } 
    // If the user is signed in and in the auth group, redirect to the main app
    else if (user && inAuthGroup) {
      const role = (user.role === 'admin' || user.role === 'vendor') ? user.role : 'customer';
      const redirectPath = `/${role === 'admin' ? '(admin)' : role === 'vendor' ? '(vendor)' : '(customer)'}`;
      router.replace(redirectPath as any);
    }
  }, [user, loading, segments, router]);

  // Show a loading indicator while we check for a user
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen 
        name="(customer)" 
        options={{
          // This ensures the tab bar is shown for customer routes
          headerShown: false,
        }}
      />
      <Stack.Screen name="(vendor)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

// The main export that wraps our entire app in the necessary Providers
export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootLayoutNav />
      </CartProvider>
    </AuthProvider>
  );
}