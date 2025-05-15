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

<div class="h-full w-full" bind:this={element}></div>
