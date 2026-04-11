import { GraphQLContext } from "@/types";
import { requireAuth } from "@/utils/authMiddleware";
import { RABService } from "@/services/RABService";

export const rabResolvers = {
  Query: {
    getMyRAB: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return RABService.getRABByKoneksiData(user._id);
    },
  },

  Mutation: {
    createRABPayment: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      const result = await RABService.createRABPayment(user._id);
      return {
        success: result.success,
        message: result.message,
        snapToken: result.data?.snapToken || null,
        snapRedirectUrl: result.data?.snapRedirectUrl || null,
      };
    },
  },

  RAB: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    idKoneksiData: (parent: any) => parent.idKoneksiData,
    totalBiaya: (parent: any) => parent.totalBiaya,
    statusPembayaran: (parent: any) => parent.statusPembayaran,
    orderId: (parent: any) => parent.orderId || null,
    paymentUrl: (parent: any) => parent.paymentUrl || null,
    urlRab: (parent: any) => parent.urlRab || null,
    catatan: (parent: any) => parent.catatan || null,
  },
};
