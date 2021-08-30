const isEmpty = require("./isEmpty");
const validator = require('validator');

module.exports = function validateCourseInput(data) {
  const errors = {};
  data.title = !isEmpty(data.title) ? data.title : "";
  data.overview = !isEmpty(data.overview) ? data.overview : "";
  data.owner = !isEmpty(data.owner) ? data.owner : "";

  if (validator.isEmpty(data.title)) {
    errors.title = "Title is required for this course.";
  }
  if (validator.isEmpty(data.overview)) {
    errors.overview = "An overview is required for this course.";
  }
  if (!validator.isLength(data.overview, { min: 10, max: 200 })) {
    errors.overview = "Overview must be at least 10 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
