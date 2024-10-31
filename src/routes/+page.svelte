<script>
    import Navbar from "../components/navbar/Navbar.svelte";
    import FAQ from "../sections/FAQ.svelte";
    import Footer from "../components/Footer.svelte";
    import Header from "../sections/Header.svelte";
    import Landing from "../sections/Landing.svelte";
</script>

<div class="bg-black text-white">
    <Navbar />
    <div class="w-full h-full flex flex-col gap-24 px-56">
        <Landing />
        <Header />
        <FAQ />
    </div>
    <Footer />
</div>
