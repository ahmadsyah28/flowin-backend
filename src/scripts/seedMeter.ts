/**
 * ==========================================
 * SEED METER (Meteran Air)
 * ==========================================
 *
 * Script untuk membuat 1 dokumen Meter baru
 * agar bisa menguji sub-tahap AKTIF di Flutter.
 *
 * Jalankan:
 *   npm run seed:meter
 *
 * Script ini akan:
 * 1. Mengecek apakah KoneksiData dengan ID yang ditentukan ada & APPROVED
 * 2. Hapus Meter lama (jika ada) untuk koneksi data tersebut
 * 3. Ambil KelompokPelanggan yang ditentukan
 * 4. Buat Meter baru
 *
 * Setelah seed ini dijalankan, cekStatusPengajuan akan mengembalikan:
 *   subTahap = "AKTIF"
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { connectDB, disconnectDB } from "@/config/database";
import { Types } from "mongoose";
import { KoneksiData } from "@/models/KoneksiData";
import { Meter } from "@/models/Meter";
import { KelompokPelanggan, KodeKelompok } from "@/models/KelompokPelanggan";

// ==========================================
// KONFIGURASI
// ==========================================

const TARGET_KONEKSI_DATA_ID = "69db512cbc240cdee6d5431a";

// Kelompok pelanggan yang akan ditetapkan
const TARGET_KODE_KELOMPOK = KodeKelompok.RUMAH_TANGGA_A;

// Data Meter untuk testing
const METER_DATA = {
  NomorMeteran: `MTR-${Date.now()}`,
  NomorAkun: `AKN-${Date.now()}`,
};

// ==========================================

async function main() {
  console.log("==========================================");
  console.log("   SEED METER (Meteran Air)");
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
      console.log(`  Meter hanya relevan untuk pengajuan yang sudah APPROVED.`);
      console.log(`  Lanjut membuat Meter anyway untuk testing...\n`);
    }

    // ─── Cari KelompokPelanggan ───────────────────────────────────────

    const kelompok = await KelompokPelanggan.findOne({
      KodeKelompok: TARGET_KODE_KELOMPOK,
    });

    if (!kelompok) {
      throw new Error(
        `KelompokPelanggan "${TARGET_KODE_KELOMPOK}" tidak ditemukan! Jalankan seed:kelompok terlebih dahulu.`,
      );
    }

    console.log(`\n✓ KelompokPelanggan ditemukan`);
    console.log(`  Kode      : ${kelompok.KodeKelompok}`);
    console.log(`  Nama      : ${kelompok.NamaKelompok}`);
    console.log(`  Kategori  : ${kelompok.Kategori}`);

    // ─── Hapus Meter lama ─────────────────────────────────────────────

    const existingMeter = await Meter.findOne({
      IdKoneksiData: koneksiDataId,
    });

    if (existingMeter) {
      console.log(`\n⟳ Meter lama ditemukan, menghapus...`);
      console.log(`  ID lama         : ${existingMeter._id}`);
      console.log(`  Nomor lama      : ${existingMeter.NomorMeteran}`);
      console.log(`  Akun lama       : ${existingMeter.NomorAkun}`);
      await Meter.deleteOne({ _id: existingMeter._id });
      console.log(`  ✓ Meter lama dihapus`);
    }

    // ─── Buat Meter baru ──────────────────────────────────────────────

    const newMeter = await Meter.create({
      IdKelompokPelanggan: kelompok._id,
      IdKoneksiData: koneksiDataId,
      NomorMeteran: METER_DATA.NomorMeteran,
      NomorAkun: METER_DATA.NomorAkun,
    });

    console.log(`\n✓ Meter baru berhasil dibuat!`);
    console.log(`  ID              : ${newMeter._id}`);
    console.log(`  KoneksiData     : ${newMeter.IdKoneksiData}`);
    console.log(
      `  Kelompok        : ${kelompok.KodeKelompok} - ${kelompok.NamaKelompok}`,
    );
    console.log(`  Nomor Meteran   : ${newMeter.NomorMeteran}`);
    console.log(`  Nomor Akun      : ${newMeter.NomorAkun}`);

    console.log(`\n──────────────────────────────────────────`);
    console.log(`  SubTahap seharusnya: AKTIF`);
    console.log(`  (karena Meter sudah ada untuk KoneksiData ini)`);
    console.log(`──────────────────────────────────────────\n`);
  } catch (error: any) {
    console.error(`\n✗ Error: ${error.message}`);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
