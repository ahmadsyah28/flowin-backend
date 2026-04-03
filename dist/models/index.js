"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = exports.Notifikasi = exports.GeoLokasi = exports.Laporan = exports.RiwayatRagihan = exports.Tagihan = exports.Meter = exports.KoneksiData = exports.Pengguna = void 0;
var Pengguna_1 = require("./Pengguna");
Object.defineProperty(exports, "Pengguna", { enumerable: true, get: function () { return Pengguna_1.Pengguna; } });
var KoneksiData_1 = require("./KoneksiData");
Object.defineProperty(exports, "KoneksiData", { enumerable: true, get: function () { return KoneksiData_1.KoneksiData; } });
var Meter_1 = require("./Meter");
Object.defineProperty(exports, "Meter", { enumerable: true, get: function () { return Meter_1.Meter; } });
var Tagihan_1 = require("./Tagihan");
Object.defineProperty(exports, "Tagihan", { enumerable: true, get: function () { return Tagihan_1.Tagihan; } });
var RiwayatRagihan_1 = require("./RiwayatRagihan");
Object.defineProperty(exports, "RiwayatRagihan", { enumerable: true, get: function () { return RiwayatRagihan_1.RiwayatRagihan; } });
var Laporan_1 = require("./Laporan");
Object.defineProperty(exports, "Laporan", { enumerable: true, get: function () { return Laporan_1.Laporan; } });
var GeoLokasi_1 = require("./GeoLokasi");
Object.defineProperty(exports, "GeoLokasi", { enumerable: true, get: function () { return GeoLokasi_1.GeoLokasi; } });
var Notifikasi_1 = require("./Notifikasi");
Object.defineProperty(exports, "Notifikasi", { enumerable: true, get: function () { return Notifikasi_1.Notifikasi; } });
const Pengguna_2 = require("./Pengguna");
const KoneksiData_2 = require("./KoneksiData");
const Meter_2 = require("./Meter");
const Tagihan_2 = require("./Tagihan");
const RiwayatRagihan_2 = require("./RiwayatRagihan");
const Laporan_2 = require("./Laporan");
const GeoLokasi_2 = require("./GeoLokasi");
const Notifikasi_2 = require("./Notifikasi");
exports.models = {
    Pengguna: Pengguna_2.Pengguna,
    KoneksiData: KoneksiData_2.KoneksiData,
    Meter: Meter_2.Meter,
    Tagihan: Tagihan_2.Tagihan,
    RiwayatRagihan: RiwayatRagihan_2.RiwayatRagihan,
    Laporan: Laporan_2.Laporan,
    GeoLokasi: GeoLokasi_2.GeoLokasi,
    Notifikasi: Notifikasi_2.Notifikasi,
};
exports.default = exports.models;
//# sourceMappingURL=index.js.map