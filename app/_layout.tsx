import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { CartProvider } from '@/contexts/CartContext';

// This component will handle the initial auth state and routing
function AuthLayout() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Function to update user and profile state
  const updateAuthState = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setProfile(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Error updating auth state:', error);
      setUser(null);
      setProfile(null);
      return null;
    } finally {
      if (!initialized) setInitialized(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check current user on initial load
    const initializeAuth = async () => {
      await updateAuthState();
      setInitialized(true);
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log('Auth state changed:', event);
        await updateAuthState();
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Don't run the effect until we've completed the initial auth check
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(customer)' || segments[0] === '(vendor)' || segments[0] === '(admin)';

    console.log('Auth state changed - User:', user ? 'Logged in' : 'Not logged in', 'Current route:', segments[0]);

    // If the user is not signed in and the current segment is not in the auth group
    if (!user) {
      if (!inAuthGroup) {
        console.log('Redirecting to login');
        router.replace('/(auth)/login');
      }
      return;
    }

    // If the user is signed in and the current segment is in the auth group
    if (inAuthGroup) {
      console.log('User is logged in, redirecting based on role:', user.role);
      // Redirect to the appropriate screen based on user role
      if (user.role === 'customer') {
        router.replace('/(customer)');
      } else if (user.role === 'vendor') {
        router.replace('/(vendor)');
      } else if (user.role === 'admin') {
        router.replace('/(admin)');
      } else {
        // If user has no role, redirect to role selection
        router.replace('/(auth)/role-selection');
      }
    }
  }, [user, initialized, segments]);

  // Show loading indicator while checking auth state
  if (loading || !initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <CartProvider>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(customer)" options={{ headerShown: false }} />
          <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </CartProvider>
  );
}

export default function RootLayout() {
  return <AuthLayout />;
}
