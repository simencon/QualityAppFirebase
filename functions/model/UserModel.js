const axios = require("axios");
const apiUrl = "https://qualityappspring.azurewebsites.net/api/v1";

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

  this.data = JSON.parse(JSON.stringify(this));

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

  this.updateUserOnApi = function() {
    return axios.put(`${apiUrl}/firebaseUsers/${this.id}`, this.data)
        .then((response) => {
          console.log("response is: ", response.data);
        })
        .catch((error) => {
          console.log("error is: ", error.response.data);
        });
  };

  this.createUserOnApi = function(db) {
    return axios.post(`${apiUrl}/firebaseUsers`, this.data)
        .then((response) => {
          console.log("response code is: ", response.status);
          console.log("response is: ", response.data);
          db
              .doc(`companies/skf/users/${this.userUid}`)
              .update({id: response.data.id})
              .then((ref) => {
                console.log(ref);
              })
              .catch((error) => {
                console.log(error);
              });
        })
        .catch((error) => {
          console.log("error is: ", error.response.data);
        });
  };
}

module.exports = EmptyUser;
