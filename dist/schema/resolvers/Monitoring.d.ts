import { GraphQLContext } from "../../types";
import { MonitoringDashboardResponse, MonthlyUsageData } from "../../services/MonitoringService";
export declare const monitoringResolvers: {
    Query: {
        monitoringDashboard: (_: any, { meteranId }: {
            meteranId: string;
        }, context: GraphQLContext) => Promise<MonitoringDashboardResponse | {
            success: true;
            message: string;
            data: {
                bulanIni: {
                    periode: string;
                    totalPenggunaan: number;
                    dataHarian: {
                        tanggal: string;
                        liter: number;
                    }[];
                    sumber: "redis" | "mongodb";
                } | null;
                bulanLalu: {
                    periode: string;
                    totalPenggunaan: number;
                    dataHarian: {
                        tanggal: string;
                        liter: number;
                    }[];
                    sumber: "redis" | "mongodb";
                } | null;
                meteran: {
                    id: string;
                    nomorMeteran: string;
                    nomorAkun: string;
                };
                latestReading: import("../../services/MonitoringService").LatestReading | null;
                totalKeseluruhan: number;
                rataRataBulanan: number;
                perbandingan: import("../../services/MonitoringService").UsageComparison | null;
                prediksi: import("../../services/MonitoringService").UsagePrediction | null;
                evaluasi: import("../../services/MonitoringService").UsageEvaluation;
                estimasiTagihan: import("../../services/MonitoringService").BillingEstimate | null;
                chartHarian: {
                    tanggal: string;
                    liter: number;
                }[];
            };
        }>;
        monitoringHistory: (_: any, { meteranId, jumlahBulan, }: {
            meteranId: string;
            jumlahBulan?: number;
        }, context: GraphQLContext) => Promise<{
            success: boolean;
            message: string;
            data: MonthlyUsageData[] | null;
        } | {
            success: true;
            message: string;
            data: ({
                periode: string;
                totalPenggunaan: number;
                dataHarian: {
                    tanggal: string;
                    liter: number;
                }[];
                sumber: "redis" | "mongodb";
            } | null)[];
        }>;
        monitoringHourly: (_: any, { meteranId, tanggal }: {
            meteranId: string;
            tanggal: string;
        }, context: GraphQLContext) => Promise<{
            success: boolean;
            message: string;
            data: null;
        } | {
            success: true;
            message: string;
            data: {
                jam: string;
                liter: number;
            }[];
        }>;
        monitoringMonthlyUsage: (_: any, { meteranId, periode }: {
            meteranId: string;
            periode: string;
        }, context: GraphQLContext) => Promise<{
            success: boolean;
            message: string;
            data: null;
        } | {
            success: true;
            message: string;
            data: {
                periode: string;
                totalPenggunaan: number;
                dataHarian: {
                    tanggal: string;
                    liter: number;
                }[];
                sumber: "redis" | "mongodb";
            } | null;
        }>;
    };
};
//# sourceMappingURL=Monitoring.d.ts.map