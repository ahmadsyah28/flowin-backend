import { GraphQLContext, CreateLaporanInput } from "@/types";
import { EnumWorkStatusPelanggan } from "@/enums";
export declare const laporanResolvers: {
    Query: {
        laporanByPengguna: (_: unknown, { penggunaId }: {
            penggunaId?: string;
        }, context: GraphQLContext) => Promise<{
            id: string;
            IdPengguna: string;
            NamaLaporan: string;
            Masalah: string;
            Alamat: string;
            ImageURL: string[];
            JenisLaporan: import("@/enums").EnumJenisLaporan;
            Catatan: string;
            Koordinat: string;
            Status: EnumWorkStatusPelanggan;
            createdAt: Date;
            updatedAt: Date;
        }[]>;
        laporanById: (_: unknown, { id }: {
            id: string;
        }) => Promise<{
            id: string;
            IdPengguna: string;
            NamaLaporan: string;
            Masalah: string;
            Alamat: string;
            ImageURL: string[];
            JenisLaporan: import("@/enums").EnumJenisLaporan;
            Catatan: string;
            Koordinat: string;
            Status: EnumWorkStatusPelanggan;
            createdAt: Date;
            updatedAt: Date;
        }>;
        laporanByStatus: (_: unknown, { status }: {
            status: EnumWorkStatusPelanggan;
        }) => Promise<{
            id: string;
            IdPengguna: string;
            NamaLaporan: string;
            Masalah: string;
            Alamat: string;
            ImageURL: string[];
            JenisLaporan: import("@/enums").EnumJenisLaporan;
            Catatan: string;
            Koordinat: string;
            Status: EnumWorkStatusPelanggan;
            createdAt: Date;
            updatedAt: Date;
        }[]>;
    };
    Mutation: {
        createLaporan: (_: unknown, { input }: {
            input: CreateLaporanInput;
        }, context: GraphQLContext) => Promise<{
            id: string;
            IdPengguna: string;
            NamaLaporan: string;
            Masalah: string;
            Alamat: string;
            ImageURL: string[];
            JenisLaporan: import("@/enums").EnumJenisLaporan;
            Catatan: string;
            Koordinat: string;
            Status: EnumWorkStatusPelanggan;
            createdAt: Date;
            updatedAt: Date;
        }>;
        updateLaporanStatus: (_: unknown, { id, status }: {
            id: string;
            status: EnumWorkStatusPelanggan;
        }, context: GraphQLContext) => Promise<{
            id: string;
            IdPengguna: string;
            NamaLaporan: string;
            Masalah: string;
            Alamat: string;
            ImageURL: string[];
            JenisLaporan: import("@/enums").EnumJenisLaporan;
            Catatan: string;
            Koordinat: string;
            Status: EnumWorkStatusPelanggan;
            createdAt: Date;
            updatedAt: Date;
        }>;
    };
};
export default laporanResolvers;
//# sourceMappingURL=index.d.ts.map