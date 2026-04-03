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
    const idPelanggan = new mongoose.Types.ObjectId("699aaa90b03afd83f892ec54");

    // Dummy IDs untuk Admin dan Teknisi (karena required)
    const idAdmin = new mongoose.Types.ObjectId();
    const idTeknisi = new mongoose.Types.ObjectId();

    // Sample notifikasi data
    const notifikasiData = [
      // ═══════════════════════════════════════════════════════════
      // KATEGORI: PEMBAYARAN (Transaksi)
      // ═══════════════════════════════════════════════════════════
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Tagihan Bulan Maret 2026",
        Pesan:
          "Tagihan air bulan Maret 2026 sebesar Rp 125.000 telah diterbitkan. Silakan lakukan pembayaran sebelum tanggal 20 Maret 2026.",
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: "/pembayaran",
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Pembayaran Berhasil",
        Pesan:
          "Pembayaran tagihan bulan Februari 2026 sebesar Rp 98.500 telah berhasil dikonfirmasi. Terima kasih telah melakukan pembayaran tepat waktu.",
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: null,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Pengingat Jatuh Tempo",
        Pesan:
          "Tagihan air bulan Maret 2026 akan jatuh tempo dalam 3 hari. Segera lakukan pembayaran untuk menghindari denda keterlambatan.",
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: "/pembayaran",
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Denda Keterlambatan",
        Pesan:
          "Tagihan bulan Januari 2026 telah dikenakan denda keterlambatan sebesar Rp 5.000. Total tagihan menjadi Rp 115.000.",
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: "/pembayaran",
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Konfirmasi Pembayaran Diterima",
        Pesan:
          "Pembayaran tagihan bulan Januari 2026 sebesar Rp 115.000 telah diterima melalui transfer bank. Nomor referensi: TRX20260128001.",
        Kategori: EnumNotifikasiKategori.PEMBAYARAN,
        Link: null,
      },

      // ═══════════════════════════════════════════════════════════
      // KATEGORI: INFORMASI
      // ═══════════════════════════════════════════════════════════
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Perbaikan Pipa Utama",
        Pesan:
          "Akan dilakukan perbaikan pipa utama di wilayah Anda pada tanggal 10 Maret 2026 pukul 08:00 - 16:00. Mohon maaf atas ketidaknyamanannya.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Pemeliharaan Rutin",
        Pesan:
          "Pemberitahuan: Akan ada pemeliharaan rutin jaringan distribusi air pada tanggal 15 Maret 2026. Aliran air mungkin terganggu sementara.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Gangguan Air Teratasi",
        Pesan:
          "Perbaikan kebocoran pipa di Jl. Merdeka telah selesai dikerjakan. Aliran air sudah kembali normal. Terima kasih atas kesabaran Anda.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Login Berhasil",
        Pesan: "Anda telah berhasil masuk ke akun Anda.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Profil Diperbarui",
        Pesan: "Profil akun Anda telah berhasil diperbarui.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: "/profil",
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Pergantian Meteran",
        Pesan:
          "Meteran air di rumah Anda akan diganti pada tanggal 20 Maret 2026. Pastikan ada orang dewasa di rumah saat teknisi datang.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
      },
      {
        IdPelanggan: idPelanggan,
        IdAdmin: idAdmin,
        IdTeknisi: idTeknisi,
        Judul: "Kualitas Air Terjamin",
        Pesan:
          "Hasil uji kualitas air bulan ini menunjukkan kualitas air dalam kondisi baik dan aman untuk digunakan sehari-hari.",
        Kategori: EnumNotifikasiKategori.INFORMASI,
        Link: null,
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

    console.log(`📦 PEMBAYARAN (Transaksi): ${pembayaranCount} notifikasi`);
    console.log(`ℹ️ INFORMASI: ${informasiCount} notifikasi`);
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
