<script lang="ts">

    const { children, ...props } = $props();

</script>

<a class="transition-colors duration-300 hover:text-white" {...props}>
    {@render children?.()}
</a>
