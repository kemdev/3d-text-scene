import { updateGeometryParams, updateObjects } from '../functions/functions';

import '../../static/style/presets.scss';

import {
  IPresetsProps,
  IAppConfigOptions,
  ITextGeometryParameters,
} from '../types/types';
import { getPresets } from '../functions/paramsFunctions';
import { createContainer, createEl, progress } from '../components/utils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Color, PerspectiveCamera } from 'three';
import axios from 'axios';
import { deleteHandler } from './handlers';

const flexbox = document.querySelector('.flexbox');
const notPresetFound = (func: {
  (collection: IPresetsProps[] | null): void;
  (arg0: IPresetsProps[]): void;
}) => {
  const container = createContainer('no-presets-found-container');
  const loader = progress();
  const button = createEl('button', { className: 'refresh' });
  const h1 = createEl('h1');
  const p = createEl('p');
  const response = createEl('p');
  response.classList.add('no-presets-found');
  response.style.fontSize = '2rem';
  h1.textContent = 'No preset found!';
  p.textContent = 'Please try later or hit the refresh button';
  p.style.margin = '0.5rem 0 1rem';

  button.textContent = 'Refresh';
  button.onclick = async () => {
    response.textContent = '';
    container.append(loader);
    try {
      const presets = await getPresets();

      if (!presets || presets.length === 0) {
        setTimeout(() => {
          response.textContent = 'We are sorry, but still nothing!';
          container.removeChild(loader);
        }, 1000);
      }

      if (presets && presets.length > 0) {
        console.log('🚀 ~ button.onclick= ~ presets:', presets);
        setTimeout(() => {
          container.removeChild(loader);
          // createVariantButtons(presets);
          func(presets);
          container.remove();
        }, 1000);
      }
    } catch (error) {
      setTimeout(() => {
        response.textContent = 'We are sorry but, Still nothing!';
        container.removeChild(loader);
      }, 1000);
    }
  };

  container.append(h1, p, button, response);

  return container;
};

const generalNotFoundButton = (onClick: EventListenerOrEventListenerObject) => {
  const container = createContainer('no-presets-found-container');
  const loader = progress();
  const button = createEl('button', { className: 'refresh' });
  const h1 = createEl('h1');
  const p = createEl('p');
  const response = createEl('p');
  response.classList.add('no-presets-found');
  response.style.fontSize = '2rem';
  h1.textContent = 'No preset found!';
  p.textContent = 'Please try later or hit the refresh button';
  p.style.margin = '0.5rem 0 1rem';

  button.textContent = 'Refresh';

  button.addEventListener('click', onClick);

  container.append(h1, p, button, response);

  return container;
};

function getStorageImagesUI() {
  const refreshAgain = getPresets;

  const notFountButton = generalNotFoundButton(refreshAgain);
  const buttonsContainer = document.getElementById('buttons-container');

  buttonsContainer?.append(notFountButton);
}

