import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

let currentUser: string = $state("");

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user.uid);
    currentUser = user.uid;
    // Update your application's state with the user object
  } else {
    // User is signed out
    console.log("User is signed out");
    currentUser = '';
    // Update your application's state to reflect signed out state
  }
});

// You can then access the currentUser from your state management or context
export function getCurrentUser(): string {
  return currentUser; // This will give you the *currently known* state
}

// For components or logic that need to wait for the initial state:
export function waitForAuthState() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Unsubscribe after the first state is received
      resolve(user);
    });
  });
}
