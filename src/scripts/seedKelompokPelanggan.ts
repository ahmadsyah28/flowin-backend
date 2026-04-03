import dotenv from "dotenv";
import path from "path";
import { setServers } from "dns";

// Load .env from backend root BEFORE importing config
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Force Google DNS untuk resolve MongoDB SRV records
setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import {
  KelompokPelanggan,
  kelompokPelangganSeed,
} from "../models/KelompokPelanggan";

/**
 * Seed script untuk populate data Kelompok Pelanggan PDAM
 *
 * Run dengan: npx ts-node src/scripts/seedKelompokPelanggan.ts
 */
async function seedKelompokPelanggan() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI is not set in .env file");
      process.exit(1);
    }

    // Connect to database
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if data already exists
    const existingCount = await KelompokPelanggan.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing records.`);
      console.log("   Clearing existing data...");
      await KelompokPelanggan.deleteMany({});
    }

    // Insert seed data
    console.log("🔄 Inserting kelompok pelanggan data...");
    const result = await KelompokPelanggan.insertMany(kelompokPelangganSeed);

    console.log(
      `✅ Successfully inserted ${result.length} kelompok pelanggan:`,
    );
    result.forEach((kelompok) => {
      console.log(
        `   - ${kelompok.KodeKelompok}: ${kelompok.NamaKelompok} ` +
          `(Tarif: Rp${kelompok.TarifRendah.toLocaleString("id-ID")} / ` +
          `Rp${kelompok.TarifTinggi.toLocaleString("id-ID")}, ` +
          `Beban: Rp${kelompok.BiayaBeban.toLocaleString("id-ID")})`,
      );
    });

    console.log("\n📊 Summary by category:");
    const categories = await KelompokPelanggan.aggregate([
      { $group: { _id: "$Kategori", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    categories.forEach((cat) => {
      console.log(`   - ${cat._id}: ${cat.count} kelompok`);
    });
  } catch (error) {
    console.error("❌ Error seeding kelompok pelanggan:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seedKelompokPelanggan();
