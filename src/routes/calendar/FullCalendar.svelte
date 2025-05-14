<script lang="ts">
  // Required FullCalendar CSS via CDN for Tauri compatibility (For Mac OS)
  import "@fullcalendar/core/index.js";
  import { onMount, createEventDispatcher } from "svelte";
  import { Calendar } from "@fullcalendar/core";
  import type { Calendar as CalendarInstance, EventApi } from "@fullcalendar/core";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import interactionPlugin from "@fullcalendar/interaction";
  import timeGridPlugin from "@fullcalendar/timegrid";

  // Setup FullCalendar library instance and reference to DOM element
  let calendar: CalendarInstance;
  let calendarElement!: HTMLDivElement;
  const dispatch = createEventDispatcher(); // Enables communication with parent modal

  // Keeps track of which reminders we've already alerted for (avoid duplicates)
  const remindedSet: Set<string> = new Set();

  // Tag colors used to color-code calendar notes based off work, school, personal, urgent, or other
  const tagColors: Record<string, string> = {
    work: "#3B82F6",     // Light Blue
    school: "#F97316",   // Vaquero Orange......V's up!
    personal: "#10B981", // Green 
    urgent: "#EF4444",   // Red
    other: "#9CA3AF"     // Gray
  };

  // Options shown to user for tagging notes
  const tagOptions = ["work", "school", "personal", "urgent", "other"];

  // Prompt user to pick a tag by number based off the options
  function getTagFromPrompt(defaultTag = "other"): string {
    const choice = window.prompt(
      `Select a tag number:\n` + tagOptions.map((tag, i) => `${i + 1} - ${tag}`).join("\n")
    );
    const index = parseInt(choice ?? "");
    return tagOptions[index - 1] || defaultTag;
  }

  // Save current calendar events to sessionStorage for future use
  function saveEvents() {
    const events = calendar.getEvents().map(e => ({
      title: e.title.replace(/^🔔 /, "").replace(/ @ \d\d:\d\d$/, ""),
      start: e.startStr,
      tag: e.extendedProps.tag,
      reminder: e.extendedProps.reminder || null
    }));
    sessionStorage.setItem("calendarNotes", JSON.stringify(events));
  }

  // Load calendar events from sessionStorage to avoid deletion from switching tabs
  function loadEvents(): any[] {
    const raw = sessionStorage.getItem("calendarNotes");
    if (!raw) return [];
    try {
      const saved = JSON.parse(raw);
      return saved.map((e: any) => ({
        title: e.reminder ? `🔔 ${e.title} @ ${e.reminder}` : e.title,
        start: e.start,
        allDay: true,
        backgroundColor: tagColors[e.tag] || tagColors.other,
        extendedProps: {
          tag: e.tag || "other",
          reminder: e.reminder || null
        }
      }));
    } catch {
      return [];
    }
  }

  // Loop that checks reminders every 30 seconds in order for notification pop up to work
  function startReminderLoop() {
    setInterval(() => {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM 24-hour format to avoid AM/PM

      calendar.getEvents().forEach(event => {
        const reminder = event.extendedProps.reminder;
        const cleanTitle = event.title.replace(/^🔔 /, "").replace(/ @ \d\d:\d\d$/, "");
        const key = `${cleanTitle}-${event.startStr}-${reminder}`;
        if (
          reminder &&
          event.startStr.startsWith(today) &&
          currentTime === reminder &&
          !remindedSet.has(key)
        ) {
          remindedSet.add(key);
          alert(`⏰ Reminder: ${cleanTitle}`);
        }
      });
    }, 30000);
  }

  // Initialize calendar when component mounts
    onMount(() => {
    calendar = new Calendar(calendarElement, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: "dayGridMonth", // Default view of FullCalendar: Month grid

      // Toolbar at the top with view selection buttons
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay"
      },

      editable: true,
      selectable: true,
      selectMirror: true,

      events: loadEvents(),

      // When user clicks a date or time range > create a note
      select(info) {
        // Cross-platform: fallback prompt on Windows only
        if (navigator.platform.startsWith("Mac")) {
          console.log("Modal prompt needed on macOS");
          return;
        }

        const note = prompt(`Add a note for ${info.startStr.slice(0, 16)}:`);
        if (!note) return;

        const tag = getTagFromPrompt();
        const color = tagColors[tag] || tagColors.other;

        const wantsReminder = prompt("Set a reminder? (yes/no)")?.toLowerCase() === "yes";
        let reminder: string | null = null;
        if (wantsReminder) {
          reminder = prompt("Enter reminder time (HH:MM, 24-hour format):") ?? null;
        }

        const isMonthView = info.view.type === "dayGridMonth";

// Convert to ISO date string if in month view
const start = isMonthView ? info.startStr.split("T")[0] : info.start;
const end = isMonthView ? undefined : info.end;

calendar.addEvent({
  title: reminder ? `🔔 ${note} @ ${reminder}` : note,
  start: info.start,
  end: info.end,
  allDay: info.allDay,
  backgroundColor: color,
  extendedProps: { tag, reminder },
  display: "block" // force proper rendering in month/week/day views
});




        saveEvents();
      },

      // When user clicks an event > allow editing or deleting
      eventClick(info) {
  if (navigator.platform.startsWith("Mac")) {
    console.log("Modal edit prompt needed on macOS");
    return;
  }

  const cleanTitle = info.event.title.replace(/^🔔 /, "").replace(/ @ \d\d:\d\d$/, "");

  const input = prompt(
    "Edit your note below.\nTo delete this note, type DELETE NOTE exactly (case-sensitive).\n\nClick OK without changing the note to update the tag only:",
    cleanTitle
  );
  if (input === null) return;

  if (input.trim() === "DELETE NOTE") {
    info.event.remove();
  } else {
    const wantsReminder = prompt("Update reminder? (yes/no)")?.toLowerCase() === "yes";
    let newReminder: string | null = null;

    if (wantsReminder) {
      newReminder = prompt("Enter reminder time (HH:MM):") ?? null;
    }

    const tag = getTagFromPrompt(info.event.extendedProps.tag || "other");
    const color = tagColors[tag] || tagColors.other;

    info.event.setExtendedProp("tag", tag);
    info.event.setExtendedProp("reminder", newReminder);
    info.event.setProp("backgroundColor", color);
    info.event.setProp(
      "title",
      newReminder ? `🔔 ${input} @ ${newReminder}` : input
    );

    // force "block" display so it renders properly in day/week/month views
    info.event.setProp("display", "block");
  }

  saveEvents();
}

    });

    calendar.render();
    startReminderLoop();
  });

