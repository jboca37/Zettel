<script>
  let { showNameModal = $bindable(), header, children } = $props();

  let dialog = $state(); // HTMLDialogElement

  $effect(() => {
    if (showNameModal) dialog.showModal();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  onclose={() => {
    showNameModal = false;
  }}
  onclick={(e) => {
    if (e.target === dialog) dialog.close();
  }}
  class="modal"
>
  <div class="modal-box">
    <p class="py-4">
      {@render header?.()}
    </p>
    {@render children?.()}
    <div class="flex flex-row justify-end w-full">
      <button
        class="btn"
        onclick={() => {
          dialog.close();
        }}>Cancel</button
      >
      <button
        onclick={async () => {
          showNameModal = false;

          dialog.close();
        }}
        class="btn btn-error">Delete</button
      >
    </div>
  </div>
</dialog>

<style>
</style>
