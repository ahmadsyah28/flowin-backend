"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../config/database");
const Pengguna_1 = require("../models/Pengguna");
dotenv_1.default.config();
const seedPengguna = async () => {
    try {
        await (0, database_1.connectDB)();
        console.log("🔗 Connected to MongoDB for seeding");
        const penggunaData = [
            {
                email: "admin@flowin.com",
                noHP: "081234567890",
                namaLengkap: "Admin Flowin",
                password: "admin123456",
                isVerified: true,
            },
            {
                email: "pelanggan1@gmail.com",
                noHP: "081234567891",
                namaLengkap: "Budi Santoso",
                password: "pelanggan123",
                isVerified: true,
            },
            {
                email: "pelanggan2@gmail.com",
                noHP: "081234567892",
                namaLengkap: "Siti Nurhaliza",
                password: "pelanggan123",
                isVerified: true,
            },
            {
                email: "pelanggan3@gmail.com",
                noHP: "081234567893",
                namaLengkap: "Andi Wijaya",
                password: "pelanggan123",
                isVerified: false,
            },
            {
                email: "testuser@example.com",
                noHP: "081234567894",
                namaLengkap: "Test User",
                password: "testpassword",
                isVerified: false,
            },
        ];
        console.log("🌱 Starting to seed Pengguna data...");
        for (const userData of penggunaData) {
            try {
                const existingUser = await Pengguna_1.Pengguna.findOne({ email: userData.email });
                if (existingUser) {
                    console.log(`⚠️ User ${userData.email} already exists, skipping...`);
                }
                else {
                    const newUser = await Pengguna_1.Pengguna.create(userData);
                    console.log(`✅ Created user: ${userData.email} - ${userData.namaLengkap} ${userData.isVerified ? "(Verified)" : "(Unverified)"}`);
                }
            }
            catch (userError) {
                console.error(`❌ Failed to create user ${userData.email}:`, userError.message);
            }
        }
        console.log("\n🎉 Seed completed!");
        console.log("\n📋 Test Accounts Created:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("| Email                  | Password     | Nama Lengkap      | Status     |");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("| admin@flowin.com       | admin123456  | Admin Flowin      | Verified   |");
        console.log("| pelanggan1@gmail.com   | pelanggan123 | Budi Santoso      | Verified   |");
        console.log("| pelanggan2@gmail.com   | pelanggan123 | Siti Nurhaliza    | Verified   |");
        console.log("| pelanggan3@gmail.com   | pelanggan123 | Andi Wijaya       | Unverified |");
        console.log("| testuser@example.com   | testpassword | Test User         | Unverified |");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        const totalUsers = await Pengguna_1.Pengguna.countDocuments();
        console.log(`\n📊 Total users in database: ${totalUsers}`);
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
seedPengguna();
//# sourceMappingURL=seedPengguna.js.map