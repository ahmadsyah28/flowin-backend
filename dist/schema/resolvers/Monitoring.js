"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringResolvers = void 0;
const authMiddleware_1 = require("../../utils/authMiddleware");
const MonitoringService_1 = require("../../services/MonitoringService");
function convertDailyDataToArray(dataHarian) {
    return Object.entries(dataHarian)
        .map(([tanggal, liter]) => ({ tanggal, liter }))
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}
function formatMonthlyData(data) {
    if (!data)
        return null;
    return {
        periode: data.periode,
        totalPenggunaan: data.totalPenggunaan,
        dataHarian: convertDailyDataToArray(data.dataHarian),
        sumber: data.sumber,
    };
}
function convertHourlyDataToArray(data) {
    return Object.entries(data)
        .map(([jam, liter]) => ({ jam, liter }))
        .sort((a, b) => a.jam.localeCompare(b.jam));
}
exports.monitoringResolvers = {
    Query: {
        monitoringDashboard: async (_, { meteranId }, context) => {
            (0, authMiddleware_1.requireAuth)(context);
            const result = await MonitoringService_1.MonitoringService.getDashboard(meteranId);
            if (!result.success || !result.data) {
                return result;
            }
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
        monitoringHistory: async (_, { meteranId, jumlahBulan = 6, }, context) => {
            (0, authMiddleware_1.requireAuth)(context);
            const result = await MonitoringService_1.MonitoringService.getHistory(meteranId, jumlahBulan);
            if (!result.success || !result.data) {
                return result;
            }
            return {
                success: result.success,
                message: result.message,
                data: result.data.map((item) => formatMonthlyData(item)),
            };
        },
        monitoringHourly: async (_, { meteranId, tanggal }, context) => {
            (0, authMiddleware_1.requireAuth)(context);
            const result = await MonitoringService_1.MonitoringService.getHourlyUsage(meteranId, tanggal);
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
                data: convertHourlyDataToArray(result.data),
            };
        },
    },
};
//# sourceMappingURL=Monitoring.js.map