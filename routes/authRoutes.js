const express = require("express");
const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../services/verifyEmail.js");
const { Auth } = require("../middlewares/auth.js");
require("dotenv").config();
const { User } = db;
const generateOtp = require("../utils/generateOtp.js");
const {
  userSignUpValidationSchema,
  loginUserValidationSchema,
  resetUserPasswordSchema,
  verifyEmailSchema,
  changeUserPasswordSchema,
  verifyResetPasswordSchema,
  resendValidationSchema
} = require("../validators/userValidationSchema.js");
const { sendResetPasswordOtpEmail } = require("../services/resetPassword.js");
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const { error, value } = userSignUpValidationSchema.validate({
      firstName,
      lastName,
      email,
      password,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const userExists = await User.findOne({ where: { email: value.email } });

    if (userExists) {
      return res.status(403).json({ message: "A user alreasy exist with this email" });
    }

    const hashPassword = await bcrypt.hash(value.password, 10);

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otp, 10);

    await User.create({
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      password: hashPassword,
      otp: hashedOtp,
      otpExpiresAt: otpExpiresAt,
    });

    sendEmail({ firstName: value.firstName, otp, email: value.email });

    return res.status(200).json({ message: "User Created Successfully, An Otp was sent to verify your email" });
  } catch (error) {
    console.log("error signing up user", error)
    // return res.status(402).json({ message: error.message });
  }
});

router.patch("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { error, value } = verifyEmailSchema.validate({
      email,
      otp,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const user = await User.findOne({ where: { email: value.email } });

    if (!user) {
      return res.status(404).json({ message: "Sorry, User not found" });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return res.status(401).json({ message: "OTP has expired!" });
    }

    const isMatch = await bcrypt.compare(value.otp, user.otp);

    if (!isMatch) {
      user.otpFailedAttempt += 1;

      if (user.otpFailedAttempt > 4) {
        user.isBlocked = true;
        await user.save();
        
        return res.status(403).json({
          message:
            "Your account is now blocked. Please contact customer service Or Call 09018535602.",
        });
      }
     
     await user.save();
      return res.status(401).json({ message: "Invalid OTP!" });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    user.emailIsVerified = true;
    await user.save();

    return res.status(200).json({ message: "Email Verified successfully" });
  } catch (error) {
    return res
      .status(402)
      .json({ message: `An Error Ocurred : ${error.message}` });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const { error, value } =  resendValidationSchema.validate({ email })
    if ( error ) { return res.status(403).json({ message : error.message })}

    const user = await User.findOne({ where: { email : value.email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   const otp = generateOtp(); 
   const hashedOtp = await bcrypt.hash(otp, 10);
    user.otp = hashedOtp;
    user.otpFailedAttempt = 0;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await user.save();
    await sendEmail({ firstName: user.firstName, email: user.email, otp });

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { error, value } = loginUserValidationSchema.validate({
      email,
      password,
    });

    if (error) {
      return res.status(402).json({ message: error.message });
    }

    const user = await User.findOne({ where: { email: value.email } });

    if (!user) {
      return res.status(403).json({ message: "Sorry No User Found" });
    }

    if (user.isBlocked === true) {
      return res.status(403).json({
        message:
          "Your account is blocked. Please contact customer service or Call 09018535602.",
      });
    }

    const confirmPassword = await bcrypt.compare(value.password, user.password);

    if (!confirmPassword) {
      user.failedAttempts += 1;
      user.lastFailedAttempt = new Date();
      await user.save();

      if (user.failedAttempts > 4) {
        user.isBlocked = true;
        await user.save();
        return res.status(403).json({
          message:
            "Your account is now blocked. Please contact customer service or Call 09018535602.",
        });
      }

      return res.status(403).json({ Message: "Incorrect Password" });
    }

    if ( !user.lastFailedAttempt || Date.now() - new Date(user.lastFailedAttempt).getTime() > 5 * 60 * 1000 ) {
      user.failedAttempts = 0;
      await user.save();
    }

    user.failedAttempts = 0;
    await user.save();

    const token = jwt.sign(
      { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    return res.status(200).json({ message: "Signed in successfully", token });
  } catch (error) {
    res.status(500).json({ Message: `An Error Ocurred: ${error.message}` });
  }
});

router.post("/changepassword", Auth, async (req, res) => {
  try {
    const { email, password, newPassword } = req.body;

    const { error, value } = changeUserPasswordSchema.validate({
      email,
      password,
      newPassword,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const user = await User.findOne({ where: { email: value.email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account is blocked. Please contact 09018535602.",
      });
    }

    const confirmPassword = await bcrypt.compare(value.password, user.password);

    if (!confirmPassword) {
      user.failedAttempts += 1;

      if (user.failedAttempts > 4) {
        user.isBlocked = true;
      }

      if (user.isBlocked) {
        return res.status(403).json({
          message:
            "Sorry Your Account Has Been Blocked. Please contact 09018535602",
        });
      }
      await user.save();
      return res.status(401).json({ message: "Password is incorrect" });
    }

    user.failedAttempts = 0;
    await user.save();

    const hashedNewPassword = await bcrypt.hash(value.newPassword, 10);
    await user.update({ password: hashedNewPassword });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `An error occurred: ${error.message}` });
  }
});

router.post("/forgotpassword", async (req, res) => {
  try {
    const { email } = req.body;

    const { error, value } = resetUserPasswordSchema.validate({ email });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const user = await User.findOne({ where: { email: value.email } });

    if (!user) {
      return res.status(404).json({ message: "Sorry, user not found" });
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await sendResetPasswordOtpEmail({
      firstName: user.firstName,
      otp: otp,
      email: user.email,
    });

    return res.status(200).json({ message: "OTP has been sent to your email." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/verify-reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const { error, value } = verifyResetPasswordSchema.validate({
      email,
      otp,
      newPassword,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const user = await User.findOne({ where: { email: value.email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(410).json({ message: "OTP has expired" });
    }

    const isValidOtp = await bcrypt.compare(value.otp, user.otp);
    if (!isValidOtp) {
      user.otpFailedAttempt += 1;

      if (user.otpFailedAttempt > 4) {
        user.isBlocked = true;
      }

      await user.save();

      if (user.isBlocked) {
        return res.status(403).json({message: "Your account is now blocked. Please contact customer service Or Call 09018535602."})
      }

      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(value.newPassword, 10);

    await user.update({
      password: hashedPassword,
      otp: null,
      otpExpiresAt: null,
      emailIsVerified: true,
      otpFailedAttempt: 0,
    });

    return res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


module.exports = router;