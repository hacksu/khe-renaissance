<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { onMount } from "svelte";
    import Icon from "@iconify/svelte";

    let { data } = $props();

    let isClearing = $state(false);
    let toggledOptional = $state<string[]>([]);
    let sortBy = $state('display');
    let viewMode = $state<'tracks' | 'overall'>('overall');

    let allResults = $derived(
        getSortedResults(Object.values(data.results).flat())
    );

    function getDisplayScore(result: { coreScore: number; optionalScores: Record<string, number | null> }): number {
        let score = result.coreScore;
        for (const id of toggledOptional) {
            score += result.optionalScores[id] ?? 0;
        }
        return score;
    }

    function getSortedResults(results: typeof allResults) {
        return [...results].sort((a, b) => {
            if (sortBy === 'display') return getDisplayScore(b) - getDisplayScore(a);
            const aScore = a.optionalScores[sortBy] ?? -Infinity;
            const bScore = b.optionalScores[sortBy] ?? -Infinity;
            return bScore - aScore;
        });
    }

    function toggleOptional(criterionId: string) {
        if (toggledOptional.includes(criterionId)) {
            toggledOptional = toggledOptional.filter(id => id !== criterionId);
        } else {
            toggledOptional = [...toggledOptional, criterionId];
        }
        if (sortBy !== 'display') sortBy = 'display';
    }

    const confirmClear = () =>
        confirm("Are you sure? This will delete ALL pairwise comparisons and CrowdBT state. This cannot be undone.");

    onMount(() => {
        const interval = setInterval(() => invalidateAll(), 5000);
        return () => clearInterval(interval);
    });
</script>

