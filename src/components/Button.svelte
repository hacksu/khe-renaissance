<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";

    type ButtonSize = "md" | "lg";
    type Props = { size?: ButtonSize } & HTMLButtonAttributes;
    const { children, size = "md", disabled, ...others }: Props = $props();
</script>

<div>
    {#if disabled}
        <button
            {...others}
            disabled
            class="flex flex-row justify-center items-center gap-2 bg-gray-600 rounded-lg px-2 py-2 w-full text-black text-{size}"
        >
            {@render children?.()}
        </button>
    {:else}
        <button
            {...others}
            class="flex flex-row justify-center items-center gap-2 bg-accent rounded-lg px-2 py-2 w-full text-black text-{size} transition-colors duration-300 hover:bg-white"
        >
            {@render children?.()}
        </button>
    {/if}
</div>
