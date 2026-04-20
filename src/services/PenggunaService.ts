import { Pengguna, IPengguna } from "@/models/Pengguna";
import { generateToken } from "@/utils/auth";
import { generateOTP, sendOTPEmail } from "@/services/EmailService";
import { verifyGoogleToken } from "@/utils/googleAuth";

// Input interfaces
export interface RegisterInput {
  email: string;
  noHP: string;
  namaLengkap: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyOTPInput {
  email: string;
  otp: string;
}

export interface ResendOTPInput {
  email: string;
}

export interface GoogleLoginInput {
  idToken: string;
}

export interface UpdateProfileInput {
  namaLengkap?: string;
  noHP?: string;
}

export interface UpdatePasswordInput {
  currentPassword?: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

// Response interfaces
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string | null;
  user: any | null;
}

export interface MutationResponse {
  success: boolean;
  message: string;
  data: any | null;
}

// Helper function to sanitize user response
const sanitizeUserResponse = (user: any) => {
  const userResponse = user.toObject();
  userResponse.password = undefined;
  userResponse.token = undefined;
  userResponse.otp = undefined;
  userResponse.otpExpiry = undefined;
  return userResponse;
};

// Email format validation
const isValidEmail = (email: string): boolean => {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
};

export class PenggunaService {
  /**
   * Register a new user (sends OTP, account is NOT verified yet)
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      // Validate email format
      if (!isValidEmail(input.email)) {
        return {
          success: false,
          message: "Format email tidak valid",
          token: null,
          user: null,
        };
      }

      // Validate password not empty
      if (!input.password || input.password.length < 6) {
        return {
          success: false,
          message: "Password minimal 6 karakter",
          token: null,
          user: null,
        };
      }

      // Check if email already exists
      const existingUser = await Pengguna.findOne({ email: input.email });
      if (existingUser) {
        // If existing user is not verified, allow re-registration by resending OTP
        if (!existingUser.isVerified) {
          const otp = generateOTP();
          const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

          existingUser.otp = otp;
          existingUser.otpExpiry = otpExpiry;
          existingUser.namaLengkap = input.namaLengkap;
          existingUser.noHP = input.noHP;
          existingUser.password = input.password;
          await existingUser.save();

          // Send OTP email
          await sendOTPEmail(input.email, otp, input.namaLengkap);

          return {
            success: true,
            message:
              "Kode OTP telah dikirim ke email Anda. Silakan cek email untuk verifikasi.",
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

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Create new user (isVerified = false)
      await Pengguna.create({
        email: input.email,
        noHP: input.noHP,
        namaLengkap: input.namaLengkap,
        password: input.password,
        isVerified: false,
        authProvider: "email",
        otp,
        otpExpiry,
      });

      // Send OTP email
      await sendOTPEmail(input.email, otp, input.namaLengkap);

      return {
        success: true,
        message:
          "Kode OTP telah dikirim ke email Anda. Silakan cek email untuk verifikasi.",
        token: null,
        user: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat registrasi",
        token: null,
        user: null,
      };
    }
  }

  /**
   * Verify OTP and activate account
   */
  static async verifyOTP(input: VerifyOTPInput): Promise<AuthResponse> {
    try {
      const user = await Pengguna.findOne({ email: input.email });
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

      // Check OTP match
      if (!user.otp || user.otp !== input.otp) {
        return {
          success: false,
          message: "Kode OTP tidak valid",
          token: null,
          user: null,
        };
      }

      // Check OTP expiry
      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        return {
          success: false,
          message: "Kode OTP telah kadaluarsa",
          token: null,
          user: null,
        };
      }

      // Activate account
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      // Generate JWT token
      const token = generateToken(user);
      const userResponse = sanitizeUserResponse(user);

      return {
        success: true,
        message: "Verifikasi berhasil. Akun Anda telah aktif.",
        token,
        user: userResponse,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat verifikasi OTP",
        token: null,
        user: null,
      };
    }
  }

  /**
   * Resend OTP to email
   */
  static async resendOTP(input: ResendOTPInput): Promise<MutationResponse> {
    try {
      const user = await Pengguna.findOne({ email: input.email });
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

      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // Send OTP email
      await sendOTPEmail(user.email, otp, user.namaLengkap);

      return {
        success: true,
        message: "Kode OTP baru telah dikirim ke email Anda",
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mengirim ulang kode OTP",
        data: null,
      };
    }
  }

