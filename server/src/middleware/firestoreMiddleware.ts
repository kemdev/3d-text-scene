import express, { NextFunction, Request, Response } from 'express';
import { admin, app } from '../db/db';
import { firestore } from 'firebase-admin';
import { Storage } from 'firebase-admin/storage';
import { Auth } from 'firebase-admin/lib/auth/auth';

declare global {
  namespace Express {
    interface Request {
      firestore: firestore.Firestore;
      storage: Storage;
      auth: Auth;
    }
  }
}

// Middleware to attach Firestore instance to the request
export const attachFirestore = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.firestore = admin.firestore();
  req.storage = admin.storage();
  req.auth = app.auth();
  next();
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionCookie = req.cookies.session || '';
    const auth = await req.auth.verifySessionCookie(sessionCookie, true);
    req.cookies.currentSessionDecodedIdToken = auth;
    next();
  } catch (error: any) {
    console.log('AUTH error:', error.message);
    res.status(400).send(error.message);
  }
};
