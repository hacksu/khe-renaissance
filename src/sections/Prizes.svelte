<script lang="ts">
    import itDevopsKit      from "../assets/prizes/it-devops-kit.png";
    import hyperxCloudAlpha from "../assets/prizes/hyperx-cloud-alpha.png";
    import redragonK732     from "../assets/prizes/redragon-k732.png";
    import hyperxSolocast   from "../assets/prizes/hyperx-solocast.png";
    import aioloDrive       from "../assets/prizes/aiolo-drive.png";
    import miyooMiniPlus    from "../assets/prizes/miyoo-mini-plus.png";
    import libreComputer    from "../assets/prizes/libre-computer.png";
    import legoDino         from "../assets/prizes/lego-dino.png";
    import yxkMonitor       from "../assets/prizes/yxk-monitor.png";
    import dinoNuggetPlush  from "../assets/prizes/dino-nugget-plush.png";
    import copperDino       from "../assets/prizes/copper-dino.png";
    import raspBerry        from "../assets/prizes/atr.png";

    const overall = [
        { place: "1st",  crown: "👑", item: "HyperX Cloud Alpha Wireless",   detail: "Wireless Gaming Headset",    img: hyperxCloudAlpha, accent: "#c9a84c" },
        { place: "2nd",  crown: "🥈", item: "Redragon K732 Keyboard",        detail: "Mechanical RGB Keyboard",    img: redragonK732,     accent: "#8e8ea8" },
        { place: "3rd",  crown: "🥉", item: "HyperX SoloCast 2 Microphone",  detail: "USB Condenser Microphone",   img: hyperxSolocast,   accent: "#6b4f2f" },
    ];

    const tracks = [
        { track: "Cybersecurity",         item: "IT/Dev Ops Field Kit",         detail: "USB Drives, Lock Pick Set & more", img: itDevopsKit    },
        { track: "Data Science",          item: "Aiolo Portable Drive",         detail: "1 TB External Hard Drive",        img: aioloDrive     },
        { track: "Game Programming",      item: "Miyoo Mini Plus",              detail: "Retro Handheld Console",          img: miyooMiniPlus  },
        { track: "Embedded Systems",      item: "Libre Computer Sweet Potato",  detail: "Modern Single Board Computer",    img: libreComputer  },
        { track: "Physical AI / Robotics",item: "RasTech Raspberry Pi 5 Kit",   detail: "Raspberry Pi 5 Dev Kit",          img: raspBerry      },
    ];

    const special = [
        { name: "Hackathon Theme",  item: "LEGO Creator 3-in-1 Dino Set", detail: "Top 5 teams",          img: legoDino        },
        { name: "Best Solo Hack",   item: "Yxk Portable Monitor",         detail: "",                     img: yxkMonitor      },
        { name: "Best Attempt",     item: "Dino Nugget Pillow Plush",      detail: "Organizer Selected",   img: dinoNuggetPlush },
        { name: "Coolest Hack",     item: "Solid Copper Dino Skeleton",    detail: "Organizer Selected",   img: copperDino      },
    ];
</script>

<div id="prizes" class="flex flex-col gap-20">

    <!-- Section heading -->
    <div class="flex flex-col items-center gap-3 text-center">
        <p class="eyebrow">Royal Tournament</p>
        <h2 class="text-5xl font-black text-castle-gold title-rule">Prizes</h2>
        <p class="text-castle-stoneHighlight max-w-xl text-sm leading-relaxed">
            Prove your worth in the kingdom. The greatest hackers walk away with legendary loot.
        </p>
    </div>

    <div class="flex flex-col gap-4">
        <h3 class="section-label">Overall Champions</h3>

        <!-- Podium layout: 2nd | 1st | 3rd -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {#each [overall[1], overall[0], overall[2]] as prize, i}
                <div class="trophy-card {i === 1 ? 'md:-translate-y-4 md:scale-[1.03]' : ''} transition-transform duration-300"
                     style="--accent: {prize.accent};">
                    <div class="trophy-image-wrap">
                        <img src={prize.img} alt={prize.item}
                             class="w-full h-40 object-contain p-4" />
                    </div>
                    <div class="flex flex-col items-center text-center gap-2 p-5">
                        <span class="text-3xl">{prize.crown}</span>
                        <p class="text-base font-black uppercase tracking-widest" style="color: var(--accent);">{prize.place} Place</p>
                        <p class="text-white font-semibold">{prize.item}</p>
                        <p class="text-castle-stoneLight text-xs">{prize.detail}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="flex flex-col gap-4">
        <h3 class="section-label">Track Bounties</h3>
        <div class="bounty-board">
            {#each tracks as prize}
                <div class="bounty-row">
                    <img src={prize.img} alt={prize.item}
                         class="w-14 h-14 object-contain flex-shrink-0 rounded" />
                    <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                        <p class="text-castle-torchOrange font-bold text-sm uppercase tracking-wide">{prize.track}</p>
                        <p class="text-white font-semibold text-sm truncate">{prize.item}</p>
                        {#if prize.detail}
                            <p class="text-castle-stoneLight text-xs">{prize.detail}</p>
                        {/if}
                    </div>
                    <div class="text-castle-gold text-lg flex-shrink-0">⚔</div>
                </div>
            {/each}
        </div>
    </div>

    <div class="flex flex-col gap-4">
        <h3 class="section-label">Guild Rewards</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each special as prize}
                <div class="guild-card">
                    <img src={prize.img} alt={prize.item}
                         class="w-20 h-20 object-contain flex-shrink-0 rounded" />
                    <div class="flex flex-col gap-1 flex-1">
                        <p class="text-castle-torchAmber font-bold text-sm">{prize.name}</p>
                        <p class="text-white text-sm font-semibold">{prize.item}</p>
                        {#if prize.detail}
                            <p class="text-castle-stoneLight text-xs">{prize.detail}</p>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
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
