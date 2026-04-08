  import { GraphQLContext } from "@/types";
import { requireAuth } from "@/middlewares";
import {
  PenggunaService,
  RegisterInput,
  LoginInput,
  GoogleLoginInput,
  UpdateProfileInput,
  UpdatePasswordInput,
  CompleteGoogleProfileInput,
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

    // Register with Google
    registerWithGoogle: async (_: any, { idToken }: { idToken: string }) => {
      return PenggunaService.registerWithGoogle(idToken);
    },

    // Login user
    login: async (_: any, { input }: { input: LoginInput }) => {
      return PenggunaService.login(input);
    },

    // Login with Google
    googleLogin: async (_: any, { input }: { input: GoogleLoginInput }) => {
      return PenggunaService.googleLogin(input);
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

    // Complete Google profile
    completeGoogleProfile: async (
      _: any,
      { input }: { input: CompleteGoogleProfileInput },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return PenggunaService.completeGoogleProfile(user._id.toString(), input);
    },

    // Verify email
    verifyEmail: async (_: any, { token }: { token: string }) => {
      return PenggunaService.verifyEmail(token);
    },

    // Resend verification email
    resendVerificationEmail: async (
      _: any,
      __: any,
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return PenggunaService.resendVerificationEmail(user);
    },
  },
};
