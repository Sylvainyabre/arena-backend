const express = require("express");
const router = express.Router();

const sgMail = require("@sendgrid/mail");
const passport = require("passport");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, authToken);

router.post(
  "/sendMessage",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const messageBody = req.body.message;
      const destination = req.body.destination;
      const result = client.messages
        .create({
          body: messageBody,
          messagingServiceSid: process.env.MESSAGING_SERVICE_ID,
          from: "+16018951879",
          to: destination,
        })
        .then((message) => message);
      // done();
      return res.json({ success: true, message: "message successfully sent!",data:result });
    } catch (err) {
      return res.json({ success: false, message: err.message,data:null });
    }
  }
);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post(
  "/sendEmail",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const emailBody = req.body.message;
      const destination = req.body.destination;
      const subject = req.body.subject;
      const msg = {
        to: destination, 
        from: "no-reply@brainarena.com",
        subject: subject,
        text: emailBody,
      };
      const result = await sgMail
        .send(msg)
        .then((res) => {
          console.log(res);

          return res;
        })
        .catch((error) => {
          console.error(error);
        });
      return res.json({ success: true, message:"" ,data:result });
    } catch (err) {
      return res.json({ success: false, message: err.message,data:null });
    }
  }
);
module.exports = router;