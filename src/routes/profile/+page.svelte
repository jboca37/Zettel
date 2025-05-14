<script lang="ts">
  import UserStats from "./UserStats.svelte";
  import AwardsList from "./AwardsList.svelte";
  import Heatmap from "./Heatmap.svelte";

  function changeProfilePicture() {}

  function changeUserName() {}

  let user = $state({
    name: "Username",
    profilePicture:
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    joinDate: "2023-01-01",
  });

  // Initial heatmap data using $state for reactivity
  let heatmapData = $state([
    [10, 25, 5, 30, 12],
    [40, 15, 50, 20, 33],
    [8, 32, 22, 45, 27],
    [18, 28, 38, 12, 48],
  ]);

  // Example of different color schemes
  const colorSchemes = {
    blue: { min: "hsl(210, 100%, 95%)", max: "hsl(210, 100%, 30%)" }, // Light to Dark Blue
    green: { min: "hsl(120, 100%, 90%)", max: "hsl(120, 70%, 35%)" }, // Light to Dark Green
    red: { min: "hsl(0, 100%, 90%)", max: "hsl(0, 80%, 45%)" }, // Light to Dark Red
    purple: { min: "hsl(270, 100%, 90%)", max: "hsl(270, 70%, 40%)" }, // Light to Dark Purple
  };

  let selectedScheme = $state(colorSchemes.blue);
</script>

<div class="flex flex-col h-dvh">
  <div class="card bg-base-100">
    <!-- User Header Section -->
    <div class="card-body">
      <div class="flex flex-col md:flex-row gap-6 items-center">
        <!-- Profile Picture -->
        <div
          onclick={changeProfilePicture()}
          onkeypress={changeProfilePicture()}
          role="button"
          tabindex={0}
          class="avatar relative group cursor-pointer"
        >
          <div
            class="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
          >
            <img
              src={user.profilePicture}
              alt={user.name}
              class="w-full h-full object-cover rounded-full"
            />
          </div>
          <div
            class=" absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white"
          >
            <div
              style="font-size: 56px;"
              class=" m-5 material-symbols-outlined"
            >
              edit
            </div>
          </div>
        </div>

        <!-- User Info -->
        <div
          class="flex items-center group"
          onclick={changeUserName()}
          onkeypress={changeUserName()}
          role="button"
          tabindex={0}
        >
          <h1 class="text-2xl font-bold mr-2">{user.name}</h1>
          <button
            class="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none"
            aria-label="Edit username"
          >
            edit
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Heatmap -->
  <Heatmap
    data={heatmapData}
    cellSize={30}
    padding={3}
    minColor={selectedScheme.min}
    maxColor={selectedScheme.max}
  />

  <!-- Stats Overview Section -->
  <div class="mt-6 p-6">
    <h2 class="text-xl font-semibold mb-4">Productivity Overview</h2>
    <UserStats />
  </div>

  <!-- Achievements Section -->
  <div class="mt-6 p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Recent Achievements</h2>
      <a href="/profile/achievements" class="btn btn-sm btn-ghost">View All</a>
    </div>
    <AwardsList />
  </div>
</div>
