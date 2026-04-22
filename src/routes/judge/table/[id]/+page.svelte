<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    let { data } = $props();
    const { visit, criteria, timePerTable } = data;

    const project = visit.project;
    const startedAt = visit.startedAt ? new Date(visit.startedAt) : new Date();

    let elapsed = $state(0);
    let intervalId: ReturnType<typeof setInterval>;

    onMount(() => {
        // Initialize elapsed immediately
        elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
        intervalId = setInterval(() => {
            elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(intervalId);
    });

    function formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    const timerColor = $derived(() => {
        if (timePerTable === null) return 'text-white';
        const totalSeconds = timePerTable * 60;
        const pct = elapsed / totalSeconds;
        if (pct < 0.5) return 'text-green-400';
        if (pct < 1.0) return 'text-yellow-400';
        return 'text-red-400';
    });

    const timerPulse = $derived(() => {
        if (timePerTable === null) return false;
        return elapsed >= timePerTable * 60;
    });
</script>

<div class="max-w-md mx-auto p-4 flex flex-col min-h-screen">
    <!-- Header -->
    <div class="mb-6 mt-2">
        <a href="/judge" class="text-sm font-medium text-white/60 hover:text-white mb-4 block">← Dashboard</a>
        <h1 class="text-2xl font-bold text-white mb-1">{project.name}</h1>
        {#if project.tableNumber}
            <p class="text-white/60 text-lg">Table #{project.tableNumber}</p>
        {/if}
    </div>

    <!-- Timer -->
    <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-sm mb-6 text-center">
        <p class="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Time at Table</p>
        <p class="text-6xl font-mono font-bold {timerColor()} {timerPulse() ? 'animate-pulse' : ''}">
            {formatTime(elapsed)}
        </p>
        {#if timePerTable !== null}
            <p class="text-white/40 text-sm mt-2">{timePerTable} min allotted</p>
        {/if}
    </div>

    <!-- Sequence note -->
    {#if visit.sequence > 1}
        <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <p class="text-white/60 text-sm">After submitting feedback, you'll compare this project with the previous table.</p>
        </div>
    {/if}

    <!-- End Judging button -->
    <form method="POST" action="?/end">
        <button
            type="submit"
            class="w-full py-4 px-6 bg-white text-castle-skyDeep font-bold rounded-xl text-lg shadow-lg transition-all active:scale-[0.98] hover:bg-white/90"
        >
            End Judging
        </button>
    </form>
</div>
