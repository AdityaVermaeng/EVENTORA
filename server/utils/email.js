const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transfer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Simple OTP Email
exports.sendOtpEmail = async (email, otp, type) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code for ${type} is: ${otp}. It will expire in 5 minutes.`,
    };

    await transfer.sendMail(mailOptions);

    console.log(`OTP email sent to ${email} for ${type}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    throw new Error("Failed to send OTP email");
  }
};

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

    console.log(`OTP sent to ${userEmail} for ${type}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${userEmail}:`, error);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = {
  sendOTPEmail,
};