<script lang="ts">
    import "../app.css";
    import Footer from "../components/Footer.svelte";
    import Navbar from "../components/navbar/Navbar.svelte";
    import { page } from "$app/stores";
    let { children } = $props();

    let isJudgeRoute = $derived($page.url.pathname.startsWith('/judge'));
</script>

<div class="text-black bg-sand min-h-screen flex flex-col">
    {#if !isJudgeRoute}
        <Navbar />
    {/if}
    <div class="flex-1 {isJudgeRoute ? 'pt-0' : ($page.url.pathname === '/' ? 'pt-0' : 'pt-24')}">
        {@render children()}
    </div>
    {#if !isJudgeRoute}
        <Footer />
    {/if}
</div>
