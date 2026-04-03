import { GraphQLError } from "graphql";
import { GraphQLContext } from "@/types";
import { verifyToken } from "./auth";
import { Pengguna, IPengguna } from "@/models/Pengguna";

// Middleware untuk memerlukan authentication
export const requireAuth = (context: GraphQLContext): IPengguna => {
  if (!context.isAuthenticated || !context.user) {
    throw new GraphQLError(
      "Authentication diperlukan untuk mengakses resource ini",
      {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      },
    );
  }
  return context.user;
};

// Middleware untuk memerlukan email verification
export const requireVerification = (context: GraphQLContext): IPengguna => {
  const user = requireAuth(context);

  if (!user.isVerified) {
    throw new GraphQLError("Email harus diverifikasi terlebih dahulu", {
      extensions: {
        code: "EMAIL_NOT_VERIFIED",
      },
    });
  }

  return user;
};

// Middleware untuk admin (jika ada role system nanti)
export const requireAdmin = (context: GraphQLContext): IPengguna => {
  const user = requireVerification(context);

  // Tambahkan logic admin check di sini jika ada role system
  // For now, semua verified user bisa akses admin functions

  return user;
};

// Helper untuk setup context dari request
export const setupContext = async (req: any): Promise<GraphQLContext> => {
  const context: GraphQLContext = {
    req,
    isAuthenticated: false,
  };

  // Extract token from Authorization header
  const authHeader = req.headers?.authorization || req.get?.("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      const payload = verifyToken(token);
      const user = await Pengguna.findById(payload.id);

      if (user) {
        context.user = user;
        context.isAuthenticated = true;
      }
    } catch (error) {
      // Token invalid, tapi tidak throw error
      // Biarkan resolver yang decide apakah perlu auth atau tidak
    }
  }

  return context;
};
