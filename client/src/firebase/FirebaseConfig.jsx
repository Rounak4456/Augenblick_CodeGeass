import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from './Firebase';

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);