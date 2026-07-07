import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { collection, doc, onSnapshot, orderBy, query, updateDoc, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../config/firebase";

const PURPLE = "#534AB7";

type Notifikasi = {
  id: string;
  produk_nama: string;
  stok: number;
  pesan: string;
  dibaca: boolean;
  createdAt: any;
};

export default function NotifikasiScreen() {
  const router = useRouter();
  const [notifList, setNotifList] = useState<Notifikasi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "notifikasi"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notifikasi));
      setNotifList(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, "notifikasi", id), { dibaca: true });
  };

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifList.filter((n) => !n.dibaca).forEach((n) => {
      batch.update(doc(db, "notifikasi", n.id), { dibaca: true });
    });
    await batch.commit();
  };

  const unreadCount = notifList.filter((n) => !n.dibaca).length;

  const renderItem = ({ item }: { item: Notifikasi }) => (
    <TouchableOpacity
      style={[styles.item, !item.dibaca && styles.itemUnread]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.iconBox}>
        <Ionicons name="warning" size={20} color="#e0453c" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemPesan}>{item.pesan}</Text>
        <Text style={styles.itemTime}>
          {item.createdAt?.toDate?.()?.toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          }) ?? "-"}
        </Text>
      </View>
      {!item.dibaca && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)" as any)}>
          <Ionicons name="arrow-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifikasi</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Tandai semua</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      ) : notifList.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Belum ada notifikasi</Text>
          <Text style={styles.emptySubtext}>Notifikasi muncul otomatis kalau ada stok menipis</Text>
        </View>
      ) : (
        <FlatList
          data={notifList}
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#fff",
  },
  title: { fontSize: 17, fontWeight: "600", color: "#1a1a2e" },
  markAllText: { fontSize: 13, color: PURPLE, fontWeight: "600" },
  list: { padding: 16 },
  item: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10,
  },
  itemUnread: { backgroundColor: "#fff8f8", borderLeftWidth: 3, borderLeftColor: "#e0453c" },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#ffe4e4", justifyContent: "center", alignItems: "center" },
  itemContent: { flex: 1 },
  itemPesan: { fontSize: 14, color: "#1a1a2e", fontWeight: "500" },
  itemTime: { fontSize: 11, color: "#999", marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#e0453c" },
  emptyText: { fontSize: 15, color: "#888", marginTop: 12, fontWeight: "600" },
  emptySubtext: { fontSize: 12, color: "#aaa", marginTop: 4, textAlign: "center" },
});