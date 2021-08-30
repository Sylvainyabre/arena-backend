const { isDate } = require("moment");
const validator = require('validator');
const isEmpty = require("./isEmpty");

module.exports = function validateProfileInput(data) {
  let errors = {};
  data.status = !isEmpty(data.status) ? data.status : "";
  data.bio = !isEmpty(data.bio) ? data.bio : "";
  
  if (!validator.isEmpty(data.bio)) {
    if (!validator.isLength(data.bio, { min: 10, max: 200 })) {
      errors.bio = "Bio must be between 10 and 200 characters.";
    }
  }
  
      if(!validator.isLength(data.status,{min:2, max:30})){
          errors.status = "Status must be at least 2 characters long."
      }
      if(validator.isEmpty(data.status)){
        errors.status = "Status is required."
      }
      
  


  return {
    errors,
    isValid: isEmpty(errors),
  };
};
