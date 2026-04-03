"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumsTypeDefs = void 0;
exports.enumsTypeDefs = `#graphql
  # ================================
  # Enums
  # ================================
  enum PaymentStatus {
    PENDING
    SETTLEMENT
    CANCEL
    EXPIRE
    REFUND
    CHARGEBACK
    FRAUD
  }

  enum JenisLaporan {
    AIR_TIDAK_MENGALIR
    AIR_KERUH
    KEBOCORAN_PIPA
    METERAN_BERMASALAH
    KENDALA_LAINNYA
  }

  enum WorkStatusPelanggan {
    DITUNDA
    DITUGASKAN
    DITINJAU_ADMIN
    SEDANG_DIKERJAKAN
    SELESAI
    DIBATALKAN
  }

  enum NotifikasiKategori {
    PEMBAYARAN
    INFORMASI
  }
`;
exports.default = exports.enumsTypeDefs;
//# sourceMappingURL=index.js.map