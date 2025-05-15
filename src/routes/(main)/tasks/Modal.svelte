<script>
  let {
    showEditModal = $bindable(),
    showDeleteModal = $bindable(),
    header,
    children,
  } = $props();

  let dialog = $state(); // HTMLDialogElement

  $effect(() => {
    if (showEditModal) dialog.showModal();
    if (showDeleteModal) dialog.showModal();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  onclose={() => {
    showEditModal = false;
    showDeleteModal = false;
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
  </div>
</dialog>

<style>
</style>
