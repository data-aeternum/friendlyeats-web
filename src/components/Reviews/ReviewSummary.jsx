// Import the Google AI plugin for Genkit (it also provides model references)
import { googleAI } from "@genkit-ai/googleai";
// Import the function that creates a Genkit AI instance
import { genkit } from "genkit";
// Import the helper that reads all reviews for a restaurant
import { getReviewsByRestaurantId } from "@/src/lib/firebase/firestore.js";
// Import the helper that creates a Firebase app signed in as the current user
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
// Import the function that returns the Firestore database for a Firebase app
import { getFirestore } from "firebase/firestore";

// Server Component that asks Gemini to summarize a restaurant's reviews
export async function GeminiSummary({ restaurantId }) {
  // Get a Firebase app that acts on behalf of the signed-in user
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Read all of this restaurant's reviews
  const reviews = await getReviewsByRestaurantId(
    // The Firestore database for the server app
    getFirestore(firebaseServerApp),
    // The restaurant whose reviews to read
    restaurantId
    // Close the getReviewsByRestaurantId call
  );

  // The character used to separate reviews in the prompt
  const reviewSeparator = "@";
  // Build the prompt: instructions plus all review texts joined by the separator
  const prompt = `
    Based on the following restaurant reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the restaurant. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  // Try to generate the summary, catching any error
  try {
    // Make sure the Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://genkit.dev/docs/get-started/
      // Stop with a helpful error if the key is missing
      throw new Error(
        // The error message
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
        // Close the Error constructor
      );
      // End of the API key check
    }

    // Configure a Genkit instance.
    const ai = genkit({
      // Use the Google AI plugin, which reads GEMINI_API_KEY
      plugins: [googleAI()],
      // Use Gemini 2.5 Flash as the default model
      // (the tutorial's gemini-2.0-flash is retired, so this uses the always-current Flash alias)
      model: googleAI.model("gemini-flash-latest"), // set default model
      // Close the configuration object
    });
    // Send the prompt to Gemini and keep the text of its answer
    const { text } = await ai.generate(prompt);

    // Render the summary
    return (
      // Container styled as the review summary box
      <div className="restaurant__review_summary">
        {/* The one-sentence summary from Gemini */}
        <p>{text}</p>
        {/* Label that credits Gemini */}
        <p>✨ Summarized with Gemini</p>
      </div>
      // Close the returned JSX
    );
    // If generating failed, handle the error here
  } catch (e) {
    // Log the error for debugging
    console.error(e);
    // Show a simple error message instead of the summary
    return <p>Error summarizing reviews.</p>;
    // End of the try/catch block
  }
  // End of GeminiSummary
}

// Placeholder shown while the summary is still being generated
export function GeminiSummarySkeleton() {
  // Render the loading message
  return (
    // Container styled as the review summary box
    <div className="restaurant__review_summary">
      {/* Loading text */}
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
    // Close the returned JSX
  );
  // End of GeminiSummarySkeleton
}
