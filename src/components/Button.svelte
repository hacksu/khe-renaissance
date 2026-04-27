<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { twMerge } from "tailwind-merge";

    type ButtonSize = "md" | "lg";
    type Props = { size?: ButtonSize } & HTMLButtonAttributes;
    const { children, size = "md", class: extraClass, ...others }: Props = $props();
</script>

<div class="w-full">
    <button
        {...others}
        class={twMerge(`flex flex-row justify-center items-center gap-2 bg-castle-torchOrange rounded-lg px-2 py-2 w-full text-white text-${size} transition-opacity duration-300 hover:opacity-75 disabled:opacity-25`, extraClass)}
    >
        {@render children?.()}
    </button>
</div>
