import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../src/theme';

/**
 * Entry point - shows a loading screen while the root layout
 * determines which route group to display based on auth state.
 *
 * The actual routing logic is in _layout.tsx via useBootstrap hook:
 * - Unauthenticated / new user → /(onboarding)/problem
 *   (returning users tap "Sign in" link on that screen → /(auth)/login)
 * - Needs onboarding → /(onboarding)/problem
 * - Ready → /(tabs)
 */
export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
});
