<script lang="ts">
    import { page } from "$app/stores";
    import { enhance } from "$app/forms";
    import Icon from "@iconify/svelte";

    let { data } = $props();
    const projectId = $page.params.id;
</script>

<div class="max-w-md mx-auto h-screen bg-sand flex flex-col items-center justify-center p-6 text-center">

    <div class="mb-8 scale-150 {data.hasMore ? 'text-green-700' : 'text-accent'}">
        <Icon icon={data.hasMore ? "mdi:check-circle-outline" : "mdi:trophy-outline"} width="80" height="80" />
    </div>

    <h1 class="text-3xl font-bold text-secondary mb-2">{data.hasMore ? "Saved!" : "All Done!"}</h1>
    <p class="text-secondary/70 mb-8 max-w-xs mx-auto">
        Judging for <span class="font-bold text-secondary">Team #{projectId}</span> has been submitted successfully.
    </p>

    <div class="bg-white/50 rounded-xl p-4 w-full mb-8 border border-secondary/10">
        <p class="text-xs uppercase tracking-wider text-secondary/60 mb-1">Status</p>
        {#if data.remaining > 0}
            <p class="text-secondary font-medium">You have <span class="font-bold text-accent">{data.remaining}</span> active {data.remaining === 1 ? "assignment" : "assignments"} remaining.</p>
        {:else if data.hasMore}
            <p class="text-secondary font-medium">No active assignments — more teams are available.</p>
        {:else}
            <p class="text-secondary font-medium">No more teams to judge. Great work!</p>
        {/if}
    </div>

    <div class="w-full space-y-3">
        {#if data.hasMore}
            <form method="POST" action="/judge?/judgeNext" use:enhance>
                <button class="w-full py-4 px-6 bg-secondary text-offwhite font-bold rounded-xl shadow-lg hover:bg-secondary/90 transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
                    <span>Judge Next Team</span>
                    <Icon icon="mdi:arrow-right" width="16" height="16" />
                </button>
            </form>
        {:else}
            <div class="w-full py-4 px-6 bg-accent/20 text-accent font-bold rounded-xl flex items-center justify-center gap-2">
                <Icon icon="mdi:check-all" width="20" height="20" />
                <span>You're Done!</span>
            </div>
        {/if}

        <a
            href="/judge"
            class="block w-full py-4 px-6 bg-white text-secondary font-bold rounded-xl border border-secondary/10 hover:bg-white/80 transition-transform active:scale-[0.98]"
        >
            Back to Dashboard
        </a>
    </div>

</div>
