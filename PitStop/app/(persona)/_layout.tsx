import { Tabs } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

export default function PersonaLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Esto quita el header de arriba en todas las tabs
        tabBarShowLabel: false, // Opcional: oculta los nombres de las tabs para que solo queden los iconos
        tabBarStyle: { height: 60 }, // Ajusta la altura de la barra inferior si la quieres más pequeña
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="vehiculos" 
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="directions-car" size={size} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="alertas" 
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="user" size={size} color={color} />,
        }} 
      />
    </Tabs>
  );
}
