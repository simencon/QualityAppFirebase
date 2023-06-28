/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError,
} = require("firebase-functions/v2/identity");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// [START v2ValidateNewUser]
// [START v2beforeCreateFunctionTrigger]
// Block account creation with any non-acme email address.
exports.validatenewuser = beforeUserCreated(async (event) => {
  // [END v2beforeCreateFunctionTrigger]
  // [START v2readUserData]
  // User data passed in from the CloudEvent.
  const user = event.data;
  // Email passed from the CloudEvent.
  const email = event.data.email || "";
  // [END v2readUserData]

  // [START v2domainHttpsError]
  // Only users from whitelist or of a specific domain can sign up.
  const doc = await db
      .collection("whitelist")
      .where("company", "==", "skf").get;
  console.log("skf list", doc);
  const allowed = await doc
      .collection("externalEmail").doc(email).get();
  if (!allowed.exists) {
    if (!user.email.includes("@skf.com")) {
      // Throw an HttpsError so that Firebase Auth rejects the account creation.
      throw new HttpsError("invalid-argument", "Unauthorized email");
    }
  }
  // [END v2domainHttpsError]
});
// [END v2ValidateNewUser]

// [START v2CheckForBan]
// [START v2beforeSignInFunctionTrigger]
// Block account sign in with any banned account.
exports.checkforban = beforeUserSignedIn(async (event) => {
  // [END v2beforeSignInFunctionTrigger]
  // [START v2readEmailData]
  // Email passed from the CloudEvent.
  const email = event.data.email || "";
  // [END v2readEmailData]

  // [START v2documentGet]
  // Obtain a document in Firestore of the banned email address.
  const doc = await db.collection("banned").doc(email).get();
  // [END v2documentGet]

  // [START v2bannedHttpsError]
  // Checking that the document exists for the email address.
  if (doc.exists) {
    // Throw an HttpsError so that Firebase Auth rejects the account sign in.
    throw new HttpsError("invalid-argument", "Unauthorized email");
  }
  // [END v2bannedHttpsError]
});
// [START v2CheckForBan]

const functions = require("firebase-functions");

exports.newUserSignup = functions.auth.user().onCreate((user) => {
  console.log("user created", user.email, user.uid);
  return db.collection("users").doc(user.uid).set({
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
  console.log("user created", user.email, user.uid);
  const doc = db.collection("users").doc(user.uid);
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
