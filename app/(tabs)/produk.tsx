import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebase";
import { useUserRole } from "../../hooks/useUserRole";

const PURPLE = "#534AB7";
const KATEGORI_LIST = ["Semua", "Kue Tart", "Cupcake", "Brownies", "Cookies", "Donat", "Lainnya"];

type Produk = {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  gambarUrl?: string;
  terjual?: number;
};

type SortType = "nama" | "terlaris" | "stok_sedikit";

export default function ProdukScreen() {
  const router = useRouter();
  const { role } = useUserRole();
  const isOwner = role === "admin1";

  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState<SortType>("nama");

  useEffect(() => {
    const q = query(collection(db, "produk"), orderBy("nama"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Produk));
      setProdukList(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getFilteredAndSorted = () => {
    let result = [...produkList];

    // Filter kategori
    if (kategoriFilter !== "Semua") {
      result = result.filter((p) => p.kategori === kategoriFilter);
    }

    // Sort
    if (sortBy === "terlaris") {
      result.sort((a, b) => (b.terjual || 0) - (a.terjual || 0));
    } else if (sortBy === "stok_sedikit") {
      result.sort((a, b) => a.stok - b.stok);
    } else {
      result.sort((a, b) => a.nama.localeCompare(b.nama));
    }

    return result;
  };

  const filteredList = getFilteredAndSorted();

  const renderItem = ({ item }: { item: Produk }) => {
    const menipis = item.stok <= 5;
    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/produk/${item.id}` as any)}>
        {item.gambarUrl ? (
          <Image source={{ uri: item.gambarUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={28} color="#ccc" />
          </View>
        )}
        {menipis && (
          <View style={styles.menipisBadge}>
            <Text style={styles.menipisBadgeText}>⚠️</Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.nama} numberOfLines={1}>{item.nama}</Text>
          <Text style={styles.kategori}>{item.kategori}</Text>
          <Text style={styles.harga}>Rp {item.harga?.toLocaleString("id-ID")}</Text>
          <View style={styles.bottomRow}>
            <Text style={[styles.stok, menipis && styles.stokMenipis]}>Stok: {item.stok}</Text>
            {(item.terjual ?? 0) > 0 && (
              <Text style={styles.terjual}>🔥 {item.terjual}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.title}>Produk</Text>
        <Text style={styles.count}>{filteredList.length} produk</Text>
      </View>

      {/* Sort buttons */}
      <View style={styles.sortRow}>
        {([
          { key: "nama", label: "A-Z", icon: "text" },
          { key: "terlaris", label: "Terlaris", icon: "flame" },
          { key: "stok_sedikit", label: "Stok Tipis", icon: "warning" },
        ] as { key: SortType; label: string; icon: any }[]).map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.sortBtn, sortBy === s.key && styles.sortBtnActive]}
            onPress={() => setSortBy(s.key)}
          >
            <Ionicons name={s.icon} size={13} color={sortBy === s.key ? "#fff" : "#666"} />
            <Text style={[styles.sortBtnText, sortBy === s.key && styles.sortBtnTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter kategori */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kategoriScroll}
      >
        {KATEGORI_LIST.map((k) => (
          <TouchableOpacity
            key={k}
            style={[styles.kategoriChip, kategoriFilter === k && styles.kategoriChipActive]}
            onPress={() => setKategoriFilter(k)}
          >
            <Text style={[styles.kategoriChipText, kategoriFilter === k && styles.kategoriChipTextActive]}>
              {k}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredList.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            {produkList.length === 0 ? "Belum ada produk" : "Tidak ada produk di kategori ini"}
          </Text>
          {isOwner && produkList.length === 0 && (
            <Text style={styles.emptySubtext}>Tap tombol + buat nambah produk pertama</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      )}

      {isOwner && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push("/produk/tambah" as any)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f4ff" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#1a1a2e" },
  count: { fontSize: 13, color: "#888" },
  sortRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 10 },
  sortBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "#fff",
  },
  sortBtnActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  sortBtnText: { fontSize: 12, color: "#666" },
  sortBtnTextActive: { color: "#fff", fontWeight: "600" },
  kategoriScroll: { paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  kategoriChip: {
    borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#fff",
  },
  kategoriChipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  kategoriChipText: { fontSize: 12, color: "#666" },
  kategoriChipTextActive: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#888", marginTop: 12, textAlign: "center" },
  emptySubtext: { fontSize: 13, color: "#aaa", marginTop: 4, textAlign: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { gap: 12 },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 16, marginBottom: 12, overflow: "hidden", position: "relative" },
  image: { width: "100%", height: 110, backgroundColor: "#f0f0f0" },
  imagePlaceholder: { justifyContent: "center", alignItems: "center" },
  menipisBadge: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "#ffe4e4", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
  },
  menipisBadgeText: { fontSize: 11 },
  cardInfo: { padding: 10 },
  nama: { fontSize: 14, fontWeight: "600", color: "#1a1a2e" },
  kategori: { fontSize: 11, color: "#999", marginTop: 2 },
  harga: { fontSize: 14, fontWeight: "700", color: PURPLE, marginTop: 4 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  stok: { fontSize: 11, color: "#666" },
  stokMenipis: { color: "#e0453c", fontWeight: "600" },
  terjual: { fontSize: 11, color: "#f9a825", fontWeight: "600" },
  fab: {
    position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: PURPLE, justifyContent: "center", alignItems: "center",
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
});