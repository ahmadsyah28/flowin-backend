import { Request } from "express";
import {
  IPengguna,
  IKoneksiData,
  ITagihan,
  ILaporan,
  IMeter,
  IGeoLokasi,
  INotifikasi,
  IRiwayatPenggunaan,
} from "@/models";
import {
  EnumJenisLaporan,
  EnumWorkStatusPelanggan,
  EnumPaymentStatus,
  EnumNotifikasiKategori,
} from "@/enums";

// Export model interfaces untuk GraphQL
export interface Pengguna extends Omit<IPengguna, "password" | "token"> {
  id: string;
}

export interface KoneksiData extends IKoneksiData {
  id: string;
  pelanggan?: Pengguna; // Virtual populated field
}

export interface Tagihan extends ITagihan {
  id: string;
  meter?: Meter; // Virtual populated field
}

export interface Meter extends IMeter {
  id: string;
  koneksiData?: KoneksiData; // Virtual populated field
}

export interface Laporan {
  id: string;
  IdPengguna: string;
  NamaLaporan: string;
  Masalah: string;
  Alamat: string;
  ImageURL: string[];
  JenisLaporan: EnumJenisLaporan;
  Catatan: string;
  Koordinat: string;
  Status: EnumWorkStatusPelanggan;
  createdAt: Date;
  updatedAt: Date;
  // Virtual populated fields untuk GraphQL
  pengguna?: Pengguna;
  geoLokasi?: GeoLokasi;
}

export interface GeoLokasi extends IGeoLokasi {
  id: string;
}

export interface Notifikasi extends INotifikasi {
  id: string;
}

export interface RiwayatPenggunaan extends IRiwayatPenggunaan {
  id: string;
  meter?: Meter; // Virtual populated field
}

// GraphQL Context type
export interface GraphQLContext {
  req: any; // Use any for compatibility with different Request types
  user?: IPengguna;
  isAuthenticated: boolean;
}

// Auth payload type
export interface AuthPayload {
  token: string;
  pengguna: Pengguna;
}

// Input types for mutations
export interface RegisterInput {
  email: string;
  noHP: string;
  namaLengkap: string;
  password: string;
}

export interface UpdateProfileInput {
  noHP?: string;
  namaLengkap?: string;
}

// KoneksiData Input types
export interface CreateKoneksiDataInput {
  NIK: string;
  NIKUrl: string;
  NoKK: string;
  KKUrl: string;
  IMB: string;
  IMBUrl: string;
  Alamat: string;
  Kelurahan: string;
  Kecamatan: string;
  LuasBangunan: number;
}

export interface UpdateKoneksiDataInput {
  Alamat?: string;
  Kelurahan?: string;
  Kecamatan?: string;
  LuasBangunan?: number;
}

// Laporan Input types
export interface CreateLaporanInput {
  NamaLaporan: string;
  Masalah: string;
  Alamat: string;
  ImageURL?: string[];
  JenisLaporan: EnumJenisLaporan;
  Catatan?: string;
  Latitude: number;
  Longitude: number;
}
