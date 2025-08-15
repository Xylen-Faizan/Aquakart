import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/src/design-system';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  // Show a loading indicator while we check the auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect to the home tab if the user is authenticated
  // The (tabs)/_layout.tsx will handle the tab navigation
  return <Redirect href="/(customer)/(tabs)/home" />;
}
