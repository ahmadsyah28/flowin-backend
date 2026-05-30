"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const RiwayatPenggunaan_1 = require("../models/RiwayatPenggunaan");
const Meter_1 = require("../models/Meter");
const KelompokPelanggan_1 = require("../models/KelompokPelanggan");
const redis_1 = require("../config/redis");
const TTL_LATEST = 60;
const TTL_MONTHLY_CURRENT = 300;
const TTL_MONTHLY_PAST = 21600;
const TTL_STATS = 900;
const TTL_DASHBOARD = 300;
const MIN_VALID_TS = 1577836800000;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
function getPeriode(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}
function getPreviousPeriode(date) {
    const prevDate = new Date(date);
    prevDate.setMonth(prevDate.getMonth() - 1);
    return getPeriode(prevDate);
}
function literToM3(liter) {
    return liter / 1000;
}
function hitungTagihan(kelompok, pemakaianM3) {
    if (kelompok.IsKesepakatan) {
        return {
            biayaPemakaian: 0,
            biayaBeban: kelompok.BiayaBeban,
            total: kelompok.BiayaBeban,
        };
    }
    let biayaPemakaian = 0;
    if (pemakaianM3 <= kelompok.BatasRendah) {
        biayaPemakaian = pemakaianM3 * kelompok.TarifRendah;
    }
    else {
        biayaPemakaian =
            kelompok.BatasRendah * kelompok.TarifRendah +
                (pemakaianM3 - kelompok.BatasRendah) * kelompok.TarifTinggi;
    }
    return {
        biayaPemakaian: Math.round(biayaPemakaian),
        biayaBeban: kelompok.BiayaBeban,
        total: Math.round(biayaPemakaian) + kelompok.BiayaBeban,
    };
}
async function getUserIdFromMeter(meterId) {
    try {
        const meter = await Meter_1.Meter.findById(meterId).populate({
            path: "IdKoneksiData",
            select: "IdPelanggan",
        });
        if (!meter || !meter.IdKoneksiData)
            return null;
        const koneksi = meter.IdKoneksiData;
        return koneksi.IdPelanggan?.toString() ?? null;
    }
    catch {
        return null;
    }
}
async function getLatestReading(meteranId, userId) {
    const cacheKey = `cache:monitoring:${meteranId}:latest`;
    try {
        const cached = await (0, redis_1.getRedisData)(cacheKey);
        if (cached) {
            return typeof cached === "string"
                ? JSON.parse(cached)
                : cached;
        }
        const iotKey = `iot:${userId}:${meteranId}`;
        const entries = await (0, redis_1.lrange)(iotKey, -1, -1);
        if (!entries || entries.length === 0)
            return null;
        const raw = entries[0];
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        const result = {
            volume: parsed.usedWater ?? 0,
            timestamp: new Date(parsed.ts).toISOString(),
            meteranId,
        };
        await (0, redis_1.setRedisData)(cacheKey, JSON.stringify(result), TTL_LATEST);
        return result;
    }
    catch (error) {
        console.error(`Error getting latest reading for ${meteranId}:`, error);
        return null;
    }
}
async function getRedisMonthlyUsage(meteranId, userId, periode) {
    const cacheKey = `cache:monitoring:${meteranId}:${periode}:monthly:redis`;
    try {
        const cached = await (0, redis_1.getRedisData)(cacheKey);
        if (cached) {
            return typeof cached === "string"
                ? JSON.parse(cached)
                : cached;
        }
        const iotKey = `iot:${userId}:${meteranId}`;
        const entries = await (0, redis_1.lrange)(iotKey, 0, -1);
        if (!entries || entries.length === 0)
            return null;
        const dataHarian = {};
        let total = 0;
        for (const raw of entries) {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (!parsed.ts || parsed.ts < MIN_VALID_TS)
                continue;
            const entryDateWIB = new Date(parsed.ts + WIB_OFFSET_MS);
            const periodeWIB = `${entryDateWIB.getUTCFullYear()}-${String(entryDateWIB.getUTCMonth() + 1).padStart(2, "0")}`;
            if (periodeWIB !== periode)
                continue;
            const day = String(entryDateWIB.getUTCDate()).padStart(2, "0");
            const volume = parsed.usedWater ?? 0;
            dataHarian[day] = (dataHarian[day] ?? 0) + volume;
            total += volume;
        }
        if (total === 0 && Object.keys(dataHarian).length === 0)
            return null;
        const result = {
            periode,
            totalPenggunaan: Math.round(total * 100) / 100,
            dataHarian,
            sumber: "redis",
        };
        await (0, redis_1.setRedisData)(cacheKey, JSON.stringify(result), TTL_MONTHLY_CURRENT);
        return result;
    }
    catch (error) {
        console.error(`Error getting Redis IoT data for ${meteranId}:`, error);
        return null;
    }
}
async function getMongoMonthlyUsage(meteranId, periode) {
    const nowWIB = new Date(Date.now() + WIB_OFFSET_MS);
    const isCurrent = periode === getPeriode(nowWIB);
    const ttl = isCurrent ? TTL_MONTHLY_CURRENT : TTL_MONTHLY_PAST;
    const cacheKey = `cache:monitoring:${meteranId}:${periode}:monthly:mongo`;
    try {
        const cached = await (0, redis_1.getRedisData)(cacheKey);
        if (cached) {
            return typeof cached === "string"
                ? JSON.parse(cached)
                : cached;
        }
        const [pYear, pMonth] = periode.split("-").map(Number);
        const nextMonthDate = new Date(Date.UTC(pYear, pMonth, 1));
        const nextPeriode = `${nextMonthDate.getUTCFullYear()}-${String(nextMonthDate.getUTCMonth() + 1).padStart(2, "0")}`;
        const result = await RiwayatPenggunaan_1.RiwayatPenggunaan.aggregate([
            {
                $match: {
                    MeterID: meteranId,
                    tanggal: { $gte: `${periode}-01`, $lt: `${nextPeriode}-01` },
                },
            },
            {
                $group: {
                    _id: { $substr: ["$tanggal", 8, 2] },
                    total: { $sum: "$totalPenggunaan" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        if (result.length === 0)
            return null;
        const dataHarian = {};
        let totalPenggunaan = 0;
        for (const row of result) {
            const day = String(row._id).padStart(2, "0");
            dataHarian[day] = Math.round(row.total * 100) / 100;
            totalPenggunaan += row.total;
        }
        const data = {
            periode,
            totalPenggunaan: Math.round(totalPenggunaan * 100) / 100,
            dataHarian,
            sumber: "mongodb",
        };
        await (0, redis_1.setRedisData)(cacheKey, JSON.stringify(data), ttl);
        return data;
    }
    catch (error) {
        console.error(`Error getting MongoDB data for ${meteranId}:`, error);
        return null;
    }
}
async function getTotalAllTime(meteranId) {
    const cacheKey = `cache:monitoring:${meteranId}:stats`;
    try {
        const cached = await (0, redis_1.getRedisData)(cacheKey);
        if (cached) {
            const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
            if (typeof parsed?.totalAllTime === "number")
                return parsed.totalAllTime;
        }
        const result = await RiwayatPenggunaan_1.RiwayatPenggunaan.aggregate([
            { $match: { MeterID: meteranId } },
            { $group: { _id: null, total: { $sum: "$totalPenggunaan" } } },
        ]);
        return result.length > 0 ? result[0].total : 0;
    }
    catch (error) {
        console.error(`Error calculating total for ${meteranId}:`, error);
        return 0;
    }
}
async function getMonthlyAverage(meteranId) {
    const cacheKey = `cache:monitoring:${meteranId}:stats`;
    try {
        const cached = await (0, redis_1.getRedisData)(cacheKey);
        if (cached) {
            const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
            if (typeof parsed?.monthlyAverage === "number")
                return parsed.monthlyAverage;
        }
        const sixMonthsWIB = new Date(Date.now() + WIB_OFFSET_MS);
        sixMonthsWIB.setUTCMonth(sixMonthsWIB.getUTCMonth() - 6);
        const sixMonthsAgoPeriode = `${sixMonthsWIB.getUTCFullYear()}-${String(sixMonthsWIB.getUTCMonth() + 1).padStart(2, "0")}`;
        const result = await RiwayatPenggunaan_1.RiwayatPenggunaan.aggregate([
            {
                $match: {
                    MeterID: meteranId,
                    tanggal: { $gte: `${sixMonthsAgoPeriode}-01` },
                },
            },
            {
                $group: {
                    _id: { $substr: ["$tanggal", 0, 7] },
                    total: { $sum: "$totalPenggunaan" },
                },
            },
            { $sort: { _id: -1 } },
            { $limit: 6 },
        ]);
        if (result.length === 0)
            return 0;
        const sum = result.reduce((acc, r) => acc + r.total, 0);
        return Math.round(sum / result.length);
    }
    catch (error) {
        console.error(`Error calculating average for ${meteranId}:`, error);
        return 0;
    }
}
async function getStatsWithCache(meteranId, bulanIniTotal) {
    const cacheKey = `cache:monitoring:${meteranId}:stats`;
    try {
        const cached = await (0, redis_1.getRedisData)(cacheKey);
        if (cached) {
            const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
            if (typeof parsed?.totalAllTime === "number" &&
                typeof parsed?.monthlyAverage === "number") {
                return parsed;
            }
        }
        const [totalMongo, monthlyAverage] = await Promise.all([
            getTotalAllTime(meteranId),
            getMonthlyAverage(meteranId),
        ]);
        const stats = {
            totalAllTime: totalMongo + bulanIniTotal,
            monthlyAverage,
        };
        await (0, redis_1.setRedisData)(cacheKey, JSON.stringify(stats), TTL_STATS);
        return stats;
    }
    catch {
        return { totalAllTime: bulanIniTotal, monthlyAverage: 0 };
    }
}
function calculateComparison(bulanIni, bulanLalu) {
    const selisih = bulanIni - bulanLalu;
    const persentase = bulanLalu > 0 ? Math.round((selisih / bulanLalu) * 100) : 0;
    let status;
    if (selisih > 0)
        status = "naik";
    else if (selisih < 0)
        status = "turun";
    else
        status = "sama";
    return { bulanIni, bulanLalu, selisih, persentase, status };
}
function calculatePrediction(penggunaanSaatIni, tanggalHariIni) {
    const tahun = tanggalHariIni.getFullYear();
    const bulan = tanggalHariIni.getMonth() + 1;
    const tanggal = tanggalHariIni.getDate();
    const totalHari = getDaysInMonth(tahun, bulan);
    const hariTerlewati = tanggal;
    const hariTersisa = totalHari - hariTerlewati;
    const rataRataHarian = hariTerlewati > 0 ? Math.round(penggunaanSaatIni / hariTerlewati) : 0;
    const prediksiAkhirBulan = Math.round(rataRataHarian * totalHari);
    return {
        hariTerlewati,
        hariTersisa,
        totalHari,
        rataRataHarian,
        prediksiAkhirBulan,
        penggunaanSaatIni,
    };
}
function evaluateUsage(rataRataBulanan) {
    const batasHemat = 5000;
    const batasBoros = 15000;
    let kategori;
    let deskripsi;
    if (rataRataBulanan < batasHemat) {
        kategori = "hemat";
        deskripsi =
            "Penggunaan air Anda tergolong hemat. Pertahankan kebiasaan baik ini!";
    }
    else if (rataRataBulanan <= batasBoros) {
        kategori = "normal";
        deskripsi =
            "Penggunaan air Anda berada dalam kisaran normal untuk rumah tangga.";
    }
    else {
        kategori = "boros";
        deskripsi =
            "Penggunaan air Anda cukup tinggi. Pertimbangkan untuk menghemat penggunaan air.";
    }
    return { kategori, deskripsi, rataRataBulanan, batasHemat, batasBoros };
}
function buildDailyChart(bulanIni, bulanLalu, tanggalHariIni) {
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(tanggalHariIni);
        date.setDate(date.getDate() - i);
        const periode = getPeriode(date);
        const tanggal = String(date.getDate()).padStart(2, "0");
        const displayDate = `${tanggal}/${String(date.getMonth() + 1).padStart(2, "0")}`;
        let liter = 0;
        if (bulanIni && periode === bulanIni.periode) {
            liter = bulanIni.dataHarian[tanggal] || 0;
        }
        else if (bulanLalu && periode === bulanLalu.periode) {
            liter = bulanLalu.dataHarian[tanggal] || 0;
        }
        result.push({ tanggal: displayDate, liter: Math.round(liter) });
    }
    return result;
}
function mergeMonthlyData(redis, mongo) {
    if (!redis && !mongo)
        return null;
    if (!redis)
        return mongo;
    if (!mongo)
        return redis;
    const dataHarian = { ...mongo.dataHarian };
    for (const [day, liter] of Object.entries(redis.dataHarian)) {
        dataHarian[day] = (dataHarian[day] ?? 0) + liter;
    }
    return {
        periode: redis.periode,
        totalPenggunaan: Math.round((mongo.totalPenggunaan + redis.totalPenggunaan) * 100) / 100,
        dataHarian,
        sumber: "redis",
    };
}
class MonitoringService {
    static async getDashboard(meteranId) {
        const meteranIdStr = meteranId.toString();
        const dashboardKey = `cache:monitoring:${meteranIdStr}:dashboard`;
        try {
            const cachedDashboard = await (0, redis_1.getRedisData)(dashboardKey);
            if (cachedDashboard) {
                return typeof cachedDashboard === "string"
                    ? JSON.parse(cachedDashboard)
                    : cachedDashboard;
            }
            const meter = await Meter_1.Meter.findById(meteranId).populate("IdKoneksiData");
            if (!meter) {
                return {
                    success: false,
                    message: "Meteran tidak ditemukan",
                    data: null,
                };
            }
            const userId = await getUserIdFromMeter(meteranIdStr);
            if (!userId) {
                return {
                    success: false,
                    message: "Pengguna untuk meteran tidak ditemukan",
                    data: null,
                };
            }
            const now = new Date();
            const nowWIB = new Date(now.getTime() + WIB_OFFSET_MS);
            const periodeIni = getPeriode(nowWIB);
            const periodeLalu = getPreviousPeriode(nowWIB);
            const [redisIni, mongoIni, bulanLalu, latestReading] = await Promise.all([
                getRedisMonthlyUsage(meteranIdStr, userId, periodeIni),
                getMongoMonthlyUsage(meteranIdStr, periodeIni),
                getMongoMonthlyUsage(meteranIdStr, periodeLalu),
                getLatestReading(meteranIdStr, userId),
            ]);
            const bulanIni = mergeMonthlyData(redisIni, mongoIni);
            const totalBulanIni = bulanIni?.totalPenggunaan ?? 0;
            const { totalAllTime, monthlyAverage } = await getStatsWithCache(meteranIdStr, totalBulanIni);
            const perbandingan = bulanLalu
                ? calculateComparison(totalBulanIni, bulanLalu.totalPenggunaan)
                : null;
            const prediksi = totalBulanIni > 0 ? calculatePrediction(totalBulanIni, nowWIB) : null;
            const evaluasi = evaluateUsage(monthlyAverage > 0 ? monthlyAverage : totalBulanIni);
            let estimasiTagihan = null;
            const kelompok = await KelompokPelanggan_1.KelompokPelanggan.findById(meter.IdKelompokPelanggan);
            if (kelompok) {
                const pemakaianM3 = literToM3(totalBulanIni);
                const tagihan = hitungTagihan(kelompok, pemakaianM3);
                estimasiTagihan = {
                    pemakaianM3: Math.round(pemakaianM3 * 100) / 100,
                    tarifRendah: kelompok.TarifRendah,
                    tarifTinggi: kelompok.TarifTinggi,
                    batasRendah: kelompok.BatasRendah,
                    biayaPemakaian: tagihan.biayaPemakaian,
                    biayaBeban: tagihan.biayaBeban,
                    totalEstimasi: tagihan.total,
                    kelompok: {
                        kode: kelompok.KodeKelompok,
                        nama: kelompok.NamaKelompok,
                        kategori: kelompok.Kategori,
                    },
                };
            }
            const chartHarian = buildDailyChart(bulanIni, bulanLalu, nowWIB);
            const response = {
                success: true,
                message: "Berhasil mendapatkan data monitoring",
                data: {
                    meteran: {
                        id: meteranIdStr,
                        nomorMeteran: meter.NomorMeteran,
                        nomorAkun: meter.NomorAkun,
                    },
                    latestReading,
                    bulanIni,
                    bulanLalu,
                    totalKeseluruhan: totalAllTime,
                    rataRataBulanan: monthlyAverage,
                    perbandingan,
                    prediksi,
                    evaluasi,
                    estimasiTagihan,
                    chartHarian,
                },
            };
            await (0, redis_1.setRedisData)(dashboardKey, JSON.stringify(response), TTL_DASHBOARD);
            return response;
        }
        catch (error) {
            console.error("Error in MonitoringService.getDashboard:", error);
            return {
                success: false,
                message: error.message || "Gagal mendapatkan data monitoring",
                data: null,
            };
        }
    }
    static async getHistory(meteranId, jumlahBulan = 6) {
        try {
            const meteranIdStr = meteranId.toString();
            const now = new Date();
            const results = [];
            for (let i = 1; i <= jumlahBulan; i++) {
                const d = new Date(now);
                d.setMonth(d.getMonth() - i);
                const periode = getPeriode(d);
                const data = await getMongoMonthlyUsage(meteranIdStr, periode);
                if (data)
                    results.push(data);
            }
            return {
                success: true,
                message: "Berhasil mendapatkan riwayat penggunaan",
                data: results,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan riwayat",
                data: null,
            };
        }
    }
    static async getHourlyUsage(meteranId, tanggal) {
        const cacheKey = `cache:monitoring:${meteranId}:${tanggal}:hourly`;
        try {
            const cached = await (0, redis_1.getRedisData)(cacheKey);
            if (cached) {
                const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
                return {
                    success: true,
                    message: "Berhasil mendapatkan data per jam",
                    data: parsed,
                };
            }
            const tanggalDate = new Date(`${tanggal}T00:00:00.000Z`);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            const isInRedis = tanggalDate >= sevenDaysAgo;
            const isToday = tanggal === new Date().toISOString().slice(0, 10);
            const ttl = isToday ? TTL_MONTHLY_CURRENT : TTL_MONTHLY_PAST;
            let data = null;
            if (isInRedis) {
                const userId = await getUserIdFromMeter(meteranId);
                if (!userId) {
                    return {
                        success: false,
                        message: "Pengguna untuk meteran tidak ditemukan",
                        data: null,
                    };
                }
                const iotKey = `iot:${userId}:${meteranId}`;
                const entries = await (0, redis_1.lrange)(iotKey, 0, -1);
                if (!entries || entries.length === 0) {
                    return {
                        success: false,
                        message: "Data per jam tidak ditemukan",
                        data: null,
                    };
                }
                const hourlyMap = {};
                for (const raw of entries) {
                    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
                    const entryDate = new Date(parsed.ts);
                    if (entryDate.toISOString().slice(0, 10) !== tanggal)
                        continue;
                    const hour = String(entryDate.getUTCHours()).padStart(2, "0");
                    hourlyMap[hour] = (hourlyMap[hour] ?? 0) + (parsed.usedWater ?? 0);
                }
                if (Object.keys(hourlyMap).length === 0) {
                    return {
                        success: false,
                        message: "Data per jam tidak ditemukan untuk tanggal tersebut",
                        data: null,
                    };
                }
                for (const h of Object.keys(hourlyMap)) {
                    hourlyMap[h] = Math.round(hourlyMap[h] * 100) / 100;
                }
                data = hourlyMap;
            }
            else {
                const start = new Date(`${tanggal}T00:00:00.000Z`);
                const end = new Date(`${tanggal}T23:59:59.999Z`);
                const result = await RiwayatPenggunaan_1.RiwayatPenggunaan.aggregate([
                    {
                        $match: {
                            MeterID: meteranId,
                            timestamp: { $gte: start, $lte: end },
                        },
                    },
                    {
                        $group: {
                            _id: { $hour: "$timestamp" },
                            total: { $sum: "$PenggunaanAir" },
                        },
                    },
                    { $sort: { _id: 1 } },
                ]);
                if (result.length === 0) {
                    return {
                        success: false,
                        message: "Data per jam tidak ditemukan",
                        data: null,
                    };
                }
                const hourlyMap = {};
                for (const row of result) {
                    const hour = String(row._id).padStart(2, "0");
                    hourlyMap[hour] = Math.round(row.total * 100) / 100;
                }
                data = hourlyMap;
            }
            await (0, redis_1.setRedisData)(cacheKey, JSON.stringify(data), ttl);
            return {
                success: true,
                message: "Berhasil mendapatkan data per jam",
                data,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan data per jam",
                data: null,
            };
        }
    }
    static async getMonthlyUsage(meteranId, periode) {
        try {
            const meteranIdStr = meteranId.toString();
            const meter = await Meter_1.Meter.findById(meteranId);
            if (!meter) {
                return {
                    success: false,
                    message: "Meteran tidak ditemukan",
                    data: null,
                };
            }
            const currentPeriode = getPeriode(new Date());
            let data = null;
            if (periode === currentPeriode) {
                const userId = await getUserIdFromMeter(meteranIdStr);
                if (userId) {
                    data = await getRedisMonthlyUsage(meteranIdStr, userId, periode);
                }
            }
            else {
                data = await getMongoMonthlyUsage(meteranIdStr, periode);
            }
            return {
                success: true,
                message: data
                    ? "Berhasil mendapatkan data penggunaan"
                    : "Tidak ada data untuk periode ini",
                data,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mendapatkan data penggunaan bulanan",
                data: null,
            };
        }
    }
}
exports.MonitoringService = MonitoringService;
//# sourceMappingURL=MonitoringService.js.map