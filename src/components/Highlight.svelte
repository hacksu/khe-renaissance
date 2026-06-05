<script lang="ts">
    import type { Snippet } from 'svelte';
    let { children }: { children?: Snippet } = $props();
</script>

<span class="font-bold text-castle-torchYellow [text-shadow:0_0_12px_rgba(255_176_71/_0.8)]">
    {@render children?.()}
</span>