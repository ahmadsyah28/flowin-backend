"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../config/database");
const Laporan_1 = require("../models/Laporan");
const GeoLokasi_1 = require("../models/GeoLokasi");
const Pengguna_1 = require("../models/Pengguna");
const enums_1 = require("../enums");
dotenv_1.default.config();
const seedLaporan = async () => {
    try {
        await (0, database_1.connectDB)();
        console.log("🔗 Connected to MongoDB for seeding laporan");
        const users = await Pengguna_1.Pengguna.find({}, "_id namaLengkap email");
        if (users.length === 0) {
            console.log("❌ No users found. Please run seed:pengguna first!");
            process.exit(1);
        }
        console.log(`📋 Found ${users.length} users to create laporan for`);
        const laporanData = [
            {
                IdPengguna: users[0]._id,
                NamaLaporan: "Air Tidak Mengalir di Jalan Merdeka",
                Masalah: "Air PDAM tidak mengalir sama sekali sejak kemarin pagi. Sudah dicoba tutup buka kran tetap tidak ada air yang keluar.",
                Alamat: "Jl. Merdeka No. 15, RT 02/RW 01, Kelurahan Sukamaju",
                ImageURL: [
                    "https://example.com/images/laporan1_1.jpg",
                    "https://example.com/images/laporan1_2.jpg",
                ],
                JenisLaporan: enums_1.EnumJenisLaporan.AIR_TIDAK_MENGALIR,
                Catatan: "Sudah menghubungi tetangga, mereka juga mengalami masalah yang sama",
                Status: enums_1.EnumWorkStatusPelanggan.DIAJUKAN,
                coordinates: { lat: -6.2088, lng: 106.8456 },
            },
            {
                IdPengguna: users[1]._id,
                NamaLaporan: "Air Keruh dan Berbau",
                Masalah: "Air yang keluar dari kran berwarna keruh kecoklatan dan berbau seperti tanah. Tidak layak untuk digunakan.",
                Alamat: "Jl. Sudirman No. 88, RT 05/RW 03, Kelurahan Makmur",
                ImageURL: ["https://example.com/images/laporan2_1.jpg"],
                JenisLaporan: enums_1.EnumJenisLaporan.AIR_KERUH,
                Catatan: "Air keruh mulai terlihat sejak 3 hari yang lalu",
                Status: enums_1.EnumWorkStatusPelanggan.DITINJAU_ADMIN,
                coordinates: { lat: -6.2148, lng: 106.8451 },
            },
            {
                IdPengguna: users[1]._id,
                NamaLaporan: "Kebocoran Pipa di Depan Rumah",
                Masalah: "Ada kebocoran pipa air PDAM di bawah jalan tepat di depan rumah. Air terus menerus mengalir dan menggenangi jalan.",
                Alamat: "Jl. Sudirman No. 88, RT 05/RW 03, Kelurahan Makmur",
                ImageURL: [
                    "https://example.com/images/laporan3_1.jpg",
                    "https://example.com/images/laporan3_2.jpg",
                    "https://example.com/images/laporan3_3.jpg",
                ],
                JenisLaporan: enums_1.EnumJenisLaporan.KEBOCORAN_PIPA,
                Catatan: "Kebocoran menyebabkan jalan becek dan sulit dilalui kendaraan",
                Status: enums_1.EnumWorkStatusPelanggan.SEDANG_DIKERJAKAN,
                coordinates: { lat: -6.215, lng: 106.8449 },
            },
            {
                IdPengguna: users[2]._id,
                NamaLaporan: "Meteran Air Tidak Berfungsi",
                Masalah: "Meteran air PDAM tidak berputar sama sekali meskipun air mengalir. Khawatir tagihan tidak sesuai pemakaian.",
                Alamat: "Jl. Gatot Subroto No. 45, RT 01/RW 02, Kelurahan Sejahtera",
                ImageURL: ["https://example.com/images/laporan4_1.jpg"],
                JenisLaporan: enums_1.EnumJenisLaporan.METERAN_BERMASALAH,
                Catatan: "Meteran sudah tidak bergerak sejak 2 minggu terakhir",
                Status: enums_1.EnumWorkStatusPelanggan.DITUGASKAN,
                coordinates: { lat: -6.2297, lng: 106.823 },
            },
            {
                IdPengguna: users[3]._id,
                NamaLaporan: "Tekanan Air Sangat Lemah",
                Masalah: "Tekanan air PDAM sangat lemah, hanya menetes dari kran. Sulit untuk mandi dan mencuci.",
                Alamat: "Jl. Ahmad Yani No. 77, RT 03/RW 01, Kelurahan Bahagia",
                ImageURL: [],
                JenisLaporan: enums_1.EnumJenisLaporan.KENDALA_LAINNYA,
                Catatan: "Tekanan air lemah terutama di pagi dan sore hari",
                Status: enums_1.EnumWorkStatusPelanggan.SELESAI,
                coordinates: { lat: -6.1783, lng: 106.828 },
            },
            {
                IdPengguna: users[4]._id,
                NamaLaporan: "Air Berbau Klorin Sangat Menyengat",
                Masalah: "Air PDAM berbau klorin sangat kuat, tidak bisa digunakan untuk memasak dan minum.",
                Alamat: "Jl. Diponegoro No. 123, RT 04/RW 02, Kelurahan Sentosa",
                ImageURL: ["https://example.com/images/laporan6_1.jpg"],
                JenisLaporan: enums_1.EnumJenisLaporan.KENDALA_LAINNYA,
                Catatan: "Bau klorin sangat menyengat mulai minggu lalu",
                Status: enums_1.EnumWorkStatusPelanggan.DIBATALKAN,
                coordinates: { lat: -6.1951, lng: 106.8313 },
            },
        ];
        console.log("🌱 Starting to seed Laporan data...");
        let createdCount = 0;
        let skippedCount = 0;
        for (const data of laporanData) {
            try {
                const geoLokasi = await GeoLokasi_1.GeoLokasi.create({
                    IdLaporan: new mongoose_1.default.Types.ObjectId(),
                    Latitude: data.coordinates.lat,
                    Longitude: data.coordinates.lng,
                });
                const existingLaporan = await Laporan_1.Laporan.findOne({
                    IdPengguna: data.IdPengguna,
                    NamaLaporan: data.NamaLaporan,
                });
                if (existingLaporan) {
                    console.log(`⚠️ Laporan "${data.NamaLaporan}" already exists, skipping...`);
                    await GeoLokasi_1.GeoLokasi.findByIdAndDelete(geoLokasi._id);
                    skippedCount++;
                    continue;
                }
                const laporan = await Laporan_1.Laporan.create({
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
                await GeoLokasi_1.GeoLokasi.findByIdAndUpdate(geoLokasi._id, {
                    IdLaporan: laporan._id,
                });
                const user = users.find((u) => u._id.equals(data.IdPengguna));
                console.log(`✅ Created laporan: "${data.NamaLaporan}" by ${user?.namaLengkap} (${data.Status})`);
                createdCount++;
            }
            catch (error) {
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
        console.log("| Air Tidak Mengalir       | Diajukan            | Admin Flowin        |");
        console.log("| Air Keruh                | Ditinjau Admin      | Budi Santoso        |");
        console.log("| Kebocoran Pipa           | Sedang Dikerjakan   | Budi Santoso        |");
        console.log("| Meteran Bermasalah       | Ditugaskan          | Siti Nurhaliza      |");
        console.log("| Tekanan Lemah            | Selesai             | Andi Wijaya         |");
        console.log("| Bau Klorin               | Dibatalkan          | Test User           |");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        const totalLaporan = await Laporan_1.Laporan.countDocuments();
        const totalGeoLokasi = await GeoLokasi_1.GeoLokasi.countDocuments();
        console.log(`\n📊 Total in database:`);
        console.log(`   - Laporan: ${totalLaporan}`);
        console.log(`   - GeoLokasi: ${totalGeoLokasi}`);
    }
    catch (error) {
        console.error("❌ Seed error:", error.message);
        console.error("Stack trace:", error.stack);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🔌 Disconnected from MongoDB");
        process.exit(0);
    }
};
seedLaporan();
//# sourceMappingURL=seedLaporan.js.map