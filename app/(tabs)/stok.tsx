import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebase";

const PURPLE = "#534AB7";

type Produk = {
  id: string;
  nama: string;
  kategori: string;
  stok: number;
};

export default function StokScreen() {
  const router = useRouter();
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMenipis, setFilterMenipis] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "produk"), orderBy("stok"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Produk));
      setProdukList(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredList = filterMenipis ? produkList.filter((p) => p.stok <= 5) : produkList;
  const menipisCount = produkList.filter((p) => p.stok <= 5).length;

  const renderItem = ({ item }: { item: Produk }) => {
    const menipis = item.stok <= 5;
    return (
      <View style={[styles.item, menipis && styles.itemMenipis]}>
        <View style={styles.itemLeft}>
          <View style={[styles.stokBadge, menipis ? styles.stokBadgeMenipis : styles.stokBadgeOk]}>
            <Text style={[styles.stokBadgeText, menipis && styles.stokBadgeTextMenipis]}>
              {item.stok}
            </Text>
          </View>
          <View>
            <Text style={styles.itemNama} numberOfLines={1}>{item.nama}</Text>
            <Text style={styles.itemKategori}>{item.kategori}</Text>
            {menipis && <Text style={styles.menipisLabel}>⚠️ Stok menipis</Text>}
          </View>
        </View>
        <TouchableOpacity
          style={styles.refillBtn}
          onPress={() => router.push(`/refill/${item.id}` as any)}
        >
          <Ionicons name="add-circle" size={16} color="#fff" />
          <Text style={styles.refillBtnText}>Refill</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stok</Text>
        {menipisCount > 0 && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{menipisCount} menipis</Text>
          </View>
        )}
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, !filterMenipis && styles.filterBtnActive]}
          onPress={() => setFilterMenipis(false)}
        >
          <Text style={[styles.filterBtnText, !filterMenipis && styles.filterBtnTextActive]}>
            Semua ({produkList.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filterMenipis && styles.filterBtnActiveDanger]}
          onPress={() => setFilterMenipis(true)}
        >
          <Ionicons name="warning" size={13} color={filterMenipis ? "#fff" : "#e0453c"} />
          <Text style={[styles.filterBtnText, filterMenipis && styles.filterBtnTextActive]}>
            Menipis ({menipisCount})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredList.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#4caf50" />
          <Text style={styles.emptyText}>
            {filterMenipis ? "Semua stok aman! 🎉" : "Belum ada produk"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f4ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#1a1a2e" },
  alertBadge: { backgroundColor: "#ffe4e4", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  alertBadgeText: { fontSize: 12, color: "#e0453c", fontWeight: "600" },
  filterRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 12 },
  filterBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#fff",
  },
  filterBtnActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  filterBtnActiveDanger: { backgroundColor: "#e0453c", borderColor: "#e0453c" },
  filterBtnText: { fontSize: 12, color: "#666" },
  filterBtnTextActive: { color: "#fff", fontWeight: "600" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  item: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: "transparent",
  },
  itemMenipis: { borderColor: "#ffcdd2", backgroundColor: "#fff8f8" },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  stokBadge: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  stokBadgeOk: { backgroundColor: "#e8f5e9" },
  stokBadgeMenipis: { backgroundColor: "#ffe4e4" },
  stokBadgeText: { fontSize: 18, fontWeight: "700", color: "#4caf50" },
  stokBadgeTextMenipis: { color: "#e0453c" },
  itemNama: { fontSize: 14, fontWeight: "600", color: "#1a1a2e", maxWidth: 160 },
  itemKategori: { fontSize: 11, color: "#999", marginTop: 2 },
  menipisLabel: { fontSize: 11, color: "#e0453c", fontWeight: "500", marginTop: 2 },
  refillBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: PURPLE, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  refillBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#888", marginTop: 12 },
});