<script>

    const { children } = $props();

</script>

<div class="border-2 border-white rounded-md h-full bg-gray-700 text-white">
    {@render children?.()}
</div>
