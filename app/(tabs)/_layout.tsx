import { Tabs } from 'expo-router';
import { Home, Heart, ShoppingCart, User } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { colors } from '@/src/design-system';

export default function TabsLayout() {
  const { totalItems } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 5,
        },
      }}
      backBehavior="history"
    >
      <Tabs.Screen
        name="(customer)/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={28} />,
        }}
      />

      <Tabs.Screen
        name="(customer)/favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <Heart color={color} size={28} />,
        }}
      />
      
      <Tabs.Screen
        name="(customer)/orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <ShoppingCart color={color} size={28} />,
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
        }}
      />

      <Tabs.Screen
        name="(customer)/account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <User color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}
