/**
 * ==========================================
 * SEED TAGIHAN & PEMBAYARAN
 * ==========================================
 *
 * Script untuk seed data tagihan (billing) dan pembayaran
 * agar fitur pembayaran_tagihan bisa diuji di Flutter.
 *
 * Data yang di-seed:
 * 1. Tagihan Januari 2026 - LUNAS (Settlement)
 * 2. Tagihan Februari 2026 - LUNAS (Settlement)
 * 3. Tagihan Maret 2026 - BELUM BAYAR (Pending) ← tagihan aktif
 *
 * Jalankan:
 *   npm run seed:tagihan
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
import { RiwayatPenggunaan } from "@/models/RiwayatPenggunaan";
import { Tagihan } from "@/models/Tagihan";
import { Pembayaran, EnumStatusPembayaran } from "@/models/Pembayaran";
import { EnumPaymentStatus } from "@/enums";

// ==========================================
// KONFIGURASI
// ==========================================

const TARGET_USER_ID = "69e0ba0e21964ced7aa5d2d0";
const TARGET_KONEKSI_DATA_ID = "69e0bc8034bdc72790ae71fb";

// ==========================================
// HELPER: Hitung biaya berdasarkan kelompok pelanggan
// ==========================================

/**
 * Menghitung biaya tagihan berdasarkan pemakaian (m³) dan tarif kelompok.
 * Tarif RT-1: 0-10 m³ = Rp5.500/m³, >10 m³ = Rp6.000/m³, Beban = Rp10.000
 */
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

// ==========================================
// MAIN
// ==========================================

