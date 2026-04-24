<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { Utils } from "$lib/util";

    import auroraSvg          from "../assets/castle/aurora.svg";
    import moonSvg            from "../assets/castle/moon.svg";
    import mountainsSvg       from "../assets/castle/mountains.svg";
    import enchantedForestSvg from "../assets/castle/enchanted-forest.svg";
    import wallSvg            from "../assets/castle/wall.svg";
    import fogSvg             from "../assets/castle/fog.svg";
    import torchSvg           from "../assets/castle/torch.svg";

    import QRCode from "qrcode";

    let hash      = $state("");
    let qrDataUrl = $state("");
    let { form }  = $props<{ form?: { success?: boolean; alreadySignedUp?: boolean; error?: string } }>();
    let email     = $state("");
    let loading   = $state(false);

    let moonWobble = $state(false);
    let stars: { id: number; angle: number }[] = $state([]);
    let starId = 0;

    const applicationsClosed = Utils.hasApplicationsClosed();
    const isQrMode = $derived(hash === "#qr");

    function clickMoon() {
        if (moonWobble) return;
        moonWobble = true;
        for (let i = 0; i < 6; i++) {
            const id = ++starId;
            stars = [...stars, { id, angle: i * 60 + Math.random() * 20 }];
            setTimeout(() => { stars = stars.filter(s => s.id !== id); }, 900);
        }
        setTimeout(() => { moonWobble = false; }, 700);
    }

    onMount(async () => {
        hash = window.location.hash;
        const onHash = () => { hash = window.location.hash; };
        window.addEventListener("hashchange", onHash);

        qrDataUrl = await QRCode.toDataURL("https://khe.io", {
            width: 364, margin: 2,
            color: { dark: "#2e2e3a", light: "#c9a84c" },
        });

        return () => window.removeEventListener("hashchange", onHash);
    });
</script>

