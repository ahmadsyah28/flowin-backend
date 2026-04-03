import mongoose, { Schema, Types } from "mongoose";
import {
  IBaseDocument,
  baseSchemaFields,
  addBaseMiddleware,
} from "./BaseModel";

/**
 * KelompokPelanggan - Data tarif berdasarkan kelompok pelanggan PDAM
 *
 * Struktur tarif mengikuti Perusahaan Umum Daerah Air Minum
 * Tirta Daroy Kota Banda Aceh:
 *
 * KELOMPOK I (SOSIAL):
 * - Sosial Umum: 0-10m³ = Rp4.400, >10m³ = Rp5.500
 * - Sosial Khusus: 0-10m³ = Rp5.500, >10m³ = Rp5.750
 * - Biaya Beban: Rp10.000
 *
 * KELOMPOK II (NON NIAGA / RUMAH TANGGA):
 * - RT-1 (A): 0-10m³ = Rp5.500, >10m³ = Rp6.000
 * - RT-2 (B): 0-10m³ = Rp6.000, >10m³ = Rp6.500
 * - RT-3 (C): 0-10m³ = Rp6.500, >10m³ = Rp7.000
 * - RT-4 (D): 0-10m³ = Rp7.000, >10m³ = Rp9.000
 * - Biaya Beban: Rp10.000
 *
 * KELOMPOK III (NIAGA):
 * - N-1 (Kecil): 0-10m³ = Rp7.000, >10m³ = Rp7.500
 * - N-2 (Menengah): 0-10m³ = Rp7.500, >10m³ = Rp8.000
 * - N-3 (Besar): 0-10m³ = Rp8.000, >10m³ = Rp9.000
 * - Biaya Beban: Rp20.000
 *
 * INSTANSI PEMERINTAH (IP):
 * - 0-10m³ = Rp7.000, >10m³ = Rp9.000
 * - Biaya Beban: Rp20.000
 *
 * KELOMPOK IV (KHUSUS):
 * - Tarif berdasarkan kesepakatan dengan pelanggan
 */

// Enum untuk kode kelompok
export enum KodeKelompok {
  // Kelompok I - Sosial
  SOSIAL_UMUM = "SOS-U",
  SOSIAL_KHUSUS = "SOS-K",

  // Kelompok II - Non Niaga (Rumah Tangga)
  RUMAH_TANGGA_A = "RT-1",
  RUMAH_TANGGA_B = "RT-2",
  RUMAH_TANGGA_C = "RT-3",
  RUMAH_TANGGA_D = "RT-4",

  // Kelompok III - Niaga
  NIAGA_KECIL = "N-1",
  NIAGA_MENENGAH = "N-2",
  NIAGA_BESAR = "N-3",

  // Instansi Pemerintah
  INSTANSI_PEMERINTAH = "IP",

  // Kelompok IV - Khusus
  KHUSUS = "KH",
}

// Enum untuk kategori kelompok
export enum KategoriKelompok {
  SOSIAL = "Sosial",
  NON_NIAGA = "Non Niaga",
  NIAGA = "Niaga",
  INSTANSI_PEMERINTAH = "Instansi Pemerintah",
  KHUSUS = "Khusus",
}

export interface IKelompokPelanggan extends IBaseDocument {
  KodeKelompok: KodeKelompok;
  NamaKelompok: string;
  Kategori: KategoriKelompok;
  Deskripsi?: string;
  TarifRendah: number; // Tarif 0-10 m³ (per m³)
  TarifTinggi: number; // Tarif >10 m³ (per m³)
  BatasRendah: number; // Batas pemakaian rendah (default: 10 m³)
  BiayaBeban: number; // Biaya beban bulanan
  IsKesepakatan: boolean; // True jika tarif berdasarkan kesepakatan
}

