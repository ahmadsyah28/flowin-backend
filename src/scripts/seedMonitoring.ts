/**
 * ==========================================
 * SEED MONITORING DATA
 * ==========================================
 *
 * Script untuk seed data monitoring (untuk testing).
 *
 * Data yang di-seed:
 * 1. Meter - Meteran untuk user yang sudah APPROVED
 * 2. Redis - Data penggunaan bulan ini (Maret 2026)
 * 3. MongoDB - Riwayat penggunaan 2 bulan terakhir (Jan-Feb 2026)
 *
 * Menjalankan script:
 * npx ts-node -r tsconfig-paths/register src/scripts/seedMonitoring.ts
 *
 * atau via npm:
 * npm run seed:monitoring
 */

import dotenv from "dotenv";
import path from "path";
import { setServers } from "dns";

// Load .env from backend root BEFORE importing config
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose, { Types } from "mongoose";
import { getRedisClient, hset, setRedisData } from "@/config/redis";
import { Meter } from "@/models/Meter";
import { KoneksiData } from "@/models/KoneksiData";
import { KelompokPelanggan } from "@/models/KelompokPelanggan";
import { RiwayatPenggunaan } from "@/models/RiwayatPenggunaan";

// ==========================================
// CONFIGURATION
// ==========================================

// User yang akan di-seed (dari data yang diberikan)
const TARGET_USER_ID = "69d0cb64ec09d8618dfb3c63";
const TARGET_KONEKSI_DATA_ID = "69d0ccabec09d8618dfb3c71";

// Tanggal saat ini untuk simulasi
const CURRENT_DATE = new Date("2026-03-11");
const CURRENT_MONTH = "2026-03";
const LAST_MONTH = "2026-02";
const TWO_MONTHS_AGO = "2026-01";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Generate random usage dalam range tertentu (liter per hari)
 * Rumah tangga biasa: 150-350 liter/hari
 */
function randomDailyUsage(min = 150, max = 350): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

/**
 * Generate penggunaan per jam untuk sehari
 * Pola realistis: lebih banyak pagi (05-08) dan sore (17-20)
 */
function generateHourlyPattern(totalDaily: number): Record<string, number> {
  const hourlyPattern: Record<string, number> = {};

  // Pola distribusi per jam (persentase)
  const distribution: Record<number, number> = {
    0: 0.01,
    1: 0.01,
    2: 0.01,
    3: 0.01,
    4: 0.02, // Mulai bangun
    5: 0.06, // Pagi - mandi
    6: 0.1, // Pagi - aktivitas
    7: 0.08, // Pagi - sarapan
    8: 0.05,
    9: 0.03,
    10: 0.03,
    11: 0.04, // Siang - masak
    12: 0.05, // Siang - makan
    13: 0.03,
    14: 0.02,
    15: 0.03,
    16: 0.04,
    17: 0.08, // Sore - pulang
    18: 0.1, // Sore - mandi
    19: 0.08, // Malam - makan
    20: 0.06, // Malam
    21: 0.04,
    22: 0.02,
    23: 0.01,
  };

  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, "0");
    const usage = Math.round(totalDaily * distribution[hour] * 10) / 10;
    hourlyPattern[hourStr] = usage;
  }

  return hourlyPattern;
}

/**
 * Generate data harian untuk satu bulan
 */
