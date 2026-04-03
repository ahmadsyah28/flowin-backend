// Export all models and their interfaces
export { Pengguna, IPengguna } from "./Pengguna";
export { KoneksiData, IKoneksiData } from "./KoneksiData";
export { Meter, IMeter } from "./Meter";
export { Tagihan, ITagihan } from "./Tagihan";
export { RiwayatPenggunaan, IRiwayatPenggunaan } from "./RiwayatPenggunaan";
export { Laporan, ILaporan, ILaporanModel } from "./Laporan";
export { GeoLokasi, IGeoLokasi } from "./GeoLokasi";
export { Notifikasi, INotifikasi } from "./Notifikasi";
export { Pembayaran, IPembayaran, EnumStatusPembayaran } from "./Pembayaran";
export {
  KelompokPelanggan,
  IKelompokPelanggan,
  KodeKelompok,
  KategoriKelompok,
  kelompokPelangganSeed,
} from "./KelompokPelanggan";
export { IBaseDocument } from "./BaseModel";

// Export all models as a collection for easy access
import { Pengguna } from "./Pengguna";
import { KoneksiData } from "./KoneksiData";
import { Meter } from "./Meter";
import { Tagihan } from "./Tagihan";
import { RiwayatPenggunaan } from "./RiwayatPenggunaan";
import { Laporan } from "./Laporan";
import { GeoLokasi } from "./GeoLokasi";
import { Notifikasi } from "./Notifikasi";
import { Pembayaran } from "./Pembayaran";
import { KelompokPelanggan } from "./KelompokPelanggan";

export const models = {
  Pengguna,
  KoneksiData,
  Meter,
  Tagihan,
  RiwayatPenggunaan,
  Laporan,
  GeoLokasi,
  Notifikasi,
  Pembayaran,
  KelompokPelanggan,
};

export default models;
