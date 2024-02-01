import express from 'express';
import { Firestore } from '@google-cloud/firestore';

interface IPresetsProps {
  _id: string;
  created_by: string;
  preset: {
    name: string;
    mapNum: number;
    geometryParams: ITextGeometryParameters;
    screenshot?: string;
    viewParams?: {
      position: { x: number; y: number; z: number }; // for the controls;
      fov?: number; // for the camera;
    };
  };
  timestamp?: string;
}

interface ITextGeometryParameters {
  font?: any;
  size?: number | undefined;
  height?: number | undefined;
  curveSegments?: number | undefined;
  bevelEnabled?: boolean | undefined;
  bevelThickness?: number | undefined;
  bevelSize?: number | undefined;
  bevelOffset?: number | undefined;
  bevelSegments?: number | undefined;
}

interface IResult {
  success: boolean;
  url: string;
  message?: string;
  error?: string;
}

interface RequestWithFirestoreMiddleware extends express.Request {
  firestore: FirebaseFirestore.Firestore;
}

export {
  IPresetsProps,
  ITextGeometryParameters,
  IResult,
  RequestWithFirestoreMiddleware,
};
