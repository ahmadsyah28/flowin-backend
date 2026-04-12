import { GraphQLContext } from "../../types";
import { TagihanFilterInput } from "../../services/TagihanService";
import { EnumPaymentStatus } from "../../enums";
export declare const tagihanResolvers: {
    PaymentStatus: {
        PENDING: EnumPaymentStatus;
        SETTLEMENT: EnumPaymentStatus;
        CANCEL: EnumPaymentStatus;
        EXPIRE: EnumPaymentStatus;
        REFUND: EnumPaymentStatus;
        CHARGEBACK: EnumPaymentStatus;
        FRAUD: EnumPaymentStatus;
    };
    Query: {
        tagihanList: (_: any, { filter }: {
            filter?: TagihanFilterInput;
        }, context: GraphQLContext) => Promise<import("../../services/TagihanService").TagihanListResponse>;
        tagihan: (_: any, { id }: {
            id: string;
        }) => Promise<import("../../services/TagihanService").TagihanResponse>;
        tagihanAktif: (_: any, __: any, context: GraphQLContext) => Promise<import("../../services/TagihanService").TagihanResponse>;
        tagihanRiwayat: (_: any, __: any, context: GraphQLContext) => Promise<import("../../services/TagihanService").TagihanListResponse>;
    };
    Mutation: {
        bayarTagihan: (_: any, { id, metodePembayaran }: {
            id: string;
            metodePembayaran: string;
        }, context: GraphQLContext) => Promise<import("../../services/TagihanService").TagihanResponse>;
    };
    Tagihan: {
        id: (parent: any) => any;
        idMeteran: (parent: any) => any;
        meteran: (parent: any) => any;
        periode: (parent: any) => any;
        penggunaanSebelum: (parent: any) => any;
        penggunaanSesudah: (parent: any) => any;
        TotalPemakaian: (parent: any) => any;
        biaya: (parent: any) => any;
        totalBiaya: (parent: any) => any;
        statusPembayaran: (parent: any) => any;
        tanggalPembayaran: (parent: any) => any;
        metodePembayaran: (parent: any) => any;
        tenggatWaktu: (parent: any) => any;
        menunggak: (parent: any) => any;
        denda: (parent: any) => any;
    };
};
//# sourceMappingURL=Tagihan.d.ts.map