"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoLokasiTypeDefs = void 0;
exports.geoLokasiTypeDefs = `#graphql
  # ================================
  # GeoLokasi Types
  # ================================
  type GeoLokasi {
    id: ID!
    IdLaporan: ID!
    Latitude: Float!
    Longitude: Float!
    createdAt: DateTime
    updatedAt: DateTime
  }

  # No specific queries or mutations for GeoLokasi in current schema
`;
exports.default = exports.geoLokasiTypeDefs;
//# sourceMappingURL=index.js.map