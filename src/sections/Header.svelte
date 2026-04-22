<script lang="ts">
    import Shield from "../assets/castle/shield.svg";
    import Banner from "../assets/castle/banner.svg";
</script>

<div class="flex flex-col items-center gap-16">

    <div class="relative w-full flex flex-col items-center text-center gap-5">
        <img src={Banner} aria-hidden="true" alt=""
             class="hidden lg:block absolute left-0  top-0 h-72 w-auto opacity-60 -translate-x-2 pointer-events-none" />
        <img src={Banner} aria-hidden="true" alt=""
             class="hidden lg:block absolute right-0 top-0 h-72 w-auto opacity-60 translate-x-2 pointer-events-none" />

        <p class="eyebrow">The Kingdom Calls</p>

        <h2 class="text-5xl md:text-6xl font-black text-white leading-tight">
            KENT HACK ENOUGH
        </h2>

        <div class="flex items-center gap-4 w-full max-w-sm">
            <span class="flex-1 h-px bg-castle-gold/30"></span>
            <span class="text-castle-gold font-bold tracking-[0.4em] text-sm">2027</span>
            <span class="flex-1 h-px bg-castle-gold/30"></span>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center w-full mt-16">

        <div class="flex flex-col gap-6">
            <div class="parchment-block">
                <p class="text-lg md:text-xl leading-relaxed text-castle-stoneHighlight">
                    Kent Hack Enough storms the gates this year with our theme:
                    <span class="font-bold text-castle-torchYellow" style="text-shadow: 0 0 12px rgba(255,224,102,0.5);">
                        Hack the Kingdom.
                    </span>
                    Sharpen your swords, marshal your code, and storm the digital fortress.
                </p>
            </div>

            <div class="parchment-block">
                <p class="text-base text-castle-stoneHighlight leading-relaxed">
                    This is our <span class="font-bold text-white">14th KHE!</span>
                    Whether you're <span class="font-bold text-white">completely new</span> to
                    tech & design or a <span class="font-bold text-white">seasoned veteran</span>,
                    spend a weekend making something legendary with us.
                </p>
            </div>

        </div>

        <div class="flex justify-center lg:justify-end">
            <div class="shield-glow">
                <img src={Shield} alt="Kingdom Shield"
                     class="w-36 md:w-48 h-auto transition-transform duration-500 hover:scale-105 hover:rotate-3" />
            </div>
        </div>
    </div>
</div>

<style>
    .eyebrow {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.5em;
        font-weight: 600;
        color: #ffb347;
    }

    .parchment-block {
        border-left: 3px solid rgba(201,168,76,0.4);
        padding-left: 1.25rem;
    }

    .shield-glow {
        filter: drop-shadow(0 0 20px rgba(201,168,76,0.35));
        transition: filter 0.3s;
    }
    .shield-glow:hover {
        filter: drop-shadow(0 0 36px rgba(201,168,76,0.6));
    }
</style>
