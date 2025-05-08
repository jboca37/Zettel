<script lang="ts">
  // Mock achievement data - would come from your achievements store
  const achievements = $state([
    {
      id: "a1",
      name: "Early Bird",
      description: "Complete 5 tasks before 9 AM",
      icon: "brightness_7",
      earned: "2023-09-15",
      color: "text-warning", // Tailwind/daisyUI color classes
    },
    {
      id: "a2",
      name: "Focus Master",
      description: "Complete 10 Pomodoro sessions in a day",
      icon: "psychology",
      earned: "2023-09-10",
      color: "text-primary",
    },
    {
      id: "a3",
      name: "Habit Streak",
      description: "Maintain a habit for 7 consecutive days",
      icon: "local_fire_department",
      earned: "2023-09-05",
      color: "text-error",
    },
  ]);

  // Missing/locked achievements
  const lockedAchievements = $state([
    {
      id: "a4",
      name: "Productivity Guru",
      description: "Complete 100 tasks in a week",
      icon: "emoji_events",
      requirement: "73/100 tasks completed",
      color: "text-neutral-content",
    },
    {
      id: "a5",
      name: "Note Wizard",
      description: "Create 50 linked notes",
      icon: "auto_awesome",
      requirement: "28/50 notes created",
      color: "text-neutral-content",
    },
  ]);

  let showingLocked = $state(false);
</script>

<div class="card bg-base-100 shadow-md">
  <div class="card-body p-4">
    <!-- Toggle between earned and locked achievements -->
    <div class="tabs tabs-boxed mb-4 w-fit">
      <button
        aria-label="Toggles to Earned awards"
        class="tab"
        class:tab-active={!showingLocked}
        onclick={() => (showingLocked = false)}
      >
        Earned
      </button>
      <button
        aria-label="Toggles to Locked awards"
        class="tab"
        class:tab-active={showingLocked}
        onclick={() => (showingLocked = true)}
      >
        Locked
      </button>
    </div>

    <!-- Achievement List -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {#if !showingLocked}
        {#each achievements as achievement}
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
                  <div class="badge badge-sm mt-1">
                    Earned {new Date(achievement.earned).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {:else}
        {#each lockedAchievements as achievement}
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
                  <div class="badge badge-sm badge-outline mt-1">
                    {achievement.requirement}
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
