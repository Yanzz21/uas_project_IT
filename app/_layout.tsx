import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth } from "../config/firebase";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;
    const isAuthScreen = segments[0] === "login" || segments[0] === "register";

    if (!user && !isAuthScreen) {
      router.replace("/login");
    } else if (user && isAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#534AB7" />
      </View>
    );
  }

  return (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="login" />
    <Stack.Screen name="register" />
    <Stack.Screen name="notifikasi" />   {/* ← tambah ini */}
    <Stack.Screen name="produk" />
    <Stack.Screen name="refill" />
  </Stack>
);
}