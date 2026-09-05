<script lang="ts">
    import "../app.css";
    let { children } = $props();
</script>

<div class="text-white bg-castle-skyDeep min-h-screen flex flex-col">
    <div class="flex-1">
        {@render children()}
    </div>
</div>
