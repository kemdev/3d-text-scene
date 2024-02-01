import { Auth } from 'firebase-admin/lib/auth/auth';

async function GenerateVerifyEmailLink(auth: Auth, email: string) {
  const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for
    // this URL must be whitelisted in the Firebase Console.
    url: 'http://localhost:5173/verfication/:email',
    handleCodeInApp: false,
  };

  try {
    const link = await auth
      .generateEmailVerificationLink(email, actionCodeSettings)
      .catch((error: any) => {
        return {
          success: false,
          message: error.message,
        };
      });

    return {
      success: true,
      link,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}


export { GenerateVerifyEmailLink };