export function getPresetTextConfig(obj: {
  objsConfigs: {
    appConfig: IAppConfigOptions;
    cubesConfig: any;
    donutsConfig: any;
  };

  currentControls: OrbitControls;
  camera: PerspectiveCamera;
}) {
  const appConfig = obj.objsConfigs.appConfig;
  const scene = appConfig.scene;

  const cubesConfig = obj.objsConfigs.cubesConfig;
  const donutsConfig = obj.objsConfigs.donutsConfig;

  const currentControls = obj.currentControls;
  const camera = obj.camera;

  async function readVariantsFile() {
    try {
      const response = await fetch('./variants-params/variants.json');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reading variants file:', error);
      return null;
    }
  }

  function updateObjectsHandler(
    preset: IPresetsProps['preset'],
    img: HTMLButtonElement | HTMLImageElement | null
  ) {

    const mapNum = preset.mapNum;
    const geometryParams = { ...preset.geometryParams };
    appConfig!.mapNum = mapNum;
    cubesConfig.mapNum = preset.cubesMapNum;
    donutsConfig.mapNum = preset.donutsMapNum;
    appConfig.text = preset.text;
    updateGeometryParams(appConfig!.geometryParams, geometryParams);

    scene.background = new Color(preset.bgColor || 0x000);
    scene.backgroundHex = preset.bgColor || 0x000;

    updateObjects({
      objects: {
        appConfig,
        cubesConfig,
        donutsConfig,
        cameraConfig: {
          camera,
          cameraParams: {
            fov: preset.viewParams.fov as number,
          },
        },
      },
      controls: {
        currentControls,
        viewConfig: preset.viewParams?.position,
      },
    });

    img?.classList.add('active');
  }

  // Function to create buttons for each variant
  function presetsVariants(collection: IPresetsProps[] | null) {
    let currentClickedButton: HTMLButtonElement | HTMLImageElement | null =
      null;

    collection?.forEach((data: IPresetsProps, index: number) => {
      const { _id, created_by, preset, timestamp } = data;

      const imageClickHandler = () => {
        if (currentClickedButton) {
          currentClickedButton.classList.remove('active');
        }
        updateObjectsHandler(preset, img);
        currentClickedButton = img;
      };

      const img = presetImageWithButtonsUI(
        preset.screenshot || '/screenshots/variant2.png',
        created_by + ' - ' + (index + 1),
        _id,
        imageClickHandler
      );
    });
  }

  // function updatePresetsVariants(updateValue: IPresetsProps, index: number) {
  //   const { preset, created_by, _id } = updateValue;
  //   const imageClickHandler = () => {
  //     imageClick(preset, img);
  //   };

  //   const img = presetImageWithButtonsUI(
  //     preset.screenshot || '/screenshots/variant2.png',
  //     created_by + ' - ' + (index + 1),
  //     _id,
  //     imageClickHandler
  //   );
  // }

  function deleteButton(currentPresetID) {
    const deleteIcon = document.createElement('span');
    deleteIcon.classList.add('deleteIcon');
    deleteIcon.classList.add('material-symbols-outlined');
    deleteIcon.textContent = 'delete';

    deleteIcon.addEventListener('click', () => deleteHandler(currentPresetID));

    return deleteIcon;
  }

  function presetImageWithButtonsUI(
    src: string,
    spanContent: string,
    currentPresetID: string,
    func: () => void
  ) {
    const img = document.createElement('img');
    const span = document.createElement('span');
    const div = document.createElement('div');
    // const deleteIcon = deleteButton(currentPresetID);

    div.classList.add('preset-info-container');
    span.classList.add('created-by');

    img.src = src;
    span.textContent = spanContent;

    div.addEventListener('click', func);

    div.append(img, span);
    flexbox?.appendChild(div);

    return img;
  }

  // Function to create images for all images in the storage!
  function storageImages(images: string[] | null) {
    if (!images?.length) {
      getStorageImagesUI();
    }

    images?.forEach((imageUrl: string, index: number) => {
      const img = document.createElement('img');
      const span = document.createElement('span');
      const div = document.createElement('div');
      div.classList.add('preset-info-container');
      span.classList.add('created-by');

      img.src = imageUrl;
      span.textContent = index + 1 + '';

      div.append(img, span);
      flexbox?.appendChild(div);
    });
  }

  function createVariantButtons(collection: IPresetsProps[] | null) {
    const buttonsContainer = document.getElementById('buttons-container');
    const refreshPresetButton = notPresetFound(presetsVariants);

    try {
      // Check if the container exists
      buttonsContainer!.textContent = '';
      if (!collection?.length) {
        buttonsContainer?.append(refreshPresetButton);
        return;
      }

      presetsVariants(collection);
    } catch (error) {
      console.log('Error', error);
      buttonsContainer!.textContent =
        'No Presets Found, please try again in a bit maybe the server still waking up';

      return null;
    }
  }

  // Function to handle open info button
  // function openInfoSection() {
  //   const infoButton = document.getElementById('open-info-button');
  //   const infoContainer = document.getElementById('info-container');
  //   const infoContent = document.getElementById('info-content');

  //   let isRotating = false;

  //   const toggleOpenInfo = () => {
  //     if (isRotating) return;

  //     if (infoContainer && infoButton) {
  //       const infoContainerHeight =
  //         window.getComputedStyle(infoContainer).height;

  //       if (infoContainerHeight == '64px' || !infoContainerHeight) {
  //         infoContainer.style.height = '50%';
  //         infoButton.style.transform = 'rotate(180deg)';
  //         infoButton.style.borderBottomLeftRadius = '5px';
  //         infoButton.style.borderBottomRightRadius = '5px';
  //         infoButton.style.borderTopRightRadius = '0';
  //         infoButton.style.borderTopLeftRadius = '0';
  //         infoButton.className += ' radius-changes '; // Set a circular border radius
  //       } else {
  //         // infoContainer?.classList.add('info-opened');
  //         infoContainer.style.height = '64px';
  //         infoButton.style.transform = 'rotate(0deg)';
  //         infoButton.style.borderBottomLeftRadius = '0px';
  //         infoButton.style.borderBottomRightRadius = '0px';
  //         infoButton.style.borderTopRightRadius = '5px';
  //         infoButton.style.borderTopLeftRadius = '5px';
  //         infoButton.className += ' radius-changes '; // Set a circular border radius
  //       }
  //       isRotating = true;
  //     }
  //   };

  //   const handleTransitionEnd = () => {
  //     isRotating = false;
  //     // infoButton!!.style.borderRadius = '5px'; // Reset to original or remove the style attribute
  //     infoButton?.classList.remove('radius-changes'); // Set a circular border radius
  //     // infoButton?.removeEventListener('transitionend', handleTransitionEnd);
  //   };

  //   infoButton?.addEventListener('click', toggleOpenInfo);
  //   infoButton?.addEventListener('transitionend', handleTransitionEnd);
  // }

  // function updateGeometryParams(
  //   target: ITextGeometryParameters,
  //   source: ITextGeometryParameters
  // ) {
  //   target.bevelEnabled = source.bevelEnabled;
  //   target.bevelOffset = source.bevelOffset;
  //   target.bevelSegments = source.bevelSegments;
  //   target.bevelSize = source.bevelSize;
  //   target.bevelThickness = source.bevelThickness;
  //   target.curveSegments = source.curveSegments;
  // }

  // Read the variants file and create buttons when the page loads

  async function readData() {
    // const variantsData = await readVariantsFile();
    let presets: IPresetsProps[] | null = null;
    presets = await getPresets();
    createVariantButtons(presets);

    // appConfig.updatePresets = function (preset: IPresetsProps) {
    //   const index = presets?.length as number;
    //   // updatePresetsVariants(preset, index + 1);
    // };
    return presets;
    // storageImages(presets); // get all the images in the storage!
  }
  return { readData };
}
