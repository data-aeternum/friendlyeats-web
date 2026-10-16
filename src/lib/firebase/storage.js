// Import the Cloud Storage functions: ref() points at a file, uploadBytesResumable() uploads it, getDownloadURL() gets its public URL
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Import the shared client-side Cloud Storage instance
import { storage } from "@/src/lib/firebase/clientApp";

// Import the helper that saves the image URL on the restaurant's Firestore document
import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore";

// Upload a new restaurant image and save its URL on the restaurant
export async function updateRestaurantImage(restaurantId, image) {
  // Try the upload, catching any error
  try {
    // Make sure a restaurant ID was provided
    if (!restaurantId) {
      // Stop with an error if it was not
      throw new Error("No restaurant ID has been provided.");
      // End of the ID check
    }

    // Make sure a real file with a name was provided
    if (!image || !image.name) {
      // Stop with an error if it was not
      throw new Error("A valid image has not been provided.");
      // End of the image check
    }

    // Upload the image to Cloud Storage and get its public URL
    const publicImageUrl = await uploadImage(restaurantId, image);
    // Save that URL in the restaurant's "photo" field in Firestore
    await updateRestaurantImageReference(restaurantId, publicImageUrl);

    // Return the URL so the page can show the new image right away
    return publicImageUrl;
    // If anything failed, handle the error here
  } catch (error) {
    // Log the error for debugging
    console.error("Error processing request:", error);
    // End of the try/catch block
  }
  // End of updateRestaurantImage
}

// Upload an image file to Cloud Storage and return its download URL
async function uploadImage(restaurantId, image) {
  // Store the file at images/{restaurantId}/{file name}
  const filePath = `images/${restaurantId}/${image.name}`;
  // Create a reference to that location in the storage bucket
  const newImageRef = ref(storage, filePath);
  // Upload the file and wait for it to finish
  await uploadBytesResumable(newImageRef, image);

  // Return the public URL of the uploaded file
  return await getDownloadURL(newImageRef);
  // End of uploadImage
}
