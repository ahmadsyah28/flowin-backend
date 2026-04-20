import nodemailer from "nodemailer";
import { config } from "@/config";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email to user
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  namaLengkap: string,
): Promise<void> => {
  const mailOptions = {
    from: `"Flowin" <${config.email.user}>`,
    to: email,
    subject: "Kode Verifikasi OTP - Flowin",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1E2351; text-align: center;">Verifikasi Email Anda</h2>
        <p>Halo <strong>${namaLengkap}</strong>,</p>
        <p>Gunakan kode OTP berikut untuk menyelesaikan pendaftaran akun Flowin Anda:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E2351; background: #f0f0f0; padding: 16px 32px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="color: #666;">Kode ini berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">Jika Anda tidak merasa mendaftar di Flowin, abaikan email ini.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
