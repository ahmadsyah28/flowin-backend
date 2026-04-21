import { GraphQLContext } from "@/types";
import { requireAuth } from "@/utils/authMiddleware";
import {
  NotifikasiService,
  NotifikasiFilterInput,
} from "@/services/NotifikasiService";

export const notifikasiResolvers = {
  Query: {
    notifikasiList: async (
      _: any,
      { filter }: { filter?: NotifikasiFilterInput },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return NotifikasiService.getNotifikasiList(user._id, filter);
    },

    notifikasiById: async (_: any, { id }: { id: string }) => {
      return NotifikasiService.getNotifikasiById(id);
    },
  },

  Mutation: {
    markNotifikasiAsRead: async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext,
    ) => {
      try {
        console.log(`🔵 [Resolver] markNotifikasiAsRead called with ID: ${id}`);
        const user = requireAuth(context);
        console.log(`🔵 [Resolver] User ID: ${user._id}`);
        const result = await NotifikasiService.markAsRead(id, user._id);
        console.log(`🔵 [Resolver] Result:`, result);
        return result;
      } catch (error: any) {
        console.error(`🔴 [Resolver] Error in markNotifikasiAsRead:`, error);
        return {
          success: false,
          message: error.message || "Terjadi kesalahan pada server",
          data: null,
        };
      }
    },
  },

  // Field resolvers
  Notifikasi: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    idPelanggan: (parent: any) => parent.IdPelanggan,
    idAdmin: (parent: any) => parent.IdAdmin,
    idTeknisi: (parent: any) => parent.IdTeknisi,
    judul: (parent: any) => parent.Judul,
    pesan: (parent: any) => parent.Pesan,
    kategori: (parent: any) => parent.Kategori,
    link: (parent: any) => parent.Link,
    isRead: (parent: any) => parent.isRead || false,
  },
};
