const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = 'USER_UID'; // Replace with the user's UID
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Admin claim set successfully');
    process.exit();
  })
  .catch(error => {
    console.error('Error setting admin claim:', error);
    process.exit(1);
  });