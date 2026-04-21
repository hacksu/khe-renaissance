
<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { Utils } from "$lib/util";
    const day = "March 28-29th, 2026"
    import Button from "../components/Button.svelte";
    import dinoSvg from "../assets/dino.svg";
    import rockImg from "../assets/rock.png";
    import QRCode from "qrcode";
    // const returnDate = DateTime.fromFormat("03/28/2026", "MM/dd/yyyy").toRelativeCalendar();

    let isShaking = $state(false);
    let isHovered = $state(false);
    let shakeTimeout: ReturnType<typeof setTimeout> | null = null;
    let hash = $state("");
    let qrDataUrl = $state("");
    let { form } = $props<{ form?: { success?: boolean; alreadySignedUp?: boolean; error?: string } }>();
    let email = $state("");
    let loading = $state(false);
    const applicationsClosed = Utils.hasApplicationsClosed();

    const isQrMode = $derived(hash === "#qr");

    onMount(async () => {
        hash = window.location.hash;
        const handleHashChange = () => { hash = window.location.hash; };
        window.addEventListener("hashchange", handleHashChange);

        qrDataUrl = await QRCode.toDataURL("https://khe.io", {
            width: 364,
            margin: 2,
            color: {
                dark: "#504538",
                light: "#ede4d9",
            },
        });

        // Shake the rock occasionally (every 5-8 seconds)
        const scheduleShake = () => {
            const delay = 5000 + Math.random() * 3000; // 5-8 seconds
            shakeTimeout = setTimeout(() => {
                isShaking = true;
                setTimeout(() => {
                    isShaking = false;
                    scheduleShake(); // Schedule next shake
                }, 800); // Shake duration
            }, delay);
        };
        scheduleShake();

        return () => {
            if (shakeTimeout) clearTimeout(shakeTimeout);
            window.removeEventListener("hashchange", handleHashChange);
        };
    });
</script>

