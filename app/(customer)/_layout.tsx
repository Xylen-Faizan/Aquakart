import { Stack } from 'expo-router';
import { colors } from '@/src/design-system';

export default function CustomerLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
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
  );
}