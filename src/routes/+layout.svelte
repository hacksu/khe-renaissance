<script lang="ts">
    import "../app.css";
    import Footer from "../components/Footer.svelte";
    import Navbar from "../components/navbar/Navbar.svelte";
    let { children } = $props();
</script>

<div class="text-black bg-sand">
    <Navbar />
    {@render children()}
    <Footer />
</div>
