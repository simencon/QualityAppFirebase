const {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError,
} = require("firebase-functions/v2/identity");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const UserModel = require("./model/Principle");
const FcmTokenModel = require("./model/FcmToken");
// const {getAuth} = require("firebase-admin/auth");

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
  userToCreate.userUid = user.uid;
  return userToCreate.createUserDocOrUpdateDocWithLongTermData(db, user.email);
});

exports.userDeleted = functions.auth.user().onDelete((user) => {
  const userToClear = new UserModel();
  return userToClear.clearUserDocFromLongTermData(db, user.email);
});

exports.updateUserData = functions.https.onCall((data, context) => {
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

exports.getUserData = functions.https.onCall((data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }
  const userToRead = new UserModel();
  return userToRead.getPrincipleDoc(db, context.auth.token.email);
});

exports.createFcmToken = functions.https.onCall((data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }
  if (context.auth.token.email !== data.fcmEmail) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "user is not the same as in the request",
    );
  }
  const fcmTokenToSave = new FcmTokenModel();
  fcmTokenToSave.fcmEmail = data.fcmEmail;
  fcmTokenToSave.fcmToken = data.fcmToken;
  console.log(fcmTokenToSave);
  return fcmTokenToSave.saveFcmTokenDoc(db, data.fcmTimeStamp);
});

exports.deleteFcmToken = functions.https.onCall((data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add request",
    );
  }
  const fcmTokenToSave = new FcmTokenModel();
  fcmTokenToSave.fcmEmail = data.fcmEmail;
  fcmTokenToSave.fcmToken = data.fcmToken;
  return fcmTokenToSave.deleteFcmTokenDoc(db, data.fcmTimeStamp);
});

const {getAuth} = require("firebase-admin/auth");
const axios = require("axios");
const urlNU = "https://qualityappspring.azurewebsites.net/api/v1/skf/firebase/notifyNewUserIsRegistered";
const signInApiUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=";
const firebaseProjectWebKey = "AIzaSyDgDklgkFPQCYh1abTGILRJtC6eZoOjOrk";
const adminUserEmail = "romansemenyshyn@gmail.com";

exports.onUserVerifiedEmail = functions
    .firestore.document("companies/skf/users/{isEmailVerified}")
    .onUpdate((snap, context) => {
      const oldUserData = snap.before.data();
      const userData = snap.after.data();

      if (
        oldUserData.isEmailVerified === false &&
          userData.isEmailVerified === true &&
          userData.teamMemberId === -1
      ) {
        let tokenId = "";
        return getAuth().getUserByEmail(adminUserEmail)
            .then((userRecord) => {
              getAuth().createCustomToken(userRecord.uid)
                  .then((customToken) => {
                    axios.post(signInApiUrl + firebaseProjectWebKey,
                        {token: customToken, returnSecureToken: true})
                        .then((response) => {
                          tokenId = response.data.idToken;
                          console.log("adminUser token is: ", tokenId);

                          const config = {
                            headers: {Authorization: `Bearer ${tokenId}`},
                          };

                          axios.get(`${urlNU}/${snap.after.id}`, config)
                              .then((response) => {
                                console.log("status is: ", response.status);
                                console.log("data is: ", response.data);
                              })
                              .catch((error) => {
                                console.log("error is: ", error.response.data);
                              });
                        },
                        );
                  });
            });
      }
    });
