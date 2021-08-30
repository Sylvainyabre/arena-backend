
const express = require("express");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const User = require("../models/User");
const Token = require("../models/Token");
const router = express.Router();
const bcrypt = require("bcrypt");
const sendGridMailer = require("@sendgrid/mail");

sendGridMailer.setApiKey(process.env.SENDGRID_API_KEY_FINAL);


//@METHOD: POST api/auth/password/forgotten
//@DESC: reset forgotten password for the user
//@ACCESS:Public

router.post("/forgotten", async (req, res) => {
  try {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with this email." });
    }
    let token = await Token.findOne({ userId: user._id });
    if (token) {
      return await token.deleteOne();
    }
    const hashedResetToken = await bcrypt.hash(resetToken, 10);
    
    const newToken = new Token({
      userId: user._id,
      token: hashedResetToken,
      createdAt: Date.now(),
    });

    await newToken.save();

    const resetLink = `http://localhost:3000/password/reset/${resetToken}/${user._id}`;
    const messageText = `<h3>Hi, ${user.firstName},</h3> <br> 
        <p> You requested to reset your password, please follow the link below to do so.</p>
        <p>Please, disregard this email if you did not request a password change, your password will remain unchanged.</p>
        <h3> Your friends from Brain Arena</h3>
        <a href = ${resetLink}> Reset password</a>`;

    const requestEmail = {
      to: user.email, // Change to your recipient
      from: process.env.SENDGRID_SENDER, // Change to your verified sender
      subject: "Your BrainArena password reset request.",
      html: messageText,
    };
    
    await sendGridMailer.send(requestEmail).then((res)=>console.log(res));

    res.json({
      message:
        "An email has been sent to you, please follow the link to reset your password.",
    });
  } catch (err) {
    res.json({ message: err.message });
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
        .json({ message: "User not found.", status: "failure" });
    }

    if (!resetTokenFromDB) {
      return res
        .status(404)
        .json({ message: "Reset link expired or invalid.", status: "failure" });
    }
    if (!newPassword) {
      return res
        .status(400)
        .json({ message: "password is required.", status: "failure" });
    }
    if (!newPasswordConfirm) {
      return res
        .status(400)
        .json({
          message: "Please confirm the new password.",
          status: "failure",
        });
    }
    // yabre.tech@gmail.com password changed to YSylv6556
    if (newPassword !== newPasswordConfirm) {
      return res
        .status(400)
        .json({ message: "Passwords do not match.", status: "failure" });
    }
    const isTokenValid = await bcrypt.compare(
      sentResetToken,
      resetTokenFromDB.token
    );
    if (!isTokenValid) {
      return res
        .status(404)
        .json({ message: "Reset link expired or invalid.", status: "failure" });
    }

    user.password = hashedNewPassword;
    await user.save();
    await resetTokenFromDB.remove();
    const loginLink = "http://localhost:3000/login";
    const successMessageText = `<h3>Hi, ${user.firstName}</h3>
    <p> Your password has been successfully reset.</p>
    <a href=${loginLink}> You may now login</a>`;
    const successEmail = {
      to: user.email, // Change to your recipient
      from: process.env.SENDGRID_SENDER, // Change to your verified sender
      subject: "Your BrainArena password reset success.",
      html: successMessageText,
    };
    await sendGridMailer.send(successEmail);
    res.json({ message: "Password successfully reset !", status: "success" });
  } catch (err) {
    res.json({ message: err.message });
    
  }
});

module.exports = router;
