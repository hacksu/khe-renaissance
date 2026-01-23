<script lang="ts">
    import { page } from "$app/stores";

    // Mock Data (in a real app, this would come from `data` prop)
    const judgeName = $page.data.session?.user?.name || "Judge";
    const projects = [
        { id: 7, name: "Team #7", track: "General (Open-Ended)", status: "completed" },
        { id: 12, name: "Team #12", track: "Business Analytics", status: "assigned" },
        { id: 4, name: "Team #4", track: "General (Open-Ended)", status: "assigned" },
        { id: 9, name: "Team #9", track: "Education Tech", status: "remaining" },
        { id: 15, name: "Team #15", track: "Healthcare", status: "remaining" }
    ];

    const completed = projects.filter(p => p.status === "completed").length;
    const remaining = projects.length - completed;
</script>

<div class="max-w-md mx-auto p-4 flex flex-col h-full min-h-screen relative">
    <!-- Header -->
    <div class="mb-6 mt-2">
        <a href="/" class="text-sm font-medium text-secondary/70 hover:text-primary mb-4 block">← Back to Home</a>
        <h1 class="text-2xl font-bold text-secondary mb-1">Judging Dashboard</h1>
        <p class="text-secondary/80">Welcome, {judgeName}</p>
    </div>

    <!-- Stats -->
    <div class="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-secondary/10 shadow-sm">
        <div class="grid grid-cols-3 gap-2 text-center divide-x divide-secondary/10">
            <div>
                <p class="text-xs uppercase tracking-wider text-secondary/60">Assigned</p>
                <p class="text-xl font-bold text-secondary">{projects.length}</p>
            </div>
            <div>
                <p class="text-xs uppercase tracking-wider text-secondary/60">Done</p>
                <p class="text-xl font-bold text-green-700">{completed}</p>
            </div>
            <div>
                <p class="text-xs uppercase tracking-wider text-secondary/60">Left</p>
                <p class="text-xl font-bold text-orange-600">{remaining}</p>
            </div>
        </div>
    </div>

    <!-- Assigned Projects List -->
    <h2 class="text-xs font-bold uppercase tracking-widest text-secondary/50 mb-3">Assigned Projects</h2>
    
    <div class="space-y-3 pb-20">
        {#each projects as project}
            <a href="/judge/project/{project.id}" 
               class="block bg-white rounded-xl p-4 shadow-sm border border-secondary/5 hover:border-accent/30 transition-all active:scale-[0.98] group relative overflow-hidden ring-offset-2 focus:outline-none focus:ring-2 focus:ring-accent">
                
                {#if project.status === 'completed'}
                    <div class="absolute top-0 right-0 p-3">
                         <div class="bg-green-100 text-green-700 rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                         </div>
                    </div>
                {/if}

                <h3 class="font-bold text-lg text-secondary group-hover:text-accent transition-colors">{project.name}</h3>
                <p class="text-sm text-secondary/70 mb-2">{project.track}</p>
                
                <div class="flex items-center text-xs font-medium {project.status === 'completed' ? 'text-green-600' : 'text-accent'}">
                    {#if project.status === 'completed'}
                        Tap to specific details
                    {:else}
                        Tap to judge →
                    {/if}
                </div>
            </a>
        {/each}
    </div>
</div>
