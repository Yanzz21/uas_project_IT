import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { auth, db } from "../../config/firebase";

const PURPLE = "#534AB7";

export default function HomeScreen() {
  const [nama, setNama] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setNama(snap.data().nama);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Halo, {nama || "Admin"} 👋</Text>
      <Text style={styles.subtitle}>Selamat datang kembali di Sweetly</Text>

      <View style={styles.cardRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>Total Produk</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>Stok Menipis</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f4ff" },
  content: { padding: 20, paddingTop: 60 },
  greeting: { fontSize: 22, fontWeight: "700", color: "#1a1a2e" },
  subtitle: { fontSize: 14, color: "#888", marginTop: 4, marginBottom: 24 },
  cardRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 18, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "700", color: PURPLE },
  statLabel: { fontSize: 12, color: "#888", marginTop: 4, textAlign: "center" },
});