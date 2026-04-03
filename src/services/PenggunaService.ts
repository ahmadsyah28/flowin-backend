import { Pengguna, IPengguna } from "@/models/Pengguna";
import {
  generateToken,
  generateVerificationToken,
  verifyEmailToken,
} from "@/utils/auth";
import { verifyGoogleToken, GoogleUserInfo } from "@/utils/googleAuth";

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

export interface GoogleLoginInput {
  googleToken: string;
}

export interface UpdateProfileInput {
  namaLengkap?: string;
  noHP?: string;
}

export interface CompleteGoogleProfileInput {
  noHP: string;
}

export interface UpdatePasswordInput {
  currentPassword?: string;
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
  return userResponse;
};

export class PenggunaService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      // Check if email already exists
      const existingUser = await Pengguna.findOne({ email: input.email });
      if (existingUser) {
        return {
          success: false,
          message: "Email sudah terdaftar",
          token: null,
          user: null,
        };
      }

      // Validate input
      if (input.password.length < 6) {
        return {
          success: false,
          message: "Password minimal 6 karakter",
          token: null,
          user: null,
        };
      }

      // Create verification token
      const verificationToken = generateVerificationToken();

      // Create new user
      const user = await Pengguna.create({
        ...input,
        token: verificationToken,
      });

      // Generate JWT token
      const jwtToken = generateToken(user);

      // Remove sensitive data from response
      const userResponse = sanitizeUserResponse(user);

      // TODO: Send verification email here

      return {
        success: true,
        message: "Registrasi berhasil. Silakan cek email untuk verifikasi.",
        token: jwtToken,
        user: userResponse,
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
   * Login user
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await Pengguna.findOne({ email: input.email });
      if (!user) {
        return {
          success: false,
          message: "Email atau password salah",
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
   * Login with Google
   */
  static async googleLogin(input: GoogleLoginInput): Promise<AuthResponse> {
    try {
      // Verify Google token
      const googleUser = await verifyGoogleToken(input.googleToken);

      if (!googleUser.email_verified) {
        return {
          success: false,
          message: "Email Google belum terverifikasi",
          token: null,
          user: null,
        };
      }

      // Check if user already exists
      let user = await Pengguna.findOne({
        $or: [{ email: googleUser.email }, { googleId: googleUser.sub }],
      });

      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          user.googleId = googleUser.sub;
          user.authProvider = "google";
          user.isVerified = true;
          if (googleUser.picture) {
            user.profilePicture = googleUser.picture;
          }
          await user.save();
        }
      } else {
        // Create new user for Google login
        user = await Pengguna.create({
          email: googleUser.email,
          namaLengkap: googleUser.name,
          noHP: "", // Will need to be filled later
          googleId: googleUser.sub,
          profilePicture: googleUser.picture || "",
          authProvider: "google",
          isVerified: true,
        });
      }

      // Generate JWT token
      const token = generateToken(user);

      // Remove sensitive data from response
      const userResponse = sanitizeUserResponse(user);

      return {
        success: true,
        message: "Login Google berhasil",
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
   * Register with Google (using ID Token)
   */
  static async registerWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      // Verify Google ID token
      const googleUser = await verifyGoogleToken(idToken);

      if (!googleUser.email_verified) {
        return {
          success: false,
          message: "Email Google belum terverifikasi",
          token: null,
          user: null,
        };
      }

      // Check if user already exists
      let user = await Pengguna.findOne({
        $or: [{ email: googleUser.email }, { googleId: googleUser.sub }],
      });

      if (user) {
        // User exists, just return login response
        // Update Google ID if not set
        if (!user.googleId) {
          user.googleId = googleUser.sub;
          user.authProvider = "google";
          user.isVerified = true;
          if (googleUser.picture) {
            user.profilePicture = googleUser.picture;
          }
          await user.save();
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
      }

      // Create new user for Google registration
      user = await Pengguna.create({
        email: googleUser.email,
        namaLengkap: googleUser.name,
        noHP: "", // Will need to be filled later
        googleId: googleUser.sub,
        profilePicture: googleUser.picture || "",
        authProvider: "google",
        isVerified: true,
      });

      // Generate JWT token
      const token = generateToken(user);

      // Remove sensitive data from response
      const userResponse = sanitizeUserResponse(user);

      return {
        success: true,
        message: "Registrasi dengan Google berhasil",
        token,
        user: userResponse,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message || "Terjadi kesalahan saat registrasi dengan Google",
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
        { new: true, select: "-password -token" },
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
      await user.save(); // This will trigger the pre-save middleware to hash the password

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
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<MutationResponse> {
    try {
      // Verify token
      if (!verifyEmailToken(token)) {
        return {
          success: false,
          message: "Token verifikasi tidak valid atau sudah expired",
          data: null,
        };
      }

      // Find user with this token
      const user = await Pengguna.findOne({ token });
      if (!user) {
        return {
          success: false,
          message: "Token verifikasi tidak ditemukan",
          data: null,
        };
      }

      // Update user verification status
      user.isVerified = true;
      user.token = undefined;
      await user.save();

      const userResponse = sanitizeUserResponse(user);

      return {
        success: true,
        message: "Email berhasil diverifikasi",
        data: userResponse,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal verifikasi email",
        data: null,
      };
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(
    user: IPengguna,
  ): Promise<MutationResponse> {
    if (user.isVerified) {
      return {
        success: false,
        message: "Email sudah terverifikasi",
        data: null,
      };
    }

    try {
      // Generate new verification token
      const verificationToken = generateVerificationToken();

      // Update user token
      await Pengguna.findByIdAndUpdate(user._id, {
        token: verificationToken,
      });

      // TODO: Send verification email here

      return {
        success: true,
        message: "Email verifikasi telah dikirim ulang",
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal mengirim ulang email verifikasi",
        data: null,
      };
    }
  }

  /**
   * Complete Google user profile (add phone number)
   */
  static async completeGoogleProfile(
    userId: string,
    input: CompleteGoogleProfileInput,
  ): Promise<MutationResponse> {
    try {
      const user = await Pengguna.findById(userId);
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

      // Update phone number
      user.noHP = input.noHP;
      await user.save();

      const userResponse = sanitizeUserResponse(user);

      return {
        success: true,
        message: "Profile Google berhasil dilengkapi",
        data: userResponse,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Gagal melengkapi profile",
        data: null,
      };
    }
  }
}
