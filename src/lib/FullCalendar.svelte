<script>
    import { onMount } from "svelte";
    import { Calendar } from "@fullcalendar/core"; // ✅ Correct import that was erroring
    import dayGridPlugin from "@fullcalendar/daygrid";
    import interactionPlugin from "@fullcalendar/interaction";
  
    let calendar;
    let calendarElement; // ✅ Store reference to the div
  
    onMount(() => {
        if (!calendarElement) return;
  
        calendar = new Calendar(calendarElement, { // ✅ Correct initialization
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
    #calendar {
        max-width: 900px;
        margin: auto;
    }
  </style>
  
  <!-- ✅ Bind the div reference correctly -->
  <div bind:this={calendarElement}></div>
  