  /**
   * Login user (only verified email-based accounts)
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    try {
      // Validate email format
      if (!isValidEmail(input.email)) {
        return {
          success: false,
          message: "Format email tidak valid",
          token: null,
          user: null,
        };
      }

      // Validate password not empty
      if (!input.password) {
        return {
          success: false,
          message: "Password tidak boleh kosong",
          token: null,
          user: null,
        };
      }

      // Find user by email
      const user = await Pengguna.findOne({ email: input.email });
      if (!user) {
        return {
          success: false,
          message:
            "Email belum terdaftar, silakan lakukan pendaftaran terlebih dahulu.",
          token: null,
          user: null,
        };
      }

      // Check if account is verified
      if (!user.isVerified) {
        return {
          success: false,
          message:
            "Akun belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
          token: null,
          user: null,
        };
      }

      // Check password
      const isPasswordValid = await user.comparePassword(input.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Email atau password salah",
          token: null,
          user: null,
        };
      }

      // Generate JWT token
      const token = generateToken(user);

      // Remove sensitive data from response
      const userResponse = sanitizeUserResponse(user);

      return {
        success: true,
        message: "Login berhasil",
        token,
        user: userResponse,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat login",
        token: null,
        user: null,
      };
    }
  }

  /**
   * Google Login (only for already registered & verified users)
   */
  static async googleLogin(input: GoogleLoginInput): Promise<AuthResponse> {
    try {
      // Verify Google token
      const googleUser = await verifyGoogleToken(input.idToken);

      if (!googleUser.email) {
        return {
          success: false,
          message: "Tidak dapat mengambil email dari akun Google",
          token: null,
          user: null,
        };
      }

      // Find user by email
      const user = await Pengguna.findOne({
        email: googleUser.email.toLowerCase(),
      });
      if (!user) {
        return {
          success: false,
          message:
            "Email belum terdaftar, silakan lakukan pendaftaran terlebih dahulu.",
          token: null,
          user: null,
        };
      }

      // Check if account is verified
      if (!user.isVerified) {
        return {
          success: false,
          message:
            "Akun belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
          token: null,
          user: null,
        };
      }

      // Update Google info if not set
      if (!user.googleId) {
        user.googleId = googleUser.sub;
      }
      if (googleUser.picture && !user.profilePicture) {
        user.profilePicture = googleUser.picture;
      }
      await user.save();

      // Generate JWT token
      const token = generateToken(user);
      const userResponse = sanitizeUserResponse(user);

      return {
        success: true,
        message: "Login berhasil",
        token,
        user: userResponse,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat login dengan Google",
        token: null,
        user: null,
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string): Promise<MutationResponse> {
    await Pengguna.findByIdAndUpdate(userId, { token: null });

    return {
      success: true,
      message: "Logout berhasil",
      data: null,
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<MutationResponse> {
    try {
      const updatedUser = await Pengguna.findByIdAndUpdate(
        userId,
        { ...input },
        { new: true, select: "-password -token -otp -otpExpiry" },
      );

      return {
        success: true,
        message: "Profile berhasil diupdate",
        data: updatedUser,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal update profile",
        data: null,
      };
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(
    user: IPengguna,
    input: UpdatePasswordInput,
  ): Promise<MutationResponse> {
    try {
      // Verify current password if provided
      if (input.currentPassword) {
        const isCurrentPasswordValid = await user.comparePassword(
          input.currentPassword,
        );
        if (!isCurrentPasswordValid) {
          return {
            success: false,
            message: "Password lama tidak sesuai",
            data: null,
          };
        }
      }

      // Validate new password
      if (input.newPassword.length < 6) {
        return {
          success: false,
          message: "Password baru minimal 6 karakter",
          data: null,
        };
      }

      // Update password
      user.password = input.newPassword;
      await user.save();

      return {
        success: true,
        message: "Password berhasil diubah",
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mengubah password",
        data: null,
      };
    }
  }

  /**
   * Forgot password - send OTP to registered email
   */
  static async forgotPassword(input: ForgotPasswordInput): Promise<MutationResponse> {
    try {
      if (!isValidEmail(input.email)) {
        return {
          success: false,
          message: "Format email tidak valid",
          data: null,
        };
      }

      const user = await Pengguna.findOne({ email: input.email });
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

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // Send OTP email
      await sendOTPEmail(user.email, otp, user.namaLengkap);

      return {
        success: true,
        message: "Kode OTP telah dikirim ke email Anda untuk reset password.",
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mengirim kode OTP",
        data: null,
      };
    }
  }

  /**
   * Reset password using OTP
   */
  static async resetPassword(input: ResetPasswordInput): Promise<MutationResponse> {
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

      const user = await Pengguna.findOne({ email: input.email });
      if (!user) {
        return {
          success: false,
          message: "Email tidak ditemukan",
          data: null,
        };
      }

      // Check OTP match
      if (!user.otp || user.otp !== input.otp) {
        return {
          success: false,
          message: "Kode OTP tidak valid",
          data: null,
        };
      }

      // Check OTP expiry
      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        return {
          success: false,
          message: "Kode OTP telah kadaluarsa. Silakan kirim ulang.",
          data: null,
        };
      }

      // Update password & clear OTP
      user.password = input.newPassword;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      return {
        success: true,
        message: "Password berhasil direset. Silakan login dengan password baru.",
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mereset password",
        data: null,
      };
    }
  }
}
