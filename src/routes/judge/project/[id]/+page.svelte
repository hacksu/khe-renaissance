<script lang="ts">
    import { goto } from "$app/navigation";
    import Icon from "@iconify/svelte";
    
    let { data } = $props();
    const { project, criteria } = data;

    // --- State ---
    interface ScoreMap {
        [key: string]: number;
    }
    // Initialize scores map: id -> score
    let scores: ScoreMap = $state(Object.fromEntries(criteria.map((c: any) => [c.id, 0])));

    let progress = $derived(
        Object.values(scores).filter(s => s > 0).length
    );
    let totalCriteria = criteria.length;
    let progressPercent = $derived((progress / totalCriteria) * 100);

    function handleNext() {
        if (progress < totalCriteria) {
             // Optional logic
        }
        goto(`/judge/project/${project.id}/comments`);
    }

</script>

<div class="max-w-md mx-auto flex flex-col h-screen bg-sand overflow-hidden">
    
    <!-- Top Bar -->
    <div class="flex-none p-4 bg-sand border-b border-secondary/10 z-10">
        <div class="flex items-center justify-between mb-2">
            <a href="/judge" class="text-sm font-medium text-secondary/60 hover:text-primary">← Dashboard</a>
            <span class="text-xs font-bold uppercase text-secondary/40">Judging</span>
        </div>
        <h1 class="text-xl font-bold text-secondary truncate">{project.name}</h1>
        <p class="text-xs text-secondary/70 truncate">{project.track}</p>

        <!-- Progress Bar -->
        <div class="mt-4">
            <div class="flex justify-between text-xs text-secondary/60 mb-1">
                <span>Progress</span>
            </div>
            <div class="h-2 bg-secondary/10 rounded-full overflow-hidden">
                <div class="h-full bg-accent transition-all duration-300 ease-out" style="width: {progressPercent}%"></div>
            </div>
        </div>
    </div>

    <!-- Form Container -->
    <form method="POST" action="?/saveScores" class="flex-1 flex flex-col relative overflow-hidden">
        <!-- Scrollable Form Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
            
            {#each criteria as criterion (criterion.id)}
                <div class="space-y-3">
                    <div class="flex justify-between items-end">
                        <span class="font-bold text-secondary text-2xl uppercase tracking-wide">{criterion.name}</span>
                    </div>
                    <!-- Hidden Input for Form Submission -->
                    <input type="hidden" name="score_{criterion.id}" value={scores[criterion.id]} />
                    
                    <div class="flex justify-between gap-2 p-1 bg-white/40 rounded-xl">
                        {#each [1, 2, 3, 4, 5] as val}
                            <button 
                                type="button"
                                class="flex-1 text-xl aspect-square rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-200 
                                {scores[criterion.id] === val ? 'bg-secondary text-offwhite shadow-lg scale-105' : 'bg-white text-secondary hover:bg-white/80'}"
                                onclick={() => scores[criterion.id] = val}
                            >
                                {val}
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}

            <div class="pt-8 text-center text-secondary/40 text-sm">
                Scroll down for comments →
            </div>

        </div>

        <!-- Bottom Action Bar -->
        <div class="flex-none p-4 bg-white/80 backdrop-blur-md border-t border-secondary/10 absolute bottom-0 w-full max-w-md">
            <button 
                type="submit"
                disabled={progress < totalCriteria}
                class="w-full py-3.5 px-6 bg-secondary text-offwhite font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <span>Next: Comments</span>
                <Icon icon="mdi:arrow-right" width="16" height="16" />
            </button>
        </div>
    </form>

</div>
