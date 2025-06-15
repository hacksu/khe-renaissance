<script lang="ts">
    const { children } = $props();
</script>

<span class="font-bold [text-shadow:0_0_10px_rgba(255_255_255/_0.6)]">
    {@render children?.()}
</span>