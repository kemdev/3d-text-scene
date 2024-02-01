import * as THREE from 'three';
import { BufferGeometry } from 'three';
import { Group } from 'three';
import { Material } from 'three';
import { Mesh, Scene } from 'three';
import {
  TextGeometry,
  TextGeometryParameters,
} from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import {
  ICubeProps,
  IAppConfigOptions,
  ITextGeometryParameters,
} from '../types/types';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Assume you have an array of texture paths
export const texturePaths = [
  '/textures/matcaps/1.png',
  '/textures/matcaps/2.png',
  '/textures/matcaps/3.png',
  '/textures/matcaps/4.png',
  '/textures/matcaps/5.png',
  '/textures/matcaps/6.png',
  '/textures/matcaps/7.png',
  '/textures/matcaps/8.png',
  '/textures/matcaps/9.jpg',
  '/textures/matcaps/10.jpg',
  '/textures/matcaps/11.jpg',
  '/textures/matcaps/12.jpg',
  '/textures/matcaps/13.jpg',
  '/textures/matcaps/14.jpg',
  '/textures/matcaps/15.jpg',
  '/textures/matcaps/16.jpg',
  '/textures/matcaps/17.jpg',
  '/textures/matcaps/18.jpg',
  '/textures/matcaps/19.jpg',
  '/textures/matcaps/20.jpg',
  '/textures/matcaps/21.jpg',
  '/textures/matcaps/22.jpg',
  '/textures/matcaps/23.png',
  '/textures/matcaps/24.jpg',
  '/textures/matcaps/25.jpg',
  '/textures/matcaps/26.jpg',
  '/textures/matcaps/27.jpg',
  '/textures/matcaps/28.jpg',
  '/textures/matcaps/29.jpg',
  // ... add more paths as needed
];

// Preload all textures
const textureLoader = new THREE.TextureLoader();
const preloadedTextures: THREE.Texture[] = texturePaths.map((path) =>
  textureLoader.load(path)
);

function createMeshes(
  scene: Scene | Group<THREE.Object3DEventMap>,
  count: number,
  geo: BufferGeometry,
  mat: Material | Material[]
) {
  const meshes: Mesh[] = [];

  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    meshes.push(mesh);
  }

  return meshes;
}
function randomizeMeshes(
  donuts: THREE.Mesh[],
  spreadConfig?: {
    x?: number;
    y?: number;
    z?: number;
  }
) {
  const randomDonuts = donuts.forEach((donut) => {
    // update position
    donut.position.x = (Math.random() - 0.5) * (spreadConfig?.x || 10);
    donut.position.y = (Math.random() - 0.5) * (spreadConfig?.y || 10);
    donut.position.z = (Math.random() - 0.5) * (spreadConfig?.z || 10);

    // Update rotation
    donut.rotation.x = Math.random() * Math.PI;
    donut.rotation.y = Math.random() * Math.PI;

    // Update scale
    const scale = Math.random();
    donut.scale.set(scale, scale, scale);
  });

  return randomDonuts;
}

function createDonuts(
  scene: Scene | Group<THREE.Object3DEventMap>,
  count: number,
  donutGeo: BufferGeometry,
  material: Material | Material[],
  spreadConfig?: {
    x?: number;
    y?: number;
    z?: number;
  }
) {
  const donuts = createMeshes(scene, count, donutGeo, material);
  randomizeMeshes(donuts, spreadConfig);
  return donuts;
}

function createCubes(
  scene: Scene | Group<THREE.Object3DEventMap>,
  count: number,
  geometry: THREE.BoxGeometry,
  material: THREE.MeshMatcapMaterial,
  spreadConfig?: {
    x?: number;
    y?: number;
    z?: number;
  }
) {
  geometry.dispose();
  material.dispose();
  const cubes = createMeshes(scene, count, geometry, material);
  randomizeMeshes(cubes, spreadConfig);
  return cubes;
}

/**
 * @remarks This function is called with the following parameters: scene,
 * fontPath, text, textMaterialParams, textGeometryParams, and updateText.
 * @remarks This function needs the scene to remove the previous text and add a new one.
 */