<div class="p-6 pt-24 min-h-screen">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold font-serif text-secondary">Results & Rankings</h1>
            <p class="text-secondary/70">Live pairwise ranking via CrowdBT algorithm.</p>
        </div>

        <div class="flex gap-2">
            <!-- By Track / Overall toggle -->
            <div class="flex items-center rounded-lg overflow-hidden border border-secondary/15 text-sm font-bold">
                <button
                    onclick={() => viewMode = 'tracks'}
                    class="px-3 py-2 transition-colors {viewMode === 'tracks' ? 'bg-secondary text-white' : 'bg-white/60 text-secondary/60 hover:bg-secondary/10'}"
                >
                    By Track
                </button>
                <button
                    onclick={() => viewMode = 'overall'}
                    class="px-3 py-2 transition-colors {viewMode === 'overall' ? 'bg-secondary text-white' : 'bg-white/60 text-secondary/60 hover:bg-secondary/10'}"
                >
                    Overall
                </button>
            </div>

            <form method="POST" action="?/clearAll" use:enhance={() => {
                if (!confirmClear()) return ({ update }: { update: () => void }) => update();
                isClearing = true;
                return async ({ update }: { update: () => void }) => {
                    isClearing = false;
                    await update();
                };
            }}>
                <button
                    disabled={isClearing}
                    class="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-bold text-sm disabled:opacity-50"
                >
                    <Icon icon="mdi:trash-can-outline" />
                    {isClearing ? "Clearing..." : "Clear All Scores"}
                </button>
            </form>
        </div>
    </div>

    <!-- Optional criteria toggles -->
    {#if data.optionalCriteria.length > 0}
        <div class="flex flex-wrap items-center gap-2 mb-6">
            <span class="text-xs font-bold text-secondary/50 uppercase tracking-widest">Include in score:</span>
            {#each data.optionalCriteria as criterion}
                {@const isToggled = toggledOptional.includes(criterion.id)}
                {@const isSorting = sortBy === criterion.id}
                <div class="flex items-center rounded-lg overflow-hidden border border-secondary/15 text-sm font-bold">
                    <button
                        onclick={() => toggleOptional(criterion.id)}
                        class="px-3 py-1.5 transition-colors {isToggled ? 'bg-accent text-white' : 'bg-white/60 text-secondary/60 hover:bg-secondary/10'}"
                    >
                        {isToggled ? '✓' : '+'} {criterion.name}
                    </button>
                    <button
                        onclick={() => sortBy = isSorting ? 'display' : criterion.id}
                        class="px-2 py-1.5 border-l border-secondary/15 transition-colors {isSorting ? 'bg-accent/20 text-accent' : 'bg-white/40 text-secondary/40 hover:bg-secondary/10'}"
                        title="Sort by {criterion.name}"
                    >
                        <Icon icon={isSorting ? "mdi:sort-descending" : "mdi:sort"} class="w-3.5 h-3.5" />
                    </button>
                </div>
            {/each}
            {#if sortBy !== 'display'}
                <button
                    onclick={() => sortBy = 'display'}
                    class="text-xs px-2 py-1 text-secondary/50 hover:text-secondary transition-colors"
                >
                    Reset sort
                </button>
            {/if}
        </div>
    {/if}

    <!-- Leaderboard -->
    <div class="space-y-12">

        {#snippet resultsTable(results: typeof allResults, showTrack: boolean)}
            <div class="bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-secondary/5 border-b border-secondary/10 text-secondary/60 uppercase tracking-widest text-xs">
                        <tr>
                            <th class="p-4 font-bold w-16 text-center">Rank</th>
                            <th class="p-4 font-bold">Team</th>
                            {#if showTrack}<th class="p-4 font-bold">Track</th>{/if}
                            <th class="p-4 font-bold text-center w-24">Comparisons</th>
                            {#each data.optionalCriteria as criterion}
                                {#if toggledOptional.includes(criterion.id) || sortBy === criterion.id}
                                    <th class="p-4 font-bold text-right w-32 text-accent/70">{criterion.name}</th>
                                {/if}
                            {/each}
                            <th class="p-4 font-bold text-right w-32">
                                {toggledOptional.length > 0 ? 'Score' : 'Core Score'}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-secondary/5">
                        {#each results as result, i}
                            <tr class="hover:bg-white/50 transition-colors">
                                <td class="p-4 font-mono text-secondary/50 text-center">#{i + 1}</td>
                                <td class="p-4 font-bold text-secondary">
                                    {result.name}{#if result.tableNumber} <span class="font-normal text-secondary/50">(#{result.tableNumber})</span>{/if}
                                </td>
                                {#if showTrack}
                                    <td class="p-4 text-xs text-secondary/60 font-mono">{result.track}</td>
                                {/if}
                                <td class="p-4 text-center">
                                    <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 text-xs font-bold text-secondary">
                                        {result.judgementCount}
                                    </span>
                                </td>
                                {#each data.optionalCriteria as criterion}
                                    {#if toggledOptional.includes(criterion.id) || sortBy === criterion.id}
                                        <td class="p-4 text-right font-mono text-sm text-accent/70">
                                            {result.optionalScores[criterion.id] != null
                                                ? result.optionalScores[criterion.id]!.toFixed(4)
                                                : '—'}
                                        </td>
                                    {/if}
                                {/each}
                                <td class="p-4 text-right font-mono font-bold text-lg text-accent">
                                    {getDisplayScore(result).toFixed(4)}
                                </td>
                            </tr>
                        {/each}
                        {#if results.length === 0}
                            <tr>
                                <td colspan="99" class="p-8 text-center text-secondary/40 italic">No scores recorded yet.</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        {/snippet}

        {#if viewMode === 'overall'}
            <div class="space-y-4">
                <div class="flex items-center gap-4">
                    <h2 class="text-xl font-bold font-serif text-secondary">Overall</h2>
                    <div class="h-px flex-1 bg-secondary/10"></div>
                </div>
                {@render resultsTable(allResults, true)}
            </div>
        {:else}
            {#each Object.entries(data.results) as [track, results]}
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <h2 class="text-xl font-bold font-serif text-secondary">{track}</h2>
                        <div class="h-px flex-1 bg-secondary/10"></div>
                    </div>
                    {@render resultsTable(getSortedResults(results), false)}
                </div>
            {/each}
            {#if Object.keys(data.results).length === 0}
                <div class="text-center py-20 text-secondary/40 italic">No projects found.</div>
            {/if}
        {/if}
    </div>
</div>
