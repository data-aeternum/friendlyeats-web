// Mark this file as a Client Component so it runs in the browser
"use client";

// This components handles the review dialog and uses a next.js feature known as Server Actions to handle the form submission

// Import React hooks: useLayoutEffect runs after render before paint, useRef holds a DOM reference
import { useEffect, useLayoutEffect, useRef } from "react";
// Import the star-rating picker shown in the form
import RatingPicker from "@/src/components/RatingPicker.jsx";
// Import the Server Action that saves the submitted review
import { handleReviewFormSubmission } from "@/src/app/actions.js";

// The review dialog component and the props it receives
const ReviewDialog = ({
  // Whether the dialog should be open
  isOpen,
  // Function that closes the dialog
  handleClose,
  // The review currently being written ({ rating, text })
  review,
  // Function that updates a field of the review
  onChange,
  // The signed-in user's ID
  userId,
  // The restaurant's ID
  id,
  // Close the props list and open the component body
}) => {
  // Create a reference to the <dialog> element
  const dialog = useRef();

  // dialogs only render their backdrop when called with `showModal`
  useLayoutEffect(() => {
    // If the dialog should be open
    if (isOpen) {
      // Open it as a modal with a backdrop
      dialog.current.showModal();
      // Otherwise
    } else {
      // Close it
      dialog.current.close();
      // End of the if/else
    }
    // Re-run whenever isOpen or the dialog reference changes
  }, [isOpen, dialog]);

  // Handle mouse clicks on the dialog
  const handleClick = (e) => {
    // close if clicked outside the modal
    if (e.target === dialog.current) {
      // Close the dialog
      handleClose();
      // End of the outside-click check
    }
    // End of handleClick
  };

  // Render the dialog
  return (
    // The <dialog> element, linked to the ref, listening for clicks outside the form
    <dialog ref={dialog} onMouseDown={handleClick}>
      {/* The form that sends its data to the Server Action */}
      <form
        // Submit the form data to handleReviewFormSubmission on the server
        action={handleReviewFormSubmission}
        // When the form is submitted
        onSubmit={() => {
          // Close the dialog
          handleClose();
          // End of the onSubmit handler
        }}
      >
        {/* Dialog header */}
        <header>
          {/* Dialog title */}
          <h3>Add your review</h3>
        </header>
        {/* Main body of the form */}
        <article>
          {/* Star rating picker (sends the "rating" field) */}
          <RatingPicker />

          {/* Paragraph wrapping the text input */}
          <p>
            {/* Text box for the review */}
            <input
              // A single-line text input
              type="text"
              // Sent to the server as the "text" field
              name="text"
              // HTML id for the input
              id="review"
              // Hint text shown when empty
              placeholder="Write your thoughts here"
              // The form cannot be submitted while this is empty
              required
              // Show the current review text from state
              value={review.text}
              // Update the review text in state as the user types
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          {/* Hidden field that sends the restaurant ID with the form */}
          <input type="hidden" name="restaurantId" value={id} />
          {/* Hidden field that sends the user ID with the form */}
          <input type="hidden" name="userId" value={userId} />
        </article>
        {/* Dialog footer with the buttons */}
        <footer>
          {/* Group of action buttons */}
          <menu>
            {/* Cancel button */}
            <button
              // Focus this button when the dialog opens
              autoFocus
              // Reset the form fields
              type="reset"
              // Close the dialog when clicked
              onClick={handleClose}
              // CSS class for styling
              className="button--cancel"
            >
              {/* Button label */}
              Cancel
            </button>
            {/* Submit button that sends the form */}
            <button type="submit" value="confirm" className="button--confirm">
              {/* Button label */}
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
    // Close the returned JSX
  );
  // End of ReviewDialog
};

// Export the component so other files can use it
export default ReviewDialog;
