// Mark this file as a Client Component so it runs in the browser
"use client";

// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

// Import React plus the useState, useEffect hooks and the Suspense component
import { React, useState, useEffect, Suspense } from "react";
// Import Next.js dynamic() to load a component only when it is needed
import dynamic from "next/dynamic";
// Import the helper that listens for real-time changes to one restaurant
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js";
// Import the hook that returns the signed-in user
import { useUser } from "@/src/lib/getUser";
// Import the component that displays the restaurant's details
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx";
// Import the helper that uploads a new restaurant image
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js";

// Load the review dialog lazily so its code is only downloaded when shown
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

// The Restaurant component and the props it receives
export default function Restaurant({
  // The restaurant's ID
  id,
  // The restaurant data loaded on the server
  initialRestaurant,
  // The user ID known on the server
  initialUserId,
  // Child elements to display inside the details (the reviews list)
  children,
  // Close the props list and open the component body
}) {
  // State holding the restaurant's details, starting with the server data
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);
  // State tracking whether the review dialog is open
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;
  // State holding the review being written
  const [review, setReview] = useState({
    // Start with no stars
    rating: 0,
    // Start with empty text
    text: "",
    // Close the initial review object and the useState call
  });

  // Update one field of the review being written
  const onChange = (value, name) => {
    // Copy the review and replace the named field with the new value
    setReview({ ...review, [name]: value });
    // End of onChange
  };

  // Handle a new image chosen in the file input
  async function handleRestaurantImage(target) {
    // Get the first chosen file, or null if there is none
    const image = target.files ? target.files[0] : null;
    // If no file was chosen
    if (!image) {
      // Stop without doing anything
      return;
      // End of the file check
    }

    // Upload the image and get its public URL
    const imageURL = await updateRestaurantImage(id, image);
    // Show the new image right away by updating the photo in state
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
    // End of handleRestaurantImage
  }

  // Close the review dialog and clear the review
  const handleClose = () => {
    // Close the dialog
    setIsOpen(false);
    // Reset the review to empty
    setReview({ rating: 0, text: "" });
    // End of handleClose
  };

  // Subscribe to real-time updates for this restaurant
  useEffect(() => {
    // Start listening and return the unsubscribe function so React cleans up
    return getRestaurantSnapshotById(id, (data) => {
      // Save the latest restaurant data into state
      setRestaurantDetails(data);
      // Close the snapshot callback
    });
    // Re-subscribe whenever the restaurant ID changes
  }, [id]);

  // Render the restaurant page content
  return (
    // A fragment that groups elements without adding extra HTML
    <>
      {/* Show the restaurant details and pass along the handlers it needs */}
      <RestaurantDetails
        // The current restaurant data
        restaurant={restaurantDetails}
        // The signed-in user's ID
        userId={userId}
        // The image upload handler
        handleRestaurantImage={handleRestaurantImage}
        // Function to open or close the review dialog
        setIsOpen={setIsOpen}
        // Whether the review dialog is open
        isOpen={isOpen}
      >
        {/* Render the children (the reviews list) inside the details */}
        {children}
      </RestaurantDetails>
      {/* Only show the review dialog when a user is signed in */}
      {userId && (
        // Show a loading message while the dialog code downloads
        <Suspense fallback={<p>Loading...</p>}>
          {/* The review dialog */}
          <ReviewDialog
            // Whether the dialog is open
            isOpen={isOpen}
            // Function that closes the dialog
            handleClose={handleClose}
            // The review being written
            review={review}
            // Function that updates the review
            onChange={onChange}
            // The signed-in user's ID
            userId={userId}
            // The restaurant's ID
            id={id}
          />
        </Suspense>
      )}
    </>
    // Close the returned JSX
  );
  // End of Restaurant
}
