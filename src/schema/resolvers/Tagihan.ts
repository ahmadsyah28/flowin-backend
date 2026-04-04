import { GraphQLContext } from "@/types";
import { requireAuth } from "@/utils/authMiddleware";
import { TagihanService, TagihanFilterInput } from "@/services/TagihanService";
import { EnumPaymentStatus } from "@/enums";

export const tagihanResolvers = {
  // Mapping GraphQL enum ↔ nilai di database
  PaymentStatus: {
    PENDING: EnumPaymentStatus.PENDING,
    SETTLEMENT: EnumPaymentStatus.SETTLEMENT,
    CANCEL: EnumPaymentStatus.CANCEL,
    EXPIRE: EnumPaymentStatus.EXPIRE,
    REFUND: EnumPaymentStatus.REFUND,
    CHARGEBACK: EnumPaymentStatus.CHARGEBACK,
    FRAUD: EnumPaymentStatus.FRAUD,
  },

  Query: {
    tagihanList: async (
      _: any,
      { filter }: { filter?: TagihanFilterInput },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return TagihanService.getTagihanList(user._id, filter);
    },

    tagihan: async (_: any, { id }: { id: string }) => {
      return TagihanService.getTagihanById(id);
    },

    tagihanAktif: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return TagihanService.getTagihanAktif(user._id);
    },

    tagihanRiwayat: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return TagihanService.getTagihanRiwayat(user._id);
    },
  },

  Mutation: {
    bayarTagihan: async (
      _: any,
      { id, metodePembayaran }: { id: string; metodePembayaran: string },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return TagihanService.bayarTagihan(id, user._id, metodePembayaran);
    },
  },

  // Field resolvers
  Tagihan: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    idMeteran: (parent: any) => parent.IdMeteran,
    meteran: (parent: any) => parent.IdMeteran, // populated
    periode: (parent: any) => parent.Periode,
    penggunaanSebelum: (parent: any) => parent.PenggunaanSebelum,
    penggunaanSesudah: (parent: any) => parent.PenggunaanSekarang,
    TotalPemakaian: (parent: any) => parent.TotalPemakaian,
    biaya: (parent: any) => parent.Biaya,
    totalBiaya: (parent: any) => parent.TotalBiaya,
    statusPembayaran: (parent: any) => parent.StatusPembayaran,
    tanggalPembayaran: (parent: any) => parent.TanggalPembayaran,
    metodePembayaran: (parent: any) => parent.MetodePembayaran,
    tenggatWaktu: (parent: any) => parent.TenggatWaktu,
    menunggak: (parent: any) => parent.Menunggak,
    denda: (parent: any) => parent.Denda,
  },
};
