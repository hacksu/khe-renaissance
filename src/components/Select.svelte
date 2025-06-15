<script lang="ts">
    import type { HTMLSelectAttributes } from "svelte/elements";


    type Props = {
        label?: string;
    };

    let { label, children, ...others }: HTMLSelectAttributes & Props = $props();
</script>

<div class="relative w-full">
    {#if label}
        <label for={others.id} class="text-sm block mb-1">{label}</label>
    {/if}
    <select
        {...others}
        class="text-black w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        {@render children?.()}
    </select>
</div>
