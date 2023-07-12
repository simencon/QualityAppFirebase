
// eslint-disable-next-line require-jsdoc
class UserModel {
  // eslint-disable-next-line require-jsdoc
  constructor(
      teamMemberId = null,
      email = null,
      phoneNumber = null,
      fullName = null,
      company = null,
      companyId = -1,
      department = null,
      departmentId = -1,
      subDepartment = null,
      subDepartmentId = -1,
      readLevel = -1,
      writeLevel = -1,
      appRole = -1,
      jobRole = null,
      restApiUrl = null,
      restApiToken = null,
      userUid = null,
  ) {
    this.user.teamMemberId = teamMemberId;
    this.user.email = email;
    this.user.phoneNumber = phoneNumber;
    this.user.fullName = fullName;
    this.user.company = company;
    this.user.companyId = companyId;
    this.user.department = department;
    this.user.departmentId = departmentId;
    this.user.subDepartment = subDepartment;
    this.user.subDepartmentId = subDepartmentId;
    this.user.readLevel = readLevel;
    this.user.writeLevel = writeLevel;
    this.user.appRole = appRole;
    this.user.jobRole = jobRole;
    this.user.restApiUrl = restApiUrl;
    this.user.restApiToken = restApiToken;
    this.user.userUid = userUid;

    this.getUser = () => {
      return this.user;
    };
  }
}

module.exports = UserModel;
