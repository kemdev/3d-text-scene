// import { loadFont } from './functions';
import GUI from 'lil-gui';
import {
  IGuiAddProps,
  IPresetsProps,
  IScreenshotProps,
  IAppConfigOptions,
} from './types/types';
import { texturePaths, updateTexture } from './functions/functions';
import {
  Camera,
  Color,
  CubeTexture,
  PerspectiveCamera,
  Renderer,
  Scene,
  Texture,
} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
  captureScreenshot,
  saveScreenshotFile,
  saveScreenshotToFireStorage,
} from './functions/paramsFunctions';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import popupHandler, { saveScreenshotPopup } from './components/popup';
import registerUI from './components/register/register';

const gui = new GUI();
const camerasControllerFolder = gui.addFolder('Cameras');

const textureLength = texturePaths;

let option = {};
const variants = textureLength.map((e, idx) => {
  option[`variant-${idx + 1}`] = idx;
  return e;
});

const guiAdd = (
  appConfig: object,
  property: string,
  folderName?: string | undefined,
  ...args: IGuiAddProps[]
) => {
  if (folderName) {
    const folder = gui.addFolder(folderName);
    return folder.add(appConfig, property, ...args);
  }
  return gui.add(appConfig, property, ...args);
};

function editTextObject(
  appConfig: IAppConfigOptions
  //  updateTexture: () => void
) {
  return {
    changeTexture: () => {
      let updateMapNumHandler = (e: number) => {
        appConfig.mapNum = e;
        updateTexture(appConfig.material, e);
      };

      guiAdd(appConfig, 'mapNum')
        .options(option)
        .name('Change Map')
        .onChange(updateMapNumHandler)
        .listen();

      /**
       * Because we have the matcap as numbers in the files, so we need to change them accordingly.
       */
      // const keyUpHandler = (e) => {
      //   if (e.key > '0' && e.key < '9') {
      //     const index = Number(e.key) - 1;
      //     // appConfig .mapNum = `variant-${e.key}`;
      //     appConfig .mapNum = e.key;
      //     updateTexture(appConfig .material, index);
      //   }
      // };
      // document.addEventListener('keyup', keyUpHandler);
    },

    changeBevel: () => {
      const bevelFolder = gui.addFolder('Text Bevels');

      const updateBevelEnabled = (e: boolean | undefined) => {
        appConfig.geometryParams.bevelEnabled = e;
        appConfig.updateTextShape();
      };
      const updateBevelOffset = (e: number) => {
        appConfig.geometryParams.bevelOffset = e;
        appConfig.updateTextShape();
      };

      const updateBevelSegments = (e: number) => {
        appConfig.geometryParams.bevelSegments = e;
        appConfig.updateTextShape();
      };

      const updateBevelSize = (e: number | undefined) => {
        appConfig.geometryParams.bevelSize = e;
        appConfig.updateTextShape();
      };

      const updateBevelThickness = (e: number | undefined) => {
        appConfig.geometryParams.bevelThickness = e;
        appConfig.updateTextShape();
      };

      const updateCurveSegments = (e: number | undefined) => {
        appConfig.geometryParams.curveSegments = e;
        appConfig.updateTextShape();
      };
      const updateGeometrySteps = (e: number | undefined) => {
        appConfig.geometryParams.steps = e;
        appConfig.updateTextShape();
      };

      const bevelEnabledControl = bevelFolder
        .add(appConfig.geometryParams, 'bevelEnabled')
        .onChange(updateBevelEnabled)
        .listen();

      const bevelOffsetControl = bevelFolder
        .add(appConfig.geometryParams, 'bevelOffset')
        .min(0)
        .max(0.002)
        .step(0.00001)
        .onChange(updateBevelOffset)
        .listen();

      const bevelSegmentControl = bevelFolder
        .add(appConfig.geometryParams, 'bevelSegments')
        .min(0)
        .max(20)
        .step(1)
        .onChange(updateBevelSegments)
        .listen();

      const bevelSizeControl = bevelFolder
        .add(appConfig.geometryParams, 'bevelSize')
        .min(0.002)
        .max(1)
        .step(0.0001)
        .onChange(updateBevelSize)
        .listen();

      const bevelThicknessControl = bevelFolder
        .add(appConfig.geometryParams, 'bevelThickness')
        .min(0)
        .max(1)
        .step(0.0001)
        .onChange(updateBevelThickness)
        .listen();

      const curveSegmentControl = bevelFolder
        .add(appConfig.geometryParams, 'curveSegments')
        .min(6)
        .max(12)
        .step(1)
        .onChange(updateCurveSegments)
        .listen();

      return {
        bevelEnabledControl,
        bevelOffsetControl,
        bevelSegmentControl,
        bevelSizeControl,
        bevelThicknessControl,
        curveSegmentControl,
      };
      // bevelFolder.add(geometryParams, 'depth').min(0).max(1).step(0.001);
    },

    updateText: () => {
      guiAdd(appConfig, 'text').onChange(() => {
        appConfig.updateTextShape();
      });
    },
  };
}

