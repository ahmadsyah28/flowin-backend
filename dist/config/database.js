"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = require("dns");
const index_1 = require("./index");
(0, dns_1.setServers)(["8.8.8.8", "8.8.4.4"]);
const connectDB = async () => {
    if (mongoose_1.default.connection.readyState === 1)
        return;
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose_1.default.connect(index_1.config.mongoUri, {
            serverSelectionTimeoutMS: 20000,
        });
        console.log("✅ MongoDB Connected");
        console.log("📍 Host:", mongoose_1.default.connection.host);
        console.log("🗄️ DB:", mongoose_1.default.connection.name);
        mongoose_1.default.connection.on("error", (error) => {
            console.error("❌ MongoDB connection error:", error);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.warn("⚠️ MongoDB disconnected");
        });
        mongoose_1.default.connection.on("reconnected", () => {
            console.log("🔄 MongoDB reconnected");
        });
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failed");
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error("Unknown error occurred");
        }
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log("🔌 MongoDB Disconnected");
    }
    catch (error) {
        console.error("❌ Error disconnecting from MongoDB");
        if (error instanceof Error) {
            console.error(error.message);
        }
    }
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=database.js.map