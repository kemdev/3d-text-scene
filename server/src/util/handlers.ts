import { firestore } from 'firebase-admin';
import { IPresetsProps, IResult } from '../types/interfaces';
import { admin, storage } from '../db/db';

function getCollectionRef(
  firestore: firestore.Firestore,
  collectionName: string
) {
  const collectionRef = firestore.collection(collectionName);

  if (!collectionRef) {
    return null;
  }
  return collectionRef;
}

async function saveScreenshotHandler(screenshot: string, id: string) {
  const result: IResult = {
    success: false,
    message: '',
    url: '',
  };
  const screenshotBuffer = Buffer.from(screenshot, 'base64');
  const bucket = storage.bucket();
  const screenshotFileName = `${id}/screenshot.png`; // Use document ID as part of the filename

  const file = bucket.file(screenshotFileName);

  await file
    .save(screenshotBuffer, {
      metadata: {
        contentType: 'image/png', // Adjust the content type based on your file type
      },
    })
    .catch((e) => {
      console.log('Error', e);
      result.error = 'Error: ' + e.message;
      result.success = false;
      result.url = '';
    });

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '01-01-2030', // Adjust the expiration date as needed
  });

  if (url) {
    result.success = true;
    result.message = 'Screenshot uploaded successfully!';
    result.url = url;
  }
  return result;
}

async function firestoreHandler(
  preset: IPresetsProps,
  firestore: FirebaseFirestore.Firestore
) {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  const collectionName = 'presets';
  const newPreset = {
    ...preset,
    timestamp: timestamp,
  };

  const docRef = await firestore.collection(collectionName).add(newPreset);

  return { docId: docRef.id, newPreset };
}

// async function updateDocsIDs(): Promise<void> {
//   const collectionRef = admin.firestore().collection('presets');
//   const docs = await collectionRef.get().then((querySnapshot) => {
//     const temp = querySnapshot.docs.map((doc) => {
//       const docId = doc.id;
//       const docWithID = {
//         ...doc.data(),
//         _id: docId,
//       };
//       collectionRef.doc(docId).update(docWithID);
//       console.log('🚀 ~ temp ~ doc:', doc.data());
//     });
//     // console.log('----------->', temp);
//   });
// }

export { getCollectionRef, saveScreenshotHandler, firestoreHandler };
