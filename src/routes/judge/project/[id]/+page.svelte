<script lang="ts">
    import Icon from "@iconify/svelte";
    
    let { data } = $props();
    const { project, criteria } = data;

    // --- State ---
    interface ScoreMap {
        [key: string]: number;
    }
    
    // Initialize scores map: id -> score
    let initialScores: ScoreMap = {};
    if (data.judgement?.scores) {
        data.judgement.scores.forEach((s: any) => {
            initialScores[s.criterionId] = s.score;
        });
    }

    // Default 0 for unassigned
    criteria.forEach((c: any) => {
        if (initialScores[c.id] === undefined) initialScores[c.id] = 0;
    });

    let scores: ScoreMap = $state(initialScores);
    let comment = $state(data.judgement?.comment || "");

    let requiredCriteria = criteria.filter((c: any) => !c.optional);
    let progress = $derived(
        Object.values(scores).filter(s => s > 0).length
    );
    let requiredProgress = $derived(
        requiredCriteria.filter((c: any) => scores[c.id] > 0).length
    );
    let totalCriteria = criteria.length;
    let progressPercent = $derived((progress / totalCriteria) * 100);
    let canSubmit = $derived(requiredProgress >= requiredCriteria.length);

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
                        {#if criterion.optional}
                            <span class="text-xs bg-secondary/10 text-secondary/60 px-1.5 py-0.5 rounded font-bold">Optional</span>
                        {/if}
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

            <!-- Comment Section -->
            <div class="pt-8 border-t border-secondary/10">
                <h2 class="text-xl font-bold font-serif text-secondary mb-2">Comments</h2>
                <p class="text-secondary/60 text-sm mb-4">Optional feedback for <span class="font-bold">{project.name}</span></p>
                
                <textarea
                    name="comment"
                    class="w-full h-32 p-4 bg-white/50 border border-secondary/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-secondary/20 placeholder:text-secondary/30 text-secondary"
                    placeholder="Add feedback, suggestions, or mentions of what you liked..."
                    bind:value={comment}
                ></textarea>
            </div>

        </div>

        <!-- Bottom Action Bar -->
        <div class="flex-none p-4 bg-white/80 backdrop-blur-md border-t border-secondary/10 absolute bottom-0 w-full max-w-md">
            <button 
                type="submit"
                disabled={!canSubmit}
                class="w-full py-3.5 px-6 bg-secondary text-offwhite font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Icon icon="mdi:check" width="20" height="20" />
                <span>Submit Score</span>
            </button>
        </div>
    </form>

</div>
