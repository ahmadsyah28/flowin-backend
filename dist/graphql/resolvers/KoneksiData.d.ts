import { GraphQLContext } from "../../types";
import { CreateKoneksiDataInput, UpdateKoneksiDataInput } from "../../services/KoneksiDataService";
export declare const koneksiDataResolvers: {
    Query: {
        koneksiData: (_: any, __: any, context: GraphQLContext) => Promise<import("../../services/KoneksiDataService").KoneksiDataResponse>;
        koneksiDataById: (_: any, { id }: {
            id: string;
        }) => Promise<import("../../services/KoneksiDataService").KoneksiDataResponse>;
        cekStatusPengajuan: (_: any, __: any, context: GraphQLContext) => Promise<import("../../services/KoneksiDataService").StatusPengajuanResponse>;
    };
    Mutation: {
        createKoneksiData: (_: any, { input }: {
            input: CreateKoneksiDataInput;
        }, context: GraphQLContext) => Promise<import("../../services/KoneksiDataService").KoneksiDataResponse>;
        updateKoneksiData: (_: any, { input }: {
            input: UpdateKoneksiDataInput;
        }, context: GraphQLContext) => Promise<import("../../services/KoneksiDataService").KoneksiDataResponse>;
    };
    KoneksiData: {
        id: (parent: any) => any;
        idPelanggan: (parent: any) => any;
        pengguna: (parent: any) => any;
        statusPengajuan: (parent: any) => any;
        alasanPenolakan: (parent: any) => any;
        tanggalVerifikasi: (parent: any) => any;
        nik: (parent: any) => any;
        nikUrl: (parent: any) => any;
        noKK: (parent: any) => any;
        kkUrl: (parent: any) => any;
        imb: (parent: any) => any;
        imbUrl: (parent: any) => any;
        alamat: (parent: any) => any;
        kelurahan: (parent: any) => any;
        kecamatan: (parent: any) => any;
        luasBangunan: (parent: any) => any;
    };
};
//# sourceMappingURL=KoneksiData.d.ts.map