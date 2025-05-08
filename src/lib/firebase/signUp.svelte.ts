import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Timestamp, setDoc, doc } from 'firebase/firestore';

let error: string | null = null;

export async function handleSignup(email: string, password: any) {
  error = null; // Clear previous errors
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Signed up successfully 
    const user = userCredential.user;
    console.log("User signed up:", user.uid);
    console.log("moving on to new collections");

    try {
      console.log("Attempting to create user document for UID:", user.uid);
      await setDoc(doc(db, "Users", user.uid), {
        email: email.trim(),
        createdAt: Timestamp.now(),
      });
      console.log("Successfully created user document for UID:", user.uid); // This should print if it worked
    } catch (error: any) {
      // Log the entire error object first!
      console.error("Firestore operation failed. Full error object:", error);

      // Now try to get specific properties (use optional chaining ?. just in case)
      const errorCode = error?.code;
      const errorMessage = error?.message;
      console.error("Error Code:", errorCode);
      console.error("Error Message:", errorMessage);

      // Set reactive state (provide a fallback message)
      error = errorMessage || "Failed to save user data. Please try again.";
    }
  } catch (error: any) {
    // Handle errors
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error signing up:", errorCode, errorMessage);
    error = errorMessage; // Set error message to display to the user
  }
}
