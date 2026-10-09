// Import the client component that displays the grid of restaurant cards
import RestaurantListings from "@/src/components/RestaurantListings.jsx";
// Import the function that reads restaurants from Firestore
import { getRestaurants } from "@/src/lib/firebase/firestore.js";
// Import the helper that creates a Firebase app on the server for the signed-in user
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// Import the function that returns the Firestore database for a Firebase app
import { getFirestore } from "firebase/firestore";

// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it

// Export the "dynamic" route setting so this page is rendered fresh on every request
export const dynamic = "force-dynamic";

// This line also forces this route to be server-side rendered
// export const revalidate = 0;

// Define the home page as an async server component that receives the route props
export default async function Home(props) {
  // Wait for the URL query parameters (searchParams is a promise in recent Next.js versions)
  const searchParams = await props.searchParams;
  // Using seachParams which Next.js provides, allows the filtering to happen on the server-side, for example:
  // ?city=London&category=Indian&sort=Review
  // Create a server-side Firebase app that acts as the current user
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Fetch the restaurant list from Firestore on the server
  const restaurants = await getRestaurants(
    // Use the Firestore database that belongs to the server-side Firebase app
    getFirestore(firebaseServerApp),
    // Apply any filters from the URL (city, category, price, sort)
    searchParams
    // Close the getRestaurants call
  );
  // Return the JSX markup for the page
  return (
    // Wrap the page content in a <main> element with the home-page CSS class
    <main className="main__home">
      {/* Render the restaurant listings client component */}
      <RestaurantListings
        // Pass the server-fetched restaurants so the first render already has data
        initialRestaurants={restaurants}
        // Pass the URL filters so the client component knows which filters are active
        searchParams={searchParams}
        // Close the RestaurantListings element
      />
      {/* Close the main element */}
    </main>
    // Close the returned JSX
  );
  // End of the Home component
}
