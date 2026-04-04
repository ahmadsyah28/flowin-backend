import { GraphQLContext } from "@/types";
import { requireAuth } from "@/utils/authMiddleware";
import { MeterService } from "@/services/MeterService";

export const meterResolvers = {
  Query: {
    meterList: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return MeterService.getMeterList(user._id);
    },

    meterById: async (_: any, { id }: { id: string }) => {
      return MeterService.getMeterById(id);
    },

    meterByNomor: async (
      _: any,
      { nomorMeteran }: { nomorMeteran: string },
    ) => {
      return MeterService.getMeterByNomor(nomorMeteran);
    },
  },

  // Field resolvers
  Meter: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    idKelompokPelanggan: (parent: any) => parent.IdKelompokPelanggan,
    idKoneksiData: (parent: any) => parent.IdKoneksiData,
    koneksiData: (parent: any) => parent.IdKoneksiData, // populated
    nomorMeteran: (parent: any) => parent.NomorMeteran,
    nomorAkun: (parent: any) => parent.NomorAkun,
  },
};
