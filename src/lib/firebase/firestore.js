// Import the helper that generates fake restaurants and reviews for sample data
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

// Import the Cloud Firestore functions used in this module
import {
  // collection() returns a reference to a collection of documents
  collection,
  // onSnapshot() listens for real-time changes to a query or document
  onSnapshot,
  // query() builds a query from a collection plus constraints
  query,
  // getDocs() runs a query once and returns the matching documents
  getDocs,
  // doc() returns a reference to a single document
  doc,
  // getDoc() reads a single document once
  getDoc,
  // updateDoc() changes fields in an existing document
  updateDoc,
  // orderBy() sorts query results by a field
  orderBy,
  // Timestamp is Firestore's date/time type
  Timestamp,
  // runTransaction() performs several reads and writes atomically
  runTransaction,
  // where() filters query results by a field value
  where,
  // addDoc() creates a new document with an auto-generated ID
  addDoc,
  // getFirestore() returns the Firestore database for a Firebase app
  getFirestore,
  // Close the import list and name the package it comes from
} from "firebase/firestore";

// Import the shared client-side Firestore database instance
import { db } from "@/src/lib/firebase/clientApp";

// Save the public URL of an uploaded image on a restaurant document
export async function updateRestaurantImageReference(
  // The ID of the restaurant document to update
  restaurantId,
  // The public URL of the uploaded image
  publicImageUrl
  // Close the parameter list and open the function body
) {
  // Build a reference to the restaurant document inside the "restaurants" collection
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  // Only continue if a reference was created
  if (restaurantRef) {
    // Set the restaurant's "photo" field to the new image URL
    await updateDoc(restaurantRef, { photo: publicImageUrl });
    // End of the if block
  }
  // End of updateRestaurantImageReference
}

// Update a restaurant's rating totals and save a new review inside a transaction (implemented in a later tutorial step)
const updateWithRating = async (
  // The Firestore transaction object
  transaction,
  // Reference to the restaurant document
  docRef,
  // Reference to the new rating document
  newRatingDocument,
  // The review data to save
  review
  // Close the parameter list and open the function body
) => {
  // Placeholder: does nothing until the reviews step of the tutorial
  return;
  // End of updateWithRating
};

// Add a user's review to a restaurant (implemented in a later tutorial step)
export async function addReviewToRestaurant(db, restaurantId, review) {
  // Placeholder: does nothing until the reviews step of the tutorial
  return;
  // End of addReviewToRestaurant
}

// Add filter and sort constraints to a query based on the user's chosen filters
function applyQueryFilters(q, { category, city, price, sort }) {
  // If a category was chosen (for example "Indian")
  if (category) {
    // Keep only restaurants whose category matches
    q = query(q, where("category", "==", category));
    // End of the category filter
  }
  // If a city was chosen
  if (city) {
    // Keep only restaurants in that city
    q = query(q, where("city", "==", city));
    // End of the city filter
  }
  // If a price was chosen (shown as "$", "$$", "$$$" or "$$$$")
  if (price) {
    // Price is stored as a number, so compare against the count of "$" characters
    q = query(q, where("price", "==", price.length));
    // End of the price filter
  }
  // If the sort is "Rating" or no sort was chosen
  if (sort === "Rating" || !sort) {
    // Sort by average rating, highest first
    q = query(q, orderBy("avgRating", "desc"));
    // Otherwise, if the sort is "Review"
  } else if (sort === "Review") {
    // Sort by number of reviews, most first
    q = query(q, orderBy("numRatings", "desc"));
    // End of the sort options
  }
  // Return the query with all constraints applied
  return q;
  // End of applyQueryFilters
}

// Read the list of restaurants once (used by the server-rendered home page)
export async function getRestaurants(db = db, filters = {}) {
  // Start with a query for every document in the "restaurants" collection
  let q = query(collection(db, "restaurants"));

  // Add the user's filters and sort order to the query
  q = applyQueryFilters(q, filters);
  // Run the query once and wait for the results
  const results = await getDocs(q);
  // Convert each Firestore document into a plain JavaScript object
  return results.docs.map((doc) => {
    // Return the object for this document
    return {
      // Include the document ID
      id: doc.id,
      // Copy all of the document's fields
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      // Convert the Firestore Timestamp into a JavaScript Date
      timestamp: doc.data().timestamp.toDate(),
      // Close the returned object
    };
    // Close the map callback
  });
  // End of getRestaurants
}

// Listen for real-time changes to the restaurant list (used by the client component)
export function getRestaurantsSnapshot(cb, filters = {}) {
  // Make sure a callback function was provided
  if (typeof cb !== "function") {
    // Log an error if it was not
    console.log("Error: The callback parameter is not a function");
    // Stop without subscribing
    return;
    // End of the callback check
  }

  // Start with a query for every document in the "restaurants" collection
  let q = query(collection(db, "restaurants"));
  // Add the user's filters and sort order to the query
  q = applyQueryFilters(q, filters);

  // Subscribe to the query and return the unsubscribe function
  return onSnapshot(q, (querySnapshot) => {
    // Convert each document in the latest snapshot into a plain object
    const results = querySnapshot.docs.map((doc) => {
      // Return the object for this document
      return {
        // Include the document ID
        id: doc.id,
        // Copy all of the document's fields
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        // Convert the Firestore Timestamp into a JavaScript Date
        timestamp: doc.data().timestamp.toDate(),
        // Close the returned object
      };
      // Close the map callback
    });

    // Send the updated restaurant list to the callback
    cb(results);
    // Close the onSnapshot callback
  });
  // End of getRestaurantsSnapshot
}

