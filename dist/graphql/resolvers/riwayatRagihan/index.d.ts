export declare const riwayatRagihanResolvers: {
    Query: {
        riwayatRagihanByMeter: (_: unknown, { meterId }: {
            meterId: string;
        }) => Promise<{
            id: string;
            MeteranId: string;
            PenggunaanAir: number;
            createdAt: Date;
            updatedAt: Date;
        }[]>;
    };
};
export default riwayatRagihanResolvers;
//# sourceMappingURL=index.d.ts.map