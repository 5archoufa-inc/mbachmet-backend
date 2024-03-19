const firebaseAdmin = require('firebase-admin');
const serviceAccount = require("../services/serviceAccountKey.json");
const {log} = require("../utillities/logger");

///CONNECT TO FIREBASE
function getDb(){
    return db;
}
let db = null;

function connectToFirestore(){
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount)
    });
    db = firebaseAdmin.firestore();
    log(`Connected to firestore`);
} 

module.exports = {connectToFirestore, getDb}