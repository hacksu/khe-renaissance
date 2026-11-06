<script lang="ts">
    import { enhance } from "$app/forms";
    import { onMount } from "svelte";
    import { Utils } from "$lib/util";
    import QRCode from "qrcode";
    import Navbar from "../components/navbar/Navbar.svelte";
    import aurora from "../assets/castle/aurora.svg";
    import moon from "../assets/castle/moon.svg";
    import mountains from "../assets/castle/mountains.svg";
    import forest from "../assets/castle/enchanted-forest.svg";
    import fog from "../assets/castle/fog.svg";

    let { form, sections } = $props<{
        form?: { success?: boolean; alreadySignedUp?: boolean; error?: string } | null;
        sections: { prizes: boolean; tracks: boolean; sponsors: boolean };
    }>();
    let isQrMode = $state(false);
    let qrDataUrl = $state("");
    let loading = $state(false);
    const applicationsClosed = Utils.hasApplicationsClosed();

    onMount(() => {
        let active = true;
        let qrRequested = false;
        const updateHash = () => {
            isQrMode = window.location.hash === "#qr";
            if (isQrMode && !qrRequested) {
                qrRequested = true;
                void QRCode.toDataURL("https://khe.io", {
                    width: 364,
                    margin: 2,
                    color: { dark: "#142032", light: "#f0eee5" },
                }).then(value => { if (active) qrDataUrl = value; });
            }
        };
        updateHash();
        window.addEventListener("hashchange", updateHash);
        return () => {
            active = false;
            window.removeEventListener("hashchange", updateHash);
        };
    });
</script>

