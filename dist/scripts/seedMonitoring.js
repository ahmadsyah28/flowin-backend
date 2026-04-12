"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const dns_1 = require("dns");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = require("@/config/redis");
const Meter_1 = require("@/models/Meter");
const KoneksiData_1 = require("@/models/KoneksiData");
const KelompokPelanggan_1 = require("@/models/KelompokPelanggan");
const RiwayatPenggunaan_1 = require("@/models/RiwayatPenggunaan");
const TARGET_USER_ID = "69d0cb64ec09d8618dfb3c63";
const TARGET_KONEKSI_DATA_ID = "69d0ccabec09d8618dfb3c71";
const CURRENT_DATE = new Date("2026-03-11");
const CURRENT_MONTH = "2026-03";
const LAST_MONTH = "2026-02";
const TWO_MONTHS_AGO = "2026-01";
function randomDailyUsage(min = 150, max = 350) {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}
function generateHourlyPattern(totalDaily) {
    const hourlyPattern = {};
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
    for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, "0");
        const usage = Math.round(totalDaily * distribution[hour] * 10) / 10;
        hourlyPattern[hourStr] = usage;
    }
    return hourlyPattern;
}
function generateMonthlyData(year, month, daysToGenerate) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = daysToGenerate ?? daysInMonth;
    const dataHarian = new Map();
    const dataPerJam = new Map();
    let total = 0;
    for (let day = 1; day <= days; day++) {
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
async function seedMeter() {
    console.log("\n📍 Step 1: Creating Meter...");
    const koneksiData = await KoneksiData_1.KoneksiData.findById(TARGET_KONEKSI_DATA_ID);
    if (!koneksiData) {
        throw new Error(`KoneksiData tidak ditemukan: ${TARGET_KONEKSI_DATA_ID}`);
    }
    if (koneksiData.StatusPengajuan !== "APPROVED") {
        throw new Error(`KoneksiData belum APPROVED: ${koneksiData.StatusPengajuan}`);
    }
    console.log(`   ✓ KoneksiData found: ${koneksiData._id} (${koneksiData.StatusPengajuan})`);
    const kelompok = await KelompokPelanggan_1.KelompokPelanggan.findOne({ KodeKelompok: "RT-1" });
    if (!kelompok) {
        throw new Error("KelompokPelanggan RT-1 tidak ditemukan. Jalankan seedKelompokPelanggan dulu!");
    }
    console.log(`   ✓ Kelompok: ${kelompok.KodeKelompok} - ${kelompok.NamaKelompok}`);
    let meter = await Meter_1.Meter.findOne({ IdKoneksiData: koneksiData._id });
    if (meter) {
        console.log(`   ✓ Meter sudah ada: ${meter.NomorMeteran}`);
        return meter._id;
    }
    const timestamp = Date.now().toString().slice(-6);
    const nomorMeteran = `MTR-${timestamp}`;
    const nomorAkun = `ACC-${TARGET_USER_ID.slice(-8).toUpperCase()}`;
    meter = await Meter_1.Meter.create({
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
async function seedRedisData(meterId) {
    console.log("\n📍 Step 2: Seeding Redis (current month)...");
    const redis = (0, redis_1.getRedisClient)();
    const meterIdStr = meterId.toString();
    const { dataHarian, dataPerJam, total } = generateMonthlyData(2026, 3, 11);
    const monthKey = `meter:${meterIdStr}:${CURRENT_MONTH}`;
    const latestKey = `meter:${meterIdStr}:latest`;
    console.log(`   📝 Key: ${monthKey}`);
    for (const [day, usage] of dataHarian) {
        await (0, redis_1.hset)(monthKey, day, usage);
    }
    console.log(`   ✓ Data harian: ${dataHarian.size} hari`);
    const hourlyKey = `meter:${meterIdStr}:${CURRENT_MONTH}:hourly`;
    for (const [dayHour, usage] of dataPerJam) {
        await (0, redis_1.hset)(hourlyKey, dayHour, usage);
    }
    console.log(`   ✓ Data per jam: ${dataPerJam.size} entries`);
    await (0, redis_1.hset)(monthKey, "total", total);
    console.log(`   ✓ Total bulan ini: ${total} liter`);
    const lastDay = "11";
    const lastHour = "14";
    const lastReading = dataPerJam.get(`${lastDay}-${lastHour}`) ?? 0;
    const latestData = {
        volume: lastReading,
        timestamp: new Date("2026-03-11T14:30:00").toISOString(),
        meteranId: meterIdStr,
    };
    await (0, redis_1.setRedisData)(latestKey, JSON.stringify(latestData));
    console.log(`   ✓ Latest reading: ${lastReading} liter @ ${latestData.timestamp}`);
    await redis.expire(monthKey, 45 * 24 * 60 * 60);
    await redis.expire(hourlyKey, 45 * 24 * 60 * 60);
    await redis.expire(latestKey, 45 * 24 * 60 * 60);
    console.log(`   ✓ TTL set: 45 hari`);
}
async function seedMongoDBData(meterId) {
    console.log("\n📍 Step 3: Seeding MongoDB (past months)...");
    const feb2026 = generateMonthlyData(2026, 2);
    const jan2026 = generateMonthlyData(2026, 1);
    await RiwayatPenggunaan_1.RiwayatPenggunaan.findOneAndUpdate({ MeteranId: meterId, Periode: LAST_MONTH }, {
        MeteranId: meterId,
        Periode: LAST_MONTH,
        TotalPenggunaan: feb2026.total,
        DataHarian: feb2026.dataHarian,
        DataPerJam: feb2026.dataPerJam,
    }, { upsert: true, new: true });
    console.log(`   ✓ Februari 2026: ${feb2026.total} liter (${feb2026.dataHarian.size} hari)`);
    await RiwayatPenggunaan_1.RiwayatPenggunaan.findOneAndUpdate({ MeteranId: meterId, Periode: TWO_MONTHS_AGO }, {
        MeteranId: meterId,
        Periode: TWO_MONTHS_AGO,
        TotalPenggunaan: jan2026.total,
        DataHarian: jan2026.dataHarian,
        DataPerJam: jan2026.dataPerJam,
    }, { upsert: true, new: true });
    console.log(`   ✓ Januari 2026: ${jan2026.total} liter (${jan2026.dataHarian.size} hari)`);
    const totalHistorical = feb2026.total + jan2026.total;
    console.log(`   📊 Total historical: ${totalHistorical} liter`);
}
async function verifySeededData(meterId) {
    console.log("\n📍 Step 4: Verifying seeded data...");
    const meterIdStr = meterId.toString();
    const meter = await Meter_1.Meter.findById(meterId)
        .populate("IdKelompokPelanggan")
        .populate("IdKoneksiData");
    console.log(`   ✓ Meter: ${meter?.NomorMeteran}`);
    const redis = (0, redis_1.getRedisClient)();
    const monthKey = `meter:${meterIdStr}:${CURRENT_MONTH}`;
    const redisData = await redis.hgetall(monthKey);
    console.log(`   ✓ Redis keys: ${Object.keys(redisData ?? {}).length} fields`);
    const mongoCount = await RiwayatPenggunaan_1.RiwayatPenggunaan.countDocuments({
        MeteranId: meterId,
    });
    console.log(`   ✓ MongoDB records: ${mongoCount} bulan`);
}
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
        (0, dns_1.setServers)(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);
        console.log("🔄 Connecting to MongoDB...");
        await mongoose_1.default.connect(mongoUri);
        console.log("✅ Connected to MongoDB");
        const meterId = await seedMeter();
        await seedRedisData(meterId);
        await seedMongoDBData(meterId);
        await verifySeededData(meterId);
        console.log("\n==========================================");
        console.log("     ✅ SEEDING COMPLETED");
        console.log("==========================================");
        console.log(`\nMeter ID untuk testing: ${meterId}`);
        console.log("Gunakan ID ini di Flutter app untuk query monitoring.\n");
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🔌 Disconnected from MongoDB");
        process.exit(0);
    }
}
main();
//# sourceMappingURL=seedMonitoring.js.map