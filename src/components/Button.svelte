<script>

    const { children, ...props } = $props();

</script>

<button {...props}
    class="flex flex-row justify-center items-center gap-2 bg-gray-400 rounded-lg px-2 py-2 w-full text-black text-2xl transition-colors duration-300 hover:bg-gray-300">
    {@render children?.()}
</button>
