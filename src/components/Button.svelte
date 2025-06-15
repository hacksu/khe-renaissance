<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";

    type ButtonSize = "md" | "lg";
    type Props = { size?: ButtonSize } & HTMLButtonAttributes;
    const { children, size = "md", ...others }: Props = $props();
</script>

<div>
    <button
        {...others}
        class="flex flex-row justify-center items-center gap-2 bg-accent rounded-lg px-2 py-2 w-full text-black text-{size} transition-opacity duration-300 hover:opacity-75 disabled:opacity-25"
    >
        {@render children?.()}
    </button>
</div>
