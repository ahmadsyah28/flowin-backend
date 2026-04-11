import { penggunaTypeDefs } from "./Pengguna";
import { tagihanTypeDefs } from "./Tagihan";
import { laporanTypeDefs } from "./Laporan";
import { notifikasiTypeDefs } from "./Notifikasi";
import { meterTypeDefs } from "./Meter";
import { koneksiDataTypeDefs } from "./KoneksiData";
import { geoLokasiTypeDefs } from "./GeoLokasi";
import { riwayatPenggunaanTypeDefs } from "./RiwayatPenggunaan";
import { pembayaranTypeDefs } from "./Pembayaran";
import { monitoringTypeDefs } from "./Monitoring";
import { rabTypeDefs } from "./RAB";

export const typeDefs = `
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

  ${penggunaTypeDefs}
  ${tagihanTypeDefs}
  ${laporanTypeDefs}
  ${notifikasiTypeDefs}
  ${meterTypeDefs}
  ${koneksiDataTypeDefs}
  ${geoLokasiTypeDefs}
  ${riwayatPenggunaanTypeDefs}
  ${pembayaranTypeDefs}
  ${monitoringTypeDefs}
  ${rabTypeDefs}
`;
