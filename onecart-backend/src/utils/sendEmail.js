import nodemailer from "nodemailer";

export async function sendOtpEmail(email, otp) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS not set in .env");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔍 Verify connection first
    await transporter.verify();
    console.log("✅ Gmail transporter ready");

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

    console.log("📧 OTP email sent:", info.response);

  } catch (err) {
    console.error("❌ Email sending failed:");
    console.error(err.message);
  }
}
