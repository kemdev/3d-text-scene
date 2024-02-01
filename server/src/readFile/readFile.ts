// import * as admin from 'firebase-admin';
import { admin } from '../db/db';
import * as fs from 'fs';
import * as path from 'path';

async function saveDefaultPresetToDB() {
  // Read JSON file
  const filePath = path.join(__dirname, '../../variants1.json'); // Replace with the path to your JSON file
  const reader = fs.readFileSync(filePath, 'utf-8');
  const jsonData = JSON.parse(reader);

  const arrayOfObjects = Object.values(jsonData);

  // Function to add properties and save to Firebase
  async function processAndSaveData(data: any) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      // Save newObj to Firestore
      const collectionName = 'presets'; // Replace with your Firestore collection name

      for (const obj of data) {
        const newObj = {
          created_by: 'Admin',
          timestamp: timestamp,
          preset: obj,
        };

        const docRef = await admin
          .firestore()
          .collection(collectionName)
          .add(newObj);

        // Retrieve the auto-generated document ID
        const docId = docRef.id;

        // Update the object with the retrieved document ID
        const newObjWithId = {
          _id: docId,
          ...newObj,
        };

        // Update the document in Firestore with the newObjWithId
        await admin
          .firestore()
          .collection(collectionName)
          .doc(docId)
          .update(newObjWithId);

        console.log(`Document added with ID: ${docRef.id}`);
      }
    } catch (error) {
      console.log(
        '🚀 ~ file: readFile.ts:15 ~ processAndSaveData ~ error:',
        error
      );
    }
  }

  // // Process and save data
  processAndSaveData(arrayOfObjects);
}

export default saveDefaultPresetToDB;

// export default router;
