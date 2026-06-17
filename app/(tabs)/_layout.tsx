import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

const PURPLE = "#534AB7";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PURPLE,
        tabBarInactiveTintColor: "#aaa",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="stok" options={{ title: "Stok", tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} /> }} />
      <Tabs.Screen name="produk" options={{ title: "Produk", tabBarIcon: ({ color, size }) => <Ionicons name="pricetags" size={size} color={color} /> }} />
      <Tabs.Screen name="profil" options={{ title: "Profil", tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}