const firebaseAdmin = require('firebase-admin');
const serviceAccount = require("./services/serviceAccountKey.json");

///CONNECT TO FIREBASE
const defaultFirebaseApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
});

const db = require('firebase-admin').firestore();

module.exports = {db}