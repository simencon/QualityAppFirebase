const {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError,
} = require("firebase-functions/v2/identity");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const UserModel = require("./model/Principle");
// const {getAuth} = require("firebase-admin/auth");

admin.initializeApp();
const db = admin.firestore();
// const superUserUid = "seNJ7oCrP0SS5Eb3iakOA1oYpNi1";

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
  const userToCreate = new UserModel();
  userToCreate.userUid = user.uid;
  return userToCreate.createUserDocOrUpdateDocWithLongTermData(db, user.email);
});

exports.userDeleted = functions.auth.user().onDelete((user) => {
  const userToClear = new UserModel();
  return userToClear.clearUserDocFromLongTermData(db, user.email);
});

exports.updateUserData = functions.https.onCall( (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }

  const userToUpdate = new UserModel();
  userToUpdate.phoneNumber = data.phoneNumber;
  userToUpdate.fullName = data.fullName;
  userToUpdate.company = data.company;
  userToUpdate.department = data.department;
  userToUpdate.subDepartment = data.subDepartment;
  userToUpdate.jobRole = data.jobRole;
  userToUpdate.isEmailVerified = data.isEmailVerified;
  return userToUpdate.updateDocWithUserData(db, context.auth.token.email);
});

exports.getUserData = functions.https.onCall( (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }
  const userToRead = new UserModel();
  return userToRead.getPrincipleDoc(db, context.auth.token.email);
});
