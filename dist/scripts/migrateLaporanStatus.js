"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Laporan_1 = require("../models/Laporan");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
async function migrateLaporanStatus() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/flowin";
        await mongoose_1.default.connect(mongoUri);
        console.log("✅ Connected to MongoDB");
        console.log("🔍 Mencari laporan dengan status 'Ditunda'...\n");
        const result = await Laporan_1.Laporan.updateMany({ Status: "Ditunda" }, { $set: { Status: "Diajukan" } });
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ Migration Completed!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`📊 Total dokumen yang ditemukan: ${result.matchedCount}`);
        console.log(`✏️  Total dokumen yang diupdate: ${result.modifiedCount}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        const sampleUpdated = await Laporan_1.Laporan.find({ Status: "Diajukan" })
            .limit(5)
            .select("NamaLaporan Status createdAt");
        if (sampleUpdated.length > 0) {
            console.log("📋 Sample data yang sudah diupdate:");
            sampleUpdated.forEach((laporan, idx) => {
                console.log(`${idx + 1}. ${laporan.NamaLaporan} - Status: ${laporan.Status}`);
            });
        }
        await mongoose_1.default.disconnect();
        console.log("\n✅ Disconnected from MongoDB");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during migration:", error);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
}
migrateLaporanStatus();
//# sourceMappingURL=migrateLaporanStatus.js.map