<script lang="ts">
  import Sidebar from "./Sidebar.svelte";
  import Tasks from "./Tasks.svelte";
  import TasksEditor from "./TasksEditor.svelte";
  import Modal from "./Modal.svelte";

  import { db } from "$lib/firebase/firebaseConfig";
  import { createTaskList } from "$lib/firebase/createTaskList";
  import { getCurrentUser } from "$lib/firebase/authState.svelte";
  import { updateTaskList } from "$lib/firebase/updateTaskList";
  import { createTask } from "$lib/firebase/createTasks";
  import {
    collection,
    query,
    onSnapshot,
    deleteDoc,
    doc,
    where,
  } from "firebase/firestore";
  import { onMount } from "svelte";

  let showMenu = $state(false);
  let showEditModal = $state(false);
  let showDeleteModal = $state(false);
  let uid = getCurrentUser();
  let listNameInput: string = $state("");
  let taskNameInput: string = $state("");
  let taskListsData: any[] = $state([]); // Reactive array to hold the fetched task lists
  let tasksData: any[] = $state([]);
  let loading = $state(true); // Reactive loading state
  let error = $state<string | null>(null); // Reactive error state
  let currentList: string = $state("");
  let currentListId: string = $state("");
  let contextList = $state("");
  let contextListId = $state("");
  let pos = $state({ x: 0, y: 0 });
  let menu = $state({ w: 0, h: 0 });
  let browser = $state({ w: 0, h: 0 });

  function rightClickContextMenu(e: any) {
    showMenu = true;
    browser = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    pos = {
      x: e.clientX,
      y: e.clientY,
    };
    // If bottom part of context menu will be displayed
    // after right-click, then change the position of the
    // context menu. This position is controlled by `top` and `left`
    // at inline style.
    // Instead of context menu is displayed from top left of cursor position
    // when right-click occur, it will be displayed from bottom left.
    if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
    if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;
  }

  function getContextMenuDimension(node: any) {
    // This function will get context menu dimension
    // when navigation is shown => showMenu = true
    let height = node.offsetHeight;
    let width = node.offsetWidth;
    menu = {
      h: height,
      w: width,
    };
  }
  $effect(() => {
    error = null;
    try {
      const q = query(
        collection(db, "Users", uid, "Tasks"),
        where("parentListId", "==", currentListId),
      );

      onSnapshot(q, (querySnapshot) => {
        const newTaskData: any[] = []; // Temporary array to hold new data
        querySnapshot.forEach((doc) => {
          newTaskData.push({ id: doc.id, ...doc.data() }); // Include document ID and spread its data
        });

        console.log("Fetched tasks:", $state.snapshot(newTaskData));
        tasksData = newTaskData;
      });
    } catch (err) {
      console.error("Error fetching task:", err);
      error = "Failed to load tasks. Please try again."; // Set error state
      tasksData = []; // Clear data on error
    } finally {
      loading = false; // Stop loading
    }
  });
  // Fetch TaskLists
  onMount(() => {
    error = null;
    try {
      const q = query(collection(db, "Users", uid, "TaskLists"));

      onSnapshot(q, (querySnapshot) => {
        const newTaskListData: any[] = []; // Temporary array to hold new data
        querySnapshot.forEach((doc) => {
          newTaskListData.push({ id: doc.id, ...doc.data() }); // Include document ID and spread its data
        });
        taskListsData = newTaskListData;
      });
    } catch (err) {
      console.error("Error fetching task lists:", err);
      error = "Failed to load task lists. Please try again."; // Set error state
      taskListsData = []; // Clear data on error
    } finally {
      loading = false; // Stop loading
    }
  });
</script>

<svelte:window
  onclick={() => {
    showMenu = false;
  }}
/>

