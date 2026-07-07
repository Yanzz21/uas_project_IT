import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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

export default function TambahProdukScreen() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState(KATEGORI_LIST[0]);
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && role !== "admin1") {
      Alert.alert("Akses Ditolak", "Cuma Owner yang bisa menambah produk.");
      router.back();
    }
  }, [role, roleLoading]);

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
      let gambarUrl = "";
      if (imageUri) {
        // Convert ke base64 — disimpan langsung ke Firestore, tanpa Firebase Storage
        const response = await fetch(imageUri);
        const blob = await response.blob();
        gambarUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      await addDoc(collection(db, "produk"), {
        nama,
        kategori,
        harga: hargaNum,
        stok: stokNum,
        gambarUrl,
        terjual: 0,
        createdAt: serverTimestamp(),
      });

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Gagal", "Produk gagal disimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Produk</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={32} color="#aaa" />
              <Text style={styles.imagePlaceholderText}>Pilih foto produk</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>NAMA PRODUK</Text>
        <TextInput style={styles.input} placeholder="Contoh: Brownies Cokelat" placeholderTextColor="#aaa" value={nama} onChangeText={setNama} />

        <Text style={styles.label}>KATEGORI</Text>
        <View style={styles.chipRow}>
          {KATEGORI_LIST.map((k) => (
            <TouchableOpacity key={k} style={[styles.chip, kategori === k && styles.chipActive]} onPress={() => setKategori(k)}>
              <Text style={[styles.chipText, kategori === k && styles.chipTextActive]}>{k}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>HARGA (Rp)</Text>
        <TextInput style={styles.input} placeholder="15000" placeholderTextColor="#aaa" value={harga} onChangeText={setHarga} keyboardType="numeric" />

        <Text style={styles.label}>STOK</Text>
        <TextInput style={styles.input} placeholder="20" placeholderTextColor="#aaa" value={stok} onChangeText={setStok} keyboardType="numeric" />

        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Simpan Produk</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f4ff" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#1a1a2e" },
  content: { padding: 20, paddingBottom: 60 },
  imagePicker: { alignSelf: "center", marginBottom: 24 },
  previewImage: { width: 140, height: 140, borderRadius: 16 },
  imagePlaceholder: {
    width: 140, height: 140, borderRadius: 16, backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#e0e0e0", borderStyle: "dashed",
    justifyContent: "center", alignItems: "center", gap: 6,
  },
  imagePlaceholderText: { fontSize: 12, color: "#aaa" },
  label: { fontSize: 11, fontWeight: "600", color: "#888", letterSpacing: 1, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#333",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#fff" },
  chipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText: { fontSize: 12, color: "#666" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  saveBtn: { backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 28 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});