import { GraphQLContext } from "@/types";
export declare const notifikasiResolvers: {
    Query: {
        notifikasiByPelanggan: (_: unknown, { pelangganId }: {
            pelangganId?: string;
        }, context: GraphQLContext) => Promise<{
            id: string;
            IdPelanggan: string;
            IdAdmin: string;
            IdTeknisi: string;
            Judul: string;
            Pesan: string;
            Kategori: import("../../../enums").EnumNotifikasiKategori;
            Link: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[]>;
    };
};
export default notifikasiResolvers;
//# sourceMappingURL=index.d.ts.map