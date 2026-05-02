/**
 * ==========================================
 * MONITORING SERVICE
 * ==========================================
 *
 * Service untuk fitur monitoring penggunaan air pelanggan.
 *
 * ARSITEKTUR DATA:
 * ----------------
 * 1. Redis IoT List (data mentah dari IoT firmware):
 *    - Key: iot:{userId}:{meterId}  (List)
 *    - Entry: JSON { usedWater: number, ts: number (epoch ms) }
 *    - TTL: 7 hari (di-set oleh flowin-recieve-iot)
 *
 * 2. MongoDB - collection riwayatpenggunaans (arsip permanen):
 *    - Raw records: { MeterID, UserID, PenggunaanAir, timestamp }
 *    - Di-migrate dari Redis oleh flowin-recieve-iot cron (entries > 7 hari)
 *
 * 3. Redis Cache (hasil komputasi, di-set oleh service ini):
 *    - cache:monitoring:{meterId}:dashboard         → TTL 5 menit
 *    - cache:monitoring:{meterId}:{YYYY-MM}:monthly → TTL 5 menit (bulan ini) / 6 jam (lalu)
 *    - cache:monitoring:{meterId}:stats             → TTL 15 menit
 *    - cache:monitoring:{meterId}:latest            → TTL 1 menit
 *
 * ALUR DATA:
 * ----------
 * IoT Firmware → Redis List (7 hari) → [cron migrate] → MongoDB (permanen)
 * MonitoringService membaca Redis List (bulan berjalan) + MongoDB (bulan lalu)
 * Hasil komputasi di-cache di Redis agar tidak membebani server.
 */

import { Types } from "mongoose";
import { RiwayatPenggunaan } from "@/models/RiwayatPenggunaan";
import { Meter } from "@/models/Meter";
import {
  KelompokPelanggan,
  IKelompokPelanggan,
} from "@/models/KelompokPelanggan";
import { getRedisData, setRedisData, lrange } from "@/config/redis";

// TTL constants (detik)
const TTL_LATEST = 60; // 1 menit — data IoT terus masuk
const TTL_MONTHLY_CURRENT = 300; // 5 menit — bulan berjalan
const TTL_MONTHLY_PAST = 21600; // 6 jam — bulan lalu (data stabil)
const TTL_STATS = 900; // 15 menit — total + rata-rata
const TTL_DASHBOARD = 300; // 5 menit — full dashboard

// ==========================================
// INTERFACES
// ==========================================

export interface LatestReading {
  volume: number;
  timestamp: string;
  meteranId: string;
}

export interface DailyUsageData {
  [date: string]: number;
}

export interface HourlyUsageData {
  [hour: string]: number;
}

export interface MonthlyUsageData {
  periode: string;
  totalPenggunaan: number;
  dataHarian: DailyUsageData;
  sumber: "redis" | "mongodb";
}

export interface UsageComparison {
  bulanIni: number;
  bulanLalu: number;
  selisih: number;
  persentase: number;
  status: "naik" | "turun" | "sama";
}

export interface UsagePrediction {
  hariTerlewati: number;
  hariTersisa: number;
  totalHari: number;
  rataRataHarian: number;
  prediksiAkhirBulan: number;
  penggunaanSaatIni: number;
}

export interface BillingEstimate {
  pemakaianM3: number;
  tarifRendah: number;
  tarifTinggi: number;
  batasRendah: number;
  biayaPemakaian: number;
  biayaBeban: number;
  totalEstimasi: number;
  kelompok: {
    kode: string;
    nama: string;
    kategori: string;
  };
}

export interface UsageEvaluation {
  kategori: "hemat" | "normal" | "boros";
  deskripsi: string;
  rataRataBulanan: number;
  batasHemat: number;
  batasBoros: number;
}

export interface MonitoringDashboardResponse {
  success: boolean;
  message: string;
  data: {
    meteran: {
      id: string;
      nomorMeteran: string;
      nomorAkun: string;
    };
    latestReading: LatestReading | null;
    bulanIni: MonthlyUsageData | null;
    bulanLalu: MonthlyUsageData | null;
    totalKeseluruhan: number;
    rataRataBulanan: number;
    perbandingan: UsageComparison | null;
    prediksi: UsagePrediction | null;
    evaluasi: UsageEvaluation;
    estimasiTagihan: BillingEstimate | null;
    chartHarian: { tanggal: string; liter: number }[];
  } | null;
}

