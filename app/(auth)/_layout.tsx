import { Stack } from 'expo-router';

/**
 * Defines the navigation stack for the authentication flow.
 * All screens within the (auth) group will share this layout.
 * The `screenOptions={{ headerShown: false }}` hides the header for all auth screens.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The order here defines the navigation hierarchy but not the initial route.
        The initial route is determined by the entry point logic in app/index.tsx.
        We are setting up all possible screens in the auth flow.
      */}
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
