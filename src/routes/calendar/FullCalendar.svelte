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

  // Save current calendar events to sessionStorage for future use
  function saveEvents() {
    const events = calendar.getEvents().map((e) => ({
      title: e.title.replace(/^🔔 /, "").replace(/ @ \d{2}:\d{2}$/, ""), // Clean up reminder icon and time for saving
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
      return saved.map((e: any) => {
        // Reconstruct title with reminder icon and time if present
        const title = e.reminder ? `🔔 ${e.title} @ ${e.reminder}` : e.title;
        return {
          title: title,
          start: e.start,
          allDay: true, // Assuming all notes added via select are all-day unless timeGrid is used? Recheck FullCalendar select behavior. For dayGrid this is true.
          backgroundColor: tagColors[e.tag] || tagColors.other,
          extendedProps: {
            tag: e.tag || "other",
            reminder: e.reminder || null,
          },
        };
      });
    } catch {
      console.error("Failed to load events from sessionStorage");
      return [];
    }
  }

  // Loop that checks reminders every 30 seconds in order for notification pop up to work
  function startReminderLoop() {
    setInterval(() => {
      const now = new Date();
      // Use ISO string for date comparison, slice to get YYYY-MM-DD
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM 24-hour format

      calendar.getEvents().forEach((event) => {
        const reminder = event.extendedProps.reminder;
        // Get the date part of the event's start string
        const eventDate = event.startStr.split("T")[0];
        const cleanTitle = event.title
          .replace(/^🔔 /, "")
          .replace(/ @ \d{2}:\d{2}$/, ""); // Clean up icon and time for alert message

        const key = `${cleanTitle}-${event.startStr}-${reminder}`; // Unique key for this reminder instance

        if (
          reminder &&
          eventDate === today && // Check if the event is for today
          currentTime === reminder && // Check if the current time matches the reminder time
          !remindedSet.has(key) // Ensure we haven't already alerted for this specific reminder
        ) {
          remindedSet.add(key);
          // Use a simple alert for demonstration. For Tauri, you might use native notifications.
          alert(`⏰ Reminder: ${cleanTitle}`);
        }
      });
    }, 30000); // Check every 30 seconds
  }

  // --- Modal Handlers ---

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
      // Basic validation for HH:MM format
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

    calendar.addEvent({
      title: title,
      start: currentSelectedInfo.start,
      end: currentSelectedInfo.end, // Use end from selection info (important for timeGrid)
      allDay: currentSelectedInfo.allDay,
      backgroundColor: color,
      extendedProps: { tag: selectedTag, reminder: reminderTime },
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
    selectedTag = "other"; // Reset tag for next add
    pendingAction = null;
  }

  function resetEditModalState() {
    showEditModal = false;
    currentClickedEvent = null;
    newNoteTitle = "";
    wantsReminder = false;
    newReminderTime = "";
    selectedTag = "other"; // Reset tag state
    pendingAction = null;
  }

  function resetTagModalState() {
    showTagModal = false;
    // Don't reset selectedTag here immediately, let the handler use it.
    // pendingAction is reset in handleTagSelected if cancelled.
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
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },

      editable: true,
      selectable: true,
      selectMirror: true,

      events: loadEvents(), // Load events on initial render

      // When user clicks a date or time range > initiate add note flow
      select(info) {
        // Store info and initiate the tag selection modal first
        currentSelectedInfo = info;
        pendingAction = "add";
        selectedTag = "other"; // Default tag for new events
        showTagModal = true; // First, ask for the tag
        // The handleTagSelected function will open the add modal if a tag is chosen
      },

      // When user clicks an event > initiate edit/delete flow
      eventClick(info) {
        // Store the clicked event and populate state for the edit modal
        currentClickedEvent = info.event;
        newNoteTitle = info.event.title
          .replace(/^🔔 /, "")
          .replace(/ @ \d{2}:\d{2}$/, ""); // Clean title
        wantsReminder = !!info.event.extendedProps.reminder;
        newReminderTime = info.event.extendedProps.reminder || "";
        selectedTag = info.event.extendedProps.tag || "other"; // Set initial tag for the modal
        pendingAction = "edit"; // Set pending action in case tag modal is opened from edit
        showEditModal = true; // Open the edit modal
      },
    });

    calendar.render();
    startReminderLoop(); // Start checking for reminders
  });
