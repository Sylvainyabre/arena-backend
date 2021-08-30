const roles = require("./roles");
const roles = require("./roles");

function isEnrolledIn(course, user) {
  user.enrollments.includes(course.id);
}

function canEditCourse(course, user) {
  return course.owner === user.id;
}

function canDeleteCourse(course, user) {
  return course.owner === user.id;
}

function canCreateCourse(user) {
  return user.role === roles.ADMIN || user.role === INSTRUCTOR;
}

module.exports = {
  isEnrolledIn,
  canCreateCourse,
  canDeleteCourse,
  canEditCourse,
};