</script>

<!-- Mounts FullCalendar to this container -->
<div class="calendar-container" bind:this={calendarElement}></div>

<style>
  /* Calendar container styles */
  .calendar-container {
    width: 100vw;
    max-width: 1400px;
    height: 750px;
    margin: auto;
  }

  /* FullCalendar grid styling overrides */
  :global(.fc) {
    width: 100% !important;
    height: 100% !important;
  }

  /* Style for events in month view (dayGrid) */
  :global(.fc-daygrid-event) {
  display: block !important;
  white-space: normal !important;
  overflow-wrap: break-word !important;
  word-break: break-word !important;
  line-height: 1.3 !important;
  font-size: 1rem !important;
  padding: 6px 8px !important;
  background: inherit; /* ensures it inherits color from event config */
  border-radius: 4px;
}


  /* Style for events in week/day (timeGrid) views */
  :global(.fc-timegrid-event) {
    font-size: 1rem !important;
    padding: 6px 8px !important;
    line-height: 1.3;
    white-space: normal !important;
    overflow-wrap: break-word;
  }

  :global(.fc-event-title) {
    font-weight: 500;
    white-space: normal !important;
    overflow-wrap: break-word !important;
    line-height: 1.3;
  }

  /* Ensure short events have visible height */
  :global(.fc-timegrid-event-harness) {
    min-height: 50px !important;
  }

  /* Optionally increase height of month grid rows */
  :global(.fc-daygrid-day-frame) {
    min-height: 90px !important;
  }
</style>
