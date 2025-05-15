<script lang="ts">
  import { onMount } from "svelte";
  import { Calendar } from "@fullcalendar/core";
  import type {
    Calendar as CalendarInstance,
    EventApi,
    DateSelectArg,
  } from "@fullcalendar/core";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import interactionPlugin from "@fullcalendar/interaction";
  import timeGridPlugin from "@fullcalendar/timegrid";

  // Setup FullCalendar library instance and reference to DOM element
  let calendar: CalendarInstance;
  let calendarElement!: HTMLDivElement;

  // State for controlling modals
  let showTagModal: boolean = $state(false);
  let showAddModal: boolean = $state(false);
  let showEditModal: boolean = $state(false);

  // State for data being passed to/from modals
  let currentSelectedInfo: DateSelectArg | null = $state(null); // For adding events
  let currentClickedEvent: EventApi | null = $state(null); // For editing events
  let newNoteTitle: string = $state("");
  let wantsReminder: boolean = $state(false);
  let newReminderTime: string = $state(""); // HH:MM format
  let selectedTag: string = $state("other");
  let pendingAction: "add" | "edit" | null = $state(null); // Tracks which flow initiated tag selection

  // Keeps track of which reminders we've already alerted for (avoid duplicates)
  const remindedSet: Set<string> = new Set();

  // Tag colors used to color-code calendar notes based off work, school, personal, urgent, or other
  const tagColors: Record<string, string> = {
    work: "#3B82F6", // Light Blue
    school: "#F97316", // Vaquero Orange......V's up!
    personal: "#10B981", // Green
    urgent: "#EF4444", // Red
    other: "#9CA3AF", // Gray
  };

  // Options shown to user for tagging notes
  const tagOptions = ["work", "school", "personal", "urgent", "other"];

  // Prompt user to pick a tag by number based off the options
  function getTagFromPrompt(defaultTag = "other"): string {
    const choice = prompt(
      `Select a tag number:\n` +
        tagOptions.map((tag, i) => `${i + 1} - ${tag}`).join("\n"),
    );
    const index = parseInt(choice ?? "");
    return tagOptions[index - 1] || defaultTag;
  }

  // Save current calendar events to sessionStorage for future use
  function saveEvents() {
    const events = calendar.getEvents().map((e) => ({
      title: e.title.replace(/^🔔 /, ""),
      start: e.startStr,
      tag: e.extendedProps.tag,
      reminder: e.extendedProps.reminder || null,
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
          reminder: e.reminder || null,
        },
      }));
    } catch {
      console.error("Failed to load events from sessionStorage");
      return [];
    }
  }

  // Loop that checks reminders every 30 seconds in order for notification pop up to work and not skip
  function startReminderLoop() {
    setInterval(() => {
      const now = new Date();
      // Use ISO string for date comparison, slice to get YYYY-MM-DD
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM 24-hour format to avoid AM/PM

      calendar.getEvents().forEach((event) => {
  const reminder = event.extendedProps.reminder;
  const cleanTitle = event.title.replace(/^🔔 /, "");
  const key = `${cleanTitle}-${event.startStr}-${reminder}`;
  const eventDate = event.start?.toISOString().split("T")[0];
  if (
    reminder &&
    eventDate === today && // Check if the event is for today so it goes in the correct box
    currentTime === reminder && // Check if the current time matches the reminder time
    !remindedSet.has(key) // Ensure we haven't already alerted for this specific reminder to avoid repeating
  ) {
    remindedSet.add(key);
    alert(`⏰ Reminder: ${cleanTitle}`);
  }
});
    }, 30000); // Check every 30 seconds
  }

  // --- Modal Handlers --- for mac os

  // Called when a tag is selected in the tag modal
  function handleTagSelected(tag: string | null) {
    showTagModal = false; // Close the tag modal
    if (tag) {
      selectedTag = tag;
      // Now proceed based on the pending action
      if (pendingAction === "add") {
        // User selected tag for adding a new event, now show the add modal
        showAddModal = true;
      } else if (pendingAction === "edit") {
        // User selected tag while editing, the edit modal is still open or will use the new tag
        // No need to open another modal, the edit modal submit handler will use the updated selectedTag
        // Let's ensure the edit modal state reflects the newly selected tag if it was open.
        // The state 'selectedTag' is reactive, so the edit modal's display should update.
      }
    } else {
      // Tag selection was cancelled. Reset pending action.
      pendingAction = null;
      // Depending on the flow, we might need to decide if the subsequent modal should still open.
      // For simplicity, cancelling the tag selection cancels the whole operation (add or edit tag).
      if (pendingAction === "add") {
        // If cancelling tag during add flow, reset selected info too
        currentSelectedInfo = null;
      }
      // If cancelling tag during edit flow, the edit modal remains open. User can cancel the edit modal as well.
    }
  }

  // Called when the "Add Note" button is clicked in the Add modal
