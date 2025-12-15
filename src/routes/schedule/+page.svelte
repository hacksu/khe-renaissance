<script lang="ts">
    import Card from "../../components/Card.svelte";

    const scheduleEvents = [
        // Saturday
        { day: "Saturday", time: "10:00 AM", event: "Check-in", type: "event" },
        { day: "Saturday", time: "10:00 AM", event: "Pre-event", type: "event" },
        { day: "Saturday", time: "10:30 AM", event: "Sponsor Tables", type: "event" },
        { day: "Saturday", time: "11:00 AM", event: "Team Formation", type: "event" },
        { day: "Saturday", time: "11:30 AM", event: "Opening Ceremony", type: "ceremony", highlight: true },
        { day: "Saturday", time: "12:00 PM", event: "Start Hacking!", type: "milestone", highlight: true },
        { day: "Saturday", time: "12:15 PM", event: "Workshop 0", type: "workshop" },
        { day: "Saturday", time: "1:00 PM", event: "Lunch", type: "meal" },
        { day: "Saturday", time: "2:00 PM", event: "Workshop 1: Svelte", type: "workshop" },
        { day: "Saturday", time: "4:00 PM", event: "Workshop 2: Flask & MongoDB", type: "workshop" },
        { day: "Saturday", time: "6:00 PM", event: "Dinner", type: "meal" },
        { day: "Saturday", time: "8:00 PM", event: "Workshop 3: APIs", type: "workshop" },
        { day: "Saturday", time: "10:00 PM", event: "Mini Event: Wiki Speedrun", type: "event" },
        { day: "Saturday", time: "12:00 AM", event: "Initial Devpost Checkpoint", type: "milestone" },
        { day: "Saturday", time: "12:00 AM", event: "Midnight Snack", type: "meal" },
        { day: "Saturday", time: "3:00 AM", event: "Mini Event: YouTube Deep Dive", type: "event" },
        
        // Sunday
        { day: "Sunday", time: "9:00 AM", event: "Breakfast & Coffee", type: "meal" },
        { day: "Sunday", time: "12:00 PM", event: "Hacking Ends", type: "milestone", highlight: true },
        { day: "Sunday", time: "12:00 PM", event: "Lunch", type: "meal" },
        { day: "Sunday", time: "12:30 PM", event: "Judging", type: "event" },
        { day: "Sunday", time: "2:00 PM", event: "Closing Ceremony", type: "ceremony", highlight: true },
    ];

    // Group events by day
    const saturday = scheduleEvents.filter(e => e.day === "Saturday");
    const sunday = scheduleEvents.filter(e => e.day === "Sunday");

    // Get dot color based on event type
    function getDotColor(type: string): string {
        switch(type) {
            case "ceremony":
                return "bg-sand"; // Gold/sand for ceremonies
            case "meal":
                return "bg-orange-500"; // Orange for meals
            case "workshop":
                return "bg-accent"; // Blue for workshops
            case "event":
                return "bg-primary"; // Beige for general events
            case "milestone":
                return "bg-green-500"; // Green for milestones
            default:
                return "bg-white";
        }
    }
</script>

<div class="py-12 px-4 md:px-12 lg:px-24 xl:px-36 flex flex-col gap-12 text-black">
    <!-- Header Section -->
    <div class="text-center max-w-4xl mx-auto fade-in">
        <h1 class="font-bold text-5xl mb-6 text-secondary">Event Schedule</h1>
        <p class="text-xl mb-4 leading-relaxed">
            Here's the timeline for the weekend. Join us for 24 hours of hacking, workshops, and fun!
        </p>
    </div>

    <!-- Saturday Schedule -->
    <div class="fade-in" style="animation-delay: 0.2s;">
        <h2 class="text-4xl font-bold text-center mb-8 text-secondary">~ Saturday ~</h2>
        <Card padded>
            <div class="space-y-1">
                {#each saturday as event, i}
                    <div 
                        class="timeline-item flex items-start gap-3 py-3 relative {event.highlight ? 'bg-white/10 -mx-4 px-4 rounded-md' : ''} group transition-all duration-300 hover:bg-white/5 cursor-pointer"
                        style="animation-delay: {0.3 + i * 0.05}s;"
                    >
                        <!-- Timeline dot -->
                        <div class="flex flex-col items-center pt-1">
                            <div class="timeline-dot w-3 h-3 rounded-full {getDotColor(event.type)} ring-2 ring-white/30 transition-all duration-300 group-hover:ring-4 group-hover:scale-110"></div>
                            {#if i < saturday.length - 1}
                                <div class="w-0.5 h-full min-h-[40px] bg-white/20 mt-1"></div>
                            {/if}
                        </div>

                        <!-- Time -->
                        <div class="text-accent font-bold font-mono min-w-[90px] pt-0.5 text-sm md:text-base transition-colors duration-300 group-hover:text-sand">
                            {event.time}
                        </div>

                        <!-- Event details -->
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

    <!-- Sunday Schedule -->
    <div class="fade-in" style="animation-delay: 0.4s;">
        <h2 class="text-4xl font-bold text-center mb-8 text-secondary">~ Sunday ~</h2>
        <Card padded>
            <div class="space-y-1">
                {#each sunday as event, i}
                    <div 
                        class="timeline-item flex items-start gap-3 py-3 relative {event.highlight ? 'bg-white/10 -mx-4 px-4 rounded-md' : ''} group transition-all duration-300 hover:bg-white/5 cursor-pointer"
                        style="animation-delay: {1.2 + i * 0.05}s;"
                    >
                        <!-- Timeline dot -->
                        <div class="flex flex-col items-center pt-1">
                            <div class="timeline-dot w-3 h-3 rounded-full {getDotColor(event.type)} ring-2 ring-white/30 transition-all duration-300 group-hover:ring-4 group-hover:scale-110"></div>
                            {#if i < sunday.length - 1}
                                <div class="w-0.5 h-full min-h-[40px] bg-white/20 mt-1"></div>
                            {/if}
                        </div>

                        <!-- Time -->
                        <div class="text-accent font-bold font-mono min-w-[90px] pt-0.5 text-sm md:text-base transition-colors duration-300 group-hover:text-sand">
                            {event.time}
                        </div>

                        <!-- Event details -->
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
