<script lang="ts">

    const { children, ...props } = $props();

</script>

<a class="transition-colors duration-300 hover:text-gray-300" {...props}>
    {@render children?.()}
</a>
