<script lang="ts">
    interface Prize { id: string; category: string; itemName: string; detail: string; imageUrl: string; order: number; place?: string | null; accentColor?: string | null; crown?: string | null; trackName?: string | null; awardName?: string | null; }

    let { overall, tracks, special }: { overall: Prize[]; tracks: Prize[]; special: Prize[] } = $props();

    const isSvg = (url: string) => url.toLowerCase().endsWith('.svg');
    const svgUrl = (url: string) => `/api/svg?url=${encodeURIComponent(url)}`;

    // Podium order: 2nd, 1st, 3rd
    const podium = $derived([
        overall.find(p => p.place === '2nd'),
        overall.find(p => p.place === '1st'),
        overall.find(p => p.place === '3rd'),
    ].filter(Boolean) as Prize[]);
</script>

<div id="prizes" class="flex flex-col gap-20">

    <div class="flex flex-col items-center gap-3 text-center">
        <p class="eyebrow">Royal Tournament</p>
        <h2 class="text-5xl font-black text-castle-gold title-rule">Prizes</h2>
        <p class="text-castle-stoneHighlight max-w-xl text-sm leading-relaxed">
            Prove your worth in the kingdom. The greatest hackers walk away with legendary loot.
        </p>
    </div>

    {#if overall.length > 0}
    <div class="flex flex-col gap-4">
        <h3 class="section-label">Overall Champions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {#each podium as prize, i}
                <div class="trophy-card {i === 1 ? 'md:-translate-y-4 md:scale-[1.03]' : ''} transition-transform duration-300"
                     style="--accent: {prize.accentColor ?? 'rgba(201,168,76,0.3)'};">
                    <div class="trophy-image-wrap">
                        {#if prize.imageUrl}
                            {#if isSvg(prize.imageUrl)}
                                <img src={svgUrl(prize.imageUrl)} alt={prize.itemName} class="w-full h-40 object-contain p-4" />
                            {:else}
                                <img src={prize.imageUrl} alt={prize.itemName} class="w-full h-40 object-contain p-4" />
                            {/if}
                        {/if}
                    </div>
                    <div class="flex flex-col items-center text-center gap-2 p-5">
                        {#if prize.crown}<span class="text-3xl">{prize.crown}</span>{/if}
                        <p class="text-base font-black uppercase tracking-widest" style="color: var(--accent);">{prize.place} Place</p>
                        <p class="text-white font-semibold">{prize.itemName}</p>
                        {#if prize.detail}<p class="text-castle-stoneLight text-xs">{prize.detail}</p>{/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
    {/if}

    {#if tracks.length > 0}
    <div class="flex flex-col gap-4">
        <h3 class="section-label">Track Bounties</h3>
        <div class="bounty-board">
            {#each tracks as prize}
                <div class="bounty-row">
                    {#if prize.imageUrl}
                        <img src={isSvg(prize.imageUrl) ? svgUrl(prize.imageUrl) : prize.imageUrl} alt={prize.itemName} class="w-14 h-14 object-contain flex-shrink-0 rounded" />
                    {/if}
                    <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                        <p class="text-castle-torchOrange font-bold text-sm uppercase tracking-wide">{prize.trackName}</p>
                        <p class="text-white font-semibold text-sm truncate">{prize.itemName}</p>
                        {#if prize.detail}<p class="text-castle-stoneLight text-xs">{prize.detail}</p>{/if}
                    </div>
                    <div class="text-castle-gold text-lg flex-shrink-0"></div>
                </div>
            {/each}
        </div>
    </div>
    {/if}

    {#if special.length > 0}
    <div class="flex flex-col gap-4">
        <h3 class="section-label">Guild Rewards</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each special as prize}
                <div class="guild-card">
                    {#if prize.imageUrl}
                        <img src={isSvg(prize.imageUrl) ? svgUrl(prize.imageUrl) : prize.imageUrl} alt={prize.itemName} class="w-20 h-20 object-contain flex-shrink-0 rounded" />
                    {/if}
                    <div class="flex flex-col gap-1 flex-1">
                        <p class="text-castle-torchAmber font-bold text-sm">{prize.awardName}</p>
                        <p class="text-white text-sm font-semibold">{prize.itemName}</p>
                        {#if prize.detail}<p class="text-castle-stoneLight text-xs">{prize.detail}</p>{/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
    {/if}
</div>

<style>
    .eyebrow {
        font-size: 0.65rem; text-transform: uppercase;
        letter-spacing: 0.5em; font-weight: 600; color: #ffb347;
    }

    .title-rule {
        text-shadow: 0 0 30px rgba(201,168,76,0.4);
    }

    .section-label {
        font-size: 0.7rem; text-transform: uppercase;
        letter-spacing: 0.4em; font-weight: 700;
        color: rgba(201,168,76,0.6);
        border-bottom: 1px solid rgba(201,168,76,0.15);
        padding-bottom: 0.5rem;
    }

    .trophy-card {
        background: linear-gradient(160deg, #3a3a4e 0%, #2a2a38 100%);
        border: 1px solid var(--accent, rgba(201,168,76,0.3));
        border-radius: 0.75rem;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2);
        transition: box-shadow 0.3s;
    }
    .trophy-card:hover {
        box-shadow: 0 0 20px rgba(0,0,0,0.4), 0 0 40px color-mix(in srgb, var(--accent) 30%, transparent);
    }

    .trophy-image-wrap {
        background: linear-gradient(180deg, #1e1e28 0%, #2e2e3a 100%);
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .bounty-board {
        background: linear-gradient(160deg, #2a2a38, #1e1e2c);
        border: 1px solid rgba(201,168,76,0.2);
        border-radius: 0.75rem;
        overflow: hidden;
    }
    .bounty-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid rgba(46,46,58,0.8);
        transition: background 0.2s;
    }
    .bounty-row:last-child { border-bottom: none; }
    .bounty-row:hover { background: rgba(255,107,26,0.05); }

    .guild-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.25rem;
        background: linear-gradient(135deg, #3a3a4e, #2a2a38);
        border: 1px solid rgba(255,179,71,0.2);
        border-radius: 0.75rem;
        transition: border-color 0.2s;
    }
    .guild-card:hover {
        border-color: rgba(255,179,71,0.4);
    }
</style>
