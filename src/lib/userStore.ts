// userStore.ts
import { load } from "@tauri-apps/plugin-store";

// Define the structure for user statistics
interface UserStats {
  numberOfNotes: number;
  username: string;
  profilePicture: string | null; // Can be a path, URL, or null if not set
  daysLogged: number;
}

// Define the initial default user stats data
const initialUserStatsData: UserStats = {
  numberOfNotes: 0,
  username: "New User", // Or "New User" or some default
  profilePicture: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
  daysLogged: 0,
};

const USER_STORE_FILE = "user.json";
const USER_STATS_STORE_KEY = "userStats"; // Key within the user.json file

/**
 * Initializes the user statistics store with default data if it doesn't exist.
 * This should typically be called once on app startup.
 */
export async function initializeUserStatsStore(): Promise<void> {
  try {
    const store = await load(USER_STORE_FILE, { autoSave: false });

    console.log(`Attempting to load user store: ${USER_STORE_FILE}`);
    console.log("Initial user store entries:", await store.entries());

    // Check if the 'userStats' key already exists
    const existingUserStats = await store.get<UserStats>(USER_STATS_STORE_KEY);

    if (!existingUserStats) {
      console.log("No existing user stats found. Initializing with default data.");
      // If the key doesn't exist, set the default data
      await store.set(USER_STATS_STORE_KEY, initialUserStatsData);
      await store.save(); // Save immediately after initialization

      console.log("User stats initialized and saved.");
      console.log("Final user store entries after initialization:", await store.entries());
    } else {
      console.log("User stats already exist. No initialization needed.");
      // Optionally log existing stats or certain properties
      console.log("Existing username:", existingUserStats.username);
      console.log("Existing notes count:", existingUserStats.numberOfNotes);
    }
  } catch (error) {
    console.error("Error initializing user stats store:", error);
  }
}

/**
 * Gets the current user statistics from the store.
 * Returns the initial default data if the store hasn't been initialized yet
 * or the key is missing.
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const store = await load(USER_STORE_FILE, { autoSave: false });

    console.log(`Getting user stats from store: ${USER_STORE_FILE}`);

    // Get the user stats object
    const userStats = await store.get<UserStats>(USER_STATS_STORE_KEY);

    console.log("Retrieved user stats:", userStats);

    // Return the stats, defaulting to initialUserStatsData if null or undefined
    return userStats || initialUserStatsData;

  } catch (error) {
    console.error("Error getting user stats from store:", error);
    return initialUserStatsData; // Return default data in case of error
  }
}

// --- Example Update Functions ---
// You would create functions like these to modify specific stats

/**
 * Updates the username in the store.
 */
export async function updateUsername(newUsername: string): Promise<UserStats | undefined> {
  try {
    const store = await load(USER_STORE_FILE, { autoSave: false });
    // Get current stats, defaulting to initial if somehow missing
    const currentUserStats = await store.get<UserStats>(USER_STATS_STORE_KEY) || initialUserStatsData;

    console.log(`Updating username from "${currentUserStats.username}" to "${newUsername}"`);

    // Update the specific property
    currentUserStats.username = newUsername;

    // Set the modified object back into the store
    await store.set(USER_STATS_STORE_KEY, currentUserStats);
    await store.save(); // Persist the changes

    console.log("Username updated and user store saved.");
    console.log("Final user store entries after update:", await store.entries());

    return currentUserStats; // Return the updated object
  } catch (error) {
    console.error(`Error updating username:`, error);
    return undefined; // Indicate error
  }
}

/**
 * Increments the number of notes by one.
 */
export async function incrementNotesCount(): Promise<UserStats | undefined> {
  try {
    const store = await load(USER_STORE_FILE, { autoSave: false });
    const currentUserStats = await store.get<UserStats>(USER_STATS_STORE_KEY) || initialUserStatsData;

    console.log(`Incrementing notes count from ${currentUserStats.numberOfNotes}`);

    currentUserStats.numberOfNotes++;

    await store.set(USER_STATS_STORE_KEY, currentUserStats);
    await store.save();

    console.log("Notes count incremented and user store saved.");
    console.log("Final user store entries after update:", await store.entries());

    return currentUserStats;
  } catch (error) {
    console.error(`Error incrementing notes count:`, error);
    return undefined;
  }
}

/**
 * Increments the days logged count by one.
 * call this once per day on the first login of the day.
 */
export async function incrementDaysLogged(): Promise<UserStats | undefined> {
  try {
    const store = await load(USER_STORE_FILE, { autoSave: false });
    const currentUserStats = await store.get<UserStats>(USER_STATS_STORE_KEY) || initialUserStatsData;

    console.log(`Incrementing days logged from ${currentUserStats.daysLogged}`);

    currentUserStats.daysLogged++;

    await store.set(USER_STATS_STORE_KEY, currentUserStats);
    await store.save();

    console.log("Days logged incremented and user store saved.");
    console.log("Final user store entries after update:", await store.entries());

    return currentUserStats;
  } catch (error) {
    console.error(`Error incrementing days logged count:`, error);
    return undefined;
  }
}

