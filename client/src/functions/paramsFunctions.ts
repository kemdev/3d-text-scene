import * as FileSaver from 'file-saver';
import {
  ITextGeometryParameters,
  IScreenshotProps,
  IPresetsProps,
} from '../types/types';
import _, { size } from 'lodash';

import axios from 'axios';

const saveNewParamsVariant = (geometryParams: ITextGeometryParameters) => {
  // Save current parameters to a file
  const paramsJSON = JSON.stringify(geometryParams);
  const blob = new Blob([paramsJSON], { type: 'application/json' });
  FileSaver.saveAs(blob, 'variant_params.json');

  // Capture and save a screenshot
  // const screenshot = captureScreenshot(renderer, scene, camera);
  // const screenshotBlob = dataURItoBlob(screenshot);
  // FileSaver.saveAs(screenshotBlob, 'screenshot.png');
};

async function captureScreenshot({
  renderer,
  scene,
  camera,
}: IScreenshotProps): Promise<string> {
  // Render the scene to a data URL
  const currentWidth = renderer.domElement.width;
  const currentHeight = renderer.domElement.height;

  const sizes = { width: 859, height: 392 };

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);

  renderer.render(scene, camera);

  const screenshotDataUrl = renderer.domElement.toDataURL('image/png');

  // reset renderer and camera
  renderer.setSize(currentWidth, currentHeight);
  camera.aspect = currentWidth / currentHeight;
  camera.updateProjectionMatrix();

  return screenshotDataUrl;
}

async function saveScreenshotFile({
  renderer,
  scene,
  camera,
}: IScreenshotProps) {
  const screenshot = captureScreenshot({ renderer, scene, camera });
  const screenshotBlob = dataURItoBlob(await screenshot);
  FileSaver.saveAs(screenshotBlob, 'screenshot.png');
  return;
}

/**
 * Steps to save preset:
 * 1. put all the properties in one object.
 * 2. put the image content in a variable.
 * 3. combine them in one object, {
 *  params: {...}
 *  screenshot: ...
 * }
 * send the object to the backend and let the backend handle the rest...
 *
 */

async function saveScreenshotToFireStorage({
  renderer,
  scene,
  camera,
}: IScreenshotProps) {
  const screenshot = await captureScreenshot({ renderer, scene, camera });
  let formData = new FormData();
  const screenshotBase64 = screenshot.split(',')[1]; // Remove the prefix

  formData.append('photo', screenshotBase64); //append the values with key, value pair
  try {
    const config = {
      headers: { 'content-type': 'multipart/form-data' },
    };
    const response = await axios.post(
      '/storage/upload-screenshot',
      formData,
      config
    );

    return response;
  } catch (error) {
    console.log('Error', error.message);
    return error;
  }
}

async function getPresets(): Promise<IPresetsProps[] | null> {
  try {
    const result = await axios.get('/presets/get-presets/presets');
    const data = result.data.data;

    // NOTE use for later or not
    // const message = result.data.message;

    return data;
  } catch (error) {
    console.log(error.message);
    console.error('Error', error);
    return null;
  }
}

async function setNewPresetToDatabase(
  screenshot: string | undefined,
  new_preset: IPresetsProps
) {
  let formData = new FormData(); //formdata object
  // screenshot
  const screenshotBase64 = screenshot?.split(',')[1];
  // add screenshot to the formData

  // new preset
  const parsedPresetObject = JSON.stringify(new_preset);
  formData.append('screenshot', screenshotBase64 as string);
  formData.append('preset', parsedPresetObject);

  try {
    const config = {
      headers: { 'content-type': 'multipart/form-data' },
    };

    const response = await axios.post(
      '/presets/add-new-preset',
      formData,
      config
    );

    return response;
  } catch (e) {
    console.log('Error', e);
    return {
      success: false,
      message: e.message,
      status: e.response.status,
    };
  }
}

function dataURItoBlob(dataURI: string): Blob {
  // Convert data URI to Blob
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([intArray], { type: mimeString });
}

export {
  captureScreenshot,
  saveScreenshotFile,
  saveNewParamsVariant,
  getPresets,
  saveScreenshotToFireStorage,
  setNewPresetToDatabase,
};
