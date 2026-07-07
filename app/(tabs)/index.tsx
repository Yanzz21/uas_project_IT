import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../config/firebase";

const PURPLE = "#534AB7";

export default function HomeScreen() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [role, setRole] = useState("");
  const [totalProduk, setTotalProduk] = useState<number | null>(null);
  const [stokMenipis, setStokMenipis] = useState<number | null>(null);
  const [refillHariIni, setRefillHariIni] = useState<number | null>(null);
  const [produkTerlaris, setProdukTerlaris] = useState<string | null>(null);
  const [unreadNotif, setUnreadNotif] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setNama(snap.data().nama);
          setRole(snap.data().role);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "produk"), (snapshot) => {
      const produkList = snapshot.docs.map((d) => d.data());
      setTotalProduk(produkList.length);
      setStokMenipis(produkList.filter((p) => p.stok <= (p.stok_minimum ?? 5)).length);
      const sorted = [...produkList].sort((a, b) => (b.terjual || 0) - (a.terjual || 0));
      setProdukTerlaris(sorted.length > 0 && sorted[0].terjual > 0 ? sorted[0].nama : "-");
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchRefillHariIni = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const q = query(
        collection(db, "refill"),
        where("tanggal", ">=", today),
        where("tanggal", "<", tomorrow)
      );
      const snap = await getDocs(q);
      setRefillHariIni(snap.size);
    };
    fetchRefillHariIni();
  }, []);

  // Notif unread — real-time
  useEffect(() => {
    const q = query(collection(db, "notifikasi"), where("dibaca", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadNotif(snapshot.size);
    });
    return unsubscribe;
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()}, {nama || "Admin"} 👋</Text>
          <Text style={styles.subtitle}>Selamat datang kembali di Sweetly</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Bell icon */}
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push("/notifikasi" as any)}
          >
            <Ionicons name="notifications-outline" size={22} color={PURPLE} />
            {unreadNotif > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotif > 9 ? "9+" : unreadNotif}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{role === "admin1" ? "Owner" : "Staff"}</Text>
          </View>
        </View>
      </View>

      {/* Stat Cards */}
      <Text style={styles.sectionTitle}>Ringkasan</Text>
      <View style={styles.cardGrid}>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push("/(tabs)/produk" as any)}>
          <View style={[styles.iconBox, { backgroundColor: "#ece9fc" }]}>
            <Ionicons name="pricetags" size={20} color={PURPLE} />
          </View>
          <Text style={styles.statValue}>{totalProduk ?? "-"}</Text>
          <Text style={styles.statLabel}>Total Produk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, (stokMenipis ?? 0) > 0 && styles.statCardDanger]}
          onPress={() => router.push("/(tabs)/stok" as any)}
        >
          <View style={[styles.iconBox, { backgroundColor: (stokMenipis ?? 0) > 0 ? "#ffe4e4" : "#ece9fc" }]}>
            <Ionicons name="warning" size={20} color={(stokMenipis ?? 0) > 0 ? "#e0453c" : PURPLE} />
          </View>
          <Text style={[styles.statValue, (stokMenipis ?? 0) > 0 && styles.statValueDanger]}>
            {stokMenipis ?? "-"}
          </Text>
          <Text style={styles.statLabel}>Stok Menipis</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => router.push("/(tabs)/stok" as any)}>
          <View style={[styles.iconBox, { backgroundColor: "#e8f5e9" }]}>
            <Ionicons name="refresh" size={20} color="#4caf50" />
          </View>
          <Text style={styles.statValue}>{refillHariIni ?? "-"}</Text>
          <Text style={styles.statLabel}>Refill Hari Ini</Text>
        </TouchableOpacity>

        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: "#fff8e1" }]}>
            <Ionicons name="star" size={20} color="#f9a825" />
          </View>
          <Text style={[styles.statValue, styles.statValueSmall]} numberOfLines={1}>
            {produkTerlaris ?? "-"}
          </Text>
          <Text style={styles.statLabel}>Terlaris</Text>
        </View>
      </View>

      {/* Shortcut */}
      <Text style={styles.sectionTitle}>Menu Cepat</Text>
      <View style={styles.shortcutRow}>
        <TouchableOpacity style={styles.shortcutBtn} onPress={() => router.push("/(tabs)/stok" as any)}>
          <Ionicons name="cube" size={24} color={PURPLE} />
          <Text style={styles.shortcutText}>Cek Stok</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shortcutBtn} onPress={() => router.push("/(tabs)/produk" as any)}>
          <Ionicons name="pricetags" size={24} color={PURPLE} />
          <Text style={styles.shortcutText}>Produk</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shortcutBtn} onPress={() => router.push("/(tabs)/profil" as any)}>
          <Ionicons name="person" size={24} color={PURPLE} />
          <Text style={styles.shortcutText}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Alert banner stok menipis */}
      {(stokMenipis ?? 0) > 0 && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => router.push("/(tabs)/stok" as any)}
        >
          <Ionicons name="warning" size={18} color="#e0453c" />
          <Text style={styles.alertBannerText}>
            Ada {stokMenipis} produk dengan stok menipis — tap untuk cek
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#e0453c" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f4ff" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  greeting: { fontSize: 20, fontWeight: "700", color: "#1a1a2e" },
  subtitle: { fontSize: 13, color: "#888", marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  bellBtn: { width: 36, height: 36, backgroundColor: "#ece9fc", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  badge: {
    position: "absolute", top: -4, right: -4,
    backgroundColor: "#e0453c", borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: "center", alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  roleBadge: { backgroundColor: "#ece9fc", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  roleBadgeText: { color: PURPLE, fontSize: 12, fontWeight: "600" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#888", letterSpacing: 0.5, marginBottom: 12 },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  statCard: { width: "47%", backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "transparent" },
  statCardDanger: { borderColor: "#ffcdd2", backgroundColor: "#fff8f8" },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: "700", color: "#1a1a2e" },
  statValueDanger: { color: "#e0453c" },
  statValueSmall: { fontSize: 16, marginTop: 4 },
  statLabel: { fontSize: 12, color: "#888", marginTop: 4 },
  shortcutRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  shortcutBtn: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", gap: 8 },
  shortcutText: { fontSize: 12, fontWeight: "600", color: "#1a1a2e" },
  alertBanner: { backgroundColor: "#fff8f8", borderWidth: 1, borderColor: "#ffcdd2", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  alertBannerText: { flex: 1, fontSize: 13, color: "#e0453c", fontWeight: "500" },
});