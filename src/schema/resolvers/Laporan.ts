import { GraphQLContext } from "@/types";
import { requireAuth } from "@/utils/authMiddleware";
import { EnumJenisLaporan, EnumWorkStatusPelanggan } from "@/enums";
import {
  LaporanService,
  CreateLaporanInput,
  UpdateLaporanInput,
  LaporanFilterInput,
} from "@/services/LaporanService";

export const laporanResolvers = {
  // Map GraphQL enum keys to Mongoose enum values
  JenisLaporan: {
    AIR_TIDAK_MENGALIR: EnumJenisLaporan.AIR_TIDAK_MENGALIR,
    AIR_KERUH: EnumJenisLaporan.AIR_KERUH,
    KEBOCORAN_PIPA: EnumJenisLaporan.KEBOCORAN_PIPA,
    METERAN_BERMASALAH: EnumJenisLaporan.METERAN_BERMASALAH,
    KENDALA_LAINNYA: EnumJenisLaporan.KENDALA_LAINNYA,
  },

  WorkStatusPelanggan: {
    DITUNDA: EnumWorkStatusPelanggan.DITUNDA,
    DITUGASKAN: EnumWorkStatusPelanggan.DITUGASKAN,
    DITINJAU_ADMIN: EnumWorkStatusPelanggan.DITINJAU_ADMIN,
    SEDANG_DIKERJAKAN: EnumWorkStatusPelanggan.SEDANG_DIKERJAKAN,
    SELESAI: EnumWorkStatusPelanggan.SELESAI,
    DIBATALKAN: EnumWorkStatusPelanggan.DIBATALKAN,
  },

  Query: {
    laporanList: async (
      _: any,
      { filter }: { filter?: LaporanFilterInput },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return LaporanService.getLaporanList(user._id, filter);
    },

    laporanById: async (_: any, { id }: { id: string }) => {
      return LaporanService.getLaporanById(id);
    },

    laporanAktif: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return LaporanService.getLaporanAktif(user._id);
    },
  },

  Mutation: {
    createLaporan: async (
      _: any,
      { input }: { input: CreateLaporanInput },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return LaporanService.createLaporan(user._id, input);
    },

    updateLaporan: async (
      _: any,
      { id, input }: { id: string; input: UpdateLaporanInput },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return LaporanService.updateLaporan(id, user._id, input);
    },

    batalkanLaporan: async (
      _: any,
      { id }: { id: string },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return LaporanService.batalkanLaporan(id, user._id);
    },
  },

  // Field resolvers
  Laporan: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    idPengguna: (parent: any) => parent.IdPengguna,
    pengguna: (parent: any) => parent.IdPengguna, // populated
    namaLaporan: (parent: any) => parent.NamaLaporan,
    masalah: (parent: any) => parent.Masalah,
    alamat: (parent: any) => parent.Alamat,
    imageURL: (parent: any) => parent.ImageURL,
    jenisLaporan: (parent: any) => parent.JenisLaporan,
    catatan: (parent: any) => parent.Catatan,
    koordinat: (parent: any) => parent.Koordinat,
    geoLokasi: (parent: any) => parent.Koordinat, // populated
    status: (parent: any) => parent.Status,
  },

  // GeoLokasi field resolvers
  GeoLokasi: {
    id: (parent: any) => parent._id?.toString() || parent.id,
    idLaporan: (parent: any) => parent.IdLaporan,
    latitude: (parent: any) => parent.Latitude,
    longitude: (parent: any) => parent.Longitude,
  },
};
