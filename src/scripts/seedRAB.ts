/**
 * ==========================================
 * SEED RAB (Rencana Anggaran Biaya)
 * ==========================================
 *
 * Script untuk membuat 1 dokumen RAB baru
 * agar bisa menguji alur sub-tahap di Flutter.
 *
 * Jalankan:
 *   npm run seed:rab
 *
 * Script ini akan:
 * 1. Mengecek apakah KoneksiData dengan ID yang ditentukan ada & APPROVED
 * 2. Hapus RAB lama (jika ada) untuk koneksi data tersebut
 * 3. Buat RAB baru dengan status PENDING (belum bayar)
 *
 * Setelah seed ini dijalankan, cekStatusPengajuan akan mengembalikan:
 *   subTahap = "MENUNGGU_PEMBAYARAN_RAB"
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { connectDB, disconnectDB } from "@/config/database";
import { Types } from "mongoose";
import { KoneksiData } from "@/models/KoneksiData";
import { RAB } from "@/models/RAB";
import { EnumPaymentStatus } from "@/enums";

// ==========================================
// KONFIGURASI
// ==========================================

const TARGET_KONEKSI_DATA_ID = "69db512cbc240cdee6d5431a";

// Data RAB untuk testing
const RAB_DATA = {
  totalBiaya: 750000,
  urlRab: null, // bisa diisi URL dokumen RAB jika ada
  catatan: "Biaya pemasangan pipa baru + meteran air",
};

// ==========================================

async function main() {
  console.log("==========================================");
  console.log("   SEED RAB (Rencana Anggaran Biaya)");
  console.log("==========================================\n");

  try {
    await connectDB();

    const koneksiDataId = new Types.ObjectId(TARGET_KONEKSI_DATA_ID);

    // ─── Cek KoneksiData ──────────────────────────────────────────────

    const koneksiData = await KoneksiData.findById(koneksiDataId);

    if (!koneksiData) {
      throw new Error(
        `KoneksiData dengan ID ${TARGET_KONEKSI_DATA_ID} tidak ditemukan!`,
      );
    }

    console.log(`✓ KoneksiData ditemukan`);
    console.log(`  ID        : ${koneksiData._id}`);
    console.log(`  Status    : ${koneksiData.StatusPengajuan}`);
    console.log(`  Pelanggan : ${koneksiData.IdPelanggan}`);

    if (koneksiData.StatusPengajuan !== "APPROVED") {
      console.log(
        `\n⚠ Status bukan APPROVED (${koneksiData.StatusPengajuan}).`,
      );
      console.log(`  RAB hanya relevan untuk pengajuan yang sudah APPROVED.`);
      console.log(`  Lanjut membuat RAB anyway untuk testing...\n`);
    }

    // ─── Hapus RAB lama ───────────────────────────────────────────────

    const existingRAB = await RAB.findOne({ idKoneksiData: koneksiDataId });

    if (existingRAB) {
      console.log(`\n⟳ RAB lama ditemukan, menghapus...`);
      console.log(`  ID lama       : ${existingRAB._id}`);
      console.log(`  Status lama   : ${existingRAB.statusPembayaran}`);
      console.log(
        `  Total lama    : Rp ${existingRAB.totalBiaya?.toLocaleString("id-ID") ?? 0}`,
      );
      await RAB.deleteOne({ _id: existingRAB._id });
      console.log(`  ✓ RAB lama dihapus`);
    }

    // ─── Buat RAB baru ────────────────────────────────────────────────

    const uniqueOrderId = `SEED-RAB-${TARGET_KONEKSI_DATA_ID}-${Date.now()}`;

    const newRAB = await RAB.create({
      idKoneksiData: koneksiDataId,
      totalBiaya: RAB_DATA.totalBiaya,
      statusPembayaran: EnumPaymentStatus.PENDING,
      orderId: uniqueOrderId,
      urlRab: RAB_DATA.urlRab,
      catatan: RAB_DATA.catatan,
    });

    console.log(`\n✓ RAB baru berhasil dibuat!`);
    console.log(`  ID            : ${newRAB._id}`);
    console.log(`  KoneksiData   : ${newRAB.idKoneksiData}`);
    console.log(
      `  Total Biaya   : Rp ${newRAB.totalBiaya?.toLocaleString("id-ID") ?? 0}`,
    );
    console.log(`  Status Bayar  : ${newRAB.statusPembayaran}`);
    console.log(`  Catatan       : ${newRAB.catatan ?? "-"}`);

    console.log(`\n──────────────────────────────────────────`);
    console.log(`  SubTahap seharusnya: MENUNGGU_PEMBAYARAN_RAB`);
    console.log(`  (karena RAB ada tapi belum dibayar)`);
    console.log(`──────────────────────────────────────────\n`);
  } catch (error: any) {
    console.error(`\n✗ Error: ${error.message}`);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
