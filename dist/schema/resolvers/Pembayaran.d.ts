import { GraphQLContext } from "@/types";
import { EnumStatusPembayaran } from "@/models/Pembayaran";
export declare const pembayaranResolvers: {
    StatusPembayaran: {
        Pending: EnumStatusPembayaran;
        Settlement: EnumStatusPembayaran;
        Cancel: EnumStatusPembayaran;
        Expire: EnumStatusPembayaran;
        Refund: EnumStatusPembayaran;
    };
    Query: {
        pembayaranList: (_: any, { limit, offset }: {
            limit?: number;
            offset?: number;
        }, context: GraphQLContext) => Promise<import("@/services/PembayaranService").PembayaranListResponse>;
        pembayaran: (_: any, { id }: {
            id: string;
        }, context: GraphQLContext) => Promise<import("@/services/PembayaranService").PembayaranResponse>;
        cekStatusPembayaran: (_: any, { orderId }: {
            orderId: string;
        }, context: GraphQLContext) => Promise<import("@/services/PembayaranService").PembayaranResponse>;
    };
    Mutation: {
        buatPembayaran: (_: any, { tagihanId }: {
            tagihanId: string;
        }, context: GraphQLContext) => Promise<import("@/services/PembayaranService").CreatePaymentResponse>;
    };
    Pembayaran: {
        id: (parent: any) => any;
        idTagihan: (parent: any) => any;
        tagihan: (parent: any) => any;
        idPengguna: (parent: any) => any;
        midtransOrderId: (parent: any) => any;
        midtransTransactionId: (parent: any) => any;
        snapToken: (parent: any) => any;
        snapRedirectUrl: (parent: any) => any;
        metodePembayaran: (parent: any) => any;
        jumlahBayar: (parent: any) => any;
        statusPembayaran: (parent: any) => any;
        tanggalBayar: (parent: any) => any;
    };
};
//# sourceMappingURL=Pembayaran.d.ts.map