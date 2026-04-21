import mongoose from "mongoose";
import { Laporan } from "../models/Laporan";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Script untuk migrate status laporan dari "Ditunda" ke "Diajukan"
 * Jalankan: npx tsx src/scripts/migrateLaporanStatus.ts
 */

async function migrateLaporanStatus() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/flowin";
    await mongoose.connect(mongoUri);
    
    console.log("✅ Connected to MongoDB");
    console.log("🔍 Mencari laporan dengan status 'Ditunda'...\n");

    // Update semua laporan dengan status "Ditunda" menjadi "Diajukan"
    const result = await Laporan.updateMany(
      { Status: "Ditunda" },
      { $set: { Status: "Diajukan" } }
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Migration Completed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📊 Total dokumen yang ditemukan: ${result.matchedCount}`);
    console.log(`✏️  Total dokumen yang diupdate: ${result.modifiedCount}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Tampilkan beberapa contoh hasil
    const sampleUpdated = await Laporan.find({ Status: "Diajukan" })
      .limit(5)
      .select("NamaLaporan Status createdAt");

    if (sampleUpdated.length > 0) {
      console.log("📋 Sample data yang sudah diupdate:");
      sampleUpdated.forEach((laporan, idx) => {
        console.log(
          `${idx + 1}. ${laporan.NamaLaporan} - Status: ${laporan.Status}`
        );
      });
    }

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run migration
migrateLaporanStatus();
