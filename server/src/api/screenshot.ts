import { admin, storage } from '../db/db';
import { getStorage } from 'firebase-admin/storage';
import express, { Response, Request } from 'express';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();
const upload = multer({
  dest: 'uploads/',
  limits: {
    fieldSize: 25 * 1024 * 1024, // Set the maximum field size in bytes (here, 25 MB)
  },
}).single('photo');

router.post('/upload-screenshot/', upload, saveScreenshotToStorage);

async function saveScreenshotToStorage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const screenshotBase64 = req.body.photo;
    const screenshotBuffer = Buffer.from(screenshotBase64, 'base64'); // base64


    // NOTE Save image to file.
    // // const localFilePath = `uploads/${Date.now()}_screenshot.png`;
    // // fs.writeFileSync(localFilePath, screenshotBuffer);
    // // res.status(200).send({ success: true });
    const bucket = storage.bucket();

    const file = bucket.file('screenshots/3');
    await file
      .save(screenshotBuffer, {
        metadata: {
          contentType: 'image/png', // Adjust the content type based on your file type
        },
      })
      .catch((e) => {
        console.log('Error', e);
        res.statusCode = 200;
        res.send({
          success: false,
          error: e.message,
        });
      })
      .finally(() => {
        res.status(200).send({
          success: true,
          message: 'Upload Complete',
        });
      });


    // bucket
    //   .upload(screenshotBuffer)
    //   .then(() => {
    //     res
    //       .send({
    //         success: true,
    //         message: 'Upload Complete',
    //       })
    //       .status(200);
    //   })
    //   .catch((error) => {
    //     // console.error('Error uploading file data:', error.message);
    //     res.statusCode = 200;
    //     res.send({ success: false, message: error });
    //   });
  } catch (error) {
    res.statusCode = 200;
    res.send({ success: false, error: error });
  }
}


export default router;
