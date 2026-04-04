"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoLokasiTypeDefs = void 0;
exports.geoLokasiTypeDefs = `
  # Type untuk data geo lokasi
  type GeoLokasi {
    id: ObjectId!
    idLaporan: ObjectId!
    latitude: Float!
    longitude: Float!
    createdAt: Date!
    updatedAt: Date!
  }
`;
//# sourceMappingURL=GeoLokasi.js.map