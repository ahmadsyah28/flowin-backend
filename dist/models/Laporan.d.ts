import mongoose, { Types } from "mongoose";
import { IBaseDocument } from "./BaseModel";
import { EnumJenisLaporan, EnumWorkStatusPelanggan } from "../enums";
import { IGeoLokasi } from "./GeoLokasi";
import { IPengguna } from "./Pengguna";
export interface ILaporan extends IBaseDocument {
    IdPengguna: Types.ObjectId;
    NamaLaporan: string;
    Masalah: string;
    Alamat: string;
    ImageURL: string[];
    JenisLaporan: EnumJenisLaporan;
    Catatan: string;
    Koordinat: Types.ObjectId;
    Status: EnumWorkStatusPelanggan;
    geoLokasi?: IGeoLokasi;
    pengguna?: IPengguna;
}
export interface ILaporanModel extends mongoose.Model<ILaporan> {
    findWithGeoLokasi(filter?: any): Promise<ILaporan[]>;
    findByPenggunaWithGeoLokasi(penggunaId: string | Types.ObjectId): Promise<ILaporan[]>;
}
export declare const Laporan: ILaporanModel;
//# sourceMappingURL=Laporan.d.ts.map