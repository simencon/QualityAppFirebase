const {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError,
} = require("firebase-functions/v2/identity");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const UserModel = require("./model/UserModel");
const {getAuth} = require("firebase-admin/auth");

admin.initializeApp();
const db = admin.firestore();
const adminUserEmail = "romansemenyshyn@gmail.com";

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
  return userToCreate.createUserOrCopyFromApi(db);
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
        return userToUpdate.updateUserDataProvidedByUser(db);
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
  const auth = getAuth();
  return db.doc(`companies/skf/users/${context.auth.uid}`)
      .get()
      .then((snap) => {
        auth.getUserByEmail(adminUserEmail)
            .then( (userRecord) => {
              auth.createCustomToken(userRecord.uid)
                  .then((customToken) => {
                    console.log("custom token is: ", customToken);
                    const principle = new UserModel(snap.data());
                    let tokenId = "";
                    principle.obtainTokenId(customToken).then((response) => {
                      tokenId = response.data;
                      console.log("token id is: ", tokenId);
                      return snap.data();
                    });
                  });
            });
      });
});
