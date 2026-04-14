/**
 * ==========================================
 * MONITORING SERVICE
 * ==========================================
 *
 * Service untuk fitur monitoring penggunaan air pelanggan.
 *
 * ARSITEKTUR DATA:
 * ----------------
 * 1. Redis (Bulan Berjalan):
 *    - Menyimpan data real-time dari IoT sensor
 *    - Format key: usage:{meteranId}:{YYYY-MM}:daily (Hash)
 *                  usage:{meteranId}:{YYYY-MM-DD}:hourly (Hash)
 *                  usage:{meteranId}:{YYYY-MM}:total (String)
 *                  usage:{meteranId}:latest (String/JSON)
 *
 * 2. MongoDB (Bulan Sebelumnya):
 *    - Data yang sudah di-migrate dari Redis oleh admin
 *    - Collection: RiwayatPenggunaan
 *
 * ALUR DATA:
 * ----------
 * IoT Sensor → Redis (buffer 1 bulan) → MongoDB (arsip permanen)
 *
 * Note: Service ini READ-ONLY. Tidak menulis ke Redis/MongoDB.
 *       Penulisan dilakukan oleh IoT gateway dan admin migration.
 */

import { Types } from "mongoose";
import { RiwayatPenggunaan, IRiwayatPenggunaan } from "@/models";
import { Meter, IMeter } from "@/models/Meter";
import {
  KelompokPelanggan,
  IKelompokPelanggan,
} from "@/models/KelompokPelanggan";
import { hgetall, getRedisData } from "@/config/redis";

// ==========================================
// INTERFACES - Definisi tipe data
// ==========================================

/**
 * Data pembacaan terakhir dari sensor IoT
 * Disimpan di Redis key: usage:{meteranId}:latest
 */
export interface LatestReading {
  volume: number; // Volume pembacaan dalam liter
  timestamp: string; // Waktu pembacaan ISO format
  meteranId: string;
}

/**
 * Data harian - penggunaan per hari dalam sebulan
 * Key: tanggal (DD), Value: liter
 */
export interface DailyUsageData {
  [date: string]: number;
}

/**
 * Data per jam - penggunaan per jam dalam sehari
 * Key: jam (HH), Value: liter
 */
export interface HourlyUsageData {
  [hour: string]: number;
}

/**
 * Data penggunaan untuk satu bulan
 * Bisa dari Redis (bulan ini) atau MongoDB (bulan lalu)
 */
export interface MonthlyUsageData {
  periode: string; // Format: "YYYY-MM"
  totalPenggunaan: number; // Total liter dalam bulan
  dataHarian: DailyUsageData; // Breakdown per hari
  dataPerJam?: DailyUsageData; // Breakdown per jam (optional)
  sumber: "redis" | "mongodb"; // Sumber data
}

/**
 * Statistik perbandingan dengan bulan sebelumnya
 */
export interface UsageComparison {
  bulanIni: number; // Total penggunaan bulan ini (liter)
  bulanLalu: number; // Total penggunaan bulan lalu (liter)
  selisih: number; // Selisih (positif = naik, negatif = turun)
  persentase: number; // Persentase perubahan
  status: "naik" | "turun" | "sama"; // Status perubahan
}

/**
 * Prediksi penggunaan sampai akhir bulan
 */
export interface UsagePrediction {
  hariTerlewati: number; // Jumlah hari yang sudah lewat
  hariTersisa: number; // Jumlah hari tersisa dalam bulan
  totalHari: number; // Total hari dalam bulan
  rataRataHarian: number; // Rata-rata penggunaan per hari (liter)
  prediksiAkhirBulan: number; // Prediksi total akhir bulan (liter)
  penggunaanSaatIni: number; // Penggunaan sampai saat ini (liter)
}

/**
 * Estimasi tagihan berdasarkan tarif PDAM
 */
