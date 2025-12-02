<script lang="ts">
    import Card from "../components/Card.svelte";

    const overallPrizes = [
        { place: "1st Place", item: "HyperX Cloud Alpha Wireless", color: "text-sand", delay: 0.2, detail: "Wireless Gaming Headset" },
        { place: "2nd Place", item: "Redragon K732 Keyboard", color: "text-offwhite", delay: 0.3, detail: "Mechanical Gaming Keyboard" },
        { place: "3rd Place", item: "HyperX SoloCast", color: "text-primary", delay: 0.4, detail: "USB Condenser Microphone" }
    ];

    const trackPrizes = [
        { track: "Cybersecurity", item: "IT/Dev Ops Field Kit", detail: "USB Drives (5), Screw Driver Kit, Tech Pouch, Lock Pick Set", delay: 0.5 },
        { track: "Data Science", item: "Portable Drive", detail: "1TB External Hard Drive", delay: 0.6 },
        { track: "Game Programming", item: "Miyoo Mini Plus", detail: "Retro Handheld Game Console", delay: 0.7 },
        { track: "Embedded Systems", item: "Libre Computer Sweet Potato", detail: "Modern Single Board Computer", delay: 0.8 }
    ];

    const specialPrizes = [
        { name: "Hackathon Theme", item: "Dinosaur 3-in-1 Lego Set", delay: 0.9 }
    ];
</script>

<div id="prizes" class="flex flex-col gap-12 text-black">
    <div class="text-center max-w-4xl mx-auto fade-in">
        <h1 class="font-bold text-5xl mb-6 text-secondary">Prizes</h1>
        <p class="text-xl mb-4 leading-relaxed">
            Build something amazing and win big! Check out what's up for grabs this year.
        </p>
    </div>

    <div class="fade-in" style="animation-delay: 0.1s;">
        <h2 class="text-4xl font-bold text-center mb-8 text-secondary">~ Overall Winners ~</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            {#each overallPrizes as prize}
                <div class="h-full fade-in" style="animation-delay: {prize.delay}s;">
                    <Card padded>
                        <div class="flex flex-col items-center text-center gap-4 h-full justify-center min-h-[160px]">
                            <h3 class="text-4xl font-bold {prize.color} drop-shadow-sm">{prize.place}</h3>
                            <p class="text-xl font-semibold text-white">{prize.item}</p>
                            {#if prize.detail}
                                <p class="text-sm text-offwhite opacity-80 mt-1 max-w-xs">{prize.detail}</p>
                            {/if}
                        </div>
                    </Card>
                </div>
            {/each}
        </div>
    </div>

    <div class="fade-in" style="animation-delay: 0.4s;">
        <h2 class="text-4xl font-bold text-center mb-8 text-secondary">~ Track Winners ~</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#each trackPrizes as prize}
                <div class="h-full fade-in" style="animation-delay: {prize.delay}s;">
                    <Card padded>
                        <div class="flex flex-col items-center text-center gap-2 h-full justify-start min-h-[140px]">
                            <h3 class="text-2xl font-bold text-accent mb-2">{prize.track}</h3>
                            <p class="text-xl font-semibold text-white">{prize.item}</p>
                            {#if prize.detail}
                                <p class="text-sm text-offwhite opacity-80 mt-1 max-w-xs">{prize.detail}</p>
                            {/if}
                        </div>
                    </Card>
                </div>
            {/each}
        </div>
    </div>

    <div class="fade-in" style="animation-delay: 0.8s;">
        <h2 class="text-4xl font-bold text-center mb-8 text-secondary">~ Special Prizes ~</h2>
        <div class="max-w-md mx-auto fade-in" style="animation-delay: 0.9s;">
            <Card padded>
                <div class="flex flex-col items-center text-center gap-3 py-4">
                    <h3 class="text-3xl font-bold text-link">{specialPrizes[0].name}</h3>
                    <p class="text-2xl font-semibold text-white">{specialPrizes[0].item}</p>
                </div>
            </Card>
        </div>
    </div>
</div>

<style>
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .fade-in {
        animation: fadeInUp 0.6s ease-out both;
    }
</style>
