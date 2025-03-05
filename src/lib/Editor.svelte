<script>
    import { Editor } from "@tiptap/core";
    import { StarterKit } from "@syfxlin/tiptap-starter-kit";

    // Add a content prop with default value
    let { content = "<p>Hello World! 🌍️ </p>" } = $props();

    let element = $state();
    let editor = $state();

    $effect(() => {
        if (element) {
            editor = new Editor({
                element: element,
                extensions: [StarterKit],
                content: content, // Use the provided content
                onTransaction: () => {
                    // force re-render so `editor.isActive` works as expected
                    editor = editor;
                },
            });

            return () => {
                if (editor) {
                    editor.destroy();
                }
            };
        }
    });

    // Update editor content when content prop changes
    $effect(() => {
        if (editor && editor.getHTML() !== content) {
            editor.storage.markdown.set(content);
        }
    });
</script>

{#if editor}
    <button
        onclick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        class:active={editor.isActive("heading", { level: 1 })}
    >
        H1
    </button>
    <button
        onclick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        class:active={editor.isActive("heading", { level: 2 })}
    >
        H2
    </button>
    <button
        onclick={() => editor.chain().focus().setParagraph().run()}
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
