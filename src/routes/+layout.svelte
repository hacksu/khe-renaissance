<script lang="ts">
    import "../app.css";
    import Footer from "../components/Footer.svelte";
    import Navbar from "../components/navbar/Navbar.svelte";
    import { page } from "$app/stores";
    let { children } = $props();

    let isJudgeRoute = $derived($page.url.pathname.startsWith('/judge'));
    let isHomeRoute = $derived($page.url.pathname === '/');
</script>

<svelte:head>
    <title>{isHomeRoute ? "Kent Hack Enough 2027 - Hack the Kingdom" : "Kent Hack Enough"}</title>
</svelte:head>

<div class="site-shell" id={isHomeRoute ? undefined : "top"}>
    {#if !isJudgeRoute && !isHomeRoute}
        <Navbar />
    {/if}
    <div class="route-content">
        {@render children()}
    </div>
    {#if !isJudgeRoute && !isHomeRoute}
        <Footer />
    {/if}
</div>
