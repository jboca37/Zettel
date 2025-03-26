<script lang="ts">
    import { Editor } from "@tiptap/core";
    import { StarterKit } from "@syfxlin/tiptap-starter-kit";
    import { onMount } from "svelte";

    // Add a content prop with default value
    let { content = "<p>Hello World! 🌍️ </p>" } = $props();

    let element: HTMLElement;
    let editor = $state<Editor>();

    onMount(() => {
        editor = new Editor({
            element: element,
            extensions: [StarterKit],
            editorProps: {
                attributes: {
                    class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none p-4 prose-invert max-w-none",
                },
            },
            content: content,
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
    });

    // Update editor content when content prop changes
    $effect(() => {
        if (editor && editor.getHTML() !== content) {
            editor.storage.markdown.set(content);
        }
    });
</script>

<div class="bg-base-200 rounded-lg shadow-lg" data-theme="dark">
    <div class="flex gap-2 p-2 border-b border-base-300">
        {#if editor}
            <button
                onclick={() =>
                    editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                class="btn btn-sm btn-ghost"
                class:active={editor?.isActive("heading", { level: 1 })}
            >
                H1
            </button>
            <button
                onclick={() =>
                    editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                class="btn btn-sm btn-ghost"
                class:active={editor?.isActive("heading", { level: 2 })}
            >
                H2
            </button>
            <button
                onclick={() => editor?.chain().focus().setParagraph().run()}
                class="btn btn-sm btn-ghost"
                class:active={editor?.isActive("paragraph")}
            >
                P
            </button>
        {/if}
    </div>
    <div
        bind:this={element}
        class="element min-h-[200px] prose-headings:text-base-content prose-p:text-base-content prose-strong:text-base-content prose-em:text-base-content prose-code:text-primary prose-pre:bg-base-300 prose-pre:text-base-content prose-pre:border prose-pre:border-base-300"
    ></div>
</div>

<style>
    :global(.element) {
        --tiptap-font-family: var(--font-family);
        --tiptap-font-family-mono: var(--font-family-mono);
        --tiptap-font-weight: 400;
        --tiptap-font-size: 1rem;
        --tiptap-line-height: 1.7;
        --tiptap-color: hsl(var(--bc));
        --tiptap-color-primary: hsl(var(--p));
        --tiptap-color-secondly: hsl(var(--bc) / 0.6);
        --tiptap-background: hsl(var(--b1));
        --tiptap-background-selected: hsl(var(--p) / 0.1);
        --tiptap-card-color: hsl(var(--bc));
        --tiptap-card-background: hsl(var(--b2));
        --tiptap-code-color: hsl(var(--p));
        --tiptap-code-background: hsl(var(--b3));
        --tiptap-mark-color: hsl(var(--bc));
        --tiptap-mark-background: hsl(var(--wa) / 0.2);
        --tiptap-operator-shadow: hsl(var(--bc) / 0.05);
        --tiptap-operator-border: hsl(var(--b3));
        --tiptap-operator-color: hsl(var(--bc) / 0.7);
        --tiptap-operator-background: hsl(var(--b2));
        --tiptap-operator-hover-border: hsl(var(--b3));
        --tiptap-operator-hover-color: hsl(var(--p));
        --tiptap-operator-hover-background: hsl(var(--b3));
        --tiptap-operator-dark-border: hsl(var(--b3));
        --tiptap-operator-dark-color: hsl(var(--bc) / 0.7);
        --tiptap-operator-dark-background: hsl(var(--b2));
        --tiptap-operator-dark-hover-border: hsl(var(--b3));
        --tiptap-operator-dark-hover-color: hsl(var(--p));
        --tiptap-operator-dark-hover-background: hsl(var(--b3));
    }
</style>
