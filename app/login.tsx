import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../config/firebase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Oops!", "Email dan kata sandi tidak boleh kosong.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // navigasi otomatis ditangani oleh auth state listener di App.js
    } catch (error) {
  const err = error as { code?: string };
  let message = "Terjadi kesalahan. Silakan coba lagi.";
  if (err.code === "auth/user-not-found") message = "Akun tidak ditemukan.";
  if (err.code === "auth/wrong-password") message = "Kata sandi salah.";
  if (err.code === "auth/invalid-email") message = "Format email tidak valid.";
  Alert.alert("Gagal Masuk", message);
}
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🧁</Text>
          </View>
          <Text style={styles.appName}>Sweetly</Text>
          <Text style={styles.tagline}>Toko kue terbaik untuk kamu</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Masuk ke akun</Text>

          {/* Input Email */}
          <Text style={styles.label}>EMAIL</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>✉️</Text>
            <TextInput style={styles.input} placeholder="contoh@email.com" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          {/* Input Password */}
          <Text style={styles.label}>KATA SANDI</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="••••••••" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.icon}>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          {/* Lupa password */}
          <TouchableOpacity style={styles.forgotWrapper} onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgotText}>Lupa kata sandi?</Text>
          </TouchableOpacity>

          {/* Tombol Masuk */}
          <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Masuk</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity style={styles.btnGoogle}>
            <Text style={styles.btnGoogleText}>G Masuk dengan Google</Text>
          </TouchableOpacity>

          {/* Daftar */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Daftar</Text>
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

  header: {
    backgroundColor: PURPLE,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: "center",
  },
  logoBox: {
    width: 72,
    height: 72,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 36 },
  appName: { color: "#fff", fontSize: 24, fontWeight: "600", marginBottom: 4 },
  tagline: { color: "rgba(255,255,255,0.75)", fontSize: 13 },

  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    flex: 1,
    padding: 24,
    paddingTop: 28,
  },
  title: { fontSize: 20, fontWeight: "600", color: "#1a1a2e", marginBottom: 20 },

  label: { fontSize: 11, fontWeight: "600", color: "#888", letterSpacing: 1, marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fafafa",
    marginBottom: 16,
    gap: 10,
  },
  icon: { fontSize: 16 },
  input: { fontSize: 15, color: "#333", flex: 1 },

  forgotWrapper: { alignItems: "flex-end", marginBottom: 20, marginTop: -8 },
  forgotText: { fontSize: 13, color: PURPLE, fontWeight: "500" },

  btnPrimary: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#eee" },
  dividerText: { fontSize: 13, color: "#aaa" },

  btnGoogle: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  btnGoogleText: { fontSize: 15, fontWeight: "500", color: "#333" },

  registerRow: { flexDirection: "row", justifyContent: "center" },
  registerText: { fontSize: 14, color: "#888" },
  registerLink: { fontSize: 14, color: PURPLE, fontWeight: "600" },
});
