<script lang="ts">
    import { readDir } from "@tauri-apps/plugin-fs";
    import { join } from "@tauri-apps/api/path";
    import { load } from "@tauri-apps/plugin-store";
    import { onMount } from "svelte";

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

    // Interface for file tree structure
    interface FileTreeNode {
        name: string;
        path: string;
        isDirectory: boolean;
        children?: FileTreeNode[];
        isOpen?: boolean;
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
                        console.warn(
                            `Could not read directory ${entry.name}:`,
                            error,
                        );
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
        // No need to call fileTree.update() anymore, the mutation is reactive
    }

    function selectFile(path: string) {
        selectedFile = path;
        // Here you would handle file loading/display
        console.log("Selected file:", path);
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

    async function processEntriesRecursively(
        lastUsedVault: string,
        entries: FileEntry[],
    ) {
        for (const entry of entries) {
            console.log(`Entry: ${entry.name}`);
            if (entry.name === ".obsidian") {
                console.log("Skipping .obsidian directory");
                continue;
            }
            if (entry.isDirectory) {
                try {
                    const dir = await join(lastUsedVault, entry.name);
                    const subEntries = await readDir(dir);
                    await processEntriesRecursively(dir, subEntries);
                } catch (error) {
                    console.warn(
                        `Could not process directory ${entry.name}:`,
                        error,
                    );
                }
            }
        }
    }
</script>

<div class="drawer lg:drawer-open">
    <input id="drawer-toggle" type="checkbox" class="drawer-toggle" />

    <div class="drawer-content flex flex-col p-4">
        <!-- Page content here -->
        <div class="flex justify-between items-center mb-4">
            <a href="/calendar" class="btn btn-primary"> Go to Calendar</a>
            <h1 class="text-2xl font-bold">Document Viewer</h1>
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

        <div class="flex-1 bg-base-200 rounded-box p-4">
            {#if selectedFile}
                <p>Viewing: {selectedFile}</p>
                <!-- Display file content here -->
            {:else}
                <div class="flex justify-center items-center h-full">
                    <div class="text-center">
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
        <label
            for="drawer-toggle"
            aria-label="close sidebar"
            class="drawer-overlay"
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
                <button
                    onclick={loadFiles}
                    class="btn btn-sm btn-primary mt-4 w-full">Try Again</button
                >
            {:else if fileTree.length === 0}
                <div class="text-center p-4">
                    <p>No files found</p>
                    <button
                        onclick={loadFiles}
                        class="btn btn-sm btn-primary mt-2">Reload</button
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
                                >
                                    <span class="mr-2">{getFileIcon(node)}</span
                                    >
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
                                                        onclick={() =>
                                                            toggleDirectory(
                                                                child,
                                                            )}
                                                    >
                                                        <span class="mr-2"
                                                            >{getFileIcon(
                                                                child,
                                                            )}</span
                                                        >
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
                                                                    onclick={() =>
                                                                        selectFile(
                                                                            grandchild.path,
                                                                        )}
                                                                >
                                                                    <span
                                                                        class="mr-2"
                                                                        >{getFileIcon(
                                                                            grandchild,
                                                                        )}</span
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
                                                    onclick={() =>
                                                        selectFile(child.path)}
                                                >
                                                    <span class="mr-2"
                                                        >{getFileIcon(
                                                            child,
                                                        )}</span
                                                    >
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
                                onclick={() => selectFile(node.path)}
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
