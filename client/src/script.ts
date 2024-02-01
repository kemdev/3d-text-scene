import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  createCubes,
  createDonuts,
  getTextureBasedOnMapNum,
  openInfoSection,
  preloadedTextures,
  randomizeMeshes,
  text3D,
  updateText,
} from './functions/functions';
import {
  editTextObject,
  editDonutsObject,
  showHideStats,
  cameraControlsGUI,
  addRemoveControlsBoundaries,
  editCubesObject,
  uploadNewPresetGUI,
  changeBackgroundColor,
  cameraFOV,
} from './guiDebug';
import { ITextGeometryParameters, IAppConfigOptions } from './types/types';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { getPresetTextConfig } from './variants-params/uiVariantsParams';
import Stats from 'three/examples/jsm/libs/stats.module';
import { getNecessaryValue } from './functions/presetsService';

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  smallCamWidth: 0.6,
  smallCamHeight: 0.4,
};

/**
 * Base
 */

const donutsGroup = new THREE.Group();

// Debug
// const gui = new GUI();
// Canvas
const canvas = document.querySelector('canvas.webgl') as
  | HTMLElement
  | undefined;

// Scene
const scene = new THREE.Scene();

// Axis Helper
const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper);

/**
 * Textures
 */
// const textureLoader = new THREE.TextureLoader();
// const matcapTexture = textureLoader.load('/textures/matcaps/8.png');
// matcapTexture.colorSpace = THREE.SRGBColorSpace;
const defaultCubesDonutsMapNum = 7;
const matcapTexture = preloadedTextures[defaultCubesDonutsMapNum];
matcapTexture.colorSpace = THREE.SRGBColorSpace;

const texture = getTextureBasedOnMapNum();
texture.colorSpace = THREE.SRGBColorSpace;

/**
 * Fonts
 */

const fontsURL = {
  gentilis: '/fonts/gentilis_regular.typeface.json',
  optimer: '/fonts/optimer_regular.typeface.json',
  droid: '/fonts/droid/droid_sans_regular.typeface.json',
};

/**
 * Objects Declaration
 */

const donutGeo = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
const donutMat = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
const randomizeDonutsMeshesConfig = {
  x: 20,
  y: 20,
  z: 20,
};
/* Create Donuts */
const donuts = createDonuts(
  donutsGroup,
  300,
  donutGeo,
  donutMat,
  randomizeDonutsMeshesConfig
);

texture.colorSpace = THREE.SRGBColorSpace;

/**
 * Cubes Creator
 */

const cubeGeometriesConfig = {
  width: 1,
  height: 1,
  depth: 1,
  widthSegments: 10,
  heightSegments: 10,
  depthSagment: 1,
};

const cubeMaterial: THREE.MeshMatcapMaterial = new THREE.MeshMatcapMaterial({
  matcap: matcapTexture,
});

const cubeGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(
  cubeGeometriesConfig.width,
  cubeGeometriesConfig.height,
  cubeGeometriesConfig.depth,
  cubeGeometriesConfig.widthSegments,
  cubeGeometriesConfig.heightSegments,
  cubeGeometriesConfig.depthSagment
);

const cubesGroup = new THREE.Group();

const randomizeCubesMeshesConfig = {
  x: 30,
  y: 30,
  z: 30,
};
const cubes = createCubes(
  cubesGroup,
  200,
  cubeGeometry,
  cubeMaterial,
  randomizeCubesMeshesConfig
);

scene.add(cubesGroup);

const camera = createCamera();

const cubesConfig = {
  mapNum: defaultCubesDonutsMapNum,
  cubes,
  randomizeCubes: () => randomizeMeshes(cubes, randomizeCubesMeshesConfig),
  changeRandomizeX: (e: number) =>
    randomizeMeshes(cubes, {
      ...randomizeCubesMeshesConfig,
      x: e,
    }),
  randomizeCubesMeshesConfig,
};

const donutsConfig = {
  mapNum: defaultCubesDonutsMapNum,
  donuts,
  randomizeDonuts: () => randomizeMeshes(donuts, randomizeDonutsMeshesConfig),
};

const appConfig: IAppConfigOptions = {
  user: {
    isLoggedIn: false,
  },
  font: null as any,
  mapNum: 0,
  scene: scene as IAppConfigOptions['scene'],
  camera: camera,
  fontPath: fontsURL.optimer,
  text: 'GAZA',
  materialParams: {
    matcap: texture,
  },
  geometryParams: {
    size: 0.5,
    height: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  } as ITextGeometryParameters, // Add specific geometry parameters if needed
  texture: texture,
  material: undefined,
  textGeo: undefined,
  textMesh: null as any,
  presets: [],
  updateTextCB: (
    textGeo: TextGeometry,
    material: any,
    font: Font,
    text3DMesh: THREE.Mesh
  ) => {
    // Custom update logic here
    appConfig.textGeo = textGeo;
    appConfig.font = font;
    appConfig.geometryParams.font = font;
    appConfig.material = material;
  },
  updateTextShape: function (): void {
    return updateText(appConfig.textGeo, appConfig.text.toString(), {
      font: appConfig.font,
      ...appConfig.geometryParams,
    });
    // }
  },
};

/**
 * Stats
 */

const statsConfig = {
  stats1: new Stats(),
  stats2: new Stats(),
  stats3: new Stats(),
  scene: scene,
};

