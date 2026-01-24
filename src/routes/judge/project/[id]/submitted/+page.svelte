<script lang="ts">
    import { page } from "$app/stores";
    import Icon from "@iconify/svelte";
    
    const projectId = $page.params.id;
    // In a real app, calculate next project ID dynamically
    const nextProjectId = 4; // Mock next
    const remaining = 2; // Mock remaining
</script>

<div class="max-w-md mx-auto h-screen bg-sand flex flex-col items-center justify-center p-6 text-center">
    
    <div class="mb-8 scale-150 text-green-700">
        <Icon icon="mdi:check-circle-outline" width="80" height="80" />
    </div>

    <h1 class="text-3xl font-bold text-secondary mb-2">Saved!</h1>
    <p class="text-secondary/70 mb-8 max-w-xs mx-auto">
        Judging for <span class="font-bold text-secondary">Team #{projectId}</span> has been submitted successfully.
    </p>

    <div class="bg-white/50 rounded-xl p-4 w-full mb-8 border border-secondary/10">
        <p class="text-xs uppercase tracking-wider text-secondary/60 mb-1">Status</p>
        <p class="text-secondary font-medium">You have <span class="font-bold text-accent">{remaining}</span> projects remaining.</p>
    </div>

    <div class="w-full space-y-3">
        <a 
            href="/judge/project/{nextProjectId}"
            class="block w-full py-4 px-6 bg-secondary text-offwhite font-bold rounded-xl shadow-lg hover:bg-secondary/90 transition-transform active:scale-[0.98]"
        >
            Judge Next Team (Team #{nextProjectId}) →
        </a>

        <a 
            href="/judge"
            class="block w-full py-4 px-6 bg-white text-secondary font-bold rounded-xl border border-secondary/10 hover:bg-white/80 transition-transform active:scale-[0.98]"
        >
            Back to Dashboard
        </a>
    </div>

</div>
