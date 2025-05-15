<script lang="ts">
  import UserStats from "./UserStats.svelte";
  import AwardsList from "./AwardsList.svelte";
  import Heatmap from "./Heatmap.svelte";
  import { onMount } from "svelte";

  let user = $state({
    name: "Username",
    profilePicture:
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    joinDate: "2023-01-01",
  });
</script>

<div class="flex flex-col h-dvh">
  <!-- Heatmap -->
  <div class="mt-6 p-6">
    <h2 class="text-xl font-semibold mb-4">Activity Heatmap</h2>
    <Heatmap />
  </div>

  <!-- Stats Overview Section 
  <div class="mt-6 p-6">
    <h2 class="text-xl font-semibold mb-4">Productivity Overview</h2>
    <UserStats />
  </div>
-->

  <!-- Achievements Section -->
  <div class="mt-6 p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Recent Achievements</h2>
    </div>
    <AwardsList />
  </div>
</div>

<!-------------------------------- 
         User Header Section 
<div class="card bg-base-100">
  <div class="card-body">
    <div class="flex flex-col md:flex-row gap-6 items-center">
       Profile Picture 
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
          <div style="font-size: 56px;" class=" m-5 material-symbols-outlined">
            edit
          </div>
        </div>
      </div>

       User Info 
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
------------------------------------------------->
