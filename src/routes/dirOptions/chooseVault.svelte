<script lang="ts">
  import { open } from "@tauri-apps/plugin-dialog";
  import { load } from "@tauri-apps/plugin-store";
  import { initializeAchievementsStore } from "$lib/setInitialAchievements";
  import { initializeUserStatsStore } from "$lib/userStore";
  import { closeDirView } from "$lib/closeDirView.svelte";

  async function chooseVault() {
    // Grab the users desired directory path
    const dirpath = await open({
      multiple: false,
      directory: true,
    });

    if (!dirpath) {
      return;
    }

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

      await initializeAchievementsStore();
      await initializeUserStatsStore();
    }

    // Then open the main window with editor
    await closeDirView();
  }
</script>

<div class="divider mx-6"></div>
<div class="flex items-center w-full flex-row">
  <div class="flex items-start w-full flex-col mx-6">
    <p>Open Folder As Vault</p>
    <p class="text-neutral-400">Choose an Existing Folder of Markdown Files</p>
  </div>
  <button
    onclick={chooseVault}
    class="btn-wide btn btn-xs sm:btn-sm md:btn-md lg:btn-md xl:btn-md btn-primary mx-6"
    >Open</button
  >
</div>
