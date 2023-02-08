const roles = require("./roles");


function isEnrolledIn(courseId, user) {
  user.enrollments.includes(courseId);
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