function text3D(appConfig: IAppConfigOptions) {
  const {
    scene,
    fontPath = '/fonts/helvetiker_regular.typeface.json',
    text,
    materialParams,
    geometryParams,
    texture,
    updateTextCB,
  } = appConfig;

  return new Promise<Mesh>((resolve, reject) => {
    const loader = new FontLoader();
    loader.load(
      fontPath,
      (font) => {
        const textGeo = createCenteredTextGeo(text, {
          ...{ font: font },
          ...geometryParams,
        });

        const material = new THREE.MeshMatcapMaterial({
          matcap: texture || getTextureBasedOnMapNum(),
          ...materialParams,
        });

        material.needsUpdate = true;

        const currentText = scene.getObjectByName('test');
        const text3DMesh = refreshText(textGeo, material, {
          scene,
          currentText,
        });
        text3DMesh.name = 'test';

        if (updateTextCB) {
          updateTextCB(textGeo, material, font, text3DMesh);
        }

        scene.add(text3DMesh);

        resolve(text3DMesh);
      },
      (e) => {
        return e;
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 *
 * @param textGeo Geometry best use this function @seeFunction createCenteredTextGeo
 * @param textMat Material
 * @param removeCurrentText
 * @returns
 */
function refreshText(
  textGeo: TextGeometry,
  textMat: Material,
  removeCurrentText: {
    scene: Group<THREE.Object3DEventMap> | Scene;
    currentText: THREE.Object3D<THREE.Object3DEventMap> | undefined | undefined;
  } | null
) {
  if (removeCurrentText) {
    const { scene, currentText } = removeCurrentText;
    // 1. remove the previous Text
    if (currentText) scene.remove(currentText);
  }
  // 2. create the new one.
  return createTextMesh(textGeo, textMat);
}

/**
 *
 * @param textGeo TextGeometry
 * @param textMat Material
 * @returns Mesh with the provided geometry and material
 */
function createTextMesh(textGeo: TextGeometry, textMat: Material) {
  const mesh = new THREE.Mesh(textGeo, textMat);
  return mesh;
}

/**
 *
 * @param text The text to be displayed
 * @param obj Text Parameters in an Object as a TextGeometryParameters.
 * @returns textGeometry: the geometry of the text.
 */
function createCenteredTextGeo(text: string, obj: TextGeometryParameters) {
  const textGeometry = new TextGeometry(text, obj);
  textGeometry.center();
  return textGeometry;
}

function updateText(
  textGeometry: TextGeometry,
  newText: string,
  obj: TextGeometryParameters
) {
  // Remove the previous geometry
  textGeometry.dispose();

  // Merge the options from the existing parameters with the updated ones
  const updatedParamsOptions = {
    ...textGeometry.parameters.options,
    ...obj,
  };
  // Create a new TextGeometry with the updated text
  const updatedGeometry = createCenteredTextGeo(newText, updatedParamsOptions);

  // Copy properties from the updated geometry to the existing geometry
  textGeometry.copy(updatedGeometry);
}

function updateBevels(
  textGeo: TextGeometry,
  currentText: string,
  obj: TextGeometryParameters
) {
  // // updateText(textGeo, currentText, obj);

  textGeo.computeBoundingBox();
  updateText(textGeo, currentText, obj);
}

function updateTexture(
  material: THREE.MeshMatcapMaterial,
  textureIndex: number
) {
  // Dispose the current texture
  material.matcap?.dispose();
  // Set the new texture
  material.matcap = preloadedTextures[textureIndex];
  // Ensure the material updates
  preloadedTextures[textureIndex].colorSpace = THREE.SRGBColorSpace;
}

function updateViewFromPreset(
  obj: {
    currentControls: OrbitControls; // current controls
    viewConfig?: THREE.Vector3;
  },
  duration: number = 1
) {
  const controls = obj.currentControls;
  const presetControls = obj.viewConfig;

  const initialPosition = controls.object.position.clone();
  const initialTarget = controls.target.clone();
  // const targetPosition = new THREE.Vector3(1, 1, 2);
  const targetPosition = presetControls as THREE.Vector3;
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

function getTextureBasedOnMapNum(): THREE.Texture {
  return preloadedTextures[0];
}

function updateObjects(obj: {
  objects: {
    appConfig: IAppConfigOptions | undefined;
    cubesConfig: any;
    donutsConfig: any;
    cameraConfig: {
      camera: THREE.PerspectiveCamera;
      cameraParams: {
        fov: number;
      };
    };
  };

  controls: {
    currentControls: OrbitControls;
    viewConfig: THREE.Vector3 | undefined;
  };
}) {
  const appConfig = obj.objects.appConfig;
  const cubesConfig = obj.objects.cubesConfig;
  const donutsConfig = obj.objects.donutsConfig;

  const cameraConfig = obj.objects.cameraConfig;
  const camera = cameraConfig.camera;
  const cameraParams = cameraConfig.cameraParams;
  const fov = cameraParams.fov;

  // Function to update the mesh with the selected variant
  function presetTextGeometriesParams() {
    updateTexture(appConfig!.material, appConfig!.mapNum);
    appConfig!.updateTextShape();

    return appConfig;
  }

  function updateCubesMapNum(cubesConfig: { cubes: any[]; mapNum: any }) {
    // Update material for all cubes
    cubesConfig.cubes.forEach((cubes: any) => {
      const mapNum = cubesConfig.mapNum;
      updateTexture(cubes.material, mapNum);
    });
  }

  function updateDonutsMapNum(donutsConfig: { donuts: any[]; mapNum: any }) {
    // Update material for all cubes
    donutsConfig.donuts.forEach((donut: any) => {
      const mapNum = donutsConfig.mapNum;
      updateTexture(donut.material, mapNum);
    });
  }

  function updateCameraFOV(targetFOV: number, duration = 1000) {
    const startTime = Date.now();
    const startFOV = camera.fov;

    function update() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const newFOV = startFOV + (targetFOV - startFOV) * progress;

      camera.fov = newFOV;
      camera.updateProjectionMatrix();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    update();
  }

  presetTextGeometriesParams();
  updateViewFromPreset(obj.controls);
  updateCubesMapNum(cubesConfig);
  updateDonutsMapNum(donutsConfig);
  updateCameraFOV(fov);
}

// Function to handle open info button
function openInfoSection() {
  const infoButton = document.getElementById('open-info-button');
  const infoContainer = document.getElementById('info-container');
  const infoContent = document.getElementById('info-content');

  let isRotating = false;

  const toggleOpenInfo = () => {
    if (isRotating) return;

    if (infoContainer && infoButton) {
      const infoContainerHeight = window.getComputedStyle(infoContainer).height;

      if (infoContainerHeight == '64px' || !infoContainerHeight) {
        infoContainer.style.height = '50%';
        infoButton.style.transform = 'rotate(180deg)';
        infoButton.style.borderBottomLeftRadius = '5px';
        infoButton.style.borderBottomRightRadius = '5px';
        infoButton.style.borderTopRightRadius = '0';
        infoButton.style.borderTopLeftRadius = '0';
        infoButton.className += ' radius-changes '; // Set a circular border radius
      } else {
        // infoContainer?.classList.add('info-opened');
        infoContainer.style.height = '64px';
        infoButton.style.transform = 'rotate(0deg)';
        infoButton.style.borderBottomLeftRadius = '0px';
        infoButton.style.borderBottomRightRadius = '0px';
        infoButton.style.borderTopRightRadius = '5px';
        infoButton.style.borderTopLeftRadius = '5px';
        infoButton.className += ' radius-changes '; // Set a circular border radius
      }
      isRotating = true;
    }
  };

  const handleTransitionEnd = () => {
    isRotating = false;
    // infoButton!!.style.borderRadius = '5px'; // Reset to original or remove the style attribute
    infoButton?.classList.remove('radius-changes'); // Set a circular border radius
    // infoButton?.removeEventListener('transitionend', handleTransitionEnd);
  };

  infoButton?.addEventListener('click', toggleOpenInfo);
  infoButton?.addEventListener('transitionend', handleTransitionEnd);
}

function updateGeometryParams(
  target: ITextGeometryParameters,
  source: ITextGeometryParameters
) {
  target.bevelEnabled = source.bevelEnabled;
  target.bevelOffset = source.bevelOffset;
  target.bevelSegments = source.bevelSegments;
  target.bevelSize = source.bevelSize;
  target.bevelThickness = source.bevelThickness;
  target.curveSegments = source.curveSegments;
}

export {
  createDonuts,
  text3D,
  createCenteredTextGeo,
  updateText,
  updateTexture,
  getTextureBasedOnMapNum,
  updateBevels,
  updateObjects,
  randomizeMeshes,
  createCubes,
  preloadedTextures,
  openInfoSection,
  updateGeometryParams,
};
