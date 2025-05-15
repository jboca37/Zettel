<script lang="ts">
  import { onMount } from "svelte";
  // Import the Store class from the Tauri plugin
  import { LazyStore } from "@tauri-apps/plugin-store";
  import { incrementDaysLogged } from "$lib/userStore";
  // Define the type for our activity data
  // We'll use a boolean to indicate if there was activity on a given day
  type ActivityData = {
    [date: string]: boolean; // date string (YYYY-MM-DD) maps to a boolean (true if active)
  };

  // Create a new instance of the Tauri Store
  // The store will be saved to a file named 'activity.dat' in the app's data directory
  const store = new LazyStore("activity.dat");

  // Reactive Svelte variable to hold activity data loaded from the store
  let activityData: ActivityData = {};

  // Function to generate dates for the last year
  function getLastYearDates(): string[] {
    const dates: string[] = [];
    const today = new Date();
    // Go back 365 days (or slightly more to ensure full weeks)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 365); // Adjust as needed

    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const day = currentDate.getDate().toString().padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  const dates = getLastYearDates();

  // Function to determine the color class based on activity (boolean)
  function getColorClass(isActive: boolean = false): string {
    if (isActive) {
      // Use a single color for active days
      return "bg-green-500 dark:bg-green-600";
    } else {
      // Color for inactive days
      return "bg-gray-200 dark:bg-gray-700";
    }
  }

  // Function to log activity for the current day
  async function logActivityForToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;

    // Update the local state to mark today as active
    activityData[todayString] = true;

    // Trigger reactivity (Svelte might need a little nudge for object updates)
    activityData = { ...activityData };

    // Save the updated data to the Tauri store
    // We save the entire activityData object under a key, e.g., 'dailyActivity'
    await store.set("dailyActivity", activityData);
    incrementDaysLogged();
    // Commit the changes to the store file
    await store.save();

    console.log(`Activity logged for ${todayString}.`);
  }

  // Load data from store on mount
  onMount(async () => {
    // Load the data from the store using the key 'dailyActivity'
    const storedData = (await store.get(
      "dailyActivity",
    )) as ActivityData | null;

    if (storedData) {
      // If data exists in the store, update the local state
      activityData = storedData;
      // Trigger reactivity
      activityData = { ...activityData };
    } else {
      // If no data exists, initialize with an empty object
      activityData = {};
    }

    console.log("Activity data loaded from store:", activityData);

    // No unsubscribe needed for simple get/set operations on mount/click
  });
</script>

<div class="p-4">
  <button class="btn btn-primary mb-4" on:click={logActivityForToday}>
    Log Activity for Today
  </button>

  <div class="flex flex-wrap gap-1">
    {#each dates as date}
      {@const isActive = activityData[date] || false}
      <div
        class="w-3 h-3 rounded-sm {getColorClass(isActive)}"
        title="{date}: {isActive ? 'Active' : 'Inactive'}"
      ></div>
    {/each}
  </div>
</div>

<style>
  /* Add any specific styles here if needed, though Tailwind should handle most */
</style>
