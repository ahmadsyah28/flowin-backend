"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenggunaService = void 0;
const Pengguna_1 = require("../models/Pengguna");
const auth_1 = require("../utils/auth");
const EmailService_1 = require("../services/EmailService");
const googleAuth_1 = require("../utils/googleAuth");
const sanitizeUserResponse = (user) => {
    const userResponse = user.toObject();
    userResponse.password = undefined;
    userResponse.token = undefined;
    userResponse.otp = undefined;
    userResponse.otpExpiry = undefined;
    return userResponse;
};
const isValidEmail = (email) => {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
};
class PenggunaService {
    static async register(input) {
        try {
            if (!isValidEmail(input.email)) {
                return {
                    success: false,
                    message: "Format email tidak valid",
                    token: null,
                    user: null,
                };
            }
            if (!input.password || input.password.length < 6) {
                return {
                    success: false,
                    message: "Password minimal 6 karakter",
                    token: null,
                    user: null,
                };
            }
            const existingUser = await Pengguna_1.Pengguna.findOne({ email: input.email });
            if (existingUser) {
                if (!existingUser.isVerified) {
                    const otp = (0, EmailService_1.generateOTP)();
                    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
                    existingUser.otp = otp;
                    existingUser.otpExpiry = otpExpiry;
                    existingUser.namaLengkap = input.namaLengkap;
                    existingUser.noHP = input.noHP;
                    existingUser.password = input.password;
                    await existingUser.save();
                    await (0, EmailService_1.sendOTPEmail)(input.email, otp, input.namaLengkap);
                    return {
                        success: true,
                        message: "Kode OTP telah dikirim ke email Anda. Silakan cek email untuk verifikasi.",
                        token: null,
                        user: null,
                    };
                }
                return {
                    success: false,
                    message: "Email sudah terdaftar",
                    token: null,
                    user: null,
                };
            }
            const otp = (0, EmailService_1.generateOTP)();
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            await Pengguna_1.Pengguna.create({
                email: input.email,
                noHP: input.noHP,
                namaLengkap: input.namaLengkap,
                password: input.password,
                isVerified: false,
                authProvider: "email",
                otp,
                otpExpiry,
            });
            await (0, EmailService_1.sendOTPEmail)(input.email, otp, input.namaLengkap);
            return {
                success: true,
                message: "Kode OTP telah dikirim ke email Anda. Silakan cek email untuk verifikasi.",
                token: null,
                user: null,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Terjadi kesalahan saat registrasi",
                token: null,
                user: null,
            };
        }
    }
    static async verifyOTP(input) {
        try {
            const user = await Pengguna_1.Pengguna.findOne({ email: input.email });
            if (!user) {
                return {
                    success: false,
                    message: "Email tidak ditemukan",
                    token: null,
                    user: null,
                };
            }
            if (user.isVerified) {
                return {
                    success: false,
                    message: "Akun sudah terverifikasi. Silakan login.",
                    token: null,
                    user: null,
                };
            }
            if (!user.otp || user.otp !== input.otp) {
                return {
                    success: false,
                    message: "Kode OTP tidak valid",
                    token: null,
                    user: null,
                };
            }
            if (!user.otpExpiry || new Date() > user.otpExpiry) {
                return {
                    success: false,
                    message: "Kode OTP telah kadaluarsa",
                    token: null,
                    user: null,
                };
            }
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();
            const token = (0, auth_1.generateToken)(user);
            const userResponse = sanitizeUserResponse(user);
            return {
                success: true,
                message: "Verifikasi berhasil. Akun Anda telah aktif.",
                token,
                user: userResponse,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Terjadi kesalahan saat verifikasi OTP",
                token: null,
                user: null,
            };
        }
    }
    static async resendOTP(input) {
        try {
            const user = await Pengguna_1.Pengguna.findOne({ email: input.email });
            if (!user) {
                return {
                    success: false,
                    message: "Email tidak ditemukan",
                    data: null,
                };
            }
            if (user.isVerified) {
                return {
                    success: false,
                    message: "Akun sudah terverifikasi",
                    data: null,
                };
            }
            const otp = (0, EmailService_1.generateOTP)();
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
            await (0, EmailService_1.sendOTPEmail)(user.email, otp, user.namaLengkap);
            return {
                success: true,
                message: "Kode OTP baru telah dikirim ke email Anda",
                data: null,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mengirim ulang kode OTP",
                data: null,
            };
        }
    }
    static async login(input) {
        try {
            if (!isValidEmail(input.email)) {
                return {
                    success: false,
                    message: "Format email tidak valid",
                    token: null,
                    user: null,
                };
            }
            if (!input.password) {
                return {
                    success: false,
                    message: "Password tidak boleh kosong",
                    token: null,
                    user: null,
                };
            }
            const user = await Pengguna_1.Pengguna.findOne({ email: input.email });
            if (!user) {
                return {
                    success: false,
                    message: "Email belum terdaftar, silakan lakukan pendaftaran terlebih dahulu.",
                    token: null,
                    user: null,
                };
            }
            if (!user.isVerified) {
                return {
                    success: false,
                    message: "Akun belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
                    token: null,
                    user: null,
                };
            }
            const isPasswordValid = await user.comparePassword(input.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: "Email atau password salah",
                    token: null,
                    user: null,
                };
            }
            const token = (0, auth_1.generateToken)(user);
            const userResponse = sanitizeUserResponse(user);
            return {
                success: true,
                message: "Login berhasil",
                token,
                user: userResponse,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Terjadi kesalahan saat login",
                token: null,
                user: null,
            };
        }
    }
    static async googleLogin(input) {
        try {
            const googleUser = await (0, googleAuth_1.verifyGoogleToken)(input.idToken);
            if (!googleUser.email) {
                return {
                    success: false,
                    message: "Tidak dapat mengambil email dari akun Google",
                    token: null,
                    user: null,
                };
            }
            const user = await Pengguna_1.Pengguna.findOne({
                email: googleUser.email.toLowerCase(),
            });
            if (!user) {
                return {
                    success: false,
                    message: "Email belum terdaftar, silakan lakukan pendaftaran terlebih dahulu.",
                    token: null,
                    user: null,
                };
            }
            if (!user.isVerified) {
                return {
                    success: false,
                    message: "Akun belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
                    token: null,
                    user: null,
                };
            }
            if (!user.googleId) {
                user.googleId = googleUser.sub;
            }
            if (googleUser.picture && !user.profilePicture) {
                user.profilePicture = googleUser.picture;
            }
            await user.save();
            const token = (0, auth_1.generateToken)(user);
            const userResponse = sanitizeUserResponse(user);
            return {
                success: true,
                message: "Login berhasil",
                token,
                user: userResponse,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Terjadi kesalahan saat login dengan Google",
                token: null,
                user: null,
            };
        }
    }
    static async logout(userId) {
        await Pengguna_1.Pengguna.findByIdAndUpdate(userId, { token: null });
        return {
            success: true,
            message: "Logout berhasil",
            data: null,
        };
    }
    static async updateProfile(userId, input) {
        try {
            const updatedUser = await Pengguna_1.Pengguna.findByIdAndUpdate(userId, { ...input }, { new: true, select: "-password -token -otp -otpExpiry" });
            return {
                success: true,
                message: "Profile berhasil diupdate",
                data: updatedUser,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal update profile",
                data: null,
            };
        }
    }
    static async updatePassword(user, input) {
        try {
            if (input.currentPassword) {
                const isCurrentPasswordValid = await user.comparePassword(input.currentPassword);
                if (!isCurrentPasswordValid) {
                    return {
                        success: false,
                        message: "Password lama tidak sesuai",
                        data: null,
                    };
                }
            }
            if (input.newPassword.length < 6) {
                return {
                    success: false,
                    message: "Password baru minimal 6 karakter",
                    data: null,
                };
            }
            user.password = input.newPassword;
            await user.save();
            return {
                success: true,
                message: "Password berhasil diubah",
                data: null,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mengubah password",
                data: null,
            };
        }
    }
    static async forgotPassword(input) {
        try {
            if (!isValidEmail(input.email)) {
                return {
                    success: false,
                    message: "Format email tidak valid",
                    data: null,
                };
            }
            const user = await Pengguna_1.Pengguna.findOne({ email: input.email });
            if (!user) {
                return {
                    success: false,
                    message: "Email belum terdaftar, silakan lakukan pendaftaran terlebih dahulu.",
                    data: null,
                };
            }
            if (!user.isVerified) {
                return {
                    success: false,
                    message: "Akun belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
                    data: null,
                };
            }
            const otp = (0, EmailService_1.generateOTP)();
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
            await (0, EmailService_1.sendOTPEmail)(user.email, otp, user.namaLengkap);
            return {
                success: true,
                message: "Kode OTP telah dikirim ke email Anda untuk reset password.",
                data: null,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mengirim kode OTP",
                data: null,
            };
        }
    }
    static async resetPassword(input) {
        try {
            if (!isValidEmail(input.email)) {
                return {
                    success: false,
                    message: "Format email tidak valid",
                    data: null,
                };
            }
            if (!input.newPassword || input.newPassword.length < 6) {
                return {
                    success: false,
                    message: "Password baru minimal 6 karakter",
                    data: null,
                };
            }
            const user = await Pengguna_1.Pengguna.findOne({ email: input.email });
            if (!user) {
                return {
                    success: false,
                    message: "Email tidak ditemukan",
                    data: null,
                };
            }
            if (!user.otp || user.otp !== input.otp) {
                return {
                    success: false,
                    message: "Kode OTP tidak valid",
                    data: null,
                };
            }
            if (!user.otpExpiry || new Date() > user.otpExpiry) {
                return {
                    success: false,
                    message: "Kode OTP telah kadaluarsa. Silakan kirim ulang.",
                    data: null,
                };
            }
            user.password = input.newPassword;
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();
            return {
                success: true,
                message: "Password berhasil direset. Silakan login dengan password baru.",
                data: null,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mereset password",
                data: null,
            };
        }
    }
}
exports.PenggunaService = PenggunaService;
//# sourceMappingURL=PenggunaService.js.map