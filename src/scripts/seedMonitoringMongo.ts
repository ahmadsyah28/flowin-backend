/**
 * ==========================================
 * SEED MONITORING - MongoDB Only
 * ==========================================
 *
 * Script ini menyimpan data ke MongoDB:
 * 1. Membuat Meter untuk KoneksiData yang sudah APPROVED
 * 2. Menyimpan RiwayatPenggunaan untuk Jan & Feb 2026
 *
 * Setelah selesai, catat METER ID yang tampil.
 * Gunakan METER ID tersebut di seedMonitoringRedis.ts
 *
 * Jalankan:
 * npm run seed:mongo
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Import connectDB dari config — sudah ada setServers di top-level module-nya
// sehingga DNS disiapkan sebelum mongoose mencoba koneksi
import { connectDB, disconnectDB } from "@/config/database";
import { Types } from "mongoose";
import { Meter } from "@/models/Meter";
import { KoneksiData } from "@/models/KoneksiData";
import { KelompokPelanggan } from "@/models/KelompokPelanggan";
import { RiwayatPenggunaan } from "@/models/RiwayatPenggunaan";

// ==========================================
// KONFIGURASI
// ==========================================

const TARGET_USER_ID = "699aaa90b03afd83f892ec54";
const TARGET_KONEKSI_DATA_ID = "69a137ba4bb449a9a8f55c48";

// ==========================================
// HELPER
// ==========================================

function randomDailyUsage(min = 150, max = 350): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generateHourlyPattern(totalDaily: number): Record<string, number> {
  const distribution: Record<number, number> = {
    0: 0.01,
    1: 0.01,
    2: 0.01,
    3: 0.01,
    4: 0.02,
    5: 0.06,
    6: 0.1,
    7: 0.08,
    8: 0.05,
    9: 0.03,
    10: 0.03,
    11: 0.04,
    12: 0.05,
    13: 0.03,
    14: 0.02,
    15: 0.03,
    16: 0.04,
    17: 0.08,
    18: 0.1,
    19: 0.08,
    20: 0.06,
    21: 0.04,
    22: 0.02,
    23: 0.01,
  };

  const result: Record<string, number> = {};
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, "0");
    result[hourStr] = Math.round(totalDaily * distribution[hour] * 10) / 10;
  }
  return result;
}

function generateMonthlyData(year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dataHarian = new Map<string, number>();
  const dataPerJam = new Map<string, number>();
  let total = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, "0");
    const dailyUsage = randomDailyUsage();
    dataHarian.set(dayStr, dailyUsage);
    total += dailyUsage;

    const hourly = generateHourlyPattern(dailyUsage);
    for (const [hour, usage] of Object.entries(hourly)) {
      dataPerJam.set(`${dayStr}-${hour}`, usage);
    }
  }

  return {
    dataHarian,
    dataPerJam,
    total: Math.round(total * 10) / 10,
  };
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  console.log("==========================================");
  console.log("   SEED MONITORING - MongoDB");
  console.log("==========================================");
  console.log(`Target User    : ${TARGET_USER_ID}`);
  console.log(`KoneksiData ID : ${TARGET_KONEKSI_DATA_ID}`);
  console.log("==========================================");

  try {
    await connectDB();

    // ─── Step 1: Buat Meter ───────────────────────────────────────────

    console.log("\n📍 Step 1: Create Meter...");

    const koneksiData = await KoneksiData.findById(TARGET_KONEKSI_DATA_ID);
    if (!koneksiData) {
      throw new Error(`KoneksiData tidak ditemukan: ${TARGET_KONEKSI_DATA_ID}`);
    }
    if (koneksiData.StatusPengajuan !== "APPROVED") {
      throw new Error(
        `KoneksiData belum APPROVED: status = ${koneksiData.StatusPengajuan}`,
      );
    }
    console.log(
      `   ✓ KoneksiData: ${koneksiData._id} (${koneksiData.StatusPengajuan})`,
    );

    const kelompok = await KelompokPelanggan.findOne({ KodeKelompok: "RT-1" });
    if (!kelompok) {
      throw new Error(
        "KelompokPelanggan RT-1 tidak ditemukan. Jalankan seed:kelompok dulu!",
      );
    }
    console.log(
      `   ✓ Kelompok: ${kelompok.KodeKelompok} - ${kelompok.NamaKelompok}`,
    );

    let meter = await Meter.findOne({ IdKoneksiData: koneksiData._id });

    if (meter) {
      console.log(
        `   ✓ Meter sudah ada: ${meter.NomorMeteran} (ID: ${meter._id})`,
      );
    } else {
      const timestamp = Date.now().toString().slice(-6);
      meter = await Meter.create({
        IdKelompokPelanggan: kelompok._id,
        IdKoneksiData: koneksiData._id,
        NomorMeteran: `MTR-${timestamp}`,
        NomorAkun: `ACC-${TARGET_USER_ID.slice(-8).toUpperCase()}`,
      });
      console.log(
        `   ✓ Meter dibuat: ${meter.NomorMeteran} (ID: ${meter._id})`,
      );
      console.log(`     Nomor Akun: ${meter.NomorAkun}`);
    }

    const meterId: Types.ObjectId = meter._id;

    // ─── Step 2: Seed RiwayatPenggunaan ──────────────────────────────

    console.log("\n📍 Step 2: Seed RiwayatPenggunaan...");

    const feb2026 = generateMonthlyData(2026, 2);
    await RiwayatPenggunaan.findOneAndUpdate(
      { MeteranId: meterId, Periode: "2026-02" },
      {
        MeteranId: meterId,
        Periode: "2026-02",
        TotalPenggunaan: feb2026.total,
        DataHarian: feb2026.dataHarian,
        DataPerJam: feb2026.dataPerJam,
      },
      { upsert: true, new: true },
    );
    console.log(
      `   ✓ Feb 2026: ${feb2026.total} liter (${feb2026.dataHarian.size} hari)`,
    );

    const jan2026 = generateMonthlyData(2026, 1);
    await RiwayatPenggunaan.findOneAndUpdate(
      { MeteranId: meterId, Periode: "2026-01" },
      {
        MeteranId: meterId,
        Periode: "2026-01",
        TotalPenggunaan: jan2026.total,
        DataHarian: jan2026.dataHarian,
        DataPerJam: jan2026.dataPerJam,
      },
      { upsert: true, new: true },
    );
    console.log(
      `   ✓ Jan 2026: ${jan2026.total} liter (${jan2026.dataHarian.size} hari)`,
    );

    // ─── Verify ──────────────────────────────────────────────────────

    const meterCount = await Meter.countDocuments({
      IdKoneksiData: koneksiData._id,
    });
    const riwayatCount = await RiwayatPenggunaan.countDocuments({
      MeteranId: meterId,
    });
    console.log(`\n   ✓ Meter saved: ${meterCount}`);
    console.log(`   ✓ RiwayatPenggunaan saved: ${riwayatCount} bulan`);

    // ─── PENTING: Catat Meter ID untuk script Redis ───────────────────

    console.log("\n==========================================");
    console.log("     ✅ MONGODB SEEDING COMPLETE");
    console.log("==========================================");
    console.log(`\n🔑 METER ID: ${meterId}`);
    console.log(
      "\n👉 Salin Meter ID di atas, lalu edit seedMonitoringRedis.ts:",
    );
    console.log(`   const TARGET_METER_ID = "${meterId}";\n`);
  } catch (error) {
    console.error("❌ Seeding gagal:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
