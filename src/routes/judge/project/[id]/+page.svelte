<script lang="ts">
    import Icon from "@iconify/svelte";

    let { data } = $props();
    const { project, criteria } = data;

    interface ScoreMap { [key: string]: number; }

    let initialScores: ScoreMap = {};
    if (data.judgement?.scores) {
        data.judgement.scores.forEach((s: any) => { initialScores[s.criterionId] = s.score; });
    }
    criteria.forEach((c: any) => { if (initialScores[c.id] === undefined) initialScores[c.id] = 0; });

    let scores: ScoreMap = $state(initialScores);
    let comment = $state(data.judgement?.comment || "");

    let requiredCriteria = criteria.filter((c: any) => !c.optional);
    let requiredProgress = $derived(requiredCriteria.filter((c: any) => scores[c.id] > 0).length);
    let canSubmit = $derived(requiredProgress >= requiredCriteria.length);

    let elapsed = $state(0);
    const totalSeconds = (data.timePerTable ?? 0) * 60;

    const pct = $derived(totalSeconds > 0 ? elapsed / totalSeconds : 0);
    const timerOver = $derived(totalSeconds > 0 && elapsed >= totalSeconds);
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    $effect(() => {
        if (!data.timePerTable) return;

        const key = `judge_timer_${project.id}`;
        let start = parseInt(localStorage.getItem(key) ?? '');
        if (isNaN(start)) {
            start = Date.now();
            localStorage.setItem(key, String(start));
        }

        elapsed = Math.floor((Date.now() - start) / 1000);
        const interval = setInterval(() => {
            elapsed = Math.floor((Date.now() - start) / 1000);
        }, 1000);

        return () => clearInterval(interval);
    });
</script>

<style>
    @keyframes flash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
    .timer-flash { animation: flash 1s ease-in-out infinite; }
</style>

<div class="max-w-md mx-auto flex flex-col h-screen bg-sand overflow-hidden">
    
    <!-- Top Bar -->
    <div class="flex-none p-4 bg-sand border-b border-secondary/10 z-10">
        <div class="flex items-center justify-between mb-2">
            <a href="/judge" class="text-sm font-medium text-secondary/60 hover:text-primary">← Dashboard</a>
            {#if data.timePerTable}
                <span class="text-sm font-mono font-bold tabular-nums px-2 py-0.5 rounded-md
                    {timerOver ? 'bg-red-500 text-white timer-flash' :
                     pct >= 0.75 ? 'bg-red-100 text-red-600' :
                     pct >= 0.5  ? 'bg-orange-100 text-orange-600' :
                     'bg-secondary/10 text-secondary/70'}">
                    {formatTime(elapsed)} / {formatTime(totalSeconds)}
                </span>
            {:else}
                <span class="text-xs font-bold uppercase text-secondary/40">Judging</span>
            {/if}
        </div>
        <h1 class="text-xl font-bold text-secondary truncate">
            {project.name}{#if project.tableNumber} <span class="font-normal text-secondary/50">(#{project.tableNumber})</span>{/if}
        </h1>
        <p class="text-xs text-secondary/70 truncate">{project.track}</p>
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
                    {#if scores[criterion.id] > 0}
                        <button
                            type="button"
                            class="text-xs text-secondary/40 hover:text-secondary/70 transition-colors"
                            onclick={() => scores[criterion.id] = 0}
                        >
                            Reset
                        </button>
                    {/if}
                </div>
            {/each}

            <!-- Comment Section -->
            <div class="pt-8 border-t border-secondary/10">
                <h2 class="text-xl font-bold font-serif text-secondary mb-2">Comments</h2>
                <p class="text-secondary/60 text-sm mb-4">Optional feedback for <span class="font-bold">{project.name}{#if project.tableNumber} (#{project.tableNumber}){/if}</span></p>
                
                <textarea
                    name="comment"
                    class="w-full h-32 p-4 bg-white/50 border border-secondary/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-secondary/20 placeholder:text-secondary/30 text-secondary"
                    placeholder="Add feedback, suggestions, or mentions of what you liked..."
                    bind:value={comment}
                ></textarea>
            </div>

        </div>

        <!-- Bottom Action Bar -->
        <div class="flex-none p-4 bg-white/80 backdrop-blur-md border-t border-secondary/10 absolute bottom-0 w-full max-w-md flex gap-3">
            <button
                type="submit"
                disabled={!canSubmit}
                class="flex-1 py-3.5 px-6 bg-secondary text-offwhite font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Icon icon="mdi:check" width="20" height="20" />
                <span>Submit Score</span>
            </button>
            <button
                type="submit"
                formaction="?/skip"
                class="py-3.5 px-4 bg-secondary/10 text-secondary/70 font-bold rounded-xl transition-all active:scale-[0.98] hover:bg-secondary/20 flex items-center justify-center gap-1"
                title="Skip this project"
            >
                <Icon icon="mdi:skip-next" width="20" height="20" />
                <span>Skip</span>
            </button>
        </div>
    </form>

</div>
