import { load } from "@tauri-apps/plugin-store";
import { readDir } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

let error = $state<string | null>(null);
let fileTree = $state<FileTreeNode[]>([]);

interface FileEntry {
  name: string;
  path?: string;
  isDirectory: boolean;
  children?: FileEntry[];
}
// Interface for file tree structure
interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
  isOpen?: boolean;
}



export async function loadFiles() {
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

export function toggleDirectory(node: FileTreeNode) {
  node.isOpen = !node.isOpen;
}


export function getFileIcon(node: FileTreeNode): string {
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