function generateMonthlyData(
  year: number,
  month: number,
  daysToGenerate?: number,
): {
  dataHarian: Map<string, number>;
  dataPerJam: Map<string, number>;
  total: number;
} {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = daysToGenerate ?? daysInMonth;

  const dataHarian = new Map<string, number>();
  const dataPerJam = new Map<string, number>();
  let total = 0;

  for (let day = 1; day <= days; day++) {
    const dayStr = day.toString().padStart(2, "0");
    const dailyUsage = randomDailyUsage();

    dataHarian.set(dayStr, dailyUsage);
    total += dailyUsage;

    // Generate hourly breakdown
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
// SEED FUNCTIONS
// ==========================================

/**
 * Step 1: Create Meter untuk KoneksiData yang sudah APPROVED
 */
async function seedMeter(): Promise<Types.ObjectId> {
  console.log("\n📍 Step 1: Creating Meter...");

  // Cek KoneksiData exists dan APPROVED
  const koneksiData = await KoneksiData.findById(TARGET_KONEKSI_DATA_ID);
  if (!koneksiData) {
    throw new Error(`KoneksiData tidak ditemukan: ${TARGET_KONEKSI_DATA_ID}`);
  }
  if (koneksiData.StatusPengajuan !== "APPROVED") {
    throw new Error(
      `KoneksiData belum APPROVED: ${koneksiData.StatusPengajuan}`,
    );
  }
  console.log(
    `   ✓ KoneksiData found: ${koneksiData._id} (${koneksiData.StatusPengajuan})`,
  );

  // Get default KelompokPelanggan (RT-1 untuk rumah tangga)
  const kelompok = await KelompokPelanggan.findOne({ KodeKelompok: "RT-1" });
  if (!kelompok) {
    throw new Error(
      "KelompokPelanggan RT-1 tidak ditemukan. Jalankan seedKelompokPelanggan dulu!",
    );
  }
  console.log(
    `   ✓ Kelompok: ${kelompok.KodeKelompok} - ${kelompok.NamaKelompok}`,
  );

  // Check if meter already exists
  let meter = await Meter.findOne({ IdKoneksiData: koneksiData._id });

  if (meter) {
    console.log(`   ✓ Meter sudah ada: ${meter.NomorMeteran}`);
    return meter._id;
  }

  // Generate nomor meteran dan akun
  const timestamp = Date.now().toString().slice(-6);
  const nomorMeteran = `MTR-${timestamp}`;
  const nomorAkun = `ACC-${TARGET_USER_ID.slice(-8).toUpperCase()}`;

  // Create meter
  meter = await Meter.create({
    IdKelompokPelanggan: kelompok._id,
    IdKoneksiData: koneksiData._id,
    NomorMeteran: nomorMeteran,
    NomorAkun: nomorAkun,
  });

  console.log(`   ✓ Meter created: ${meter.NomorMeteran}`);
  console.log(`     - ID: ${meter._id}`);
  console.log(`     - Nomor Akun: ${meter.NomorAkun}`);
  console.log(`     - Kelompok: ${kelompok.KodeKelompok}`);

  return meter._id;
}

/**
 * Step 2: Seed Redis dengan data bulan ini (Maret 2026)
 */
async function seedRedisData(meterId: Types.ObjectId): Promise<void> {
  console.log("\n📍 Step 2: Seeding Redis (current month)...");

  const redis = getRedisClient();
  const meterIdStr = meterId.toString();

  // Generate data untuk 11 hari (1-11 Maret 2026)
  const { dataHarian, dataPerJam, total } = generateMonthlyData(2026, 3, 11);

  // Key untuk bulan ini
  const monthKey = `meter:${meterIdStr}:${CURRENT_MONTH}`;
  const latestKey = `meter:${meterIdStr}:latest`;

  console.log(`   📝 Key: ${monthKey}`);

  // Set data harian ke Redis Hash
  for (const [day, usage] of dataHarian) {
    await hset(monthKey, day, usage);
  }
  console.log(`   ✓ Data harian: ${dataHarian.size} hari`);

  // Set data per jam (untuk detail view)
  const hourlyKey = `meter:${meterIdStr}:${CURRENT_MONTH}:hourly`;
  for (const [dayHour, usage] of dataPerJam) {
    await hset(hourlyKey, dayHour, usage);
  }
  console.log(`   ✓ Data per jam: ${dataPerJam.size} entries`);

  // Set total bulan ini
  await hset(monthKey, "total", total);
  console.log(`   ✓ Total bulan ini: ${total} liter`);

  // Set latest reading (pembacaan terakhir)
  const lastDay = "11";
  const lastHour = "14"; // Asumsi sekarang jam 14:xx
  const lastReading = dataPerJam.get(`${lastDay}-${lastHour}`) ?? 0;

  const latestData = {
    volume: lastReading,
    timestamp: new Date("2026-03-11T14:30:00").toISOString(),
    meteranId: meterIdStr,
  };
  await setRedisData(latestKey, JSON.stringify(latestData));
  console.log(
    `   ✓ Latest reading: ${lastReading} liter @ ${latestData.timestamp}`,
  );

  // Set expiry untuk bulan ini (45 hari dari sekarang)
  await redis.expire(monthKey, 45 * 24 * 60 * 60);
  await redis.expire(hourlyKey, 45 * 24 * 60 * 60);
  await redis.expire(latestKey, 45 * 24 * 60 * 60);

  console.log(`   ✓ TTL set: 45 hari`);
}

/**
 * Step 3: Seed MongoDB dengan data bulan-bulan sebelumnya
 */
async function seedMongoDBData(meterId: Types.ObjectId): Promise<void> {
  console.log("\n📍 Step 3: Seeding MongoDB (past months)...");

  // Data Februari 2026 (bulan lalu - full 28 hari)
  const feb2026 = generateMonthlyData(2026, 2);

  // Data Januari 2026 (2 bulan lalu - full 31 hari)
  const jan2026 = generateMonthlyData(2026, 1);

  // Upsert Februari 2026
  await RiwayatPenggunaan.findOneAndUpdate(
    { MeteranId: meterId, Periode: LAST_MONTH },
    {
      MeteranId: meterId,
      Periode: LAST_MONTH,
      TotalPenggunaan: feb2026.total,
      DataHarian: feb2026.dataHarian,
      DataPerJam: feb2026.dataPerJam,
    },
    { upsert: true, new: true },
  );
  console.log(
    `   ✓ Februari 2026: ${feb2026.total} liter (${feb2026.dataHarian.size} hari)`,
  );

  // Upsert Januari 2026
  await RiwayatPenggunaan.findOneAndUpdate(
    { MeteranId: meterId, Periode: TWO_MONTHS_AGO },
    {
      MeteranId: meterId,
      Periode: TWO_MONTHS_AGO,
      TotalPenggunaan: jan2026.total,
      DataHarian: jan2026.dataHarian,
      DataPerJam: jan2026.dataPerJam,
    },
    { upsert: true, new: true },
  );
  console.log(
    `   ✓ Januari 2026: ${jan2026.total} liter (${jan2026.dataHarian.size} hari)`,
  );

  // Tampilkan summary
  const totalHistorical = feb2026.total + jan2026.total;
  console.log(`   📊 Total historical: ${totalHistorical} liter`);
}

/**
 * Step 4: Verify seeded data
 */
async function verifySeededData(meterId: Types.ObjectId): Promise<void> {
  console.log("\n📍 Step 4: Verifying seeded data...");

  const meterIdStr = meterId.toString();

  // Verify Meter
  const meter = await Meter.findById(meterId)
    .populate("IdKelompokPelanggan")
    .populate("IdKoneksiData");
  console.log(`   ✓ Meter: ${meter?.NomorMeteran}`);

  // Verify Redis
  const redis = getRedisClient();
  const monthKey = `meter:${meterIdStr}:${CURRENT_MONTH}`;
  const redisData = await redis.hgetall(monthKey);
  console.log(`   ✓ Redis keys: ${Object.keys(redisData ?? {}).length} fields`);

  // Verify MongoDB
  const mongoCount = await RiwayatPenggunaan.countDocuments({
    MeteranId: meterId,
  });
  console.log(`   ✓ MongoDB records: ${mongoCount} bulan`);
}

// ==========================================
// MAIN EXECUTION
// ==========================================

async function main() {
  console.log("==========================================");
  console.log("     SEED MONITORING DATA");
  console.log("==========================================");
  console.log(`Target User: ${TARGET_USER_ID}`);
  console.log(`KoneksiData: ${TARGET_KONEKSI_DATA_ID}`);
  console.log(`Current Date: ${CURRENT_DATE.toISOString().split("T")[0]}`);
  console.log("==========================================");

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI is not set in .env file");
      process.exit(1);
    }

    // Set DNS sebelum koneksi (Cloudflare + Google)
    // Diperlukan karena system DNS lokal sering tidak support querySrv
    setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

    // Connect to MongoDB
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Step 1: Create/Get Meter
    const meterId = await seedMeter();

    // Step 2: Seed Redis (current month)
    await seedRedisData(meterId);

    // Step 3: Seed MongoDB (past months)
    await seedMongoDBData(meterId);

    // Step 4: Verify
    await verifySeededData(meterId);

    console.log("\n==========================================");
    console.log("     ✅ SEEDING COMPLETED");
    console.log("==========================================");
    console.log(`\nMeter ID untuk testing: ${meterId}`);
    console.log("Gunakan ID ini di Flutter app untuk query monitoring.\n");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

main();
