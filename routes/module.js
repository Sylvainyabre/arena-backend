const express = require("express");
const router = express.Router();
const Module = require("../models/Module");
passport = require("passport");
//S3 file upload with multer
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile, getFileStream } = require("../config/s3");
const fs = require("fs");
const util = require("util");
const passport = require("passport");
const unlinkFile = util.promisify(fs.unlink);

//Get all modules
router.get("/getAll", async (req, res) => {
  try {
    const modules = await Module.find();
    return res.json({ success: true, message: "", data: modules });
  } catch (err) {
    res.json({ success: false, message: err.message, data: null });
  }
});

//Get one module
router.get("/getModules/:moduleId", async (req, res) => {
  try {
    const module = await Module.findById({ _id: req.params.moduleId });
    res.json(module);
  } catch (err) {
    res.json({ success: false, message: err.message, data: null });
  }
});

//Create a new module
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const newModule = new Module({
      course: req.body.course,
      title: req.body.title,
      overview: req.body.overview,
      body: req.body.body,
    });
    try {
      const savedModule = await newModule.save();
      return res.json({ success: true, message: "", data: savedModule });
    } catch (err) {
      res.json({ success: false, message: err.message, data: null });
    }
  }
);

//Update a module
router.put(
  "/update/:moduleId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const updateData = {
      title: req.body.title,
      overview: req.body.overview,
      body: req.body.body,
    };
    try {
      const updatedModule = await Module.findByIdAndUpdate(
        { _id: req.params.moduleId },
        updateData,
        { new: true }
      );
      return res.json({ success: true, message: "", data: updatedModule });
    } catch (err) {
      res.json({ success: false, message: err.message, data: null });
    }
  }
);

//Delete a module

router.delete(
  "/delete/:moduleId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const deletedModule = await Module.remove({ _id: req.params.moduleId });
      res.json(deletedModule);
    } catch (err) {
      res.json({ success: false, message: err.message, data: null });
    }
  }
);

//Upload file to S3
router.post(
  "/upload",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      const uploadResult = await uploadFile(file);
      const jsonImagePath = {
        imagePath: `${req.protocol}://${req.get('host')}${req.originalUrl}/${uploadResult.Key}`,
      };
      await unlinkFile(file.path);
      return res.json({
        success: true,
        message: "image uploaded successfully",
        data: jsonImagePath,
      });
    } catch (error) {
      res.json({ success: false, message: error.message, data: null });
    }
  }
);

//Get image from S3
router.get("/images/:key", async (req, res) => {
  const key = req.params.key;

  try {
    const readStream = getFileStream(key);
    return readStream.pipe(res);
  } catch (err) {
    res.json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
