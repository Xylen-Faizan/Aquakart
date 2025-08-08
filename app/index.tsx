import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { authService } from '@/lib/auth';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await authService.getCurrentUser();
        
        if (user?.id && user.role) {
          // User is authenticated and has a role, redirect to their dashboard
          const rolePath = `/${user.role}` as const;
          router.replace(rolePath);
        } else if (user?.id && !user.role) {
          // User is authenticated but has no role, go to role selection
          router.replace('/(auth)/role-selection');
        }
        else {
          // User is not authenticated, start the auth flow
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/(auth)/login');
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
