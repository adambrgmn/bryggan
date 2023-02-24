import * as firebase from 'firebase-admin';

try {
  firebase.initializeApp({
    databaseURL: 'https://sst-bryggan.firebaseio.com',
    credential: firebase.credential.cert({
      projectId: 'sst-bryggan',
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
} catch (error) {
  if (!(error instanceof Error) || !error.message.includes('app already exists')) throw error;
}

export const app = firebase.app();
export const { database } = app;
