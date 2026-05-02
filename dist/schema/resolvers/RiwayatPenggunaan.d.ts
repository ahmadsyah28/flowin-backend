export declare const riwayatPenggunaanResolvers: {
    Query: {
        riwayatPenggunaan: (_: any, { meteranId }: {
            meteranId: string;
        }) => Promise<import("../../services/RiwayatPenggunaanService").RiwayatPenggunaanListResponse>;
    };
    RiwayatPenggunaan: {
        id: (parent: any) => any;
        meteranId: (parent: any) => any;
        penggunaanAir: (parent: any) => any;
        timestamp: (parent: any) => any;
    };
};
//# sourceMappingURL=RiwayatPenggunaan.d.ts.map