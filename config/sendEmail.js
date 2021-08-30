const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const smtpTransport = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: "apikey",
    pass: process.env.SMTP_PASSWORD,
  },
});

module.exports = smtpTransport;
