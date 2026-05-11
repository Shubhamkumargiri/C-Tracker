import nodemailer from "nodemailer";

const GMAIL_APP_PASSWORD_ERROR =
  "Gmail blocked the OTP email. Turn on 2-Step Verification for the sender Gmail account and use a valid Google App Password in SMTP_PASS."

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "Email service is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM to backend/.env."
    );
  }
  
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendPasswordResetOtpEmail = async (email, otp) => {
  try {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from,
      to: email,
      subject: "Career Tracker password reset OTP",
      text: `Your Career Tracker password reset OTP is ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 12px;">Password Reset OTP</h2>
          <p>Your Career Tracker password reset OTP is:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${otp}</p>
          <p>This OTP expires in 10 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    const rawMessage = error?.message || ""

    if (
      rawMessage.includes("Application-specific password required") ||
      rawMessage.includes("Invalid login: 534-5.7.9") ||
      rawMessage.includes("Username and Password not accepted") ||
      rawMessage.includes("Invalid login: 535-5.7.8")
    ) {
      throw new Error(GMAIL_APP_PASSWORD_ERROR)
    }

    throw error
  }
};
