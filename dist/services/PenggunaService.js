"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenggunaService = void 0;
const Pengguna_1 = require("@/models/Pengguna");
const auth_1 = require("@/utils/auth");
const googleAuth_1 = require("@/utils/googleAuth");
const sanitizeUserResponse = (user) => {
    const userResponse = user.toObject();
    userResponse.password = undefined;
    userResponse.token = undefined;
    return userResponse;
};
class PenggunaService {
    static async register(input) {
        try {
            const existingUser = await Pengguna_1.Pengguna.findOne({ email: input.email });
            if (existingUser) {
                return {
                    success: false,
                    message: "Email sudah terdaftar",
                    token: null,
                    user: null,
                };
            }
            if (input.password.length < 6) {
                return {
                    success: false,
                    message: "Password minimal 6 karakter",
                    token: null,
                    user: null,
                };
            }
            const verificationToken = (0, auth_1.generateVerificationToken)();
            const user = await Pengguna_1.Pengguna.create({
                ...input,
                token: verificationToken,
            });
            const jwtToken = (0, auth_1.generateToken)(user);
            const userResponse = sanitizeUserResponse(user);
            return {
                success: true,
                message: "Registrasi berhasil. Silakan cek email untuk verifikasi.",
                token: jwtToken,
                user: userResponse,
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
    static async login(input) {
        try {
            const user = await Pengguna_1.Pengguna.findOne({ email: input.email });
            if (!user) {
                return {
                    success: false,
                    message: "Email atau password salah",
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
            const googleUser = await (0, googleAuth_1.verifyGoogleToken)(input.googleToken);
            if (!googleUser.email_verified) {
                return {
                    success: false,
                    message: "Email Google belum terverifikasi",
                    token: null,
                    user: null,
                };
            }
            let user = await Pengguna_1.Pengguna.findOne({
                $or: [{ email: googleUser.email }, { googleId: googleUser.sub }],
            });
            if (user) {
                if (!user.googleId) {
                    user.googleId = googleUser.sub;
                    user.authProvider = "google";
                    user.isVerified = true;
                    if (googleUser.picture) {
                        user.profilePicture = googleUser.picture;
                    }
                    await user.save();
                }
            }
            else {
                user = await Pengguna_1.Pengguna.create({
                    email: googleUser.email,
                    namaLengkap: googleUser.name,
                    noHP: "",
                    googleId: googleUser.sub,
                    profilePicture: googleUser.picture || "",
                    authProvider: "google",
                    isVerified: true,
                });
            }
            const token = (0, auth_1.generateToken)(user);
            const userResponse = sanitizeUserResponse(user);
            return {
                success: true,
                message: "Login Google berhasil",
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
    static async registerWithGoogle(idToken) {
        try {
            const googleUser = await (0, googleAuth_1.verifyGoogleToken)(idToken);
            if (!googleUser.email_verified) {
                return {
                    success: false,
                    message: "Email Google belum terverifikasi",
                    token: null,
                    user: null,
                };
            }
            let user = await Pengguna_1.Pengguna.findOne({
                $or: [{ email: googleUser.email }, { googleId: googleUser.sub }],
            });
            if (user) {
                if (!user.googleId) {
                    user.googleId = googleUser.sub;
                    user.authProvider = "google";
                    user.isVerified = true;
                    if (googleUser.picture) {
                        user.profilePicture = googleUser.picture;
                    }
                    await user.save();
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
            user = await Pengguna_1.Pengguna.create({
                email: googleUser.email,
                namaLengkap: googleUser.name,
                noHP: "",
                googleId: googleUser.sub,
                profilePicture: googleUser.picture || "",
                authProvider: "google",
                isVerified: true,
            });
            const token = (0, auth_1.generateToken)(user);
            const userResponse = sanitizeUserResponse(user);
            return {
                success: true,
                message: "Registrasi dengan Google berhasil",
                token,
                user: userResponse,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Terjadi kesalahan saat registrasi dengan Google",
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
            const updatedUser = await Pengguna_1.Pengguna.findByIdAndUpdate(userId, { ...input }, { new: true, select: "-password -token" });
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
    static async verifyEmail(token) {
        try {
            if (!(0, auth_1.verifyEmailToken)(token)) {
                return {
                    success: false,
                    message: "Token verifikasi tidak valid atau sudah expired",
                    data: null,
                };
            }
            const user = await Pengguna_1.Pengguna.findOne({ token });
            if (!user) {
                return {
                    success: false,
                    message: "Token verifikasi tidak ditemukan",
                    data: null,
                };
            }
            user.isVerified = true;
            user.token = undefined;
            await user.save();
            const userResponse = sanitizeUserResponse(user);
            return {
                success: true,
                message: "Email berhasil diverifikasi",
                data: userResponse,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal verifikasi email",
                data: null,
            };
        }
    }
    static async resendVerificationEmail(user) {
        if (user.isVerified) {
            return {
                success: false,
                message: "Email sudah terverifikasi",
                data: null,
            };
        }
        try {
            const verificationToken = (0, auth_1.generateVerificationToken)();
            await Pengguna_1.Pengguna.findByIdAndUpdate(user._id, {
                token: verificationToken,
            });
            return {
                success: true,
                message: "Email verifikasi telah dikirim ulang",
                data: null,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal mengirim ulang email verifikasi",
                data: null,
            };
        }
    }
    static async completeGoogleProfile(userId, input) {
        try {
            const user = await Pengguna_1.Pengguna.findById(userId);
            if (!user) {
                return {
                    success: false,
                    message: "User tidak ditemukan",
                    data: null,
                };
            }
            if (user.authProvider !== "google") {
                return {
                    success: false,
                    message: "Method ini hanya untuk user Google",
                    data: null,
                };
            }
            user.noHP = input.noHP;
            await user.save();
            const userResponse = sanitizeUserResponse(user);
            return {
                success: true,
                message: "Profile Google berhasil dilengkapi",
                data: userResponse,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Gagal melengkapi profile",
                data: null,
            };
        }
    }
}
exports.PenggunaService = PenggunaService;
//# sourceMappingURL=PenggunaService.js.map