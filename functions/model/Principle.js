// const axios = require("axios");
// const apiUrl = "https://qualityappspring.azurewebsites.net/api/v1";
const noRecordNum = -1;

// eslint-disable-next-line require-jsdoc
function Principle() {
  this.teamMemberId = noRecordNum;
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
  this.accountNonExpired = false;
  this.accountNonLocked = false;
  this.credentialsNonExpired = false;
  this.enabled = false;

  this.data = function() {
    return JSON.parse(JSON.stringify(this));
  };

  // this.dataWithId = function() {
  //   const principleData = JSON.parse(JSON.stringify(this));
  //   return JSON.parse(JSON.stringify(this));
  // };

  this.copyFromInstance = function(instance) {
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
    this.accountNonExpired = instance.accountNonExpired;
    this.accountNonLocked = instance.accountNonLocked;
    this.credentialsNonExpired = instance.credentialsNonExpired;
    this.enabled = instance.enabled;
    return this;
  };

  this.updateUserInitialData = function(instance) {
    this.phoneNumber = instance.phoneNumber;
    this.fullName = instance.fullName;
    this.company = instance.company;
    this.department = instance.department;
    this.subDepartment = instance.subDepartment;
    this.jobRole = instance.jobRole;
    this.userUid = instance.userUid;
    this.enabled = instance.enabled;
    return this;
  };

  this.updateUserLongTerm = function(instance) {
    this.userUid = instance.userUid;
    this.enabled = instance.enabled;
    return this;
  };

  this.createUserDocOrUpdateDocWithLongTermData = function(db, docId) {
    return db
        .doc(`companies/skf/users/${docId}`)
        .get()
        .then((snap) => {
          const principle = new Principle().copyFromInstance(snap.data());
          principle.updateUserLongTerm(this.data());
          this.copyFromInstance(principle);
          return this.savePrincipleDoc(db, docId);
        })
        .catch(() => {
          this.savePrincipleDoc(db, docId);
        });
  };

  this.clearUserDocFromLongTermData = function(db, docId) {
    console.log("user to clear: ", docId);
    return db
        .doc(`companies/skf/users/${docId}`)
        .get()
        .then((snap) => {
          const principle = new Principle().copyFromInstance(snap.data());
          principle.updateUserLongTerm(this.data());
          this.copyFromInstance(principle);
          return this.savePrincipleDoc(db, docId);
        })
        .catch((error) => {
          throw error;
        });
  };

  this.updateDocWithUserData = function(db, docId) {
    return db
        .doc(`companies/skf/users/${docId}`)
        .get()
        .then((snap) => {
          const principle = new Principle().copyFromInstance(snap.data());
          this.userUid = principle.userUid;
          this.enabled = principle.enabled;
          principle.updateUserInitialData(this.data());
          this.copyFromInstance(principle);
          return this.savePrincipleDoc(db, docId);
        })
        .catch((error) => {
          throw error;
        });
  };

  this.getPrincipleDoc = function(db, docId) {
    return db
        .doc(`companies/skf/users/${docId}`)
        .get(this.data())
        .then((snap) => {
          const principle = this.copyFromInstance(snap.data());
          return principle.data();
        })
        .catch((error) => {
          throw error;
        });
  };

  this.savePrincipleDoc = function(db, docId) {
    return db
        .doc(`companies/skf/users/${docId}`)
        .set(this.data())
        .then((/* timeStamp*/) => {
          return this.data();
        })
        .catch((error) => {
          throw error;
        });
  };
}

module.exports = Principle;
