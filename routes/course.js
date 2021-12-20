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
// access: Public

router.get("/all", async (req, res) => {
  try {
    const courses = await Course.find().populate('modules');
    if (!courses) {
      return res.status(404).json();
    }
    res.json(courses);
  } catch (err) {
    res.json({ message: err.message });
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
      const course = await Course.findById({ _id: req.params.courseId }).populate('modules');
      if (!course) {
        return res
          .status(404)
          .json({ message: "Course not found ." });
      }
      if (!req.user.enrollments.includes(course._id)) {
        return res
          .status(401)
          .json({ message: "You must be enrolled in this course." });
      }
      res.json(course);
    } catch (err) {
      res.json({ message: err.message });
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
        return res.status(400).json({ message: "No user found." });
      }
      if (!course) {
        return res.status(400).json({ message: "No course found ." });
      }
      if (user.enrollments.includes(req.params.courseId)) {
        return res
          .status(404)
          .json({ message: "You are already enrolled in this course" });
      } else {
        const userEnrollments = user.enrollments;
        userEnrollments.unshift(course._id);
        //const newEnrollments = user.enrollments.unshift(course._id)
        user.enrollments = userEnrollments;
        console.log(userEnrollments);
        await user.save();
        res.redirect("/api/profile/");
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
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
        return res.status(400).json({ message: "Course not found." });
      }
      if (!user.enrollments.includes(course)) {
        return res
          .status(400)
          .json({ message: "You are not enrolled in this course." });
      } else {
        const newEnrollments = user.enrollments.filter(
          (course) => course._id !== req.params.courseId
        );
        user.enrollments = newEnrollments;
        await user.save();
        return res.json(user);
      }
    } catch (err) {
      res.json({ message: err.message });
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
      return res.status(400).json(errors);
    }
    const newCourse = new Course({
      title: req.body.title,
      overview: req.body.overview,
      owner: req.user._id,
      modules: req.body.modules,
      slug: req.body.slug,
    });
    try {
      const savedCourse = await newCourse.save();
      res.json(savedCourse);
    } catch (err) {
      res.json({ message: err.message });
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
        return res
          .status(400)
          .json({ message: "You are not allowed to update this course." });
      }
      const updatedCourse = await Course.findByIdAndUpdate(
        { _id: req.params.courseId },
        {
          $set: {
            title: req.body.title,
            overview: req.body.overview,
            owner: req.user._id,
            modules: req.body.modules,
            slug: req.body.slug,
            isPublished:req.body.isPublished?req.body.isPublished:true
          },
        },
        res.json(updatedCourse)
      );
    } catch (err) {
      res.json({ message: err.message });
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
      if (req.user.id === course.owner) {
        await Course.remove({ _id: req.params.courseId });
        req.flash("success", "Course deleted successfully!");
        return res.redirect("/api/courses/all");
      } else {
        res.status(400).json({
          message: "You do not have permission to delete this course.",
        });
      }
    } catch (err) {
      res.json({ message: err.message });
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
      return res.status(400).json(errors);
    }
    try {
      const course = await Course.findById({ _id: req.params.courseId });

      if (!course) {
        return res.status(400).json({ message: "Course not found." });
      }

      if (!course.owner === req.user._id && req.user.role !== "admin") {
        return res
          .status(400)
          .json({ message: "You are not allowed to edit this course." });
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
        return res.json(savedCourse);
      }
    } catch (err) {
      res.status(404).json({ message: err.message });
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
        return res.status(404).json({ message: "Course not found." });
      }
      if (req.user._id !== course.owner && req.user.role !== "admin") {
        return res
          .status(400)
          .json({ message: "Action not permitted for this user." });
      }
      const moduleIndex = course.modules.indexOf(req.params.moduleId);
      if (moduleIndex === -1) {
        return res.status(404).json({ message: "Module not found." });
      } else {
        const module = course.modules[moduleIndex];
        

        const updatedModule = {
          title: req.body.title ? req.body.title : module.title,
          overview: req.body.overview ? req.body.overview : module.overview,
          course: course._id,
          body: req.body.body ? req.body.body : module.body,
        };

        course.modules[moduleIndex] = updatedModule;
        await course.save();
        res.json(course);
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

module.exports = router;
