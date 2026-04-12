import { GraphQLContext } from "@/types";
export declare const meterResolvers: {
    Query: {
        meterList: (_: any, __: any, context: GraphQLContext) => Promise<import("@/services/MeterService").MeterListResponse>;
        meterById: (_: any, { id }: {
            id: string;
        }) => Promise<import("@/services/MeterService").MeterResponse>;
        meterByNomor: (_: any, { nomorMeteran }: {
            nomorMeteran: string;
        }) => Promise<import("@/services/MeterService").MeterResponse>;
    };
    Meter: {
        id: (parent: any) => any;
        idKelompokPelanggan: (parent: any) => any;
        idKoneksiData: (parent: any) => any;
        koneksiData: (parent: any) => any;
        nomorMeteran: (parent: any) => any;
        nomorAkun: (parent: any) => any;
    };
};
//# sourceMappingURL=Meter.d.ts.map