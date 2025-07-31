import { Tabs } from 'expo-router';
import { Chrome as Home, ShoppingCart, User, MessageCircle, Heart } from 'lucide-react-native';

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="success"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="addresses"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="payment-methods"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="subscription-plans"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="refer-earn"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="rate-us"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}