import { Stack } from "expo-router";
import { SafeAreaProvider,SafeAreaView } from "react-native-safe-area-context";
import "../global.css"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="LogIn" options={{ headerShown: false }} />
          <Stack.Screen name="completeProfile" options={{ headerShown: false }} />
          <Stack.Screen name="CompleteProfileTaller" options={{ headerShown: false }} />
          <Stack.Screen name="CompleteProfilePersona" options={{ headerShown: false }} />
          <Stack.Screen name="olvidarContrasena" options={{ headerShown: false }} />
          <Stack.Screen name="(persona)" options={{ headerShown: false }} />
          <Stack.Screen name="(taller)" options={{ headerShown: false }} />
          <Stack.Screen name="EditarPerfilPersona" options={{ headerShown: false }} />
          <Stack.Screen name="agregarVehiculo" options={{ headerShown: false }} />
          <Stack.Screen name="EditarPerfilTaller" options={{ headerShown: false }} />
          <Stack.Screen name="DetalleTaller" options={{ headerShown: false }} />
       </Stack>
    </SafeAreaView>
  </SafeAreaProvider>
  )
}
