<script>
  import { onMount } from 'svelte';
  import FullCalendar from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';

  let calendar;

  onMount(() => {
      calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          selectable: true,
          editable: true,
          events: [
              { title: 'Example Event', start: new Date() }
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

<div id="calendar"></div>
