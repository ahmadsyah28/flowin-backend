import { IPengguna, IKoneksiData, ITagihan, IMeter, IGeoLokasi, INotifikasi, IRiwayatPenggunaan } from "../models";
import { EnumJenisLaporan, EnumWorkStatusPelanggan } from "../enums";
export interface Pengguna extends Omit<IPengguna, "password" | "token"> {
    id: string;
}
export interface KoneksiData extends IKoneksiData {
    id: string;
    pelanggan?: Pengguna;
}
export interface Tagihan extends ITagihan {
    id: string;
    meter?: Meter;
}
export interface Meter extends IMeter {
    id: string;
    koneksiData?: KoneksiData;
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
    meter?: Meter;
}
export interface GraphQLContext {
    req: any;
    user?: IPengguna;
    isAuthenticated: boolean;
}
export interface AuthPayload {
    token: string;
    pengguna: Pengguna;
}
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
//# sourceMappingURL=graphql.d.ts.map