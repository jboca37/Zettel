<script lang="ts">
    import { onMount } from "svelte";
    import type { CalendarOptions } from "@fullcalendar/core"; // ✅ Import FullCalendar types
    import { Calendar } from "@fullcalendar/core/index.js"; // ✅ Explicitly import ES module
    import dayGridPlugin from "@fullcalendar/daygrid/index.js";
    import interactionPlugin from "@fullcalendar/interaction/index.js";

    let calendar: Calendar;
    let calendarElement: HTMLDivElement | null = null; // ✅ Explicitly define type

    onMount(() => {
        if (!calendarElement) return; // ✅ Prevents errors if not yet assigned

        const options: CalendarOptions = {
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
        };

        calendar = new Calendar(calendarElement, options);
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
