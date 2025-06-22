<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    let { children, ...others }: HTMLInputAttributes = $props();
</script>

<div class="relative w-full flex flex-row gap-4">
    <input
        type="checkbox"
        {...others}
        class="text-black border mt-4 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <span>{@render children?.()}</span>
</div>
