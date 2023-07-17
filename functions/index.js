const {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError,
} = require("firebase-functions/v2/identity");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const UserModel = require("./model/UserModel");

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

exports.newUserSignup = functions.auth.user().onCreate((user) => {
  const userToCreate = new UserModel();
  userToCreate.email = user.email;
  userToCreate.userUid = user.uid;
  return userToCreate.createUser(db);
});

exports.updateUserData = functions.https.onCall( (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }

  return db.doc(`companies/skf/users/${context.auth.uid}`)
      .get()
      .then((snap) => {
        const userToUpdate = new UserModel().initFromInstance(snap.data());
        userToUpdate.fullName = data.fullName;
        userToUpdate.department = data.department;
        userToUpdate.subDepartment = data.subDepartment;
        userToUpdate.jobRole = data.jobRole;
        return userToUpdate.updateUser(db);
      });
});

exports.userDeleted = functions.auth.user().onDelete((user) => {
  return db.doc(`companies/skf/users/${user.uid}`).delete();
});

exports.getUserData = functions.https.onCall( (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }
  return db.doc(`companies/skf/users/${context.auth.uid}`)
      .get()
      .then((snap) => {
        return snap.data();
      });
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
          .collection("companies/skf/usersInfoLog")
          .where("email", "==", data.email)
          .get();
      if (snapshot.empty) {
        return db
            .collection("companies/skf/usersInfoLog")
            .add(data)
            .then((record) => {
              return data;
            });
      } else {
        const updatePromises = [];
        snapshot.forEach((doc) => {
          updatePromises.push(
              db
                  .collection("companies/skf/usersInfoLog")
                  .doc(doc.id)
                  .update(data));
        });
        return Promise.all(updatePromises).then((records) => {
          data.result = "user data logged";
          return data;
        });
      }
    });