let stats1 = statsConfig.stats1;
stats1.showPanel(0);
stats1.dom.style.cssText = 'position:absolute;top:0px;left:0px;';
document.body.appendChild(stats1.dom);

let stats2 = statsConfig.stats2;
stats2.showPanel(1);
stats2.dom.style.cssText = 'position:absolute;top:0px;left:80px;';
document.body.appendChild(stats2.dom);

let stats3 = statsConfig.stats3;
stats3.showPanel(2);
stats3.dom.style.cssText = 'position:absolute;top:0px;left:160px;';
document.body.appendChild(stats3.dom);

scene.add(donutsGroup);

/**
 * Lights
 */
// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight);

// const pointLight = new THREE.PointLight(0xffffff, 30);
// pointLight.position.x = 2;
// pointLight.position.y = 3;
// pointLight.position.z = 4;
// scene.add(pointLight);

// /**
//  * Camera
//  */

function handleWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.set(1, 1, 2);
  return camera;
}

function configureRenderer() {
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  return renderer;
}

function renderScene(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) {
  renderer.clear();
  // Main Camera Renderer

  renderer.setViewport(0, 0, sizes.width, sizes.height);
  renderer.render(scene, camera);
  // renderer.render(scene, customCam);
  renderer.setScissorTest(false);
  return renderer;
}

function render() {
  renderScene(camera, renderer);
}

const mainCamController = createCamControls(camera, canvas);

const updatedPresetParams = getPresetTextConfig({
  objsConfigs: {
    appConfig,
    cubesConfig,
    donutsConfig,
  },
  currentControls: mainCamController,
  camera,
});

const currentFileData = await updatedPresetParams.readData();

text3D(appConfig)
  .then((res: THREE.Mesh) => {
    const textTweaks = editTextObject(appConfig);
    textTweaks.changeTexture();
    textTweaks.updateText();
    textTweaks.changeBevel();

    const donutsTweaks = editDonutsObject(donutsConfig);
    donutsTweaks.changeTexture();
    donutsTweaks.randomizeDonutsAgain();

    const cubesTweaks = editCubesObject(cubesConfig);

    cubesTweaks.changeCubesMatcap();
    cubesTweaks.randomizeCubes();
    cubesTweaks.changeCubesRandomizeSpreads();

    // updatedPresetParams.openInfoSection();
    openInfoSection();

    // stats
    showHideStats(statsConfig);

    // cameraControlsGUIHandler();

    // Change later to save to database.
    uploadNewPresetGUI({
      appConfig,
      donutsConfig,
      cubesConfig,
      control: mainCamController,
      camera,
      renderer,
    });

    // textConfig.scene.background = new THREE.Color(0x000);
    appConfig.scene.backgroundHex = 0x000;
    changeBackgroundColor(appConfig.scene);

    cameraFOV(camera);

    return res;
  })
  .catch((error) => {
    console.error('Error loading font:', error);
  });

/**
 * Renderer
 */
const renderer = configureRenderer();

window.addEventListener('resize', () => {
  handleWindowResize();
});

/**
 * Controller
 */
function createCamControls(
  camera: THREE.Camera | THREE.PerspectiveCamera,
  canvas: HTMLElement | undefined
) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  function setBoundaries() {
    // controls.minDistance = 0;
    // controls.maxDistance = 10;
    // controls.maxTargetRadius = 15;
    // controls.minTargetRadius = -15;

    controls.minAzimuthAngle = -(Math.PI / 2) * 1.4;
    controls.maxAzimuthAngle = (Math.PI / 2) * 1.4;
  }
  // setBoundaries();

  function removeBoundaries() {
    controls.minDistance = -Infinity;
    controls.maxDistance = Infinity;
    controls.minTargetRadius = -Infinity;
    controls.maxTargetRadius = Infinity;

    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
  }
  const funcs = {
    setBoundaries,
    removeBoundaries,
  };
  addRemoveControlsBoundaries(funcs);

  return controls;
}

function smoothResetControls(
  obj: {
    controls: OrbitControls;
    presetControls?: THREE.Vector3;
  },
  duration: number = 1
) {
  const controls = obj.controls;

  const initialPosition = controls.object.position.clone();
  const initialTarget = controls.target.clone();
  const targetPosition = new THREE.Vector3(1, 1, 2);
  const targetTarget = new THREE.Vector3(0, 0, 0); // Set the target to the center of the scene
  const startTime = Date.now();

  function updateControls() {
    const currentTime = Date.now();
    const elapsed = (currentTime - startTime) / 1000; // convert to seconds
    const t = Math.min(1, elapsed / duration); // clamp to 1 after duration seconds

    controls.object.position.lerpVectors(initialPosition, targetPosition, t);
    // controls.target.lerpVectors(initialTarget, targetTarget, t);

    if (t < 1) {
      // Continue updating until t reaches 1
      requestAnimationFrame(updateControls);
    }
  }

  // Start the animation
  updateControls();
}

const controlsGUIConfig = {
  mainCamController,
  reset: () => {
    smoothResetControls({ controls: mainCamController });
  },
};

function cameraControlsGUIHandler() {
  const controller = cameraControlsGUI(controlsGUIConfig);

  controller.resetCamera;
}

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // Update controls
  mainCamController.update();

  // Render
  render();
  // renderer.render(scene, camera);

  // update stats
  stats1.update();
  stats2.update();
  stats3.update();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

/**
 * Helper functions
 */

// const helper = {
//   removeText: removeText,
// };

// gui.add(helper, 'removeText');
