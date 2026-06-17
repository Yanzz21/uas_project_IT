import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../config/firebase";

const PURPLE = "#534AB7";

export default function ProfilScreen() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email || "");
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setNama(snap.data().nama);
          setRole(snap.data().role);
        }
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Yakin mau keluar dari akun?");
      if (confirmed) signOut(auth);
    } else {
      Alert.alert("Keluar", "Yakin mau keluar dari akun?", [
        { text: "Batal", style: "cancel" },
        { text: "Keluar", style: "destructive", onPress: () => signOut(auth) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{nama ? nama[0].toUpperCase() : "?"}</Text>
      </View>
      <Text style={styles.nama}>{nama || "-"}</Text>
      <Text style={styles.email}>{email}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleBadgeText}>{role === "admin1" ? "Admin 1 (Owner)" : "Admin 2 (Staff)"}</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f4ff", alignItems: "center", paddingTop: 80, paddingHorizontal: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: PURPLE, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700" },
  nama: { fontSize: 18, fontWeight: "600", color: "#1a1a2e" },
  email: { fontSize: 13, color: "#888", marginTop: 4 },
  roleBadge: { backgroundColor: "#ece9fc", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 12 },
  roleBadgeText: { color: PURPLE, fontSize: 12, fontWeight: "600" },
  logoutBtn: { marginTop: 40, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0453c", borderRadius: 14, paddingVertical: 14, width: "100%", alignItems: "center" },
  logoutText: { color: "#e0453c", fontWeight: "600", fontSize: 15 },
});