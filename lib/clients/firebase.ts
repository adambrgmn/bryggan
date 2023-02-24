import { initializeApp } from 'firebase/app';
import { signInWithEmailAndPassword as _signInWithEmailAndPassword, getAuth } from 'firebase/auth';

export const app = initializeApp({
  projectId: 'sst-bryggan',
  apiKey: process.env.FIREBASE_API_KEY,
});

export const auth = getAuth(app);

export function signInWithEmailAndPassword(email: string, password: string) {
  return _signInWithEmailAndPassword(auth, email, password);
}
