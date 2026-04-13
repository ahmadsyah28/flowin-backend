import { GraphQLContext } from "@/types";
import { requireAuth } from "@/utils/authMiddleware";
import { PembayaranService } from "@/services/PembayaranService";
import { EnumStatusPembayaran } from "@/models/Pembayaran";

export const pembayaranResolvers = {
  // Mapping GraphQL enum ↔ nilai di database
  StatusPembayaran: {
    Pending: EnumStatusPembayaran.PENDING,
    Settlement: EnumStatusPembayaran.SUKSES,
    Cancel: EnumStatusPembayaran.GAGAL,
    Expire: EnumStatusPembayaran.EXPIRED,
    Refund: EnumStatusPembayaran.REFUND,
  },

  Query: {
    pembayaranList: async (
      _: any,
      { limit, offset }: { limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return PembayaranService.getMyPembayaran(
        user._id,
        limit || 10,
        offset || 0,
      );
    },

    pembayaran: async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return PembayaranService.getPembayaranDetail(id, user._id);
    },
  },

  Mutation: {
    buatPembayaran: async (
      _: any,
      { tagihanId }: { tagihanId: string },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return PembayaranService.createPayment(tagihanId, user._id);
    },
  },

  // Field resolvers — map MongoDB fields ke GraphQL fields
  Pembayaran: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    idTagihan: (parent: any) => parent.IdTagihan,
    tagihan: (parent: any) => parent.IdTagihan, // populated
    idPengguna: (parent: any) => parent.IdPengguna,
    midtransOrderId: (parent: any) => parent.MidtransOrderId,
    midtransTransactionId: (parent: any) => parent.MidtransTransactionId,
    snapToken: (parent: any) => parent.SnapToken,
    snapRedirectUrl: (parent: any) => parent.SnapRedirectUrl,
    metodePembayaran: (parent: any) => parent.MetodePembayaran,
    jumlahBayar: (parent: any) => parent.JumlahBayar,
    statusPembayaran: (parent: any) => parent.StatusPembayaran,
    tanggalBayar: (parent: any) => parent.TanggalBayar,
  },
};