function editDonutsObject(donutsConfig: {
  mapNum: number;
  donuts: THREE.Mesh[];
  randomizeDonuts: any;
}) {
  return {
    changeTexture: () => {
      guiAdd(donutsConfig, 'mapNum', 'Donuts Matcap')
        .options(option)
        .name('Change Map')
        .onFinishChange((e: number) => {
          // Update material for all donuts
          donutsConfig.donuts.forEach((donut: any) => {
            updateTexture(donut.material, e);
            donutsConfig.mapNum = e;
          });
        })
        .listen();
    },

    randomizeDonutsAgain: () => {
      guiAdd(donutsConfig, 'randomizeDonuts', 'Randomize Donuts').name(
        'Randomize Donuts'
      );
    },
  };
}

function editCubesObject(cubesConfig: {
  mapNum: number;
  cubes: THREE.Mesh[];
  randomizeCubes: () => void;
  randomizeCubesMeshesConfig: {
    x: number;
    y: number;
    z: number;
  };
  changeRandomizeX: (e: number) => void;
}) {
  const changeCubesMatcap = () =>
    guiAdd(cubesConfig, 'mapNum', 'Cubes Matcap')
      .options(option)
      .name('Change Map')
      .onFinishChange((e: number) => {
        // Update material for all cubes
        cubesConfig.cubes.forEach((donut: any) => {
          cubesConfig.mapNum = e;
          updateTexture(donut.material, e);
        });
      })
      .listen();

  const randomizeCubes = () =>
    guiAdd(cubesConfig, 'randomizeCubes').name('Randomize Cubes');

  const changeCubesRandomizeSpreads = () =>
    guiAdd(cubesConfig.randomizeCubesMeshesConfig, 'x')
      .name('Change Distance')
      .min(1)
      .max(150)
      .step(1)
      .onFinishChange((e: number) => {
        cubesConfig.randomizeCubesMeshesConfig.y = e;
        cubesConfig.randomizeCubesMeshesConfig.z = e;
        cubesConfig.randomizeCubes();
      });

  return {
    changeCubesMatcap,
    changeCubesRandomizeSpreads,
    randomizeCubes,
  };
}

function showHideStats(stats: {
  stats1: Stats;
  stats2: Stats;
  stats3: Stats;
  scene: Scene;
}) {
  const showHideAll = (e: boolean) => {
    stats.stats1.dom.style.display = e ? 'block' : 'none';
    stats.stats2.dom.style.display = e ? 'block' : 'none';
    stats.stats3.dom.style.display = e ? 'block' : 'none';
  };

  return guiAdd({ showHide: true }, 'showHide', 'Stats')
    .name('Show-Hide All')
    .onChange((e: boolean) => {
      showHideAll(e);
    });
}

