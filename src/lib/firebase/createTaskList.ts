import { db } from "./firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function createTaskList(userId: string, listName: string) {
  if (!userId) {
    throw new Error("User ID is required to create a task list.");
  }
  if (!listName || listName.trim() === "") {
    throw new Error("Task list name cannot be empty.");
  }

  try {
    // Get a reference to the 'taskLists' subcollection for the specific user
    const taskListsCollectionRef = collection(db, "Users", userId, "TaskLists");

    // Add a new document to the 'taskLists' subcollection
    const newTaskListRef = await addDoc(taskListsCollectionRef, {
      name: listName.trim(), // Store the trimmed list name
      createdAt: Timestamp.now(), // Store the creation timestamp
      // You might add other default fields here if needed, e.g., order: 0
    });

    console.log("New task list created with ID:", newTaskListRef.id);

    return newTaskListRef; // Return the reference to the new document

  } catch (error: any) {
    console.error("error creating task list:", error);
    // Re-throw the error so the calling code can handle it
    throw new Error(`Failed to create task list: ${error.message}`);
  }
}
