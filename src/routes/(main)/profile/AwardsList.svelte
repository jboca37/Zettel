<script lang="ts">
  // Import the getAchievements function and the type
  import {
    getAchievements,
    markAchievementCompleted,
    type Achievement,
    type AchievementList,
  } from "$lib/setInitialAchievements"; // Adjust path as needed
  import { getUserStats } from "$lib/userStore";
  import { onMount } from "svelte";

  // Use $state for mutable state variables
  let allAchievements: AchievementList = $state([]);
  let earnedAchievements: Achievement[] = $state([]);
  let lockedAchievements: Achievement[] = $state([]);

  let showingLocked = $state(false);
  let isLoading = $state(true); // State to indicate loading

  // Function to fetch data from the store
  async function fetchAchievements() {
    isLoading = true;
    try {
      const data = await getAchievements();
      allAchievements = data; // Store the full list
      // Filter the list based on the 'completed' property
      earnedAchievements = allAchievements.filter((a) => a.completed);
      lockedAchievements = allAchievements.filter((a) => !a.completed);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
      // Handle error: maybe set an error state, or just show empty lists
      allAchievements = [];
      earnedAchievements = [];
      lockedAchievements = [];
    } finally {
      isLoading = false;
    }
  }

  /**
   * Checks user stats against achievement criteria and updates achievements if earned.
   */
  async function checkAchievements() {
    console.log("Checking for earned achievements...");
    try {
      // Fetch the latest achievements and user stats
      const currentAchievements = await getAchievements();
      const currentUserStats = await getUserStats();

      let achievementsUpdated = false; // Flag to know if we need to re-fetch

      // Iterate through the current achievements list
      for (const achievement of currentAchievements) {
        // Only check achievements that are not yet completed
        if (!achievement.completed) {
          let criteriaMet = false;

          // --- Check specific achievement criteria based on ID or description ---
          // You'll need to map achievement IDs/descriptions to stat checks here.
          // This is a simple example based on the achievement descriptions provided earlier.

          if (achievement.id === "a1") {
            criteriaMet = currentUserStats.numberOfNotes >= 1;
            if (criteriaMet) {
              console.log(
                `Criteria met for "${achievement.name}": ${currentUserStats.numberOfNotes} notes >= 1`,
              );
            } else {
              console.log(
                `Criteria NOT met for "${achievement.name}": ${currentUserStats.numberOfNotes} notes < 1`,
              );
            }
          } else if (achievement.id === "a2") {
            criteriaMet = currentUserStats.numberOfNotes >= 5;
            if (criteriaMet) {
              console.log(
                `Criteria met for "${achievement.name}": ${currentUserStats.numberOfNotes} notes >= 5`,
              );
            } else {
              console.log(
                `Criteria NOT met for "${achievement.name}": ${currentUserStats.numberOfNotes} notes < 5`,
              );
            }
          } else if (achievement.id === "a3") {
            criteriaMet = currentUserStats.numberOfNotes >= 100;
            if (criteriaMet) {
              console.log(
                `Criteria met for "${achievement.name}": ${currentUserStats.numberOfNotes} notes >= 100`,
              );
            } else {
              console.log(
                `Criteria NOT met for "${achievement.name}": ${currentUserStats.numberOfNotes} notes < 100`,
              );
            }
          } else if (achievement.id === "a4") {
            criteriaMet = currentUserStats.daysLogged >= 1;
            if (criteriaMet) {
              console.log(
                `Criteria met for "${achievement.name}": ${currentUserStats.daysLogged} days >= 1`,
              );
            } else {
              console.log(
                `Criteria NOT met for "${achievement.name}": ${currentUserStats.daysLogged} days < 1`,
              );
            }
          } else if (achievement.id === "a5") {
            criteriaMet = currentUserStats.daysLogged >= 7;
            if (criteriaMet) {
              console.log(
                `Criteria met for "${achievement.name}": ${currentUserStats.daysLogged} days >= 7`,
              );
            } else {
              console.log(
                `Criteria NOT met for "${achievement.name}": ${currentUserStats.daysLogged} days < 7`,
              );
            }
          }

          // If criteria are met and the achievement is not already completed
          if (criteriaMet) {
            console.log(
              `Criteria met for achievement: ${achievement.name}. Marking as completed.`,
            );
            await markAchievementCompleted(achievement.id);
            achievementsUpdated = true; // Set flag because the store was updated
          }
        }
      }

      // If any achievements were updated, re-fetch the data to update the UI
      if (achievementsUpdated) {
        console.log("Achievements updated in store. Re-fetching data.");
        await fetchAchievements(); // Re-run fetch to update local state
      } else {
        console.log("No new achievements earned during this check.");
      }
    } catch (error) {
      console.error("Error during achievement check:", error);
    }
  }

  onMount(async () => {
    await fetchAchievements();
    await checkAchievements();
  });

  // Note: If achievements can be completed while this component is open,
  // you would need a way to trigger a re-fetch or update this component's state
  // (e.g., using a Svelte writable store or events). For this example,
  // we assume the data is fetched once on mount.
</script>

<div class="card bg-base-100 shadow-md">
  <div class="card-body p-4">
    <div class="tabs tabs-boxed mb-4 w-fit">
      <button
        aria-label="Toggles to Earned awards"
        class="tab"
        class:tab-active={!showingLocked}
        onclick={() => (showingLocked = false)}
      >
        Earned ({earnedAchievements.length})
      </button>

      <button
        aria-label="Toggles to Locked awards"
        class="tab"
        class:tab-active={showingLocked}
        onclick={() => (showingLocked = true)}
      >
        Locked ({lockedAchievements.length})
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {#if isLoading}
        <p>Loading achievements...</p>
      {:else if (!showingLocked && earnedAchievements.length === 0) || (showingLocked && lockedAchievements.length === 0)}
        <p class="col-span-full text-center opacity-70">
          {#if !showingLocked}
            You haven't earned any achievements yet. Keep going!
          {:else}
            No hidden achievements found. Check back later!
          {/if}
        </p>
      {:else if !showingLocked}
        {#each earnedAchievements as achievement (achievement.id)}
          <div
            class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
          >
            <div class="card-body p-4">
              <div class="flex items-center gap-3">
                <div class="achievement-icon {achievement.color} text-3xl">
                  <span class="material-symbols-outlined"
                    >{achievement.icon}</span
                  >
                </div>

                <div>
                  <h3 class="font-bold">
                    {achievement.name}
                  </h3>

                  <p class="text-xs opacity-70">
                    {achievement.description}
                  </p>

                  {#if achievement.earned}
                    <div class="badge badge-sm mt-1">
                      Earned {new Date(achievement.earned).toLocaleDateString()}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
      {:else}
        {#each lockedAchievements as achievement (achievement.id)}
          <div
            class="card bg-base-200 opacity-70 hover:opacity-100 transition-opacity"
          >
            <div class="card-body p-4">
              <div class="flex items-center gap-3">
                <div class="achievement-icon {achievement.color} text-3xl">
                  <span class="material-symbols-outlined"
                    >{achievement.icon}</span
                  >
                </div>

                <div>
                  <h3 class="font-bold">
                    {achievement.name}
                  </h3>

                  <p class="text-xs opacity-70">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