function handleAddEvent(event: SubmitEvent) {
  event.preventDefault(); // Prevent default form submission

  if (!currentSelectedInfo || !newNoteTitle.trim()) {
    // Should not happen if modal is controlled correctly, but good check
    alert("Please provide a note title.");
    return;
  }

  let reminderTime: string | null = null;
  if (wantsReminder) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (timeRegex.test(newReminderTime)) {
      reminderTime = newReminderTime;
    } else {
      alert("Invalid time format. Please use HH:MM (24-hour).");
      return;
    }
  }

  const color = tagColors[selectedTag] || tagColors.other;
  const title = reminderTime
    ? `🔔 ${newNoteTitle.trim()} @ ${reminderTime}`
    : newNoteTitle.trim();

  let eventStart = currentSelectedInfo.start;
  let isAllDay = true;

  if (reminderTime) {
    const dateStr = currentSelectedInfo.start.toISOString().split("T")[0];
    eventStart = new Date(`${dateStr}T${reminderTime}`);
    isAllDay = false;
  }

  const eventEnd = isAllDay
    ? currentSelectedInfo.end
    : new Date((eventStart as Date).getTime() + 60 * 60 * 1000);

  calendar.addEvent({
  title,
  start: eventStart,
  end: eventEnd,
  allDay: isAllDay,
  backgroundColor: color,
  display: "block",
  extendedProps: { tag: selectedTag, reminder: reminderTime },
});

