<script lang="ts">
  import { mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";
  import { join, documentDir } from "@tauri-apps/api/path";
  import { load } from "@tauri-apps/plugin-store";
  import { closeDirView } from "$lib/closeDirView.svelte";
  import { initializeAchievementsStore } from "$lib/setInitialAchievements";
  import { initializeUserStatsStore } from "$lib/userStore";

  export async function quickStart() {
    await mkdir("Zettel Vault", {
      baseDir: BaseDirectory.Document,
    });

    const documentDirPath = await documentDir();

    const dirpath = await join(documentDirPath, "Zettel Vault");

    // Store directory path in a .json file
    // so that we know what folder the user wants
    // to use as their vault
    if (dirpath) {
      const store = await load("directories.json", { autoSave: false });

      console.log("Initial store state:", await store.entries());
      // Get existing vaults or initialize an empty array
      const existingVaults = (await store.get<string[]>("vaults")) || [];
      console.log("Existing vaults:", existingVaults);

      // Add the new vault path to the list
      existingVaults.push(dirpath);
      console.log("Updated vaults array:", existingVaults);

      // Update the vaults list
      await store.set("vaults", existingVaults);

      // Set this as the current active vault
      await store.set("currentVault", dirpath);
      console.log("Final store state:", await store.entries());

      // Save the changes
      await store.save();
      console.log(
        "Store saved. The directories.json file should now contain:",
        {
          vaults: existingVaults,
          currentVault: dirpath,
        },
      );
    }
    await initializeAchievementsStore();
    await initializeUserStatsStore();

    // Then open the main window with editor
    await closeDirView();
  }
</script>

<!-- Button for Quick Start -->
<div class="flex items-center flex-col w-1/3">
  <button
    class="btn-wide btn btn-xs sm:btn-sm md:btn-md lg:btn-md xl:btn-md btn-primary mx-6 mb-8"
    onclick={quickStart}>Quick Start</button
  >
</div>
