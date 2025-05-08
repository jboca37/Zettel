<script lang="ts">
  const [minWidth, maxWidth, defaultWidth] = [150, 250, 200];

  let { tasks } = $props();

  let width = $state(defaultWidth);

  let isResized = $state(false);

  function onmousemove(event: any) {
    if (!isResized) {
      return;
    }

    // Calculate the potential new width
    // event.movementX is the horizontal displacement of the mouse
    const newWidth = width + event.movementX / 2; // Adjust sensitivity as needed

    // Check if the new width is within the defined range
    const isWidthInRange = newWidth >= minWidth && newWidth <= maxWidth;

    // If the new width is in range, update the reactive width state
    // Otherwise, the width remains its previous value
    if (isWidthInRange) {
      width = newWidth; // Directly assign to update reactive state
    }
  }
</script>

<svelte:window
  onmouseup={() => {
    isResized = false;
  }}
  {onmousemove}
/>

<div class="flex">
  <!-- Sidebar -->
  <div style:width="{width / 16}rem" class="flex flex-col bg-base-100">
    {@render tasks()}
  </div>
  <!-- Sidebar Handle -->
  <div
    role="menubar"
    tabindex={0}
    onmousedown={(event) => {
      isResized = true;
      event.preventDefault();
    }}
    class="w-1 border-r-0 border-r-base-300 cursor-col-resize"
  ></div>
</div>

<style></style>
