<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = { label?: string };
  let { label, ...others }: HTMLInputAttributes & Props = $props();
</script>

<div class="relative w-full">
  {#if label}
    <label for={others.id} class="text-sm">{label}</label>
  {/if}
  <input
    type="text"
    {...others}
    class="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>