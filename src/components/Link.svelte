<script lang="ts">
    import type { HTMLAnchorAttributes } from "svelte/elements";

    const props: HTMLAnchorAttributes = $props();
</script>

<a target="_blank" {...props} class="text-blue-400 transition-opacity duration-300 hover:opacity-50">{@render props.children?.()}</a>