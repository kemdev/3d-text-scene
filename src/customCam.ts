// const customCameraConfig = {
//   fov: 75,
//   aspect: sizes.width / sizes.height,
//   near: 0.1,
//   far: 100,
// };


// function createCustomCamera() {
//   const customCam = new THREE.PerspectiveCamera(
//     customCameraConfig.fov,
//     customCameraConfig.aspect,
//     customCameraConfig.near,
//     customCameraConfig.far
//   );
//   customCam.position.set(0, 0, 10);
//   customCam.lookAt(0, 0, 0);
//   return customCam;
// }

// const customCam = createCustomCamera();
// const customCamController = createCamControls(customCam, canvas);
// customCamController.enabled = true;

// customCam.aspect = viewportWidthSmall / viewportHeightSmall;
// customCam.fov = 15;
// customCameraConfig.fov = customCam.fov;
// customCam.updateProjectionMatrix();

// // Important to make both cameras same in first render
// customCam.position.copy(camera.position);
// customCam.quaternion.copy(camera.quaternion);

// // Add to tick recursive function.
// // customCamController.update();

// NOTE to render the scene with the smaller scene in the bottom left corner


// const viewportWidthSmall = sizes.width * sizes.smallCamWidth;
// const viewportHeightSmall = sizes.height * 0.2;
// function renderScene(
//   camera: THREE.PerspectiveCamera,
//   renderer: THREE.WebGLRenderer
// ) {
//   renderer.clear();
//   // Main Camera Renderer

//   renderer.setViewport(0, 0, sizes.width, sizes.height);
//   renderer.render(scene, camera);

//   const left = 10;
//   const bottom = 10;

//   // Set the size of the viewport for the custom camera
//   renderer.clearDepth(); // important!

//   renderer.setScissorTest(true);

//   renderer.setViewport(left, bottom, viewportWidthSmall, viewportHeightSmall);
//   renderer.setScissor(left, bottom, viewportWidthSmall, viewportHeightSmall);

//   renderer.render(scene, customCam);
//   renderer.setScissorTest(false);
//   return renderer;
// }

// NOTE Add to lil-gui controller
// controller.customCameraFOV.onChange((e: number) => {
//   customCam.fov = e;
//   customCam.updateProjectionMatrix();
// });

// NOTE lil-gui
// function toggleCameraController(cameraObj: any) {
//   const { mainCamController, customCamController, customCameraConfig, reset } =
//     cameraObj;
//   const camerasControllerFolder = gui.addFolder('Cameras');

//   let currentStatus = 'Enable';
//   const name = (currentStatus: string): string => {
//     const result = currentStatus + ' Both Camera Controller';
//     return result;
//   };

//   function enableBoth() {
//     currentStatus = mainCamController.enabled
//       ? 'Enable'
//       : customCamController.enabled
//       ? 'Enable'
//       : 'Disable';
//     mainCamController.enabled = !customCamController.enabled;
//     customCamController.enabled = !customCamController.enabled;
//     toggleController.name(name(currentStatus));
//   }

//   const mainCameraEnabled = camerasControllerFolder
//     .add(mainCamController, 'enabled')
//     .name('Main Camera Controller')
//     .onChange((e: any) => {
//       mainCamController.enabled = e;
//       customCamController.enabled = !e;
//     })
//     .listen();

//   const customCameraEnabled = camerasControllerFolder
//     .add(customCamController, 'enabled')
//     .name('Corner Left Controller')
//     .onChange((e: boolean) => {
//       customCamController.enabled = e;
//       mainCamController.enabled = !e;
//     })
//     .listen();

//   const toggleController = camerasControllerFolder
//     .add({ enable: () => {} }, 'enable')
//     .name(name(currentStatus))
//     .onChange(enableBoth)
//     .listen();

//   const customCameraFOV = camerasControllerFolder
//     .add(customCameraConfig, 'fov')
//     .name('Field of View')
//     .min(1)
//     .max(150)
//     .step(1)
//     .listen();

//   const customCamAspectWidth = camerasControllerFolder
//     .add(customCameraConfig, 'aspect')
//     .min(100)
//     .max(1550)
//     .step(1);

//   const resetCamera = camerasControllerFolder.add(cameraObj, 'reset');

//   return {
//     mainCameraEnabled,
//     customCameraEnabled,
//     toggleController,
//     customCameraFOV,
//     resetCamera,
//   };
// }
