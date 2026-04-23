<script lang="ts">
    let { data, form } = $props();
    const { comparison, criteria } = data;

    const projectA = comparison.projectA;
    const projectB = comparison.projectB;

    // Client-side state
    let currentIndex = $state(0);
    let selections: Record<string, string> = $state({});
    let comment = $state('');
    let showReview = $state(false);

    const criterion = $derived(criteria[currentIndex]);
    const isFirst = $derived(currentIndex === 0);
    const isLast = $derived(currentIndex === criteria.length - 1);
    const currentAnswered = $derived(!!selections[criterion?.id]);
    const allAnswered = $derived(criteria.every((c) => !!selections[c.id]));
    const canSubmit = $derived(allAnswered && comment.trim().length > 0);

    function selectOption(value: string) {
        selections[criterion.id] = value;
    }

    function prev() {
        if (!isFirst) currentIndex--;
    }

    function next() {
        if (isLast) {
            showReview = true;
        } else {
            currentIndex++;
        }
    }

    function getCriterionName(id: string) {
        return criteria.find((c) => c.id === id)?.name ?? id;
    }

    function getSelectionLabel(criterionId: string): string {
        const val = selections[criterionId];
        if (!val) return '—';
        if (val === 'A') return projectA.name;
        if (val === 'B') return projectB.name;
        return val;
    }
</script>

<div class="max-w-md mx-auto p-4 flex flex-col min-h-screen">
    <!-- Header -->
    <div class="mb-4 mt-2">
        <a href="/judge" class="text-sm font-medium text-white/60 hover:text-white mb-3 block">← Dashboard</a>
        <h1 class="text-xl font-bold text-white mb-1">Compare Projects</h1>
        <p class="text-white/60 text-sm">
            {projectA.name} {projectA.tableNumber ? `(Table #${projectA.tableNumber})` : ''} vs {projectB.name} {projectB.tableNumber ? `(Table #${projectB.tableNumber})` : ''}
        </p>
    </div>

    {#if form?.message}
        <div class="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm mb-4">
            {form.message}
        </div>
    {/if}

    {#if !showReview}
        <!-- One-at-a-time category view -->
        <div class="flex-1 flex flex-col">
            <!-- Progress indicator -->
            <div class="flex gap-1 mb-6">
                {#each criteria as c, i}
                    <div class="h-1 flex-1 rounded-full {i === currentIndex ? 'bg-white' : selections[c.id] ? 'bg-white/40' : 'bg-white/10'}"></div>
                {/each}
            </div>

            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-sm flex-1 flex flex-col gap-5">
                <!-- Category label -->
                <div>
                    <p class="text-xs font-bold uppercase tracking-widest text-white/50">
                        Category {currentIndex + 1} of {criteria.length}
                    </p>
                    <p class="text-2xl font-bold text-white mt-1">{criterion.name}</p>
                    <p class="text-white/60 text-sm mt-1">Which project was more {criterion.name.toLowerCase()}?</p>
                </div>

                <!-- Main options -->
                <div class="space-y-3">
                    <!-- Project A -->
                    <button
                        type="button"
                        onclick={() => selectOption('A')}
                        class="w-full py-4 px-5 rounded-xl text-left font-bold text-lg transition-all active:scale-[0.98] border-2 {selections[criterion.id] === 'A' ? 'bg-white text-castle-skyDeep border-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}"
                    >
                        {projectA.name}
                        {#if projectA.tableNumber}
                            <span class="text-sm font-normal opacity-60 ml-2">Table #{projectA.tableNumber}</span>
                        {/if}
                    </button>

                    <!-- Project B -->
                    <button
                        type="button"
                        onclick={() => selectOption('B')}
                        class="w-full py-4 px-5 rounded-xl text-left font-bold text-lg transition-all active:scale-[0.98] border-2 {selections[criterion.id] === 'B' ? 'bg-white text-castle-skyDeep border-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}"
                    >
                        {projectB.name}
                        {#if projectB.tableNumber}
                            <span class="text-sm font-normal opacity-60 ml-2">Table #{projectB.tableNumber}</span>
                        {/if}
                    </button>

                </div>

                <!-- Navigation -->
                <div class="flex gap-3 mt-auto pt-2">
                    <button
                        type="button"
                        onclick={prev}
                        disabled={isFirst}
                        class="flex-1 py-3 px-4 bg-white/10 text-white font-bold rounded-xl transition-all active:scale-[0.98] hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ← Prev
                    </button>
                    <button
                        type="button"
                        onclick={next}
                        disabled={!currentAnswered}
                        class="flex-2 flex-1 py-3 px-4 font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed {isLast ? 'bg-white text-castle-skyDeep' : 'bg-white/20 text-white hover:bg-white/30'}"
                    >
                        {isLast ? 'Review & Submit →' : 'Next →'}
                    </button>
                </div>
            </div>
        </div>

    {:else}
        <!-- Review screen -->
        <div class="flex-1 flex flex-col gap-4">
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-sm">
                <h2 class="text-lg font-bold text-white mb-3">Review Your Selections</h2>
                <div class="space-y-2">
                    {#each criteria as c}
                        <div class="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                            <span class="text-white/60 text-sm">{c.name}</span>
                            <button
                                type="button"
                                onclick={() => { showReview = false; currentIndex = criteria.indexOf(c); }}
                                class="text-right"
                            >
                                <span class="font-medium text-white text-sm">{getSelectionLabel(c.id)}</span>
                                <span class="text-white/40 text-xs block">tap to change</span>
                            </button>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Comment -->
            <form method="POST" action="?/submit" class="flex flex-col gap-4">
                <!-- Hidden result fields -->
                {#each criteria as c}
                    <input type="hidden" name="result_{c.id}" value={selections[c.id] ?? ''} />
                {/each}

                <div class="space-y-2">
                    <label for="comment" class="block font-bold text-white">
                        Overall Notes <span class="text-white/50">(required)</span>
                    </label>
                    <textarea
                        id="comment"
                        name="comment"
                        bind:value={comment}
                        rows="4"
                        placeholder="Add your overall observations comparing both projects..."
                        class="w-full p-4 bg-white/5 border border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/30 text-white"
                    ></textarea>
                </div>

                <div class="flex gap-3">
                    <button
                        type="button"
                        onclick={() => showReview = false}
                        class="py-3.5 px-4 bg-white/10 text-white/70 font-bold rounded-xl transition-all hover:bg-white/20"
                    >
                        ← Back
                    </button>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        class="flex-1 py-3.5 px-6 bg-white text-castle-skyDeep font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Submit Comparison
                    </button>
                </div>
            </form>
        </div>
    {/if}
</div>
