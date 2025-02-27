<script>
    import { onMount } from "svelte";
    import { Calendar } from "@fullcalendar/core";
    import dayGridPlugin from "@fullcalendar/daygrid";
    import interactionPlugin from "@fullcalendar/interaction";

    let calendar;
    let calendarElement;

    onMount(() => {
        if (!calendarElement) return;

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

<!-- ✅ Wrap the calendar in a container -->
<div class="calendar-container" bind:this={calendarElement}></div>
