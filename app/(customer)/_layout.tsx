import { Stack } from 'expo-router';
import { colors } from '@/src/design-system';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function CustomerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack 
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {/* This screen will render the tab navigator */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        
        {/* All other screens will be shown as modals/popups */}
        <Stack.Screen name="add-review" />
        <Stack.Screen name="addresses" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="payment-methods" />
        <Stack.Screen name="rate-us" />
        <Stack.Screen name="refer-earn" />
        <Stack.Screen name="subscription-plans" />
        <Stack.Screen name="success" />
        <Stack.Screen name="support" />
      </Stack>
    </GestureHandlerRootView>
  );
}