// eslint-disable-next-line require-jsdoc
function FcmToken() {
  this.fcmEmail = null;
  this.fcmToken = null;

  this.data = function() {
    return JSON.parse(JSON.stringify(this));
  };

  this.copyFromInstance = function(instance) {
    this.fcmEmail = instance.fcmEmail;
    this.fcmToken = instance.fcmToken;
    return this;
  };

  this.saveFcmTokenDoc = function(db, docId) {
    return db
        .doc(`companies/skf/users/${this.fcmEmail}/fcmTokens/${docId}`)
        .set(this.data())
        .then((/* timeStamp*/) => {
          return this.data();
        })
        .catch((error) => {
          throw error;
        });
  };

  this.getFcmTokenDoc = function(db, docId) {
    return db
        .doc(`companies/skf/users/${this.fcmEmail}/fcmTokens/${docId}`)
        .get(this.data())
        .then((snap) => {
          const principle = this.copyFromInstance(snap.data());
          return principle.data();
        })
        .catch((error) => {
          throw error;
        });
  };

  this.deleteFcmTokenDoc = function(db, docId) {
    return db
        .doc(`companies/skf/users/${this.fcmEmail}/fcmTokens/${docId}`)
        .delete()
        .then((/* timeStamp*/) => {
          return this;
        })
        .catch((error) => {
          throw error;
        });
  };
}

module.exports = FcmToken;
