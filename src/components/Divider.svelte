<script lang="ts">

    const { children } = $props();

</script>

{#if !children}
    <div class="w-full h-[1px] border-[1px] my-2"></div>
{:else}
    <div class="flex h-full gap-2 items-center">
        <div class="w-full h-[1px] border-[1px] my-2"></div>
        {@render children()}
        <div class="w-full h-[1px] border-[1px] my-2"></div>
    </div>
{/if}