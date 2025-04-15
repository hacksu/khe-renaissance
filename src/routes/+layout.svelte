<script lang="ts">
    import "../app.css";
    import Navbar from "../components/navbar/Navbar.svelte";
    let { children } = $props();
</script>

<div class="text-white">
    <Navbar />
    {@render children()}
</div>