<!-- Context Menu -->
{#if showMenu}
  <nav
    use:getContextMenuDimension
    style="position: absolute; top:{pos.y}px; left:{pos.x}px"
    class="menu bg-base-200 rounded-box w-56 z-50"
  >
    <button onclick={() => (showDeleteModal = true)} class="btn btn-ghost"
      >Delete</button
    >
  </nav>
{/if}

<!-- Update the TaskList info -->
<Modal bind:showEditModal>
  {#snippet header()}
    <div class="flex justify-center prose">
      <h2 class="items-center">Edit List</h2>
    </div>
  {/snippet}

  <form
    onsubmit={() => {
      updateTaskList(uid, contextList, contextListId);
      showEditModal = false;
    }}
  >
    <input
      type="text"
      bind:value={contextList}
      placeholder="Type here"
      class="input w-full"
    />
    <div class="flex flex-row justify-end w-full">
      <button
        class="btn btn-error"
        onclick={() => {
          showEditModal = false;
        }}>Cancel</button
      >
      <input type="submit" class="btn" value="Save" />
    </div>
  </form>
</Modal>

<!-- Delete the TaskList -->
<Modal bind:showDeleteModal>
  {#snippet header()}
    <div class="flex justify-center prose">
      <h2 class="items-center">Delete List "{contextList}"</h2>
    </div>
  {/snippet}

  <div class="flex justify-center prose">
    <p class="items-center">All the tasks in the list will be deleted.</p>
  </div>
  <div class="flex flex-row justify-end w-full">
    <button class="btn">Cancel</button>
    <button
      onclick={async () => {
        await deleteDoc(doc(db, "Users", uid, "TaskLists", contextListId));
      }}
      class="btn btn-error">Delete</button
    >
  </div>
</Modal>

<!-- Main View -->
<div class="flex flex-row bg-base-300 h-dvh">
  <!-- Tasks Collections Sidebar -->
  {#snippet taskLists()}
    <form
      onsubmit={() => {
        createTaskList(uid, listNameInput);
      }}
      class="join px-2 pt-4"
    >
      <div>
        <label class="input validator join-item">
          <input
            type="text"
            bind:value={listNameInput}
            name="taskListName"
            placeholder="Add List"
            required
          />
        </label>
        <div class="validator-hint hidden">Enter valid email address</div>
      </div>
      <input type="submit" class="btn btn-neutral join-item" value="Add" />
    </form>
    <ul class="menu bg-base-200 rounded-box w-full">
      <li>
        <details open>
          <summary>Lists</summary>
          <ul>
            <li>
              {#each taskListsData as list}
                <div
                  role="menuitem"
                  tabindex={0}
                  onclick={() => {
                    currentList = list.name;
                    currentListId = list.id;
                  }}
                  onkeydown={() => {
                    currentList = list.name;
                    currentListId = list.id;
                  }}
                  oncontextmenu={(event) => {
                    contextList = list.name;
                    contextListId = list.id;
                    event.preventDefault();
                    rightClickContextMenu(event);
                  }}
                  class="w-full"
                >
                  {list.name}
                  {console.log("Rendering list:", list.name)}
                </div>
              {/each}
            </li>
          </ul>
        </details>
      </li>
    </ul>
  {/snippet}
  <Sidebar {taskLists} />

  <!-- Tasks Lists -->
  {#snippet tasks()}
    <form
      onsubmit={() => {
        createTask(uid, taskNameInput, currentListId);
      }}
      class="join px-2 pt-4"
    >
      <div>
        <label class="input validator join-item">
          <input
            type="text"
            bind:value={taskNameInput}
            name="taskName"
            placeholder="Add List"
            required
          />
        </label>
      </div>
      <input type="submit" class="btn btn-neutral join-item" value="Add" />
    </form>

    <ul class="menu bg-base-200 rounded-box w-full">
      <li>
        <details open>
          <summary>Tasks</summary>
          <ul>
            <li>
              {#each tasksData as tasks}
                <div class="w-full">
                  {tasks.name}
                  {console.log("Rendering task:", tasks.name)}
                </div>
              {/each}
            </li>
          </ul>
        </details>
      </li>
    </ul>
  {/snippet}
  <Tasks {tasks} />

  <!-- Tasks Editor -->
  <div class="flex-1 overflow-auto bg-base-100 flex flex-col">
    <!-- Note title bar -->
    <div class="border-b border-base-300 p-3">
      <input
        type="text"
        class="input input-ghost w-full font-medium text-lg focus:bg-transparent"
        placeholder="Untitled Note"
        value="Journal"
      />
    </div>

    <!-- Centered editor -->
    <div class="flex-1 overflow-auto">
      <div class="max-w-7xl mx-auto h-full prose prose-sm p-4">
        <TasksEditor />
      </div>
    </div>
  </div>
</div>

<style></style>