<div class="h-screen relative overflow-hidden bg-castle-skyDeep" id="qr">

    <img src={auroraSvg} aria-hidden="true" alt=""
         class="absolute inset-0 w-full h-full object-cover z-[1] opacity-40 pointer-events-none" />

    <button
        class="absolute top-6 right-14 md:right-24 w-28 md:w-48 z-[2] moon-btn"
        class:moon-wobble={moonWobble}
        onclick={clickMoon}
        aria-label="Click the moon"
    >
        <img src={moonSvg} alt="" class="w-full h-auto moon-glow" />
        {#each stars as star (star.id)}
            <span class="shooting-star" style="--angle: {star.angle}deg;"></span>
        {/each}
    </button>

    <img src={mountainsSvg} aria-hidden="true" alt=""
         class="absolute bottom-0 left-0 w-full h-auto z-[3] pointer-events-none" />

    <img src={enchantedForestSvg} aria-hidden="true" alt=""
         class="absolute bottom-0 left-0 w-full h-auto z-[4] pointer-events-none" />

    <img src={wallSvg} aria-hidden="true" alt=""
         class="absolute bottom-0 left-0 w-full h-auto z-[5] pointer-events-none" />

    <img src={torchSvg} aria-hidden="true" alt=""
         class="absolute z-[9] pointer-events-none torch-l"
         style="width: 3.5vw; min-width: 26px; bottom: calc(37.5vw - 14vw); left: 19%;" />

    <img src={torchSvg} aria-hidden="true" alt=""
         class="absolute z-[9] pointer-events-none torch-r"
         style="width: 3.5vw; min-width: 26px; bottom: calc(37.5vw - 14vw); right: 19%; transform: scaleX(-1);" />

    <!-- Fog 
    <img src={fogSvg} aria-hidden="true" alt=""
         class="absolute bottom-0 left-0 w-full h-auto z-[7] pointer-events-none opacity-55" />
-->
    <div class="absolute inset-0 z-[20] flex flex-col items-center justify-end pointer-events-none"
         style="padding-bottom: 2rem;">

        {#if isQrMode}
            <div class="flex flex-col items-center gap-4 pointer-events-auto">
                {#if qrDataUrl}
                    <div class="bg-castle-stoneDark p-4 rounded-2xl shadow-2xl border-2 border-castle-gold/60">
                        <img src={qrDataUrl} alt="QR Code - khe.io" class="w-64 h-64 rounded-lg" />
                    </div>
                {/if}
                <p class="text-castle-torchYellow text-2xl font-bold tracking-[0.5em] drop-shadow">khe.io</p>
            </div>

        {:else if applicationsClosed}
            <div class="flex flex-col items-center gap-3 px-6 text-center pointer-events-auto">
                <h1 class="title-glow text-5xl md:text-6xl font-black text-castle-gold leading-none tracking-tight">
                    HACK THE KINGDOM
                </h1>
                <p class="text-castle-gold text-base md:text-lg tracking-[0.3em] font-light">
                    KENT HACK ENOUGH
                </p>
                <div class="w-full max-w-sm bg-castle-mortar/80 backdrop-blur border border-castle-gold/25
                            rounded-2xl p-5 flex flex-col gap-3 mt-1 text-left">
                    <div class="text-center">
                        <p class="text-castle-gold text-xs uppercase tracking-[0.4em] mb-1">Save the Date</p>
                        <p class="text-white text-2xl font-bold">March 6-7, 2027</p>
                    </div>
                    <div class="h-px bg-castle-gold/20"></div>
                    {#if form?.success}
                        <div class="flex flex-col items-center gap-2 py-1 text-center">
                            <span class="text-castle-torchOrange text-3xl select-none">⚔</span>
                            <p class="text-white font-semibold text-sm">
                                {form.alreadySignedUp ? "Already on the list!" : "You're on the list!"}
                            </p>
                            <p class="text-castle-stoneHighlight text-xs">
                                {form.alreadySignedUp
                                    ? "We'll reach out when signups open."
                                    : "We'll notify you when registration launches."}
                            </p>
                        </div>
                    {:else}
                        <p class="text-castle-stoneHighlight text-xs -mb-1">Get notified when signups open</p>
                        {#if form?.error}
                            <p class="text-red-400 text-xs">{form.error}</p>
                        {/if}
                        <form method="POST" action="?/subscribe"
                              use:enhance={() => {
                                  loading = true;
                                  return async ({ update }) => { loading = false; await update(); };
                              }}
                              class="flex flex-col gap-2">
                            <input type="email" name="email" bind:value={email}
                                   placeholder="your@email.com" required
                                   class="w-full px-3 py-2 rounded-lg bg-castle-ironDark border border-castle-stoneMid
                                          text-white placeholder-castle-stoneLight text-sm
                                          focus:outline-none focus:border-castle-torchOrange transition-colors" />
                            <button type="submit" disabled={loading} class="btn-torch text-sm py-2">
                                {loading ? "Signing up..." : "Notify me"}
                            </button>
                        </form>
                    {/if}
                </div>
            </div>

        {:else}
            <div class="flex flex-col items-center gap-4 px-6 text-center pointer-events-auto">
                <h1 class="title-glow text-6xl md:text-8xl lg:text-[10rem] font-black text-castle-gold
                           leading-none tracking-tight">
                    HACK THE<br/>KINGDOM
                </h1>
                <p class="text-white/60 text-xl md:text-base tracking-[0.35em] uppercase font-light">
                    Kent Hack Enough 2027
                </p>
                <div class="flex items-center gap-3 text-castle-torchAmber/70 text-xl tracking-widest">
                    <span class="h-px w-10 bg-castle-torchAmber/40 block"></span>
                    March 6-7, 2027
                    <span class="h-px w-10 bg-castle-torchAmber/40 block"></span>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 mt-2">
                    <button onclick={() => goto("/auth/login")} class="btn-torch px-8 py-3 text-sm uppercase tracking-widest font-bold">
                        Apply
                    </button>
                    <button onclick={() => goto("/schedule")} class="btn-stone px-8 py-3 text-sm uppercase tracking-widest font-semibold">
                        View Schedule
                    </button>
                </div>
            </div>
        {/if}
    </div>

</div>

<style>

    .title-glow {
        text-shadow:
            0 0 20px  rgba(201, 168, 76, 0.7),
            0 0 60px  rgba(201, 168, 76, 0.4),
            0 0 120px rgba(201, 168, 76, 0.2);
    }

    .btn-torch {
        background: linear-gradient(135deg, #ff6b1a 0%, #ffb347 100%);
        color: #fff;
        border-radius: 0.5rem;
        box-shadow: 0 0 18px rgba(255, 107, 26, 0.45);
        transition: box-shadow 0.2s, transform 0.15s;
        cursor: pointer;
    }
    .btn-torch:hover {
        box-shadow: 0 0 32px rgba(255, 107, 26, 0.75);
        transform: translateY(-2px);
    }

    .btn-stone {
        background: linear-gradient(135deg, #4a4a5c 0%, #2e2e3a 100%);
        color: #c9a84c;
        border: 1px solid rgba(201, 168, 76, 0.3);
        border-radius: 0.5rem;
        transition: border-color 0.2s, background 0.2s, transform 0.15s;
        cursor: pointer;
    }
    .btn-stone:hover {
        border-color: rgba(201, 168, 76, 0.7);
        background: linear-gradient(135deg, #6b6b80 0%, #4a4a5c 100%);
        transform: translateY(-2px);
    }

    .moon-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        position: absolute;
        overflow: visible;
    }

    @keyframes moon-pulse {
        0%, 100% { filter: drop-shadow(0 0  8px rgba(201,168,76,0.35)); }
        50%       { filter: drop-shadow(0 0 24px rgba(201,168,76,0.80)); }
    }
    .moon-glow { animation: moon-pulse 5s ease-in-out infinite; }

    @keyframes moon-wobble {
        0%   { transform: scale(1)    rotate(0deg);  }
        20%  { transform: scale(1.18) rotate(-8deg); }
        40%  { transform: scale(1.12) rotate(6deg);  }
        60%  { transform: scale(1.08) rotate(-4deg); }
        80%  { transform: scale(1.04) rotate(2deg);  }
        100% { transform: scale(1)    rotate(0deg);  }
    }
    .moon-wobble img { animation: moon-wobble 0.7s ease-in-out forwards !important; }

    .shooting-star {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 60px;
        height: 2px;
        border-radius: 1px;
        background: linear-gradient(90deg, #ffe066, transparent);
        transform-origin: left center;
        transform: rotate(var(--angle));
        animation: shoot-out 0.9s ease-out forwards;
        pointer-events: none;
    }
    @keyframes shoot-out {
        0%   { opacity: 1; width: 0;    }
        40%  { opacity: 1; width: 70px; }
        100% { opacity: 0; width: 90px; }
    }

    @keyframes flicker-a {
        0%,100% { filter: drop-shadow(0 -6px 10px rgba(255,107,26,0.85)); }
        25%      { filter: drop-shadow(0 -6px 18px rgba(255,224,102,1.0)); }
        50%      { filter: drop-shadow(0 -6px  7px rgba(255,107,26,0.60)); }
        75%      { filter: drop-shadow(0 -6px 14px rgba(255,179,71,0.90)); }
    }
    @keyframes flicker-b {
        0%,100% { filter: drop-shadow(0 -6px 14px rgba(255,179,71,0.90)); }
        30%      { filter: drop-shadow(0 -6px  7px rgba(255,107,26,0.60)); }
        60%      { filter: drop-shadow(0 -6px 18px rgba(255,224,102,1.0)); }
        80%      { filter: drop-shadow(0 -6px 10px rgba(255,107,26,0.85)); }
    }
    .torch-l { animation: flicker-a 1.7s ease-in-out infinite; }
    .torch-r { animation: flicker-b 2.1s ease-in-out infinite; }
</style>
