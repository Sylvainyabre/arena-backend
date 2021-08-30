const validator = require("validator");
const isEmpty = require("./isEmpty");

function validateEducationInput(data) {
  const errors = {};
  data.from = !isEmpty(data.from) ? data.from : "";
  data.to = !isEmpty(data.to) ? data.to : "";
  data.institution = !isEmpty(data.institution) ? data.institution : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";

  if (validator.isEmpty(data.from.toString())) {
    errors.from = "Must provide a valid start date.";
  }
  if (validator.isEmpty(data.to.toString())) {
    errors.to = "Must provide a valid end date of study.";
  }
  if (validator.isEmpty(data.institution)) {
    errors.institution = "Institution name is required. ";
  }
  if (validator.isEmpty(data.degree)) {
    errors.degree = "Degree name is required. ";
  }
  

  return {
    errors,
    isValid: isEmpty(errors),
  };
}
module.exports = validateEducationInput;