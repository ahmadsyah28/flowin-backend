import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/database";
import { Notifikasi } from "../models/Notifikasi";

dotenv.config();

const migrateNotifikasiIsRead = async () => {
  try {
    await connectDB();
    console.log("🔗 Connected to MongoDB");

    // Update semua notifikasi yang belum punya field isRead
    const result = await Notifikasi.updateMany(
      { isRead: { $exists: false } },
      { $set: { isRead: false } }
    );

    console.log(`✅ Updated ${result.modifiedCount} notifikasi with isRead: false`);
    
    // Count total
    const total = await Notifikasi.countDocuments({});
    const unread = await Notifikasi.countDocuments({ isRead: false });
    const read = await Notifikasi.countDocuments({ isRead: true });

    console.log("\n📊 Statistics:");
    console.log(`Total: ${total}`);
    console.log(`Unread: ${unread}`);
    console.log(`Read: ${read}`);

  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

migrateNotifikasiIsRead();