<section class="home-hero" id="qr" aria-label="Kent Hack Enough 2027">
    <img class="scene-layer aurora" src={aurora} alt="" />
    <img class="scene-layer moon" src={moon} alt="" />
    <img class="scene-layer mountains" src={mountains} alt="" />
    <img class="scene-layer forest" src={forest} alt="" />
    <div class="hero-shade" aria-hidden="true"></div>

    <Navbar home {sections} />

    <div class="hero-content">
        {#if isQrMode}
            <div class="qr-block">
                {#if qrDataUrl}<img src={qrDataUrl} alt="QR code linking to khe.io" />{/if}
                <p>khe.io</p>
            </div>
        {:else}
            <h1><span>Hack the</span> <span>Kingdom</span></h1>
            <p class="hero-description">Kent Hack Enough 2027</p>
            {#if applicationsClosed}
                {#if form?.success}
                    <div class="signup-result" role="status">
                        <p>{form.alreadySignedUp ? "Already on the list!" : "You're on the list!"}</p>
                        <p>{form.alreadySignedUp ? "We'll reach out when signups open." : "We'll notify you when registration launches."}</p>
                    </div>
                    <a class="secondary" href="/schedule">View Schedule</a>
                {:else}
                    <form class="signup-form" method="POST" action="?/subscribe"
                          use:enhance={() => {
                              loading = true;
                              return async ({ update }) => {
                                  try { await update(); }
                                  finally { loading = false; }
                              };
                          }}>
                        <label for="reminder-email">Get notified when signups open</label>
                        {#if form?.error}<p class="signup-error" role="alert">{form.error}</p>{/if}
                        <div class="signup-fields">
                            <input id="reminder-email" name="email" type="email" autocomplete="email"
                                   placeholder="your@email.com" required />
                            <button class="primary-button" type="submit" disabled={loading}>
                                {loading ? "Signing up..." : "Notify me"}
                            </button>
                        </div>
                    </form>
                    <a class="secondary" href="/schedule">View Schedule</a>
                {/if}
            {:else}
                <div class="hero-actions">
                    <a class="primary-button" href="/auth/login">Apply</a>
                    <a class="secondary" href="/schedule">View Schedule</a>
                </div>
                <p class="hero-footnote">March 6-7, 2027</p>
            {/if}
        {/if}
    </div>

    <img class="scene-layer fog" src={fog} alt="" />
    <dl class="hero-essentials" aria-label="Event essentials">
        <div><dt>When</dt><dd>March 6-7, 2027<span>Saturday &amp; Sunday</span></dd></div>
        <div><dt>Where</dt><dd>Crawford Hall<span>Kent State University, Ohio</span></dd></div>
        <div><dt>Cost</dt><dd>Completely free<span>Including meals</span></dd></div>
    </dl>
</section>

<style>
    .home-hero { position: relative; min-height: 940px; overflow: hidden; }
    .home-hero::before { content: ''; position: absolute; inset: 0; z-index: 0; background: #0c1826; }
    .scene-layer { position: absolute; z-index: 0; max-width: none; pointer-events: none; user-select: none; }
    .aurora { inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .25; }
    .moon { top: 125px; right: 14%; width: 135px; opacity: .75; }
    .mountains { bottom: -60px; left: 50%; width: max(100%, 1440px); transform: translateX(-50%); opacity: .2; }
    .forest { bottom: -130px; left: 50%; width: max(125%, 1800px); transform: translateX(-50%); }
    .fog { z-index: 2; bottom: 0; left: -7.5%; width: 115%; opacity: .16; }
    .hero-shade { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: linear-gradient(180deg, #09122040 0%, #09122014 48%, transparent 70%); }
    .hero-content { position: relative; z-index: 5; width: min(590px, calc(100% - 46px)); margin: 80px auto 0; text-align: center; }
    h1 { margin: 0 0 22px; font-size: 110px; line-height: 1.01; }
    h1 span { display: block; }
    .hero-description { margin: 0; color: #c2cad5; font-size: 18px; line-height: 1.6; }
    .hero-actions { display: flex; align-items: center; justify-content: center; gap: 25px; margin-top: 27px; }
    .primary-button { display: inline-flex; align-items: center; justify-content: center; min-height: 47px; padding: 0 22px; border: 1px solid #d5cfb5; border-radius: 0; background: #d5cfb5; color: #1b2330; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; }
    .primary-button:hover { background: #efdab0; }
    .primary-button:disabled { cursor: wait; opacity: .65; }
    .secondary { display: inline-block; padding: 12px 0; color: var(--paper); font-size: 14px; text-decoration: none; }
    .secondary:hover { text-decoration: underline; }
    .hero-footnote { margin: 18px 0 0; color: #9eacbf; font-size: 11px; }
    .signup-form { max-width: 380px; margin: 24px auto 0; }
    .signup-form label { display: block; margin-bottom: 9px; color: #b6c1d1; font-size: 13px; }
    .signup-fields { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
    .signup-fields input { width: 100%; min-width: 0; padding: 10px 12px; border: 1px solid #66748b; border-radius: 0; background: #142032; color: var(--paper); font-size: 14px; }
    .signup-fields input::placeholder { color: #a4afbf; }
    .signup-fields input:focus { border-color: #e6c78b; box-shadow: none; }
    .signup-error { margin: 0 0 12px; color: #ffc4ba; font-size: 14px; }
    .signup-result { margin: 25px auto 8px; color: var(--paper); }
    .signup-result p { margin: 5px 0; }
    .signup-result p + p { color: var(--muted); font-size: 14px; }
    .qr-block { display: grid; justify-items: center; gap: 18px; padding-top: 20px; }
    .qr-block img { width: 256px; height: 256px; }
    .qr-block p { font-size: 24px; }
    .hero-essentials { position: absolute; z-index: 6; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; justify-content: space-between; gap: 40px; width: min(1060px, calc(100% - 180px)); margin: 0; padding-top: 18px; }
    .hero-essentials > div { display: flex; align-items: baseline; gap: 16px; }
    dt { color: #b5bfcd; font-size: 9px; letter-spacing: .05em; }
    dd { margin: 0; color: #efeee8; font-size: 13px; line-height: 1.5; }
    dd span { display: block; color: #aeb9c9; font-size: 10px; }
    @media (min-width: 1700px) { .home-hero { min-height: 1050px; } .hero-content { margin-top: 100px; } }
    @media (max-width: 1100px) {
        .forest { width: 1700px; }
        .moon { right: 7%; }
        .hero-essentials { width: calc(100% - 110px); gap: 25px; }
        .hero-essentials > div { display: block; }
        dt { margin-bottom: 5px; }
    }
    @media (max-width: 760px) {
        .home-hero { min-height: 970px; }
        .hero-content { margin-top: 148px; }
        h1 { margin-bottom: 21px; font-size: 75px; line-height: 1; }
        .hero-description { font-size: 17px; }
        .hero-actions { gap: 21px; margin-top: 24px; }
        .primary-button { min-height: 45px; padding: 0 18px; font-size: 12px; }
        .secondary { font-size: 12px; }
        .hero-footnote { font-size: 10px; }
        .signup-form { max-width: 310px; }
        .signup-form label { font-size: 12px; }
        .signup-fields input { padding-inline: 9px; font-size: 13px; }
        .moon { top: 93px; right: calc(50% - 33px); width: 65px; opacity: .85; }
        .mountains { bottom: 50px; width: 1000px; }
        .forest { bottom: 40px; width: 1300px; opacity: .85; }
        .fog { bottom: 40px; left: 50%; width: 1300px; transform: translateX(-50%); opacity: .12; }
        .hero-essentials { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 20px; width: calc(100% - 48px); }
        .hero-essentials > div:last-child { grid-column: 1 / -1; }
        dt { margin-bottom: 5px; font-size: 8px; }
        dd { font-size: 12px; }
        dd span { font-size: 9px; }
        .qr-block img { width: 228px; height: 228px; }
    }
    @media (max-width: 360px) { h1 { font-size: 66px; } .primary-button { padding-inline: 15px; } }
</style>
