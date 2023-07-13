// eslint-disable-next-line require-jsdoc
function EmptyUser() {
  this.id = -1;
  this.teamMemberId = null;
  this.email = null;
  this.phoneNumber = null;
  this.fullName = null;
  this.company = null;
  this.companyId = -1;
  this.department = null;
  this.departmentId = -1;
  this.subDepartment = null;
  this.subDepartmentId = -1;
  this.readLevel = -1;
  this.writeLevel = -1;
  this.appRole = -1;
  this.jobRole = null;
  this.restApiUrl = null;
  this.restApiToken = null;
  this.userUid = null;
}

module.exports = EmptyUser;
