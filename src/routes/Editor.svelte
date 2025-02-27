<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import TaskList from "@tiptap/extension-task-list";
    import TaskItem from "@tiptap/extension-task-item";

    let element: HTMLDivElement | null = null;
    let editor: Editor | null = null;

    onMount(() => {
        if (element) {
            editor = new Editor({
                element: element,
                extensions: [
                    StarterKit,
                    TaskList,
                    TaskItem.configure({
                        nested: true,
                    }),
                ],
                content: "<p>Hello World! 🌍️ </p>",
                onTransaction: () => {
                    // Force re-render so `editor.isActive` works as expected
                    editor = editor;
                },
            });
        }
    });

    onDestroy(() => {
        editor?.destroy();
    });

    const toggleHeading = (level: number) => {
        editor?.chain().focus().toggleHeading({ level }).run();
    };

    const setParagraph = () => {
        editor?.chain().focus().setParagraph().run();
    };

    const isActive = (type: string, attrs: Record<string, unknown> = {}) => {
        return editor?.isActive(type, attrs) ?? false;
    };
</script>

{#if editor}
    <button
        on:click={() => toggleHeading(1)}
        class:active={isActive("heading", { level: 1 })}
    >
        H1
    </button>
    <button
        on:click={() => toggleHeading(2)}
        class:active={isActive("heading", { level: 2 })}
    >
        H2
    </button>
    <button on:click={setParagraph} class:active={isActive("paragraph")}>
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
