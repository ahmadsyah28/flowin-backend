import { IResolvers } from "@graphql-tools/utils";
import { penggunaResolvers } from "./Pengguna";
import { riwayatPenggunaanResolvers } from "./RiwayatPenggunaan";
import { koneksiDataResolvers } from "./KoneksiData";
import { laporanResolvers } from "./Laporan";
import { meterResolvers } from "./Meter";
import { notifikasiResolvers } from "./Notifikasi";
import { tagihanResolvers } from "./Tagihan";
import { pembayaranResolvers } from "./Pembayaran";
import { monitoringResolvers } from "./Monitoring";
import { rabResolvers } from "./RAB";

const resolvers: IResolvers = {
  // Field resolvers
  Pengguna: {
    id: (parent: any) => parent._id?.toString() || parent.id,
  },

  RiwayatPenggunaan: {
    ...riwayatPenggunaanResolvers.RiwayatPenggunaan,
  },

  KoneksiData: {
    ...koneksiDataResolvers.KoneksiData,
  },

  // Enum resolvers (map GraphQL enum keys to Mongoose values)
  JenisLaporan: {
    ...laporanResolvers.JenisLaporan,
  },

  WorkStatusPelanggan: {
    ...laporanResolvers.WorkStatusPelanggan,
  },

  Laporan: {
    ...laporanResolvers.Laporan,
  },

  GeoLokasi: {
    ...laporanResolvers.GeoLokasi,
  },

  Meter: {
    ...meterResolvers.Meter,
  },

  Notifikasi: {
    ...notifikasiResolvers.Notifikasi,
  },

  Tagihan: {
    ...tagihanResolvers.Tagihan,
  },

  PaymentStatus: {
    ...tagihanResolvers.PaymentStatus,
  },

  Pembayaran: {
    ...pembayaranResolvers.Pembayaran,
  },

  StatusPembayaran: {
    ...pembayaranResolvers.StatusPembayaran,
  },

  RAB: {
    ...rabResolvers.RAB,
  },

  Query: {
    hello: () => "Hello, from GraphQL server!",

    // Pengguna queries
    ...penggunaResolvers.Query,

    // RiwayatPenggunaan queries
    ...riwayatPenggunaanResolvers.Query,

    // KoneksiData queries
    ...koneksiDataResolvers.Query,

    // Laporan queries
    ...laporanResolvers.Query,

    // Meter queries
    ...meterResolvers.Query,

    // Notifikasi queries
    ...notifikasiResolvers.Query,

    // Tagihan queries
    ...tagihanResolvers.Query,

    // Pembayaran queries
    ...pembayaranResolvers.Query,

    // Monitoring queries
    ...monitoringResolvers.Query,

    // RAB queries
    ...rabResolvers.Query,
  },

  Mutation: {
    testMutation: () => "This is a test mutation response.",

    // Pengguna mutations
    ...penggunaResolvers.Mutation,

    // KoneksiData mutations
    ...koneksiDataResolvers.Mutation,

    // Laporan mutations
    ...laporanResolvers.Mutation,

    // Tagihan mutations
    ...tagihanResolvers.Mutation,

    // Pembayaran mutations
    ...pembayaranResolvers.Mutation,

    // RAB mutations
    ...rabResolvers.Mutation,
  },

  Subscription: {
    testSubscription: {
      subscribe: () => {
        // Implementasi subscription nanti
        return null;
      },
    },
  },

  Date: {
    serialize: (value: any) => {
      return value instanceof Date ? value.toISOString() : null;
    },
    parseValue: (value: any) => {
      return new Date(value);
    },
    parseLiteral: (ast: any) => {
      return new Date(ast.value);
    },
  },

  ObjectId: {
    serialize: (value: any) => {
      return value.toString();
    },
    parseValue: (value: any) => {
      return value;
    },
    parseLiteral: (ast: any) => {
      return ast.value;
    },
  },
};

export default resolvers;
