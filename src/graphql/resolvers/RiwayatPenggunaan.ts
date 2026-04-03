import { RiwayatPenggunaanService } from "@/services/RiwayatPenggunaanService";

export const riwayatPenggunaanResolvers = {
  Query: {
    riwayatPenggunaan: async (_: any, { meteranId }: { meteranId: string }) => {
      return RiwayatPenggunaanService.getRiwayatPenggunaan(meteranId);
    },
  },

  // Field resolvers
  RiwayatPenggunaan: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    meteranId: (parent: any) => parent.MeteranId,
    meteran: (parent: any) => parent.MeteranId, // populated
    penggunaanAir: (parent: any) => parent.PenggunaanAir,
  },
};
