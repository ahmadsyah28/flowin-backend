"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = exports.RAB = exports.kelompokPelangganSeed = exports.KategoriKelompok = exports.KodeKelompok = exports.KelompokPelanggan = exports.EnumStatusPembayaran = exports.Pembayaran = exports.Notifikasi = exports.GeoLokasi = exports.Laporan = exports.RiwayatPenggunaan = exports.Tagihan = exports.Meter = exports.KoneksiData = exports.Pengguna = void 0;
var Pengguna_1 = require("./Pengguna");
Object.defineProperty(exports, "Pengguna", { enumerable: true, get: function () { return Pengguna_1.Pengguna; } });
var KoneksiData_1 = require("./KoneksiData");
Object.defineProperty(exports, "KoneksiData", { enumerable: true, get: function () { return KoneksiData_1.KoneksiData; } });
var Meter_1 = require("./Meter");
Object.defineProperty(exports, "Meter", { enumerable: true, get: function () { return Meter_1.Meter; } });
var Tagihan_1 = require("./Tagihan");
Object.defineProperty(exports, "Tagihan", { enumerable: true, get: function () { return Tagihan_1.Tagihan; } });
var RiwayatPenggunaan_1 = require("./RiwayatPenggunaan");
Object.defineProperty(exports, "RiwayatPenggunaan", { enumerable: true, get: function () { return RiwayatPenggunaan_1.RiwayatPenggunaan; } });
var Laporan_1 = require("./Laporan");
Object.defineProperty(exports, "Laporan", { enumerable: true, get: function () { return Laporan_1.Laporan; } });
var GeoLokasi_1 = require("./GeoLokasi");
Object.defineProperty(exports, "GeoLokasi", { enumerable: true, get: function () { return GeoLokasi_1.GeoLokasi; } });
var Notifikasi_1 = require("./Notifikasi");
Object.defineProperty(exports, "Notifikasi", { enumerable: true, get: function () { return Notifikasi_1.Notifikasi; } });
var Pembayaran_1 = require("./Pembayaran");
Object.defineProperty(exports, "Pembayaran", { enumerable: true, get: function () { return Pembayaran_1.Pembayaran; } });
Object.defineProperty(exports, "EnumStatusPembayaran", { enumerable: true, get: function () { return Pembayaran_1.EnumStatusPembayaran; } });
var KelompokPelanggan_1 = require("./KelompokPelanggan");
Object.defineProperty(exports, "KelompokPelanggan", { enumerable: true, get: function () { return KelompokPelanggan_1.KelompokPelanggan; } });
Object.defineProperty(exports, "KodeKelompok", { enumerable: true, get: function () { return KelompokPelanggan_1.KodeKelompok; } });
Object.defineProperty(exports, "KategoriKelompok", { enumerable: true, get: function () { return KelompokPelanggan_1.KategoriKelompok; } });
Object.defineProperty(exports, "kelompokPelangganSeed", { enumerable: true, get: function () { return KelompokPelanggan_1.kelompokPelangganSeed; } });
var RAB_1 = require("./RAB");
Object.defineProperty(exports, "RAB", { enumerable: true, get: function () { return RAB_1.RAB; } });
const Pengguna_2 = require("./Pengguna");
const KoneksiData_2 = require("./KoneksiData");
const Meter_2 = require("./Meter");
const RAB_2 = require("./RAB");
const Tagihan_2 = require("./Tagihan");
const RiwayatPenggunaan_2 = require("./RiwayatPenggunaan");
const Laporan_2 = require("./Laporan");
const GeoLokasi_2 = require("./GeoLokasi");
const Notifikasi_2 = require("./Notifikasi");
const Pembayaran_2 = require("./Pembayaran");
const KelompokPelanggan_2 = require("./KelompokPelanggan");
exports.models = {
    Pengguna: Pengguna_2.Pengguna,
    KoneksiData: KoneksiData_2.KoneksiData,
    Meter: Meter_2.Meter,
    Tagihan: Tagihan_2.Tagihan,
    RiwayatPenggunaan: RiwayatPenggunaan_2.RiwayatPenggunaan,
    Laporan: Laporan_2.Laporan,
    GeoLokasi: GeoLokasi_2.GeoLokasi,
    Notifikasi: Notifikasi_2.Notifikasi,
    Pembayaran: Pembayaran_2.Pembayaran,
    KelompokPelanggan: KelompokPelanggan_2.KelompokPelanggan,
    RAB: RAB_2.RAB,
};
exports.default = exports.models;
//# sourceMappingURL=index.js.map