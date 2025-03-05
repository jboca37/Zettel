<!----------------------------------------------------
------------------------------------------------------
-- This file prompts the user to create a new vault --
--      or use an existing folder as a vault.       --
------------------------------------------------------
----------------------------------------------------->
<script lang="ts">
    import Header from "$lib/header.svelte";
    import QuickStart from "./quickStart.svelte";
    import ChooseVault from "./chooseVault.svelte";
    import { load } from "@tauri-apps/plugin-store";
    import { closeDirView } from "$lib/closeDirView.svelte";

    async function clearStore() {
        // Implement clear store logic here
        const store = await load("directories.json", { autoSave: false });
        await store.reset();
        console.log("Final store state:", await store.entries());
    }
</script>

<!--Main view -->
<div class="flex w-full flex-col items-center align-center">
    <Header />

    <div class="flex items-center w-full justify-center">
        <button
            onclick={closeDirView}
            class="btn-wide btn btn-xs sm:btn-sm md:btn-md lg:btn-md xl:btn-md btn-primary mx-6 mb-8"
            >Home
        </button>
        <button
            class="btn-wide btn btn-xs sm:btn-sm md:btn-md lg:btn-md xl:btn-md btn-primary mx-6 mb-8"
            onclick={clearStore}>Clear Store</button
        >
    </div>

    <QuickStart />

    <!--         Button to create a new vault
         and button to use an existing folder as a vault -->
    <div class="flex items-center w-full flex-col">
        <div class="flex items-center w-full flex-row">
            <div class="flex items-start w-full flex-col mx-6">
                <p>Create a New Vault</p>
                <p class="text-neutral-400">
                    Create a New Zettel Vault Under a Folder
                </p>
            </div>
            <a
                class="btn-wide btn btn-xs sm:btn-sm md:btn-md lg:btn-md xl:btn-md btn-primary mx-6"
                href="/dirOptions/createDir">Create</a
            >
        </div>
        <ChooseVault />
    </div>
</div>
