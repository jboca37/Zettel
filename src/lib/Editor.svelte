<script lang="ts">
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import { onMount } from "svelte";
  import remarkParse from "remark-parse";
  import remarkHtml from "remark-html";
  import remarkStringify from "remark-stringify";
  import rehypeParse from "rehype-parse";
  import rehypeRemark from "rehype-remark";
  import { unified } from "unified";
  import { writeTextFile } from "@tauri-apps/plugin-fs";

  // Add a content prop with default value
  let { editorContent = "<p>Hello World! 🌍️ </p>", filePath } = $props();

  let element: HTMLElement;
  let editor = $state<Editor>();

  // Expose a function to get the current editor content as Markdown
  export async function getMarkdown(): Promise<string> {
    if (editor) {
      const htmlContent = editor.getHTML();
      try {
        const file = await unified()
          .use(rehypeParse)
          .use(rehypeRemark)
          .use(remarkStringify)
          .process(htmlContent); // Convert MDAST into a Markdown string

        return String(file);
      } catch (error) {
        console.error(
          "Error converting HTML to Markdown using remark/rehype:",
          error,
        );
        // Fallback or re-throw error
        return `\n${htmlContent}`; // Example fallback
      }
    }
    console.warn(
      "getMarkdown called before editor was initialized or editor is not available.",
    );
    return ""; // Or throw an error if preferred
  }

  function parseMarkdownToHtml(markdown: string | undefined | null): string {
    if (typeof markdown === "string") {
      try {
        return String(
          unified().use(remarkParse).use(remarkHtml).processSync(markdown),
        );
      } catch (e) {
        console.error("Error parsing Markdown with Remark:", e);
        return "<p>Error parsing Markdown.</p>";
      }
    }
    return "<p></p>";
  }

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [StarterKit],
      editorProps: {
        attributes: {
          class:
            "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none p-4 prose-invert max-w-none",
        },
      },
      content: editorContent,
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
      },
      onUpdate: async () => {
        if (editor) {
          const htmlContent = editor.getHTML();
          try {
            console.log(filePath);
            console.log("converting");
            const file = await unified()
              .use(rehypeParse)
              .use(rehypeRemark)
              .use(remarkStringify)
              .process(htmlContent); // Convert MDAST into a Markdown string

            const text = String(file);
            await writeTextFile(filePath, text);
            console.log(text);
            console.log("saved");
          } catch (error) {
            console.error(
              "Error converting HTML to Markdown using remark/rehype:",
              error,
            );
            // Fallback or re-throw error
            return `\n${htmlContent}`; // Example fallback
          }
        }
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
    if (editor && editorContent !== undefined) {
      const newHtmlContent = parseMarkdownToHtml(editorContent);

      // Compare the new HTML with the editor's current HTML
      // to prevent unnecessary updates and potential cursor jumps.
      if (editor.getHTML() !== newHtmlContent) {
        editor.commands.setContent(newHtmlContent, true); // 'true' to parse the HTML
        console.log(editorContent);
      }
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
