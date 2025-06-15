<script>
    import FAQ from "../sections/FAQ.svelte";
    import Header from "../sections/Header.svelte";
    import Landing from "../sections/Landing.svelte";
    import Map from "../sections/Map.svelte";
    import Sponsors from "../sections/Sponsors.svelte";
</script>

<div>
    <Landing />
    <div class="w-full h-full flex flex-col gap-24 px-10 lg:px-56">
        <Header />
        <FAQ />
        <Sponsors />
        <Map />
    </div>
</div>
