"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const graphql_1 = require("../graphql");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const verifyGoogleToken = async (token) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new graphql_1.GraphQLError("Invalid Google token", {
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
    }
    catch (error) {
        throw new graphql_1.GraphQLError("Failed to verify Google token", {
            extensions: {
                code: "UNAUTHENTICATED",
            },
        });
    }
};
exports.verifyGoogleToken = verifyGoogleToken;
//# sourceMappingURL=googleAuth.js.map