<script lang="ts">
  // Required FullCalendar CSS via CDN for Tauri compatibility (especially on Mac OS)
  import "@fullcalendar/core/index.js"; // included for runtime dependencies
  import { onMount } from "svelte";
  import { Calendar } from "@fullcalendar/core";
  import type { Calendar as CalendarInstance, EventApi } from "@fullcalendar/core";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import interactionPlugin from "@fullcalendar/interaction";
  import timeGridPlugin from "@fullcalendar/timegrid";

  // Setup FullCalendar library instance and reference to DOM element
  let calendar: CalendarInstance;
  let calendarElement!: HTMLDivElement;

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
    const choice = prompt(
      `Select a tag number:\n` +
        tagOptions.map((tag, i) => `${i + 1} - ${tag}`).join("\n")
    );
    const index = parseInt(choice ?? "");
    return tagOptions[index - 1] || defaultTag;
  }

  // Save current calendar events to sessionStorage for future use
  function saveEvents() {
    const events = calendar.getEvents().map(e => ({
      title: e.title.replace(/^🔔 /, ""),
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
        title: e.reminder ? `🔔 ${e.title}` : e.title,
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
        const cleanTitle = event.title.replace(/^🔔 /, "");
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
    initialView: "dayGridMonth", // Default view: Month grid

    // Toolbar at the top with view selection buttons
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay"
    },

    editable: true,
    selectable: true,
    selectMirror: true, // Fix: enables visual highlight and correct select behavior

    events: loadEvents(),

    // When user clicks a date or time range > create a note
    select(info) {
      const note = prompt(`Add a note for ${info.startStr.slice(0, 16)}:`);
      if (!note) return;

      const tag = getTagFromPrompt();
      const color = tagColors[tag] || tagColors.other;

      const wantsReminder = prompt("Set a reminder? (yes/no)")?.toLowerCase() === "yes";
      let reminder: string | null = null;
      if (wantsReminder) {
        reminder = prompt("Enter reminder time (HH:MM, 24-hour format):") ?? null;
      }

      calendar.addEvent({
        title: reminder ? `🔔 ${note}` : note,
        start: info.start,
        end: info.end,
        allDay: info.allDay,
        backgroundColor: color,
        extendedProps: { tag, reminder }
      });

      saveEvents();
    },


      // When user clicks an event > allow editing or deleting
      eventClick(info) {
        const input = prompt(
          "Edit your note below.\nTo delete this note, type DELETE NOTE exactly (case-sensitive).\n\nClick OK without changing the note to update the tag only:",
          info.event.title.replace(/^🔔 /, "")
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
          info.event.setProp("title", newReminder ? `🔔 ${input}` : input);
        }

        saveEvents();
      }
    });

    calendar.render();
    startReminderLoop();
  });
</script>

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

  :global(.fc-event) {
    font-size: 1.2rem;
    padding: 5px;
  }

  /* ⬇️ Add this below your existing styles ⬇️ */

  /* Make timeGrid view cells taller and text more readable */
  :global(.fc-timegrid-slot) {
    height: 60px !important; /* taller rows */
  }

  :global(.fc-timegrid-event) {
    font-size: 1rem !important;
    padding: 6px 8px !important;
    line-height: 1.2;
    white-space: normal !important;
    overflow-wrap: break-word;
  }

  :global(.fc-timegrid-event .fc-event-title) {
    font-weight: 500;
  }

  /* Optional: ensure short events have visible height */
  :global(.fc-timegrid-event-harness) {
    min-height: 50px !important;
  }

</style>


<!-- Mounts FullCalendar to this container -->
<div class="calendar-container" bind:this={calendarElement}></div>

"make the calendar views weekly month week and day which is a plug in"  
"add time stamp for the reminders"
"fix the errors for the Mac OS"
"Persistance between session aka saving notes and use tauri store" 

