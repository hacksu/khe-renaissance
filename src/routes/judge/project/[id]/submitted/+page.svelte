<script lang="ts">
    import Icon from "@iconify/svelte";

    let { data } = $props();
</script>

<div class="max-w-md mx-auto h-screen bg-sand flex flex-col items-center justify-center p-6 text-center">

    <div class="mb-8 scale-150 text-green-700">
        <Icon icon="mdi:check-circle-outline" width="80" height="80" />
    </div>

    <h1 class="text-3xl font-bold text-secondary mb-2">Saved!</h1>
    <p class="text-secondary/70 mb-8 max-w-xs mx-auto">
        Your scores have been submitted successfully.
    </p>

    {#if data.remaining > 0}
        <div class="bg-white/50 rounded-xl p-4 w-full mb-8 border border-secondary/10">
            <p class="text-xs uppercase tracking-wider text-secondary/60 mb-1">Status</p>
            <p class="text-secondary font-medium">You have <span class="font-bold text-accent">{data.remaining}</span> active {data.remaining === 1 ? "assignment" : "assignments"} remaining.</p>
        </div>
    {/if}

    <a
        href="/judge"
        class="block w-full py-4 px-6 bg-secondary text-offwhite font-bold rounded-xl shadow-lg hover:bg-secondary/90 transition-transform active:scale-[0.98] text-center"
    >
        Back to Dashboard
    </a>

</div>
