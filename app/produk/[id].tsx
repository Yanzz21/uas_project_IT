import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/firebase";
import { useUserRole } from "../../hooks/useUserRole";

const PURPLE = "#534AB7";
const KATEGORI_LIST = ["Kue Tart", "Bolu", "Brownies", "Cookies", "Donat", "Lainnya"];

type Produk = {
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  gambarUrl?: string;
  terjual?: number;
};

export default function DetailProdukScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = id as string;
  const { role } = useUserRole();
  const isOwner = role === "admin1";

  const [produk, setProduk] = useState<Produk | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduk = async () => {
      if (!productId) return;
      const snap = await getDoc(doc(db, "produk", productId));
      if (snap.exists()) {
        const data = snap.data() as Produk;
        setProduk(data);
        setNama(data.nama);
        setKategori(data.kategori);
        setHarga(String(data.harga));
        setStok(String(data.stok));
        setImageUri(data.gambarUrl || null);
      } else {
        Alert.alert("Produk tidak ditemukan");
        router.replace("/(tabs)/produk" as any);
      }
      setLoading(false);
    };
    fetchProduk();
  }, [productId]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Izin diperlukan", "Aplikasi butuh akses galeri untuk pilih foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.4,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!nama || !harga || !stok) {
      Alert.alert("Oops!", "Nama, harga, dan stok wajib diisi.");
      return;
    }
    const hargaNum = Number(harga);
    const stokNum = Number(stok);
    if (isNaN(hargaNum) || isNaN(stokNum)) {
      Alert.alert("Oops!", "Harga dan stok harus berupa angka.");
      return;
    }

    setSaving(true);
    try {
      let gambarUrl = produk?.gambarUrl || "";

      // Kalau gambar diganti (bukan URL lama dan bukan base64 lama)
      if (imageUri && imageUri !== produk?.gambarUrl) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        gambarUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      await updateDoc(doc(db, "produk", productId), {
        nama,
        kategori,
        harga: hargaNum,
        stok: stokNum,
        gambarUrl,
      });

      setProduk({ ...produk!, nama, kategori, harga: hargaNum, stok: stokNum, gambarUrl });
      setIsEditing(false);
      Alert.alert("Berhasil", "Produk berhasil diperbarui.");
    } catch (error) {
      console.error(error);
      Alert.alert("Gagal", "Produk gagal diperbarui. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    const doDelete = async () => {
      try {
        await deleteDoc(doc(db, "produk", productId));
        router.replace("/(tabs)/produk" as any);
      } catch (error) {
        console.error(error);
        Alert.alert("Gagal", "Produk gagal dihapus.");
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Yakin mau hapus "${produk?.nama}"? Tindakan ini gak bisa dibatalin.`);
      if (confirmed) doDelete();
    } else {
      Alert.alert("Hapus Produk", `Yakin mau hapus "${produk?.nama}"? Tindakan ini gak bisa dibatalin.`, [
        { text: "Batal", style: "cancel" },
        { text: "Hapus", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  if (!produk) return null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/produk" as any)}>
          <Ionicons name="arrow-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Produk" : "Detail Produk"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.imagePicker} onPress={isEditing ? pickImage : undefined} activeOpacity={isEditing ? 0.7 : 1}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={[styles.previewImage, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={32} color="#aaa" />
            </View>
          )}
          {isEditing && (
            <View style={styles.editImageBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>NAMA PRODUK</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={nama} onChangeText={setNama} />
        ) : (
          <Text style={styles.viewValue}>{produk.nama}</Text>
        )}

        <Text style={styles.label}>KATEGORI</Text>
        {isEditing ? (
          <View style={styles.chipRow}>
            {KATEGORI_LIST.map((k) => (
              <TouchableOpacity key={k} style={[styles.chip, kategori === k && styles.chipActive]} onPress={() => setKategori(k)}>
                <Text style={[styles.chipText, kategori === k && styles.chipTextActive]}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.viewValue}>{produk.kategori}</Text>
        )}

        <Text style={styles.label}>HARGA (Rp)</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={harga} onChangeText={setHarga} keyboardType="numeric" />
        ) : (
          <Text style={styles.viewValuePrice}>Rp {produk.harga?.toLocaleString("id-ID")}</Text>
        )}

        <Text style={styles.label}>STOK</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={stok} onChangeText={setStok} keyboardType="numeric" />
        ) : (
          <Text style={[styles.viewValue, produk.stok <= 5 && styles.stokMenipis]}>
            {produk.stok} {produk.stok <= 5 && "(menipis)"}
          </Text>
        )}

        <Text style={styles.label}>TERJUAL</Text>
        <Text style={styles.viewValue}>{produk.terjual || 0} unit</Text>

        {isOwner && (
          <View style={styles.actionRow}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.btnSecondary}
                  onPress={() => {
                    setIsEditing(false);
                    setNama(produk.nama);
                    setKategori(produk.kategori);
                    setHarga(String(produk.harga));
                    setStok(String(produk.stok));
                    setImageUri(produk.gambarUrl || null);
                  }}
                >
                  <Text style={styles.btnSecondaryText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnPrimary, saving && styles.btnDisabled]} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Simpan</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.btnDanger} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={16} color="#e0453c" />
                  <Text style={styles.btnDangerText}>Hapus</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsEditing(true)}>
                  <Ionicons name="pencil-outline" size={16} color="#fff" />
                  <Text style={styles.btnPrimaryText}>Edit</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f4ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f4ff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#fff" },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#1a1a2e" },
  content: { padding: 20, paddingBottom: 60 },
  imagePicker: { alignSelf: "center", marginBottom: 24, position: "relative" },
  previewImage: { width: 140, height: 140, borderRadius: 16 },
  imagePlaceholder: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0e0e0", justifyContent: "center", alignItems: "center" },
  editImageBadge: { position: "absolute", bottom: 4, right: 4, backgroundColor: PURPLE, width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  label: { fontSize: 11, fontWeight: "600", color: "#888", letterSpacing: 1, marginBottom: 6, marginTop: 14 },
  viewValue: { fontSize: 16, color: "#1a1a2e", fontWeight: "500" },
  viewValuePrice: { fontSize: 18, color: PURPLE, fontWeight: "700" },
  stokMenipis: { color: "#e0453c", fontWeight: "700" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#333" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#fff" },
  chipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText: { fontSize: 12, color: "#666" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 32 },
  btnPrimary: { flex: 1, backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  btnSecondary: { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  btnSecondaryText: { color: "#666", fontWeight: "600", fontSize: 15 },
  btnDanger: { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0453c", borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  btnDangerText: { color: "#e0453c", fontWeight: "600", fontSize: 15 },
});