</script>

<div
  class="calendar-container w-full max-w-7xl mx-auto p-4"
  bind:this={calendarElement}
></div>

<!-- Modal for Adding Tags -->
<dialog
  id="tag_modal"
  class="modal"
  class:modal-open={showTagModal}
  onclose={resetTagModalState}
>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Select a Tag</h3>
    <p class="py-4">Choose a category for your note:</p>
    <div class="flex flex-wrap gap-2">
      {#each tagOptions as tag}
        <button
          class="btn btn-sm"
          class:btn-primary={selectedTag === tag}
          style:background-color={tagColors[tag]}
          style:border-color={tagColors[tag]}
          onclick={() => handleTagSelected(tag)}
        >
          {tag}
        </button>
      {/each}
    </div>
    <div class="modal-action">
      <button class="btn" onclick={() => handleTagSelected(null)}>Cancel</button
      >
    </div>
  </div>
  <form
    method="dialog"
    class="modal-backdrop"
    onclick={() => handleTagSelected(null)}
  >
    <button>close</button>
  </form>
</dialog>

<!-- Modal for Note Name -->
<dialog
  id="add_modal"
  class="modal"
  class:modal-open={showAddModal}
  onclose={resetAddModalState}
>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Add New Note</h3>
    <form onsubmit={handleAddEvent} class="space-y-4 mt-4">
      <div class="form-control">
        <label class="label" for="note-title">
          <span class="label-text">Note Title</span>
        </label>
        <input
          type="text"
          id="note-title"
          placeholder="Enter note title"
          class="input input-bordered w-full"
          bind:value={newNoteTitle}
          required
        />
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Set Reminder</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            bind:checked={wantsReminder}
          />
        </label>
      </div>

      {#if wantsReminder}
        <div class="form-control">
          <label class="label" for="reminder-time">
            <span class="label-text">Reminder Time (HH:MM)</span>
          </label>
          <input
            type="time"
            id="reminder-time"
            class="input input-bordered w-full"
            bind:value={newReminderTime}
            required={wantsReminder}
          />
        </div>
      {/if}

      <div class="modal-action">
        <button type="button" class="btn" onclick={resetAddModalState}
          >Cancel</button
        >
        <button type="submit" class="btn btn-primary">Add Note</button>
      </div>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop" onclick={resetAddModalState}>
    <button>close</button>
  </form>
</dialog>

<!-- Modal for Editing Existing Notes -->
<dialog
  id="edit_modal"
  class="modal"
  class:modal-open={showEditModal}
  onclose={resetEditModalState}
>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Edit Note</h3>
    {#if currentClickedEvent}
      <form onsubmit={handleEditEvent} class="space-y-4 mt-4">
        <div class="form-control">
          <label class="label" for="edit-note-title">
            <span class="label-text">Note Title</span>
          </label>
          <input
            type="text"
            id="edit-note-title"
            placeholder="Enter note title"
            class="input input-bordered w-full"
            bind:value={newNoteTitle}
            required
          />
        </div>

        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Set Reminder</span>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              bind:checked={wantsReminder}
            />
          </label>
        </div>

        {#if wantsReminder}
          <div class="form-control">
            <label class="label" for="edit-reminder-time">
              <span class="label-text">Reminder Time (HH:MM)</span>
            </label>
            <input
              type="time"
              id="edit-reminder-time"
              class="input input-bordered w-full"
              bind:value={newReminderTime}
              required={wantsReminder}
            />
          </div>
        {/if}

        <div class="modal-action grid grid-cols-2 gap-4">
          <button
            type="button"
            class="btn btn-error"
            onclick={handleDeleteEvent}>Delete Note</button
          >
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
        <div class="modal-action justify-end">
          <button type="button" class="btn" onclick={resetEditModalState}
            >Cancel</button
          >
        </div>
      </form>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop" onclick={resetEditModalState}>
    <button>close</button>
  </form>
</dialog>
