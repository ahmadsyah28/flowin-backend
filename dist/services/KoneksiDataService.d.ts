import { Types } from "mongoose";
import { IKoneksiData } from "../models/KoneksiData";
import { StatusPengajuan } from "../enums";
export interface CreateKoneksiDataInput {
    nik: string;
    nikUrl: string;
    noKK: string;
    kkUrl: string;
    imb: string;
    imbUrl: string;
    alamat: string;
    kelurahan: string;
    kecamatan: string;
    luasBangunan: number;
}
export interface UpdateKoneksiDataInput {
    nikUrl?: string;
    kkUrl?: string;
    imbUrl?: string;
    alamat?: string;
    kelurahan?: string;
    kecamatan?: string;
    luasBangunan?: number;
}
export interface KoneksiDataResponse {
    success: boolean;
    message: string;
    data: IKoneksiData | null;
}
export interface StatusPengajuanResponse {
    success: boolean;
    message: string;
    statusPengajuan: StatusPengajuan | null;
    alasanPenolakan: string | null;
    tanggalVerifikasi: Date | null;
    canSubmit: boolean;
}
export declare class KoneksiDataService {
    static getKoneksiData(userId: string | Types.ObjectId): Promise<KoneksiDataResponse>;
    static getKoneksiDataById(id: string | Types.ObjectId): Promise<KoneksiDataResponse>;
    static createKoneksiData(userId: string | Types.ObjectId, input: CreateKoneksiDataInput): Promise<KoneksiDataResponse>;
    static cekStatusPengajuan(userId: string | Types.ObjectId): Promise<StatusPengajuanResponse>;
    static updateKoneksiData(userId: string | Types.ObjectId, input: UpdateKoneksiDataInput): Promise<KoneksiDataResponse>;
}
//# sourceMappingURL=KoneksiDataService.d.ts.map