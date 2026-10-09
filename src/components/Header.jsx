// Mark this file as a client component so it runs in the browser (it uses hooks and click handlers)
"use client";
// Import React and the useEffect hook for running side effects after render
import React, { useEffect } from "react";
// Import Next.js's Link component for client-side navigation
import Link from "next/link";
// Import our authentication helper functions
import {
  // Function that starts the Google sign-in popup
  signInWithGoogle,
  // Function that signs the user out
  signOut,
  // Function that subscribes to changes in the user's ID token
  onIdTokenChanged,
  // Close the import list and name the module it comes from
} from "@/src/lib/firebase/auth.js";
// Import the function that writes sample restaurants and reviews to Firestore
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";
// Import cookie helpers used to share the ID token with the server
import { setCookie, deleteCookie } from "cookies-next";

// Custom hook that keeps the browser's session cookie in sync with Firebase Auth
function useUserSession(initialUser) {
  // Run this effect after the component mounts and whenever initialUser changes
  useEffect(() => {
    // Subscribe to ID token changes; returning the unsubscribe function cleans up on unmount
    return onIdTokenChanged(async (user) => {
      // Check whether someone is signed in
      if (user) {
        // Get the signed-in user's current ID token
        const idToken = await user.getIdToken();
        // Store the token in the "__session" cookie so server components can read it
        await setCookie("__session", idToken);
        // Otherwise nobody is signed in
      } else {
        // Remove the session cookie so the server treats the visitor as signed out
        await deleteCookie("__session");
        // End of the if/else block
      }
      // If the user the server rendered with is the same as the current user, nothing changed
      if (initialUser?.uid === user?.uid) {
        // Stop here without reloading the page
        return;
        // End of the if block
      }
      // The user changed (signed in or out), so reload to re-render server content as the new user
      window.location.reload();
      // Close the onIdTokenChanged callback
    });
    // Close useEffect, listing initialUser as its dependency
  }, [initialUser]);

  // Return the user that was passed in from the server render
  return initialUser;
  // End of useUserSession
}

// Export the Header component, which receives the server-rendered user as a prop
export default function Header({ initialUser }) {
  // Keep the session cookie in sync and get the current user
  const user = useUserSession(initialUser);

  // Click handler for the "Sign Out" link
  const handleSignOut = (event) => {
    // Stop the link from navigating to "#"
    event.preventDefault();
    // Sign the user out of Firebase
    signOut();
    // End of handleSignOut
  };

  // Click handler for the "Sign In with Google" link
  const handleSignIn = (event) => {
    // Stop the link from navigating to "#"
    event.preventDefault();
    // Open the Google sign-in popup
    signInWithGoogle();
    // End of handleSignIn
  };

  // Return the JSX markup for the header
  return (
    // Page header element
    <header>
      {/* Logo link that goes back to the home page */}
      <Link href="/" className="logo">
        {/* FriendlyEats logo image */}
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        {/* Site name text */}
        Friendly Eats
        {/* Close the logo link */}
      </Link>
      {/* If a user is signed in, show the profile menu; otherwise show the sign-in link */}
      {user ? (
        // Fragment that groups the signed-in markup
        <>
          {/* Container for the signed-in user's profile */}
          <div className="profile">
            {/* Paragraph showing the user's picture and name */}
            <p>
              {/* User's profile picture */}
              <img
                // CSS class for the round profile image
                className="profileImage"
                // Use the Google profile photo, or a placeholder if there is none
                src={user.photoURL || "/profile.svg"}
                // Use the user's email as the image's alt text
                alt={user.email}
                // Close the img element
              />
              {/* User's display name */}
              {user.displayName}
              {/* Close the paragraph */}
            </p>

            {/* Drop-down menu container */}
            <div className="menu">
              {/* Three dots that reveal the menu on hover */}
              ...
              {/* List of menu items */}
              <ul>
                {/* Menu item showing the user's name */}
                <li>{user.displayName}</li>

                {/* Menu item for adding sample data */}
                <li>
                  {/* Link that writes sample restaurants to Firestore when clicked */}
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    {/* Link text */}
                    Add sample restaurants
                    {/* Close the link */}
                  </a>
                  {/* Close the list item */}
                </li>

                {/* Menu item for signing out */}
                <li>
                  {/* Link that signs the user out when clicked */}
                  <a href="#" onClick={handleSignOut}>
                    {/* Link text */}
                    Sign Out
                    {/* Close the link */}
                  </a>
                  {/* Close the list item */}
                </li>
                {/* Close the list */}
              </ul>
              {/* Close the menu container */}
            </div>
            {/* Close the profile container */}
          </div>
          {/* Close the fragment */}
        </>
        // Otherwise (no user signed in)
      ) : (
        // Container for the sign-in link
        <div className="profile">
          {/* Link that starts Google sign-in when clicked */}
          <a href="#" onClick={handleSignIn}>
            {/* Placeholder profile image */}
            <img src="/profile.svg" alt="A placeholder user image" />
            {/* Link text */}
            Sign In with Google
            {/* Close the link */}
          </a>
          {/* Close the sign-in container */}
        </div>
        // Close the conditional expression
      )}
      {/* Close the header element */}
    </header>
    // Close the returned JSX
  );
  // End of the Header component
}
