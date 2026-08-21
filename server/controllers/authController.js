const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/email");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

//Register User
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  let userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${email}: ${otp}`);
    await OTP.create({ email, otp, action: "account_verification" });
    await sendOTPEmail(email, otp, "account_verification");

    res
      .status(201)
      .json({
        message:
          "User registered successfully. Please check your email for the OTP to verify your account.",
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
  if (!user.isVerified && user.role === "user") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email, action: "account_verification" }); //Remove any existing OTPs for this email and action
    await OTP.create({ email, otp, action: "account_verification" });
    await sendOTPEmail(email, otp, "account_verification");
    return res
      .status(400)
      .json({
        error:
          "Account not verified. Please check your email for the OTP to verify your account.",
      });
  }

  res.json({
    message: "User logged in successfully",
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

//Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const otpRecord = await OTP.findOne({
    email,
    otp,
    action: "account_verification",
  });

  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  const user = await User.findOneAndUpdate({ email }, { isVerified: true });
  await OTP.deleteMany({ email, action: "account_verification" }); //Remove any existing OTPs for this email and action
  res.json({
    message: "Account verified successfully. You can now log in.",
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};