// Read a single restaurant once by its ID
export async function getRestaurantById(db, restaurantId) {
  // Make sure a restaurant ID was provided
  if (!restaurantId) {
    // Log an error if it was not
    console.log("Error: Invalid ID received: ", restaurantId);
    // Stop without reading
    return;
    // End of the ID check
  }
  // Build a reference to the restaurant document
  const docRef = doc(db, "restaurants", restaurantId);
  // Read the document once
  const docSnap = await getDoc(docRef);
  // Return the document's data as a plain object
  return {
    // Copy all of the document's fields
    ...docSnap.data(),
    // Convert the Firestore Timestamp into a JavaScript Date
    timestamp: docSnap.data().timestamp.toDate(),
    // Close the returned object
  };
  // End of getRestaurantById
}

// Listen for real-time changes to a single restaurant
export function getRestaurantSnapshotById(restaurantId, cb) {
  // Make sure a restaurant ID was provided
  if (!restaurantId) {
    // Log an error if it was not
    console.log("Error: Invalid ID received: ", restaurantId);
    // Stop without subscribing
    return;
    // End of the ID check
  }

  // Make sure a callback function was provided
  if (typeof cb !== "function") {
    // Log an error if it was not
    console.log("Error: The callback parameter is not a function");
    // Stop without subscribing
    return;
    // End of the callback check
  }

  // Build a reference to the restaurant document
  const docRef = doc(db, "restaurants", restaurantId);
  // Subscribe to the document and return the unsubscribe function
  return onSnapshot(docRef, (docSnap) => {
    // Send the latest restaurant data to the callback
    cb({
      // Copy all of the document's fields
      ...docSnap.data(),
      // Convert the Firestore Timestamp into a JavaScript Date
      timestamp: docSnap.data().timestamp.toDate(),
      // Close the object passed to the callback
    });
    // Close the onSnapshot callback
  });
  // End of getRestaurantSnapshotById
}

// Read all reviews for a restaurant once, newest first
export async function getReviewsByRestaurantId(db, restaurantId) {
  // Make sure a restaurant ID was provided
  if (!restaurantId) {
    // Log an error if it was not
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    // Stop without reading
    return;
    // End of the ID check
  }

  // Build a query for the restaurant's "ratings" subcollection
  const q = query(
    // Point at restaurants/{restaurantId}/ratings
    collection(db, "restaurants", restaurantId, "ratings"),
    // Sort by timestamp, newest first
    orderBy("timestamp", "desc")
    // Close the query call
  );

  // Run the query once and wait for the results
  const results = await getDocs(q);
  // Convert each review document into a plain object
  return results.docs.map((doc) => {
    // Return the object for this review
    return {
      // Include the document ID
      id: doc.id,
      // Copy all of the review's fields
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      // Convert the Firestore Timestamp into a JavaScript Date
      timestamp: doc.data().timestamp.toDate(),
      // Close the returned object
    };
    // Close the map callback
  });
  // End of getReviewsByRestaurantId
}

// Listen for real-time changes to a restaurant's reviews, newest first
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  // Make sure a restaurant ID was provided
  if (!restaurantId) {
    // Log an error if it was not
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    // Stop without subscribing
    return;
    // End of the ID check
  }

  // Build a query for the restaurant's "ratings" subcollection
  const q = query(
    // Point at restaurants/{restaurantId}/ratings
    collection(db, "restaurants", restaurantId, "ratings"),
    // Sort by timestamp, newest first
    orderBy("timestamp", "desc")
    // Close the query call
  );
  // Subscribe to the query and return the unsubscribe function
  return onSnapshot(q, (querySnapshot) => {
    // Convert each review in the latest snapshot into a plain object
    const results = querySnapshot.docs.map((doc) => {
      // Return the object for this review
      return {
        // Include the document ID
        id: doc.id,
        // Copy all of the review's fields
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        // Convert the Firestore Timestamp into a JavaScript Date
        timestamp: doc.data().timestamp.toDate(),
        // Close the returned object
      };
      // Close the map callback
    });
    // Send the updated review list to the callback
    cb(results);
    // Close the onSnapshot callback
  });
  // End of getReviewsSnapshotByRestaurantId
}

// Write a batch of fake restaurants and their reviews to Firestore (the "Add sample restaurants" menu item)
export async function addFakeRestaurantsAndReviews() {
  // Generate the fake restaurant and review data
  const data = await generateFakeRestaurantsAndReviews();
  // Loop over each restaurant and its list of reviews
  for (const { restaurantData, ratingsData } of data) {
    // Try to write this restaurant, catching any error so the loop continues
    try {
      // Add the restaurant as a new document in the "restaurants" collection
      const docRef = await addDoc(
        // Target the "restaurants" collection
        collection(db, "restaurants"),
        // The restaurant's fields
        restaurantData
        // Close the addDoc call
      );

      // Loop over each review for this restaurant
      for (const ratingData of ratingsData) {
        // Add the review to the restaurant's "ratings" subcollection
        await addDoc(
          // Target restaurants/{new restaurant ID}/ratings
          collection(db, "restaurants", docRef.id, "ratings"),
          // The review's fields
          ratingData
          // Close the addDoc call
        );
        // End of the reviews loop
      }
      // If writing failed, handle the error here
    } catch (e) {
      // Log a simple message
      console.log("There was an error adding the document");
      // Log the full error for debugging
      console.error("Error adding document: ", e);
      // End of the try/catch block
    }
    // End of the restaurants loop
  }
  // End of addFakeRestaurantsAndReviews
}
