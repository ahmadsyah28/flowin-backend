import { Types } from "mongoose";
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
    dataPerJam?: DailyUsageData;
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
        chartHarian: {
            tanggal: string;
            liter: number;
        }[];
    } | null;
}
export declare class MonitoringService {
    static getDashboard(meteranId: string | Types.ObjectId): Promise<MonitoringDashboardResponse>;
    static getHistory(meteranId: string | Types.ObjectId, jumlahBulan?: number): Promise<{
        success: boolean;
        message: string;
        data: MonthlyUsageData[] | null;
    }>;
    static getHourlyUsage(meteranId: string, tanggal: string): Promise<{
        success: boolean;
        message: string;
        data: HourlyUsageData | null;
    }>;
    static getMonthlyUsage(meteranId: string | Types.ObjectId, periode: string): Promise<{
        success: boolean;
        message: string;
        data: MonthlyUsageData | null;
    }>;
}
//# sourceMappingURL=MonitoringService.d.ts.map