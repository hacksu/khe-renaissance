<script lang="ts">
    import type { Snippet } from "svelte";
    
    type Props = { children: Snippet, padded?: boolean };
    const { children, padded = false }: Props = $props();

</script>

<div class="border-2 border-white rounded-md h-full bg-secondary text-white {padded ? "p-4" : ""}">
    {@render children()}
</div>
