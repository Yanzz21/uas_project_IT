import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../config/firebase";

const PURPLE = "#534AB7";

export default function RefillScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const produkId = id as string;

  const [produk, setProduk] = useState<{ nama: string; kategori: string; stok: number } | null>(null);
  const [jumlah, setJumlah] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState<{ uid: string; nama: string } | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserInfo({ uid: user.uid, nama: snap.data().nama });
        }
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    const fetchProduk = async () => {
      if (!produkId) return;
      const snap = await getDoc(doc(db, "produk", produkId));
      if (snap.exists()) {
        const data = snap.data();
        setProduk({ nama: data.nama, kategori: data.kategori, stok: data.stok });
      } else {
        Alert.alert("Produk tidak ditemukan");
        router.replace("/(tabs)/stok" as any);
      }
      setLoading(false);
    };
    fetchProduk();
  }, [produkId]);

  const handleRefill = async () => {
    const jumlahNum = Number(jumlah);
    if (!jumlah || isNaN(jumlahNum) || jumlahNum <= 0) {
      Alert.alert("Oops!", "Jumlah refill harus angka lebih dari 0.");
      return;
    }

    const doRefill = async () => {
      setSaving(true);
      try {
        const stokSebelum = produk?.stok ?? 0;
        const stokSesudah = stokSebelum + jumlahNum;

        await updateDoc(doc(db, "produk", produkId), {
          stok: increment(jumlahNum),
        });

        await addDoc(collection(db, "refill"), {
          produk_id: produkId,
          produk_nama: produk?.nama,
          jumlah: jumlahNum,
          stok_sebelum: stokSebelum,
          stok_sesudah: stokSesudah,
          user_id: userInfo?.uid ?? "",
          user_nama: userInfo?.nama ?? "",
          tanggal: serverTimestamp(),
        });

        router.replace("/(tabs)/stok" as any);
      } catch (error) {
        console.error(error);
        Alert.alert("Gagal", "Refill gagal. Coba lagi.");
      } finally {
        setSaving(false);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Konfirmasi refill ${jumlahNum} unit untuk "${produk?.nama}"?\nStok: ${produk?.stok} → ${(produk?.stok ?? 0) + jumlahNum}`
      );
      if (confirmed) doRefill();
    } else {
      Alert.alert(
        "Konfirmasi Refill",
        `Tambah ${jumlahNum} unit stok untuk "${produk?.nama}"?\nStok: ${produk?.stok} → ${(produk?.stok ?? 0) + jumlahNum}`,
        [
          { text: "Batal", style: "cancel" },
          { text: "Konfirmasi", onPress: doRefill },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/stok" as any)}>
          <Ionicons name="arrow-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Input Refill</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.produkCard}>
          <View style={styles.produkCardLeft}>
            <Text style={styles.produkNama}>{produk?.nama}</Text>
            <Text style={styles.produkKategori}>{produk?.kategori}</Text>
          </View>
          <View style={styles.stokInfo}>
            <Text style={styles.stokLabel}>Stok sekarang</Text>
            <Text style={[styles.stokValue, (produk?.stok ?? 0) <= 5 && styles.stokMenipis]}>
              {produk?.stok}
            </Text>
          </View>
        </View>

        {jumlah !== "" && !isNaN(Number(jumlah)) && Number(jumlah) > 0 && (
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Stok setelah refill</Text>
            <Text style={styles.previewValue}>
              {produk?.stok} + {jumlah} ={" "}
              <Text style={styles.previewResult}>{(produk?.stok ?? 0) + Number(jumlah)}</Text>
            </Text>
          </View>
        )}

        <Text style={styles.label}>JUMLAH REFILL</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="add-circle-outline" size={20} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Contoh: 20"
            placeholderTextColor="#aaa"
            value={jumlah}
            onChangeText={setJumlah}
            keyboardType="numeric"
            autoFocus
          />
          <Text style={styles.inputSuffix}>unit</Text>
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, saving && styles.btnDisabled]}
          onPress={handleRefill}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Konfirmasi Refill</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          * Refill tercatat di riwayat dan stok langsung diperbarui.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f4ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#1a1a2e" },
  content: { padding: 20 },
  produkCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
  },
  produkCardLeft: { flex: 1 },
  produkNama: { fontSize: 16, fontWeight: "600", color: "#1a1a2e" },
  produkKategori: { fontSize: 12, color: "#999", marginTop: 4 },
  stokInfo: { alignItems: "center" },
  stokLabel: { fontSize: 11, color: "#888" },
  stokValue: { fontSize: 28, fontWeight: "700", color: "#4caf50" },
  stokMenipis: { color: "#e0453c" },
  previewCard: { backgroundColor: "#ece9fc", borderRadius: 12, padding: 12, marginBottom: 20 },
  previewLabel: { fontSize: 11, color: PURPLE, fontWeight: "600", marginBottom: 4 },
  previewValue: { fontSize: 15, color: "#1a1a2e" },
  previewResult: { fontWeight: "700", color: "#4caf50", fontSize: 18 },
  label: { fontSize: 11, fontWeight: "600", color: "#888", letterSpacing: 1, marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0e0e0",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 24,
  },
  input: { flex: 1, fontSize: 20, color: "#1a1a2e", fontWeight: "600" },
  inputSuffix: { fontSize: 14, color: "#aaa" },
  btnPrimary: {
    backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 15,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 8, marginBottom: 16,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  note: { fontSize: 12, color: "#aaa", textAlign: "center" },
});