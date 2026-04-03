"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pengguna_1 = require("./Pengguna");
const RiwayatPenggunaan_1 = require("./RiwayatPenggunaan");
const KoneksiData_1 = require("./KoneksiData");
const Laporan_1 = require("./Laporan");
const Meter_1 = require("./Meter");
const Notifikasi_1 = require("./Notifikasi");
const Tagihan_1 = require("./Tagihan");
const Pembayaran_1 = require("./Pembayaran");
const Monitoring_1 = require("./Monitoring");
const resolvers = {
    Pengguna: {
        id: (parent) => parent._id?.toString() || parent.id,
    },
    RiwayatPenggunaan: {
        ...RiwayatPenggunaan_1.riwayatPenggunaanResolvers.RiwayatPenggunaan,
    },
    KoneksiData: {
        ...KoneksiData_1.koneksiDataResolvers.KoneksiData,
    },
    JenisLaporan: {
        ...Laporan_1.laporanResolvers.JenisLaporan,
    },
    WorkStatusPelanggan: {
        ...Laporan_1.laporanResolvers.WorkStatusPelanggan,
    },
    Laporan: {
        ...Laporan_1.laporanResolvers.Laporan,
    },
    GeoLokasi: {
        ...Laporan_1.laporanResolvers.GeoLokasi,
    },
    Meter: {
        ...Meter_1.meterResolvers.Meter,
    },
    Notifikasi: {
        ...Notifikasi_1.notifikasiResolvers.Notifikasi,
    },
    Tagihan: {
        ...Tagihan_1.tagihanResolvers.Tagihan,
    },
    PaymentStatus: {
        ...Tagihan_1.tagihanResolvers.PaymentStatus,
    },
    Pembayaran: {
        ...Pembayaran_1.pembayaranResolvers.Pembayaran,
    },
    StatusPembayaran: {
        ...Pembayaran_1.pembayaranResolvers.StatusPembayaran,
    },
    Query: {
        hello: () => "Hello, from GraphQL server!",
        ...Pengguna_1.penggunaResolvers.Query,
        ...RiwayatPenggunaan_1.riwayatPenggunaanResolvers.Query,
        ...KoneksiData_1.koneksiDataResolvers.Query,
        ...Laporan_1.laporanResolvers.Query,
        ...Meter_1.meterResolvers.Query,
        ...Notifikasi_1.notifikasiResolvers.Query,
        ...Tagihan_1.tagihanResolvers.Query,
        ...Pembayaran_1.pembayaranResolvers.Query,
        ...Monitoring_1.monitoringResolvers.Query,
    },
    Mutation: {
        testMutation: () => "This is a test mutation response.",
        ...Pengguna_1.penggunaResolvers.Mutation,
        ...KoneksiData_1.koneksiDataResolvers.Mutation,
        ...Laporan_1.laporanResolvers.Mutation,
        ...Tagihan_1.tagihanResolvers.Mutation,
        ...Pembayaran_1.pembayaranResolvers.Mutation,
    },
    Subscription: {
        testSubscription: {
            subscribe: () => {
                return null;
            },
        },
    },
    Date: {
        serialize: (value) => {
            return value instanceof Date ? value.toISOString() : null;
        },
        parseValue: (value) => {
            return new Date(value);
        },
        parseLiteral: (ast) => {
            return new Date(ast.value);
        },
    },
    ObjectId: {
        serialize: (value) => {
            return value.toString();
        },
        parseValue: (value) => {
            return value;
        },
        parseLiteral: (ast) => {
            return ast.value;
        },
    },
};
exports.default = resolvers;
//# sourceMappingURL=index.js.map