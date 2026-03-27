<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { onMount } from "svelte";
    import Button from "$components/Button.svelte";
    import Icon from "@iconify/svelte";
    import Modal from "$components/Modal.svelte";

    let { data } = $props();

    let isClearing = $state(false);
    let isEmailing = $state(false);
    let showEmailModal = $state(false);
    let emailForm: HTMLFormElement;

    let showSingleEmailModal = $state(false);
    let selectedTeamId = $state<string>("");
    let selectedTeamName = $state<string>("");
    let isSendingSingleEmail = $state(false);
    let singleEmailForm: HTMLFormElement;

    let toggledOptional = $state<string[]>([]);
    // sortBy: 'display' uses the current display score; a criterion id sorts by that optional column
    let sortBy = $state('display');
    let expandAll = $state(false);
    let viewMode = $state<'tracks' | 'overall'>('tracks');

    let allResults = $derived(
        getSortedResults(Object.values(data.results).flat())
    );

    const THEME_MATCH_ID = $derived(data.optionalCriteria.find(c => c.slug === 'theme-match')?.id ?? null);
    const THEME_THRESHOLD = 3.5;

    function toggleOptional(criterionId: string) {
        if (toggledOptional.includes(criterionId)) {
            toggledOptional = toggledOptional.filter(id => id !== criterionId);
        } else {
            toggledOptional = [...toggledOptional, criterionId];
        }
        if (sortBy !== 'display') sortBy = 'display';
    }

    function getDisplayScore(result: { coreScore: number; optionalScores: Record<string, number | null> }): number {
        let score = result.coreScore;
        for (const id of toggledOptional) {
            score += result.optionalScores[id] ?? 0;
        }
        return score;
    }

    function getSortedResults(results: (typeof data.results)[string]) {
        return [...results].sort((a, b) => {
            if (sortBy === 'display') {
                return getDisplayScore(b) - getDisplayScore(a);
            }
            const aScore = a.optionalScores[sortBy] ?? -Infinity;
            const bScore = b.optionalScores[sortBy] ?? -Infinity;
            // Theme Match: qualify at ≥3.5, rank by theme, tiebreak by core
            if (sortBy === THEME_MATCH_ID) {
                const aQualifies = aScore >= THEME_THRESHOLD;
                const bQualifies = bScore >= THEME_THRESHOLD;
                if (aQualifies !== bQualifies) return aQualifies ? -1 : 1;
                if (aScore !== bScore) return bScore - aScore;
                return b.coreScore - a.coreScore;
            }
            return bScore - aScore;
        });
    }

    function belowThreshold(result: (typeof data.results)[string][number]): boolean {
        if (sortBy !== THEME_MATCH_ID) return false;
        const score = result.optionalScores[THEME_MATCH_ID!] ?? -Infinity;
        return score < THEME_THRESHOLD;
    }

    const handleEmailConfirm = () => {
        if (emailForm) emailForm.requestSubmit();
        showEmailModal = false;
    };

    const handleSingleEmailConfirm = () => {
        if (singleEmailForm) singleEmailForm.requestSubmit();
        showSingleEmailModal = false;
    };

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

<Modal
    open={showEmailModal}
    title="Email All Teams?"
    message="This will send an email to ALL team members with their score breakdown and comments. This action cannot be undone."
    confirmText="Send Emails"
    onConfirm={handleEmailConfirm}
    onCancel={() => showEmailModal = false}
/>

<Modal
    open={showSingleEmailModal}
    title={`Email ${selectedTeamName}?`}
    message="This will send an email to the team members with their score breakdown and comments."
    confirmText={isSendingSingleEmail ? "Sending..." : "Send Email"}
    onConfirm={handleSingleEmailConfirm}
    onCancel={() => showSingleEmailModal = false}
/>

<!-- Hidden form for single team email -->
<form method="POST" action="?/emailTeam" bind:this={singleEmailForm} use:enhance={() => {
    isSendingSingleEmail = true;
    return async ({ update }) => {
        isSendingSingleEmail = false;
        await update();
        alert(`Email sent to ${selectedTeamName} successfully!`);
    };
}} class="hidden">
    <input type="hidden" name="id" value={selectedTeamId} />
</form>

