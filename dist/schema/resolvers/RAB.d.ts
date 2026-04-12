import { GraphQLContext } from "@/types";
export declare const rabResolvers: {
    Query: {
        getMyRAB: (_: any, __: any, context: GraphQLContext) => Promise<import("@/services/RABService").RABResponse>;
    };
    Mutation: {
        createRABPayment: (_: any, __: any, context: GraphQLContext) => Promise<{
            success: boolean;
            message: string;
            snapToken: string | null;
            snapRedirectUrl: string | null;
        }>;
    };
    RAB: {
        id: (parent: any) => any;
        idKoneksiData: (parent: any) => any;
        totalBiaya: (parent: any) => any;
        statusPembayaran: (parent: any) => any;
        orderId: (parent: any) => any;
        paymentUrl: (parent: any) => any;
        urlRab: (parent: any) => any;
        catatan: (parent: any) => any;
    };
};
//# sourceMappingURL=RAB.d.ts.map