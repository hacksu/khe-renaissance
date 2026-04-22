<script lang="ts">
    import { page } from "$app/stores";

    let { data } = $props();
    const judgeName = $page.data.session?.user?.name || "Judge";
</script>

<div class="max-w-md mx-auto p-4 flex flex-col min-h-screen">
    <!-- Header -->
    <div class="mb-6 mt-2">
        <a href="/" class="text-sm font-medium text-white/60 hover:text-white mb-4 block">← Back to Home</a>
        <h1 class="text-2xl font-bold text-white mb-1">Judging Dashboard</h1>
        <p class="text-white/80">Welcome, {judgeName}</p>
    </div>

    {#if data.assignment}
        <!-- Current Pair Assignment -->
        <div class="mb-6">
            <h2 class="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Your Current Pair</h2>
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-sm space-y-4">
                <!-- Project A -->
                <div class="bg-white/10 rounded-lg p-4">
                    <p class="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">Project A</p>
                    <p class="font-bold text-white text-lg">{data.assignment.projectA.name}</p>
                    {#if data.assignment.projectA.tableNumber}
                        <p class="text-sm text-white/60">Table #{data.assignment.projectA.tableNumber}</p>
                    {/if}
                </div>

                <!-- VS Divider -->
                <div class="text-center text-white/40 font-bold text-sm tracking-widest uppercase">vs</div>

                <!-- Project B -->
                <div class="bg-white/10 rounded-lg p-4">
                    <p class="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">Project B</p>
                    <p class="font-bold text-white text-lg">{data.assignment.projectB.name}</p>
                    {#if data.assignment.projectB.tableNumber}
                        <p class="text-sm text-white/60">Table #{data.assignment.projectB.tableNumber}</p>
                    {/if}
                </div>

                <a
                    href="/judge/pair/{data.assignment.id}"
                    class="block w-full py-3.5 px-6 bg-white text-castle-skyDeep font-bold rounded-xl text-center shadow-lg transition-all active:scale-[0.98] hover:bg-white/90"
                >
                    Start Judging →
                </a>
            </div>
        </div>
    {:else}
        <!-- No assignments available -->
        <div class="flex-1 flex items-center justify-center">
            <div class="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                <div class="text-4xl mb-4">✓</div>
                <p class="font-bold text-white text-lg mb-2">All pairs judged!</p>
                <p class="text-white/60 text-sm">Check back later for more pairs to judge.</p>
            </div>
        </div>
    {/if}
</div>
