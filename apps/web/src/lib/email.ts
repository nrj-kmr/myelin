import nodemailer from "nodemailer";

let cachedTestAccount: any = null;

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendEmailPayload): Promise<{ messageId: string; previewUrl?: string }> {
  // Check if SMTP configs exist in env
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"Myelin App" <waitlist@myelin.app>';

  let transporter;

  if (host && user && pass) {
    // Real SMTP configuration
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  } else {
    // Developer Mock Sandbox Mode using Ethereal Email
    if (!cachedTestAccount) {
      console.log("⚠️ No SMTP credentials found. Creating a test sandbox account on Ethereal...");
      try {
        cachedTestAccount = await nodemailer.createTestAccount();
      } catch (err) {
        console.error("❌ Failed to register ethereal test account. Falling back to local console mock.", err);
      }
    }
    
    if (cachedTestAccount) {
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: cachedTestAccount.user, // generated ethereal user
          pass: cachedTestAccount.pass, // generated ethereal password
        },
      });
    }
  }

  // Send the email or fallback to logs
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      console.log("✉️ Email sent: %s", info.messageId);

      // If using Ethereal, generate the preview URL
      let previewUrl: string | undefined;
      if (!host) {
        previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        console.log("🔗 Preview URL: %s", previewUrl);
      }

      return {
        messageId: info.messageId,
        previewUrl,
      };
    } catch (sendErr) {
      console.error("❌ Transporter failed to deliver email. Falling back to console logger.", sendErr);
    }
  }

  // Fallback Console Logging (prevents 500 crashes when Ethereal SMTP fails or offline)
  const mockId = `mock-msg-${Math.random().toString(36).substring(2, 9)}`;
  console.log("---------------- MOCK EMAIL SANDBOX ----------------");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("Body: [HTML template omitted for logs]");
  console.log(`Message ID: ${mockId}`);
  console.log("----------------------------------------------------");

  return {
    messageId: mockId,
    previewUrl: undefined,
  };
}