async function main() {
  console.log("==========================================");
  console.log("   SEED TAGIHAN & PEMBAYARAN");
  console.log("==========================================");
  console.log(`Target User       : ${TARGET_USER_ID}`);
  console.log(`KoneksiData ID    : ${TARGET_KONEKSI_DATA_ID}`);
  console.log("==========================================");

  try {
    await connectDB();

    // ─── Step 1: Cari Meter yang sudah ada ────────────────────────────

    console.log("\n📍 Step 1: Cari Meter...");

    const meter = await Meter.findOne({
      IdKoneksiData: new Types.ObjectId(TARGET_KONEKSI_DATA_ID),
    });

    if (!meter) {
      throw new Error(
        `Meter tidak ditemukan untuk KoneksiData ${TARGET_KONEKSI_DATA_ID}. ` +
          `Jalankan seed:mongo terlebih dahulu!`,
      );
    }

    console.log(
      `   ✓ Meter ditemukan: ${meter.NomorMeteran} (ID: ${meter._id})`,
    );

    // ─── Step 2: Ambil data KelompokPelanggan untuk tarif ─────────────

    console.log("\n📍 Step 2: Ambil tarif KelompokPelanggan...");

    const kelompok = await KelompokPelanggan.findById(
      meter.IdKelompokPelanggan,
    );
    if (!kelompok) {
      throw new Error(
        `KelompokPelanggan tidak ditemukan: ${meter.IdKelompokPelanggan}`,
      );
    }

    console.log(
      `   ✓ Kelompok: ${kelompok.KodeKelompok} - ${kelompok.NamaKelompok}`,
    );
    console.log(
      `     Tarif rendah : Rp${kelompok.TarifRendah.toLocaleString()}/m³ (0-${kelompok.BatasRendah} m³)`,
    );
    console.log(
      `     Tarif tinggi : Rp${kelompok.TarifTinggi.toLocaleString()}/m³ (>${kelompok.BatasRendah} m³)`,
    );
    console.log(
      `     Biaya beban  : Rp${kelompok.BiayaBeban.toLocaleString()}`,
    );

    // ─── Step 3: Ambil data RiwayatPenggunaan ─────────────────────────

    console.log("\n📍 Step 3: Ambil data penggunaan dari RiwayatPenggunaan...");

    const riwayatJan = await RiwayatPenggunaan.findOne({
      MeteranId: meter._id,
      Periode: "2026-01",
    });

    const riwayatFeb = await RiwayatPenggunaan.findOne({
      MeteranId: meter._id,
      Periode: "2026-02",
    });

    // Konversi liter → m³ (1 m³ = 1000 liter)
    const penggunaanJanLiter = riwayatJan?.TotalPenggunaan ?? 7500;
    const penggunaanFebLiter = riwayatFeb?.TotalPenggunaan ?? 8200;

    // Buat penggunaan Maret secara acak (bulan berjalan, ~10 hari)
    const penggunaanMarLiter =
      Math.round((Math.random() * (3500 - 2500) + 2500) * 10) / 10;

    const penggunaanJanM3 = Math.round((penggunaanJanLiter / 1000) * 100) / 100;
    const penggunaanFebM3 = Math.round((penggunaanFebLiter / 1000) * 100) / 100;
    const penggunaanMarM3 = Math.round((penggunaanMarLiter / 1000) * 100) / 100;

    console.log(
      `   ✓ Jan 2026: ${penggunaanJanLiter} liter = ${penggunaanJanM3} m³`,
    );
    console.log(
      `   ✓ Feb 2026: ${penggunaanFebLiter} liter = ${penggunaanFebM3} m³`,
    );
    console.log(
      `   ✓ Mar 2026: ${penggunaanMarLiter} liter = ${penggunaanMarM3} m³ (simulasi)`,
    );

    // ─── Step 4: Hitung biaya ─────────────────────────────────────────

    console.log("\n📍 Step 4: Hitung biaya tagihan...");

    const biayaJan = hitungBiaya(kelompok, penggunaanJanM3);
    const biayaFeb = hitungBiaya(kelompok, penggunaanFebM3);
    const biayaMar = hitungBiaya(kelompok, penggunaanMarM3);

    console.log(
      `   ✓ Jan: ${penggunaanJanM3} m³ → Biaya Rp${biayaJan.biaya.toLocaleString()} + Beban Rp${kelompok.BiayaBeban.toLocaleString()} = Total Rp${biayaJan.totalBiaya.toLocaleString()}`,
    );
    console.log(
      `   ✓ Feb: ${penggunaanFebM3} m³ → Biaya Rp${biayaFeb.biaya.toLocaleString()} + Beban Rp${kelompok.BiayaBeban.toLocaleString()} = Total Rp${biayaFeb.totalBiaya.toLocaleString()}`,
    );
    console.log(
      `   ✓ Mar: ${penggunaanMarM3} m³ → Biaya Rp${biayaMar.biaya.toLocaleString()} + Beban Rp${kelompok.BiayaBeban.toLocaleString()} = Total Rp${biayaMar.totalBiaya.toLocaleString()}`,
    );

    // ─── Step 5: Buat/Update Tagihan ──────────────────────────────────

    console.log("\n📍 Step 5: Buat/Update Tagihan...");

    // Tagihan Januari 2026 - LUNAS
    const tagihanJan = await Tagihan.findOneAndUpdate(
      { IdMeteran: meter._id, Periode: "2026-01" },
      {
        IdMeteran: meter._id,
        Periode: "2026-01",
        PenggunaanSebelum: 0, // Awal pasang
        PenggunaanSekarang: penggunaanJanM3,
        TotalPemakaian: penggunaanJanM3,
        Biaya: biayaJan.biaya,
        TotalBiaya: biayaJan.totalBiaya,
        StatusPembayaran: EnumPaymentStatus.SETTLEMENT,
        TanggalPembayaran: new Date("2026-01-18T10:30:00Z"),
        MetodePembayaran: "bank_transfer",
        TenggatWaktu: new Date("2026-01-25T23:59:59Z"),
        Menunggak: false,
        Denda: 0,
        Catatan: null,
      },
      { upsert: true, new: true },
    );
    console.log(
      `   ✓ Tagihan Jan 2026: LUNAS - Rp${biayaJan.totalBiaya.toLocaleString()} (ID: ${tagihanJan._id})`,
    );

    // Tagihan Februari 2026 - LUNAS
    const tagihanFeb = await Tagihan.findOneAndUpdate(
      { IdMeteran: meter._id, Periode: "2026-02" },
      {
        IdMeteran: meter._id,
        Periode: "2026-02",
        PenggunaanSebelum: penggunaanJanM3,
        PenggunaanSekarang: penggunaanJanM3 + penggunaanFebM3,
        TotalPemakaian: penggunaanFebM3,
        Biaya: biayaFeb.biaya,
        TotalBiaya: biayaFeb.totalBiaya,
        StatusPembayaran: EnumPaymentStatus.SETTLEMENT,
        TanggalPembayaran: new Date("2026-02-15T14:20:00Z"),
        MetodePembayaran: "gopay",
        TenggatWaktu: new Date("2026-02-25T23:59:59Z"),
        Menunggak: false,
        Denda: 0,
        Catatan: null,
      },
      { upsert: true, new: true },
    );
    console.log(
      `   ✓ Tagihan Feb 2026: LUNAS - Rp${biayaFeb.totalBiaya.toLocaleString()} (ID: ${tagihanFeb._id})`,
    );

    // Tagihan Maret 2026 - PENDING (tagihan aktif untuk diuji bayar)
    const tagihanMar = await Tagihan.findOneAndUpdate(
      { IdMeteran: meter._id, Periode: "2026-03" },
      {
        IdMeteran: meter._id,
        Periode: "2026-03",
        PenggunaanSebelum: penggunaanJanM3 + penggunaanFebM3,
        PenggunaanSekarang: penggunaanJanM3 + penggunaanFebM3 + penggunaanMarM3,
        TotalPemakaian: penggunaanMarM3,
        Biaya: biayaMar.biaya,
        TotalBiaya: biayaMar.totalBiaya,
        StatusPembayaran: EnumPaymentStatus.PENDING,
        TanggalPembayaran: null,
        MetodePembayaran: null,
        TenggatWaktu: new Date("2026-03-25T23:59:59Z"),
        Menunggak: false,
        Denda: 0,
        Catatan: "Tagihan bulan berjalan",
      },
      { upsert: true, new: true },
    );
    console.log(
      `   ✓ Tagihan Mar 2026: PENDING - Rp${biayaMar.totalBiaya.toLocaleString()} (ID: ${tagihanMar._id})`,
    );

    // ─── Step 6: Buat Pembayaran untuk tagihan LUNAS ──────────────────

    console.log("\n📍 Step 6: Buat data Pembayaran (untuk tagihan lunas)...");

    // Pembayaran Januari
    await Pembayaran.findOneAndUpdate(
      {
        IdTagihan: tagihanJan._id,
        IdPengguna: new Types.ObjectId(TARGET_USER_ID),
      },
      {
        IdTagihan: tagihanJan._id,
        IdPengguna: new Types.ObjectId(TARGET_USER_ID),
        MidtransOrderId: `FLOWIN-JAN2026-${Date.now()}`,
        MidtransTransactionId: `txn-sim-jan-${Date.now()}`,
        SnapToken: "snap-token-sim-jan-2026",
        SnapRedirectUrl:
          "https://app.sandbox.midtrans.com/snap/v3/redirection/sim-jan",
        MetodePembayaran: "bank_transfer",
        JumlahBayar: biayaJan.totalBiaya,
        StatusPembayaran: EnumStatusPembayaran.SUKSES,
        TanggalBayar: new Date("2026-01-18T10:30:00Z"),
      },
      { upsert: true, new: true },
    );
    console.log(
      `   ✓ Pembayaran Jan 2026: Settlement - Rp${biayaJan.totalBiaya.toLocaleString()}`,
    );

    // Pembayaran Februari
    await Pembayaran.findOneAndUpdate(
      {
        IdTagihan: tagihanFeb._id,
        IdPengguna: new Types.ObjectId(TARGET_USER_ID),
      },
      {
        IdTagihan: tagihanFeb._id,
        IdPengguna: new Types.ObjectId(TARGET_USER_ID),
        MidtransOrderId: `FLOWIN-FEB2026-${Date.now()}`,
        MidtransTransactionId: `txn-sim-feb-${Date.now()}`,
        SnapToken: "snap-token-sim-feb-2026",
        SnapRedirectUrl:
          "https://app.sandbox.midtrans.com/snap/v3/redirection/sim-feb",
        MetodePembayaran: "gopay",
        JumlahBayar: biayaFeb.totalBiaya,
        StatusPembayaran: EnumStatusPembayaran.SUKSES,
        TanggalBayar: new Date("2026-02-15T14:20:00Z"),
      },
      { upsert: true, new: true },
    );
    console.log(
      `   ✓ Pembayaran Feb 2026: Settlement - Rp${biayaFeb.totalBiaya.toLocaleString()}`,
    );

    // ─── Verify ──────────────────────────────────────────────────────

    const tagihanCount = await Tagihan.countDocuments({ IdMeteran: meter._id });
    const pembayaranCount = await Pembayaran.countDocuments({
      IdPengguna: new Types.ObjectId(TARGET_USER_ID),
    });

    console.log("\n==========================================");
    console.log("     ✅ SEEDING TAGIHAN COMPLETE");
    console.log("==========================================");
    console.log(`\n📊 Ringkasan:`);
    console.log(`   Tagihan total   : ${tagihanCount}`);
    console.log(`   Pembayaran total: ${pembayaranCount}`);
    console.log(`\n📋 Data Tagihan:`);
    console.log(
      `   ┌──────────────┬────────────┬──────────────────┬────────────┐`,
    );
    console.log(
      `   │ Periode      │ Pemakaian  │ Total Biaya      │ Status     │`,
    );
    console.log(
      `   ├──────────────┼────────────┼──────────────────┼────────────┤`,
    );
    console.log(
      `   │ Jan 2026     │ ${penggunaanJanM3.toString().padEnd(8)} m³│ Rp${biayaJan.totalBiaya.toLocaleString().padEnd(14)}│ LUNAS      │`,
    );
    console.log(
      `   │ Feb 2026     │ ${penggunaanFebM3.toString().padEnd(8)} m³│ Rp${biayaFeb.totalBiaya.toLocaleString().padEnd(14)}│ LUNAS      │`,
    );
    console.log(
      `   │ Mar 2026     │ ${penggunaanMarM3.toString().padEnd(8)} m³│ Rp${biayaMar.totalBiaya.toLocaleString().padEnd(14)}│ PENDING    │`,
    );
    console.log(
      `   └──────────────┴────────────┴──────────────────┴────────────┘`,
    );
    console.log(`\n🔑 Meter ID      : ${meter._id}`);
    console.log(`   Nomor Meteran : ${meter.NomorMeteran}`);
    console.log(`   Nomor Akun    : ${meter.NomorAkun}`);
    console.log(
      `\n💡 Tagihan Maret (PENDING) bisa digunakan untuk uji coba pembayaran di Flutter.\n`,
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
