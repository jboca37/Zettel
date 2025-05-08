import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";

let error: string | null = $state(null); // Reactive state for handling errors

export async function handleLogIn(email: string, password: string) { // Corrected function name
  error = null; // Clear previous errors
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Signed in successfully
    const user = userCredential.user;
    console.log("User signed in:", user.uid);
  } catch (e: any) {
    // Handle errors
    const errorCode = e.code;
    const errorMessage = e.message;
    console.error("Error signing in:", errorCode, errorMessage);
    error = errorMessage; // Set error message to display to the user
  }
}
