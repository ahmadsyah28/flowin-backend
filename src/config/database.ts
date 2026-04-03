import mongoose from "mongoose";
import { setServers } from "dns";
import { config } from "./index";

// Force Node.js to use Google DNS
setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async (): Promise<void> => {
  // Reuse existing connection in serverless environments
  if (mongoose.connection.readyState === 1) return;

  try {
    console.log("🔄 Connecting to MongoDB...");

    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 20000,
    });

    console.log("✅ MongoDB Connected");
    console.log("📍 Host:", mongoose.connection.host);
    console.log("🗄️ DB:", mongoose.connection.name);

    // Event Listeners untuk monitoring koneksi
    mongoose.connection.on("error", (error: Error) => {
      console.error("❌ MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error occurred");
    }

    // Force exit karena database connection critical
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("🔌 MongoDB Disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB");
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};
