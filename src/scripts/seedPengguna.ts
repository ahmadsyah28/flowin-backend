import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/database";
import { Pengguna } from "../models/Pengguna";

// Load environment variables
dotenv.config();

const seedPengguna = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("🔗 Connected to MongoDB for seeding");

    // Sample users data
    const penggunaData = [
      {
        email: "admin@flowin.com",
        noHP: "081234567890",
        namaLengkap: "Admin Flowin",
        password: "admin123456", // Will be hashed by model middleware
        isVerified: true,
      },
      {
        email: "pelanggan1@gmail.com",
        noHP: "081234567891",
        namaLengkap: "Budi Santoso",
        password: "pelanggan123", // Will be hashed by model middleware
        isVerified: true,
      },
      {
        email: "pelanggan2@gmail.com",
        noHP: "081234567892",
        namaLengkap: "Siti Nurhaliza",
        password: "pelanggan123", // Will be hashed by model middleware
        isVerified: true,
      },
      {
        email: "pelanggan3@gmail.com",
        noHP: "081234567893",
        namaLengkap: "Andi Wijaya",
        password: "pelanggan123", // Will be hashed by model middleware
        isVerified: false, // Belum verifikasi email
      },
      {
        email: "testuser@example.com",
        noHP: "081234567894",
        namaLengkap: "Test User",
        password: "testpassword", // Will be hashed by model middleware
        isVerified: false,
      },
    ];

    console.log("🌱 Starting to seed Pengguna data...");

    // Seed each user
    for (const userData of penggunaData) {
      try {
        // Check if user already exists
        const existingUser = await Pengguna.findOne({ email: userData.email });

        if (existingUser) {
          console.log(`⚠️ User ${userData.email} already exists, skipping...`);
        } else {
          const newUser = await Pengguna.create(userData);
          console.log(
            `✅ Created user: ${userData.email} - ${userData.namaLengkap} ${userData.isVerified ? "(Verified)" : "(Unverified)"}`,
          );
        }
      } catch (userError: any) {
        console.error(
          `❌ Failed to create user ${userData.email}:`,
          userError.message,
        );
      }
    }

    console.log("\n🎉 Seed completed!");
    console.log("\n📋 Test Accounts Created:");
    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    );
    console.log(
      "| Email                  | Password     | Nama Lengkap      | Status     |",
    );
    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    );
    console.log(
      "| admin@flowin.com       | admin123456  | Admin Flowin      | Verified   |",
    );
    console.log(
      "| pelanggan1@gmail.com   | pelanggan123 | Budi Santoso      | Verified   |",
    );
    console.log(
      "| pelanggan2@gmail.com   | pelanggan123 | Siti Nurhaliza    | Verified   |",
    );
    console.log(
      "| pelanggan3@gmail.com   | pelanggan123 | Andi Wijaya       | Unverified |",
    );
    console.log(
      "| testuser@example.com   | testpassword | Test User         | Unverified |",
    );
    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    );

    // Show total count
    const totalUsers = await Pengguna.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);
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
seedPengguna();
