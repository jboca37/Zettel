import { load } from "@tauri-apps/plugin-store";
// Assuming the types and initial data are in the same file or imported
// import { Achievement, AchievementList, initialAchievementsData } from "./types";
//
// Define the structure of an individual achievement
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: string | null; // Use string for date earned, or null if not earned yet
  color: string; // Tailwind/daisyUI color classes
  completed: boolean;
}

// Define the type for the list of achievements
export type AchievementList = Achievement[];

const initialAchievementsData: AchievementList = [
  {
    id: "a1",
    name: "Note Beginnings",
    description: "Create Your First Note",
    icon: "brightness_7",
    earned: null,
    color: "text-warning",
    completed: false,
  },
  {
    id: "a2",
    name: "Now You're Getting It",
    description: "Create 5 Notes",
    icon: "psychology",
    earned: null, // Not yet earned
    color: "text-primary",
    completed: false,
  },
  {
    id: "a3",
    name: "Now You're Thinking With Portals",
    description: "Create 100 Notes",
    icon: "local_fire_department",
    earned: null, // Example earned date
    color: "text-error",
    completed: false,
  },
  // Add the initially locked achievements to this single list
  {
    id: "a4",
    name: "Welcome!",
    description: "Log Your First Day",
    icon: "emoji_events",
    earned: null,
    color: "text-neutral-content", // Use a neutral color for unearned
    completed: false,
  },
  {
    id: "a5",
    name: "You're A Regular!",
    description: "Log 7 Days",
    icon: "auto_awesome",
    earned: null,
    color: "text-neutral-content", // Use a neutral color for unearned
    completed: false,
  },
];
const ACHIEVEMENTS_STORE_FILE = "achievements.json";
const ACHIEVEMENTS_STORE_KEY = "achievements";

/**
 * Initializes the achievements store with default data if it doesn't exist.
 * This should typically be called once on app startup.
 */
export async function initializeAchievementsStore(): Promise<void> {
  try {
    const store = await load(ACHIEVEMENTS_STORE_FILE, { autoSave: false });

    console.log(`Attempting to load store: ${ACHIEVEMENTS_STORE_FILE}`);
    console.log("Initial store entries:", await store.entries());

    // Check if the 'achievements' key already exists
    const existingAchievements = await store.get<AchievementList>(ACHIEVEMENTS_STORE_KEY);

    if (!existingAchievements || existingAchievements.length === 0) {
      console.log("No existing achievements found. Initializing with default data.");
      // If the key doesn't exist or is empty, set the default data
      await store.set(ACHIEVEMENTS_STORE_KEY, initialAchievementsData);
      await store.save(); // Save immediately after initialization

      console.log("Achievements initialized and saved.");
      console.log("Final store entries after initialization:", await store.entries());
    } else {
      console.log("Achievements already exist. No initialization needed.");
      console.log("Existing achievements count:", existingAchievements.length);
      // Optionally, you could merge default achievements here if you add new ones
      // in a later version and want to ensure they appear for existing users.
      // This would involve checking for new IDs in initialAchievementsData
      // that aren't in existingAchievements and adding them (likely uncompleted).
    }
  } catch (error) {
    console.error("Error initializing achievements store:", error);
  }
}

/**
 * Gets the current list of achievements from the store.
 * Returns an empty array if the store hasn't been initialized yet,
 * although initializeAchievementsStore should ideally be called first.
 */
export async function getAchievements(): Promise<AchievementList> {
  try {
    const store = await load(ACHIEVEMENTS_STORE_FILE, { autoSave: false });

    console.log(`Getting achievements from store: ${ACHIEVEMENTS_STORE_FILE}`);

    // Get the achievements list
    const achievements = await store.get<AchievementList>(ACHIEVEMENTS_STORE_KEY);

    console.log("Retrieved achievements:", achievements);

    // Return the list, defaulting to an empty array if it's null or undefined
    return achievements || [];
  } catch (error) {
    console.error("Error getting achievements from store:", error);
    return []; // Return empty array in case of error
  }
}

/**
 * Example function to mark an achievement as completed.
 * This demonstrates how you would update the array in the store.
 */
export async function markAchievementCompleted(achievementId: string): Promise<AchievementList | undefined> {
  try {
    const store = await load(ACHIEVEMENTS_STORE_FILE, { autoSave: false });
    let achievements = await store.get<AchievementList>(ACHIEVEMENTS_STORE_KEY) || [];

    const achievementIndex = achievements.findIndex(a => a.id === achievementId);

    if (achievementIndex !== -1 && !achievements[achievementIndex].completed) {
      console.log(`Marking achievement ${achievementId} as completed.`);
      // Create a copy to avoid direct mutation if preferred, or modify in place
      // For simplicity here, we'll modify in place then set the whole array
      achievements[achievementIndex].completed = true;
      achievements[achievementIndex].earned = new Date().toISOString().split('T')[0]; // Set today's date YYYY-MM-DD

      await store.set(ACHIEVEMENTS_STORE_KEY, achievements);
      await store.save();

      console.log(`Achievement ${achievementId} updated and store saved.`);
      console.log("Final store entries after update:", await store.entries());

      return achievements; // Return the updated list
    } else if (achievementIndex !== -1 && achievements[achievementIndex].completed) {
      console.log(`Achievement ${achievementId} was already completed.`);
      return achievements; // Return current list
    } else {
      console.warn(`Achievement with ID ${achievementId} not found.`);
      return achievements; // Return current list
    }

  } catch (error) {
    console.error(`Error marking achievement ${achievementId} completed:`, error);
    return undefined; // Indicate error
  }
}
