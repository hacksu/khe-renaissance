<script lang="ts">
    interface Sponsor { id: string; name: string; url: string; imageUrl: string; tier: string; order: number; }

    let { barons, knights, squires }: { barons: Sponsor[]; knights: Sponsor[]; squires: Sponsor[] } = $props();

    const isSvg = (url: string) => /\.svg(?:[?#]|$)/i.test(url);
    const imageSource = (url: string) => isSvg(url) ? `/api/svg?url=${encodeURIComponent(url)}` : url;
    const tiers = $derived([
        { name: 'Barons of the Realm', className: 'barons', sponsors: barons },
        { name: 'Knights of the Order', className: 'knights', sponsors: knights },
        { name: 'Squires of the Keep', className: 'squires', sponsors: squires },
    ]);
</script>

<section id="sponsors" class="sponsor-section" aria-labelledby="sponsors-title">
    <header class="sponsor-heading">
        <h2 id="sponsors-title">Sponsors</h2>
        <p>Without the generous support of these allies, the kingdom could not stand.</p>
    </header>

    <div class="sponsor-board">
        {#each tiers as tier (tier.className)}
            {#if tier.sponsors.length > 0}
                <div class="sponsor-tier {tier.className}">
                    <h3>{tier.name}</h3>
                    <div class="sponsor-logos">
                        {#each tier.sponsors as sponsor (sponsor.id)}
                            <a href={sponsor.url} target="_blank" rel="noopener noreferrer">
                                {#if sponsor.imageUrl}
                                    <img src={imageSource(sponsor.imageUrl)} alt={sponsor.name} loading="lazy" />
                                {:else}
                                    <span>{sponsor.name}</span>
                                {/if}
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        {/each}
    </div>

    <p class="sponsor-contact">
        Interested in sponsoring? <a href="mailto:staff@khe.io">Contact us!</a>
    </p>
</section>

<style>
    .sponsor-section {
        padding: 68px 0 75px;
        color: var(--paper, #f0eee5);
        font-size: 16px;
        line-height: 1.65;
        scroll-margin-top: 32px;
    }

    h2, h3, p { margin: 0; }
    .sponsor-heading { max-width: 600px; margin: 0 auto 35px; text-align: center; }
    .sponsor-heading h2 { font-size: 39px; line-height: 1.15; letter-spacing: -.035em; font-weight: 400; margin-bottom: 18px; }
    .sponsor-heading > p { color: var(--muted, #b0b9c7); }
    .sponsor-tier { display: grid; grid-template-columns: 220px minmax(0, 1fr); align-items: center; gap: 35px; padding: 25px 0; }
    .sponsor-tier h3 { font-size: 18px; font-weight: 400; line-height: 1.4; letter-spacing: -.015em; color: var(--muted, #b0b9c7); }
    .sponsor-logos { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-around; gap: 30px; min-width: 0; }
    .sponsor-logos a { display: flex; align-items: center; justify-content: center; padding: 8px 12px; max-width: 100%; min-width: 0; color: var(--paper, #f0eee5); text-decoration: none; overflow-wrap: anywhere; }
    .sponsor-logos img { display: block; width: 185px; max-width: 100%; height: 75px; object-fit: contain; filter: brightness(0) invert(.88); opacity: .85; transition: opacity .15s; }
    .knights .sponsor-logos img { width: 155px; height: 65px; }
    .squires .sponsor-logos img { width: 130px; height: 55px; }
    .sponsor-logos a:hover img, .sponsor-logos a:focus-visible img { opacity: 1; }
    a:focus-visible { outline: 2px solid var(--paper, #f0eee5); outline-offset: 5px; }
    .sponsor-contact { color: var(--muted, #b0b9c7); text-align: center; margin-top: 28px; }
    .sponsor-contact a { text-decoration: underline; text-underline-offset: 4px; color: var(--paper, #f0eee5); }

    @media (max-width: 1100px) {
        .sponsor-tier { grid-template-columns: 180px minmax(0, 1fr); gap: 20px; }
        .sponsor-logos { gap: 20px; }
    }

    @media (max-width: 760px) {
        .sponsor-section { padding: 42px 0; }
        .sponsor-heading h2 { font-size: 31px; }
        .sponsor-tier { grid-template-columns: 1fr; gap: 15px; padding: 27px 0; }
        .sponsor-tier h3 { font-size: 18px; text-align: center; }
        .sponsor-logos { gap: 12px; }
        .sponsor-logos a { padding: 5px; flex: 0 1 140px; }
        .sponsor-logos img { width: 130px; height: 60px; }
        .knights .sponsor-logos img { width: 118px; height: 55px; }
        .squires .sponsor-logos img { width: 105px; height: 50px; }
    }
</style>
