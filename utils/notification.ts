import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export const createNotifStokMenipis = async (
  produkId: string,
  produkNama: string,
  stok: number
) => {
  if (stok <= 5) {
    await addDoc(collection(db, "notifikasi"), {
      produk_id: produkId,
      produk_nama: produkNama,
      stok,
      pesan: `Stok "${produkNama}" tersisa ${stok} unit — segera lakukan refill.`,
      dibaca: false,
      createdAt: serverTimestamp(),
    });
  }
};