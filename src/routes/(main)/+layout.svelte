<script>
  import "../../app.css";
  import { page } from "$app/state";
  let { children } = $props();
</script>

<head>
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@1"
    rel="stylesheet"
  />
</head>
<div class="flex flex-row h-dvh">
  <!-- Sidebar -->
  <div
    class="flex flex-col justify-between bg-base-200 h-full w-14 py-4 border-r-base-300 border-r-2"
  >
    <!-- Views & Avatar -->
    <div class="flex flex-col h-36 w-full items-center justify-between">
      <div
        class="flex w-full items-center justify-center avatar tooltip tooltip-right"
        data-tip="Profile"
      >
        <div
          class="w-9 rounded-full"
          class:ring={page.url.pathname === "/profile"}
          class:ring-primary={page.url.pathname === "/profile"}
          class:ring-offset-base-100={page.url.pathname === "/profile"}
          class:ring-offset-2={page.url.pathname === "/profile"}
        >
          <a href="/profile"
            ><img
              alt="placeholder"
              src="https://static.vecteezy.com/system/resources/previews/025/337/669/non_2x/default-male-avatar-profile-icon-social-media-chatting-online-user-free-vector.jpg"
            /></a
          >
        </div>
      </div>
      <div
        class="flex w-full justify-center items-center tooltip tooltip-right"
        data-tip="Editor"
      >
        <a
          href="/"
          class="material-symbols-outlined"
          class:active={page.url.pathname === "/"}>folder</a
        >
      </div>
      <!-- Tasks
      <div
        class="flex w-full justify-center items-center tooltip tooltip-right"
        data-tip="Tasks"
      >
        <a
          href="/tasks"
          class="material-symbols-outlined"
          class:active={page.url.pathname === "/tasks"}>check_box</a
        >
      </div>
-->
      <div
        class="flex w-full justify-center items-center tooltip tooltip-right"
        data-tip="Calendar"
      >
        <a
          href="/calendar"
          class="material-symbols-outlined"
          class:active={page.url.pathname === "/calendar"}>calendar_month</a
        >
      </div>
      <!-- auth
      <div
        class="flex w-full justify-center items-center tooltip tooltip-right"
        data-tip="auth"
      >
        <a
          href="/auth"
          class="material-symbols-outlined"
          class:active={page.url.pathname === "/auth"}>settings</a
        >
      </div>
-->
    </div>
    <!-- Settings & Help 
    <div class="flex flex-col h-16 items-center justify-between">
      <div
        class="flex w-full justify-center items-center tooltip tooltip-right"
        data-tip="Help"
      >
        <a href="/help" class="material-symbols-outlined">help</a>
      </div>
      <div
        class="flex w-full justify-center items-center tooltip tooltip-right"
        data-tip="Settings"
      >
        <a href="/settings" class="material-symbols-outlined">settings</a>
      </div>
    </div>
-->
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 overflow-auto">
    {@render children()}
  </div>
</div>

<style>
  .active {
    color: var(--color-primary);
  }
</style>
