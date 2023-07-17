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

  this.createUser = function(db) {
    return axios.post(`${apiUrl}/firebaseUsers`, this.data())
        .then((response) => {
          return db
              .doc(`companies/skf/users/${response.data.userUid}`)
              .set(response.data)
              .then((timeStamp) => {
                return response.data;
              })
              .catch((error) => {
                return error;
              });
        })
        .catch((error) => {
          if (error.response.data.message.includes(" recordId: ")) {
            this.id = parseInt(error.response.data.message.match(/\d+/g)[0]);
            console.log("user exists on Api, id: ", this.id);
            return this.updateUserUidOnly(this.userUid, db);
          }
          return error.response.data;
        });
  };

  this.updateUser = function(db) {
    return axios.put(`${apiUrl}/firebaseUsers/${this.id}`, this.data())
        .then((response) => {
          const docRef = db.doc(`companies/skf/users/${response.data.userUid}`);
          return docRef.get().then((doc) => {
            if (doc.exists) {
              if (doc.data().fullName == null) {
                return docRef
                    .update(response.data)
                    .then((timeStamp) => {
                      return response.data;
                    })
                    .catch((error) => {
                      return error;
                    });
              } else {
                return doc.data();
              }
            } else {
              return docRef
                  .set(response.data)
                  .then((timeStamp) => {
                    return response.data;
                  })
                  .catch((error) => {
                    return error;
                  });
            }
          }).catch((error) => {
            return error;
          });
        })
        .catch((error) => {
          return error.response.data;
        });
  };

  this.updateUserUidOnly = function(userUid, db) {
    return axios.get(`${apiUrl}/firebaseUsers/${this.id}`)
        .then((response) => {
          this.initFromInstance(response.data);
          this.userUid = userUid;
          console.log("user to be updated: ", this.data());
          return this.updateUser(db);
        })
        .catch((error) => {
          return error.response.data;
        });
  };
}

module.exports = UserModel;
