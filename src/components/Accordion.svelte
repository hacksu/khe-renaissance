
<script lang="ts">
    import type { Snippet } from 'svelte';
    import { slide } from 'svelte/transition';

  type Props = { name: Snippet, content: Snippet };
  const { name, content }: Props = $props();

  let open = $state(false);
</script>

<div class="flex flex-col items-start">
    <button class="p-4 hover:bg-gray-500 w-full flex flex-row" onclick={() => open = !open}>
        {@render name()}
    </button>
    {#if open}
        <div transition:slide class="bg-gray-600 p-10 w-full">
            {@render content()}
        </div>
    {/if}
</div>
