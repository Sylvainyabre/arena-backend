const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const validateLoginInput = require("../validation/login");
const validateRegistrationInput = require("../validation/register");
//const   = require("../middleware/auth");

//Loading environment variables
dotenv.config({ path: "./config/config.env" });

//desc Sign user up
//@access:Public
//route:POST api/auth/register
router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegistrationInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const avatar = gravatar.url(req.body.email, {
    s: "200", //size
    r: "pg", // rating
    d: "mm", // default
  });

  try {
    const user = await User.findOne({ email: req.body.email });
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      avatar: avatar,
      role: req.body.role || "basic",
    });
    if (user) {
      errors.email = "Email address already taken.";
      return res.status(400).json(errors);
    } else {
      const savedUser = await newUser.save();
      return res.json(savedUser);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
    //res.redirect("/register");
  }
});

//POST api/auth/login
//Log user in
//access: Public

router.post("/login", async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email: email });

  try {
    if (!user) {
      errors.email = "User not found";
      return res.status(400).json(errors);
    } if(req.isAuthenticated()){
      return res.status(400).json({message:"User already signed in."})
    }
    else {
      const isPasswordMatched = await bcrypt.compare(password, user.password);
      if (isPasswordMatched) {
        //Creating a jwt payload
        const payload = {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        };
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: 7200 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password = "Password incorrect.";

        return res.status(404).json(errors);
      }
    }
  } catch (err) {
   return res.json({ message: err.message });
  }
});

//Log user out
//DELETE api/auth/logout
//access:Private
router.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

//get current user
//@router GET api/auth/currentUser
//access:Private
router.get(
  "/currentUser",

  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

//get all users
//@router GET api/auth/all
//access:Private
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res
          .status(400)
          .json({
            message: "You do not have permission to perform this action",
          });
      }
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

//get all users
//@router GET api/auth/delete:user_id
//access:Private


router.delete(
  "/delete/:user_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (req.user.role === "basic" || req.user.role === "admin") {
        return res
          .status(400)
          .json({
            message: "You do not have permission to perform this action",
          });
      }
      await User.findOneAndRemove({ _id: req.params.user_id });
      req.flash("success", "User delete successfully");
      res.redirect("api/dashboard");
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

//get all users
//@router POST api/auth/password/reset
//access:Private

module.exports = router;
