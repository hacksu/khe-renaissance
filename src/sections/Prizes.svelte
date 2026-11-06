<script lang="ts">
    import shield from '../assets/castle/shield.svg';
    import banner from '../assets/castle/banner.svg';

    interface Prize { id: string; category: string; itemName: string; detail: string; imageUrl: string; order: number; place?: string | null; accentColor?: string | null; crown?: string | null; trackName?: string | null; awardName?: string | null; }

    let { overall, tracks, special }: { overall: Prize[]; tracks: Prize[]; special: Prize[] } = $props();

    const isSvg = (url: string) => /\.svg(?:[?#]|$)/i.test(url);
    const imageSource = (url: string) => isSvg(url) ? `/api/svg?url=${encodeURIComponent(url)}` : url;
    const podiumRank = (prize: Prize) => {
        if (prize.place === '2nd') return 0;
        if (prize.place === '1st') return 1;
        if (prize.place === '3rd') return 2;
        return 3;
    };
    const podium = $derived([...overall].sort((a, b) => podiumRank(a) - podiumRank(b) || a.order - b.order));
</script>

{#if overall.length > 0 || special.length > 0}
    <section id="prizes" class="tournament" aria-labelledby="prizes-title">
        <header class="tournament-heading">
            <h2 id="prizes-title">Prizes</h2>
            <p>Prove your worth in the kingdom. The greatest hackers walk away with legendary loot.</p>
        </header>

        {#if overall.length > 0}
            <h3 class="overall-label">Overall Champions</h3>
            <div class="podium" class:partial={podium.length < 3}>
                {#each podium as prize (prize.id)}
                    <article class="podium-prize" class:winner={prize.place === '1st'}>
                        <img class="prize-image" src={prize.imageUrl ? imageSource(prize.imageUrl) : shield} alt={prize.imageUrl ? prize.itemName : ''} loading="lazy" />
                        {#if prize.place}<p class="place">{prize.place} Place</p>{/if}
                        <h4>{prize.itemName}</h4>
                        {#if prize.detail}<p class="prize-detail">{prize.detail}</p>{/if}
                    </article>
                {/each}
            </div>
        {/if}

        {#if special.length > 0}
            <section class="guild" aria-labelledby="guild-title">
                <h3 id="guild-title">Guild Rewards</h3>
                <div class="guild-list">
                    {#each special as prize (prize.id)}
                        <article class="guild-reward">
                            <img src={prize.imageUrl ? imageSource(prize.imageUrl) : shield} alt={prize.imageUrl ? prize.itemName : ''} loading="lazy" />
                            <div>
                                {#if prize.awardName}<h4>{prize.awardName}</h4>{/if}
                                {#if prize.place}<p class="place">{prize.place} Place</p>{/if}
                                <p class="reward-name">{prize.itemName}</p>
                                {#if prize.detail}<p class="prize-detail">{prize.detail}</p>{/if}
                            </div>
                        </article>
                    {/each}
                </div>
            </section>
        {/if}
    </section>
{/if}

{#if tracks.length > 0}
    <section id="tracks" class="tracks" aria-labelledby="tracks-title">
        <header class="track-heading">
            <h2 id="tracks-title">Tracks</h2>
            <img class="track-standard" src={banner} alt="" loading="lazy" />
        </header>
        <div class="track-list">
            {#each tracks as prize, index (prize.id)}
                <article class="track-row">
                    <span class="track-number">{String(index + 1).padStart(2, '0')}</span>
                    <div class="track-copy">
                        {#if prize.trackName}<h3>{prize.trackName}</h3>{/if}
                        {#if prize.detail}<p class="prize-detail">{prize.detail}</p>{/if}
                    </div>
                    <div class="track-award">
                        <img src={prize.imageUrl ? imageSource(prize.imageUrl) : shield} alt={prize.imageUrl ? prize.itemName : ''} loading="lazy" />
                        <p>{prize.itemName}</p>
                        {#if prize.place}<p class="place">{prize.place} Place</p>{/if}
                    </div>
                </article>
            {/each}
        </div>
    </section>
{/if}

<style>
    .tournament, .tracks {
        color: var(--paper, #f0eee5);
        font-size: 16px;
        line-height: 1.65;
        scroll-margin-top: 32px;
    }

    .tournament { padding: 64px 0 58px; }
    h2, h3, h4, p { margin: 0; }
    h2 { font-size: 39px; font-weight: 400; line-height: 1.15; letter-spacing: -.035em; }
    .tournament-heading { text-align: center; }
    .tournament-heading > p { max-width: 540px; margin: 20px auto 0; color: var(--muted, #b0b9c7); }
    .overall-label { margin: 38px 0 28px; text-align: center; font-size: 18px; font-weight: 400; }
    .podium { display: grid; grid-template-columns: 1fr 1.15fr 1fr; align-items: end; gap: 30px; max-width: 930px; margin: auto; text-align: center; }
    .podium.partial { display: flex; flex-wrap: wrap; justify-content: center; }
    .podium.partial .podium-prize { flex: 0 1 290px; }
    .podium-prize { min-width: 0; padding: 0 15px 25px; overflow-wrap: anywhere; }
    .prize-image { display: block; width: 100%; max-width: 150px; height: 110px; margin: 0 auto 20px; object-fit: contain; }
    .winner { padding-bottom: 53px; }
    .winner .prize-image { max-width: 190px; height: 150px; margin-bottom: 22px; }
    .place { color: #d6bd87; font-size: 16px; }
    .podium-prize h4 { margin: 10px 0 9px; font-size: 21px; font-weight: 400; line-height: 1.4; }
    .prize-detail { color: var(--muted, #b0b9c7); font-size: 16px; }
    .guild { margin-top: 46px; }
    .guild > h3 { font-size: 24px; font-weight: 400; margin-bottom: 26px; }
    .guild-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 48px; }
    .guild-reward { display: flex; align-items: flex-start; gap: 20px; min-width: 0; overflow-wrap: anywhere; }
    .guild-reward > img { width: 64px; height: 76px; object-fit: contain; flex-shrink: 0; }
    .guild-reward h4 { font-size: 18px; font-weight: 400; margin-bottom: 6px; }
    .reward-name { margin-bottom: 4px; }
    .tracks { display: grid; grid-template-columns: .8fr 1.5fr; gap: 90px; padding: 62px 0 75px; }
    .track-heading { position: relative; padding-right: 95px; min-height: 100px; }
    .track-standard { position: absolute; right: 0; top: 0; width: 75px; height: auto; }
    .track-row { display: grid; grid-template-columns: 25px minmax(0, 1fr) minmax(100px, 150px); gap: 18px; padding: 23px 0; align-items: start; }
    .track-row:first-child { padding-top: 0; }
    .track-number { color: #97a7bd; font-size: 16px; }
    .track-copy, .track-award { overflow-wrap: anywhere; }
    .track-copy h3 { font-size: 18px; font-weight: 400; line-height: 1.4; margin-bottom: 8px; }
    .track-award { text-align: right; color: #dac28f; }
    .track-award img { display: block; width: 64px; height: 64px; object-fit: contain; margin: 0 0 10px auto; }

    @media (max-width: 1000px) {
        .tracks { grid-template-columns: .7fr 1.5fr; gap: 40px; }
        .track-row { grid-template-columns: 22px minmax(0, 1fr) minmax(90px, 120px); gap: 12px; }
    }

    @media (max-width: 760px) {
        .tournament { padding: 43px 0 35px; }
        h2 { font-size: 31px; }
        .podium { gap: 8px; }
        .podium-prize { padding: 0 0 12px; }
        .prize-image { max-width: 76px; height: 76px; }
        .winner { padding-bottom: 32px; }
        .winner .prize-image { max-width: 100px; height: 100px; }
        .podium-prize h4 { font-size: 14px; }
        .podium-prize .place { font-size: 11px; }
        .podium-prize .prize-detail { font-size: 12px; }
        .tracks { grid-template-columns: 1fr; gap: 28px; padding: 43px 0; }
        .track-heading { min-height: 76px; }
        .track-standard { width: 52px; }
        .guild-list { grid-template-columns: 1fr; }
    }

    @media (max-width: 480px) {
        .track-row { grid-template-columns: 22px minmax(0, 1fr); }
        .track-award { grid-column: 2; text-align: left; }
        .track-award img { float: left; width: 44px; height: 44px; margin: 0 12px 4px 0; }
    }
</style>
