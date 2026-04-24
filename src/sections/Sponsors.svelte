<script lang="ts">
    interface Sponsor { name: string; url: string; image: any; tier?: "royal" | "knight" | "ally" }

    import Bawlslogo      from "../assets/sponsors/bawls.png";
    import DeptLogo       from "../assets/sponsors/CSLogo.png";
    import KSULogo        from "../assets/sponsors/ksu-logo.svg";
    import BentTreeLogo   from "../assets/sponsors/bent_tree_coffee_roasters_logo.png";
    import BarrioLogo     from "../assets/sponsors/barrio_logo.webp";
    import EnbasisLogo    from "../assets/sponsors/enbasis_inc_logo.jpg";
    import DaveyTreeLogo  from "../assets/sponsors/daveytree_logo.png";
    import HacKSULogo     from "../assets/sponsors/hacksu_logo.svg";
    import PureButtonsLogo from "../assets/sponsors/pure_buttons_logo.png";
    import BoardAndBevyLogo from "../assets/sponsors/board_and_bevy.png";
    import ProgressiveLogo from "../assets/sponsors/progressive.svg";
    import ATRLabLogo     from "../assets/sponsors/atr.png";

    const royalPatrons: Sponsor[] = [
        { image: DaveyTreeLogo, name: "DaveyTree",            url: "https://www.davey.com/" },
        { image: EnbasisLogo,   name: "Enbasis",              url: "https://enbasis.com"    },
        { image: "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png",
                                name: "Amazon Web Services",  url: "https://aws.amazon.com" },
        { image: ATRLabLogo,    name: "Advanced Telerobotics Lab", url: "https://www.atr.cs.kent.edu/" },
        { image: ProgressiveLogo, name: "Progressive Insurance", url: "https://progressive.com/" },
    ];

    const allies: Sponsor[] = [
        { image: Bawlslogo,        name: "Bawls",               url: "https://bawls.com"                },
        { image: BentTreeLogo,     name: "Bent Tree Coffee",     url: "https://www.benttreecoffee.com"   },
        { image: BoardAndBevyLogo, name: "Board And Bevy",       url: "https://www.boardandbevy.com/"    },
        { image: BarrioLogo,       name: "Barrio",               url: "https://barrio-tacos.com/locations/kent/" },
        { image: PureButtonsLogo,  name: "Pure Buttons",         url: "https://mlh.io"                   },
        { image: KSULogo,          name: "Kent State University", url: "https://www.kent.edu"             },
        { image: HacKSULogo,       name: "HacKSU",               url: "https://hacksu.com"               },
        { image: DeptLogo,         name: "CS Department",        url: "https://www.kent.edu/cs"          },
    ];
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

    <!-- Royal Patrons (larger tiles) -->
    <div class="flex flex-col gap-3">
        <h3 class="tier-label">Royal Patrons</h3>
        <div class="flex flex-wrap gap-4 justify-center">
            {#each royalPatrons as { image, name, url }}
                <a href={url} target="_blank" rel="noopener noreferrer"
                   class="sponsor-tile royal">
                    <img src={image} alt={name}
                         class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                </a>
            {/each}
        </div>
    </div>

    <!-- Allies (smaller tiles) -->
    <div class="flex flex-col gap-3">
        <h3 class="tier-label">Allies of the Realm</h3>
        <div class="flex flex-wrap gap-3 justify-center">
            {#each allies as { image, name, url }}
                <a href={url} target="_blank" rel="noopener noreferrer"
                   class="sponsor-tile ally group">
                    <img src={image} alt={name}
                         class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                </a>
            {/each}
        </div>
    </div>

    <!-- Sponsorship CTA -->
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

    .sponsor-tile.royal { width: 220px; height: 120px; }
    .sponsor-tile.ally  { width: 160px; height: 90px;  }

    .sponsor-cta {
        color: #c9a84c;
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.2s;
    }
    .sponsor-cta:hover { color: #ffb347; }
</style>
