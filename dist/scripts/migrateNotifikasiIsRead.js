"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../config/database");
const Notifikasi_1 = require("../models/Notifikasi");
dotenv_1.default.config();
const migrateNotifikasiIsRead = async () => {
    try {
        await (0, database_1.connectDB)();
        console.log("🔗 Connected to MongoDB");
        const result = await Notifikasi_1.Notifikasi.updateMany({ isRead: { $exists: false } }, { $set: { isRead: false } });
        console.log(`✅ Updated ${result.modifiedCount} notifikasi with isRead: false`);
        const total = await Notifikasi_1.Notifikasi.countDocuments({});
        const unread = await Notifikasi_1.Notifikasi.countDocuments({ isRead: false });
        const read = await Notifikasi_1.Notifikasi.countDocuments({ isRead: true });
        console.log("\n📊 Statistics:");
        console.log(`Total: ${total}`);
        console.log(`Unread: ${unread}`);
        console.log(`Read: ${read}`);
    }
    catch (error) {
        console.error("❌ Migration error:", error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log("\n🔌 Database connection closed");
        process.exit(0);
    }
};
migrateNotifikasiIsRead();
//# sourceMappingURL=migrateNotifikasiIsRead.js.map