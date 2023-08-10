// const axios = require("axios");
// const apiUrl = "https://qualityappspring.azurewebsites.net/api/v1";
const noRecordNum = -1;

// eslint-disable-next-line require-jsdoc
function Principle() {
  this.email = null;
  this.teamMemberId = null;
  this.phoneNumber = null;
  this.fullName = null;
  this.company = null;
  this.companyId = noRecordNum;
  this.department = null;
  this.departmentId = noRecordNum;
  this.subDepartment = null;
  this.subDepartmentId = noRecordNum;
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

  this.copyFromInstance = function(instance) {
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

  this.updateOnlyUserData = function(instance) {
    this.phoneNumber = instance.phoneNumber;
    this.fullName = instance.fullName;
    this.userUid = instance.userUid;
    this.isEnabled = instance.isEnabled;
  };

  this.clearUserRelatedData = function(instance) {
    instance.phoneNumber = null;
    instance.fullName = null;
    instance.userUid = null;
    instance.isEnabled = false;
    return instance;
  };

  this.createUserDocOrUpdateDocWithUserData = function(db) {
    console.log("the doc id is:", this.email);
    return db
        .doc(`companies/skf/users/${this.email}`)
        .get()
        .then((snap) => {
          const principle = new Principle().copyFromInstance(snap.data());
          principle.updateOnlyUserData(this.data());
          this.copyFromInstance(principle);
          this.savePrincipleDoc(db);
        })
        .catch((error) => {
          console.log("user not exists", error);
          this.savePrincipleDoc(db);
        });
  };

  this.savePrincipleDoc = function(db) {
    console.log("principle data before actions: ", this.data());
    return db
        .doc(`companies/skf/users/${this.email}`)
        .set(this.data())
        .then((/* timeStamp*/) => {
          return this.data();
        })
        .catch((error) => {
          throw error;
        });
  };

  this.clearUserDocFromUserData = function(db) {
    console.log("the doc id is:", this.email);
    return db
        .doc(`companies/skf/users/${this.email}`)
        .get()
        .then((snap) => {
          const principle = new Principle().copyFromInstance(snap.data());
          principle.clearUserRelatedData(this.data());
          this.copyFromInstance(principle);
          this.updatePrincipleDoc(db);
        })
        .catch((error) => {
          throw error;
        });
  };

  this.updateDocWithUserData = function(db) {
    return db
        .doc(`companies/skf/users/${this.email}`)
        .get()
        .then((snap) => {
          const principle = snap.data();
          principle.updateOnlyUserData(this.data());
          this.copyFromInstance(principle);
          this.updatePrincipleDoc(db);
        })
        .catch((error) => {
          throw error;
        });
  };

  this.updatePrincipleDoc = function(db) {
    console.log("principle data before actions: ", this.data());
    return db
        .doc(`companies/skf/users/${this.email}`)
        .update(this.data())
        .then((/* timeStamp*/) => {
          return this.data();
        })
        .catch((error) => {
          throw error;
        });
  };

  this.getPrincipleDoc = function(db) {
    console.log("principle data before actions: ", this.data());
    return db
        .doc(`companies/skf/users/${this.email}`)
        .get(this.data())
        .then((snap) => {
          return snap.data();
        })
        .catch((error) => {
          throw error;
        });
  };
}

module.exports = Principle;
