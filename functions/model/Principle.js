const axios = require("axios");
const apiUrl = "https://qualityappspring.azurewebsites.net/api/v1";

// eslint-disable-next-line require-jsdoc
function Principle() {
  this.email = null;
  this.teamMemberId = null;
  this.phoneNumber = null;
  this.fullName = null;
  this.company = null;
  this.companyId = -1;
  this.department = null;
  this.departmentId = -1;
  this.subDepartment = null;
  this.subDepartmentId = -1;
  this.jobRole = null;
  this.restApiUrl = null;
  this.userUid = null;
  this.roles = null;
  this.isAccountNonExpired = false;
  this.isAccountNonLock = false;
  this.isCredentialsNonExpired = false;
  this.isEnabled = false;

  this.data = function() {
    return JSON.parse(JSON.stringify(this));
  };

  this.initFromInstance = function(instance) {
    this.email = instance.email;
    this.teamMemberId = instance.teamMemberId;
    this.phoneNumber = instance.phoneNumber;
    this.fullName = instance.fullName;
    this.company = instance.company;
    this.companyId = instance.companyId;
    this.department = instance.department;
    this.departmentId = instance.departmentId;
    this.subDepartment = instance.subDepartment;
    this.subDepartmentId = instance.subDepartmentId;
    this.jobRole = instance.jobRole;
    this.restApiUrl = instance.restApiUrl;
    this.userUid = instance.userUid;
    this.roles = instance.roles;
    this.isAccountNonExpired = instance.isAccountNonExpired;
    this.isAccountNonLock = instance.isAccountNonLock;
    this.isCredentialsNonExpired = instance.isCredentialsNonExpired;
    this.isEnabled = instance.isEnabled;
    return this;
  };

  this.createUserOrCopyFromApi = function(db) {
    return axios.post(`${apiUrl}/firebaseUsers`, this.data())
        .then((response) => {
          return db
              .doc(`companies/skf/users/${response.data.userUid}`)
              .set(response.data)
              .then((timeStamp) => {
                return response.data;
              })
              .catch((error) => {
                throw error;
              });
        })
        .catch((error) => {
          throw error;
        });
  };

  this.updateUserDataProvidedByUser = function(db) {
    const docRef = db.doc(`companies/skf/users/${this.userUid}`);
    return axios.put(`${apiUrl}/firebaseUsers/${this.id}`, this.data())
        .then((response) => {
          return docRef
              .update(response.data)
              .then((timeStamp) => {
                return response.data;
              })
              .catch((error) => {
                throw error;
              });
        })
        .catch((error) => {
          throw error;
        });
  };
}

module.exports = Principle;
