<script lang="ts">
    import "../app.css";
    import Footer from "../components/Footer.svelte";
    import Navbar from "../components/navbar/Navbar.svelte";
    import { page } from "$app/stores";
    let { children } = $props();
</script>

<div class="text-black bg-sand">
    <Navbar />
    <div class={$page.url.pathname === '/' ? 'pt-0' : 'pt-24'}>
        {@render children()}
    </div>
    <Footer />
</div>
