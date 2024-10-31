
<script lang="ts">
  import { slide } from 'svelte/transition';

  let open = false;
</script>

<div class="flex flex-col items-start">
    <button class="p-4 hover:bg-gray-500 w-full flex flex-row" on:click={() => open = !open}>
        <slot name="name"></slot>
    </button>
    {#if open}
        <div transition:slide class="bg-gray-600 p-10 w-full">
            <slot name="content"></slot>
        </div>
    {/if}
</div>
