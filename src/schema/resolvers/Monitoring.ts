/**
 * ==========================================
 * MONITORING GRAPHQL RESOLVERS
 * ==========================================
 *
 * Resolver untuk query monitoring penggunaan air.
 *
 * Flow data:
 * GraphQL Query → Resolver → MonitoringService → Redis/MongoDB
 *
 * Semua query memerlukan autentikasi (requireAuth).
 */

import { GraphQLContext } from "@/types";
import { requireAuth } from "@/utils/authMiddleware";
import {
  MonitoringService,
  MonitoringDashboardResponse,
  MonthlyUsageData,
  HourlyUsageData,
} from "@/services/MonitoringService";

// ==========================================
// HELPER: Convert service response ke GraphQL format
// ==========================================

/**
 * Konversi dataHarian dari object ke array untuk GraphQL
 *
 * Service mengembalikan: { "01": 45.7, "02": 38.2 }
 * GraphQL membutuhkan: [{ tanggal: "01", liter: 45.7 }, ...]
 */
function convertDailyDataToArray(
  dataHarian: Record<string, number>,
): { tanggal: string; liter: number }[] {
  return Object.entries(dataHarian)
    .map(([tanggal, liter]) => ({ tanggal, liter }))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal)); // Sort by date
}

/**
 * Konversi MonthlyUsageData untuk GraphQL response
 */
function formatMonthlyData(data: MonthlyUsageData | null) {
  if (!data) return null;

  return {
    periode: data.periode,
    totalPenggunaan: data.totalPenggunaan,
    dataHarian: convertDailyDataToArray(data.dataHarian),
    sumber: data.sumber,
  };
}

/**
 * Konversi hourly data dari object ke array
 */
function convertHourlyDataToArray(
  data: HourlyUsageData,
): { jam: string; liter: number }[] {
  return Object.entries(data)
    .map(([jam, liter]) => ({ jam, liter }))
    .sort((a, b) => a.jam.localeCompare(b.jam)); // Sort by hour
}

// ==========================================
// RESOLVERS
// ==========================================

export const monitoringResolvers = {
  Query: {
    /**
     * Query: monitoringDashboard
     *
     * Mendapatkan data lengkap untuk dashboard monitoring.
     * Menggabungkan data real-time dari Redis dan historis dari MongoDB.
     *
     * @param meteranId - ID meteran yang akan dimonitor
     * @returns MonitoringDashboardResponse
     *
     * Contoh query:
     * ```graphql
     * query {
     *   monitoringDashboard(meteranId: "abc123") {
     *     success
     *     message
     *     data {
     *       meteran { nomorMeteran nomorAkun }
     *       totalKeseluruhan
     *       rataRataBulanan
     *       bulanIni { totalPenggunaan dataHarian { tanggal liter } }
     *       perbandingan { bulanIni bulanLalu selisih persentase status }
     *       prediksi { prediksiAkhirBulan rataRataHarian }
     *       evaluasi { kategori deskripsi }
     *       estimasiTagihan { totalEstimasi pemakaianM3 }
     *       chartHarian { tanggal liter }
     *     }
     *   }
     * }
     * ```
     */
    monitoringDashboard: async (
      _: any,
      { meteranId }: { meteranId: string },
      context: GraphQLContext,
    ) => {
      // Pastikan user sudah login
      requireAuth(context);

      // Panggil service untuk mendapatkan data
      const result = await MonitoringService.getDashboard(meteranId);

      // Jika gagal atau tidak ada data, return langsung
      if (!result.success || !result.data) {
        return result;
      }

      // Format data untuk GraphQL
      // Konversi dataHarian dari object ke array
      return {
        success: result.success,
        message: result.message,
        data: {
          ...result.data,
          bulanIni: formatMonthlyData(result.data.bulanIni),
          bulanLalu: formatMonthlyData(result.data.bulanLalu),
        },
      };
    },

    /**
     * Query: monitoringHistory
     *
     * Mendapatkan riwayat penggunaan beberapa bulan terakhir.
     * Data diambil dari MongoDB (data yang sudah di-arsip).
     *
     * @param meteranId - ID meteran
     * @param jumlahBulan - Jumlah bulan ke belakang (default: 6)
     * @returns MonitoringHistoryResponse
     *
     * Contoh query:
     * ```graphql
     * query {
     *   monitoringHistory(meteranId: "abc123", jumlahBulan: 6) {
     *     success
     *     data {
     *       periode
     *       totalPenggunaan
     *       dataHarian { tanggal liter }
     *     }
     *   }
     * }
     * ```
     */
    monitoringHistory: async (
      _: any,
      {
        meteranId,
        jumlahBulan = 6,
      }: { meteranId: string; jumlahBulan?: number },
      context: GraphQLContext,
    ) => {
      // Pastikan user sudah login
      requireAuth(context);

      // Panggil service
      const result = await MonitoringService.getHistory(meteranId, jumlahBulan);

      // Jika gagal atau tidak ada data
      if (!result.success || !result.data) {
        return result;
      }

      // Format data untuk GraphQL
      return {
        success: result.success,
        message: result.message,
        data: result.data.map((item) => formatMonthlyData(item)),
      };
    },

    /**
     * Query: monitoringHourly
     *
     * Mendapatkan data penggunaan per jam untuk tanggal tertentu.
     * Data diambil dari Redis (hanya tersedia untuk bulan berjalan).
     *
     * @param meteranId - ID meteran
     * @param tanggal - Tanggal dalam format YYYY-MM-DD
     * @returns MonitoringHourlyResponse
     *
     * Contoh query:
     * ```graphql
     * query {
     *   monitoringHourly(meteranId: "abc123", tanggal: "2026-03-10") {
     *     success
     *     data { jam liter }
     *   }
     * }
     * ```
     */
    monitoringHourly: async (
      _: any,
      { meteranId, tanggal }: { meteranId: string; tanggal: string },
      context: GraphQLContext,
    ) => {
      // Pastikan user sudah login
      requireAuth(context);

      // Panggil service
      const result = await MonitoringService.getHourlyUsage(meteranId, tanggal);

      // Jika gagal atau tidak ada data
      if (!result.success || !result.data) {
        return {
          success: result.success,
          message: result.message,
          data: null,
        };
      }

      // Konversi data ke format array untuk GraphQL
      return {
        success: result.success,
        message: result.message,
        data: convertHourlyDataToArray(result.data),
      };
    },

    /**
     * Query: monitoringMonthlyUsage
     *
     * Mendapatkan data penggunaan harian untuk bulan tertentu.
     * Otomatis memilih sumber data berdasarkan periode.
     *
     * @param meteranId - ID meteran
     * @param periode - Periode bulan (YYYY-MM)
     * @returns MonitoringMonthlyUsageResponse
     */
    monitoringMonthlyUsage: async (
      _: any,
      { meteranId, periode }: { meteranId: string; periode: string },
      context: GraphQLContext,
    ) => {
      requireAuth(context);

      const result = await MonitoringService.getMonthlyUsage(
        meteranId,
        periode,
      );

      if (!result.success || !result.data) {
        return {
          success: result.success,
          message: result.message,
          data: null,
        };
      }

      return {
        success: result.success,
        message: result.message,
        data: formatMonthlyData(result.data),
      };
    },
  },
};
