"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const redis_1 = require("../config/redis");
const TARGET_METER_ID = "69e0e35e2a3d8e78e7049b5c";
const CURRENT_MONTH = "2026-04";
function randomDailyUsage(min = 150, max = 350) {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}
function generateHourlyPattern(totalDaily) {
    const distribution = {
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
    const result = {};
    for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, "0");
        result[hourStr] = Math.round(totalDaily * distribution[hour] * 10) / 10;
    }
    return result;
}
async function main() {
    if (!TARGET_METER_ID) {
        console.error("❌ TARGET_METER_ID belum diisi!");
        console.error("   Jalankan seedMonitoringMongo.ts dulu, lalu salin Meter ID ke file ini.");
        process.exit(1);
    }
    console.log("==========================================");
    console.log("   SEED MONITORING - Redis");
    console.log("==========================================");
    console.log(`Meter ID  : ${TARGET_METER_ID}`);
    console.log(`Bulan     : ${CURRENT_MONTH}`);
    console.log("==========================================");
    try {
        const redis = (0, redis_1.getRedisClient)();
        console.log("\n✅ Redis client initialized (Upstash HTTP)");
        const dailyKey = `usage:${TARGET_METER_ID}:${CURRENT_MONTH}:daily`;
        const totalKey = `usage:${TARGET_METER_ID}:${CURRENT_MONTH}:total`;
        const latestKey = `usage:${TARGET_METER_ID}:latest`;
        console.log("\n📍 Generating data harian (17 hari)...");
        const dataHarian = {};
        const dataPerJamPerHari = {};
        let total = 0;
        for (let day = 1; day <= 17; day++) {
            const dayStr = day.toString().padStart(2, "0");
            const dailyUsage = randomDailyUsage();
            dataHarian[dayStr] = dailyUsage;
            total += dailyUsage;
            const hourly = generateHourlyPattern(dailyUsage);
            const tanggal = `${CURRENT_MONTH}-${dayStr}`;
            dataPerJamPerHari[tanggal] = hourly;
        }
        total = Math.round(total * 10) / 10;
        console.log(`   ✓ 17 hari, total: ${total} liter`);
        console.log("\n📍 Menyimpan data harian ke Redis Hash...");
        await redis.hset(dailyKey, dataHarian);
        console.log(`   ✓ Key: ${dailyKey} (${Object.keys(dataHarian).length} fields)`);
        console.log("\n📍 Menyimpan total bulanan...");
        await redis.set(totalKey, total.toString());
        console.log(`   ✓ Key: ${totalKey} = ${total}`);
        console.log("\n📍 Menyimpan data per jam ke Redis Hash (per hari)...");
        let totalHourlyFields = 0;
        for (const [tanggal, hourlyData] of Object.entries(dataPerJamPerHari)) {
            const hourlyKey = `usage:${TARGET_METER_ID}:${tanggal}:hourly`;
            await redis.hset(hourlyKey, hourlyData);
            await redis.expire(hourlyKey, 45 * 24 * 60 * 60);
            totalHourlyFields += Object.keys(hourlyData).length;
        }
        console.log(`   ✓ ${Object.keys(dataPerJamPerHari).length} keys hourly (${totalHourlyFields} fields total)`);
        console.log("\n📍 Menyimpan latest reading...");
        const lastDayHourly = dataPerJamPerHari[`${CURRENT_MONTH}-13`] ?? {};
        const latestReading = lastDayHourly["14"] ?? 0;
        const latestData = {
            volume: latestReading,
            timestamp: new Date("2026-04-17T14:30:00").toISOString(),
            meteranId: TARGET_METER_ID,
        };
        await redis.set(latestKey, JSON.stringify(latestData));
        console.log(`   ✓ Key: ${latestKey} (${latestReading} liter @ 2026-04-17 14:30)`);
        console.log("\n📍 Set expiry 45 hari...");
        const ttl = 45 * 24 * 60 * 60;
        await redis.expire(dailyKey, ttl);
        await redis.expire(totalKey, ttl);
        await redis.expire(latestKey, ttl);
        console.log(`   ✓ TTL diset untuk daily, total, dan latest keys`);
        console.log("\n📍 Verifikasi...");
        const dailyFields = await redis.hgetall(dailyKey);
        console.log(`   ✓ ${dailyKey}: ${Object.keys(dailyFields ?? {}).length} fields`);
        const storedTotal = await redis.get(totalKey);
        console.log(`   ✓ ${totalKey}: ${storedTotal}`);
        console.log("\n==========================================");
        console.log("     ✅ REDIS SEEDING COMPLETE");
        console.log("==========================================");
        console.log(`\n🔑 Meter ID: ${TARGET_METER_ID}`);
        console.log("Gunakan Meter ID ini di Flutter app untuk query monitoring.\n");
    }
    catch (error) {
        console.error("❌ Seeding Redis gagal:", error);
        process.exit(1);
    }
    process.exit(0);
}
main();
//# sourceMappingURL=seedMonitoringRedis.js.map