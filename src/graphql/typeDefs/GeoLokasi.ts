export const geoLokasiTypeDefs = `
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