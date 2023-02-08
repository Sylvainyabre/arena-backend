const express = require("express");
const crypto = require("crypto");
const dotenv = require("dotenv");
const User = require("../models/User");
const Token = require("../models/Token");
const router = express.Router();
const bcrypt = require("bcrypt");
const smtpTransport = require("../config/sendEmail");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

dotenv.config({ path: "./config/config.env" });

//@METHOD: POST api/auth/password/forgotten
//@DESC: reset forgotten password for the user
//@ACCESS:Public

router.post("/forgotten", async (req, res) => {
  try {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const email = req.body.email;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email.",
        data: null,
      });
    }
    let token = await Token.findOne({ userId: user._id });
    if (token) {
      const deletion = await Token.deleteOne({ _id: token._id });
    }
    const hashedResetToken = await bcrypt.hash(resetToken, 10);
    const newToken = new Token({
      userId: user._id,
      token: hashedResetToken,
      createdAt: Date.now(),
    });

    await newToken.save();
    ``;
    const resetLink = `${req.protocol}://${req.get("host")}${
      req.originalUrl
    }/${resetToken}/${user._id}`;
    const messageText = `<h3>Hi, ${user.firstName},</h3> <br> 
        <p> You requested to reset your password, please follow the link below to do so.</p>
        <p>Please, disregard this email if you did not request a password change, your password will remain unchanged.</p>
        <h3> Your friends from Brain Arena</h3>
        <a href = ${resetLink}> Reset password</a>`;
    const msg = {
      to: user.email,
      from: "no-reply@brainArena.com", //"yabre.tech@gmail.com",
      subject: "Password Reset Request",
      html: messageText,
    };
    const result = await sgMail.send(msg).then((res) => {
      console.log(res);

      return res;
    });

    res.json({
      success: true,
      message:
        "An email has been sent to you, please follow the link to reset your password.",
      data: result,
    });
  } catch (err) {
    res.json({ success: false, message: err.message, data: null });
  }
});

//@METHOD: POST api/auth/password/reset
//@DESC: reset forgotten password for the user
//@ACCESS:Public

router.post("/reset/:token/:userId", async (req, res) => {
  try {
    const newPassword = req.body.password;
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const newPasswordConfirm = req.body.passwordConfirm;
    const user = await User.findOne({ _id: req.params.userId });
    const sentResetToken = req.params.token;
    const resetTokenFromDB = await Token.findOne({ userId: req.params.userId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found.", data: null });
    }

    if (!resetTokenFromDB) {
      return res.status(404).json({
        success: false,
        message: "Reset link expired or invalid.",
        data: null,
      });
    }
    if (!newPassword) {
      return res
        .status(404)
        .json({ success: false, message: "password is required.", data: null });
    }
    if (!newPasswordConfirm) {
      return res.status(400).json({
        success: false,
        message: "Please confirm the new password.",
        data: null,
      });
    }
    
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
        data: null,
      });
    }
    const isTokenValid = await bcrypt.compare(
      sentResetToken,
      resetTokenFromDB.token
    );
    if (!isTokenValid) {
      return res.status(404).json({
        success: false,
        message: "Reset link expired or invalid.",
        data: null,
      });
    }

    user.password = hashedNewPassword;
    await user.save();
    await Token.deleteOne({ userId: user._id });
    // await resetTokenFromDB.remove();
    const loginLink = "http://localhost:3000/login";
    const successMessageText = `<h3>Hi, ${user.firstName}</h3>
    <p> Your password has been successfully reset.</p>
    <a href=${loginLink}> You may now login.</a>;
    <p>Best,</p>
    p>Your friends at BrainArena,</p>`;
    const msg = {
      to: user.email,
      from: "no-reply@brainArena.com", //"yabre.tech@gmail.com",
      subject: "Password Reset Request",
      html: successMessageText,
    };
    const result = await sgMail.send(msg).then((res) => {
      console.log(res);

      return res;
    });
    res.json({
      success: true,
      message: "Password successfully reset !",
      data: result,
    });
  } catch (err) {
    res.json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
