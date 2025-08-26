import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check if we have the required environment variables
const hasFirebaseConfig = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

let adminDb: any = null;

if (hasFirebaseConfig) {
  const firebaseAdminConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  };

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(firebaseAdminConfig),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  adminDb = getFirestore();
} else {
  console.warn('Firebase Admin SDK not initialized: Missing environment variables');
  // Create a mock database for build-time
  adminDb = {
    collection: () => ({
      doc: () => ({ 
        get: () => Promise.resolve({ exists: false, data: () => null }) 
      }),
      where: () => ({ 
        get: () => Promise.resolve({ 
          empty: true, 
          docs: [] as Array<{ data: () => any }> 
        }) 
      }),
    }),
    runTransaction: () => Promise.resolve({}),
  };
}

export { adminDb };
export { FieldValue } from 'firebase-admin/firestore';