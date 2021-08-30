const isEmpty = require("./isEmpty");
const validator  = require('validator');

module.exports = function validateModuleInput(data) {
  const errors = {};
  
  data.title = !isEmpty(data.title) ? data.title : "";
  data.overview = !isEmpty(data.overview) ? data.overview : "";
  data.body = !isEmpty(data.body) ? data.body : "";
  
  if (validator.isEmpty(data.title)) {
    errors.title = "Title required for this course.";
  }
  if (validator.isEmpty(data.overview)) {
    errors.overview = "An overview is required.";
  }
  if (validator.isEmpty(data.body)) {
    errors.body = "Content is required for this module.";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
