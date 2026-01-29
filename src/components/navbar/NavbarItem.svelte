<script lang="ts">

    import type { Snippet } from 'svelte';
    import type { HTMLAnchorAttributes } from 'svelte/elements';

    type Props = { children?: Snippet };
    let { children, ...props }: Props & HTMLAnchorAttributes = $props();

</script>

<a class="transition-opacity  duration-300 hover:opacity-75" {...props}>
    {@render children?.()}
</a>
