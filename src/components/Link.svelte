<script lang="ts">
    import type { HTMLAnchorAttributes } from "svelte/elements";

    const props: HTMLAnchorAttributes = $props();
</script>

<a target="_blank" {...props} class="text-castle-torchAmber transition-colors duration-200 hover:text-castle-torchYellow underline underline-offset-2">{@render props.children?.()}</a>