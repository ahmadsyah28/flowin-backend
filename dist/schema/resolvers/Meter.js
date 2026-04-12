"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meterResolvers = void 0;
const authMiddleware_1 = require("@/utils/authMiddleware");
const MeterService_1 = require("@/services/MeterService");
exports.meterResolvers = {
    Query: {
        meterList: async (_, __, context) => {
            const user = (0, authMiddleware_1.requireAuth)(context);
            return MeterService_1.MeterService.getMeterList(user._id);
        },
        meterById: async (_, { id }) => {
            return MeterService_1.MeterService.getMeterById(id);
        },
        meterByNomor: async (_, { nomorMeteran }) => {
            return MeterService_1.MeterService.getMeterByNomor(nomorMeteran);
        },
    },
    Meter: {
        id: (parent) => parent._id?.toString() || parent.id,
        idKelompokPelanggan: (parent) => parent.IdKelompokPelanggan,
        idKoneksiData: (parent) => parent.IdKoneksiData,
        koneksiData: (parent) => parent.IdKoneksiData,
        nomorMeteran: (parent) => parent.NomorMeteran,
        nomorAkun: (parent) => parent.NomorAkun,
    },
};
//# sourceMappingURL=Meter.js.map