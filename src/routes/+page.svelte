<script lang="ts">
    import FAQ      from "../sections/FAQ.svelte";
    import Header   from "../sections/Header.svelte";
    import Landing  from "../sections/Landing.svelte";
    import Map      from "../sections/Map.svelte";
    import Sponsors from "../sections/Sponsors.svelte";
    import Prizes   from "../sections/Prizes.svelte";
    import Tools    from "../sections/Tools.svelte";
    import type { ActionData, PageData } from "./$types";

    let { form, data }: { form: ActionData; data: PageData } = $props();
</script>

<Landing {form} />

<div class="relative stone-bg">

    <div class="pointer-events-none fixed inset-0 z-0"
         style="background: radial-gradient(ellipse at center, transparent 55%, rgba(10,22,40,0.55) 100%);"></div>

    <section class="relative z-10 px-6 md:px-16 lg:px-40 xl:px-56 pt-24 pb-16">
        <Header />
    </section>

    {#if data.prizes.overall.length > 0 || data.prizes.tracks.length > 0 || data.prizes.special.length > 0}
    <section class="relative z-10 px-6 md:px-16 lg:px-40 xl:px-56 py-20">
        <Prizes overall={data.prizes.overall} tracks={data.prizes.tracks} special={data.prizes.special} />
    </section>
    {/if}

    {#if data.sponsors.baron.length > 0 || data.sponsors.knight.length > 0 || data.sponsors.squire.length > 0}
    <section class="relative z-10 px-6 md:px-16 lg:px-40 xl:px-56 py-20">
        <Sponsors barons={data.sponsors.baron} knights={data.sponsors.knight} squires={data.sponsors.squire} />
    </section>
    {/if}

    <section class="relative z-10 px-6 md:px-16 lg:px-40 xl:px-56 py-20">
<!--        <Tools /> -->
    </section>

    <section class="relative z-10 px-6 md:px-16 lg:px-40 xl:px-56 py-20 pb-32">
        <Map />
    </section>

    <section class="relative z-10 px-6 md:px-16 lg:px-40 xl:px-56 py-20 pb-32">
        <FAQ />
    </section>
</div>

<style>
    .stone-bg {
        background-color: #0f1a2e;
        background-image:
            repeating-linear-gradient(
                0deg,
                transparent,
                transparent 59px,
                rgba(46, 46, 58, 0.25) 59px,
                rgba(46, 46, 58, 0.25) 60px
            ),
            repeating-linear-gradient(
                90deg,
                transparent,
                transparent 79px,
                rgba(46, 46, 58, 0.15) 79px,
                rgba(46, 46, 58, 0.15) 80px
            );
    }
</style>
