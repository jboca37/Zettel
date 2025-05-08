<script>
  import FriendCount from "./FriendCount.svelte";
  import UserStats from "./UserStats.svelte";
  import AwardsList from "./AwardsList.svelte";

  let user = $state({
    name: "John Doe",
    profilePicture:
      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    joinDate: "2023-01-01",
  });
</script>

<div class="flex flex-col h-dvh">
  <div class="card bg-base-100">
    <!-- User Header Section -->
    <div class="card-body">
      <div class="flex flex-col md:flex-row gap-6 items-center">
        <!-- Profile Picture -->
        <div class="avatar">
          <div
            class="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
          >
            <img src={user.profilePicture} alt={user.name} />
          </div>
        </div>

        <!-- User Info -->
        <div class="flex-1">
          <h1 class="text-2xl font-bold">{user.name}</h1>
          <p class="text-sm opacity-70">
            Member since {user.joinDate}
          </p>

          <!-- Friend Count -->
          <div class="mt-2">
            <FriendCount />
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="sm:flex sm:flex-row sm:gap-8 md:flex flex-col gap-6 items-center"
        >
          <div class="material-symbols-outlined">Settings</div>
          <div class="material-symbols-outlined">Share</div>
        </div>
      </div>
    </div>
  </div>

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
