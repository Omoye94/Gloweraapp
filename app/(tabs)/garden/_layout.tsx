import { Stack } from 'expo-router';

export default function GardenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="points-guide"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
