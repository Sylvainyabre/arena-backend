const express = require("express");
const router = express.Router();
const Module = require("../models/Module");
//S3 file upload with multer
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile, getFileStream } = require("../config/s3");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

//Get all modules
router.get("/getAll", async (req, res) => {
  try {
    const modules = await Module.find();
    res.json(modules);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//Get one module
router.get("/getModules/:moduleId", async (req, res) => {
  try {
    const module = await Module.findById({ _id: req.params.moduleId });
    res.json(module);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//Create a new module
router.post("/create", async (req, res) => {
  const newModule = new Module({
    course: req.body.course,
    title: req.body.title,
    overview: req.body.overview,
    body:req.body.body
  });
  try {
    const savedModule = await newModule.save();
    res.json(savedModule);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//Update a module
router.put("/update/:moduleId", async (req, res) => {
  try {
    const updatedModule = await Module.findByIdAndUpdate(
      { _id: req.params.moduleId },
      {
        $set: {
    
          title: req.body.title,
          overview: req.body.overview,
          body:req.body.body
        },
      },
      res.json(updatedModule)
    );
  } catch (err) {
    res.json({ message: err.message });
  }
});

//Delete a module

router.delete("/delete/:moduleId", async (req, res) => {
  try {
    const deletedModule = await Module.remove({ _id: req.params.moduleId });
    res.json(deletedModule);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//Upload file to S3
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const uploadResult = await uploadFile(file);
    const jsonImagePath = {
      imagePath: `https://brain-arena.herokuapp.com/api/modules/images/${uploadResult.Key}`,
    };
    await unlinkFile(file.path);
    return res.json(jsonImagePath);
  } catch (error) {
    res.json({ message: error.message });
  }
});

//Get image from S3
router.get("/images/:key", async (req, res) => {
  const key = req.params.key;

  try {
    const readStream = getFileStream(key);
    return readStream.pipe(res);
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router;
