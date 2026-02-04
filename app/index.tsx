import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const { user, session, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-primary text-lg">Loading...</Text>
      </View>
    );
  }

  // Not logged in - go to login
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Logged in but hasn't completed onboarding
  if (user && !user.onboarding_completed) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  // Fully onboarded - go to home
  return <Redirect href="/(tabs)/home" />;
}
