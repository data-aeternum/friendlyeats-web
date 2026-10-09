// Import the Firebase Authentication helpers this module wraps
import {
  // GoogleAuthProvider configures sign-in with a Google account
  GoogleAuthProvider,
  // signInWithPopup opens a browser popup window for the Google sign-in flow
  signInWithPopup,
  // Rename the SDK's onAuthStateChanged so our exported wrapper can reuse the name
  onAuthStateChanged as _onAuthStateChanged,
  // Rename the SDK's onIdTokenChanged so our exported wrapper can reuse the name
  onIdTokenChanged as _onIdTokenChanged,
  // Close the import list and name the package it comes from
} from "firebase/auth";

// Import the shared client-side Auth instance created in clientApp.js
import { auth } from "@/src/lib/firebase/clientApp";

// Register a callback that runs whenever a user signs in or signs out
export function onAuthStateChanged(cb) {
  // Hand the callback to Firebase and return its unsubscribe function
  return _onAuthStateChanged(auth, cb);
  // End of onAuthStateChanged
}

// Register a callback that runs whenever the user's ID token changes (sign-in, sign-out, token refresh)
export function onIdTokenChanged(cb) {
  // Hand the callback to Firebase and return its unsubscribe function
  return _onIdTokenChanged(auth, cb);
  // End of onIdTokenChanged
}

// Sign the user in with their Google account
export async function signInWithGoogle() {
  // Create a provider object that tells Firebase to use Google as the identity provider
  const provider = new GoogleAuthProvider();

  // Attempt the sign-in and catch any failure so the app does not crash
  try {
    // Open the Google sign-in popup and wait for the user to finish
    await signInWithPopup(auth, provider);
    // If the popup fails or is closed, handle the error here
  } catch (error) {
    // Log the error to the browser console for debugging
    console.error("Error signing in with Google", error);
    // End of the try/catch block
  }
  // End of signInWithGoogle
}

// Sign the current user out of the app
export async function signOut() {
  // Attempt the sign-out and catch any failure
  try {
    // Ask Firebase to sign out and return the resulting promise
    return auth.signOut();
    // If sign-out fails, handle the error here
  } catch (error) {
    // Log the error to the browser console for debugging
    console.error("Error signing out with Google", error);
    // End of the try/catch block
  }
  // End of signOut
}
