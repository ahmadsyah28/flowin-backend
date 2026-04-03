import jwt, { SignOptions } from "jsonwebtoken";
import { IPengguna } from "@/models/Pengguna";
import { config } from "@/config";
import { authenticationError } from "./errors";

export interface JWTPayload {
  id: string;
  email: string;
  isVerified: boolean;
}

export const generateToken = (pengguna: IPengguna): string => {
  const payload: JWTPayload = {
    id: pengguna._id.toString(),
    email: pengguna.email,
    isVerified: pengguna.isVerified,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (err) {
    throw authenticationError("Token tidak valid atau sudah kedaluwarsa");
  }
};

export const generateVerificationToken = (): string => {
  const options: SignOptions = {
    expiresIn: "24h",
  };
  return jwt.sign(
    { purpose: "email_verification" },
    config.jwt.secret,
    options,
  );
};

// Verify email verification token
export const verifyEmailToken = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    return decoded.purpose === "email_verification";
  } catch (error) {
    return false;
  }
};
