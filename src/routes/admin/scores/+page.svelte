<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { onMount } from "svelte";
    import Icon from "@iconify/svelte";

    let { data } = $props();

    let isClearing = $state(false);
    let activeTab = $state<string>('overall');

    // All tracks derived from results
    let tracks = $derived(Object.keys(data.results));

    // All results flattened and sorted by totalScore descending
    let allResults = $derived(
        Object.values(data.results).flat().sort((a, b) => b.totalScore - a.totalScore)
    );

    // Opt-out criteria that have data in optOutRankings
    let optOutCriteriaWithData = $derived(
        data.criteria.filter(
            (c: { id: string; allowOptOut: boolean }) =>
                c.allowOptOut && data.optOutRankings[c.id]?.length > 0
        )
    );

    const confirmClear = () => {
        return confirm("Are you sure? This will delete ALL judgements and assignments. This cannot be undone.");
    };

    onMount(() => {
        const interval = setInterval(() => {
            invalidateAll();
        }, 5000);
        return () => clearInterval(interval);
    });
</script>

<div class="p-6 pt-24 min-h-screen">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold font-serif text-secondary">Results & Rankings</h1>
            <p class="text-secondary/70">Live pairwise ranking of teams via CrowdBT algorithm.</p>
        </div>

        <div class="flex gap-2">
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

    <!-- Tab Bar -->
    <div class="flex items-center gap-1 mb-6 border-b border-secondary/10 overflow-x-auto">
        <button
            onclick={() => activeTab = 'overall'}
            class="px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px
                {activeTab === 'overall'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-secondary/50 hover:text-secondary'}"
        >
            Overall
        </button>
        {#each tracks as track}
            <button
                onclick={() => activeTab = track}
                class="px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px
                    {activeTab === track
                        ? 'border-accent text-accent'
                        : 'border-transparent text-secondary/50 hover:text-secondary'}"
            >
                {track}
            </button>
        {/each}
    </div>

    <!-- Results Table -->
    {#snippet rankTable(results: typeof allResults, topN: number)}
        <div class="bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-secondary/5 border-b border-secondary/10 text-secondary/60 uppercase tracking-widest text-xs">
                    <tr>
                        <th class="p-4 font-bold w-16 text-center">Rank</th>
                        <th class="p-4 font-bold">Project</th>
                        <th class="p-4 font-bold">Track</th>
                        <th class="p-4 font-bold text-center w-24">Table #</th>
                        <th class="p-4 font-bold text-right w-32">Total Score</th>
                        <th class="p-4 font-bold text-right w-28">Comparisons</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-secondary/5">
                    {#each results as result, i}
                        {@const isTop = i < topN}
                        <tr class="hover:bg-white/50 transition-colors {isTop ? 'bg-accent/5' : ''}">
                            <td class="p-4 text-center">
                                {#if i === 0}
                                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-400 text-white text-xs font-bold shadow">1</span>
                                {:else if i === 1 && topN >= 2}
                                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400 text-white text-xs font-bold shadow">2</span>
                                {:else if i === 2 && topN >= 3}
                                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-bold shadow">3</span>
                                {:else}
                                    <span class="font-mono text-secondary/50">#{i + 1}</span>
                                {/if}
                            </td>
                            <td class="p-4">
                                <span class="font-bold text-secondary {isTop ? 'font-extrabold' : ''}">{result.name}</span>
                            </td>
                            <td class="p-4 text-xs text-secondary/60 font-mono">{result.track}</td>
                            <td class="p-4 text-center text-secondary/60 font-mono">
                                {result.tableNumber ?? '—'}
                            </td>
                            <td class="p-4 text-right font-mono font-bold text-lg text-accent">
                                {result.totalScore.toFixed(4)}
                            </td>
                            <td class="p-4 text-right">
                                <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-secondary/10 text-xs font-bold text-secondary">
                                    {Object.values(result.criterionScores).length}
                                </span>
                            </td>
                        </tr>
                    {/each}
                    {#if results.length === 0}
                        <tr>
                            <td colspan="6" class="p-8 text-center text-secondary/40 italic">No scores recorded yet.</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    {/snippet}

    <!-- Tab Content -->
    {#if activeTab === 'overall'}
        {@render rankTable(allResults, 5)}
    {:else}
        {@const trackResults = (data.results[activeTab] ?? []).slice().sort((a: typeof allResults[0], b: typeof allResults[0]) => b.totalScore - a.totalScore)}
        {@render rankTable(trackResults, 3)}
    {/if}

    <!-- Opt-out Criterion Sections -->
    {#if optOutCriteriaWithData.length > 0}
        <div class="mt-12 space-y-8">
            <div class="flex items-center gap-4">
                <h2 class="text-xl font-bold font-serif text-secondary">Special Awards</h2>
                <div class="h-px flex-1 bg-secondary/10"></div>
            </div>

            {#each optOutCriteriaWithData as criterion}
                {@const rankings = data.optOutRankings[criterion.id] ?? []}
                <div class="space-y-3">
                    <h3 class="text-lg font-bold text-secondary">Best {criterion.name}</h3>
                    <div class="bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm overflow-hidden">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-secondary/5 border-b border-secondary/10 text-secondary/60 uppercase tracking-widest text-xs">
                                <tr>
                                    <th class="p-4 font-bold w-16 text-center">Rank</th>
                                    <th class="p-4 font-bold">Project</th>
                                    <th class="p-4 font-bold">Track</th>
                                    <th class="p-4 font-bold text-right w-32">{criterion.name} Score</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-secondary/5">
                                {#each rankings as result, i}
                                    <tr class="hover:bg-white/50 transition-colors {i === 0 ? 'bg-yellow-50' : ''}">
                                        <td class="p-4 text-center">
                                            {#if i === 0}
                                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400 text-white text-xs font-bold shadow">
                                                    <Icon icon="mdi:trophy" class="w-3 h-3" /> Winner
                                                </span>
                                            {:else}
                                                <span class="font-mono text-secondary/50">#{i + 1}</span>
                                            {/if}
                                        </td>
                                        <td class="p-4 font-bold text-secondary {i === 0 ? 'font-extrabold' : ''}">{result.name}</td>
                                        <td class="p-4 text-xs text-secondary/60 font-mono">{result.track}</td>
                                        <td class="p-4 text-right font-mono font-bold text-accent">
                                            {(result.criterionScores[criterion.id] ?? 0).toFixed(4)}
                                        </td>
                                    </tr>
                                {/each}
                                {#if rankings.length === 0}
                                    <tr>
                                        <td colspan="4" class="p-8 text-center text-secondary/40 italic">No data yet.</td>
                                    </tr>
                                {/if}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
