<script lang="ts">
  import * as path from "@tauri-apps/api/path";
  import { create, readDir, readTextFile, mkdir } from "@tauri-apps/plugin-fs";
  import { join } from "@tauri-apps/api/path";
  import { load } from "@tauri-apps/plugin-store";
  import { onMount } from "svelte";
  import Modal from "./Modal.svelte";
  import Editor from "$lib/Editor.svelte";
  import { incrementNotesCount } from "$lib/userStore";

  let newFileName: string = $state("");
  let newDirName: string = $state("");
  let currentFilePath: string = $state("");
  let currentFileName: string = $state("");
  let showFileMenu: boolean = $state(false);
  let showDirectoryMenu: boolean = $state(false);
  let showEditNotesModal: boolean = $state(false);
  let showDeleteNotesModal: boolean = $state(false);
  let contextPath: string = $state("");
  let contextName: string = $state("");
  let contextIsDir: boolean = $state(false);

  // Define FileEntry interface manually since it's not exported
  interface FileEntry {
    name: string;
    path?: string;
    isDirectory: boolean;
    children?: FileEntry[];
  }

  // Replace stores with state
  let fileTree = $state<FileTreeNode[]>([]);
  let isLoading = $state(true);
  let selectedFile = $state<string | null>(null);
  let error = $state<string | null>(null);
  let fileContent = $state<string | null>(null);
  let pos = $state({ x: 0, y: 0 });
  let menu = $state({ w: 0, h: 0 });
  let browser = $state({ w: 0, h: 0 });

  // Interface for file tree structure
  interface FileTreeNode {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: FileTreeNode[];
    isOpen?: boolean;
  }

  async function createFile(fileName: string) {
    try {
      const store = await load("directories.json", { autoSave: false });
      const lastUsedVault = await store.get<string>("currentVault");
      const fileNameWithExtension = fileName + ".md";
      if (lastUsedVault) {
        console.log(lastUsedVault);
        const fullpath = await path.join(lastUsedVault, fileNameWithExtension);
        console.log(fullpath);

        const file = await create(fullpath);

        file.close();
        loadFiles();
      }
    } catch (e: unknown) {
      console.error("Error: ", e);
    }
  }

  async function createDir(dirName: string) {
    try {
      const store = await load("directories.json", { autoSave: false });
      const lastUsedVault = await store.get<string>("currentVault");
      if (lastUsedVault) {
        console.log(lastUsedVault);
        const fullpath = await path.join(lastUsedVault, dirName);
        console.log(fullpath);

        await mkdir(fullpath);

        loadFiles();
      }
    } catch (e: unknown) {
      console.error("Error: ", e);
    }
  }
  onMount(async () => {
    try {
      await loadFiles();
    } catch (e: unknown) {
      console.error("Error loading files:", e);
      error = `Failed to load files: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      isLoading = false;
    }
  });

  async function loadFiles() {
    try {
      const store = await load("directories.json", { autoSave: false });
      const lastUsedVault = await store.get<string>("currentVault");

      if (!lastUsedVault) {
        error = "No vault directory found";
        return;
      }

      console.log("Last used vault:", lastUsedVault);
      const entries = await readDir(lastUsedVault);

      // Build the file tree structure
      const tree = await buildFileTree(lastUsedVault, entries);
      fileTree = tree;
    } catch (err: unknown) {
      console.error("Error in loadFiles:", err);
      error = err instanceof Error ? err.message : String(err);
      throw err;
    }
  }

  async function buildFileTree(
    basePath: string,
    entries: FileEntry[],
  ): Promise<FileTreeNode[]> {
    const result: FileTreeNode[] = [];

    for (const entry of entries) {
      // Skip .obsidian directory
      if (entry.name === ".obsidian") {
        console.log("Skipping .obsidian directory");
        continue;
      }

      try {
        const path = await join(basePath, entry.name);
        const node: FileTreeNode = {
          name: entry.name,
          path: path,
          isDirectory: entry.isDirectory,
          isOpen: false,
        };

        if (entry.isDirectory) {
          try {
            const subEntries = await readDir(path);
            node.children = await buildFileTree(path, subEntries);
          } catch (error) {
            console.warn(`Could not read directory ${entry.name}:`, error);
            node.children = [];
          }
        }

        result.push(node);
      } catch (error) {
        console.warn(`Error processing entry ${entry.name}:`, error);
      }
    }

    // Sort directories first, then files alphabetically
    return result.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  function toggleDirectory(node: FileTreeNode) {
    node.isOpen = !node.isOpen;
  }

  async function selectFile(path: string) {
    selectedFile = path;

    if (path.toLowerCase().endsWith(".md")) {
      try {
        // Load the file content
        fileContent = await readTextFile(path);
      } catch (err) {
        console.error(`Error loading file ${path}:`, err);
        error = `Failed to load file: ${err instanceof Error ? err.message : String(err)}`;
        fileContent = null;
      }
    } else {
      fileContent = null;
    }
  }

  function getFileIcon(node: FileTreeNode): string {
    if (node.isDirectory) {
      return node.isOpen ? "📂" : "📁";
    }

    // Determine file icon based on extension
    const extension = node.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "md":
        return "📄";
      case "pdf":
        return "📑";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      default:
        return "📃";
    }
  }

  function directoryContextMenu(e: any) {
    showDirectoryMenu = true;
    browser = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    pos = {
      x: e.clientX,
      y: e.clientY,
    };
    // If bottom part of context menu will be displayed
    // after right-click, then change the position of the
    // context menu. This position is controlled by `top` and `left`
    // at inline style.
    // Instead of context menu is displayed from top left of cursor position
    // when right-click occur, it will be displayed from bottom left.
    if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
    if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;
  }

  function fileContextMenu(e: any) {
    showFileMenu = true;
    browser = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    pos = {
      x: e.clientX,
      y: e.clientY,
    };
    // If bottom part of context menu will be displayed
    // after right-click, then change the position of the
    // context menu. This position is controlled by `top` and `left`
    // at inline style.
    // Instead of context menu is displayed from top left of cursor position
    // when right-click occur, it will be displayed from bottom left.
    if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
    if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;
  }
  function getContextMenuDimension(node: any) {
    // This function will get context menu dimension
    // when navigation is shown => showMenu = true
    let height = node.offsetHeight;
    let width = node.offsetWidth;
    menu = {
      h: height,
      w: width,
    };
  }
</script>

<svelte:window
  onclick={() => {
    showDirectoryMenu = false;
    showFileMenu = false;
  }}
/>
<!-- File Context Menu -->
{#if showFileMenu}
  <nav
    use:getContextMenuDimension
    style="position: absolute; top:{pos.y}px; left:{pos.x}px"
    class="menu bg-base-200 rounded-box w-56 z-50"
  >
    <button onclick={() => (showDeleteNotesModal = true)} class="btn btn-ghost"
      >Delete File</button
    >
  </nav>
{/if}

<!-- Dir Context Menu -->
{#if showDirectoryMenu}
  <nav
    use:getContextMenuDimension
    style="position: absolute; top:{pos.y}px; left:{pos.x}px"
    class="menu bg-base-200 rounded-box w-56 z-50"
  >
    <button onclick={() => (showDeleteNotesModal = true)} class="btn btn-ghost"
      >Delete Dir</button
    >
  </nav>
{/if}

<!-- Update the Notes Name -->
<Modal bind:showEditNotesModal {contextPath}>
  {#snippet header()}
    <div class="flex justify-center prose">
      <h2 class="items-center">Edit List</h2>
    </div>
  {/snippet}

  <form
    onsubmit={() => {
      showEditNotesModal = false;
    }}
  >
    <input type="text" placeholder="Type here" class="input w-full" />
    <div class="flex flex-row justify-end w-full">
      <button
        class="btn btn-error"
        onsubmit={() => {
          showEditNotesModal = false;
        }}>Cancel</button
      >
      <input type="submit" class="btn" value="Save" />
    </div>
  </form>
</Modal>

<!-- Delete the  -->
<Modal bind:showDeleteNotesModal {contextPath}>
  {#snippet header()}
    {#if contextIsDir === true}
      <div class="flex justify-center prose">
        <h2 class="items-center">Delete: {contextName}</h2>
      </div>
    {:else}
      <div class="flex justify-center prose">
        <h2 class="items-center">Delete: {contextName}</h2>
      </div>
    {/if}
  {/snippet}

  {#if contextIsDir === true}
    <div class="flex justify-center prose">
      <p class="items-center">The selected directory will be deleted.</p>
    </div>
  {:else}
    <div class="flex justify-center prose">
      <p class="items-center">The selected note will be deleted.</p>
    </div>
  {/if}
</Modal>

<!-- Main View -->
<div class="drawer lg:drawer-open">
  <input id="drawer-toggle" type="checkbox" class="drawer-toggle" />

  <div class="drawer-content flex flex-col p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">{currentFileName}</h1>
      <label
        for="drawer-toggle"
        class="btn btn-primary drawer-button lg:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </label>
    </div>

    <div class="flex-1 w-full bg-base-200 h-full rounded-box p-4">
      {#if selectedFile}
        {#if fileContent !== null}
          <div class="prose w-full h-full max-w-none">
            <Editor filePath={currentFilePath} editorContent={fileContent} />
          </div>
        {:else}
          <div class="alert alert-info">
            <p>This file type cannot be displayed in the editor.</p>
          </div>
        {/if}
      {:else}
        <div class="flex justify-center items-center h-full">
          <div class="text-center h-full">
            <h2 class="text-xl font-semibold">No file selected</h2>
            <p class="text-base-content/70">
              Select a file from the sidebar to view its contents
            </p>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="drawer-side">
    <label for="drawer-toggle" aria-label="close sidebar" class="drawer-overlay"
    ></label>
    <div class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Files</h2>
        <button
          onclick={loadFiles}
          class="btn btn-sm btn-circle btn-ghost"
          aria-label="Refresh files"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>

      <div class="divider my-1"></div>

      <form
        onsubmit={() => {
          createFile(newFileName);
          incrementNotesCount();
        }}
        class="join px-2 pt-4"
      >
        <div>
          <label class="input validator join-item">
            <input
              type="text"
              bind:value={newFileName}
              name="taskListName"
              placeholder="Add Note"
              required
            />
          </label>
        </div>
        <input type="submit" class="btn btn-neutral join-item" value="Add" />
      </form>
      <form
        onsubmit={() => {
          createDir(newDirName);
        }}
        class="join px-2 pt-4"
      >
        <div>
          <label class="input validator join-item">
            <input
              type="text"
              bind:value={newDirName}
              name="taskListName"
              placeholder="Add Dir"
              required
            />
          </label>
        </div>
        <input type="submit" class="btn btn-neutral join-item" value="Add" />
      </form>
      {#if isLoading}
        <div class="flex justify-center p-4">
          <span class="loading loading-spinner loading-md"></span>
        </div>
      {:else if error}
        <div class="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            /></svg
          >
          <span>{error}</span>
        </div>
        <button onclick={loadFiles} class="btn btn-sm btn-primary mt-4 w-full"
          >Try Again</button
        >
      {:else if fileTree.length === 0}
        <div class="text-center p-4">
          <p>No files found</p>
          <button onclick={loadFiles} class="btn btn-sm btn-primary mt-2"
            >Reload</button
          >
        </div>
      {:else}
        <div class="file-tree overflow-y-auto max-h-[calc(100vh-8rem)]">
          {#each fileTree as node}
            {#if node.isDirectory}
              <div class="w-full">
                <button
                  class="w-full text-left py-1 px-2 hover:bg-base-300 flex items-center font-medium"
                  onclick={() => toggleDirectory(node)}
                  oncontextmenu={(event) => {
                    event.preventDefault();
                    directoryContextMenu(event);
                    contextPath = node.path;
                    contextName = node.name;
                    contextIsDir = true;
                  }}
                >
                  <span class="mr-2">{getFileIcon(node)}</span>
                  {node.name}
                </button>

                {#if node.isOpen}
                  <div
                    class="directory-contents ml-4 border-l border-base-300 pl-2"
                  >
                    {#each node.children || [] as child}
                      {#if child.isDirectory}
                        <div class="w-full">
                          <button
                            class="w-full text-left py-1 px-2 hover:bg-base-300 flex items-center font-medium"
                            onclick={() => toggleDirectory(child)}
                            oncontextmenu={(event) => {
                              event.preventDefault();
                              directoryContextMenu(event);
                              contextPath = child.path;
                              contextName = child.name;
                              contextIsDir = true;
                            }}
                          >
                            <span class="mr-2">{getFileIcon(child)}</span>
                            {child.name}
                          </button>

                          {#if child.isOpen}
                            <div
                              class="directory-contents ml-4 border-l border-base-300 pl-2"
                            >
                              {#each child.children || [] as grandchild}
                                <button
                                  class="w-full text-left py-1 px-2 hover:bg-base-300 flex items-center {selectedFile ===
                                  grandchild.path
                                    ? 'bg-primary/20'
                                    : ''}"
                                  onclick={() => {
                                    selectFile(grandchild.path);
                                    currentFilePath = grandchild.path;
                                    currentFileName = grandchild.name;
                                  }}
                                  oncontextmenu={(event) => {
                                    event.preventDefault();
                                    fileContextMenu(event);
                                    contextPath = grandchild.path;
                                    contextName = grandchild.name;
                                    contextIsDir = false;
                                  }}
                                >
                                  <span class="mr-2"
                                    >{getFileIcon(grandchild)}</span
                                  >
                                  {grandchild.name}
                                </button>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {:else}
                        <button
                          class="w-full text-left py-1 px-2 hover:bg-base-300 flex items-center {selectedFile ===
                          child.path
                            ? 'bg-primary/20'
                            : ''}"
                          onclick={() => {
                            selectFile(child.path);
                            currentFilePath = child.path;
                            currentFileName = child.name;
                          }}
                          oncontextmenu={(event) => {
                            event.preventDefault();
                            fileContextMenu(event);
                            contextPath = child.path;
                            contextName = child.name;
                            contextIsDir = false;
                          }}
                        >
                          <span class="mr-2">{getFileIcon(child)}</span>
                          {child.name}
                        </button>
                      {/if}
                    {/each}
                  </div>
                {/if}
              </div>
            {:else}
              <button
                class="w-full text-left py-1 px-2 hover:bg-base-300 flex items-center {selectedFile ===
                node.path
                  ? 'bg-primary/20'
                  : ''}"
                onclick={() => {
                  selectFile(node.path);
                  currentFilePath = node.path;
                  currentFileName = node.name;
                }}
                oncontextmenu={(event) => {
                  event.preventDefault();
                  fileContextMenu(event);
                  contextPath = node.path;
                  contextName = node.name;
                  contextIsDir = false;
                }}
              >
                <span class="mr-2">{getFileIcon(node)}</span>
                {node.name}
              </button>
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Smooth transitions for directory expansion */
  .directory-contents {
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
