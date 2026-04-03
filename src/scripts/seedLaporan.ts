import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/database";
import { Laporan } from "../models/Laporan";
import { GeoLokasi } from "../models/GeoLokasi";
import { Pengguna } from "../models/Pengguna";
import { EnumJenisLaporan, EnumWorkStatusPelanggan } from "../enums";

// Load environment variables
dotenv.config();

const seedLaporan = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("🔗 Connected to MongoDB for seeding laporan");

    // Get existing users for reference
    const users = await Pengguna.find({}, '_id namaLengkap email');
    if (users.length === 0) {
      console.log("❌ No users found. Please run seed:pengguna first!");
      process.exit(1);
    }

    console.log(`📋 Found ${users.length} users to create laporan for`);

    // Sample laporan data
    const laporanData = [
      {
        IdPengguna: users[0]._id, // admin@flowin.com
        NamaLaporan: "Air Tidak Mengalir di Jalan Merdeka",
        Masalah: "Air PDAM tidak mengalir sama sekali sejak kemarin pagi. Sudah dicoba tutup buka kran tetap tidak ada air yang keluar.",
        Alamat: "Jl. Merdeka No. 15, RT 02/RW 01, Kelurahan Sukamaju",
        ImageURL: [
          "https://example.com/images/laporan1_1.jpg",
          "https://example.com/images/laporan1_2.jpg"
        ],
        JenisLaporan: EnumJenisLaporan.AIR_TIDAK_MENGALIR,
        Catatan: "Sudah menghubungi tetangga, mereka juga mengalami masalah yang sama",
        Status: EnumWorkStatusPelanggan.DITUNDA,
        coordinates: { lat: -6.2088, lng: 106.8456 } // Jakarta
      },
      {
        IdPengguna: users[1]._id, // pelanggan1@gmail.com
        NamaLaporan: "Air Keruh dan Berbau",
        Masalah: "Air yang keluar dari kran berwarna keruh kecoklatan dan berbau seperti tanah. Tidak layak untuk digunakan.",
        Alamat: "Jl. Sudirman No. 88, RT 05/RW 03, Kelurahan Makmur",
        ImageURL: [
          "https://example.com/images/laporan2_1.jpg"
        ],
        JenisLaporan: EnumJenisLaporan.AIR_KERUH,
        Catatan: "Air keruh mulai terlihat sejak 3 hari yang lalu",
        Status: EnumWorkStatusPelanggan.DITINJAU_ADMIN,
        coordinates: { lat: -6.2148, lng: 106.8451 }
      },
      {
        IdPengguna: users[1]._id, // pelanggan1@gmail.com (laporan kedua)
        NamaLaporan: "Kebocoran Pipa di Depan Rumah",
        Masalah: "Ada kebocoran pipa air PDAM di bawah jalan tepat di depan rumah. Air terus menerus mengalir dan menggenangi jalan.",
        Alamat: "Jl. Sudirman No. 88, RT 05/RW 03, Kelurahan Makmur",
        ImageURL: [
          "https://example.com/images/laporan3_1.jpg",
          "https://example.com/images/laporan3_2.jpg",
          "https://example.com/images/laporan3_3.jpg"
        ],
        JenisLaporan: EnumJenisLaporan.KEBOCORAN_PIPA,
        Catatan: "Kebocoran menyebabkan jalan becek dan sulit dilalui kendaraan",
        Status: EnumWorkStatusPelanggan.SEDANG_DIKERJAKAN,
        coordinates: { lat: -6.2150, lng: 106.8449 }
      },
      {
        IdPengguna: users[2]._id, // pelanggan2@gmail.com
        NamaLaporan: "Meteran Air Tidak Berfungsi",
        Masalah: "Meteran air PDAM tidak berputar sama sekali meskipun air mengalir. Khawatir tagihan tidak sesuai pemakaian.",
        Alamat: "Jl. Gatot Subroto No. 45, RT 01/RW 02, Kelurahan Sejahtera",
        ImageURL: [
          "https://example.com/images/laporan4_1.jpg"
        ],
        JenisLaporan: EnumJenisLaporan.METERAN_BERMASALAH,
        Catatan: "Meteran sudah tidak bergerak sejak 2 minggu terakhir",
        Status: EnumWorkStatusPelanggan.DITUGASKAN,
        coordinates: { lat: -6.2297, lng: 106.8230 }
      },
      {
        IdPengguna: users[3]._id, // pelanggan3@gmail.com
        NamaLaporan: "Tekanan Air Sangat Lemah",
        Masalah: "Tekanan air PDAM sangat lemah, hanya menetes dari kran. Sulit untuk mandi dan mencuci.",
        Alamat: "Jl. Ahmad Yani No. 77, RT 03/RW 01, Kelurahan Bahagia",
        ImageURL: [],
        JenisLaporan: EnumJenisLaporan.KENDALA_LAINNYA,
        Catatan: "Tekanan air lemah terutama di pagi dan sore hari",
        Status: EnumWorkStatusPelanggan.SELESAI,
        coordinates: { lat: -6.1783, lng: 106.8280 }
      },
      {
        IdPengguna: users[4]._id, // testuser@example.com
        NamaLaporan: "Air Berbau Klorin Sangat Menyengat",
        Masalah: "Air PDAM berbau klorin sangat kuat, tidak bisa digunakan untuk memasak dan minum.",
        Alamat: "Jl. Diponegoro No. 123, RT 04/RW 02, Kelurahan Sentosa",
        ImageURL: [
          "https://example.com/images/laporan6_1.jpg"
        ],
        JenisLaporan: EnumJenisLaporan.KENDALA_LAINNYA,
        Catatan: "Bau klorin sangat menyengat mulai minggu lalu",
        Status: EnumWorkStatusPelanggan.DIBATALKAN,
        coordinates: { lat: -6.1951, lng: 106.8313 }
      }
    ];

    console.log("🌱 Starting to seed Laporan data...");

    let createdCount = 0;
    let skippedCount = 0;

    for (const data of laporanData) {
      try {
        // First create GeoLokasi
        const geoLokasi = await GeoLokasi.create({
          IdLaporan: new mongoose.Types.ObjectId(), // Temporary ID, will be updated
          Latitude: data.coordinates.lat,
          Longitude: data.coordinates.lng,
        });

        // Check if laporan already exists
        const existingLaporan = await Laporan.findOne({
          IdPengguna: data.IdPengguna,
          NamaLaporan: data.NamaLaporan
        });

        if (existingLaporan) {
          console.log(`⚠️ Laporan "${data.NamaLaporan}" already exists, skipping...`);
          await GeoLokasi.findByIdAndDelete(geoLokasi._id); // cleanup
          skippedCount++;
          continue;
        }

        // Create laporan
        const laporan = await Laporan.create({
          IdPengguna: data.IdPengguna,
          NamaLaporan: data.NamaLaporan,
          Masalah: data.Masalah,
          Alamat: data.Alamat,
          ImageURL: data.ImageURL,
          JenisLaporan: data.JenisLaporan,
          Catatan: data.Catatan,
          Koordinat: geoLokasi._id,
          Status: data.Status,
        });

        // Update GeoLokasi with correct IdLaporan
        await GeoLokasi.findByIdAndUpdate(geoLokasi._id, {
          IdLaporan: laporan._id
        });

        const user = users.find(u => u._id.equals(data.IdPengguna));
        console.log(`✅ Created laporan: "${data.NamaLaporan}" by ${user?.namaLengkap} (${data.Status})`);
        createdCount++;

      } catch (error: any) {
        console.error(`❌ Failed to create laporan "${data.NamaLaporan}":`, error.message);
      }
    }

    console.log("\n🎉 Seed completed!");
    console.log(`✅ Created: ${createdCount} laporan`);
    console.log(`⚠️ Skipped: ${skippedCount} laporan`);

    console.log("\n📋 Summary of Laporan Created:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("| Jenis Laporan            | Status              | User                |");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("| Air Tidak Mengalir       | Ditunda             | Admin Flowin        |");
    console.log("| Air Keruh                | Ditinjau Admin      | Budi Santoso        |");
    console.log("| Kebocoran Pipa           | Sedang Dikerjakan   | Budi Santoso        |");
    console.log("| Meteran Bermasalah       | Ditugaskan          | Siti Nurhaliza      |");
    console.log("| Tekanan Lemah            | Selesai             | Andi Wijaya         |");
    console.log("| Bau Klorin               | Dibatalkan          | Test User           |");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Show total counts
    const totalLaporan = await Laporan.countDocuments();
    const totalGeoLokasi = await GeoLokasi.countDocuments();
    console.log(`\n📊 Total in database:`);
    console.log(`   - Laporan: ${totalLaporan}`);
    console.log(`   - GeoLokasi: ${totalGeoLokasi}`);

  } catch (error: any) {
    console.error("❌ Seed error:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the seeder
seedLaporan();