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
const Meter_1 = require("../models/Meter");
const KelompokPelanggan_1 = require("../models/KelompokPelanggan");
const Tagihan_1 = require("../models/Tagihan");
const Pembayaran_1 = require("../models/Pembayaran");
const enums_1 = require("../enums");
const TARGET_USER_ID = "69d0cb64ec09d8618dfb3c63";
const TARGET_KONEKSI_DATA_ID = "69d0ccabec09d8618dfb3c71";
function hitungBiaya(kelompok, pemakaianM3) {
    let biaya = 0;
    if (pemakaianM3 <= kelompok.BatasRendah) {
        biaya = pemakaianM3 * kelompok.TarifRendah;
    }
    else {
        biaya =
            kelompok.BatasRendah * kelompok.TarifRendah +
                (pemakaianM3 - kelompok.BatasRendah) * kelompok.TarifTinggi;
    }
    biaya = Math.round(biaya);
    const totalBiaya = biaya + kelompok.BiayaBeban;
    return { biaya, totalBiaya };
}
async function main() {
    console.log("==========================================");
    console.log("   SEED UJI COBA PEMBAYARAN");
    console.log("==========================================\n");
    try {
        await (0, database_1.connectDB)();
        const meter = await Meter_1.Meter.findOne({
            IdKoneksiData: new mongoose_1.Types.ObjectId(TARGET_KONEKSI_DATA_ID),
        });
        if (!meter) {
            throw new Error(`Meter tidak ditemukan. Jalankan seed:mongo terlebih dahulu!`);
        }
        console.log(`✓ Meter: ${meter.NomorMeteran} (${meter._id})`);
        const kelompok = await KelompokPelanggan_1.KelompokPelanggan.findById(meter.IdKelompokPelanggan);
        if (!kelompok) {
            throw new Error(`KelompokPelanggan tidak ditemukan`);
        }
        console.log(`✓ Kelompok: ${kelompok.KodeKelompok} - ${kelompok.NamaKelompok}`);
        const existingPending = await Tagihan_1.Tagihan.findOne({
            IdMeteran: meter._id,
            StatusPembayaran: enums_1.EnumPaymentStatus.PENDING,
        });
        if (existingPending) {
            console.log(`\n⚠️  Sudah ada tagihan PENDING: Periode ${existingPending.Periode} - Rp${existingPending.TotalBiaya.toLocaleString()}`);
            console.log(`   ID: ${existingPending._id}`);
            console.log(`\n💡 Tagihan ini bisa langsung digunakan untuk uji pembayaran.`);
            console.log(`   Tidak perlu buat baru.\n`);
            return;
        }
        const lastTagihan = await Tagihan_1.Tagihan.findOne({ IdMeteran: meter._id }).sort({
            Periode: -1,
        });
        const lastPemakaian = lastTagihan?.PenggunaanSekarang ?? 0;
        const lastPeriode = lastTagihan?.Periode ?? "2026-03";
        const [year, month] = lastPeriode.split("-").map(Number);
        const nextMonth = month >= 12 ? 1 : month + 1;
        const nextYear = month >= 12 ? year + 1 : year;
        const newPeriode = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
        const pemakaianM3 = Math.round((Math.random() * (4.0 - 2.5) + 2.5) * 100) / 100;
        const { biaya, totalBiaya } = hitungBiaya(kelompok, pemakaianM3);
        const oldTagihan = await Tagihan_1.Tagihan.findOne({
            IdMeteran: meter._id,
            Periode: newPeriode,
        });
        if (oldTagihan) {
            await Pembayaran_1.Pembayaran.deleteMany({
                IdTagihan: oldTagihan._id,
                IdPengguna: new mongoose_1.Types.ObjectId(TARGET_USER_ID),
            });
            console.log(`🗑️  Hapus pembayaran lama untuk periode ${newPeriode}`);
        }
        const namaBulan = [
            "",
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
        ];
        const tagihan = await Tagihan_1.Tagihan.findOneAndUpdate({ IdMeteran: meter._id, Periode: newPeriode }, {
            IdMeteran: meter._id,
            Periode: newPeriode,
            PenggunaanSebelum: lastPemakaian,
            PenggunaanSekarang: lastPemakaian + pemakaianM3,
            TotalPemakaian: pemakaianM3,
            Biaya: biaya,
            TotalBiaya: totalBiaya,
            StatusPembayaran: enums_1.EnumPaymentStatus.PENDING,
            TanggalPembayaran: null,
            MetodePembayaran: null,
            TenggatWaktu: new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-25T23:59:59Z`),
            Menunggak: false,
            Denda: 0,
            Catatan: "Tagihan uji coba pembayaran",
        }, { upsert: true, new: true });
        console.log("\n==========================================");
        console.log("   ✅ TAGIHAN UJI COBA BERHASIL DIBUAT");
        console.log("==========================================");
        console.log(`\n📋 Detail Tagihan:`);
        console.log(`   ID          : ${tagihan._id}`);
        console.log(`   Periode     : ${namaBulan[nextMonth]} ${nextYear} (${newPeriode})`);
        console.log(`   Pemakaian   : ${pemakaianM3} m³`);
        console.log(`   Biaya Air   : Rp${biaya.toLocaleString()}`);
        console.log(`   Biaya Beban : Rp${kelompok.BiayaBeban.toLocaleString()}`);
        console.log(`   Total Bayar : Rp${totalBiaya.toLocaleString()}`);
        console.log(`   Status      : PENDING`);
        console.log(`   Tenggat     : 25 ${namaBulan[nextMonth]} ${nextYear}`);
        console.log(`\n💡 Buka Flutter → Tagihan → bayar tagihan ini untuk uji coba.\n`);
    }
    catch (error) {
        console.error("❌ Seeding gagal:", error);
        process.exit(1);
    }
    finally {
        await (0, database_1.disconnectDB)();
        process.exit(0);
    }
}
main();
//# sourceMappingURL=seedUjiPembayaran.js.map