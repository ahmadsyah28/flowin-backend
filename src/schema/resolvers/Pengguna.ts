import { GraphQLContext } from "@/types";
import { requireAuth } from "@/middlewares";
import {
  PenggunaService,
  RegisterInput,
  LoginInput,
  GoogleLoginInput,
  VerifyOTPInput,
  ResendOTPInput,
  UpdateProfileInput,
  UpdatePasswordInput,
  ForgotPasswordInput,
  VerifyResetOTPInput,
  ResetPasswordInput,
} from "@/services/PenggunaService";

export const penggunaResolvers = {
  Query: {
    // Get current user profile
    me: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return user;
    },
  },

  Mutation: {
    // Register new user
    register: async (_: any, { input }: { input: RegisterInput }) => {
      return PenggunaService.register(input);
    },

    // Login user
    login: async (_: any, { input }: { input: LoginInput }) => {
      return PenggunaService.login(input);
    },

    // Google Login
    googleLogin: async (_: any, { input }: { input: GoogleLoginInput }) => {
      return PenggunaService.googleLogin(input);
    },

    // Verify OTP
    verifyOTP: async (_: any, { input }: { input: VerifyOTPInput }) => {
      return PenggunaService.verifyOTP(input);
    },

    // Resend OTP
    resendOTP: async (_: any, { input }: { input: ResendOTPInput }) => {
      return PenggunaService.resendOTP(input);
    },

    // Logout user
    logout: async (_: any, __: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      return PenggunaService.logout(user._id.toString());
    },

    // Update profile
    updateProfile: async (
      _: any,
      { input }: { input: UpdateProfileInput },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return PenggunaService.updateProfile(user._id.toString(), input);
    },

    // Update password
    updatePassword: async (
      _: any,
      { input }: { input: UpdatePasswordInput },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return PenggunaService.updatePassword(user, input);
    },

    // Forgot password
    forgotPassword: async (
      _: any,
      { input }: { input: ForgotPasswordInput },
    ) => {
      return PenggunaService.forgotPassword(input);
    },

    // Verify reset OTP
    verifyResetOTP: async (
      _: any,
      { input }: { input: VerifyResetOTPInput },
    ) => {
      return PenggunaService.verifyResetOTP(input);
    },

    // Reset password
    resetPassword: async (_: any, { input }: { input: ResetPasswordInput }) => {
      return PenggunaService.resetPassword(input);
    },
  },
};
