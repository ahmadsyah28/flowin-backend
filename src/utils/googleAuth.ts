import { OAuth2Client } from "google-auth-library";
import { GraphQLError } from "graphql";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUserInfo {
  sub: string; // Google user ID
  name: string;
  email: string;
  picture?: string;
  email_verified: boolean;
}

export const verifyGoogleToken = async (
  token: string,
): Promise<GoogleUserInfo> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new GraphQLError("Invalid Google token", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }

    return {
      sub: payload.sub,
      name: payload.name || "",
      email: payload.email || "",
      picture: payload.picture,
      email_verified: payload.email_verified || false,
    };
  } catch (error) {
    throw new GraphQLError("Failed to verify Google token", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }
};