// ==========================================
// HELPERS
// ==========================================

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getPeriode(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getPreviousPeriode(date: Date): string {
  const prevDate = new Date(date);
  prevDate.setMonth(prevDate.getMonth() - 1);
  return getPeriode(prevDate);
}

function literToM3(liter: number): number {
  return liter / 1000;
}

function hitungTagihan(
  kelompok: IKelompokPelanggan,
  pemakaianM3: number,
): { biayaPemakaian: number; biayaBeban: number; total: number } {
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
  } else {
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

/**
 * Ambil userId dari meteranId via relasi Meter → KoneksiData → IdPelanggan.
 * Diperlukan karena IoT Redis key menggunakan userId: iot:{userId}:{meterId}
 */
async function getUserIdFromMeter(meterId: string): Promise<string | null> {
  try {
    const meter = await Meter.findById(meterId).populate({
      path: "IdKoneksiData",
      select: "IdPelanggan",
    });
    if (!meter || !meter.IdKoneksiData) return null;
    const koneksi = meter.IdKoneksiData as any;
    return koneksi.IdPelanggan?.toString() ?? null;
  } catch {
    return null;
  }
}

// ==========================================
// REDIS IOT DATA ACCESS
// ==========================================

/**
 * Ambil entry terakhir dari Redis IoT List untuk pembacaan terkini.
 * Key: iot:{userId}:{meterId} — ditulis oleh flowin-recieve-iot.
 */
async function getLatestReading(
  meteranId: string,
  userId: string,
): Promise<LatestReading | null> {
  const cacheKey = `cache:monitoring:${meteranId}:latest`;
  try {
    const cached = await getRedisData(cacheKey);
    if (cached) {
      return typeof cached === "string"
        ? JSON.parse(cached)
        : (cached as LatestReading);
    }

    const iotKey = `iot:${userId}:${meteranId}`;
    const entries = await lrange(iotKey, -1, -1);
    if (!entries || entries.length === 0) return null;

    const raw = entries[0];
    const parsed: any = typeof raw === "string" ? JSON.parse(raw) : raw;

    const result: LatestReading = {
      volume: parsed.usedWater ?? 0,
      timestamp: new Date(parsed.ts).toISOString(),
      meteranId,
    };

    await setRedisData(cacheKey, JSON.stringify(result), TTL_LATEST);
    return result;
  } catch (error) {
    console.error(`Error getting latest reading for ${meteranId}:`, error);
    return null;
  }
}

/**
 * Agregasi data bulan berjalan dari Redis IoT List.
 * Baca semua entries list, filter bulan sesuai periode, group per hari.
 * Hasil di-cache untuk mengurangi iterasi berulang.
 */
async function getRedisMonthlyUsage(
  meteranId: string,
  userId: string,
  periode: string,
): Promise<MonthlyUsageData | null> {
  const cacheKey = `cache:monitoring:${meteranId}:${periode}:monthly`;
  try {
    const cached = await getRedisData(cacheKey);
    if (cached) {
      return typeof cached === "string"
        ? JSON.parse(cached)
        : (cached as MonthlyUsageData);
    }

    const iotKey = `iot:${userId}:${meteranId}`;
    const entries = await lrange(iotKey, 0, -1);

    if (!entries || entries.length === 0) return null;

    const dataHarian: DailyUsageData = {};
    let total = 0;

    for (const raw of entries) {
      const parsed: any = typeof raw === "string" ? JSON.parse(raw) : raw;
      const entryDate = new Date(parsed.ts);
      if (getPeriode(entryDate) !== periode) continue;

      const day = String(entryDate.getDate()).padStart(2, "0");
      const volume = parsed.usedWater ?? 0;
      dataHarian[day] = (dataHarian[day] ?? 0) + volume;
      total += volume;
    }

    if (total === 0 && Object.keys(dataHarian).length === 0) return null;

    const result: MonthlyUsageData = {
      periode,
      totalPenggunaan: Math.round(total * 100) / 100,
      dataHarian,
      sumber: "redis",
    };

    await setRedisData(cacheKey, JSON.stringify(result), TTL_MONTHLY_CURRENT);
    return result;
  } catch (error) {
    console.error(`Error getting Redis IoT data for ${meteranId}:`, error);
    return null;
  }
}

// ==========================================
// MONGODB DATA ACCESS
// ==========================================

/**
 * Agregasi data bulan dari MongoDB raw records.
 * Gunakan aggregation pipeline untuk group per hari.
 * Cache TTL disesuaikan: bulan berjalan pendek, bulan lalu panjang.
 */
async function getMongoMonthlyUsage(
  meteranId: string,
  periode: string,
): Promise<MonthlyUsageData | null> {
  const isCurrent = periode === getPeriode(new Date());
  const ttl = isCurrent ? TTL_MONTHLY_CURRENT : TTL_MONTHLY_PAST;
  const cacheKey = `cache:monitoring:${meteranId}:${periode}:monthly`;

  try {
    const cached = await getRedisData(cacheKey);
    if (cached) {
      return typeof cached === "string"
        ? JSON.parse(cached)
        : (cached as MonthlyUsageData);
    }

    const start = new Date(`${periode}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const result = await RiwayatPenggunaan.aggregate([
      {
        $match: {
          MeterID: meteranId,
          timestamp: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$timestamp" },
          total: { $sum: "$PenggunaanAir" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    if (result.length === 0) return null;

    const dataHarian: DailyUsageData = {};
    let totalPenggunaan = 0;
    for (const row of result) {
      const day = String(row._id).padStart(2, "0");
      dataHarian[day] = Math.round(row.total * 100) / 100;
      totalPenggunaan += row.total;
    }

    const data: MonthlyUsageData = {
      periode,
      totalPenggunaan: Math.round(totalPenggunaan * 100) / 100,
      dataHarian,
      sumber: "mongodb",
    };

    await setRedisData(cacheKey, JSON.stringify(data), ttl);
    return data;
  } catch (error) {
    console.error(`Error getting MongoDB data for ${meteranId}:`, error);
    return null;
  }
}

/**
 * Total penggunaan keseluruhan (semua waktu) dari MongoDB.
 * Di-cache 15 menit.
 */
async function getTotalAllTime(meteranId: string): Promise<number> {
  const cacheKey = `cache:monitoring:${meteranId}:stats`;
  try {
    const cached = await getRedisData(cacheKey);
    if (cached) {
      const parsed =
        typeof cached === "string" ? JSON.parse(cached) : (cached as any);
      if (typeof parsed?.totalAllTime === "number") return parsed.totalAllTime;
    }

    const result = await RiwayatPenggunaan.aggregate([
      { $match: { MeterID: meteranId } },
      { $group: { _id: null, total: { $sum: "$PenggunaanAir" } } },
    ]);

    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error(`Error calculating total for ${meteranId}:`, error);
    return 0;
  }
}

/**
 * Rata-rata penggunaan bulanan dari 6 bulan terakhir di MongoDB.
 * Aggregate group by bulan terlebih dahulu, lalu hitung rata-rata.
 * Di-cache bersama totalAllTime dalam key yang sama.
 */
async function getMonthlyAverage(meteranId: string): Promise<number> {
  const cacheKey = `cache:monitoring:${meteranId}:stats`;
  try {
    const cached = await getRedisData(cacheKey);
    if (cached) {
      const parsed =
        typeof cached === "string" ? JSON.parse(cached) : (cached as any);
      if (typeof parsed?.monthlyAverage === "number")
        return parsed.monthlyAverage;
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await RiwayatPenggunaan.aggregate([
      {
        $match: {
          MeterID: meteranId,
          timestamp: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
          },
          total: { $sum: "$PenggunaanAir" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    if (result.length === 0) return 0;

    const sum = result.reduce((acc: number, r: any) => acc + r.total, 0);
    return Math.round(sum / result.length);
  } catch (error) {
    console.error(`Error calculating average for ${meteranId}:`, error);
    return 0;
  }
}

/**
 * Hitung totalAllTime dan monthlyAverage sekaligus, simpan ke cache stats.
 */
async function getStatsWithCache(
  meteranId: string,
  bulanIniTotal: number,
): Promise<{ totalAllTime: number; monthlyAverage: number }> {
  const cacheKey = `cache:monitoring:${meteranId}:stats`;
  try {
    const cached = await getRedisData(cacheKey);
    if (cached) {
      const parsed =
        typeof cached === "string" ? JSON.parse(cached) : (cached as any);
      if (
        typeof parsed?.totalAllTime === "number" &&
        typeof parsed?.monthlyAverage === "number"
      ) {
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

    await setRedisData(cacheKey, JSON.stringify(stats), TTL_STATS);
    return stats;
  } catch {
    return { totalAllTime: bulanIniTotal, monthlyAverage: 0 };
  }
}

// ==========================================
// CALCULATION FUNCTIONS
// ==========================================

function calculateComparison(
  bulanIni: number,
  bulanLalu: number,
): UsageComparison {
  const selisih = bulanIni - bulanLalu;
  const persentase =
    bulanLalu > 0 ? Math.round((selisih / bulanLalu) * 100) : 0;

  let status: "naik" | "turun" | "sama";
  if (selisih > 0) status = "naik";
  else if (selisih < 0) status = "turun";
  else status = "sama";

  return { bulanIni, bulanLalu, selisih, persentase, status };
}

function calculatePrediction(
  penggunaanSaatIni: number,
  tanggalHariIni: Date,
): UsagePrediction {
  const tahun = tanggalHariIni.getFullYear();
  const bulan = tanggalHariIni.getMonth() + 1;
  const tanggal = tanggalHariIni.getDate();

  const totalHari = getDaysInMonth(tahun, bulan);
  const hariTerlewati = tanggal;
  const hariTersisa = totalHari - hariTerlewati;
  const rataRataHarian =
    hariTerlewati > 0 ? Math.round(penggunaanSaatIni / hariTerlewati) : 0;
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

function evaluateUsage(rataRataBulanan: number): UsageEvaluation {
  const batasHemat = 5000;
  const batasBoros = 15000;

  let kategori: "hemat" | "normal" | "boros";
  let deskripsi: string;

  if (rataRataBulanan < batasHemat) {
    kategori = "hemat";
    deskripsi =
      "Penggunaan air Anda tergolong hemat. Pertahankan kebiasaan baik ini!";
  } else if (rataRataBulanan <= batasBoros) {
    kategori = "normal";
    deskripsi =
      "Penggunaan air Anda berada dalam kisaran normal untuk rumah tangga.";
  } else {
    kategori = "boros";
    deskripsi =
      "Penggunaan air Anda cukup tinggi. Pertimbangkan untuk menghemat penggunaan air.";
  }

  return { kategori, deskripsi, rataRataBulanan, batasHemat, batasBoros };
}

function buildDailyChart(
  bulanIni: MonthlyUsageData | null,
  bulanLalu: MonthlyUsageData | null,
  tanggalHariIni: Date,
): { tanggal: string; liter: number }[] {
  const result: { tanggal: string; liter: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(tanggalHariIni);
    date.setDate(date.getDate() - i);

    const periode = getPeriode(date);
    const tanggal = String(date.getDate()).padStart(2, "0");
    const displayDate = `${tanggal}/${String(date.getMonth() + 1).padStart(2, "0")}`;

    let liter = 0;
    if (bulanIni && periode === bulanIni.periode) {
      liter = bulanIni.dataHarian[tanggal] || 0;
    } else if (bulanLalu && periode === bulanLalu.periode) {
      liter = bulanLalu.dataHarian[tanggal] || 0;
    }

    result.push({ tanggal: displayDate, liter: Math.round(liter) });
  }

  return result;
}

// ==========================================
// MAIN SERVICE CLASS
// ==========================================

export class MonitoringService {
  /**
   * Mendapatkan data dashboard monitoring lengkap.
   * Semua komputasi berat di-cache di Redis untuk mengurangi beban server.
   *
   * Flow:
   * 1. Cek dashboard cache → return jika ada
   * 2. Validasi meteran + ambil userId (untuk IoT Redis key)
   * 3. Ambil data bulan ini dari Redis IoT List (agregasi + cache)
   * 4. Ambil data bulan lalu dari MongoDB (agregasi + cache)
   * 5. Hitung stats (total + rata-rata) dengan cache
   * 6. Hitung perbandingan, prediksi, evaluasi, tagihan
   * 7. Simpan full dashboard ke cache, return
   */
  static async getDashboard(
    meteranId: string | Types.ObjectId,
  ): Promise<MonitoringDashboardResponse> {
    const meteranIdStr = meteranId.toString();
    const dashboardKey = `cache:monitoring:${meteranIdStr}:dashboard`;

    try {
      // Cek dashboard cache
      const cachedDashboard = await getRedisData(dashboardKey);
      if (cachedDashboard) {
        return typeof cachedDashboard === "string"
          ? JSON.parse(cachedDashboard)
          : (cachedDashboard as MonitoringDashboardResponse);
      }

      // Validasi meteran
      const meter = await Meter.findById(meteranId).populate("IdKoneksiData");
      if (!meter) {
        return {
          success: false,
          message: "Meteran tidak ditemukan",
          data: null,
        };
      }

      // Ambil userId untuk membaca Redis IoT key
      const userId = await getUserIdFromMeter(meteranIdStr);
      if (!userId) {
        return {
          success: false,
          message: "Pengguna untuk meteran tidak ditemukan",
          data: null,
        };
      }

      const now = new Date();
      const periodeIni = getPeriode(now);
      const periodeLalu = getPreviousPeriode(now);

      // Ambil data secara paralel untuk efisiensi
      const [bulanIni, bulanLalu, latestReading] = await Promise.all([
        getRedisMonthlyUsage(meteranIdStr, userId, periodeIni),
        getMongoMonthlyUsage(meteranIdStr, periodeLalu),
        getLatestReading(meteranIdStr, userId),
      ]);

      const totalBulanIni = bulanIni?.totalPenggunaan ?? 0;

      // Stats (total all-time + rata-rata bulanan) dengan cache
      const { totalAllTime, monthlyAverage } = await getStatsWithCache(
        meteranIdStr,
        totalBulanIni,
      );

      // Perbandingan dengan bulan lalu
      const perbandingan = bulanLalu
        ? calculateComparison(totalBulanIni, bulanLalu.totalPenggunaan)
        : null;

      // Prediksi akhir bulan
      const prediksi =
        totalBulanIni > 0 ? calculatePrediction(totalBulanIni, now) : null;

      // Evaluasi kategori penggunaan
      const evaluasi = evaluateUsage(
        monthlyAverage > 0 ? monthlyAverage : totalBulanIni,
      );

      // Estimasi tagihan
      let estimasiTagihan: BillingEstimate | null = null;
      const kelompok = await KelompokPelanggan.findById(
        meter.IdKelompokPelanggan,
      );
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

      const chartHarian = buildDailyChart(bulanIni, bulanLalu, now);

      const response: MonitoringDashboardResponse = {
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

      // Cache full dashboard
      await setRedisData(dashboardKey, JSON.stringify(response), TTL_DASHBOARD);
      return response;
    } catch (error: any) {
      console.error("Error in MonitoringService.getDashboard:", error);
      return {
        success: false,
        message: error.message || "Gagal mendapatkan data monitoring",
        data: null,
      };
    }
  }

  /**
   * Mendapatkan data historis penggunaan beberapa bulan terakhir.
   * Tiap bulan di-cache secara individual.
   */
  static async getHistory(
    meteranId: string | Types.ObjectId,
    jumlahBulan: number = 6,
  ): Promise<{
    success: boolean;
    message: string;
    data: MonthlyUsageData[] | null;
  }> {
    try {
      const meteranIdStr = meteranId.toString();
      const now = new Date();
      const results: MonthlyUsageData[] = [];

      for (let i = 1; i <= jumlahBulan; i++) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const periode = getPeriode(d);
        const data = await getMongoMonthlyUsage(meteranIdStr, periode);
        if (data) results.push(data);
      }

      return {
        success: true,
        message: "Berhasil mendapatkan riwayat penggunaan",
        data: results,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan riwayat",
        data: null,
      };
    }
  }

  /**
   * Mendapatkan data per jam untuk hari tertentu.
   * Format tanggal: YYYY-MM-DD
   *
   * Sumber data dipilih berdasarkan umur tanggal:
   * - ≤ 7 hari lalu → Redis IoT List (data belum dimigrasikan ke MongoDB)
   * - > 7 hari lalu → MongoDB (data sudah dimigrasikan oleh cron)
   */
  static async getHourlyUsage(
    meteranId: string,
    tanggal: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: HourlyUsageData | null;
  }> {
    const cacheKey = `cache:monitoring:${meteranId}:${tanggal}:hourly`;
    try {
      // Cek cache dulu
      const cached = await getRedisData(cacheKey);
      if (cached) {
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        return {
          success: true,
          message: "Berhasil mendapatkan data per jam",
          data: parsed,
        };
      }

      // Tentukan apakah data masih di Redis IoT List (≤ 7 hari) atau sudah di MongoDB
      const tanggalDate = new Date(`${tanggal}T00:00:00.000Z`);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const isInRedis = tanggalDate >= sevenDaysAgo;
      const isToday = tanggal === new Date().toISOString().slice(0, 10);
      const ttl = isToday ? TTL_MONTHLY_CURRENT : TTL_MONTHLY_PAST;

      let data: HourlyUsageData | null = null;

      if (isInRedis) {
        // ── Baca dari Redis IoT List ──────────────────────────────────
        const userId = await getUserIdFromMeter(meteranId);
        if (!userId) {
          return {
            success: false,
            message: "Pengguna untuk meteran tidak ditemukan",
            data: null,
          };
        }

        const iotKey = `iot:${userId}:${meteranId}`;
        const entries = await lrange(iotKey, 0, -1);

        if (!entries || entries.length === 0) {
          return {
            success: false,
            message: "Data per jam tidak ditemukan",
            data: null,
          };
        }

        const hourlyMap: HourlyUsageData = {};
        for (const raw of entries) {
          const parsed: any = typeof raw === "string" ? JSON.parse(raw) : raw;
          const entryDate = new Date(parsed.ts);
          // Filter hanya tanggal yang diminta (bandingkan dalam UTC)
          if (entryDate.toISOString().slice(0, 10) !== tanggal) continue;

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
      } else {
        // ── Baca dari MongoDB (data sudah dimigrasikan) ───────────────
        const start = new Date(`${tanggal}T00:00:00.000Z`);
        const end = new Date(`${tanggal}T23:59:59.999Z`);

        const result = await RiwayatPenggunaan.aggregate([
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

        const hourlyMap: HourlyUsageData = {};
        for (const row of result) {
          const hour = String(row._id).padStart(2, "0");
          hourlyMap[hour] = Math.round(row.total * 100) / 100;
        }

        data = hourlyMap;
      }

      await setRedisData(cacheKey, JSON.stringify(data), ttl);
      return {
        success: true,
        message: "Berhasil mendapatkan data per jam",
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan data per jam",
        data: null,
      };
    }
  }

  /**
   * Mendapatkan data penggunaan untuk bulan tertentu.
   * Bulan berjalan → baca dari Redis IoT List.
   * Bulan sebelumnya → baca dari MongoDB agregasi.
   */
  static async getMonthlyUsage(
    meteranId: string | Types.ObjectId,
    periode: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: MonthlyUsageData | null;
  }> {
    try {
      const meteranIdStr = meteranId.toString();
      const meter = await Meter.findById(meteranId);
      if (!meter) {
        return {
          success: false,
          message: "Meteran tidak ditemukan",
          data: null,
        };
      }

      const currentPeriode = getPeriode(new Date());
      let data: MonthlyUsageData | null = null;

      if (periode === currentPeriode) {
        const userId = await getUserIdFromMeter(meteranIdStr);
        if (userId) {
          data = await getRedisMonthlyUsage(meteranIdStr, userId, periode);
        }
      } else {
        data = await getMongoMonthlyUsage(meteranIdStr, periode);
      }

      return {
        success: true,
        message: data
          ? "Berhasil mendapatkan data penggunaan"
          : "Tidak ada data untuk periode ini",
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mendapatkan data penggunaan bulanan",
        data: null,
      };
    }
  }
}
