export { Pengguna, IPengguna } from "./Pengguna";
export { KoneksiData, IKoneksiData } from "./KoneksiData";
export { Meter, IMeter } from "./Meter";
export { Tagihan, ITagihan } from "./Tagihan";
export { RiwayatRagihan, IRiwayatRagihan } from "./RiwayatRagihan";
export { Laporan, ILaporan, ILaporanModel } from "./Laporan";
export { GeoLokasi, IGeoLokasi } from "./GeoLokasi";
export { Notifikasi, INotifikasi } from "./Notifikasi";
export { IBaseDocument } from "./BaseModel";
export declare const models: {
    Pengguna: import("mongoose").Model<import("./Pengguna").IPengguna, {}, {}, {}, import("mongoose").Document<unknown, {}, import("./Pengguna").IPengguna, {}, import("mongoose").DefaultSchemaOptions> & import("./Pengguna").IPengguna & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, any, import("./Pengguna").IPengguna>;
    KoneksiData: import("mongoose").Model<import("./KoneksiData").IKoneksiData, {}, {}, {}, import("mongoose").Document<unknown, {}, import("./KoneksiData").IKoneksiData, {}, import("mongoose").DefaultSchemaOptions> & import("./KoneksiData").IKoneksiData & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, any, import("./KoneksiData").IKoneksiData>;
    Meter: import("mongoose").Model<import("./Meter").IMeter, {}, {}, {}, import("mongoose").Document<unknown, {}, import("./Meter").IMeter, {}, import("mongoose").DefaultSchemaOptions> & import("./Meter").IMeter & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, any, import("./Meter").IMeter>;
    Tagihan: import("mongoose").Model<import("./Tagihan").ITagihan, {}, {}, {}, import("mongoose").Document<unknown, {}, import("./Tagihan").ITagihan, {}, import("mongoose").DefaultSchemaOptions> & import("./Tagihan").ITagihan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, any, import("./Tagihan").ITagihan>;
    RiwayatRagihan: import("mongoose").Model<import("./RiwayatRagihan").IRiwayatRagihan, {}, {}, {}, import("mongoose").Document<unknown, {}, import("./RiwayatRagihan").IRiwayatRagihan, {}, import("mongoose").DefaultSchemaOptions> & import("./RiwayatRagihan").IRiwayatRagihan & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, any, import("./RiwayatRagihan").IRiwayatRagihan>;
    Laporan: import("./Laporan").ILaporanModel;
    GeoLokasi: import("mongoose").Model<import("./GeoLokasi").IGeoLokasi, {}, {}, {}, import("mongoose").Document<unknown, {}, import("./GeoLokasi").IGeoLokasi, {}, import("mongoose").DefaultSchemaOptions> & import("./GeoLokasi").IGeoLokasi & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, any, import("./GeoLokasi").IGeoLokasi>;
    Notifikasi: import("mongoose").Model<import("./Notifikasi").INotifikasi, {}, {}, {}, import("mongoose").Document<unknown, {}, import("./Notifikasi").INotifikasi, {}, import("mongoose").DefaultSchemaOptions> & import("./Notifikasi").INotifikasi & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, any, import("./Notifikasi").INotifikasi>;
};
export default models;
//# sourceMappingURL=index.d.ts.map