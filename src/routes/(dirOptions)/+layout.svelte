<script lang="ts">
  import "../../app.css";
  import ViewTransition from "./navigation.svelte";
  let { children } = $props();
</script>

<ViewTransition />
{@render children()}
