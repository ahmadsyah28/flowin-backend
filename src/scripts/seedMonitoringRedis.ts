/**
 * ==========================================
 * SEED MONITORING - Redis Only
 * ==========================================
 *
 * Script ini menyimpan data bulan ini (April 2026) ke Redis (Upstash).
 * Redis menggunakan HTTP REST - TIDAK perlu DNS SRV, TIDAK perlu MongoDB.
 *
 * PRASYARAT: Jalankan seedMonitoringMongo.ts dulu, lalu:
 * 1. Salin METER ID dari output seedMonitoringMongo.ts
 * 2. Tempel ke konstanta TARGET_METER_ID di bawah ini
 * 3. Kemudian jalankan script ini
 *
 * Jalankan:
 * npm run seed:redis
 */

import dotenv from "dotenv";
import path from "path";

// Load .env dari root backend SEBELUM apapun
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { getRedisClient } from "@/config/redis";

// ==========================================
// KONFIGURASI
// ==========================================

// ⚠️  ISI DENGAN METEOR ID DARI OUTPUT seedMonitoringMongo.ts
const TARGET_METER_ID = "69b1749e1eb7c93ea3c2f53b";

const CURRENT_MONTH = "2026-04";

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

// ==========================================
// MAIN
// ==========================================

async function main() {
  // Validasi METER_ID
  if (!TARGET_METER_ID) {
    console.error("❌ TARGET_METER_ID belum diisi!");
    console.error(
      "   Jalankan seedMonitoringMongo.ts dulu, lalu salin Meter ID ke file ini.",
    );
    process.exit(1);
  }

  console.log("==========================================");
  console.log("   SEED MONITORING - Redis");
  console.log("==========================================");
  console.log(`Meter ID  : ${TARGET_METER_ID}`);
  console.log(`Bulan     : ${CURRENT_MONTH}`);
  console.log("==========================================");

  try {
    const redis = getRedisClient();
    console.log("\n✅ Redis client initialized (Upstash HTTP)");

    // Key format yang digunakan MonitoringService:
    // usage:{meteranId}:{YYYY-MM}:daily  → Hash harian
    // usage:{meteranId}:{YYYY-MM}:total  → String total
    // usage:{meteranId}:{YYYY-MM-DD}:hourly → Hash per hari
    // usage:{meteranId}:latest           → String JSON
    const dailyKey = `usage:${TARGET_METER_ID}:${CURRENT_MONTH}:daily`;
    const totalKey = `usage:${TARGET_METER_ID}:${CURRENT_MONTH}:total`;
    const latestKey = `usage:${TARGET_METER_ID}:latest`;

    // ─── Generate data 2 hari (1-2 April 2026) ───────────────────────

    console.log("\n📍 Generating data harian (2 hari)...");
    const dataHarian: Record<string, number> = {};
    // Per hari: { "YYYY-MM-DD": { "00": 1.2, ... } }
    const dataPerJamPerHari: Record<string, Record<string, number>> = {};
    let total = 0;

    for (let day = 1; day <= 2; day++) {
      const dayStr = day.toString().padStart(2, "0");
      const dailyUsage = randomDailyUsage();

      dataHarian[dayStr] = dailyUsage;
      total += dailyUsage;

      const hourly = generateHourlyPattern(dailyUsage);
      const tanggal = `${CURRENT_MONTH}-${dayStr}`;
      dataPerJamPerHari[tanggal] = hourly;
    }

    total = Math.round(total * 10) / 10;
    console.log(`   ✓ 2 hari, total: ${total} liter`);

    // ─── Seed data harian ─────────────────────────────────────────────

    console.log("\n📍 Menyimpan data harian ke Redis Hash...");
    await redis.hset(dailyKey, dataHarian as Record<string, unknown>);
    console.log(
      `   ✓ Key: ${dailyKey} (${Object.keys(dataHarian).length} fields)`,
    );

    // ─── Seed total bulanan ───────────────────────────────────────────

    console.log("\n📍 Menyimpan total bulanan...");
    await redis.set(totalKey, total.toString());
    console.log(`   ✓ Key: ${totalKey} = ${total}`);

    // ─── Seed data per jam (per hari) ─────────────────────────────────

    console.log("\n📍 Menyimpan data per jam ke Redis Hash (per hari)...");
    let totalHourlyFields = 0;
    for (const [tanggal, hourlyData] of Object.entries(dataPerJamPerHari)) {
      const hourlyKey = `usage:${TARGET_METER_ID}:${tanggal}:hourly`;
      await redis.hset(hourlyKey, hourlyData as Record<string, unknown>);
      await redis.expire(hourlyKey, 45 * 24 * 60 * 60);
      totalHourlyFields += Object.keys(hourlyData).length;
    }
    console.log(
      `   ✓ ${Object.keys(dataPerJamPerHari).length} keys hourly (${totalHourlyFields} fields total)`,
    );

    // ─── Seed data latest ─────────────────────────────────────────────

    console.log("\n📍 Menyimpan latest reading...");
    const lastDayHourly = dataPerJamPerHari[`${CURRENT_MONTH}-02`] ?? {};
    const latestReading = lastDayHourly["14"] ?? 0;
    const latestData = {
      volume: latestReading,
      timestamp: new Date("2026-04-02T14:30:00").toISOString(),
      meteranId: TARGET_METER_ID,
    };
    await redis.set(latestKey, JSON.stringify(latestData));
    console.log(
      `   ✓ Key: ${latestKey} (${latestReading} liter @ 2026-04-02 14:30)`,
    );

    // ─── Set TTL 45 hari ──────────────────────────────────────────────

    console.log("\n📍 Set expiry 45 hari...");
    const ttl = 45 * 24 * 60 * 60;
    await redis.expire(dailyKey, ttl);
    await redis.expire(totalKey, ttl);
    await redis.expire(latestKey, ttl);
    console.log(`   ✓ TTL diset untuk daily, total, dan latest keys`);

    // ─── Verify ───────────────────────────────────────────────────────

    console.log("\n📍 Verifikasi...");
    const dailyFields = await redis.hgetall(dailyKey);
    console.log(
      `   ✓ ${dailyKey}: ${Object.keys(dailyFields ?? {}).length} fields`,
    );
    const storedTotal = await redis.get(totalKey);
    console.log(`   ✓ ${totalKey}: ${storedTotal}`);

    console.log("\n==========================================");
    console.log("     ✅ REDIS SEEDING COMPLETE");
    console.log("==========================================");
    console.log(`\n🔑 Meter ID: ${TARGET_METER_ID}`);
    console.log(
      "Gunakan Meter ID ini di Flutter app untuk query monitoring.\n",
    );
  } catch (error) {
    console.error("❌ Seeding Redis gagal:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
