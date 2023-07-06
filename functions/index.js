const {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError,
} = require("firebase-functions/v2/identity");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

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

const functions = require("firebase-functions");

exports.newUserSignup = functions.auth.user().onCreate((user) => {
  const company = "skf";
  return db.collection("companies")
      .doc(company)
      .collection("users")
      .doc(user.uid)
      .set({
        email: user.email,
        userDisplayName: user.displayName,
        userCompany: null,
        userDepartment: null,
        userSubDepartment: null,
        userJobRole: [],
        userReadLevel: 0,
        userWriteLevel: 0,
        restApiUrl: null,
        userDevicesTokens: [],
        userPasswordSalt: user.passwordSalt,
        userPasswordHash: user.passwordHash,
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

exports.addRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }
  if (data.userJobRole.length > 30) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "request must be no more than 30 characters long",
    );
  }
  await db.collection("requests").add({
    text: data.userJobRole,
    upvote: 0,
  })
      .then((doc) => {
        console.log("doc", doc);
        return {
          result: doc,
        };
      });
});

exports.updateUserData = functions.https.onCall( async (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }
  if (data.userJobRole.length > 30) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "request must be no more than 30 characters long",
    );
  }
  const snapshot = await db.collection("companies")
      .doc("skf")
      .collection("users")
      .where("email", "==", data.email)
      .get();
  const updatePromises = [];
  const userJobRoles = [];
  data.userJobRole.forEach( (role) => {
    console.log("role", role);
    userJobRoles.push(role);
  },
  );
  snapshot.forEach( (doc) => {
    updatePromises.push(
        db
            .collection("companies")
            .doc("skf")
            .collection("users")
            .doc(doc.id)
            .update({
              userDisplayName: data.userDisplayName,
              userDepartment: data.userDepartment,
              userSubDepartment: data.userSubDepartment,
              userJobRole: [userJobRoles],
            }),
    );
  },
  );
  return Promise
      .all(updatePromises)
      .then((timeStamp) => {
        return {
          result: "user data updated",
          email: data.email,
          fullName: data.userDisplayName,
          department: data.userDepartment,
          subDepartment: data.userSubDepartment,
          jobRoles: [userJobRoles],
        };
      });
});
