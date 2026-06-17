import { StyleSheet, Text, View } from "react-native";

export default function StokScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Halaman Stok (segera dibangun)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f4ff", justifyContent: "center", alignItems: "center" },
  text: { color: "#888", fontSize: 14 },
});