import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { CartProvider } from '@/contexts/CartContext';

// This is the main navigation component.
// It determines whether to show authentication screens or the main app screens.
function RootLayoutNav() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is not signed in and not in the auth group, redirect to login.
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // If the user is signed in and in the auth group, redirect to their dashboard.
      const role = (user.role === 'admin' || user.role === 'vendor') ? user.role : 'customer';
      // Redirect to the appropriate tab group
      const redirectPath = `/(tabs)/(${role})`;
      router.replace(redirectPath as any);
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading...</Text>
      </View>
    );
  }

  // This Stack navigator defines the main navigation groups of the app.
  // We use a Stack navigator to separate auth from the main app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

// The root layout component wraps the navigation with necessary providers.
export default function RootLayout() {
  return (
    <CartProvider>
      <RootLayoutNav />
    </CartProvider>
  );
}