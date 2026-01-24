<script lang="ts">

    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';
    
    let { children, class: className, ...props }: { children?: Snippet, class?: string } & HTMLAttributes<HTMLDivElement> = $props();

</script>

{#if !children}
    <div class="w-full h-[1px] border-[1px] my-2 {className}" {...props}></div>
{:else}
    <div class="flex h-full gap-2 items-center {className}" {...props}>
        <div class="w-full h-[1px] border-[1px] my-2"></div>
        {@render children()}
        <div class="w-full h-[1px] border-[1px] my-2"></div>
    </div>
{/if}