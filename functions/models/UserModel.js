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
    const user = {};
    user.teamMemberId = teamMemberId;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.fullName = fullName;
    user.company = company;
    user.companyId = companyId;
    user.department = department;
    user.departmentId = departmentId;
    user.subDepartment = subDepartment;
    user.subDepartmentId = subDepartmentId;
    user.readLevel = readLevel;
    user.writeLevel = writeLevel;
    user.appRole = appRole;
    user.jobRole = jobRole;
    user.restApiUrl = restApiUrl;
    user.restApiToken = restApiToken;
    user.userUid = userUid;

    this.getUser = () => {
      return user;
    };
  }
}

module.exports = UserModel;
