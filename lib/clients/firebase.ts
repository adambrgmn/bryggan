import { initializeApp } from 'firebase/app';
import { signInWithEmailAndPassword as _signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { z } from 'zod';

import { app as admin } from './firebase-admin';

export const app = initializeApp({
  projectId: 'sst-bryggan',
  apiKey: process.env.FIREBASE_API_KEY,
});

export const auth = getAuth(app);

export function signInWithEmailAndPassword(email: string, password: string) {
  return _signInWithEmailAndPassword(auth, email, password);
}

const TokenPath = 'data/refresh_token';
const TokenSchema = z.string().min(8);

export async function getRefreshToken() {
  let snapshot = await admin.database().ref(TokenPath).once('value');
  return TokenSchema.parse(snapshot.val());
}

export async function updateRefreshToken(value: string) {
  await admin.database().ref(TokenPath).set(value);
}