const kelompokPelangganSchema = new Schema<IKelompokPelanggan>({
  KodeKelompok: {
    type: String,
    enum: Object.values(KodeKelompok),
    required: [true, "Kode Kelompok is required"],
    unique: true,
    index: true,
  },
  NamaKelompok: {
    type: String,
    required: [true, "Nama Kelompok is required"],
  },
  Kategori: {
    type: String,
    enum: Object.values(KategoriKelompok),
    required: [true, "Kategori is required"],
    index: true,
  },
  Deskripsi: {
    type: String,
  },
  TarifRendah: {
    type: Number,
    required: [true, "Tarif Rendah is required"],
    min: [0, "Tarif Rendah cannot be negative"],
  },
  TarifTinggi: {
    type: Number,
    required: [true, "Tarif Tinggi is required"],
    min: [0, "Tarif Tinggi cannot be negative"],
  },
  BatasRendah: {
    type: Number,
    default: 10, // Default 10 m³
    min: [0, "Batas Rendah cannot be negative"],
  },
  BiayaBeban: {
    type: Number,
    required: [true, "Biaya Beban is required"],
    min: [0, "Biaya Beban cannot be negative"],
  },
  IsKesepakatan: {
    type: Boolean,
    default: false,
  },
  ...baseSchemaFields,
});

addBaseMiddleware(kelompokPelangganSchema);

// Static method untuk menghitung tagihan
kelompokPelangganSchema.statics.hitungTagihan = function (
  kelompok: IKelompokPelanggan,
  pemakaianM3: number,
): { biayaPemakaian: number; biayaBeban: number; total: number } {
  if (kelompok.IsKesepakatan) {
    return {
      biayaPemakaian: 0,
      biayaBeban: kelompok.BiayaBeban,
      total: kelompok.BiayaBeban,
    };
  }

  let biayaPemakaian = 0;

  if (pemakaianM3 <= kelompok.BatasRendah) {
    // Semua pemakaian menggunakan tarif rendah
    biayaPemakaian = pemakaianM3 * kelompok.TarifRendah;
  } else {
    // 0-10 m³ menggunakan tarif rendah, sisanya tarif tinggi
    biayaPemakaian =
      kelompok.BatasRendah * kelompok.TarifRendah +
      (pemakaianM3 - kelompok.BatasRendah) * kelompok.TarifTinggi;
  }

  return {
    biayaPemakaian: Math.round(biayaPemakaian),
    biayaBeban: kelompok.BiayaBeban,
    total: Math.round(biayaPemakaian) + kelompok.BiayaBeban,
  };
};

export const KelompokPelanggan = mongoose.model<IKelompokPelanggan>(
  "KelompokPelanggan",
  kelompokPelangganSchema,
);

// ==========================================
// DATA SEED KELOMPOK PELANGGAN
// ==========================================
export const kelompokPelangganSeed: Omit<
  IKelompokPelanggan,
  keyof IBaseDocument
