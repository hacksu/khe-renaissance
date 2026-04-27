<script lang="ts">
    import { page } from "$app/stores";

    let { data } = $props();
    const judgeName = $page.data.session?.user?.name || "Judge";
    const { visit } = data;
</script>

<div class="max-w-md mx-auto p-4 flex flex-col min-h-screen">
    <!-- Header -->
    <div class="mb-6 mt-2">
        <a href="/" class="text-sm font-medium text-white/60 hover:text-white mb-4 block">← Back to Home</a>
        <h1 class="text-2xl font-bold text-white mb-1">Judging Dashboard</h1>
        <p class="text-white/80">Welcome, {judgeName}</p>
    </div>

    {#if visit}
        <div class="mb-6">
            <h2 class="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Your Next Table</h2>
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-sm space-y-4">
                <div>
                    <p class="text-3xl font-bold text-white">{visit.project.name}</p>
                    {#if visit.project.tableNumber}
                        <p class="text-white/60 mt-1 text-lg">Table #{visit.project.tableNumber}</p>
                    {/if}
                </div>

                {#if visit.status === 'active'}
                    <a
                        href="/judge/table/{visit.id}"
                        class="block w-full py-3.5 px-6 bg-white text-castle-skyDeep font-bold rounded-xl text-center shadow-lg transition-all active:scale-[0.98] hover:bg-white/90"
                    >
                        Continue Judging →
                    </a>
                {:else}
                    <form method="POST" action="?/start">
                        <input type="hidden" name="visitId" value={visit.id} />
                        <button
                            type="submit"
                            class="w-full py-3.5 px-6 bg-white text-castle-skyDeep font-bold rounded-xl text-center shadow-lg transition-all active:scale-[0.98] hover:bg-white/90"
                        >
                            Start Judging →
                        </button>
                    </form>
                {/if}
            </div>
        </div>
    {:else}
        <div class="flex-1 flex items-center justify-center">
            <div class="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                <div class="text-4xl mb-4">✓</div>
                <p class="font-bold text-white text-lg mb-2">All done — no more tables to judge.</p>
                <p class="text-white/60 text-sm">Thank you!</p>
            </div>
        </div>
    {/if}
</div>
