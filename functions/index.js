const {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError,
} = require("firebase-functions/v2/identity");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

const emptyUser = {
  teamMemberId: null,
  email: null,
  phoneNumber: null,
  fullName: null,
  company: null,
  companyId: -1,
  department: null,
  departmentId: -1,
  subDepartment: null,
  subDepartmentId: -1,
  readLevel: -1,
  writeLevel: -1,
  appRole: -1,
  jobRole: null,
  restApiUrl: null,
  restApiToken: null,
  userUid: null,
};

exports.validatenewuser = beforeUserCreated(async (event) => {
  const company = "skf";
  const email = event.data.email || "";

  const externalEmails = await db
      .collection("companies")
      .doc(company)
      .collection("externalEmails")
      .where("email", "==", email)
      .get();
  if (externalEmails.empty && !email.includes("@skf.com")) {
    throw new HttpsError(
        "invalid-argument", "Unauthorized email");
  }
});

exports.checkforban = beforeUserSignedIn(async (event) => {
  const company = "skf";
  const email = event.data.email || "";
  const bannedEmails = await db
      .collection("companies")
      .doc(company)
      .collection("bannedEmails")
      .where("email", "==", email)
      .get();

  if (!bannedEmails.empty) {
    throw new HttpsError("invalid-argument", "User has been disabled");
  }
});

exports.newUserSignup = functions.auth.user().onCreate((user) => {
  const company = "skf";
  return db.collection("companies")
      .doc(company)
      .collection("users")
      .doc(user.uid)
      .set({
        id: -1,
        teamMemberId: -1,
        email: user.email,
        phoneNumber: null,
        fullName: user.displayName,
        company: null,
        companyId: -1,
        department: null,
        departmentId: -1,
        subDepartment: null,
        subDepartmentId: -1,
        readLevel: -1,
        writeLevel: -1,
        appRole: -1,
        jobRole: null,
        restApiUrl: null,
        restApiToken: null,
        userUid: user.uid,
        devicesTokens: [],
      });
});

exports.userDeleted = functions.auth.user().onDelete((user) => {
  const company = "skf";
  const doc = db
      .collection("companies")
      .doc(company)
      .collection("users")
      .doc(user.uid);
  return doc.delete();
});

exports.logUserData = functions
    .https
    .onCall(async (data, context) => {
      if (!context.auth.uid) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "only authenticated users can add request",
        );
      }
      const snapshot = await db
          .collection("companies")
          .doc("skf")
          .collection("usersInfoLog")
          .where("email", "==", data.email)
          .get();
      if (snapshot.empty) {
        return db
            .collection("companies")
            .doc("skf")
            .collection("usersInfoLog")
            .add(
                data,
            ).then((record) => {
              return data;
            });
      } else {
        const updatePromises = [];
        snapshot.forEach((doc) => {
          updatePromises.push(
              db
                  .collection("companies")
                  .doc("skf")
                  .collection("usersInfoLog")
                  .doc(doc.id)
                  .update(
                      data,
                  ),
          );
        });
        return Promise.all(updatePromises).then((records) => {
          data.result = "user data logged";
          return data;
        });
      }
    });

exports.updateUserData = functions.https.onCall(async (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }

  const snapshot = await db.collection("companies")
      .doc("skf")
      .collection("users")
      .where("email", "==", data.email)
      .get();
  const updatePromises = [];

  snapshot.forEach((doc) => {
    updatePromises.push(
        db
            .collection("companies")
            .doc("skf")
            .collection("users")
            .doc(doc.id)
            .update({
              fullName: data.fullName,
              department: data.department,
              subDepartment: data.subDepartment,
              jobRoles: data.jobRoles,
            }),
    );
  });

  return Promise
      .all(updatePromises)
      .then((timeStamp) => {
        return {
          result: "user data updated",
          email: data.email,
          fullName: data.fullName,
          department: data.department,
          subDepartment: data.subDepartment,
          jobRoles: data.jobRoles,
        };
      });
});

exports.getUserData = functions.https.onCall( (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }
  return db.collection("companies")
      .doc("skf")
      .collection("users")
      .where("email", "==", data.email)
      .get()
      .then((ref) => {
        return ref.docs.map((doc) => doc.data())[0];
      });
});

exports.createFirebaseUser = functions
    .firestore.document("companies/skf/users/{fullName}")
    .onUpdate((snap, context) => {
      const userData = snap.after.data();
      const userToPost = emptyUser;

      userToPost.email = userData.email;
      userToPost.fullName = userData.fullName;
      userToPost.department = userData.department;
      userToPost.subDepartment = userData.subDepartment;
      userToPost.jobRole = userData.jobRole;
      userToPost.userUid = userData.userUid;

      console.log("before post", userToPost);

      return axios.post("https://qualityappspring.azurewebsites.net/api/v1/firebaseUsers", userToPost.getUser())
          .then((response) => {
            console.log("response code is: ", response.status);
            console.log("response is: ", response.data);
          })
          .catch((error) => {
            console.log("error is: ", error.response.data);
          });
    });
