import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../config/firebase";

export default function RegisterScreen() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nama || !email || !password || !confirmPassword) {
      Alert.alert("Oops!", "Semua field wajib diisi.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Oops!", "Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Oops!", "Konfirmasi kata sandi tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        id_user: uid,
        nama,
        email,
        role: "admin2", // semua akun baru otomatis Staff; Owner di-set manual lewat Firestore Console
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      const err = error as { code?: string };
      let message = "Terjadi kesalahan. Silakan coba lagi.";
      if (err.code === "auth/email-already-in-use") message = "Email sudah terdaftar.";
      if (err.code === "auth/invalid-email") message = "Format email tidak valid.";
      if (err.code === "auth/weak-password") message = "Kata sandi terlalu lemah.";
      Alert.alert("Gagal Daftar", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🧁</Text>
          </View>
          <Text style={styles.appName}>toko kue Al rusdak</Text>
          <Text style={styles.tagline}>Buat akun baru</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Daftar akun</Text>

          <Text style={styles.label}>NAMA LENGKAP</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>👤</Text>
            <TextInput style={styles.input} placeholder="Nama kamu" placeholderTextColor="#aaa" value={nama} onChangeText={setNama} />
          </View>

          <Text style={styles.label}>EMAIL</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>✉️</Text>
            <TextInput style={styles.input} placeholder="contoh@email.com" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <Text style={styles.label}>KATA SANDI</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Minimal 6 karakter" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.icon}>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>KONFIRMASI KATA SANDI</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ulangi kata sandi" placeholderTextColor="#aaa" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
          </View>

          <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Daftar</Text>}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.registerLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PURPLE = "#534AB7";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f4ff" },
  scroll: { flexGrow: 1 },
  header: { backgroundColor: PURPLE, paddingTop: 60, paddingBottom: 32, alignItems: "center" },
  logoBox: { width: 72, height: 72, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoEmoji: { fontSize: 36 },
  appName: { color: "#fff", fontSize: 24, fontWeight: "600", marginBottom: 4 },
  tagline: { color: "rgba(255,255,255,0.75)", fontSize: 13 },
  card: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -16, flex: 1, padding: 24, paddingTop: 28 },
  title: { fontSize: 20, fontWeight: "600", color: "#1a1a2e", marginBottom: 20 },
  label: { fontSize: 11, fontWeight: "600", color: "#888", letterSpacing: 1, marginBottom: 6 },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#fafafa", marginBottom: 16, gap: 10 },
  icon: { fontSize: 16 },
  input: { fontSize: 15, color: "#333", flex: 1 },
  btnPrimary: { backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginBottom: 20 },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  registerRow: { flexDirection: "row", justifyContent: "center" },
  registerText: { fontSize: 14, color: "#888" },
  registerLink: { fontSize: 14, color: PURPLE, fontWeight: "600" },
});