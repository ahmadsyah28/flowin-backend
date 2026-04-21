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
        const idPelanggan = new mongoose_1.default.Types.ObjectId("69e60f8efdcd444ac5a09972");
        const idAdmin = new mongoose_1.default.Types.ObjectId();
        const idTeknisi = new mongoose_1.default.Types.ObjectId();
        const notifikasiData = [
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Tagihan Bulan April 2026",
                Pesan: "Tagihan air bulan April 2026 sebesar Rp 135.000 telah diterbitkan. Silakan lakukan pembayaran sebelum tanggal 25 April 2026 untuk menghindari denda keterlambatan.",
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: "/pembayaran",
                isRead: false,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Pengingat Jatuh Tempo",
                Pesan: "Tagihan air bulan April 2026 akan jatuh tempo dalam 4 hari. Segera lakukan pembayaran untuk menghindari denda keterlambatan sebesar Rp 10.000.",
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: "/pembayaran",
                isRead: false,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Promo Pembayaran Online",
                Pesan: "Dapatkan cashback Rp 5.000 untuk setiap pembayaran melalui aplikasi Flowin di bulan April 2026. Syarat dan ketentuan berlaku.",
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: "/pembayaran",
                isRead: false,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Pembayaran Berhasil",
                Pesan: "Pembayaran tagihan bulan Maret 2026 sebesar Rp 125.000 telah berhasil dikonfirmasi pada 15 Maret 2026. Terima kasih telah melakukan pembayaran tepat waktu.",
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: null,
                isRead: true,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Konfirmasi Pembayaran Diterima",
                Pesan: "Pembayaran tagihan bulan Februari 2026 sebesar Rp 98.500 telah diterima melalui transfer bank BCA. Nomor referensi: TRX20260210001.",
                Kategori: enums_1.EnumNotifikasiKategori.PEMBAYARAN,
                Link: null,
                isRead: true,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Sambungan Air Resmi Aktif",
                Pesan: "Selamat! Sambungan air Anda telah resmi diaktifkan per 20 April 2026.\nNo. Pelanggan : AKN-2025-0001\nSeri Meteran  : MTR-123123\nKelompok Tarif: Rumah Tangga B (RT-2)\nTagihan pertama akan muncul pada awal bulan berikutnya. Pantau pemakaian air Anda di halaman Dashboard.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: "/dashboard",
                isRead: false,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Pemberitahuan Penting",
                Pesan: "Akan dilakukan pemeliharaan sistem pada 22 April 2026 pukul 23:00 - 02:00 WIB. Aplikasi mungkin tidak dapat diakses sementara waktu. Mohon maaf atas ketidaknyamanannya.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
                isRead: false,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Pergantian Meteran Dijadwalkan",
                Pesan: "Meteran air di rumah Anda akan diganti pada tanggal 25 April 2026 pukul 09:00-12:00. Pastikan ada orang dewasa di rumah saat teknisi datang. Hubungi CS jika ada perubahan jadwal.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
                isRead: false,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Gangguan Air Teratasi",
                Pesan: "Perbaikan kebocoran pipa di Jl. Merdeka telah selesai dikerjakan pada 18 April 2026. Aliran air sudah kembali normal. Terima kasih atas kesabaran Anda.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
                isRead: true,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Profil Diperbarui",
                Pesan: "Profil akun Anda telah berhasil diperbarui pada 19 April 2026. Jika bukan Anda yang melakukan perubahan, segera hubungi customer service kami.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: "/profil",
                isRead: true,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Kualitas Air Terjamin",
                Pesan: "Hasil uji kualitas air bulan Maret 2026 menunjukkan kualitas air dalam kondisi sangat baik dan aman untuk digunakan sehari-hari. Laporan lengkap tersedia di website resmi kami.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
                isRead: true,
            },
            {
                IdPelanggan: idPelanggan,
                IdAdmin: idAdmin,
                IdTeknisi: idTeknisi,
                Judul: "Pemeliharaan Rutin Selesai",
                Pesan: "Pemeliharaan rutin jaringan distribusi air yang dilakukan pada 15 Maret 2026 telah selesai. Kualitas dan tekanan air sudah optimal kembali.",
                Kategori: enums_1.EnumNotifikasiKategori.INFORMASI,
                Link: null,
                isRead: true,
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
        const unreadCount = notifikasiData.filter((n) => !n.isRead).length;
        const readCount = notifikasiData.filter((n) => n.isRead).length;
        console.log(`📦 PEMBAYARAN (Transaksi): ${pembayaranCount} notifikasi`);
        console.log(`ℹ️  INFORMASI: ${informasiCount} notifikasi`);
        console.log(`📬 BELUM DIBACA: ${unreadCount} notifikasi`);
        console.log(`✅ SUDAH DIBACA: ${readCount} notifikasi`);
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