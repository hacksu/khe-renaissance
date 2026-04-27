<script lang="ts">
    let { data, form } = $props();
    const { visit, optionalCriteria } = data;
    const project = visit.project;

    let feedback = $state('');
    let canSubmit = $derived(feedback.trim().length > 0);
</script>

<div class="max-w-md mx-auto p-4 flex flex-col min-h-screen">
    <!-- Header -->
    <div class="mb-6 mt-2">
        <a href="/judge/table/{visit.id}" class="text-sm font-medium text-white/60 hover:text-white mb-4 block">← Back to Timer</a>
        <h1 class="text-2xl font-bold text-white mb-1">
            Table {project.tableNumber ? `#${project.tableNumber}` : ''} — {project.name}
        </h1>
        <p class="text-white/60">Submit your feedback for this team</p>
    </div>

    {#if form?.message}
        <div class="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm mb-4">
            {form.message}
        </div>
    {/if}

    <form method="POST" action="?/submit" class="flex flex-col flex-1 gap-4">
        <!-- Hidden field listing all optional criterion IDs so the server can diff against checked ones -->
        <input type="hidden" name="optionalCriterionIds" value={optionalCriteria.map(c => c.id).join(',')} />

        {#if optionalCriteria.length > 0}
            <div class="space-y-3">
                <div>
                    <p class="font-bold text-white">Optional Categories</p>
                    <p class="text-white/50 text-sm mt-0.5">Check any categories this team attempted</p>
                </div>
                {#each optionalCriteria as criterion}
                    <label class="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                        <input
                            type="checkbox"
                            name="attempted_{criterion.id}"
                            class="w-5 h-5 rounded accent-white cursor-pointer"
                        />
                        <span class="text-white font-medium">{criterion.name}</span>
                    </label>
                {/each}
            </div>
        {/if}

        <div class="space-y-2">
            <label for="feedback" class="block font-bold text-white">
                Feedback for this team <span class="text-white/50">(required)</span>
            </label>
            <textarea
                id="feedback"
                name="feedback"
                bind:value={feedback}
                rows="6"
                placeholder="Share your observations about this project's presentation, demo, and team..."
                class="w-full p-4 bg-white/5 border border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/30 text-white"
            ></textarea>
        </div>

        <button
            type="submit"
            disabled={!canSubmit}
            class="w-full py-4 px-6 bg-white text-castle-skyDeep font-bold rounded-xl text-lg shadow-lg transition-all active:scale-[0.98] hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
            Submit Feedback
        </button>
    </form>
</div>
