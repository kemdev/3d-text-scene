import { Color } from 'three';
import {
  IObjectsConfigs,
  IPresetsProps,
  IAppConfigOptions,
} from '../types/types';
import { updateGeometryParams, updateObjects } from './functions';

const flexbox = document.querySelector('.flexbox');
let objectsConfig: IObjectsConfigs;

export function getNecessaryValue({
  appConfig,
  cubesConfig,
  donutsConfig,
  currentControls,
}) {
  objectsConfig.appConfig = appConfig;
  objectsConfig.cubesConfig = cubesConfig;
  objectsConfig.donutsConfig = donutsConfig;
  objectsConfig.currentControls = currentControls;
}

function createVariantButtons(collection: IPresetsProps[] | null) {
  const buttonsContainer = document.getElementById('buttons-container');
  const infoContainer = document.getElementById('info-container');
  const test = document.getElementById('no-presets-found-container');
  // const refreshPresetButton = notPresetFound(presetsVariants);

  try {
    // Check if the container exists
    buttonsContainer!.textContent = '';
    if (!collection?.length) {
      // buttonsContainer?.append(refreshPresetButton);
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

function presetsVariants(collection: IPresetsProps[] | null) {
  let currentClickedButton: HTMLButtonElement | HTMLImageElement | null = null;

  collection?.forEach((data: IPresetsProps, index: number) => {
    const { _id, created_by, preset, timestamp } = data;
    const { appConfig, cubesConfig, donutsConfig, currentControls } =
      objectsConfig;
    const { scene, camera } = appConfig;

    const img = document.createElement('img');
    const span = document.createElement('span');
    const div = document.createElement('div');
    div.classList.add('preset-info-container');
    span.classList.add('created-by');

    img.src = preset.screenshot || '/screenshots/variant2.png';
    span.textContent = created_by + ' - ' + (index + 1);
    div.addEventListener('click', () => {
      if (currentClickedButton) {
        currentClickedButton.removeAttribute('class');
      }

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

      img.classList.add('active');
      currentClickedButton = img;
    });

    div.append(img, span);
    flexbox?.appendChild(div);
  });
}
