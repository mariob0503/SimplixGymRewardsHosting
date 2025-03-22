var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://simplixgymrewards-default-rtdb.europe-west1.firebasedatabase.app"
});

function resetDisplays() {
  var db = admin.database();
  var ref = db.ref("displays");
  ref.set({}, function(error) {
    if (error) {
      console.error("Error resetting displays:", error);
    } else {
      console.log("All display nodes have been reset.");
    }
  });
}

function launchGame1() {
  console.log("Game 1 launched");
}

function launchGame2() {
  console.log("Game 2 launched");
}

function qrCodeLogin() {
  console.log("QR Code Login function triggered");
}

function showLeaderboard() {
  console.log("Leaderboard function triggered");
}

resetDisplays();

module.exports = {
  launchGame1,
  launchGame2,
  qrCodeLogin,
  showLeaderboard
};
