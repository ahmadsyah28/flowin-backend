"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const Pengguna_1 = require("./Pengguna");
const Tagihan_1 = require("./Tagihan");
const Laporan_1 = require("./Laporan");
const Notifikasi_1 = require("./Notifikasi");
const Meter_1 = require("./Meter");
const KoneksiData_1 = require("./KoneksiData");
const GeoLokasi_1 = require("./GeoLokasi");
const RiwayatPenggunaan_1 = require("./RiwayatPenggunaan");
const Pembayaran_1 = require("./Pembayaran");
const Monitoring_1 = require("./Monitoring");
exports.typeDefs = `
  # Scalar types untuk tipe data khusus
  scalar Date
  scalar ObjectId

  # Base Query - semua query akan didefinisikan disini
  type Query {
    # Test query untuk memastikan server berjalan
    hello: String!
  }

  # Base Mutation - semua mutation akan didefinisikan disini
  type Mutation {
    # Test mutation untuk memastikan server berjalan
    testMutation: String
  }

  # Base Subscription - semua subscription akan didefinisikan disini
  type Subscription {
    # Test subscription untuk memastikan server berjalan
    testSubscription: String
  }

  ${Pengguna_1.penggunaTypeDefs}
  ${Tagihan_1.tagihanTypeDefs}
  ${Laporan_1.laporanTypeDefs}
  ${Notifikasi_1.notifikasiTypeDefs}
  ${Meter_1.meterTypeDefs}
  ${KoneksiData_1.koneksiDataTypeDefs}
  ${GeoLokasi_1.geoLokasiTypeDefs}
  ${RiwayatPenggunaan_1.riwayatPenggunaanTypeDefs}
  ${Pembayaran_1.pembayaranTypeDefs}
  ${Monitoring_1.monitoringTypeDefs}
`;
//# sourceMappingURL=index.js.map