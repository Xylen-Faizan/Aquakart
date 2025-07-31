import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { authService } from '@/lib/auth';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('Checking authentication status...');
        const user = await authService.getCurrentUser();
        console.log('Current user:', user);
        
        if (user?.id) {
          if (user.role) {
            console.log('Redirecting to role dashboard:', user.role);
          // User is authenticated, redirect to appropriate dashboard
          router.replace(`/(${user.role})` as any);
          } else {
            console.log('User has no role, redirecting to role selection');
            router.replace('/(auth)/role-selection');
          }
        } else {
          console.log('No authenticated user, redirecting to role selection');
          // User not authenticated, go to role selection
          router.replace('/(auth)/role-selection');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/(auth)/role-selection');
      }
    };

    checkAuthStatus();
  }, []);

  // Show loading indicator while redirecting
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}