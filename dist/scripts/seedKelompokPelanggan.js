"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const dns_1 = require("dns");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
(0, dns_1.setServers)(["8.8.8.8", "8.8.4.4"]);
const mongoose_1 = __importDefault(require("mongoose"));
const KelompokPelanggan_1 = require("../models/KelompokPelanggan");
async function seedKelompokPelanggan() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error("❌ MONGODB_URI is not set in .env file");
            process.exit(1);
        }
        console.log("🔄 Connecting to MongoDB...");
        await mongoose_1.default.connect(mongoUri);
        console.log("✅ Connected to MongoDB");
        const existingCount = await KelompokPelanggan_1.KelompokPelanggan.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Found ${existingCount} existing records.`);
            console.log("   Clearing existing data...");
            await KelompokPelanggan_1.KelompokPelanggan.deleteMany({});
        }
        console.log("🔄 Inserting kelompok pelanggan data...");
        const result = await KelompokPelanggan_1.KelompokPelanggan.insertMany(KelompokPelanggan_1.kelompokPelangganSeed);
        console.log(`✅ Successfully inserted ${result.length} kelompok pelanggan:`);
        result.forEach((kelompok) => {
            console.log(`   - ${kelompok.KodeKelompok}: ${kelompok.NamaKelompok} ` +
                `(Tarif: Rp${kelompok.TarifRendah.toLocaleString("id-ID")} / ` +
                `Rp${kelompok.TarifTinggi.toLocaleString("id-ID")}, ` +
                `Beban: Rp${kelompok.BiayaBeban.toLocaleString("id-ID")})`);
        });
        console.log("\n📊 Summary by category:");
        const categories = await KelompokPelanggan_1.KelompokPelanggan.aggregate([
            { $group: { _id: "$Kategori", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        categories.forEach((cat) => {
            console.log(`   - ${cat._id}: ${cat.count} kelompok`);
        });
    }
    catch (error) {
        console.error("❌ Error seeding kelompok pelanggan:", error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
        process.exit(0);
    }
}
seedKelompokPelanggan();
//# sourceMappingURL=seedKelompokPelanggan.js.map