const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transfer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Styled OTP Email
const sendOTPEmail = async (userEmail, otp, type) => {
  try {
    const title =
      type === "account_verification"
        ? "Verify your Eventora account"
        : "Eventora Booking verification";

    const msg =
      type === "account_verification"
        ? `Your OTP for account verification is: ${otp}. It will expire in 5 minutes.`
        : `Your OTP for event booking is: ${otp}. It will expire in 5 minutes.`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #111;">${title}</h2>

          <p style="color: #555; font-size: 16px;">
            ${msg}
          </p>

          <div style="
            margin: 20px auto;
            padding: 15px;
            font-size: 24px;
            font-weight: bold;
            background: #f4f4f4;
            width: max-content;
            letter-spacing: 5px;
          ">
            ${otp}
          </div>

          <p style="color: #999; font-size: 12px;">
            This code expires in 5 minutes.
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };

    await transfer.sendMail(mailOptions);
    console.log(`OTP email successfully sent to ${userEmail} for ${type}`);
  } catch (error) {
    console.error(`\n[EMAIL SMTP WARNING] Could not send email via Gmail: ${error.message}`);
    console.log(`========================================`);
    console.log(`🔑 [DEV FALLBACK OTP CODE]`);
    console.log(`📧 User: ${userEmail}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log(`========================================\n`);
    // Fallback in development mode so invalid SMTP credentials do not crash signup/login
  }
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Booking Confirmed!</h2>
          <p>Hi ${userName},</p>
          <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
          <p>Thank you for using Eventora!</p>
        </div>
      `,
    };

    await transfer.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error(`[EMAIL SMTP WARNING] Could not send booking confirmation email: ${error.message}`);
  }
};

module.exports = {
  sendOTPEmail,
  sendBookingEmail,
};