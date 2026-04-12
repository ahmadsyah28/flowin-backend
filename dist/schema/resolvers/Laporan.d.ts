import { GraphQLContext } from "@/types";
import { EnumJenisLaporan, EnumWorkStatusPelanggan } from "@/enums";
import { CreateLaporanInput, UpdateLaporanInput, LaporanFilterInput } from "@/services/LaporanService";
export declare const laporanResolvers: {
    JenisLaporan: {
        AIR_TIDAK_MENGALIR: EnumJenisLaporan;
        AIR_KERUH: EnumJenisLaporan;
        KEBOCORAN_PIPA: EnumJenisLaporan;
        METERAN_BERMASALAH: EnumJenisLaporan;
        KENDALA_LAINNYA: EnumJenisLaporan;
    };
    WorkStatusPelanggan: {
        DITUNDA: EnumWorkStatusPelanggan;
        DITUGASKAN: EnumWorkStatusPelanggan;
        DITINJAU_ADMIN: EnumWorkStatusPelanggan;
        SEDANG_DIKERJAKAN: EnumWorkStatusPelanggan;
        SELESAI: EnumWorkStatusPelanggan;
        DIBATALKAN: EnumWorkStatusPelanggan;
    };
    Query: {
        laporanList: (_: any, { filter }: {
            filter?: LaporanFilterInput;
        }, context: GraphQLContext) => Promise<import("@/services/LaporanService").LaporanListResponse>;
        laporanById: (_: any, { id }: {
            id: string;
        }) => Promise<import("@/services/LaporanService").LaporanResponse>;
        laporanAktif: (_: any, __: any, context: GraphQLContext) => Promise<import("@/services/LaporanService").LaporanListResponse>;
    };
    Mutation: {
        createLaporan: (_: any, { input }: {
            input: CreateLaporanInput;
        }, context: GraphQLContext) => Promise<import("@/services/LaporanService").LaporanResponse>;
        updateLaporan: (_: any, { id, input }: {
            id: string;
            input: UpdateLaporanInput;
        }, context: GraphQLContext) => Promise<import("@/services/LaporanService").LaporanResponse>;
        batalkanLaporan: (_: any, { id }: {
            id: string;
        }, context: GraphQLContext) => Promise<import("@/services/LaporanService").LaporanResponse>;
    };
    Laporan: {
        id: (parent: any) => any;
        idPengguna: (parent: any) => any;
        pengguna: (parent: any) => any;
        namaLaporan: (parent: any) => any;
        masalah: (parent: any) => any;
        alamat: (parent: any) => any;
        imageURL: (parent: any) => any;
        jenisLaporan: (parent: any) => any;
        catatan: (parent: any) => any;
        koordinat: (parent: any) => any;
        geoLokasi: (parent: any) => any;
        status: (parent: any) => any;
    };
    GeoLokasi: {
        id: (parent: any) => any;
        idLaporan: (parent: any) => any;
        latitude: (parent: any) => any;
        longitude: (parent: any) => any;
    };
};
//# sourceMappingURL=Laporan.d.ts.map