<script lang="ts">
  import * as path from "@tauri-apps/api/path";
  import { mkdir } from "@tauri-apps/plugin-fs";
  import { open } from "@tauri-apps/plugin-dialog";
  import { load } from "@tauri-apps/plugin-store";
  import { closeDirView } from "$lib/closeDirView.svelte";

  let vaultName = $state("");

  let dirpath: string | null = $state(null);

  async function getVaultPath() {
    const dirpathResult = await open({
      multiple: false,
      directory: true,
    });

    dirpath = dirpathResult;
  }

  // Function to create a new vault with the users name
  // and previously selected path
  async function createVault() {
    if (!vaultName) {
      alert("Vault name cannot be empty");
      return;
    }

    if (!dirpath) {
      alert("Please select a directory");
      return;
    }

    if (dirpath) {
      const fullpath = await path.join(dirpath, vaultName);
      await mkdir(fullpath);

      const store = await load("directories.json", { autoSave: false });

      console.log("Initial store state:", await store.entries());
      // Get existing vaults or initialize an empty array
      const existingVaults = (await store.get<string[]>("vaults")) || [];
      console.log("Existing vaults:", existingVaults);

      // Add the new vault path to the list
      existingVaults.push(fullpath);
      console.log("Updated vaults array:", existingVaults);

      // Update the vaults list
      await store.set("vaults", existingVaults);

      // Set this as the current active vault
      await store.set("currentVault", fullpath);
      console.log("Final store state:", await store.entries());

      // Save the changes
      await store.save();
      console.log(
        "Store saved. The directories.json file should now contain:",
        {
          vaults: existingVaults,
          currentVault: fullpath,
        },
      );

      await closeDirView();
    }
  }
</script>

<div class="flex items-center w-full flex-row">
  <div class="flex items-start w-full flex-col mx-6">
    <p>Vault Name</p>
    <p class="text-neutral-400">Pick a name for your vault</p>
  </div>
  <input
    bind:value={vaultName}
    type="text"
    class="mx-6 min-w-53 max-w-53 input"
    placeholder="Vault Name"
  />
</div>
<div class="divider mx-6"></div>
<div class="flex items-center w-full flex-row">
  <div class="flex items-start w-full flex-col mx-6">
    <p>Location</p>
    <p class="text-neutral-400">Choose a place to put your vault</p>
  </div>
  <button
    onclick={getVaultPath}
    class="w-52 sm:w-52 md:w-52 lg:w-52 xl:w-52 btn btn-primary mx-6"
    >Browse</button
  >
</div>

<div class="flex items-center flex-col w-1/3">
  <button
    onclick={createVault}
    class="w-52 sm:w-52 md:w-52 lg:w-52 xl:w-52 btn btn-primary mt-6"
    >Create</button
  >
</div>
