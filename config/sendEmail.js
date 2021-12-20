const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const smtpTransport = nodemailer.createTransport({
      
      service:process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      }})


module.exports = smtpTransport