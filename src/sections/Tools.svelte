<script lang="ts">
    import OnePasswordLogo from "../assets/software/1password.svg";
    import BalsamiqLogo    from "../assets/software/Balsamiq_2025_logo.svg";
    import BambuLab        from "../assets/software/BambuLab.png";
    import HakkoLogo       from "../assets/software/hakko.webp";
    import KeySightLogo    from "../assets/software/keysight.webp";
    import MLHHardwareKit  from "../assets/mlh.svg";

    interface Tool          { name: string; url?: string; image?: any; desc?: string }
    interface SoftwareLicense { name: string; url: string; image: any; desc?: string }

    const physicalTools: Tool[] = [
        { name: "Oscilloscope",       url: "https://www.keysight.com/us/en/home.html",                  image: KeySightLogo, desc: "Keysight: measure and analyse signals" },
        { name: "Soldering Stations", url: "https://hakkousa.com/products/soldering/fx-888dx.html",     image: HakkoLogo,    desc: "Hakko FX-888DX precision stations"   },
        { name: "3D Printer",         url: "https://bambulab.com/en-us/a1-mini",                        image: BambuLab,     desc: "Bambu Lab A1 Mini, rapid prototyping" },
    ];

    const softwareLicenses: SoftwareLicense[] = [
        { image: OnePasswordLogo, name: "1Password", url: "https://1password.com", desc: "Secure credential management"   },
        { image: BalsamiqLogo,    name: "Balsamiq",  url: "https://balsamiq.com",  desc: "Rapid wireframing & mockups"    },
    ];
</script>

<div id="tools" class="flex flex-col gap-12">

    <!-- Section heading -->
    <div class="flex flex-col items-center gap-3 text-center">
        <p class="eyebrow">Armory of the Realm</p>
        <h2 class="text-5xl font-black text-castle-gold" style="text-shadow: 0 0 30px rgba(201,168,76,0.4);">
            Arsenal
        </h2>
        <p class="text-castle-stoneHighlight text-sm max-w-md">
            Every great quest needs the right gear. These weapons are yours to wield throughout the battle.
        </p>
    </div>

    <!-- Physical tools -->
    <div class="flex flex-col gap-4">
        <h3 class="armory-label">Physical Weapons</h3>
        <div class="rack-grid">
            {#each physicalTools as tool}
                <a href={tool.url ?? '#'} target="_blank" rel="noopener noreferrer" class="weapon-rack">
                    <div class="weapon-image-wrap">
                        {#if tool.image}
                            <img src={tool.image} alt={tool.name}
                                 class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                        {/if}
                    </div>
                    <div class="weapon-info">
                        <p class="text-white font-bold text-sm">{tool.name}</p>
                        {#if tool.desc}
                            <p class="text-castle-stoneLight text-xs leading-relaxed">{tool.desc}</p>
                        {/if}
                    </div>
                    <div class="weapon-glow-bar"></div>
                </a>
            {/each}
        </div>
    </div>

    <!-- Software licences -->
    <div class="flex flex-col gap-4">
        <h3 class="armory-label">Enchanted Scrolls</h3>
        <div class="scroll-grid">
            {#each softwareLicenses as { image, name, url, desc }}
                <a href={url} target="_blank" rel="noopener noreferrer" class="scroll-tile group">
                    <div class="scroll-logo-wrap">
                        <img src={image} alt={name}
                             class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div class="text-center">
                        <p class="text-white font-semibold text-sm">{name}</p>
                        {#if desc}
                            <p class="text-castle-stoneLight text-xs mt-0.5">{desc}</p>
                        {/if}
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div>

<style>
    .eyebrow {
        font-size: 0.65rem; text-transform: uppercase;
        letter-spacing: 0.5em; font-weight: 600; color: #ffb347;
    }

    .armory-label {
        font-size: 0.65rem; text-transform: uppercase;
        letter-spacing: 0.4em; font-weight: 700;
        color: rgba(201,168,76,0.5);
        padding-bottom: 0.4rem;
        border-bottom: 1px solid rgba(201,168,76,0.12);
    }

    .rack-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
    }

    .weapon-rack {
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: linear-gradient(160deg, #545468 0%, #3e3e52 100%);
        border: 1px solid rgba(201,168,76,0.2);
        border-radius: 0.75rem;
        transition: border-color 0.25s, box-shadow 0.25s;
        text-decoration: none;
    }
    .weapon-rack:hover {
        border-color: rgba(201,168,76,0.4);
        box-shadow: 0 0 24px rgba(201,168,76,0.12);
    }

    .weapon-image-wrap {
        height: 120px;
        padding: 1.25rem;
        background: linear-gradient(180deg, #3e3e52 0%, #545468 100%);
        border-bottom: 1px solid rgba(255,255,255,0.04);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .weapon-info {
        padding: 0.875rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
    }

    .weapon-glow-bar {
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent);
        opacity: 0;
        transition: opacity 0.25s;
    }
    .weapon-rack:hover .weapon-glow-bar { opacity: 1; }

    .scroll-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 1.25rem;
        justify-content: center;
    }

    .scroll-tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.25rem 1.5rem;
        background: linear-gradient(145deg, #545468, #3e3e52);
        border: 1px solid rgba(255,179,71,0.2);
        border-radius: 0.75rem;
        transition: border-color 0.25s, box-shadow 0.25s;
        text-decoration: none;
        width: 200px;
    }
    .scroll-tile:hover {
        border-color: rgba(255,179,71,0.45);
        box-shadow: 0 0 20px rgba(255,179,71,0.1);
    }

    .scroll-logo-wrap {
        width: 140px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
