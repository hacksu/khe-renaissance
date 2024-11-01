<script>
    import Navbar from "../components/navbar/Navbar.svelte";
    import FAQ from "../sections/FAQ.svelte";
    import Footer from "../components/Footer.svelte";
    import Header from "../sections/Header.svelte";
    import Landing from "../sections/Landing.svelte";
    import Sponsors from "../sections/Sponsors.svelte";
    import Map from "../sections/Map.svelte";
</script>

<div class="text-white">
    <Navbar />
    <div class="w-full h-full flex flex-col gap-24 px-56">
        <Landing />
        <Header />
        <FAQ />
        <Sponsors />
        <Map />
    </div>
    <Footer />
</div>
