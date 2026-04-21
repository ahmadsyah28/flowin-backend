import { GraphQLContext } from "../../types";
import { NotifikasiFilterInput } from "../../services/NotifikasiService";
export declare const notifikasiResolvers: {
    Query: {
        notifikasiList: (_: any, { filter }: {
            filter?: NotifikasiFilterInput;
        }, context: GraphQLContext) => Promise<import("../../services/NotifikasiService").NotifikasiListResponse>;
        notifikasiById: (_: any, { id }: {
            id: string;
        }) => Promise<import("../../services/NotifikasiService").NotifikasiResponse>;
    };
    Mutation: {
        markNotifikasiAsRead: (_: any, { id }: {
            id: string;
        }, context: GraphQLContext) => Promise<import("../../services/NotifikasiService").NotifikasiResponse | {
            success: boolean;
            message: any;
            data: null;
        }>;
    };
    Notifikasi: {
        id: (parent: any) => any;
        idPelanggan: (parent: any) => any;
        idAdmin: (parent: any) => any;
        idTeknisi: (parent: any) => any;
        judul: (parent: any) => any;
        pesan: (parent: any) => any;
        kategori: (parent: any) => any;
        link: (parent: any) => any;
        isRead: (parent: any) => any;
    };
};
//# sourceMappingURL=Notifikasi.d.ts.map