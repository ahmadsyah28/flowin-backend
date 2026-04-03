import { GraphQLContext } from "../../../types";
import { EnumPaymentStatus } from "../../../enums";
export declare const tagihanResolvers: {
    Query: {
        tagihanByPengguna: (_: unknown, { penggunaId }: {
            penggunaId?: string;
        }, context: GraphQLContext) => Promise<{
            id: string;
            IdMeteran: string;
            Periode: string;
            PenggunaanSebelum: number;
            PenggunaanSekarang: number;
            TotalPemakaian: number;
            Biaya: number;
            TotalBiaya: number;
            StatusPembayaran: EnumPaymentStatus;
            TanggalPembayaran: Date;
            MetodePembayaran: string;
            TenggatWaktu: Date;
            Menunggak: boolean;
            Denda: number;
            Catatan: string;
            createdAt: Date;
            updatedAt: Date;
        }[]>;
        tagihanById: (_: unknown, { id }: {
            id: string;
        }) => Promise<{
            id: string;
            IdMeteran: string;
            Periode: string;
            PenggunaanSebelum: number;
            PenggunaanSekarang: number;
            TotalPemakaian: number;
            Biaya: number;
            TotalBiaya: number;
            StatusPembayaran: EnumPaymentStatus;
            TanggalPembayaran: Date;
            MetodePembayaran: string;
            TenggatWaktu: Date;
            Menunggak: boolean;
            Denda: number;
            Catatan: string;
            createdAt: Date;
            updatedAt: Date;
        }>;
        tagihanByStatus: (_: unknown, { status }: {
            status: EnumPaymentStatus;
        }) => Promise<{
            id: string;
            IdMeteran: string;
            Periode: string;
            PenggunaanSebelum: number;
            PenggunaanSekarang: number;
            TotalPemakaian: number;
            Biaya: number;
            TotalBiaya: number;
            StatusPembayaran: EnumPaymentStatus;
            TanggalPembayaran: Date;
            MetodePembayaran: string;
            TenggatWaktu: Date;
            Menunggak: boolean;
            Denda: number;
            Catatan: string;
            createdAt: Date;
            updatedAt: Date;
        }[]>;
    };
    Mutation: {
        bayarTagihan: (_: unknown, { id, metodePembayaran }: {
            id: string;
            metodePembayaran: string;
        }, context: GraphQLContext) => Promise<{
            id: string;
            IdMeteran: string;
            Periode: string;
            PenggunaanSebelum: number;
            PenggunaanSekarang: number;
            TotalPemakaian: number;
            Biaya: number;
            TotalBiaya: number;
            StatusPembayaran: EnumPaymentStatus;
            TanggalPembayaran: Date;
            MetodePembayaran: string;
            TenggatWaktu: Date;
            Menunggak: boolean;
            Denda: number;
            Catatan: string;
            createdAt: Date;
            updatedAt: Date;
        }>;
    };
};
export default tagihanResolvers;
//# sourceMappingURL=index.d.ts.map