<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import Editor from "./Editor.svelte";
    import FullCalendar from "./calendar/FullCalendar.svelte";

    let name = $state("");
    let greetMsg = $state("");

    async function greet(event: Event) {
        event.preventDefault();
        // For reference - Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        greetMsg = await invoke("greet", { name });
    }
</script>

<p class="text-2xl font-bold">My Calendar</p>
<FullCalendar />