export interface BillingEstimate {
  pemakaianM3: number; // Pemakaian dalam m³ (kubik)
  tarifRendah: number; // Tarif 0-10 m³
  tarifTinggi: number; // Tarif >10 m³
  batasRendah: number; // Batas pemakaian rendah (biasanya 10 m³)
  biayaPemakaian: number; // Biaya pemakaian air
  biayaBeban: number; // Biaya beban bulanan
  totalEstimasi: number; // Total estimasi tagihan
  kelompok: {
    kode: string;
    nama: string;
    kategori: string;
  };
}

/**
 * Evaluasi kategori penggunaan air
 */
export interface UsageEvaluation {
  kategori: "hemat" | "normal" | "boros"; // Kategori penggunaan
  deskripsi: string; // Penjelasan kategori
  rataRataBulanan: number; // Rata-rata penggunaan bulanan (liter)
  batasHemat: number; // Batas kategori hemat
  batasBoros: number; // Batas kategori boros
}

/**
 * Response lengkap untuk dashboard monitoring
 */
export interface MonitoringDashboardResponse {
  success: boolean;
  message: string;
  data: {
    // Info Meteran
    meteran: {
      id: string;
      nomorMeteran: string;
      nomorAkun: string;
    };
    // Pembacaan terakhir
    latestReading: LatestReading | null;
    // Penggunaan bulan ini
    bulanIni: MonthlyUsageData | null;
    // Penggunaan bulan lalu
    bulanLalu: MonthlyUsageData | null;
    // Total keseluruhan (semua waktu)
    totalKeseluruhan: number;
    // Rata-rata bulanan
    rataRataBulanan: number;
    // Perbandingan dengan bulan lalu
    perbandingan: UsageComparison | null;
    // Prediksi akhir bulan
    prediksi: UsagePrediction | null;
    // Evaluasi penggunaan
    evaluasi: UsageEvaluation;
    // Estimasi tagihan
    estimasiTagihan: BillingEstimate | null;
    // Data chart harian (7 hari terakhir)
    chartHarian: { tanggal: string; liter: number }[];
  } | null;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Mendapatkan jumlah hari dalam bulan tertentu
 * @param year - Tahun (YYYY)
 * @param month - Bulan (1-12)
 * @returns Jumlah hari dalam bulan tersebut
 *
 * Contoh: getDaysInMonth(2026, 2) → 28 (Februari 2026)
 */
function getDaysInMonth(year: number, month: number): number {
  // Month di Date adalah 0-indexed, jadi kita set ke bulan berikutnya dan hari 0
  // Hari 0 berarti hari terakhir bulan sebelumnya
  return new Date(year, month, 0).getDate();
}

/**
 * Mendapatkan periode bulan dalam format YYYY-MM
 * @param date - Objek Date
 * @returns String format "YYYY-MM"
 *
 * Contoh: getPeriode(new Date("2026-03-10")) → "2026-03"
 */
function getPeriode(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Mendapatkan periode bulan sebelumnya
 * @param date - Objek Date acuan
 * @returns String format "YYYY-MM" untuk bulan sebelumnya
 *
 * Contoh: getPreviousPeriode(new Date("2026-03-10")) → "2026-02"
 */
function getPreviousPeriode(date: Date): string {
  const prevDate = new Date(date);
  prevDate.setMonth(prevDate.getMonth() - 1);
  return getPeriode(prevDate);
}

/**
 * Konversi liter ke meter kubik (m³)
 * @param liter - Volume dalam liter
 * @returns Volume dalam m³
 *
 * 1 m³ = 1000 liter
 * Contoh: literToM3(5500) → 5.5
 */
function literToM3(liter: number): number {
  return liter / 1000;
}

/**
 * Menghitung biaya tagihan berdasarkan tarif PDAM
 * @param kelompok - Data kelompok pelanggan dengan tarif
 * @param pemakaianM3 - Pemakaian dalam m³
 * @returns Object dengan breakdown biaya
 *
 * Struktur tarif PDAM:
 * - 0-10 m³: Tarif rendah (per m³)
 * - >10 m³: Tarif tinggi (per m³) untuk kelebihan
 * - Biaya beban: Biaya tetap bulanan
 *
 * Contoh: pemakaian 15 m³ dengan tarif RT-1 (Rp5.500 / Rp6.000)
 * = (10 x 5.500) + (5 x 6.000) + 10.000 (beban)
 * = 55.000 + 30.000 + 10.000
 * = Rp95.000
 */
function hitungTagihan(
  kelompok: IKelompokPelanggan,
  pemakaianM3: number,
): { biayaPemakaian: number; biayaBeban: number; total: number } {
  // Jika kelompok menggunakan tarif kesepakatan (custom)
  if (kelompok.IsKesepakatan) {
    return {
      biayaPemakaian: 0,
      biayaBeban: kelompok.BiayaBeban,
      total: kelompok.BiayaBeban,
    };
  }

  let biayaPemakaian = 0;

  if (pemakaianM3 <= kelompok.BatasRendah) {
    // Semua pemakaian di bawah batas → gunakan tarif rendah
    biayaPemakaian = pemakaianM3 * kelompok.TarifRendah;
  } else {
    // Pemakaian melebihi batas:
    // - 0 sampai BatasRendah m³ → tarif rendah
    // - Sisanya → tarif tinggi
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

// ==========================================
// REDIS DATA ACCESS
// ==========================================

/**
 * Mendapatkan data penggunaan bulan ini dari Redis
 *
 * Redis menyimpan data IoT dengan struktur:
 * - usage:{meteranId}:{YYYY-MM}:daily → Hash { "01": 45.7, "02": 38.2, ... }
 * - usage:{meteranId}:{YYYY-MM}:total → String "1234.5"
 *
 * @param meteranId - ID meteran
 * @param periode - Periode bulan (YYYY-MM)
 * @returns MonthlyUsageData atau null jika tidak ada
 */
async function getRedisMonthlyUsage(
  meteranId: string,
  periode: string,
): Promise<MonthlyUsageData | null> {
  try {
    // Key untuk data harian: usage:{meteranId}:{YYYY-MM}:daily
    const dailyKey = `usage:${meteranId}:${periode}:daily`;

    // Key untuk total bulanan: usage:{meteranId}:{YYYY-MM}:total
    const totalKey = `usage:${meteranId}:${periode}:total`;

    // Ambil data harian dari Redis Hash
    const dailyData = await hgetall(dailyKey);

    // Ambil total dari Redis String
    const totalStr = await getRedisData(totalKey);
    const total = totalStr ? parseFloat(totalStr) : 0;

    // Jika tidak ada data sama sekali, return null
    if (!dailyData && !totalStr) {
      return null;
    }

    // Konversi data harian ke format yang konsisten
    const dataHarian: DailyUsageData = {};
    if (dailyData) {
      Object.entries(dailyData).forEach(([date, value]) => {
        dataHarian[date] =
          typeof value === "number" ? value : parseFloat(value);
      });
    }

    return {
      periode,
      totalPenggunaan: total,
      dataHarian,
      sumber: "redis",
    };
  } catch (error) {
    console.error(`Error getting Redis data for ${meteranId}:`, error);
    return null;
  }
}

/**
 * Mendapatkan pembacaan terakhir dari sensor IoT
 *
 * Data disimpan di: usage:{meteranId}:latest
 * Format JSON: { "volume": 123.45, "timestamp": "2026-03-10T10:30:00Z" }
 *
 * @param meteranId - ID meteran
 * @returns LatestReading atau null
 */
async function getLatestReading(
  meteranId: string,
): Promise<LatestReading | null> {
  try {
    const latestKey = `usage:${meteranId}:latest`;
    const data = await getRedisData(latestKey);

    if (!data) {
      return null;
    }

    // Parse JSON string
    const parsed = JSON.parse(data);
    return {
      volume: parsed.volume || 0,
      timestamp: parsed.timestamp || new Date().toISOString(),
      meteranId,
    };
  } catch (error) {
    console.error(`Error getting latest reading for ${meteranId}:`, error);
    return null;
  }
}

// ==========================================
// MONGODB DATA ACCESS
// ==========================================

/**
 * Mendapatkan data penggunaan dari MongoDB
 *
 * MongoDB menyimpan data yang sudah di-migrate dari Redis.
 * Data bulan sebelumnya disimpan setelah proses migrasi admin.
 *
 * @param meteranId - ID meteran (ObjectId)
 * @param periode - Periode bulan (YYYY-MM)
 * @returns MonthlyUsageData atau null
 */
async function getMongoMonthlyUsage(
  meteranId: Types.ObjectId | string,
  periode: string,
): Promise<MonthlyUsageData | null> {
  try {
    const riwayat = await RiwayatPenggunaan.findOne({
      MeteranId: meteranId,
      Periode: periode,
    });

    if (!riwayat) {
      return null;
    }

    // Convert Mongoose Map ke plain object
    const dataHarian: DailyUsageData = {};
    if (riwayat.DataHarian) {
      riwayat.DataHarian.forEach((value, key) => {
        dataHarian[key] = value;
      });
    }

    return {
      periode: riwayat.Periode,
      totalPenggunaan: riwayat.TotalPenggunaan,
      dataHarian,
      sumber: "mongodb",
    };
  } catch (error) {
    console.error(`Error getting MongoDB data for ${meteranId}:`, error);
    return null;
  }
}

/**
 * Mendapatkan total keseluruhan penggunaan sepanjang waktu
 *
 * Menghitung jumlah dari semua record di MongoDB untuk meteran tertentu.
 *
 * @param meteranId - ID meteran
 * @returns Total penggunaan dalam liter
 */
async function getTotalAllTime(
  meteranId: Types.ObjectId | string,
): Promise<number> {
  try {
    // Gunakan aggregation untuk sum semua TotalPenggunaan
    const result = await RiwayatPenggunaan.aggregate([
      { $match: { MeteranId: new Types.ObjectId(meteranId.toString()) } },
      { $group: { _id: null, total: { $sum: "$TotalPenggunaan" } } },
    ]);

    return result.length > 0 ? result[0].total : 0;
  } catch (error) {
    console.error(`Error calculating total for ${meteranId}:`, error);
    return 0;
  }
}

/**
 * Mendapatkan rata-rata penggunaan bulanan
 *
 * Hitung dari history 6 bulan terakhir di MongoDB.
 *
 * @param meteranId - ID meteran
 * @returns Rata-rata penggunaan bulanan dalam liter
 */
async function getMonthlyAverage(
  meteranId: Types.ObjectId | string,
): Promise<number> {
  try {
    // Ambil 6 bulan terakhir untuk kalkulasi rata-rata
    const riwayat = await RiwayatPenggunaan.find({
      MeteranId: meteranId,
    })
      .sort({ Periode: -1 })
      .limit(6);

    if (riwayat.length === 0) {
      return 0;
    }

    // Hitung rata-rata
    const total = riwayat.reduce((sum, r) => sum + r.TotalPenggunaan, 0);
    return Math.round(total / riwayat.length);
  } catch (error) {
    console.error(`Error calculating average for ${meteranId}:`, error);
    return 0;
  }
}

// ==========================================
// CALCULATION FUNCTIONS
// ==========================================

/**
 * Menghitung perbandingan penggunaan bulan ini vs bulan lalu
 *
 * @param bulanIni - Total penggunaan bulan ini (liter)
 * @param bulanLalu - Total penggunaan bulan lalu (liter)
 * @returns UsageComparison dengan detail perbandingan
 */
function calculateComparison(
  bulanIni: number,
  bulanLalu: number,
): UsageComparison {
  const selisih = bulanIni - bulanLalu;

  // Hitung persentase perubahan
  // Hindari division by zero
  const persentase =
    bulanLalu > 0 ? Math.round((selisih / bulanLalu) * 100) : 0;

  // Tentukan status
  let status: "naik" | "turun" | "sama";
  if (selisih > 0) {
    status = "naik";
  } else if (selisih < 0) {
    status = "turun";
  } else {
    status = "sama";
  }

  return {
    bulanIni,
    bulanLalu,
    selisih,
    persentase,
    status,
  };
}

/**
 * Menghitung prediksi penggunaan sampai akhir bulan
 *
 * Logika:
 * 1. Hitung rata-rata penggunaan per hari dari hari yang sudah lewat
 * 2. Kalikan dengan total hari dalam bulan untuk prediksi
 *
 * @param penggunaanSaatIni - Total penggunaan sampai hari ini
 * @param tanggalHariIni - Tanggal hari ini
 * @returns UsagePrediction
 */
function calculatePrediction(
  penggunaanSaatIni: number,
  tanggalHariIni: Date,
): UsagePrediction {
  const tahun = tanggalHariIni.getFullYear();
  const bulan = tanggalHariIni.getMonth() + 1;
  const tanggal = tanggalHariIni.getDate();

  // Total hari dalam bulan ini
  const totalHari = getDaysInMonth(tahun, bulan);

  // Hari yang sudah terlewati (termasuk hari ini)
  const hariTerlewati = tanggal;

  // Hari yang tersisa
  const hariTersisa = totalHari - hariTerlewati;

  // Rata-rata penggunaan per hari
  const rataRataHarian =
    hariTerlewati > 0 ? Math.round(penggunaanSaatIni / hariTerlewati) : 0;

  // Prediksi total akhir bulan
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

/**
 * Mengevaluasi kategori penggunaan air
 *
 * Kategori berdasarkan rata-rata bulanan:
 * - Hemat: < 5000 liter/bulan (5 m³)
 * - Normal: 5000-15000 liter/bulan (5-15 m³)
 * - Boros: > 15000 liter/bulan (15 m³)
 *
 * Angka ini berdasarkan standar penggunaan rumah tangga.
 *
 * @param rataRataBulanan - Rata-rata penggunaan bulanan (liter)
 * @returns UsageEvaluation
 */
function evaluateUsage(rataRataBulanan: number): UsageEvaluation {
  const batasHemat = 5000; // 5 m³
  const batasBoros = 15000; // 15 m³

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

  return {
    kategori,
    deskripsi,
    rataRataBulanan,
    batasHemat,
    batasBoros,
  };
}

/**
 * Membuat data chart untuk 7 hari terakhir
 *
 * Menggabungkan data dari bulan ini dan bulan lalu jika diperlukan.
 * Contoh: tanggal 3 Maret, akan ambil 28 Feb - 3 Mar.
 *
 * @param bulanIni - Data bulan ini
 * @param bulanLalu - Data bulan lalu
 * @param tanggalHariIni - Tanggal hari ini
 * @returns Array data untuk chart
 */
function buildDailyChart(
  bulanIni: MonthlyUsageData | null,
  bulanLalu: MonthlyUsageData | null,
  tanggalHariIni: Date,
): { tanggal: string; liter: number }[] {
  const result: { tanggal: string; liter: number }[] = [];

  // Loop 7 hari ke belakang
  for (let i = 6; i >= 0; i--) {
    const date = new Date(tanggalHariIni);
    date.setDate(date.getDate() - i);

    const periode = getPeriode(date);
    const tanggal = String(date.getDate()).padStart(2, "0");

    // Format untuk display: "DD/MM"
    const displayDate = `${tanggal}/${String(date.getMonth() + 1).padStart(2, "0")}`;

    // Cari data dari source yang sesuai
    let liter = 0;
    if (bulanIni && periode === bulanIni.periode) {
      liter = bulanIni.dataHarian[tanggal] || 0;
    } else if (bulanLalu && periode === bulanLalu.periode) {
      liter = bulanLalu.dataHarian[tanggal] || 0;
    }

    result.push({
      tanggal: displayDate,
      liter: Math.round(liter),
    });
  }

  return result;
}

// ==========================================
// MAIN SERVICE CLASS
// ==========================================

export class MonitoringService {
  /**
   * Mendapatkan data dashboard monitoring lengkap
   *
   * Ini adalah method utama yang dipanggil oleh GraphQL resolver.
   * Menggabungkan data dari Redis (bulan ini) dan MongoDB (bulan lalu),
   * menghitung statistik, dan menyiapkan data untuk UI.
   *
   * @param meteranId - ID meteran yang akan dimonitor
   * @returns MonitoringDashboardResponse dengan semua data dashboard
   *
   * Flow:
   * 1. Validasi meteran exists
   * 2. Ambil data bulan ini dari Redis
   * 3. Ambil data bulan lalu dari MongoDB
   * 4. Hitung statistik dan prediksi
   * 5. Ambil tarif dan hitung estimasi tagihan
   * 6. Return response lengkap
   */
  static async getDashboard(
    meteranId: string | Types.ObjectId,
  ): Promise<MonitoringDashboardResponse> {
    try {
      // ========================================
      // STEP 1: Validasi meteran
      // ========================================
      const meter = await Meter.findById(meteranId).populate(
        "IdKelompokPelanggan",
      );

      if (!meter) {
        return {
          success: false,
          message: "Meteran tidak ditemukan",
          data: null,
        };
      }

      const meteranIdStr = meteranId.toString();
      const now = new Date();
      const periodeIni = getPeriode(now);
      const periodeLalu = getPreviousPeriode(now);

      // ========================================
      // STEP 2: Ambil data dari Redis & MongoDB
      // ========================================

      // Data bulan ini dari Redis (IoT real-time)
      const bulanIni = await getRedisMonthlyUsage(meteranIdStr, periodeIni);

      // Data bulan lalu dari MongoDB (archived)
      const bulanLalu = await getMongoMonthlyUsage(meteranId, periodeLalu);

      // Pembacaan terakhir dari sensor
      const latestReading = await getLatestReading(meteranIdStr);

      // ========================================
      // STEP 3: Hitung statistik historis
      // ========================================

      // Total keseluruhan (semua bulan di MongoDB + bulan ini di Redis)
      const totalMongo = await getTotalAllTime(meteranId);
      const totalBulanIni = bulanIni?.totalPenggunaan || 0;
      const totalKeseluruhan = totalMongo + totalBulanIni;

      // Rata-rata bulanan dari 6 bulan terakhir
      const rataRataBulanan = await getMonthlyAverage(meteranId);

      // ========================================
      // STEP 4: Hitung perbandingan & prediksi
      // ========================================

      // Perbandingan dengan bulan lalu
      let perbandingan: UsageComparison | null = null;
      if (bulanLalu) {
        perbandingan = calculateComparison(
          totalBulanIni,
          bulanLalu.totalPenggunaan,
        );
      }

      // Prediksi akhir bulan
      let prediksi: UsagePrediction | null = null;
      if (totalBulanIni > 0) {
        prediksi = calculatePrediction(totalBulanIni, now);
      }

      // Evaluasi kategori penggunaan
      const evaluasi = evaluateUsage(
        rataRataBulanan > 0 ? rataRataBulanan : totalBulanIni,
      );

      // ========================================
      // STEP 5: Hitung estimasi tagihan
      // ========================================

      let estimasiTagihan: BillingEstimate | null = null;

      // Ambil data kelompok pelanggan untuk tarif
      const kelompok = await KelompokPelanggan.findById(
        meter.IdKelompokPelanggan,
      );

      if (kelompok) {
        // Gunakan penggunaan bulan ini untuk estimasi tagihan
        const pemakaianLiter = totalBulanIni;
        const pemakaianM3 = literToM3(pemakaianLiter);

        const tagihan = hitungTagihan(kelompok, pemakaianM3);

        estimasiTagihan = {
          pemakaianM3: Math.round(pemakaianM3 * 100) / 100, // 2 decimal
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

      // ========================================
      // STEP 6: Build chart data
      // ========================================

      const chartHarian = buildDailyChart(bulanIni, bulanLalu, now);

      // ========================================
      // STEP 7: Return response
      // ========================================

      return {
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
          totalKeseluruhan,
          rataRataBulanan,
          perbandingan,
          prediksi,
          evaluasi,
          estimasiTagihan,
          chartHarian,
        },
      };
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
   * Mendapatkan data historis penggunaan
   *
   * Mengambil riwayat penggunaan dari beberapa bulan terakhir.
   * Data ini bisa digunakan untuk chart historis di UI.
   *
   * @param meteranId - ID meteran
   * @param jumlahBulan - Jumlah bulan ke belakang (default: 6)
   * @returns Array MonthlyUsageData
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
      // Ambil dari MongoDB
      const riwayat = await RiwayatPenggunaan.find({
        MeteranId: meteranId,
      })
        .sort({ Periode: -1 })
        .limit(jumlahBulan);

      const data: MonthlyUsageData[] = riwayat.map((r) => {
        const dataHarian: DailyUsageData = {};
        if (r.DataHarian) {
          r.DataHarian.forEach((value, key) => {
            dataHarian[key] = value;
          });
        }

        return {
          periode: r.Periode,
          totalPenggunaan: r.TotalPenggunaan,
          dataHarian,
          sumber: "mongodb" as const,
        };
      });

      return {
        success: true,
        message: "Berhasil mendapatkan riwayat penggunaan",
        data,
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
   * Mendapatkan data per jam untuk hari tertentu
   *
   * Untuk menampilkan breakdown penggunaan per jam dalam sehari.
   *
   * @param meteranId - ID meteran
   * @param tanggal - Tanggal dalam format YYYY-MM-DD
   * @returns Data penggunaan per jam
   */
  static async getHourlyUsage(
    meteranId: string,
    tanggal: string, // Format: YYYY-MM-DD
  ): Promise<{
    success: boolean;
    message: string;
    data: HourlyUsageData | null;
  }> {
    try {
      // Key Redis: usage:{meteranId}:{YYYY-MM-DD}:hourly
      const hourlyKey = `usage:${meteranId}:${tanggal}:hourly`;

      const hourlyData = await hgetall(hourlyKey);

      if (!hourlyData) {
        return {
          success: false,
          message: "Data per jam tidak ditemukan untuk tanggal tersebut",
          data: null,
        };
      }

      // Konversi ke format yang konsisten
      const data: HourlyUsageData = {};
      Object.entries(hourlyData).forEach(([hour, value]) => {
        data[hour] =
          typeof value === "number" ? value : parseFloat(String(value));
      });

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
   * Mendapatkan data penggunaan harian untuk bulan tertentu
   *
   * Otomatis memilih sumber data:
   * - Bulan berjalan → Redis (IoT real-time)
   * - Bulan sebelumnya → MongoDB (arsip)
   *
   * @param meteranId - ID meteran
   * @param periode - Periode bulan (YYYY-MM)
   * @returns MonthlyUsageData atau null
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
      const meter = await Meter.findById(meteranId);
      if (!meter) {
        return {
          success: false,
          message: "Meteran tidak ditemukan",
          data: null,
        };
      }

      const now = new Date();
      const currentPeriode = getPeriode(now);
      const meteranIdStr = meteranId.toString();

      let data: MonthlyUsageData | null = null;

      if (periode === currentPeriode) {
        // Bulan berjalan - ambil dari Redis
        data = await getRedisMonthlyUsage(meteranIdStr, periode);
      } else {
        // Bulan sebelumnya - ambil dari MongoDB
        data = await getMongoMonthlyUsage(meteranId, periode);
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
