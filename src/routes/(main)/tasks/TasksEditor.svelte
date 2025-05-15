<script>
  import { onMount, onDestroy } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";

  let element = $state();
  let editor = $state();

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [StarterKit],
      content: "<p>Hello World! 🌍️ </p>",
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
      },
    });
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<div class="h-full w-full" bind:this={element}></div>

<style>
</style>
