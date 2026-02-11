
'use server';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export async function initializeFirebaseOnServer() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

  return {
    firebaseApp: getApp(),
    firestore: getFirestore(),
  };
}
