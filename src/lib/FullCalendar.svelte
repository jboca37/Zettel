<script lang="ts">
    import { onMount } from "svelte";
    import { Calendar } from "@fullcalendar/core"; // ✅ Ensures correct import
    import dayGridPlugin from "@fullcalendar/daygrid";
    import interactionPlugin from "@fullcalendar/interaction";

    let calendar: Calendar;
    let calendarElement: HTMLDivElement | null = null; // ✅ Explicitly define type

    onMount(() => {
        if (!calendarElement) return; // ✅ Prevents errors if not yet assigned

        calendar = new Calendar(calendarElement, {
            plugins: [dayGridPlugin, interactionPlugin],
            initialView: "dayGridMonth",
            selectable: true,
            editable: true,
            events: [
                { title: "Example Event", start: new Date() }
            ],
            dateClick: (info) => {
                alert(`Clicked on: ${info.dateStr}`);
            }
        });

        calendar.render();
    });
</script>

<style>
    /* ✅ Ensure FullCalendar takes the full screen width */
    .calendar-container {
        width: 100vw; /* Use the full viewport width */
        max-width: 1400px; /* Prevent it from being too wide on large screens */
        height: 750px;
        margin: auto;
    }

    /* ✅ Fix the unused selector warning by making sure these styles apply */
    :global(.fc) {
        width: 100% !important;
        height: 100% !important;
    }

    :global(.fc-event) {
        font-size: 1.2rem;
        padding: 5px;
    }
</style>

<!-- ✅ Bind the calendar div correctly -->
<div class="calendar-container" bind:this={calendarElement}></div>
