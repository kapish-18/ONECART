import nodemailer from "nodemailer";

export async function sendOtpEmail(email, otp) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS not set in environment");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // MUST be Google App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `"OneCart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OneCart OTP",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>🔐 Your OneCart OTP</h2>
          <h1 style="letter-spacing: 5px;">${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        </div>
      `,
    });

    console.log("📧 OTP email sent:", info.messageId);

    return true;

  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    throw err; // important so route knows it failed
  }
}