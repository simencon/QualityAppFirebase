const {
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError,
} = require("firebase-functions/v2/identity");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const axios = require("axios");
const EmptyUser = require("./model/UserModel");

admin.initializeApp();
const db = admin.firestore();

const apiUrl = "https://qualityappspring.azurewebsites.net/api/v1";

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
  const userToCreate = new EmptyUser();
  userToCreate.email = user.email;
  userToCreate.fullName = user.displayName;
  userToCreate.userUid = user.uid;
  console.log("new user is: ", userToCreate);
  return db.collection("companies")
      .doc(company)
      .collection("users")
      .doc(user.uid)
      .set(userToCreate);
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
              jobRole: data.jobRole,
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
          jobRole: data.jobRole,
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

      console.log("before post", userData);

      if (userData.id !== -1) {
        return axios.put(`${apiUrl}/firebaseUsers/${userData.id}`, userData)
            .then((response) => {
              console.log("response is: ", response.data);
            })
            .catch((error) => {
              console.log("error is: ", error.response.data);
            });
      } else {
        return axios.post(`${apiUrl}/firebaseUsers`, userData)
            .then((response) => {
              console.log("response code is: ", response.status);
              console.log("response is: ", response.data);
              db
                  .doc(`companies/skf/users/${userData.userUid}`)
                  .update({id: response.data.id})
                  .then((ref) => {
                    console.log(ref);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
            })
            .catch((error) => {
              console.log("error is: ", error.response.data);
            });
      }
    });
