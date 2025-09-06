'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "chronovault-c0tfb",
  appId: "1:1069877241496:web:2e3d774dc871f58e9192ed",
  storageBucket: "chronovault-c0tfb.firebasestorage.app",
  apiKey: "AIzaSyBJ3WlMLxgqGf9SW9tpLE2JWSTvIX8lAbo",
  authDomain: "chronovault-c0tfb.firebaseapp.com",
  messagingSenderId: "1069877241496"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
