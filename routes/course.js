const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const validateCourseInput = require("../validation/course");
const passport = require("passport");
const validateModuleInput = require("../validation/module");

//@desc : get all courses
//@route: GET api/courses/all
//access: Public

router.get("/all", async (req, res) => {
  try {
    const courses = await Course.find().populate("modules");
    if (!courses) {
      return res
        .status(404)
        .json({ success: false, message: "No courses found", data: null });
    }
    res.json({ success: true, message: "", data: courses });
  } catch (err) {
    res.json({ success: false, message: err.message, data: null });
  }
});

//@desc : get one course
//@route: GET api/courses/course/courseId
//access: Private
router.get(
  "/course/:courseId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const course = await Course.findById({
        _id: req.params.courseId,
      }).populate("modules");
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found", data: null });
      }
      if (!req.user.enrollments.includes(course._id)) {
        return res.status(401).json({
          success: false,
          message: "You are not enrolled in this course.",
          data: null,
        });
      }
      res.json({ success: true, message: "", data: course });
    } catch (err) {
      res.json({ success: false, message: err.message, data: null });
    }
  }
);

//@desc : enrol user in  a course
//@route: POST api/courses/enrol/courseId
//access: Private

router.post(
  "/enrol/:courseId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById({ _id: req.user._id });
      const course = await Course.findById({ _id: req.params.courseId });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "No user found.", data: null });
      }
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "No course found.", data: null });
      }
      if (user.enrollments.includes(req.params.courseId)) {
        return res.status(404).json({
          success: false,
          message: "You are already enrolled in this course",
          data: null,
        });
      } else {
        const userEnrollments = user.enrollments;
        userEnrollments.unshift(course._id);

        user.enrollments = userEnrollments;

        await user.save();
        res.json({ success: true, message: "", data: user });
      }
    } catch (err) {
      res
        .status(400)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

//@desc : drop a  course
//@route: POST api/courses/course/drop/:courseId
//access: Private
router.post(
  "/course/drop/:courseId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const course = await Course.findById({ _id: req.params.courseId });

      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found.", data: null });
      }
      if (!user.enrollments.includes(course)) {
        return res.status(404).json({
          success: false,
          message: "You are not enrolled in this course.",
          data: null,
        });
      } else {
        const newEnrollments = user.enrollments.filter(
          (course) => course._id !== req.params.courseId
        );
        user.enrollments = newEnrollments;
        await user.save();
        return res.json({ success: true, message: "", data: user });
      }
    } catch (err) {
      res.json({ success: true, message: err.message, data: null });
    }
  }
);

//@desc : create a new course
//@route: POST api/courses/course/new
//access: Private
router.post(
  "/course/new",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateCourseInput(req.body);
    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: "Validation failed", data: errors });
    }
    const newCourse = new Course({
      title: req.body.title,
      imageURL: req.body.imageURL,
      overview: req.body.overview,
      owner: req.user._id,
      modules: req.body.modules,
      slug: req.body.slug,
      subject: req.body.subject,
      class: req.body.class,
    });
    try {
      const savedCourse = await newCourse.save();
      return res.json({ success: true, message: "", data: savedCourse });
    } catch (err) {
      res.json({ success: false, message: err.message, data: null });
    }
  }
);

//@desc : update a course
//@route: PUT api/courses/course/courseId
//access: Private
router.put(
  "/update/:courseId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const course = await Course.findById({ _id: req.params.courseId });
      if (req.user._id !== course.owner && req.user.role !== "admin") {
        return res.status(401).json({
          success: false,
          message: "You are not allowed to update this course.",
          data: null,
        });
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        { _id: req.params.courseId },
        req.body,
        { new: true }
      );

      return res.json({ success: true, message: "", data: updatedCourse });
    } catch (err) {
      res.json({ success: false, message: err.message, data: null });
    }
  }
);

//@desc : delete a course
//@route: DELETE api/courses/course/courseId
//access: Private

router.delete(
  "/delete/:courseId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const course = await Course.findById({ _id: req.params.courseId });
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found", data: null });
      }
      if (req.user._id === course.owner || req.user.role === "admin") {
        await Module.deleteMany({ course: req.params.courseId });
        const deleteCount = await Course.deleteOne({
          _id: req.params.courseId,
        });

        return res.json({
          success: true,
          message: "Course delete successfully",
          data: deleteCount,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "You do not have permission to delete this course.",
          data: null,
        });
      }
    } catch (err) {
      res.json({ success: false, message: err.message, data: null });
    }
  }
);

//@desc : create a new module for  a course
//make sure user is the owner of the course
//@route: POST api/courses/modules/new/courseId
//access: Private
router.post(
  "/modules/new/:courseId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateModuleInput(req.body);
    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: "Validation error", data: errors });
    }
    try {
      const course = await Course.findById({ _id: req.params.courseId });

      if (!course) {
        return res
          .status(400)
          .json({ success: false, message: "Course not found.", data: null });
      }

      if (!course.owner === req.user._id && req.user.role !== "admin") {
        return res.status(400).json({
          success: false,
          message: "You are not allowed to edit this course.",
          data: null,
        });
      } else {
        const newModule = new Module({
          course: course._id,
          title: req.body.title,
          overview: req.body.overview,
          body: req.body.body,
        });
        const courseModules = course.modules;
        await newModule.save();
        courseModules.unshift(newModule);
        course.modules = courseModules;
        const savedCourse = await course.save();
        return res.json({
          success: true,
          message: "Module successfully created",
          data: savedCourse,
        });
      }
      Í;
    } catch (err) {
      res
        .status(404)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

//@desc : update a course module
//make sure user is the owner of the course
//@route: PUT api/courses/modules/update/:courseId/:moduleId
//access: Private

router.put(
  "/modules/update/:courseId/:moduleId",
  passport.authenticate("jwt", { session: false }),

  async (req, res) => {
    try {
      const course = await Course.findOne({ _id: req.params.courseId });
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found.", data: null });
      }
      if (!(req.user._id === course.owner) && !(req.user.role === "admin")) {
        return res.status(401).json({
          success: false,
          message: "Action not permitted for this user.",
          data: null,
        });
      }
      const moduleIndex = course.modules.indexOf(req.params.moduleId);
      if (moduleIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Module not found.", data: null });
      } else {
        const updatedModule = {
          title: req.body.title,
          overview: req.body.overview,
          body: req.body.body,
        };

        course.modules[moduleIndex] = updatedModule;
        await course.save();
        return res.json({ success: true, message: "", data: course });
      }
    } catch (err) {
      res
        .status(400)
        .json({ success: false, message: err.message, data: null });
    }
  }
);

module.exports = router;
