import { GraphQLContext, CreateKoneksiDataInput, UpdateKoneksiDataInput } from "@/types";
export declare const koneksiDataResolvers: {
    Query: {
        koneksiDataByPelanggan: (_: unknown, __: unknown, context: GraphQLContext) => Promise<{
            id: string;
            IdPelanggan: string;
            StatusVerifikasi: boolean;
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
            createdAt: Date;
            updatedAt: Date;
        } | null>;
        koneksiDataById: (_: unknown, { id }: {
            id: string;
        }) => Promise<{
            id: string;
            IdPelanggan: string;
            StatusVerifikasi: boolean;
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
            createdAt: Date;
            updatedAt: Date;
        }>;
    };
    Mutation: {
        createKoneksiData: (_: unknown, { input }: {
            input: CreateKoneksiDataInput;
        }, context: GraphQLContext) => Promise<{
            id: string;
            IdPelanggan: string;
            StatusVerifikasi: boolean;
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
            createdAt: Date;
            updatedAt: Date;
        }>;
        updateKoneksiData: (_: unknown, { id, input }: {
            id: string;
            input: UpdateKoneksiDataInput;
        }, context: GraphQLContext) => Promise<{
            id: string;
            IdPelanggan: string;
            StatusVerifikasi: boolean;
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
            createdAt: Date;
            updatedAt: Date;
        }>;
    };
};
export default koneksiDataResolvers;
//# sourceMappingURL=index.d.ts.map