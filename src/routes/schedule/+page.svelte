<script lang="ts">
    import Card from "../../components/Card.svelte";

    let { data } = $props();

    // Group by day, preserving order from DB
    const days = [...new Set(data.events.map((e: any) => e.day))];
    const byDay = (day: string) => data.events.filter((e: any) => e.day === day);

    // Get dot color based on event type
    function getDotColor(type: string): string {
        switch(type) {
            case "ceremony":
                return "bg-castle-gold";
            case "meal":
                return "bg-castle-torchAmber";
            case "workshop":
                return "bg-castle-torchOrange";
            case "event":
                return "bg-castle-stoneLight";
            case "milestone":
                return "bg-green-500";
            default:
                return "bg-white";
        }
    }
</script>

<div class="py-12 px-4 md:px-12 lg:px-24 xl:px-36 flex flex-col gap-12">
    <!-- Header Section -->
    <div class="text-center max-w-4xl mx-auto fade-in">
        <h1 class="font-bold text-5xl mb-6 text-castle-gold">Event Schedule</h1>
        <p class="text-xl mb-4 leading-relaxed">
            Here's the timeline for the weekend. Join us for 24 hours of hacking, workshops, and fun!
        </p>
    </div>

    {#each days as day, di}
    <div class="fade-in" style="animation-delay: {0.2 + di * 0.2}s;">
        <h2 class="text-4xl font-bold text-center mb-8 text-castle-gold">~ {day} ~</h2>
        <Card padded>
            <div class="space-y-1">
                {#each byDay(day) as event, i}
                    {@const eventsForDay = byDay(day)}
                    <div
                        class="timeline-item flex items-start gap-3 py-3 relative {event.highlight ? 'bg-white/10 -mx-4 px-4 rounded-md' : ''} group transition-all duration-300 hover:bg-white/5 cursor-pointer"
                        style="animation-delay: {0.3 + di * 0.8 + i * 0.05}s;"
                    >
                        <div class="flex flex-col items-center pt-1">
                            <div class="timeline-dot w-3 h-3 rounded-full {getDotColor(event.type)} ring-2 ring-white/30 transition-all duration-300 group-hover:ring-4 group-hover:scale-110"></div>
                            {#if i < eventsForDay.length - 1}
                                <div class="w-0.5 h-full min-h-[40px] bg-white/20 mt-1"></div>
                            {/if}
                        </div>
                        <div class="text-castle-torchOrange font-bold font-mono min-w-[90px] pt-0.5 text-sm md:text-base transition-colors duration-300 group-hover:text-castle-gold">
                            {event.time}
                        </div>
                        <div class="flex-1">
                            <div class="text-white text-base md:text-lg font-semibold transition-transform duration-300 group-hover:translate-x-1">
                                {event.event}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </Card>
    </div>
    {/each}

    <!-- Footer Note -->
    <div class="text-center max-w-2xl mx-auto fade-in" style="animation-delay: 0.6s;">
        <Card padded>
            <p class="text-white text-sm opacity-90">
                <strong>Note:</strong> Schedule is subject to change. Check back for updates!
            </p>
        </Card>
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

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.8;
        }
    }

    .fade-in {
        animation: fadeInUp 0.6s ease-out both;
    }

    .timeline-item {
        animation: fadeInUp 0.4s ease-out both;
    }

    .timeline-dot {
        animation: pulse 2s ease-in-out infinite;
    }

    /* Pause pulse on hover */
    .group:hover .timeline-dot {
        animation: none;
    }
</style>
