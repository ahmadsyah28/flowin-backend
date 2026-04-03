"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../config/database");
const Notifikasi_1 = require("../models/Notifikasi");
const enums_1 = require("../enums");
dotenv_1.default.config();
const seedNotifikasi = async () => {
    try {
        await (0, database_1.connectDB)();
        console.log("🔗 Connected to MongoDB for seeding notifikasi");
        const idPelanggan = new mongoose_1.default.Types.ObjectId("699aaa90b03afd83f892ec54");
        const idAdmin = new mongoose_1.default.Types.ObjectId();
        const idTeknisi = new mongoose_1.default.Types.ObjectId();
        const notifikasiData = [
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Tagihan Bulan Maret 2026",
                Pesan: "Tagihan air bulan Maret 2026 sebesar Rp 125.000 telah diterbitkan. Silakan lakukan pembayaran sebelum tanggal 20 Maret 2026.",
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: "/pembayaran",
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Pembayaran Berhasil",
                Pesan: "Pembayaran tagihan bulan Februari 2026 sebesar Rp 98.500 telah berhasil dikonfirmasi. Terima kasih telah melakukan pembayaran tepat waktu.",
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: null,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Pengingat Jatuh Tempo",
                Pesan: "Tagihan air bulan Maret 2026 akan jatuh tempo dalam 3 hari. Segera lakukan pembayaran untuk menghindari denda keterlambatan.",
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: "/pembayaran",
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Denda Keterlambatan",
                Pesan: "Tagihan bulan Januari 2026 telah dikenakan denda keterlambatan sebesar Rp 5.000. Total tagihan menjadi Rp 115.000.",
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: "/pembayaran",
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Konfirmasi Pembayaran Diterima",
                Pesan: "Pembayaran tagihan bulan Januari 2026 sebesar Rp 115.000 telah diterima melalui transfer bank. Nomor referensi: TRX20260128001.",
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: null,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Perbaikan Pipa Utama",
                Pesan: "Akan dilakukan perbaikan pipa utama di wilayah Anda pada tanggal 10 Maret 2026 pukul 08:00 - 16:00. Mohon maaf atas ketidaknyamanannya.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Pemeliharaan Rutin",
                Pesan: "Pemberitahuan: Akan ada pemeliharaan rutin jaringan distribusi air pada tanggal 15 Maret 2026. Aliran air mungkin terganggu sementara.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Gangguan Air Teratasi",
                Pesan: "Perbaikan kebocoran pipa di Jl. Merdeka telah selesai dikerjakan. Aliran air sudah kembali normal. Terima kasih atas kesabaran Anda.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Login Berhasil",
                Pesan: "Anda telah berhasil masuk ke akun Anda.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Profil Diperbarui",
                Pesan: "Profil akun Anda telah berhasil diperbarui.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: "/profil",
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Pergantian Meteran",
                Pesan: "Meteran air di rumah Anda akan diganti pada tanggal 20 Maret 2026. Pastikan ada orang dewasa di rumah saat teknisi datang.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Kualitas Air Terjamin",
                Pesan: "Hasil uji kualitas air bulan ini menunjukkan kualitas air dalam kondisi baik dan aman untuk digunakan sehari-hari.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
            },
        ];
        console.log("🌱 Starting to seed Notifikasi data...");
        const deleteResult = await Notifikasi_1.Notifikasi.deleteMany({
            IdPelanggan: idPelanggan,
        });
        console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing notifikasi for pelanggan`);
        let successCount = 0;
        for (const data of notifikasiData) {
            try {
                const newNotifikasi = await Notifikasi_1.Notifikasi.create(data);
                console.log(`✅ Created: [${data.Kategori}] ${data.Judul}`);
                successCount++;
            }
            catch (error) {
                console.error(`❌ Failed to create "${data.Judul}":`, error.message);
            }
        }
        console.log("\n🎉 Seed completed!");
        console.log(`📊 Total notifikasi created: ${successCount}/${notifikasiData.length}`);
        console.log(`👤 Pelanggan ID: ${idPelanggan.toString()}`);
        console.log("\n📋 Notifikasi Summary:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        const pembayaranCount = notifikasiData.filter((n) => n.Kategori === enums_1.EnumNotifikasiKategori.PEMBAYARAN).length;
        const informasiCount = notifikasiData.filter((n) => n.Kategori === enums_1.EnumNotifikasiKategori.INFORMASI).length;
        console.log(`📦 PEMBAYARAN (Transaksi): ${pembayaranCount} notifikasi`);
        console.log(`ℹ️ INFORMASI: ${informasiCount} notifikasi`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
    catch (error) {
        console.error("❌ Seed error:", error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log("\n🔌 Database connection closed");
        process.exit(0);
    }
};
seedNotifikasi();
//# sourceMappingURL=seedNotifikasi.js.map