<!----------------------------------------------------
------------------------------------------------------
-- This file prompts the user to create a new vault --
--      or use an existing folder as a vault.       --
------------------------------------------------------
----------------------------------------------------->
<script lang="ts">
    import Header from "$lib/header.svelte";
    import CreateVault from "./createVault.svelte";
</script>

<div class="flex items-center w-full flex-col align-center">
    <Header />
    <!-- Button to create a new vault
         Or use an existing folder as a vault -->
    <div class="flex items-center w-full flex-col">
        <div class="flex items-center w-full flex-row">
            <div class="flex items-start w-full flex-col mb-4 mx-6">
                <a class="text-neutral-400" href="/dirOptions"> ← Back</a>
            </div>
        </div>
        <div class="flex items-center w-full flex-row">
            <div class="flex items-start w-full flex-col mx-6">
                <p>Create a local Vault</p>
            </div>
        </div>
        <div class="divider mx-6"></div>
        <CreateVault />
    </div>
</div>
