import { Types } from "mongoose";
import { ILaporan } from "@/models/Laporan";
import { EnumJenisLaporan, EnumWorkStatusPelanggan } from "@/enums";
export interface CreateLaporanInput {
    namaLaporan: string;
    masalah: string;
    alamat: string;
    imageURL?: string[];
    jenisLaporan: EnumJenisLaporan;
    catatan?: string;
    langitude: number;
    longitude: number;
}
export interface UpdateLaporanInput {
    namaLaporan?: string;
    masalah?: string;
    alamat?: string;
    imageURL?: string[];
    catatan?: string;
}
export interface LaporanFilterInput {
    jenisLaporan?: EnumJenisLaporan;
    status?: EnumWorkStatusPelanggan;
}
export interface LaporanResponse {
    success: boolean;
    message: string;
    data: ILaporan | null;
}
export interface LaporanListResponse {
    success: boolean;
    message: string;
    data: ILaporan[] | null;
    total?: number;
}
export declare class LaporanService {
    static getLaporanList(userId: string | Types.ObjectId, filter?: LaporanFilterInput): Promise<LaporanListResponse>;
    static getLaporanById(id: string | Types.ObjectId): Promise<LaporanResponse>;
    static getLaporanAktif(userId: string | Types.ObjectId): Promise<LaporanListResponse>;
    static createLaporan(userId: string | Types.ObjectId, input: CreateLaporanInput): Promise<LaporanResponse>;
    static updateLaporan(id: string | Types.ObjectId, userId: string | Types.ObjectId, input: UpdateLaporanInput): Promise<LaporanResponse>;
    static batalkanLaporan(id: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<LaporanResponse>;
}
//# sourceMappingURL=LaporanService.d.ts.map