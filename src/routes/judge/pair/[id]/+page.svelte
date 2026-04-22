<script lang="ts">
    let { data, form } = $props();

    const { assignment, criteria, previousComment } = data;

    // projectA and projectB come from the pairAssignment include
    const projectA = (assignment as any).projectA;
    const projectB = (assignment as any).projectB;

    // Track selections per criterion
    let selections: Record<string, string> = $state({});
    let comment = $state('');
    let showSkipModal = $state(false);
    let skipReason = $state('');

    // Client-side validation
    let allSelected = $derived(
        criteria.every((c: any) => !!selections[c.id])
    );
    let canSubmit = $derived(allSelected && comment.trim().length > 0);
    let canSkip = $derived(skipReason.trim().length >= 2);
</script>

<div class="max-w-md mx-auto flex flex-col min-h-screen">
    <!-- Top Bar -->
    <div class="flex-none p-4 border-b border-white/10">
        <a href="/judge" class="text-sm font-medium text-white/60 hover:text-white">← Dashboard</a>
        <h1 class="text-xl font-bold text-white mt-2">Compare Projects</h1>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-6 pb-28">
        <!-- Previous Comment -->
        {#if previousComment}
            <div class="bg-white/5 border border-white/10 rounded-xl p-4">
                <p class="text-xs font-bold uppercase tracking-wider text-white/40 mb-1">Your previous comparison</p>
                <p class="text-white/70 text-sm italic">"{previousComment}"</p>
            </div>
        {/if}

        <!-- Project Cards -->
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-white/10 rounded-xl p-4">
                <p class="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">Project A</p>
                <p class="font-bold text-white">{projectA?.name ?? 'Project A'}</p>
                {#if projectA?.tableNumber}
                    <p class="text-xs text-white/50 mt-1">Table #{projectA.tableNumber}</p>
                {/if}
            </div>
            <div class="bg-white/10 rounded-xl p-4">
                <p class="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">Project B</p>
                <p class="font-bold text-white">{projectB?.name ?? 'Project B'}</p>
                {#if projectB?.tableNumber}
                    <p class="text-xs text-white/50 mt-1">Table #{projectB.tableNumber}</p>
                {/if}
            </div>
        </div>

        <!-- Error message -->
        {#if form?.message}
            <div class="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm">
                {form.message}
            </div>
        {/if}

        <!-- Main Submit Form -->
        <form method="POST" action="?/submit" id="submit-form" class="space-y-6">
            <!-- Hidden fields for selections -->
            {#each criteria as criterion (criterion.id)}
                {#if selections[criterion.id]}
                    <input type="hidden" name="result_{criterion.id}" value={selections[criterion.id]} />
                {/if}
            {/each}

            <!-- Criteria -->
            {#each criteria as criterion (criterion.id)}
                <div class="space-y-3">
                    <p class="font-bold text-white">Which was more <span class="text-white/90 italic">{criterion.name}</span>?</p>

                    <div class="space-y-2">
                        <!-- Project A -->
                        <label class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                            {selections[criterion.id] === 'A' ? 'bg-white/20 border border-white/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}">
                            <input
                                type="radio"
                                name="ui_result_{criterion.id}"
                                value="A"
                                class="sr-only"
                                onchange={() => selections[criterion.id] = 'A'}
                                checked={selections[criterion.id] === 'A'}
                            />
                            <span class="w-4 h-4 rounded-full border-2 flex-none
                                {selections[criterion.id] === 'A' ? 'border-white bg-white' : 'border-white/40'}">
                            </span>
                            <span class="text-white font-medium">{projectA?.name ?? 'Project A'}</span>
                        </label>

                        <!-- Project B -->
                        <label class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                            {selections[criterion.id] === 'B' ? 'bg-white/20 border border-white/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}">
                            <input
                                type="radio"
                                name="ui_result_{criterion.id}"
                                value="B"
                                class="sr-only"
                                onchange={() => selections[criterion.id] = 'B'}
                                checked={selections[criterion.id] === 'B'}
                            />
                            <span class="w-4 h-4 rounded-full border-2 flex-none
                                {selections[criterion.id] === 'B' ? 'border-white bg-white' : 'border-white/40'}">
                            </span>
                            <span class="text-white font-medium">{projectB?.name ?? 'Project B'}</span>
                        </label>

                        {#if criterion.allowOptOut}
                            <!-- Opt out A -->
                            <label class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                                {selections[criterion.id] === 'OPT_OUT_A' ? 'bg-white/20 border border-white/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}">
                                <input
                                    type="radio"
                                    name="ui_result_{criterion.id}"
                                    value="OPT_OUT_A"
                                    class="sr-only"
                                    onchange={() => selections[criterion.id] = 'OPT_OUT_A'}
                                    checked={selections[criterion.id] === 'OPT_OUT_A'}
                                />
                                <span class="w-4 h-4 rounded-full border-2 flex-none
                                    {selections[criterion.id] === 'OPT_OUT_A' ? 'border-white bg-white' : 'border-white/40'}">
                                </span>
                                <span class="text-white/60 text-sm">{projectA?.name ?? 'Project A'} didn't compete</span>
                            </label>

                            <!-- Opt out B -->
                            <label class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                                {selections[criterion.id] === 'OPT_OUT_B' ? 'bg-white/20 border border-white/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}">
                                <input
                                    type="radio"
                                    name="ui_result_{criterion.id}"
                                    value="OPT_OUT_B"
                                    class="sr-only"
                                    onchange={() => selections[criterion.id] = 'OPT_OUT_B'}
                                    checked={selections[criterion.id] === 'OPT_OUT_B'}
                                />
                                <span class="w-4 h-4 rounded-full border-2 flex-none
                                    {selections[criterion.id] === 'OPT_OUT_B' ? 'border-white bg-white' : 'border-white/40'}">
                                </span>
                                <span class="text-white/60 text-sm">{projectB?.name ?? 'Project B'} didn't compete</span>
                            </label>
                        {/if}
                    </div>
                </div>
            {/each}

            <!-- Comment / Notes -->
            <div class="space-y-2">
                <label for="comment" class="block font-bold text-white">Notes <span class="text-white/50">(required)</span></label>
                <textarea
                    id="comment"
                    name="comment"
                    bind:value={comment}
                    rows="4"
                    placeholder="Add your observations about both projects..."
                    class="w-full p-4 bg-white/5 border border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/30 text-white"
                ></textarea>
            </div>
        </form>
    </div>

    <!-- Bottom Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-castle-skyDeep/90 backdrop-blur-md border-t border-white/10">
        <div class="max-w-md mx-auto flex gap-3">
            <button
                type="submit"
                form="submit-form"
                disabled={!canSubmit}
                class="flex-1 py-3.5 px-6 bg-white text-castle-skyDeep font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Submit
            </button>
            <button
                type="button"
                onclick={() => { showSkipModal = true; skipReason = ''; }}
                class="py-3.5 px-4 bg-white/10 text-white/70 font-bold rounded-xl transition-all active:scale-[0.98] hover:bg-white/20 text-sm"
            >
                Can't find a project?
            </button>
        </div>
    </div>
</div>

<!-- Skip Modal -->
{#if showSkipModal}
    <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6">
        <div class="w-full max-w-md bg-castle-skyDeep rounded-2xl shadow-2xl border border-white/10 p-6 space-y-4">
            <div>
                <h2 class="text-lg font-bold text-white">Skip this pair?</h2>
                <p class="text-sm text-white/60 mt-1">Please explain why you can't judge this pair.</p>
            </div>

            <form method="POST" action="?/skip" class="space-y-4">
                <textarea
                    name="skipReason"
                    bind:value={skipReason}
                    rows="3"
                    placeholder="Reason for skipping (e.g. can't find one of the projects)..."
                    class="w-full p-3 bg-white/5 border border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/30 text-white text-sm"
                    autofocus
                ></textarea>
                <div class="flex gap-3">
                    <button
                        type="button"
                        onclick={() => showSkipModal = false}
                        class="flex-1 py-3 px-4 bg-white/10 text-white/70 font-bold rounded-xl transition-all hover:bg-white/20"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!canSkip}
                        class="flex-1 py-3 px-4 bg-white text-castle-skyDeep font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Skip Pair
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
