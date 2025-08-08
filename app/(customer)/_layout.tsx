import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Home, ShoppingCart, Heart, User } from 'lucide-react-native';
import { authService } from '@/lib/auth';

// This is the main layout for the customer section
export default function CustomerLayout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check current user on initial load
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting user:', error);
        // Redirect to login if there's an error getting the user
        router.replace('/(auth)/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // If no user is logged in, don't render anything (will be redirected by the auth flow)
  if (!user) {
    return null;
  }

  // Define the tab bar items
  const tabBarItems = [
    {
      name: 'index',
      title: 'Home',
      icon: Home,
    },
    {
      name: 'orders',
      title: 'Orders',
      icon: ShoppingCart,
    },
    {
      name: 'favorites',
      title: 'Favorites',
      icon: Heart,
    },
    {
      name: 'account',
      title: 'Account',
      icon: User,
    },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          paddingTop: 8,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
      }}
    >
      {/* Only render the tabs we want to show */}
      {tabBarItems.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.title,
            tabBarIcon: ({ color }) => {
              const Icon = item.icon;
              return <Icon size={24} color={color} />;
            },
          }}
        />
      ))}
      
      {/* Hide all other screens from tab bar */}
      {['addresses', 'edit-profile', 'payment-methods', 'rate-us', 'refer-earn', 'subscription-plans', 'success', 'support'].map((name) => (
        <Tabs.Screen 
          key={name}
          name={name as any} 
          options={{ 
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' },
          }} 
        />
      ))}
    </Tabs>
  );
}
