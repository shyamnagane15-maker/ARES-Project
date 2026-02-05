import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />      {/* Homepage */}
      <Stack.Screen name="register" />   {/* Atul's Page */}
      <Stack.Screen name="emergency" />  {/* The SOS Page */}
    </Stack>
  );
}