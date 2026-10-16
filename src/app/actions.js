// Mark every function in this file as a Server Action that runs only on the server
"use server";

// Import the helper that saves a review to Firestore
import { addReviewToRestaurant } from "@/src/lib/firebase/firestore.js";
// Import the helper that creates a Firebase app signed in as the current user
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// Import the function that returns the Firestore database for a Firebase app
import { getFirestore } from "firebase/firestore";

// This is a Server Action
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
// Handle the review form when the user clicks Submit
export async function handleReviewFormSubmission(data) {
  // Get a Firebase app that acts on behalf of the signed-in user
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Get the Firestore database for that app
  const db = getFirestore(firebaseServerApp);

  // Save the review using the form's field values
  await addReviewToRestaurant(db, data.get("restaurantId"), {
    // The review text the user typed
    text: data.get("text"),
    // The star rating the user picked
    rating: data.get("rating"),

    // This came from a hidden form field.
    userId: data.get("userId"),
    // Close the review object and the function call
  });
  // End of handleReviewFormSubmission
}
