<script lang="ts">
    import type { HTMLAnchorAttributes } from "svelte/elements";

    const props: HTMLAnchorAttributes = $props();
</script>

<a target="_blank" {...props} class="text-link transition-colors duration-200 hover:text-primary underline underline-offset-2">{@render props.children?.()}</a>