function uploadNewPresetGUI(params: {
  appConfig: IAppConfigOptions;
  donutsConfig: { mapNum: number };
  cubesConfig: { mapNum: number };
  control: OrbitControls;
  camera: THREE.PerspectiveCamera;
  renderer: Renderer;
}) {
  const appConfig = params.appConfig;
  const scene = appConfig.scene;
  const camera = params.camera;
  const renderer = params.renderer;
  const control = params.control;
  const donutsConfig = params.donutsConfig;
  const user = appConfig.user;
  let cubesConfig = params.cubesConfig;

  const getScreenshotURI = async () => {
    return await captureScreenshot({ renderer, scene, camera });
  };

  const saveNewPreset = async () => {
    const sceneBackground = scene.background as Color;
    const sceneBgColorHex = sceneBackground?.getHex();

    const updatedOptions: IPresetsProps = {
      _id: '',
      created_by: '',
      preset: {
        name: '',
        text: appConfig.text,
        mapNum: appConfig.mapNum,
        donutsMapNum: donutsConfig.mapNum,
        cubesMapNum: cubesConfig.mapNum,
        geometryParams: appConfig.geometryParams, // text params
        screenshot: '',
        viewParams: {
          position: control.object.position,
          fov: camera.fov,
        },
        bgColor: sceneBgColorHex,
      },
      timestamp: '',
    };

    const screenshot = await getScreenshotURI();
    const myPopup = popupHandler(screenshot, updatedOptions, appConfig);
    return myPopup;
  };

  const saveNewScreenshot = async () => {
    const screenshot = await getScreenshotURI();
    const myPopup = saveScreenshotPopup(screenshot);
    return myPopup;
    // saveScreenshotFile({ renderer, scene, camera });
  };

  const loginRegister = async () => {
    registerUI();
  };

  guiAdd({ save: saveNewScreenshot }, 'save').name('Save screenshot');

  // guiAdd({ save: saveToJSONFileHandler }, 'save').name('save to json');
}

function cameraControlsGUI(cameraObj: any) {
  const { mainCamController } = cameraObj;

  let currentStatus = 'Enable';
  const name = (currentStatus: string): string => {
    const result = currentStatus + ' Both Camera Controller';
    return result;
  };

  const mainCameraEnabled = camerasControllerFolder
    .add(mainCamController, 'enabled')
    .name('Activate Camera Controls')
    .onChange((e: any) => {
      mainCamController.enabled = e;
    });

  const resetCamera = camerasControllerFolder
    .add(cameraObj, 'reset')
    .name('Reset Camera');

  return {
    mainCameraEnabled,
    resetCamera,
  };
}

function addRemoveControlsBoundaries(funcs: {
  setBoundaries: Function;
  removeBoundaries: Function;
}) {
  const { setBoundaries, removeBoundaries } = funcs;

  const name = 'Limited rotation';

  // projects/forms/UIB-data-transparent-login

  setBoundaries();
  camerasControllerFolder
    .add({ isLimited: true }, 'isLimited')
    .name(name)
    .onChange((e: boolean) => {
      if (e) return setBoundaries();

      return removeBoundaries();
    });
}

function printTest(e: any) {
  const print = (...e: any[]) => {
    console.log(...e);
  };

  return guiAdd({ print }, 'print').onChange(() => {
    print(e);
  });
}

function fetchPresetsTest({ renderer, scene, camera }) {
  function saveScreenshotHandler() {
    saveScreenshotToFireStorage({ renderer, scene, camera });
  }
}

function changeBackgroundColor(scene: IAppConfigOptions['scene']) {
  const controller = gui
    .addColor(scene, 'backgroundHex')
    .name('Background Color')
    .listen();

  controller.onChange((color: number) => {
    scene.background = new Color(color);
  });

  return controller;
}
// function changeBackgroundColor(scene: Scene) {
//   const color = scene.background;
//   console.log("🚀 ~ changeBackgroundColor ~ color:", color)

//   return gui
//     .addColor(scene, 'background')
//     .name('Background Color')
//     .listen();
// }

function cameraFOV(camera: PerspectiveCamera) {
  guiAdd(camera, 'fov')
    .min(10)
    .max(150)
    .step(1)
    .onChange((e) => {
      camera.updateProjectionMatrix();
    })
    .listen();
}

export {
  gui,
  editTextObject,
  editDonutsObject,
  showHideStats,
  cameraControlsGUI,
  addRemoveControlsBoundaries,
  editCubesObject,
  printTest,
  uploadNewPresetGUI,
  fetchPresetsTest,
  changeBackgroundColor,
  cameraFOV,
};
