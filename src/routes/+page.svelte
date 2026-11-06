<script lang="ts">
    import { onMount } from "svelte";
    import FAQ from "../sections/FAQ.svelte";
    import Header from "../sections/Header.svelte";
    import Landing from "../sections/Landing.svelte";
    import Map from "../sections/Map.svelte";
    import Sponsors from "../sections/Sponsors.svelte";
    import Prizes from "../sections/Prizes.svelte";
    import Footer from "../components/Footer.svelte";
    import masonryCap from "../assets/castle/masonry-cap.svg";
    import torch from "../assets/castle/torch.svg";
    import type { ActionData, PageData } from "./$types";

    let { form, data }: { form: ActionData; data: PageData } = $props();
    let homeSite = $state<HTMLDivElement>();
    const sections = $derived({
        prizes: data.prizes.overall.length > 0 || data.prizes.special.length > 0,
        tracks: data.prizes.tracks.length > 0,
        sponsors: data.sponsors.baron.length > 0 || data.sponsors.knight.length > 0 || data.sponsors.squire.length > 0,
    });

    onMount(() => {
        const site = homeSite;
        const hero = site?.querySelector<HTMLElement>(".home-hero");
        if (!site || !hero) return;
        let frame = 0;
        let active = true;
        const titleRange = document.createRange();

        const updateLayout = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const title = hero.querySelector<HTMLHeadingElement>("h1");
                if (title) {
                    title.style.removeProperty("font-size");
                    let widest = 0;
                    for (const line of title.querySelectorAll("span")) {
                        titleRange.selectNodeContents(line);
                        widest = Math.max(widest, titleRange.getBoundingClientRect().width);
                    }
                    if (widest > title.clientWidth && title.clientWidth > 0) {
                        title.style.fontSize = `${parseFloat(getComputedStyle(title).fontSize) * title.clientWidth / widest * .98}px`;
                    }
                }

                const width = site.clientWidth;
                const mobile = width <= 760;
                const wallWidth = Math.max(width, mobile ? 1000 : 1100);
                const offset = (width - wallWidth) / 2;
                const scale = wallWidth / 1920;
                let leftTorch = width * .18;
                let rightTorch = width * .82;
                let leftDistance = Infinity;
                let rightDistance = Infinity;
                for (let i = 0; i < 8; i++) {
                    const center = (i * 240 + 120) * scale + offset;
                    if (center < 25 || center > width - 25) continue;
                    const left = Math.abs(center - width * .18);
                    const right = Math.abs(center - width * .82);
                    if (left < leftDistance) { leftDistance = left; leftTorch = center; }
                    if (right < rightDistance) { rightDistance = right; rightTorch = center; }
                }
                site.style.setProperty("--wall-top", `${hero.offsetHeight - (mobile ? 240 : 190)}px`);
                site.style.setProperty("--wall-width", `${wallWidth}px`);
                site.style.setProperty("--wall-cap-height", `${136 * scale}px`);
                site.style.setProperty("--stone-width", `${960 * scale}px`);
                site.style.setProperty("--wall-offset", `${offset}px`);
                site.style.setProperty("--left-torch", `${leftTorch}px`);
                site.style.setProperty("--right-torch", `${rightTorch}px`);
                site.style.setProperty("--torch-width", `${Math.max(30, wallWidth * .035)}px`);
            });
        };

        const observer = new ResizeObserver(updateLayout);
        observer.observe(hero);
        observer.observe(site);
        window.addEventListener("resize", updateLayout);
        window.addEventListener("hashchange", updateLayout);
        void document.fonts.ready.then(() => { if (active) updateLayout(); });
        updateLayout();
        return () => {
            active = false;
            observer.disconnect();
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", updateLayout);
            window.removeEventListener("hashchange", updateLayout);
        };
    });
</script>

<svelte:head>
    <meta name="description" content="Kent Hack Enough returns March 6-7, 2027 at Kent State University. A free hackathon for all experience levels, with meals included." />
    <link rel="preload" href="/fonts/russo-one-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
    <link rel="preload" href="/fonts/changa-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div class="home-site" id="top" bind:this={homeSite}>
    <div class="masonry-surface" aria-hidden="true">
        <img class="masonry-cap" src={masonryCap} alt="" />
        <div class="masonry-fill"></div>
        <img class="wall-torch wall-torch-left" src={torch} alt="" />
        <img class="wall-torch wall-torch-right" src={torch} alt="" />
    </div>

    <Landing {form} {sections} />

    <main class="home-content site-container">
        <Header />
        {#if sections.prizes || sections.tracks}
            <Prizes overall={data.prizes.overall} tracks={data.prizes.tracks} special={data.prizes.special} />
        {/if}
        {#if sections.sponsors}
            <Sponsors barons={data.sponsors.baron} knights={data.sponsors.knight} squires={data.sponsors.squire} />
        {/if}
        <div class="information-grid">
            <FAQ />
            <Map />
        </div>
    </main>
    <div class="home-footer"><Footer /></div>
</div>

<style>
    .home-site {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        background: #0c1729;
        color: var(--paper);
        --wall-top: 750px;
        --wall-width: 1440px;
        --wall-cap-height: 102px;
        --stone-width: 720px;
        --wall-offset: 0px;
        --left-torch: 270px;
        --right-torch: 1170px;
        --torch-width: 50px;
    }
    .masonry-surface { position: absolute; top: var(--wall-top); left: 0; right: 0; bottom: 0; z-index: 1; pointer-events: none; }
    .masonry-cap { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: var(--wall-width); height: var(--wall-cap-height); max-width: none; }
    .masonry-fill { position: absolute; top: var(--wall-cap-height); left: 0; right: 0; bottom: 0; background-color: #2c3545; background-image: linear-gradient(rgba(12, 19, 31, .76), rgba(12, 19, 31, .76)), url('../assets/castle/masonry-tile.svg'); background-repeat: repeat; background-size: auto, var(--stone-width) auto; background-position: 0 0, var(--wall-offset) 0; }
    .wall-torch { position: absolute; top: -16px; width: var(--torch-width); height: auto; max-width: none; transform: translateX(-50%); z-index: 2; }
    .wall-torch-left { left: var(--left-torch); }
    .wall-torch-right { left: var(--right-torch); transform: translateX(-50%) scaleX(-1); }
    .home-content, .home-footer { position: relative; z-index: 3; }
    .information-grid { display: grid; grid-template-columns: 1.25fr 1fr; gap: 110px; padding: 88px 0; }
    @media (max-width: 1100px) { .information-grid { gap: 65px; } }
    @media (max-width: 760px) {
        .wall-torch { top: -10px; }
        .information-grid { grid-template-columns: 1fr; gap: 40px; padding: 43px 0; }
    }
</style>
