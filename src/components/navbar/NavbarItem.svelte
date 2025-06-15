<script lang="ts">

    const { children, ...props } = $props();

</script>

<a class="transition-opacity duration-300 hover:opacity-75" {...props}>
    {@render children?.()}
</a>
