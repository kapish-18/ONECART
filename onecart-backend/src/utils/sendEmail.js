import * as brevo from '@getbrevo/brevo';

export async function sendOtpEmail(email, otp) {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY not set in environment");
    }

    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: "OneCart", email: "noreply@onecart.com" };
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.subject = "Your OneCart OTP";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>🔐 Your OneCart OTP</h2>
        <h1 style="letter-spacing: 5px;">${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      </div>
    `;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("📧 OTP email sent:", data.messageId);
    return true;

  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    throw err;
  }
}