>[] = [
  // Kelompok I - Sosial
  {
    KodeKelompok: KodeKelompok.SOSIAL_UMUM,
    NamaKelompok: "Sosial Umum",
    Kategori: KategoriKelompok.SOSIAL,
    Deskripsi:
      "Hydrant umum, WC umum, kamar mandi umum, rumah ibadah, fire hydrant",
    TarifRendah: 4400,
    TarifTinggi: 5500,
    BatasRendah: 10,
    BiayaBeban: 10000,
    IsKesepakatan: false,
  },
  {
    KodeKelompok: KodeKelompok.SOSIAL_KHUSUS,
    NamaKelompok: "Sosial Khusus",
    Kategori: KategoriKelompok.SOSIAL,
    Deskripsi:
      "Sekolah negeri/swasta (SD, SLTP, SLTA), panti asuhan, terminal air",
    TarifRendah: 5500,
    TarifTinggi: 5750,
    BatasRendah: 10,
    BiayaBeban: 10000,
    IsKesepakatan: false,
  },

  // Kelompok II - Non Niaga (Rumah Tangga)
  {
    KodeKelompok: KodeKelompok.RUMAH_TANGGA_A,
    NamaKelompok: "Rumah Tangga A (RT-1)",
    Kategori: KategoriKelompok.NON_NIAGA,
    Deskripsi: "Rumah tangga kategori A",
    TarifRendah: 5500,
    TarifTinggi: 6000,
    BatasRendah: 10,
    BiayaBeban: 10000,
    IsKesepakatan: false,
  },
  {
    KodeKelompok: KodeKelompok.RUMAH_TANGGA_B,
    NamaKelompok: "Rumah Tangga B (RT-2)",
    Kategori: KategoriKelompok.NON_NIAGA,
    Deskripsi: "Rumah tangga kategori B",
    TarifRendah: 6000,
    TarifTinggi: 6500,
    BatasRendah: 10,
    BiayaBeban: 10000,
    IsKesepakatan: false,
  },
  {
    KodeKelompok: KodeKelompok.RUMAH_TANGGA_C,
    NamaKelompok: "Rumah Tangga C (RT-3)",
    Kategori: KategoriKelompok.NON_NIAGA,
    Deskripsi: "Rumah tangga kategori C",
    TarifRendah: 6500,
    TarifTinggi: 7000,
    BatasRendah: 10,
    BiayaBeban: 10000,
    IsKesepakatan: false,
  },
  {
    KodeKelompok: KodeKelompok.RUMAH_TANGGA_D,
    NamaKelompok: "Rumah Tangga D (RT-4)",
    Kategori: KategoriKelompok.NON_NIAGA,
    Deskripsi: "Rumah tangga kategori D",
    TarifRendah: 7000,
    TarifTinggi: 9000,
    BatasRendah: 10,
    BiayaBeban: 10000,
    IsKesepakatan: false,
  },

  // Kelompok III - Niaga
  {
    KodeKelompok: KodeKelompok.NIAGA_KECIL,
    NamaKelompok: "Niaga Kecil (N-1)",
    Kategori: KategoriKelompok.NIAGA,
    Deskripsi: "Usaha niaga skala kecil",
    TarifRendah: 7000,
    TarifTinggi: 7500,
    BatasRendah: 10,
    BiayaBeban: 20000,
    IsKesepakatan: false,
  },
  {
    KodeKelompok: KodeKelompok.NIAGA_MENENGAH,
    NamaKelompok: "Niaga Menengah (N-2)",
    Kategori: KategoriKelompok.NIAGA,
    Deskripsi: "Usaha niaga skala menengah",
    TarifRendah: 7500,
    TarifTinggi: 8000,
    BatasRendah: 10,
    BiayaBeban: 20000,
    IsKesepakatan: false,
  },
  {
    KodeKelompok: KodeKelompok.NIAGA_BESAR,
    NamaKelompok: "Niaga Besar (N-3)",
    Kategori: KategoriKelompok.NIAGA,
    Deskripsi: "Usaha niaga skala besar",
    TarifRendah: 8000,
    TarifTinggi: 9000,
    BatasRendah: 10,
    BiayaBeban: 20000,
    IsKesepakatan: false,
  },

  // Instansi Pemerintah
  {
    KodeKelompok: KodeKelompok.INSTANSI_PEMERINTAH,
    NamaKelompok: "Instansi Pemerintah",
    Kategori: KategoriKelompok.INSTANSI_PEMERINTAH,
    Deskripsi:
      "Perguruan tinggi negeri/swasta, rumah sakit umum negeri/swasta, instansi pemerintah/TNI/POLRI",
    TarifRendah: 7000,
    TarifTinggi: 9000,
    BatasRendah: 10,
    BiayaBeban: 20000,
    IsKesepakatan: false,
  },

  // Kelompok IV - Khusus
  {
    KodeKelompok: KodeKelompok.KHUSUS,
    NamaKelompok: "Khusus",
    Kategori: KategoriKelompok.KHUSUS,
    Deskripsi: "Tarif berdasarkan kesepakatan dengan pelanggan",
    TarifRendah: 0,
    TarifTinggi: 0,
    BatasRendah: 10,
    BiayaBeban: 0,
    IsKesepakatan: true,
  },
];
