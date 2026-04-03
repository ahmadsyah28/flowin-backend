import { GraphQLContext } from "@/types";
import { verifyToken } from "@/utils/auth";
import { Pengguna, IPengguna } from "@/models/Pengguna";
import {
  authenticationError,
  emailNotVerifiedError,
  forbiddenError,
} from "@/utils/errors";

/**
 * Middleware untuk memerlukan authentication
 * Throws UNAUTHENTICATED error jika user tidak login
 *
 * @example
 * const user = requireAuth(context);
 * // user pasti sudah login di sini
 */
export const requireAuth = (context: GraphQLContext): IPengguna => {
  if (!context.isAuthenticated || !context.user) {
    throw authenticationError(
      "Authentication diperlukan untuk mengakses resource ini",
    );
  }
  return context.user;
};

/**
 * Middleware untuk memerlukan email verification
 * User harus login DAN email sudah terverifikasi
 *
 * @example
 * const user = requireVerification(context);
 * // user pasti sudah login dan email verified
 */
export const requireVerification = (context: GraphQLContext): IPengguna => {
  const user = requireAuth(context);

  if (!user.isVerified) {
    throw emailNotVerifiedError("Email harus diverifikasi terlebih dahulu");
  }

  return user;
};

/**
 * Middleware untuk admin only (future use)
 * Saat ini sama dengan requireVerification
 *
 * @example
 * const admin = requireAdmin(context);
 */
export const requireAdmin = (context: GraphQLContext): IPengguna => {
  const user = requireVerification(context);

  // TODO: Tambahkan role check jika ada role system
  // if (user.role !== 'admin') {
  //   throw forbiddenError("Hanya admin yang dapat mengakses resource ini");
  // }

  return user;
};

/**
 * Extract token from Authorization header
 */
const extractToken = (req: any): string | null => {
  const authHeader = req.headers?.authorization || req.get?.("authorization");

  if (!authHeader) {
    return null;
  }

  // Format: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * Setup GraphQL context dari request
 * Verifikasi token dan attach user ke context
 *
 * @example
 * // Di Apollo Server context
 * context: async ({ req }) => setupContext(req)
 */
export const setupContext = async (req: any): Promise<GraphQLContext> => {
  const context: GraphQLContext = {
    req,
    isAuthenticated: false,
  };

  const token = extractToken(req);

  if (token) {
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
      console.log(
        "Invalid token:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return context;
};
