<script>
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";

    let element;
    let editor;

    onMount(() => {
        setTimeout(() => {
            editor = new Editor({
                element: element,
                extensions: [StarterKit],
                content: "<p>Hello World! 🌍️ </p>",
                onUpdate: ({ editor }) => {
                    // Force reactivity
                    editor.setOptions({ editable: true });
                },
            });
        }, 0);
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });
</script>

{#if editor}
    <button
        on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        class:active={editor.isActive("heading", { level: 1 })}
    >
        H1
    </button>
    <button
        on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        class:active={editor.isActive("heading", { level: 2 })}
    >
        H2
    </button>
    <button
        on:click={() => editor.chain().focus().setParagraph().run()}
        class:active={editor.isActive("paragraph")}
    >
        P
    </button>
{/if}


<div bind:this={element}></div>

<style>
    button.active {
        background: black;
        color: white;
    }
</style>
