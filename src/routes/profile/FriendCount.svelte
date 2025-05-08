<script lang="ts">
  // Mock friend data - would come from your Firebase/store
  const friendCount = $state(42);
</script>

<div class="badge badge-lg">
  <span class="material-symbols-outlined mr-1">group</span>
  {friendCount} Friends
</div>
