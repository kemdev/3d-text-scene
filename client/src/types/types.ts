import {
  Camera,
  ExtrudeGeometryOptions,
  Group,
  Mesh,
  MeshMatcapMaterialParameters,
  PerspectiveCamera,
  Scene,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';

interface IGuiAddProps {
  $1?: number | object | any[] | undefined;
  max?: number | undefined;
  step?: number | undefined;
}

interface ITextObjectProps {
  material: any;
  textGeo: any;
  mapNum: number;
  textMesh: Mesh;
  text: string;
  updateTextShape: () => void;
}

interface IPresetsProps {
  _id: string;
  created_by: string;
  preset: {
    name: string;
    text: string;
    mapNum: number;
    geometryParams: ITextGeometryParameters;
    screenshot?: string;
    viewParams: {
      position: THREE.Vector3; // for the controls;
      fov?: number; // for the camera;
    };
    cubesMapNum: number;
    donutsMapNum: number;
    bgColor: number | null; // hex number;
  };
  timestamp?: string;
}

interface ICubesOptions {
  mapNum: number;
}

interface IDonutsOptions {
  mapNum: number;
}

interface IAppConfigOptions extends ITextObjectProps {
  user: {
    isLoggedIn: boolean;
  };
  font: Font;
  scene: {
    background: THREE.Color;
    backgroundHex: number | null;
  } & THREE.Scene;
  camera: PerspectiveCamera;
  fontPath?: string;
  text: string;
  materialParams?: MeshMatcapMaterialParameters;
  geometryParams: ITextGeometryParameters;
  texture?: THREE.Texture;
  updateTextCB?: (
    textGeometry: TextGeometry,
    material: any,
    font: Font,
    text3DMesh: Mesh
  ) => void;
  updateTextConfig?: (options?: IAppConfigOptions & ITextObjectProps) => void;
  presets: IPresetsProps[] | null;
  updatePresets?: Function;
}

interface ITextGeometryParameters extends ExtrudeGeometryOptions {
  font?: Font;
  size?: number | undefined;
  height?: number | undefined;
  curveSegments?: number | undefined;
  bevelEnabled?: boolean | undefined;
  bevelThickness?: number | undefined;
  bevelSize?: number | undefined;
  bevelOffset?: number | undefined;
  bevelSegments?: number | undefined;
}

interface IScreenshotProps {
  renderer: THREE.Renderer;
  scene: THREE.Scene | THREE.Group;
  camera: THREE.PerspectiveCamera;
}

interface ICubeProps {
  width: number;
  height: number;
  depth: number;
  widthSegments: number;
  heightSegments: number;
  depthSegments: number;
}

interface IObjectsConfigs {
  appConfig: IAppConfigOptions;
  donutsConfig: IDonutsOptions;
  cubesConfig: ICubesOptions;
  currentControls: OrbitControls;
}

// interface IPresetsProps extends IVariantsDataProps {}

export {
  IGuiAddProps,
  ITextObjectProps,
  IAppConfigOptions,
  ITextGeometryParameters,
  IScreenshotProps,
  ICubeProps,
  IPresetsProps,
  IObjectsConfigs,
};
