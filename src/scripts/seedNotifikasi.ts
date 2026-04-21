/**
 * Seeder untuk Notifikasi
 * 
 * Cara menjalankan:
 * npm run seed:notifikasi
 * 
 * atau manual:
 * npx ts-node src/scripts/seedNotifikasi.ts
 * 
 * Seeder ini akan membuat notifikasi dengan:
 * - 6 notifikasi belum dibaca (isRead: false) - 3 Pembayaran, 3 Informasi
 * - 6 notifikasi sudah dibaca (isRead: true) - 2 Pembayaran, 4 Informasi
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/database";
import { Notifikasi } from "../models/Notifikasi";
import { EnumNotifikasiKategori } from "../enums";

// Load environment variables
dotenv.config();

const seedNotifikasi = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("🔗 Connected to MongoDB for seeding notifikasi");

    // ID Pelanggan yang diberikan
    const idPelanggan = new mongoose.Types.ObjectId("69e60f8efdcd444ac5a09972");

    // Dummy IDs untuk Admin dan Teknisi (karena required)
    const idAdmin = new mongoose.Types.ObjectId();
    const idTeknisi = new mongoose.Types.ObjectId();

    // Sample notifikasi data
    const notifikasiData = [
      // ═══════════════════════════════════════════════════════════
      // KATEGORI: PEMBAYARAN (Transaksi) - BELUM DIBACA
      // ═══════════════════════════════════════════════════════════
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Tagihan Bulan April 2026",
        Pesan:
          "Tagihan air bulan April 2026 sebesar Rp 135.000 telah diterbitkan. Silakan lakukan pembayaran sebelum tanggal 25 April 2026 untuk menghindari denda keterlambatan.",
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: "/pembayaran",
        isRead: false,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Pengingat Jatuh Tempo",
        Pesan:
          "Tagihan air bulan April 2026 akan jatuh tempo dalam 4 hari. Segera lakukan pembayaran untuk menghindari denda keterlambatan sebesar Rp 10.000.",
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: "/pembayaran",
        isRead: false,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Promo Pembayaran Online",
        Pesan:
          "Dapatkan cashback Rp 5.000 untuk setiap pembayaran melalui aplikasi Flowin di bulan April 2026. Syarat dan ketentuan berlaku.",
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: "/pembayaran",
        isRead: false,
      },

      // ═══════════════════════════════════════════════════════════
      // KATEGORI: PEMBAYARAN - SUDAH DIBACA
      // ═══════════════════════════════════════════════════════════
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Pembayaran Berhasil",
        Pesan:
          "Pembayaran tagihan bulan Maret 2026 sebesar Rp 125.000 telah berhasil dikonfirmasi pada 15 Maret 2026. Terima kasih telah melakukan pembayaran tepat waktu.",
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: null,
        isRead: true,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Konfirmasi Pembayaran Diterima",
        Pesan:
          "Pembayaran tagihan bulan Februari 2026 sebesar Rp 98.500 telah diterima melalui transfer bank BCA. Nomor referensi: TRX20260210001.",
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: null,
        isRead: true,
      },

      // ═══════════════════════════════════════════════════════════
      // KATEGORI: INFORMASI - BELUM DIBACA
      // ═══════════════════════════════════════════════════════════
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Sambungan Air Resmi Aktif",
        Pesan:
          "Selamat! Sambungan air Anda telah resmi diaktifkan per 20 April 2026.\nNo. Pelanggan : AKN-2025-0001\nSeri Meteran  : MTR-123123\nKelompok Tarif: Rumah Tangga B (RT-2)\nTagihan pertama akan muncul pada awal bulan berikutnya. Pantau pemakaian air Anda di halaman Dashboard.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: "/dashboard",
        isRead: false,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Pemberitahuan Penting",
        Pesan:
          "Akan dilakukan pemeliharaan sistem pada 22 April 2026 pukul 23:00 - 02:00 WIB. Aplikasi mungkin tidak dapat diakses sementara waktu. Mohon maaf atas ketidaknyamanannya.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
        isRead: false,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Pergantian Meteran Dijadwalkan",
        Pesan:
          "Meteran air di rumah Anda akan diganti pada tanggal 25 April 2026 pukul 09:00-12:00. Pastikan ada orang dewasa di rumah saat teknisi datang. Hubungi CS jika ada perubahan jadwal.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
        isRead: false,
      },

      // ═══════════════════════════════════════════════════════════
      // KATEGORI: INFORMASI - SUDAH DIBACA
      // ═══════════════════════════════════════════════════════════
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Gangguan Air Teratasi",
        Pesan:
          "Perbaikan kebocoran pipa di Jl. Merdeka telah selesai dikerjakan pada 18 April 2026. Aliran air sudah kembali normal. Terima kasih atas kesabaran Anda.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
        isRead: true,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Profil Diperbarui",
        Pesan:
          "Profil akun Anda telah berhasil diperbarui pada 19 April 2026. Jika bukan Anda yang melakukan perubahan, segera hubungi customer service kami.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: "/profil",
        isRead: true,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Kualitas Air Terjamin",
        Pesan:
          "Hasil uji kualitas air bulan Maret 2026 menunjukkan kualitas air dalam kondisi sangat baik dan aman untuk digunakan sehari-hari. Laporan lengkap tersedia di website resmi kami.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
        isRead: true,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Pemeliharaan Rutin Selesai",
        Pesan:
          "Pemeliharaan rutin jaringan distribusi air yang dilakukan pada 15 Maret 2026 telah selesai. Kualitas dan tekanan air sudah optimal kembali.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
        isRead: true,
      },
    ];

    console.log("🌱 Starting to seed Notifikasi data...");

    // Clear existing notifikasi for this pelanggan (optional)
    const deleteResult = await Notifikasi.deleteMany({
      IdPelanggan: idPelanggan,
    });
    console.log(
      `🗑️ Cleared ${deleteResult.deletedCount} existing notifikasi for pelanggan`,
    );

    // Seed each notifikasi
    let successCount = 0;
    for (const data of notifikasiData) {
      try {
        const newNotifikasi = await Notifikasi.create(data);
        console.log(`✅ Created: [${data.Kategori}] ${data.Judul}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Failed to create "${data.Judul}":`, error.message);
      }
    }

    console.log("\n🎉 Seed completed!");
    console.log(
      `📊 Total notifikasi created: ${successCount}/${notifikasiData.length}`,
    );
    console.log(`👤 Pelanggan ID: ${idPelanggan.toString()}`);

    console.log("\n📋 Notifikasi Summary:");
    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    );

    const pembayaranCount = notifikasiData.filter(
      (n) => n.Kategori === EnumNotifikasiKategori.PEMBAYARAN,
    ).length;
    const informasiCount = notifikasiData.filter(
      (n) => n.Kategori === EnumNotifikasiKategori.INFORMASI,
    ).length;
    const unreadCount = notifikasiData.filter((n) => !n.isRead).length;
    const readCount = notifikasiData.filter((n) => n.isRead).length;

    console.log(`📦 PEMBAYARAN (Transaksi): ${pembayaranCount} notifikasi`);
    console.log(`ℹ️  INFORMASI: ${informasiCount} notifikasi`);
    console.log(`📬 BELUM DIBACA: ${unreadCount} notifikasi`);
    console.log(`✅ SUDAH DIBACA: ${readCount} notifikasi`);
    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    );
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run seeder
seedNotifikasi();
