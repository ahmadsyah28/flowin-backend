export const penggunaTypeDefs = `
    #  Input untuk register pengguna baru
    input RegisterInput {
        email: String!
        noHP: String!
        namaLengkap: String!
        password: String!
    }

    # Input unttuk  login pengguna
    input LoginInput {
        email: String!
        password: String!
    }

    # Input untuk verifikasi OTP
    input VerifyOTPInput {
        email: String!
        otp: String!
    }

    # Input untuk resend OTP
    input ResendOTPInput {
        email: String!
    }

    # Input untuk Google Login
    input GoogleLoginInput {
        idToken: String!
    }

    # Input untuk update profil pengguna
    input UpdateProfileInput {
        namaLengkap: String
        noHP: String
    }
    
    # Input untuk update password pengguna
    input UpdatePasswordInput {
        currentPassword: String
        newPassword: String!
    }

    # Input untuk forgot password
    input ForgotPasswordInput {
        email: String!
    }

    # Input untuk reset password
    input ResetPasswordInput {
        email: String!
        otp: String!
        newPassword: String!
    }
    
    # Type untuk respons auth (login/register)
    type AuthPayload {
        success: Boolean!
        message: String!
        token: String
        user: Pengguna
    }

    # Type untuk data pengguna
    type Pengguna {
        id: ObjectId!
        email: String!
        noHP: String!
        namaLengkap: String!
        isVerified: Boolean!
        profilePicture: String
        authProvider: String!
        createdAt: Date!
        updatedAt: Date!
    }

    #Response untuk operasi CRUD umum
    type StandardResponse {
        success: Boolean!
        message: String!
        data: Pengguna
    }

    extend type Query {
        # Mendapatkan data pengguna yang sedang login
        me: Pengguna
    }

    extend type Mutation {
        # Register pengguna baru
        register(input: RegisterInput!): AuthPayload!
        # Login pengguna
        login(input: LoginInput!): AuthPayload!
        # Login dengan Google
        googleLogin(input: GoogleLoginInput!): AuthPayload!
        # Logout
        logout: StandardResponse!

        # Verifikasi OTP
        verifyOTP(input: VerifyOTPInput!): AuthPayload!
        # Resend OTP
        resendOTP(input: ResendOTPInput!): StandardResponse!

        # Update profil pengguna
        updateProfile(input: UpdateProfileInput!): StandardResponse!
        # Update password pengguna
        updatePassword(input: UpdatePasswordInput!): StandardResponse!

        # Forgot password (kirim OTP)
        forgotPassword(input: ForgotPasswordInput!): StandardResponse!
        # Reset password (OTP + password baru)
        resetPassword(input: ResetPasswordInput!): StandardResponse!
    }
`;
