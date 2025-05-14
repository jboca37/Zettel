<script>
  import { remove } from "@tauri-apps/plugin-fs";
  import { createEventDispatcher } from "svelte"; 

  // Pull modal-related props from parent component
  let {
    contextPath,
    showEditNotesModal = $bindable(),
    showDeleteNotesModal = $bindable(),
    header,
    children
  } = $props();

  let dialog = $state(); // HTMLDialogElement
  let inputValue = $state(""); // Store text input for edit mode
  const dispatch = createEventDispatcher(); // Proper Svelte dispatcher

  // Auto-open modal when either flag is true
  $effect(() => {
    if (showEditNotesModal || showDeleteNotesModal) {
      dialog?.showModal();
    }
  });

  // Emit result upward 
  const confirm = () => {
    dialog.close();
    showEditNotesModal = false;
    dispatch("confirm", inputValue); 
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  onclose={() => {
    showEditNotesModal = false;
    showDeleteNotesModal = false;
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

    {#if showEditNotesModal}
      <input
        bind:value={inputValue}
        placeholder="Type your note here..."
        class="input input-bordered w-full my-2"
      />
    {/if}

    <div class="flex flex-row justify-end w-full">
      <button
        class="btn"
        onclick={() => {
          dialog.close();
        }}
      >Cancel</button>

      {#if showDeleteNotesModal}
        <button
          onclick={async () => {
            showDeleteNotesModal = false;
            await remove(contextPath);
            dialog.close();
          }}
          class="btn btn-error"
        >Delete</button>
      {:else}
        <button
          onclick={confirm}
          class="btn btn-primary"
        >Confirm</button>
      {/if}
    </div>
  </div>
</dialog>

<style>
  .input {
    padding: 8px;
    font-size: 1rem;
  }
</style>
