import express from 'express';
import multer from 'multer';
import {
  firestoreHandler,
  getCollectionRef,
  saveScreenshotHandler,
} from '../util/handlers';

const router = express.Router();
const upload = multer({
  dest: 'uploads/',
  limits: {
    fieldSize: 25 * 1024 * 1024, // Set the maximum field size in bytes (here, 25 MB)
  },
}).single('screenshot');

router.get('/get-presets/:collectionName', getCollections);

async function getCollections(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    const { firestore, params } = req;
    const { collectionName } = params;
    const collectionRef = getCollectionRef(firestore, collectionName);

    const docs = await collectionRef?.get();
    const result: FirebaseFirestore.DocumentData[] = [];
    docs?.forEach((e) => {
      result.push(e.data());
    });

    if (!result.length || !docs || !collectionRef) {
      res.statusCode = 500;
      res.send({
        error: 'something went wrong!',
        message: 'No result found!',
      });
    }

    res
      .status(200)
      .send({ message: 'Collections retrieved successfully', data: result });
  } catch (error: any) {
    res.statusCode = 500;
    res.send({ error });
  }
}

router.post('/add-new-preset', upload, addNewDocToPresetsCollection);
async function addNewDocToPresetsCollection(
  req: express.Request,
  res: express.Response
): Promise<void> {
  try {
    const preset = JSON.parse(req.body.preset);
    const screenshot = req.body.screenshot;
    const firestore = req.firestore;

    const { docId, newPreset } = await firestoreHandler(preset, firestore);
    const screenShotResult = await saveScreenshotHandler(screenshot, docId);

    newPreset.preset.screenshot = screenShotResult.url;
    newPreset._id = docId;

    await firestore.collection('presets').doc(docId).update(newPreset);

    // observer(); // unsubscribe
    res.send({
      success: screenShotResult.success,
      message: screenShotResult.message,
      screenshotUrl: screenShotResult.url,
    });
  } catch (error: any) {
    res.statusCode = 500;
    res.send({ success: false, error: error.message });
  }
}

router.get('/get-all-images-in-storage', getAllImages);
async function getAllImages(req: express.Request, res: express.Response) {
  const { firestore, params, storage } = req;
  const { collectionName } = params;

  const currentStorage = storage.bucket();
  const files = await currentStorage.getFiles().then(async ([files]) => {
    const result: string[] = await Promise.all(
      files.map(async (data: any) => {
        const [url] = await data.getSignedUrl({
          action: 'read',
          expires: '01-01-2030', // Adjust the expiration date as needed
        });
        return url;
      })
    );

    return result;
  });

  res.send({
    success: true,
    data: files,
  });
  const collectionRef = getCollectionRef(firestore, collectionName);
  const docs = await storage;
}

router.delete('/delete-preset/:id', deletePreset);
async function deletePreset(req: express.Request, res: express.Response) {
  const result = {
    id: '',
    screenshot: {
      success: false,
      message: '',
    },
    doc: {
      success: false,
      message: '',
    },
  };
  const id = req.params.id;
  const firestore = req.firestore;
  const storage = req.storage.bucket();

  // delete the doc and also delete the storage!
  await firestore
    .collection('presets')
    .doc(id)
    .delete()
    .then((e) => {
      console.log('file deleted successfully', e);
      result.doc.success = true;
      result.id = id;
      result.doc.message = 'Doc Deleted Successfully';
    })
    .catch((e) => {
      console.log('Something went wrong!', e);
      result.doc.message = 'Error deleting Doc ' + e;
      result.doc.success = false;
    });

  await storage
    .deleteFiles({
      prefix: id,
    })
    .then((e) => {
      console.log('Screenshot deleted successfully', e);
      result.screenshot.success = true;
      result.id = id;
      result.screenshot.message = 'Doc Deleted Successfully';
    })
    .catch((e) => {
      console.log('Something went wrong!', e);
      result.screenshot.message = 'Error deleting Doc ' + e;
      result.screenshot.success = false;
    });

  res.send(result);
}

export default router;
