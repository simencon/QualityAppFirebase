const axios = require("axios");
const apiUrl = "https://qualityappspring.azurewebsites.net/api/v1";

// eslint-disable-next-line require-jsdoc
function UserModel() {
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

  this.data = function() {
    return JSON.parse(JSON.stringify(this));
  };

  this.initFromInstance = function(instance) {
    this.id = instance.id;
    this.teamMemberId = instance.teamMemberId;
    this.email = instance.email;
    this.phoneNumber = instance.phoneNumber;
    this.fullName = instance.fullName;
    this.company = instance.company;
    this.companyId = instance.companyId;
    this.department = instance.department;
    this.departmentId = instance.departmentId;
    this.subDepartment = instance.subDepartment;
    this.subDepartmentId = instance.subDepartmentId;
    this.readLevel = instance.readLevel;
    this.writeLevel = instance.writeLevel;
    this.appRole = instance.appRole;
    this.jobRole = instance.jobRole;
    this.restApiUrl = instance.restApiUrl;
    this.restApiToken = instance.restApiToken;
    this.userUid = instance.userUid;
    return this;
  };

  this.updateUserOnApi = function(db) {
    console.log("user to update: ", this.data());
    return new Promise((resolve, reject) => {
      axios.put(`${apiUrl}/firebaseUsers/${this.id}`, this.data())
          .then((response) => {
            console.log("response is: ", response.data);
            return db
                .doc(`companies/skf/users/${this.userUid}`)
                .update(this.data())
                .then((timeStamp) => {
                  resolve("success");
                  return {
                    result: "user data updated",
                    email: this.email,
                    fullName: this.fullName,
                    department: this.department,
                    subDepartment: this.subDepartment,
                    jobRole: this.jobRole,
                  };
                })
                .catch((error) => {
                  console.log(error);
                  reject(Error("not stored by restApi"));
                });
          })
          .catch((error) => {
            console.log("error is: ", error.response.data);
            reject(Error("not updated by restApi"));
          });
    });
  };

  this.createUserOnApi = function(db) {
    console.log("user to create: ", this.data());
    return new Promise((resolve, reject) => {
      axios.post(`${apiUrl}/firebaseUsers`, this.data())
          .then(async (response) => {
            console.log("response code is: ", response.status);
            console.log("response is: ", response.data);
            await db
                .doc(`companies/skf/users/${this.userUid}`)
                .set(response.data)
                .then((ref) => {
                  console.log(ref);
                  resolve("success");
                })
                .catch((error) => {
                  console.log(error);
                  reject(Error("not stored by Firebase"));
                });
          })
          .catch((error) => {
            console.log("error is: ", error.response.data);
            reject(Error("not stored by restApi"));
          });
    });
  };
}

module.exports = UserModel;
