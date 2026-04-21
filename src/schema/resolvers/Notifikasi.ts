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
      const user = requireAuth(context);
      return NotifikasiService.markAsRead(id, user._id);
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
