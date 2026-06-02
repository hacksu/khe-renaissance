<script lang="ts">
    interface Sponsor { id: string; name: string; url: string; imageUrl: string; tier: string; order: number; }

    let { barons, knights, squires }: { barons: Sponsor[]; knights: Sponsor[]; squires: Sponsor[] } = $props();

    const isSvg = (url: string) => url.toLowerCase().endsWith('.svg');
    const svgUrl = (url: string) => `/api/svg?url=${encodeURIComponent(url)}`;
</script>

<div id="sponsors" class="flex flex-col gap-12">

    <div class="flex flex-col items-center gap-3 text-center">
        <p class="eyebrow">The Kingdom's Allies</p>
        <h2 class="text-5xl font-black text-castle-gold" style="text-shadow: 0 0 30px rgba(201,168,76,0.4);">
            Sponsors
        </h2>
        <p class="text-castle-stoneHighlight text-sm max-w-md">
            Without the generous support of these allies, the kingdom could not stand.
        </p>
    </div>

    {#if barons.length > 0}
    <div class="flex flex-col gap-3">
        <h3 class="tier-label">Barons of the Realm</h3>
        <div class="flex flex-wrap gap-4 justify-center">
            {#each barons as { imageUrl, name, url }}
                <a href={url} target="_blank" rel="noopener noreferrer"
                   class="sponsor-tile baron group">
                    {#if isSvg(imageUrl)}
                        <img src={svgUrl(imageUrl)} alt={name}
                             class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    {:else}
                        <img src={imageUrl} alt={name}
                             class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    {/if}
                </a>
            {/each}
        </div>
    </div>
    {/if}

    {#if knights.length > 0}
    <div class="flex flex-col gap-3">
        <h3 class="tier-label">Knights of the Order</h3>
        <div class="flex flex-wrap gap-3 justify-center">
            {#each knights as { imageUrl, name, url }}
                <a href={url} target="_blank" rel="noopener noreferrer"
                   class="sponsor-tile knight group">
                    {#if isSvg(imageUrl)}
                        <img src={svgUrl(imageUrl)} alt={name}
                             class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    {:else}
                        <img src={imageUrl} alt={name}
                             class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    {/if}
                </a>
            {/each}
        </div>
    </div>
    {/if}

    {#if squires.length > 0}
    <div class="flex flex-col gap-3">
        <h3 class="tier-label">Squires of the Keep</h3>
        <div class="flex flex-wrap gap-3 justify-center">
            {#each squires as { imageUrl, name, url }}
                <a href={url} target="_blank" rel="noopener noreferrer"
                   class="sponsor-tile squire group">
                    {#if isSvg(imageUrl)}
                        <img src={svgUrl(imageUrl)} alt={name}
                             class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    {:else}
                        <img src={imageUrl} alt={name}
                             class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    {/if}
                </a>
            {/each}
        </div>
    </div>
    {/if}

    <p class="text-center text-castle-stoneHighlight text-sm">
        Interested in sponsoring?
        <a href="mailto:staff@khe.io" class="sponsor-cta">Contact us!</a>
    </p>
</div>

<style>
    .eyebrow {
        font-size: 0.65rem; text-transform: uppercase;
        letter-spacing: 0.5em; font-weight: 600; color: #ffb347;
    }

    .tier-label {
        font-size: 0.65rem; text-transform: uppercase;
        letter-spacing: 0.4em; font-weight: 700;
        color: rgba(201,168,76,0.5);
        padding-bottom: 0.4rem;
        border-bottom: 1px solid rgba(201,168,76,0.12);
    }

    .sponsor-tile {
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(145deg, #545468, #3e3e52);
        border: 1px solid rgba(201,168,76,0.15);
        border-radius: 0.5rem;
        padding: 1rem;
        transition: border-color 0.25s, box-shadow 0.25s;
        overflow: hidden;
    }
    .sponsor-tile:hover {
        border-color: rgba(201,168,76,0.4);
        box-shadow: 0 0 20px rgba(201,168,76,0.12);
    }

    .sponsor-tile.baron  { width: 220px; height: 120px; }
    .sponsor-tile.knight { width: 180px; height: 100px; }
    .sponsor-tile.squire { width: 150px; height: 85px;  }

    .sponsor-cta {
        color: #c9a84c;
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.2s;
    }
    .sponsor-cta:hover { color: #ffb347; }
</style>
