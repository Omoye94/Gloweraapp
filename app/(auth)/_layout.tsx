import { Stack } from 'expo-router';
import { gloweraScreen, theme } from '../../src/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="login"
        options={{ contentStyle: { backgroundColor: '#140C20' }, animation: 'slide_from_right' }}
      />
      <Stack.Screen name="philosophy" />
      <Stack.Screen name="select-habits" />
      <Stack.Screen name="name-garden" />
    </Stack>
  );
}
