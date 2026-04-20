"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const database_1 = require("../config/database");
const mongoose_1 = require("mongoose");
const KoneksiData_1 = require("../models/KoneksiData");
const Meter_1 = require("../models/Meter");
const KelompokPelanggan_1 = require("../models/KelompokPelanggan");
const TARGET_KONEKSI_DATA_ID = "69e0bc8034bdc72790ae71fb";
const TARGET_KODE_KELOMPOK = KelompokPelanggan_1.KodeKelompok.RUMAH_TANGGA_A;
const METER_DATA = {
    NomorMeteran: `MTR-${Date.now()}`,
    NomorAkun: `AKN-${Date.now()}`,
};
async function main() {
    console.log("==========================================");
    console.log("   SEED METER (Meteran Air)");
    console.log("==========================================\n");
    try {
        await (0, database_1.connectDB)();
        const koneksiDataId = new mongoose_1.Types.ObjectId(TARGET_KONEKSI_DATA_ID);
        const koneksiData = await KoneksiData_1.KoneksiData.findById(koneksiDataId);
        if (!koneksiData) {
            throw new Error(`KoneksiData dengan ID ${TARGET_KONEKSI_DATA_ID} tidak ditemukan!`);
        }
        console.log(`✓ KoneksiData ditemukan`);
        console.log(`  ID        : ${koneksiData._id}`);
        console.log(`  Status    : ${koneksiData.StatusPengajuan}`);
        console.log(`  Pelanggan : ${koneksiData.IdPelanggan}`);
        if (koneksiData.StatusPengajuan !== "APPROVED") {
            console.log(`\n⚠ Status bukan APPROVED (${koneksiData.StatusPengajuan}).`);
            console.log(`  Meter hanya relevan untuk pengajuan yang sudah APPROVED.`);
            console.log(`  Lanjut membuat Meter anyway untuk testing...\n`);
        }
        const kelompok = await KelompokPelanggan_1.KelompokPelanggan.findOne({
            KodeKelompok: TARGET_KODE_KELOMPOK,
        });
        if (!kelompok) {
            throw new Error(`KelompokPelanggan "${TARGET_KODE_KELOMPOK}" tidak ditemukan! Jalankan seed:kelompok terlebih dahulu.`);
        }
        console.log(`\n✓ KelompokPelanggan ditemukan`);
        console.log(`  Kode      : ${kelompok.KodeKelompok}`);
        console.log(`  Nama      : ${kelompok.NamaKelompok}`);
        console.log(`  Kategori  : ${kelompok.Kategori}`);
        const existingMeter = await Meter_1.Meter.findOne({
            IdKoneksiData: koneksiDataId,
        });
        if (existingMeter) {
            console.log(`\n⟳ Meter lama ditemukan, menghapus...`);
            console.log(`  ID lama         : ${existingMeter._id}`);
            console.log(`  Nomor lama      : ${existingMeter.NomorMeteran}`);
            console.log(`  Akun lama       : ${existingMeter.NomorAkun}`);
            await Meter_1.Meter.deleteOne({ _id: existingMeter._id });
            console.log(`  ✓ Meter lama dihapus`);
        }
        const newMeter = await Meter_1.Meter.create({
            IdKelompokPelanggan: kelompok._id,
            IdKoneksiData: koneksiDataId,
            NomorMeteran: METER_DATA.NomorMeteran,
            NomorAkun: METER_DATA.NomorAkun,
        });
        console.log(`\n✓ Meter baru berhasil dibuat!`);
        console.log(`  ID              : ${newMeter._id}`);
        console.log(`  KoneksiData     : ${newMeter.IdKoneksiData}`);
        console.log(`  Kelompok        : ${kelompok.KodeKelompok} - ${kelompok.NamaKelompok}`);
        console.log(`  Nomor Meteran   : ${newMeter.NomorMeteran}`);
        console.log(`  Nomor Akun      : ${newMeter.NomorAkun}`);
        console.log(`\n──────────────────────────────────────────`);
        console.log(`  SubTahap seharusnya: AKTIF`);
        console.log(`  (karena Meter sudah ada untuk KoneksiData ini)`);
        console.log(`──────────────────────────────────────────\n`);
    }
    catch (error) {
        console.error(`\n✗ Error: ${error.message}`);
    }
    finally {
        await (0, database_1.disconnectDB)();
        process.exit(0);
    }
}
main();
//# sourceMappingURL=seedMeter.js.map