requestAnimationFrame(() => {
  const currentView = calendar.view.type;
  calendar.changeView("dayGridMonth");
  requestAnimationFrame(() => {
    calendar.changeView(currentView);
  });
});

  saveEvents();
  resetAddModalState(); // Clear inputs and close modal
}



  // Called when the "Save Changes" button is clicked in the Edit modal
  function handleEditEvent(event: SubmitEvent) {
    event.preventDefault(); // Prevent default form submission

    if (!currentClickedEvent || !newNoteTitle.trim()) {
      // Should not happen
      resetEditModalState();
      return;
    }

    let reminderTime: string | null = null;
    if (wantsReminder) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (timeRegex.test(newReminderTime)) {
        reminderTime = newReminderTime;
      } else {
        alert("Invalid time format. Please use HH:MM (24-hour).");
        // Keep modal open
        return;
      }
    }

    const color = tagColors[selectedTag] || tagColors.other;
    const title = reminderTime
      ? `🔔 ${newNoteTitle.trim()} @ ${reminderTime}`
      : newNoteTitle.trim();

    currentClickedEvent.setProp("title", title);
    currentClickedEvent.setProp("backgroundColor", color);
    currentClickedEvent.setExtendedProp("tag", selectedTag);
    currentClickedEvent.setExtendedProp("reminder", reminderTime);

    saveEvents();
    resetEditModalState(); // Clear inputs and close modal
  }

  // Called when the "Delete Note" button is clicked in the Edit modal
  function handleDeleteEvent() {
    if (currentClickedEvent) {
      currentClickedEvent.remove();
      saveEvents();
      resetEditModalState();
    }
  }

  // Reset state variables after modals are closed or actions completed
  function resetAddModalState() {
    showAddModal = false;
    currentSelectedInfo = null;
    newNoteTitle = "";
    wantsReminder = false;
    newReminderTime = "";
    selectedTag = "other"; 
    pendingAction = null;
  }

  function resetEditModalState() {
    showEditModal = false;
    currentClickedEvent = null;
    newNoteTitle = "";
    wantsReminder = false;
    newReminderTime = "";
    selectedTag = "other"; 
    pendingAction = null;
  }

  function resetTagModalState() {
    showTagModal = false;
  }

  // Initialize calendar when component mounts
  onMount(() => {
  calendar = new Calendar(calendarElement, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: "dayGridMonth", // Default view of FullCalendar is Month grid

    // Toolbar at the top with view selection buttons
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },

    editable: true,
    selectable: true,
    selectMirror: true,

    // fix rendering issues across views for day and week view
    eventDataTransform: function (eventData) {
      return {
        ...eventData,
        display: "block",
      };
    },

    events: loadEvents(), // Load events on initial render

    // When user clicks a date or time range > create a note
    select(info) {
      const note = prompt(`Add a note for ${info.startStr.slice(0, 16)}:`);
      if (!note) return;

      const tag = getTagFromPrompt();
      const color = tagColors[tag] || tagColors.other;

      const wantsReminder =
        prompt("Set a reminder? (yes/no)")?.toLowerCase() === "yes";
      let reminder: string | null = null;
      let eventStart = info.start;
      let isAllDay = info.allDay;

      if (wantsReminder) {
        reminder = prompt("Enter reminder time (HH:MM, 24-hour format):") ?? null;

        if (reminder) {
          const dateStr = info.startStr.split("T")[0];
          eventStart = new Date(`${dateStr}T${reminder}`);
          isAllDay = false;
        }
      }

      const eventEnd = isAllDay
        ? info.end
        : new Date(eventStart.getTime() + 60 * 60 * 1000);

      calendar.addEvent({
        title: reminder ? `🔔 ${note} @ ${reminder}` : note,
        start: eventStart,
        end: eventEnd,
        allDay: isAllDay,
        backgroundColor: color,
        display: "block",
        extendedProps: { tag, reminder },
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
        const wantsReminder =
          prompt("Update reminder? (yes/no)")?.toLowerCase() === "yes";
        let newReminder: string | null = null;
        let newStart: Date = new Date(info.event.start!);
        let isAllDay = info.event.allDay;

        if (wantsReminder) {
          newReminder = prompt("Enter reminder time (HH:MM):") ?? null;
          if (newReminder) {
            const dateStr = info.event.startStr.split("T")[0];
            newStart = new Date(`${dateStr}T${newReminder}`);
            isAllDay = false;
          }
        }

        const tag = getTagFromPrompt(info.event.extendedProps.tag || "other");
        const color = tagColors[tag] || tagColors.other;
        const newEnd = isAllDay
          ? null
          : new Date(newStart.getTime() + 60 * 60 * 1000);

        info.event.setExtendedProp("tag", tag);
        info.event.setExtendedProp("reminder", newReminder);
        info.event.setProp("backgroundColor", color);
        info.event.setProp("start", newStart);
        info.event.setProp("allDay", isAllDay);
        info.event.setProp(
          "title",
          newReminder ? `🔔 ${input} @ ${newReminder}` : input
        );
        info.event.setProp("display", "block");

        if (!isAllDay) {
          info.event.setProp("end", newEnd);
        }
      }

      saveEvents();
    },
  });

  calendar.render();
  startReminderLoop(); 
});

</script>

<div
  class="calendar-container w-full max-w-7xl mx-auto p-4"
  bind:this={calendarElement}
></div>

<!--"Persistance between session aka saving notes and use tauri store" -->

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

  /* Make timeGrid view cells taller and text more readable to avoid missing text that can't be read */
  :global(.fc-timegrid-slot) {
    height: 60px !important;
  }

  :global(.fc-timegrid-event) {
    font-size: 1rem !important;
    padding: 6px 8px !important;
    line-height: 1.2;
    white-space: normal !important;
    overflow-wrap: break-word;
  }

  :global(.fc-event-title) {
    font-weight: 500;
    white-space: normal !important;
    overflow-wrap: break-word !important;
    line-height: 1.2;
  }

  /* Ensure short events have visible height */
  :global(.fc-timegrid-event-harness) {
    min-height: 50px !important;
  }

  :global(.fc-daygrid-event .fc-event-time) {
  display: none !important;
}

</style>
