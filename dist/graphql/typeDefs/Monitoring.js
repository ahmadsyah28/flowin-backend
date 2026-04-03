"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringTypeDefs = void 0;
exports.monitoringTypeDefs = `
  # ==========================================
  # TYPE DEFINITIONS
  # ==========================================

  """
  Pembacaan terakhir dari sensor IoT
  Data disimpan di Redis: usage:{meteranId}:latest
  """
  type LatestReading {
    volume: Float!        # Volume pembacaan dalam liter
    timestamp: String!    # Waktu pembacaan ISO format
    meteranId: String!    # ID meteran
  }

  """
  Data penggunaan per hari dalam satu bulan
  Format: { "01": 45.7, "02": 38.2, ... }
  """
  type DailyUsageEntry {
    tanggal: String!      # Tanggal (DD)
    liter: Float!         # Penggunaan dalam liter
  }

  """
  Data penggunaan untuk satu bulan
  Bisa dari Redis (bulan ini) atau MongoDB (bulan lalu)
  """
  type MonthlyUsageData {
    periode: String!              # Format: "YYYY-MM"
    totalPenggunaan: Float!       # Total liter dalam bulan
    dataHarian: [DailyUsageEntry!]! # Breakdown per hari
    sumber: String!               # "redis" atau "mongodb"
  }

  """
  Statistik perbandingan dengan bulan sebelumnya
  """
  type UsageComparison {
    bulanIni: Float!      # Total penggunaan bulan ini (liter)
    bulanLalu: Float!     # Total penggunaan bulan lalu (liter)
    selisih: Float!       # Selisih (positif = naik, negatif = turun)
    persentase: Float!    # Persentase perubahan
    status: String!       # "naik", "turun", atau "sama"
  }

  """
  Prediksi penggunaan sampai akhir bulan
  Dihitung berdasarkan rata-rata harian saat ini
  """
  type UsagePrediction {
    hariTerlewati: Int!       # Jumlah hari yang sudah lewat
    hariTersisa: Int!         # Jumlah hari tersisa dalam bulan
    totalHari: Int!           # Total hari dalam bulan
    rataRataHarian: Float!    # Rata-rata penggunaan per hari (liter)
    prediksiAkhirBulan: Float! # Prediksi total akhir bulan (liter)
    penggunaanSaatIni: Float! # Penggunaan sampai saat ini (liter)
  }

  """
  Info kelompok pelanggan untuk tampilan tagihan
  """
  type KelompokInfo {
    kode: String!         # Kode kelompok (RT-1, N-2, dll)
    nama: String!         # Nama lengkap kelompok
    kategori: String!     # Kategori (Sosial, Non Niaga, Niaga, dll)
  }

  """
  Estimasi tagihan berdasarkan tarif PDAM
  Dihitung dari prediksi pemakaian akhir bulan
  """
  type BillingEstimate {
    pemakaianM3: Float!       # Pemakaian dalam m³ (kubik)
    tarifRendah: Float!       # Tarif 0-10 m³ (per m³)
    tarifTinggi: Float!       # Tarif >10 m³ (per m³)
    batasRendah: Float!       # Batas pemakaian rendah (biasanya 10 m³)
    biayaPemakaian: Float!    # Biaya pemakaian air
    biayaBeban: Float!        # Biaya beban bulanan
    totalEstimasi: Float!     # Total estimasi tagihan
    kelompok: KelompokInfo!   # Info kelompok pelanggan
  }

  """
  Evaluasi kategori penggunaan air
  Berdasarkan rata-rata bulanan:
  - hemat: < 5 m³/bulan
  - normal: 5-15 m³/bulan
  - boros: > 15 m³/bulan
  """
  type UsageEvaluation {
    kategori: String!         # "hemat", "normal", atau "boros"
    deskripsi: String!        # Penjelasan kategori
    rataRataBulanan: Float!   # Rata-rata penggunaan bulanan (liter)
    batasHemat: Float!        # Batas kategori hemat (liter)
    batasBoros: Float!        # Batas kategori boros (liter)
  }

  """
  Info dasar meteran untuk dashboard
  """
  type MeteranInfo {
    id: String!               # ID meteran
    nomorMeteran: String!     # Nomor fisik meteran
    nomorAkun: String!        # Nomor akun pelanggan
  }

  """
  Entry untuk chart harian (7 hari terakhir)
  """
  type ChartEntry {
    tanggal: String!          # Format: "DD/MM"
    liter: Float!             # Penggunaan dalam liter
  }

  """
  Data lengkap untuk dashboard monitoring
  Menggabungkan data dari Redis (real-time) dan MongoDB (historis)
  """
  type MonitoringDashboardData {
    # Info Meteran
    meteran: MeteranInfo!
    
    # Pembacaan terakhir dari sensor IoT
    latestReading: LatestReading
    
    # Penggunaan bulan ini (dari Redis)
    bulanIni: MonthlyUsageData
    
    # Penggunaan bulan lalu (dari MongoDB)
    bulanLalu: MonthlyUsageData
    
    # Total keseluruhan sepanjang waktu
    totalKeseluruhan: Float!
    
    # Rata-rata bulanan (6 bulan terakhir)
    rataRataBulanan: Float!
    
    # Perbandingan bulan ini vs bulan lalu
    perbandingan: UsageComparison
    
    # Prediksi penggunaan akhir bulan
    prediksi: UsagePrediction
    
    # Evaluasi kategori penggunaan
    evaluasi: UsageEvaluation!
    
    # Estimasi tagihan bulan ini
    estimasiTagihan: BillingEstimate
    
    # Data untuk chart 7 hari terakhir
    chartHarian: [ChartEntry!]!
  }

  # ==========================================
  # RESPONSE TYPES
  # ==========================================

  """
  Response untuk query dashboard monitoring
  """
  type MonitoringDashboardResponse {
    success: Boolean!
    message: String!
    data: MonitoringDashboardData
  }

  """
  Response untuk query history
  """
  type MonitoringHistoryResponse {
    success: Boolean!
    message: String!
    data: [MonthlyUsageData!]
  }

  """
  Entry data per jam
  """
  type HourlyEntry {
    jam: String!              # Format: "HH" (00-23)
    liter: Float!             # Penggunaan dalam liter
  }

  """
  Response untuk query data per jam
  """
  type MonitoringHourlyResponse {
    success: Boolean!
    message: String!
    data: [HourlyEntry!]
  }

  # ==========================================
  # QUERIES
  # ==========================================

  extend type Query {
    """
    Mendapatkan data dashboard monitoring lengkap
    Memerlukan autentikasi
    
    @param meteranId - ID meteran yang akan dimonitor
    @returns MonitoringDashboardResponse dengan semua data monitoring
    """
    monitoringDashboard(meteranId: ObjectId!): MonitoringDashboardResponse!

    """
    Mendapatkan riwayat penggunaan beberapa bulan terakhir
    
    @param meteranId - ID meteran
    @param jumlahBulan - Jumlah bulan ke belakang (default: 6)
    @returns MonitoringHistoryResponse dengan array data bulanan
    """
    monitoringHistory(
      meteranId: ObjectId!, 
      jumlahBulan: Int
    ): MonitoringHistoryResponse!

    """
    Mendapatkan data penggunaan per jam untuk tanggal tertentu
    
    @param meteranId - ID meteran
    @param tanggal - Tanggal dalam format YYYY-MM-DD
    @returns MonitoringHourlyResponse dengan breakdown per jam
    """
    monitoringHourly(
      meteranId: String!, 
      tanggal: String!
    ): MonitoringHourlyResponse!
  }
`;
//# sourceMappingURL=Monitoring.js.map