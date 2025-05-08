import { db } from "./firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export async function updateTaskList(userId: string, newListName: string, taskListId: string) {
  if (!userId) {
    throw new Error("User ID is required to create a task list.");
  }
  if (!newListName || newListName.trim() === "") {
    throw new Error("Task list name cannot be empty.");
  }

  try {
    // Get a reference to the a specific taskList doc 
    const taskListsCollectionRef = doc(db, "Users", userId, "TaskLists", taskListId);

    // Update doc name
    await updateDoc(taskListsCollectionRef, {
      name: newListName.trim(),
    });

    console.log("Doc updated with ID:", taskListId);
  } catch (error: any) {
    console.error("error creating task list:", error);
    // Re-throw the error so the calling code can handle it
    throw new Error(`Failed to create task list: ${error.message}`);
  }
}
