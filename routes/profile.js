const Profile = require("../models/Profile");
const User = require("../models/User");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const validateProfileInput = require("../validation/profile");
const validateEducationInput = require("../validation/education");
const Course = require("../models/Course");

//@route: GET api/profile/user/:user_id
//@access: Public
//@desc: Get profile by user id

router.get("/user/:user_id", async (req, res) => {
  const errors = {};

  try {
    const userProfile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["firstName", "lastName", "enrollments", "avatar"]);

    if (!userProfile) {
      errors.noProfile = "No profile found for this user.";
      return res
        .status(404)
        .json({ success: false, message: "validation error", data: errors });
    }
    return res.json({ success: true, message: "", data: userProfile });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "There is no profile for this user.",
      data: null,
    });
  }
});

//@route: GET api/profile/all
//@access: Public
//@desc: Get all profiles
router.get("/all", async (req, res) => {
  const errors = {};
  try {
    const profiles = await Profile.find().populate("user", [
      "firstName",
      "lastName",
      "avatar",
    ]);
    if (!profiles) {
      errors.profiles = "No profiles found.";
      res
        .status(404)
        .json({ success: false, message: "No profiles found.", data: errors });
    }
    res.json(profiles);
  } catch (err) {
    errors.profile = err.message;
    res.json({ success: false, message: err.message, data: errors });
  }
});

//@route: POST api/profile/education/new
//@access: Private
//@desc: add education to profile

router.post(
  "/education/new",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      const newEd = {
        from: req.body.from,
        to: req.body.to,
        institution: req.body.institution,
        degree: req.body.degree,
      };

      if (profile) {
        if (profile.user._id !== req.user._id) {
          return res.status(401).json({
            success: false,
            message: "You are not allowed to update this profile.",
            data: null,
          });
        }
        profile.education.unshift(newEd);
        profile.save();
        res.json(profile);
      } else {
        res.status(400).json({
          success: false,
          message: "No profile found for this user",
          data: null,
        });
      }
    } catch (err) {
      res
        .status(400)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

//@route: DELETE api/profile/education/:ed_id
//@access: Private
//@desc: delete education from profile

router.delete(
  "/education/delete/:edu_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      const newEducations = profile.education.filter(
        (ed) => ed._id != req.params.edu_id
      );
      profile.education = newEducations;
      console.log(newEducations);
      await profile.save();
      return res.json({ success: true, message: "", data: profile });
    } catch (err) {
      res
        .status(404)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

//@route: DELETE api/profile/delete
//@access: Private
//@desc: delete user and profile

router.delete(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      await Profile.findOneAndRemove({ user: req.user.id });
      await User.findOneAndRemove({ id: req.user.id });
      res.json({
        success: false,
        message: "User and profile deleted successfully",
        data: null,
      });
    } catch (err) {
      res
        .status(404)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

//@route: GET api/profile/
//@access: Private
//@desc: get current user's profile
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const errors = {};
    const userProfile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["firstName", "lastName", "enrollments", "avatar"]
    );
    try {
      if (!userProfile) {
        errors.noProfile = "No profile found for this user.";
        return res.status(404).json({
          success: false,
          message: "No profile found for this user.",
          data: errors,
        });
      } else {
        return res.json({ success: true, message: "", data: userProfile });
      }
    } catch (err) {
      res
        .status(404)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

//@route: POST api/profile/new
//@access: Private
//@desc: create a profile for the  current user

router.post(
  "/new",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    //check validation
    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: "", data: errors });
    }
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.institution)
      profileFields.education.institution = req.body.institution;
    if (req.body.from) profileFields.education.from = req.body.from;
    if (req.body.to) profileFields.education.to = req.body.to;
    if (req.body.degree) profileFields.degree = req.body.degree;
    if (req.body.bio) profileFields.bio = req.body.bio;

    const user = req.user;
    const userProfile = await Profile.findOne({ user: user.id });

    try {
      if (!userProfile) {
        const newProfile = await new Profile(profileFields);
        const savedProfile = await newProfile.save();
        return res.json({
          success: true,
          message: "profile created successfully",
          data: savedProfile,
        });
      } else {
        //If profile already exists, update it.
        const updatedProfile = await Profile.findOneAndUpdate(
          { user: user.id },
          { $set: profileFields },
          { new: true }
        );
        res.json({ success: true, message: "", data: updatedProfile });
      }
    } catch (err) {
      res.json({ success: false, message: err.message, data: null });
    }
  }
);

module.exports = router;
