import { db } from "./firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function createTask(userId: string, taskName: string, currentList: string) {
  if (!userId) {
    throw new Error("User ID is required to create a task list.");
  }
  if (!taskName || taskName.trim() === "") {
    throw new Error("Task list name cannot be empty.");
  }

  try {
    // Get a reference to the 'taskLists' subcollection for the specific user
    const tasksCollectionRef = collection(db, "Users", userId, "Tasks");

    // Add a new document to the 'taskLists' subcollection
    const newTaskDoc = await addDoc(tasksCollectionRef, {
      name: taskName.trim(), // Store the trimmed list name
      createdAt: Timestamp.now(), // Store the creation timestamp
      parentListId: currentList.trim(),
      // You might add other default fields here if needed, e.g., order: 0
    });

    console.log("New task list created with ID:", newTaskDoc.id);

    return newTaskDoc; // Return the reference to the new document

  } catch (error: any) {
    console.error("error creating task list:", error);
    // Re-throw the error so the calling code can handle it
    throw new Error(`Failed to create task list: ${error.message}`);
  }
}
