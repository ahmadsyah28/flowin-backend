import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import {
  IBaseDocument,
  baseSchemaFields,
  addBaseMiddleware,
} from "./BaseModel";

export interface IPengguna extends IBaseDocument {
  email: string;
  noHP: string;
  namaLengkap: string;
  password?: string;
  token?: string;
  isVerified: boolean;
  googleId?: string;
  profilePicture?: string;
  authProvider: "email" | "google";
  otp?: string;
  otpExpiry?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const penggunaSchema = new Schema<IPengguna>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  noHP: {
    type: String,
    required: false, // Tidak wajib untuk Google sign-in (bisa dilengkapi nanti)
    trim: true,
    default: "",
  },
  namaLengkap: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
  },
  token: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  googleId: {
    type: String,
    required: false,
    sparse: true,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  authProvider: {
    type: String,
    enum: ["email", "google"],
    default: "email",
  },
  otp: {
    type: String,
    required: false,
    default: null,
  },
  otpExpiry: {
    type: Date,
    required: false,
    default: null,
  },
  ...baseSchemaFields,
});

addBaseMiddleware(penggunaSchema);

// Hash password sebelum menyimpan
penggunaSchema.pre<IPengguna>("save", async function () {
  // Hanya hash password jika password modified/baru dan ada
  if (!this.isModified("password") || !this.password) {
    return;
  }

  try {
    // Hash password dengan salt rounds 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

// Method untuk compare password saat login
penggunaSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) {
    return false; // No password set (like Google login users)
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export const Pengguna = mongoose.model<IPengguna>("Pengguna", penggunaSchema);
