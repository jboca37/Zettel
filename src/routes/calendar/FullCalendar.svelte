<script lang="ts">
    import { onMount } from "svelte";
    import { Calendar } from "@fullcalendar/core";
    import type { Calendar as CalendarInstance, EventApi } from "@fullcalendar/core";
    import dayGridPlugin from "@fullcalendar/daygrid";
    import interactionPlugin from "@fullcalendar/interaction";
  
    let calendar: CalendarInstance;
    let calendarElement!: HTMLDivElement;
  
    const remindedSet: Set<string> = new Set();
  
    const tagColors: Record<string, string> = {
      work: "#3B82F6",
      school: "#F97316",
      personal: "#10B981",
      urgent: "#EF4444",
      other: "#9CA3AF"
    };
  
    const tagOptions = ["work", "school", "personal", "urgent", "other"];
  
    function getTagFromPrompt(defaultTag = "other"): string {
      const choice = prompt(
        `Select a tag number:\n` +
          tagOptions.map((tag, i) => `${i + 1} - ${tag}`).join("\n")
      );
      const index = parseInt(choice ?? "");
      return tagOptions[index - 1] || defaultTag;
    }
  
    function saveEvents() {
      const events = calendar.getEvents().map(e => ({
        title: e.title.replace(/^🔔 /, ""),
        start: e.startStr,
        tag: e.extendedProps.tag,
        reminder: e.extendedProps.reminder || null
      }));
      sessionStorage.setItem("calendarNotes", JSON.stringify(events));
    }
  
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
  
    function startReminderLoop() {
      setInterval(() => {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  
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
  
    onMount(() => {
      calendar = new Calendar(calendarElement, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: "dayGridMonth",
        editable: true,
        selectable: true,
        events: loadEvents(),
  
        dateClick(info) {
          const note = prompt(`Add a note for ${info.dateStr}:`);
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
            start: info.dateStr,
            allDay: true,
            backgroundColor: color,
            extendedProps: { tag, reminder }
          });
  
          saveEvents();
        },
  
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
    .calendar-container {
      width: 100vw;
      max-width: 1400px;
      height: 750px;
      margin: auto;
    }
  
    :global(.fc) {
      width: 100% !important;
      height: 100% !important;
    }
  
    :global(.fc-event) {
      font-size: 1.2rem;
      padding: 5px;
    }
  </style>
  
  <div class="calendar-container" bind:this={calendarElement}></div>
  