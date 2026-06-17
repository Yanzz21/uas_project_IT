import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebase";
import { useUserRole } from "../../hooks/useUserRole";

const PURPLE = "#534AB7";

type Produk = {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  gambarUrl?: string;
  terjual?: number;
};

export default function ProdukScreen() {
  const router = useRouter();
  const { role } = useUserRole();
  const isOwner = role === "admin1";
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "produk"), orderBy("nama"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Produk));
      setProdukList(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const renderItem = ({ item }: { item: Produk }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/produk/${item.id}` as any)}>
      {item.gambarUrl ? (
        <Image source={{ uri: item.gambarUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={28} color="#ccc" />
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.nama} numberOfLines={1}>{item.nama}</Text>
        <Text style={styles.kategori}>{item.kategori}</Text>
        <Text style={styles.harga}>Rp {item.harga?.toLocaleString("id-ID")}</Text>
        <Text style={[styles.stok, item.stok <= 5 && styles.stokMenipis]}>Stok: {item.stok}</Text>
      </View>
    </TouchableOpacity>
  );

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
      </View>

      {produkList.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="cube-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Belum ada produk</Text>
          {isOwner && <Text style={styles.emptySubtext}>Tap tombol + buat nambah produk pertama</Text>}
        </View>
      ) : (
        <FlatList
          data={produkList}
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
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#1a1a2e" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#888", marginTop: 12 },
  emptySubtext: { fontSize: 13, color: "#aaa", marginTop: 4, textAlign: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { gap: 12 },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 16, marginBottom: 12, overflow: "hidden" },
  image: { width: "100%", height: 110, backgroundColor: "#f0f0f0" },
  imagePlaceholder: { justifyContent: "center", alignItems: "center" },
  cardInfo: { padding: 10 },
  nama: { fontSize: 14, fontWeight: "600", color: "#1a1a2e" },
  kategori: { fontSize: 11, color: "#999", marginTop: 2 },
  harga: { fontSize: 14, fontWeight: "700", color: PURPLE, marginTop: 4 },
  stok: { fontSize: 11, color: "#666", marginTop: 4 },
  stokMenipis: { color: "#e0453c", fontWeight: "600" },
  fab: {
    position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: PURPLE, justifyContent: "center", alignItems: "center",
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
});