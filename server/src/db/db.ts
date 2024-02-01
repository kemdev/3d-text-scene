// let admin = require('firebase-admin');
import admin from 'firebase-admin';

let serviceAccount = require('../../firestoreCredential.json');

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    'https://firstofficial3dscene-default-rtdb.europe-west1.firebasedatabase.app',
  storageBucket: 'gs://firstofficial3dscene.appspot.com',
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
const storage = admin.storage();

export { app, admin, db, storage };
