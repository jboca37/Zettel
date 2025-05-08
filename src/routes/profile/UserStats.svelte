<!-- src/routes/profile/UserStats.svelte -->
<script lang="ts">
  // Mock data - would come from your productivity tracking store
  const stats = $state({
    focusTime: {
      daily: 125, // minutes
      weekly: 680, // minutes
      trend: "up", // up, down, or neutral
    },
    tasksCompleted: {
      daily: 8,
      weekly: 42,
      trend: "up",
    },
    streaks: {
      current: 5, // days
      longest: 14, // days
      trend: "neutral",
    },
    habitCompletion: {
      rate: 85, // percentage
      trend: "up",
    },
  });

  // Helper function to format minutes into hours and minutes
  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- Focus Time Card -->
  <div class="stat bg-base-200 rounded-box">
    <div class="stat-figure text-primary">
      <span class="material-symbols-outlined text-3xl">timer</span>
    </div>
    <div class="stat-title">Focus Time</div>
    <div class="stat-value text-primary">
      {formatTime(stats.focusTime.daily)}
    </div>
    <div class="stat-desc">
      {stats.focusTime.trend === "up"
        ? "↗"
        : stats.focusTime.trend === "down"
          ? "↘"
          : "→"}
      {formatTime(stats.focusTime.weekly)} this week
    </div>
  </div>

  <!-- Tasks Completed Card -->
  <div class="stat bg-base-200 rounded-box">
    <div class="stat-figure text-secondary">
      <span class="material-symbols-outlined text-3xl">task_alt</span>
    </div>
    <div class="stat-title">Tasks Completed</div>
    <div class="stat-value text-secondary">
      {stats.tasksCompleted.daily}
    </div>
    <div class="stat-desc">
      {stats.tasksCompleted.trend === "up"
        ? "↗"
        : stats.tasksCompleted.trend === "down"
          ? "↘"
          : "→"}
      {stats.tasksCompleted.weekly} this week
    </div>
  </div>

  <!-- Streak Card -->
  <div class="stat bg-base-200 rounded-box">
    <div class="stat-figure text-accent">
      <span class="material-symbols-outlined text-3xl"
        >local_fire_department</span
      >
    </div>
    <div class="stat-title">Current Streak</div>
    <div class="stat-value text-accent">{stats.streaks.current} days</div>
    <div class="stat-desc">Longest: {stats.streaks.longest} days</div>
  </div>

  <!-- Habit Completion Card -->
  <div class="stat bg-base-200 rounded-box">
    <div class="stat-figure text-info">
      <span class="material-symbols-outlined text-3xl">trending_up</span>
    </div>
    <div class="stat-title">Habit Completion</div>
    <div class="stat-value text-info">{stats.habitCompletion.rate}%</div>
    <div class="stat-desc">
      {stats.habitCompletion.trend === "up"
        ? "Improving"
        : stats.habitCompletion.trend === "down"
          ? "Declining"
          : "Stable"}
    </div>
  </div>
</div>
