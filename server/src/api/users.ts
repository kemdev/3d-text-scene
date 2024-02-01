import express from 'express';
import { IUserProp } from '../types/user';
import { sendVerificationEmail } from '../util/email';
import { GenerateVerifyEmailLink } from '../util/users';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { admin, app } from '../db/db';

const router = express.Router();

router.post('/signup', signup);
async function signup(req: express.Request, res: express.Response) {
  const firestore = req.firestore;
  const body = req.body;
  const data = body.data;
  const auth = req.auth;

  if (data) {
    const user: IUserProp = JSON.parse(data);
    try {
      const userResponse = await req.auth
        .createUser({
          ...user,
          emailVerified: false,
          disabled: false,
        })
        .then(async (userCredential) => {
          const newUser = {
            ...user,
            uid: userCredential.uid,
            created: userCredential.metadata.creationTime,
            emailVerified: userCredential.emailVerified,
          };

          const docRef = await firestore
            .collection('users')
            .doc(newUser.uid)
            .set(newUser, { merge: true });

          const verificationLink = await GenerateVerifyEmailLink(
            auth,
            user.email
          );

          if (verificationLink.success) {
            sendVerificationEmail(
              user.email,
              user.displayedName,
              verificationLink.link
            );
          }

          // return { userCredential, docRef };
          return userCredential;
        })
        .catch((rejected) => {
          res.json({
            code: rejected.code,
            success: false,
            statusCode: 500,
            message: rejected.message,
          });
        });

      res.json(userResponse);
    } catch (error: any) {
      console.log('🚀 ~ signup ~ error:', error);
      res.json({
        code: error.code,
        success: false,
        statusCode: 500,
        message: error.message,
      });
    }
  } else {
    res.send({
      success: false,
      message: "you didn't provide user info!",
    });
  }
}

router.get('/check-email-exists', emailAlreadyExists);
async function emailAlreadyExists(req: express.Request, res: express.Response) {
  try {
    const { email } = req.query;
    console.log('🚀 ~ emailAlreadyExists ~ email:', email);

    if (email) {
      const firebase = req.firestore;
      const querySnapshot = firebase
        .collection('users')
        .where('email', '==', email)
        .limit(1);

      const isEmpty = (await querySnapshot.get()).empty;

      // if result is true then the email is NOT exist!
      if (!isEmpty) {
        return res.send({
          success: true,
          isExist: true,
          emailProvided: email,
        });
      }

      return res.send({
        success: true,
        isExist: !isEmpty,
        emailProvided: email,
      });
    } else
      return res.send({
        success: false,
        exist: false,
        error: 'email not provided',
      });
  } catch (error: any) {
    console.log('=====ERROR======', error.message);
    res.statusCode = 400;
    res.send({
      success: false,
      error: error.message,
    });
  }
}

router.get('/login', login);
async function login(req: express.Request, res: express.Response) {
  const firestore = req.firestore;
  const auth1 = req.auth;
  const auth = getAuth(auth1.app);
  const email = req.body.email;
  const password = req.body.password;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log('🚀 ~ signInWithEmailAndPassword ~ user:', user);
      res.send({
        success: true,
      });
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      res.send({
        success: false,
        errorCode,
        errorMessage,
      });
    });
}

// async function deleteUser() {
//   // make sure to delete the user data from authentication and the firestore as well.
// }

export default router;
