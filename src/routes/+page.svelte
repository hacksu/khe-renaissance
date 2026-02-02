<script>
    import FAQ from "../sections/FAQ.svelte";
    import Header from "../sections/Header.svelte";
    import Landing from "../sections/Landing.svelte";
    import Map from "../sections/Map.svelte";
    import Sponsors from "../sections/Sponsors.svelte";
    import Prizes from "../sections/Prizes.svelte";
    import Tools from "../sections/Tools.svelte";
</script>

<div>
    <Landing />
    <div class="w-full h-full flex flex-col gap-24 px-10 lg:px-56">
        <Header />
        <Prizes />
        <FAQ />
        <Tools />
        <Sponsors />
        <Map />
    </div>
</div>
