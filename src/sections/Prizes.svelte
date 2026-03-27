<script lang="ts">
    import Card from "../components/Card.svelte";

    import itDevopsKit from "../assets/prizes/it-devops-kit.png";
    import hyperxCloudAlpha from "../assets/prizes/hyperx-cloud-alpha.png";
    import redragonK732 from "../assets/prizes/redragon-k732.png";
    import hyperxSolocast from "../assets/prizes/hyperx-solocast.png";
    import aioloDrive from "../assets/prizes/aiolo-drive.png";
    import miyooMiniPlus from "../assets/prizes/miyoo-mini-plus.png";
    import libreComputer from "../assets/prizes/libre-computer.png";
    import legoDino from "../assets/prizes/lego-dino.png";
    import yxkMonitor from "../assets/prizes/yxk-monitor.png";
    import dinoNuggetPlush from "../assets/prizes/dino-nugget-plush.png";
    import copperDino from "../assets/prizes/copper-dino.png";
    import raspBerry from "../assets/prizes/atr.png";

    const overallPrizes = [
        { place: "1st Place", item: "HyperX Cloud Alpha Wireless", color: "text-sand", delay: 0.2, detail: "Wireless Gaming Headset", img: hyperxCloudAlpha },
        { place: "2nd Place", item: "Redragon K732 Keyboard", color: "text-offwhite", delay: 0.3, detail: "Mechanical RGB Keyboard", img: redragonK732 },
        { place: "3rd Place", item: "HyperX SoloCast 2 Microphone", color: "text-primary", delay: 0.4, detail: "USB Condenser Microphone", img: hyperxSolocast }
    ];

    const trackPrizes = [
        { track: "Cybersecurity", item: "IT/Dev Ops Field Kit", detail: "USB Drives (5), Screw Driver Kit, Tech Pouch, Lock Pick Set", delay: 0.5, img: itDevopsKit },
        { track: "Data Science", item: "Aiolo Portable Drive", detail: "1TB External Hard Drive", delay: 0.6, img: aioloDrive },
        { track: "Game Programming", item: "Miyoo Mini Plus", detail: "Retro Handheld Game Console", delay: 0.7, img: miyooMiniPlus },
        { track: "Embedded Systems", item: "Libre Computer Sweet Potato", detail: "Modern Single Board Computer", delay: 0.8, img: libreComputer },
        { name: "Physical AI / Robotics", item: "RasTech Raspberry Pi 5 Kit", detail: "Raspberry Pi 5 Development Kit", delay: 0.9, img: raspBerry  },
    ];

    const specialPrizes = [
        { name: "Hackathon Theme", item: "LEGO Creator 3-in-1 Dinosaur Set", detail: "Top 5 teams", delay: 1.0, img: legoDino },
        { name: "Best Solo Hack", item: "Yxk Portable Monitor", detail: "", delay: 1.1, img: yxkMonitor },
        { name: "Best Attempt", item: "Dino Nugget Pillow Plush", detail: "Organizer Selected", delay: 1.2, img: dinoNuggetPlush },
        { name: "Coolest Hack", item: "Solid Copper Dinosaur Skeleton", detail: "Organizer Selected", delay: 1.3, img: copperDino }
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
                    <Card>
                        <img src={prize.img} alt={prize.item} class="w-full h-48 object-contain p-4 bg-secondary rounded-t-md" />
                        <div class="flex flex-col items-center text-center gap-2 p-4">
                            <h3 class="text-3xl font-bold {prize.color} drop-shadow-sm">{prize.place}</h3>
                            <p class="text-lg font-semibold text-white">{prize.item}</p>
                            {#if prize.detail}
                                <p class="text-sm text-offwhite opacity-80 max-w-xs">{prize.detail}</p>
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
                    <Card>
                        {#if prize.img}
                            <img src={prize.img} alt={prize.item} class="w-full h-40 object-contain p-4 bg-secondary rounded-t-md" />
                        {/if}
                        <div class="flex flex-col items-center text-center gap-2 p-4 {prize.img ? '' : 'min-h-[140px] justify-center'}">
                            <h3 class="text-2xl font-bold text-accent">{prize.track}</h3>
                            <p class="text-xl font-semibold text-white">{prize.item}</p>
                            {#if prize.detail}
                                <p class="text-sm text-offwhite opacity-80 max-w-xs">{prize.detail}</p>
                            {/if}
                        </div>
                    </Card>
                </div>
            {/each}
        </div>
    </div>

    <div class="fade-in" style="animation-delay: 0.8s;">
        <h2 class="text-4xl font-bold text-center mb-8 text-secondary">~ Special Prizes ~</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {#each specialPrizes as prize}
                <div class="fade-in" style="animation-delay: {prize.delay}s;">
                    <Card>
                        {#if prize.img}
                            <img src={prize.img} alt={prize.item} class="w-full h-40 object-contain p-4 bg-secondary rounded-t-md" />
                        {/if}
                        <div class="flex flex-col items-center text-center gap-2 p-4">
                            <h3 class="text-2xl font-bold text-link">{prize.name}</h3>
                            <p class="text-lg font-semibold text-white">{prize.item}</p>
                            {#if prize.detail}
                                <p class="text-sm text-offwhite opacity-80">{prize.detail}</p>
                            {/if}
                        </div>
                    </Card>
                </div>
            {/each}
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