<div class="bg-[url(/background.jpg)] bg-cover bg-center h-screen flex flex-col justify-center items-center gap-3 text-center relative overflow-hidden">
    <img 
        src={rockImg} 
        alt="Rock" 
        class="absolute inset-0 w-full h-full object-cover object-center z-10 transition-transform duration-100 pointer-events-none overflow-hidden"
        class:animate-shake={isShaking}
        style="transform-origin: center center;"
    />
    
    <div 
        class="absolute bottom-[0%] left-[18%] cursor-pointer z-[5] p-8 -m-8"
        onmouseenter={() => isHovered = true}
        onmouseleave={() => isHovered = false}
    >
        <img 
            src={dinoSvg} 
            alt="Dino" 
            class="w-32 md:w-48 h-auto transition-all duration-500 ease-out pointer-events-none dino-pop"
            class:dino-popped={isHovered}
            class:dino-hidden={!isHovered}
        />
    </div>

    <!-- Content overlay (above rock and dino) -->
    <div class="relative z-30 flex flex-col items-center gap-3 text-center" id="qr">
        {#if !applicationsClosed}
            <h1 class="text-4xl">Kent Hack Enough returns <span class="font-bold">{day}</span></h1>
        {/if}
        {#if isQrMode}
            <div class="flex flex-col items-center gap-3 mt-1">
                {#if qrDataUrl}
                    <div class="bg-offwhite p-3 rounded-2xl shadow-2xl border-4 border-sand/60">
                        <img src={qrDataUrl} alt="QR Code to khe.io" class="w-72 h-72 rounded-lg" />
                    </div>
                {/if}
                <p class="text-offwhite/90 text-xl font-semibold tracking-widest drop-shadow">khe.io</p>
            </div>
        {:else}
            {#if applicationsClosed}
                <div class="bg-secondary/90 backdrop-blur-md border-2 border-sand/50 rounded-3xl shadow-2xl px-10 py-10 flex flex-col items-center gap-4 max-w-2xl">
                    <p class="text-sand uppercase tracking-[0.3em] text-sm font-semibold">Save the date</p>

                    <h1 class="text-offwhite text-4xl md:text-5xl font-bold leading-tight">
                        Kent Hack Enough<br />
                        <span class="text-accent">will return</span>
                    </h1>

                    <div class="h-px w-3/4 bg-sand/40"></div>

                    <p class="text-sand text-3xl md:text-4xl font-bold tracking-wide">
                        March 6-7, 2027
                    </p>
                </div>

                <div class="bg-offwhite backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-8 w-full max-w-md flex flex-col gap-4 shadow-xl mt-3">
                    {#if form?.success}
                        <div class="flex flex-col items-center gap-3 py-2">
                            <div class="w-12 h-12 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-accent text-2xl">✓</div>
                            <p class="text-secondary font-semibold text-lg">
                                {form.alreadySignedUp ? "You're already on the list!" : "You're on the list!"}
                            </p>
                            <p class="text-secondary/70 text-sm text-center">
                                {form.alreadySignedUp
                                    ? "We already have your email. We'll reach out when signups open."
                                    : "We'll email you when signups open for KHE 2027."}
                            </p>
                        </div>
                    {:else}
                        <p class="text-secondary font-semibold text-lg">Get notified when signups open</p>
                        <p class="text-secondary/70 text-sm -mt-2">Drop your email and we'll reach out when registration launches.</p>

                        {#if form?.error}
                            <p class="text-red-600 text-sm">{form.error}</p>
                        {/if}

                        <form
                            method="POST"
                            action="?/subscribe"
                            use:enhance={() => {
                                loading = true;
                                return async ({ update }) => {
                                    loading = false;
                                    await update();
                                };
                            }}
                            class="flex flex-col gap-3"
                        >
                            <input
                                type="email"
                                name="email"
                                bind:value={email}
                                placeholder="your@email.com"
                                required
                                class="w-full px-4 py-3 rounded-xl bg-white border border-secondary/20 text-secondary placeholder-secondary/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                class="w-full py-3 px-6 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/40 hover:scale-[1.02] text-sm"
                            >
                                {loading ? "Signing up..." : "Remind me"}
                            </button>
                        </form>
                    {/if}
                </div>
            {:else}
                <div class="flex flex-col md:flex-row gap-3 w-96">
                    <Button size="lg" onclick={() => goto("/auth/login")}>Apply now!</Button>
                    <Button size="lg" onclick={() => goto("/schedule")}>View Schedule</Button>
                </div>
            {/if}
        {/if}
    </div>
</div>

<!--I hate keyframes -->
<style>
    @keyframes shake {
        0% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
        }
        5% { 
            transform: translate(-3px, -2px) rotate(-1deg) scale(1.002);
        }
        10% { 
            transform: translate(3px, 2px) rotate(1deg) scale(1.001);
        }
        15% { 
            transform: translate(-2px, 1px) rotate(-0.8deg) scale(1.001);
        }
        20% { 
            transform: translate(2px, -1px) rotate(0.8deg) scale(1);
        }
        25% { 
            transform: translate(-2px, 2px) rotate(-0.6deg) scale(1.001);
        }
        30% { 
            transform: translate(2px, -2px) rotate(0.6deg) scale(1);
        }
        35% { 
            transform: translate(-1px, 1px) rotate(-0.4deg) scale(1);
        }
        40% { 
            transform: translate(1px, -1px) rotate(0.4deg) scale(1);
        }
        45% { 
            transform: translate(-1px, 0px) rotate(-0.3deg) scale(1);
        }
        50% { 
            transform: translate(1px, 1px) rotate(0.3deg) scale(1);
        }
        55% { 
            transform: translate(-0.5px, -0.5px) rotate(-0.2deg) scale(1);
        }
        60% { 
            transform: translate(0.5px, 0.5px) rotate(0.2deg) scale(1);
        }
        65% { 
            transform: translate(-0.5px, 0px) rotate(-0.1deg) scale(1);
        }
        70% { 
            transform: translate(0.5px, 0px) rotate(0.1deg) scale(1);
        }
        75% { 
            transform: translate(-0.3px, 0px) rotate(-0.05deg) scale(1);
        }
        80% { 
            transform: translate(0.3px, 0px) rotate(0.05deg) scale(1);
        }
        85% { 
            transform: translate(-0.2px, 0px) rotate(-0.03deg) scale(1);
        }
        90% { 
            transform: translate(0.2px, 0px) rotate(0.03deg) scale(1);
        }
        95% { 
            transform: translate(-0.1px, 0px) rotate(-0.01deg) scale(1);
        }
        100% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
        }
    }

    .animate-shake {
        animation: shake 0.8s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        transform-origin: center center;
    }

    .dino-pop {
        transform: translateY(0) translateX(0) scale(1);
        opacity: 0;
        visibility: hidden;
    }

    .dino-pop.dino-popped {
        transform: translateY(-60px) translateX(20px) scale(1.15);
        opacity: 1;
        visibility: visible;
    }

    .dino-pop.dino-hidden {
        opacity: 0;
        visibility: hidden;
    }
</style>
