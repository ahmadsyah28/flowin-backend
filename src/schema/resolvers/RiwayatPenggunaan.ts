import { RiwayatPenggunaanService } from "@/services/RiwayatPenggunaanService";

export const riwayatPenggunaanResolvers = {
  Query: {
    riwayatPenggunaan: async (_: any, { meteranId }: { meteranId: string }) => {
      return RiwayatPenggunaanService.getRiwayatPenggunaan(meteranId);
    },
  },

  // Field resolvers — sesuai skema baru IoT (MeterID: string)
  RiwayatPenggunaan: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    meteranId: (parent: any) => parent.MeterID,
    penggunaanAir: (parent: any) => parent.PenggunaanAir,
    timestamp: (parent: any) =>
      parent.timestamp?.toISOString?.() ?? parent.timestamp,
  },
};
