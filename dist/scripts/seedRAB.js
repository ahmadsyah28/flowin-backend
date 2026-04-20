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
const RAB_1 = require("../models/RAB");
const enums_1 = require("../enums");
const TARGET_KONEKSI_DATA_ID = "69e0ba9e34bdc72790ae71ed";
const RAB_DATA = {
    totalBiaya: 750000,
    urlRab: null,
    catatan: "Biaya pemasangan pipa baru + meteran air",
};
async function main() {
    console.log("==========================================");
    console.log("   SEED RAB (Rencana Anggaran Biaya)");
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
            console.log(`  RAB hanya relevan untuk pengajuan yang sudah APPROVED.`);
            console.log(`  Lanjut membuat RAB anyway untuk testing...\n`);
        }
        const existingRAB = await RAB_1.RAB.findOne({ idKoneksiData: koneksiDataId });
        if (existingRAB) {
            console.log(`\n⟳ RAB lama ditemukan, menghapus...`);
            console.log(`  ID lama       : ${existingRAB._id}`);
            console.log(`  Status lama   : ${existingRAB.statusPembayaran}`);
            console.log(`  Total lama    : Rp ${existingRAB.totalBiaya?.toLocaleString("id-ID") ?? 0}`);
            await RAB_1.RAB.deleteOne({ _id: existingRAB._id });
            console.log(`  ✓ RAB lama dihapus`);
        }
        const uniqueOrderId = `SEED-RAB-${TARGET_KONEKSI_DATA_ID}-${Date.now()}`;
        const newRAB = await RAB_1.RAB.create({
            idKoneksiData: koneksiDataId,
            totalBiaya: RAB_DATA.totalBiaya,
            statusPembayaran: enums_1.EnumPaymentStatus.PENDING,
            orderId: uniqueOrderId,
            urlRab: RAB_DATA.urlRab,
            catatan: RAB_DATA.catatan,
        });
        console.log(`\n✓ RAB baru berhasil dibuat!`);
        console.log(`  ID            : ${newRAB._id}`);
        console.log(`  KoneksiData   : ${newRAB.idKoneksiData}`);
        console.log(`  Total Biaya   : Rp ${newRAB.totalBiaya?.toLocaleString("id-ID") ?? 0}`);
        console.log(`  Status Bayar  : ${newRAB.statusPembayaran}`);
        console.log(`  Catatan       : ${newRAB.catatan ?? "-"}`);
        console.log(`\n──────────────────────────────────────────`);
        console.log(`  SubTahap seharusnya: MENUNGGU_PEMBAYARAN_RAB`);
        console.log(`  (karena RAB ada tapi belum dibayar)`);
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
//# sourceMappingURL=seedRAB.js.map