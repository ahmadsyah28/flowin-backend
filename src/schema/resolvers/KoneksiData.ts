import { GraphQLContext } from "@/types";
import { requireAuth } from "@/utils/authMiddleware";
import {
  KoneksiDataService,
  CreateKoneksiDataInput,
  UpdateKoneksiDataInput,
} from "@/services/KoneksiDataService";

export const koneksiDataResolvers = {
  Query: {
    koneksiData: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return KoneksiDataService.getKoneksiData(user._id);
    },

    koneksiDataById: async (_: any, { id }: { id: string }) => {
      return KoneksiDataService.getKoneksiDataById(id);
    },

    cekStatusPengajuan: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return KoneksiDataService.cekStatusPengajuan(user._id);
    },
  },

  Mutation: {
    createKoneksiData: async (
      _: any,
      { input }: { input: CreateKoneksiDataInput },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return KoneksiDataService.createKoneksiData(user._id, input);
    },

    updateKoneksiData: async (
      _: any,
      { input }: { input: UpdateKoneksiDataInput },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return KoneksiDataService.updateKoneksiData(user._id, input);
    },
  },

  // Field resolvers
  KoneksiData: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    idPelanggan: (parent: any) => parent.IdPelanggan,
    pengguna: (parent: any) => parent.IdPelanggan, // populated
    statusPengajuan: (parent: any) => parent.StatusPengajuan,
    alasanPenolakan: (parent: any) => parent.AlasanPenolakan || null,
    tanggalVerifikasi: (parent: any) => parent.TanggalVerifikasi || null,
    nik: (parent: any) => parent.NIK,
    nikUrl: (parent: any) => parent.NIKUrl,
    noKK: (parent: any) => parent.NoKK,
    kkUrl: (parent: any) => parent.KKUrl,
    imb: (parent: any) => parent.IMB,
    imbUrl: (parent: any) => parent.IMBUrl,
    alamat: (parent: any) => parent.Alamat,
    kelurahan: (parent: any) => parent.Kelurahan,
    kecamatan: (parent: any) => parent.Kecamatan,
    luasBangunan: (parent: any) => parent.LuasBangunan,
  },
};
