<script lang="ts">
    import { authClient } from "$lib/client";
    import Logo from "../../assets/2027logo.png";
    import MlhBadge from "../../assets/mlh-trust-badge-2027-blue.svg";

    type Sections = { prizes: boolean; tracks: boolean; sponsors: boolean };
    let { home = false, sections = { prizes: true, tracks: true, sponsors: true } } = $props<{
        home?: boolean;
        sections?: Sections;
    }>();

    const session = authClient.useSession();
    let mobileMenuOpen = $state(false);
    const links = $derived([
        { href: "/schedule", label: "Schedule" },
        ...(sections.prizes ? [{ href: "/#prizes", label: "Prizes" }] : []),
        ...(sections.tracks ? [{ href: "/#tracks", label: "Tracks" }] : []),
        ...(sections.sponsors ? [{ href: "/#sponsors", label: "Sponsors" }] : []),
        { href: "/#faq", label: "FAQ" },
    ]);
</script>

<header class="site-header site-container" class:homepage={home}>
    <a class="brand" href="/" aria-label="Kent Hack Enough home">
        <span class="brand-logo"><img src={Logo} alt="" /></span>
        <span>Kent Hack Enough<small>KENT STATE UNIVERSITY / 2027</small></span>
    </a>

    <nav class="navigation" aria-label="Main navigation">
        <div class="desktop-links">
            {#each links as link (link.href)}
                <a href={link.href}>{link.label}</a>
            {/each}
        </div>
        <details class="mobile-links" bind:open={mobileMenuOpen}>
            <summary>Menu</summary>
            <div class="mobile-menu">
                <a href="/" onclick={() => mobileMenuOpen = false}>Home</a>
                {#each links as link (link.href)}
                    <a href={link.href} onclick={() => mobileMenuOpen = false}>{link.label}</a>
                {/each}
                <a href="https://khe-2027.devpost.com/" target="_blank" rel="noopener noreferrer"
                   onclick={() => mobileMenuOpen = false}>Submit on Devpost</a>
            </div>
        </details>
        <a class="login" href={$session.data ? "/profile" : "/auth/login"}>
            {$session.data ? "Profile" : "Login"}
        </a>
    </nav>

    <a class="mlh-badge" href="https://mlh.io/seasons/2027/events" target="_blank" rel="noopener noreferrer">
        <img src={MlhBadge} alt="Major League Hacking 2027 Official Season" />
    </a>
</header>

<style>
    .site-header {
        position: relative;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 30px;
        min-height: 100px;
        padding-right: 92px;
    }
    .brand {
        display: flex;
        align-items: center;
        gap: 13px;
        flex-shrink: 0;
        color: var(--paper);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.25;
        text-decoration: none;
    }
    .brand-logo { position: relative; width: 53px; height: 39px; overflow: hidden; }
    .brand-logo img { position: absolute; width: 61px; max-width: none; left: -4px; top: -9px; }
    .brand small { display: block; margin-top: 4px; color: #adb6c5; font-size: 9px; letter-spacing: .06em; font-weight: 400; }
    .navigation, .desktop-links { display: flex; align-items: center; gap: 30px; }
    .navigation { font-size: 14px; }
    .navigation a { color: #c4ccd6; text-decoration: none; }
    .navigation a:hover { color: #fff; }
    .navigation .login { padding: 10px 17px; border: 1px solid #ffffff35; border-radius: 3px; color: var(--paper); }
    .mlh-badge { position: absolute; top: 0; right: 0; width: 64px; }
    .mlh-badge img { display: block; width: 100%; height: auto; }
    .mobile-links { display: none; }
    @media (max-width: 1100px) {
        .navigation, .desktop-links { gap: 18px; }
        .brand { font-size: 13px; }
    }
    @media (max-width: 900px) {
        .desktop-links { display: none; }
        .mobile-links { display: block; }
        .mobile-links summary { list-style: none; cursor: pointer; padding: 10px 0; font: inherit; letter-spacing: 0; }
        .mobile-links summary::-webkit-details-marker { display: none; }
        .mobile-menu {
            position: absolute;
            z-index: 30;
            top: 82px;
            right: 88px;
            width: 200px;
            display: grid;
            gap: 2px;
            padding: 10px;
            border: 1px solid #435069;
            border-radius: 3px;
            background: #111d30;
        }
        .mobile-menu a { padding: 10px 12px; }
        .mobile-menu a:hover { background: #202d42; }
    }
    @media (max-width: 760px) {
        .site-header { min-height: 77px; padding-right: 0; gap: 14px; }
        .brand { font-size: 11px; gap: 8px; }
        .brand-logo { width: 40px; height: 31px; }
        .brand-logo img { width: 47px; left: -3px; top: -7px; }
        .brand small { font-size: 8px; letter-spacing: .02em; }
        .navigation { gap: 14px; font-size: 12px; }
        .navigation .login { padding: 8px 12px; }
        .mlh-badge { top: 77px; width: 42px; }
        .mobile-menu { top: 66px; right: 0; }
        .site-header:not(.homepage) { margin-bottom: 76px; }
    }
    @media (max-width: 360px) {
        .brand { font-size: 10px; }
        .brand small { font-size: 7px; }
        .navigation { gap: 10px; }
        .navigation .login { padding: 8px 10px; }
    }
</style>
