/**
 * ==========================================
 * SEED UJI COBA PEMBAYARAN
 * ==========================================
 *
 * Script cepat untuk membuat 1 tagihan PENDING baru
 * agar bisa diuji bayar lagi di Flutter.
 *
 * Bisa dijalankan berulang kali — setiap kali jalan akan:
 * 1. Reset tagihan Maret 2026 yang sudah Settlement → kembali PENDING
 *    ATAU
 * 2. Buat tagihan April 2026 baru jika Maret sudah tidak ada
 *
 * Jalankan:
 *   npm run seed:uji-bayar
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { connectDB, disconnectDB } from "@/config/database";
import { Types } from "mongoose";
import { Meter } from "@/models/Meter";
import {
  KelompokPelanggan,
  IKelompokPelanggan,
} from "@/models/KelompokPelanggan";
import { Tagihan } from "@/models/Tagihan";
import { Pembayaran } from "@/models/Pembayaran";
import { EnumPaymentStatus } from "@/enums";

// ==========================================
// KONFIGURASI (sama dengan seedTagihan.ts)
// ==========================================

const TARGET_USER_ID = "69d0cb64ec09d8618dfb3c63";
const TARGET_KONEKSI_DATA_ID = "69d0ccabec09d8618dfb3c71";

function hitungBiaya(
  kelompok: IKelompokPelanggan,
  pemakaianM3: number,
): { biaya: number; totalBiaya: number } {
  let biaya = 0;

  if (pemakaianM3 <= kelompok.BatasRendah) {
    biaya = pemakaianM3 * kelompok.TarifRendah;
  } else {
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
    await connectDB();

    // ─── Cari Meter ───────────────────────────────────────────────────

    const meter = await Meter.findOne({
      IdKoneksiData: new Types.ObjectId(TARGET_KONEKSI_DATA_ID),
    });

    if (!meter) {
      throw new Error(
        `Meter tidak ditemukan. Jalankan seed:mongo terlebih dahulu!`,
      );
    }

    console.log(`✓ Meter: ${meter.NomorMeteran} (${meter._id})`);

    // ─── Ambil tarif kelompok ─────────────────────────────────────────

    const kelompok = await KelompokPelanggan.findById(
      meter.IdKelompokPelanggan,
    );
    if (!kelompok) {
      throw new Error(`KelompokPelanggan tidak ditemukan`);
    }

    console.log(
      `✓ Kelompok: ${kelompok.KodeKelompok} - ${kelompok.NamaKelompok}`,
    );

    // ─── Cek tagihan yang sudah ada ───────────────────────────────────

    const existingPending = await Tagihan.findOne({
      IdMeteran: meter._id,
      StatusPembayaran: EnumPaymentStatus.PENDING,
    });

    if (existingPending) {
      console.log(
        `\n⚠️  Sudah ada tagihan PENDING: Periode ${existingPending.Periode} - Rp${existingPending.TotalBiaya.toLocaleString()}`,
      );
      console.log(`   ID: ${existingPending._id}`);
      console.log(
        `\n💡 Tagihan ini bisa langsung digunakan untuk uji pembayaran.`,
      );
      console.log(`   Tidak perlu buat baru.\n`);
      return;
    }

    // ─── Cari tagihan terakhir untuk hitung penggunaan ────────────────

    const lastTagihan = await Tagihan.findOne({ IdMeteran: meter._id }).sort({
      Periode: -1,
    });

    const lastPemakaian = lastTagihan?.PenggunaanSekarang ?? 0;
    const lastPeriode = lastTagihan?.Periode ?? "2026-03";

    // Tentukan periode baru (bulan berikutnya)
    const [year, month] = lastPeriode.split("-").map(Number);
    const nextMonth = month >= 12 ? 1 : month + 1;
    const nextYear = month >= 12 ? year + 1 : year;
    const newPeriode = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

    // Simulasi pemakaian 2.5 - 4.0 m³ (rumah tangga normal)
    const pemakaianM3 =
      Math.round((Math.random() * (4.0 - 2.5) + 2.5) * 100) / 100;

    const { biaya, totalBiaya } = hitungBiaya(kelompok, pemakaianM3);

    // ─── Hapus pembayaran lama untuk tagihan ini (jika ada) ──────────

    const oldTagihan = await Tagihan.findOne({
      IdMeteran: meter._id,
      Periode: newPeriode,
    });

    if (oldTagihan) {
      await Pembayaran.deleteMany({
        IdTagihan: oldTagihan._id,
        IdPengguna: new Types.ObjectId(TARGET_USER_ID),
      });
      console.log(`🗑️  Hapus pembayaran lama untuk periode ${newPeriode}`);
    }

    // ─── Buat/Reset tagihan PENDING ──────────────────────────────────

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

    const tagihan = await Tagihan.findOneAndUpdate(
      { IdMeteran: meter._id, Periode: newPeriode },
      {
        IdMeteran: meter._id,
        Periode: newPeriode,
        PenggunaanSebelum: lastPemakaian,
        PenggunaanSekarang: lastPemakaian + pemakaianM3,
        TotalPemakaian: pemakaianM3,
        Biaya: biaya,
        TotalBiaya: totalBiaya,
        StatusPembayaran: EnumPaymentStatus.PENDING,
        TanggalPembayaran: null,
        MetodePembayaran: null,
        TenggatWaktu: new Date(
          `${nextYear}-${String(nextMonth).padStart(2, "0")}-25T23:59:59Z`,
        ),
        Menunggak: false,
        Denda: 0,
        Catatan: "Tagihan uji coba pembayaran",
      },
      { upsert: true, new: true },
    );

    console.log("\n==========================================");
    console.log("   ✅ TAGIHAN UJI COBA BERHASIL DIBUAT");
    console.log("==========================================");
    console.log(`\n📋 Detail Tagihan:`);
    console.log(`   ID          : ${tagihan._id}`);
    console.log(
      `   Periode     : ${namaBulan[nextMonth]} ${nextYear} (${newPeriode})`,
    );
    console.log(`   Pemakaian   : ${pemakaianM3} m³`);
    console.log(`   Biaya Air   : Rp${biaya.toLocaleString()}`);
    console.log(`   Biaya Beban : Rp${kelompok.BiayaBeban.toLocaleString()}`);
    console.log(`   Total Bayar : Rp${totalBiaya.toLocaleString()}`);
    console.log(`   Status      : PENDING`);
    console.log(`   Tenggat     : 25 ${namaBulan[nextMonth]} ${nextYear}`);
    console.log(
      `\n💡 Buka Flutter → Tagihan → bayar tagihan ini untuk uji coba.\n`,
    );
  } catch (error) {
    console.error("❌ Seeding gagal:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
