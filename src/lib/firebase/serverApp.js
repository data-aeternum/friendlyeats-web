// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
// Importing "server-only" makes the build fail if a client component ever imports this file
import "server-only";

// Import the Next.js helper that reads the cookies sent with the incoming request
import { cookies } from "next/headers";
// Import the functions that create a normal Firebase app and a server-side Firebase app
import { initializeServerApp, initializeApp } from "firebase/app";

// Import the function that returns the Auth service for a given Firebase app
import { getAuth } from "firebase/auth";

// Returns an authenticated client SDK instance for use in Server Side Rendering
// and Static Site Generation
export async function getAuthenticatedAppForUser() {
  // Read the "__session" cookie (the user's ID token set by the Header component), if present
  const authIdToken = (await cookies()).get("__session")?.value;

  // Firebase Server App is a new feature in the JS SDK that allows you to
  // instantiate the SDK with credentials retrieved from the client & has
  // other affordances for use in server environments.
  // Create a server-side Firebase app that acts on behalf of the signed-in user
  const firebaseServerApp = initializeServerApp(
    // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
    // Initialize a base app with no arguments so App Hosting supplies the config automatically
    initializeApp(),
    // Options object for the server app
    {
      // Pass the user's ID token so server requests are made as that user
      authIdToken,
      // Close the options object
    }
    // Close the initializeServerApp call
  );

  // Get the Auth service attached to the server app
  const auth = getAuth(firebaseServerApp);
  // Wait until Auth has finished verifying the ID token and knows who the user is
  await auth.authStateReady();

  // Return the server app plus the current user (null when nobody is signed in)
  return { firebaseServerApp, currentUser: auth.currentUser };
  // End of getAuthenticatedAppForUser
}