<div class="p-6 pt-24 min-h-screen">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold font-serif text-secondary">Results & Scores</h1>
            <p class="text-secondary/70">Live ranking of teams based on average judge scores.</p>
        </div>

        <div class="flex gap-2">
            <!-- Email Form (Hidden) -->
            <form method="POST" action="?/emailResults" bind:this={emailForm} use:enhance={() => {
                isEmailing = true;
                return async ({ update }) => {
                    isEmailing = false;
                    await update();
                    alert("Emails sent successfully!");
                };
            }} class="hidden"></form>

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

            <button
                onclick={() => expandAll = !expandAll}
                class="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors font-bold text-sm"
            >
                <Icon icon={expandAll ? "mdi:chevron-up" : "mdi:chevron-down"} />
                {expandAll ? "Collapse All" : "Expand All"}
            </button>

            <button
                onclick={() => showEmailModal = true}
                disabled={isEmailing}
                class="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-bold text-sm disabled:opacity-50"
            >
                <Icon icon="mdi:email-outline" />
                {isEmailing ? "Sending..." : "Email Results"}
            </button>

            <form method="POST" action="?/clearAll" use:enhance={() => {
                if(!confirmClear()) return ({ update }) => update({ reset: false });
                isClearing = true;
                return async ({ update }) => {
                    isClearing = false;
                    await update();
                };
            }}>
                <button class="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-bold text-sm">
                    <Icon icon="mdi:trash-can-outline" />
                    Clear All Scores
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
                            <th class="p-4 font-bold text-center w-24">Judges</th>
                            {#each data.optionalCriteria as criterion}
                                {#if toggledOptional.includes(criterion.id) || sortBy === criterion.id}
                                    <th class="p-4 font-bold text-right w-32 text-accent/70">{criterion.name}</th>
                                {/if}
                            {/each}
                            <th class="p-4 font-bold text-right w-32">
                                {toggledOptional.length > 0 ? 'Score' : 'Final Score'}
                            </th>
                            <th class="p-4 font-bold text-right w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-secondary/5">
                        {#each results as result, i}
                            <tr class="hover:bg-white/50 transition-colors {belowThreshold(result) ? 'opacity-30' : ''}">
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
                                                ? result.optionalScores[criterion.id]!.toFixed(2)
                                                : '—'}
                                        </td>
                                    {/if}
                                {/each}
                                <td class="p-4 text-right font-mono font-bold text-lg text-accent">
                                    {getDisplayScore(result).toFixed(2)}
                                </td>
                                <td class="p-4 text-right">
                                    <button
                                        onclick={() => {
                                            selectedTeamId = result.id;
                                            selectedTeamName = result.name;
                                            showSingleEmailModal = true;
                                        }}
                                        class="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                        title="Send feedback email to this team"
                                    >
                                        Email
                                    </button>
                                </td>
                            </tr>
                            {#if expandAll && result.judgeBreakdowns.length > 0}
                                <tr class="bg-secondary/[0.02]">
                                    <td colspan="99" class="px-8 pb-4 pt-2">
                                        <div class="flex flex-wrap gap-4">
                                            {#each result.judgeBreakdowns as breakdown}
                                                {#if breakdown.skipped}
                                                    <div class="bg-white/40 rounded-lg border border-secondary/10 p-3 text-xs min-w-40 opacity-50">
                                                        <div class="flex items-center gap-1.5 mb-2">
                                                            <p class="font-bold text-secondary/60">{breakdown.judgeName}</p>
                                                            <span class="text-[10px] px-1 py-0.5 bg-secondary/10 text-secondary/50 rounded font-bold uppercase tracking-wide">Skipped</span>
                                                        </div>
                                                        {#if breakdown.skipReason}
                                                            <p class="text-secondary/50 italic">{breakdown.skipReason}</p>
                                                        {/if}
                                                    </div>
                                                {:else}
                                                    <div class="bg-white/80 rounded-lg border border-secondary/10 p-3 text-xs min-w-40">
                                                        <p class="font-bold text-secondary mb-2">{breakdown.judgeName}</p>
                                                        {#each breakdown.scores as score}
                                                            <div class="flex justify-between gap-4 text-secondary/70">
                                                                <span class="{score.isOptional ? 'italic text-accent/60' : ''}">
                                                                    {score.criterionName}{score.isOptional ? ' *' : ''}
                                                                </span>
                                                                <span class="font-mono font-bold text-secondary">{score.curvedScore.toFixed(1)}</span>
                                                            </div>
                                                        {/each}
                                                        {#if breakdown.comment}
                                                            <p class="mt-2 pt-2 border-t border-secondary/10 text-secondary/60 italic">{breakdown.comment}</p>
                                                        {/if}
                                                    </div>
                                                {/if}
                                            {/each}
                                        </div>
                                    </td>
                                </tr>
                            {/if}
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
