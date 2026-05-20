import { Stack } from 'expo-router';

export default function ReflectLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="weekly"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="history" />
      <Stack.Screen name="[date]" />
    </Stack>
  );
}
