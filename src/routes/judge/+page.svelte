<script lang="ts">
    import { page } from "$app/stores";
    import { enhance } from "$app/forms";
    import Icon from "@iconify/svelte";
    
    let { data, form } = $props();
    let assignments = $derived(data.assignments);
    const judgeName = $page.data.session?.user?.name || "Judge";

    const completed = $derived(assignments.filter(a => a.status === 'completed').length);
    const remaining = $derived(assignments.filter(a => a.status === 'assigned').length);
</script>

<div class="max-w-md mx-auto p-4 flex flex-col h-full min-h-screen relative">
    <!-- Header -->
    <div class="mb-6 mt-2">
        <a href="/" class="text-sm font-medium text-secondary/70 hover:text-primary mb-4 block">← Back to Home</a>
        <h1 class="text-2xl font-bold text-secondary mb-1">Judging Dashboard</h1>
        <p class="text-secondary/80">Welcome, {judgeName}</p>
    </div>

    <!-- Judge Next Button -->
    <div class="mb-4">
        <form method="POST" action="?/judgeNext" use:enhance>
            <button class="w-full py-4 px-6 bg-secondary text-offwhite font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-secondary/90">
                <span>Judge Next Team</span>
                <Icon icon="mdi:arrow-right" width="20" height="20" />
            </button>
        </form>
        <p class="text-center text-xs text-secondary/50 mt-2">Get assigned a new team automatically.</p>
    </div>

    <!-- Manual Entry -->
    <div class="mb-8 border-t border-secondary/10 pt-4">
        <h3 class="text-xs font-bold uppercase tracking-widest text-secondary/50 mb-3 text-center">Or Enter Manual Team #</h3>
        <form method="POST" action="?/manualEntry" use:enhance class="flex gap-2">
            <input 
                type="text" 
                name="tableNumber" 
                placeholder="Table #" 
                class="flex-1 bg-white rounded-lg px-4 py-2 border border-secondary/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-secondary placeholder:text-secondary/30"
                required
            />
            <button class="px-4 py-2 bg-secondary/10 text-secondary font-bold rounded-lg hover:bg-secondary/20 transition-colors">
                Go
            </button>
        </form>
        {#if form?.manualEntryError}
            <p class="text-red-600 text-xs mt-2 text-center">{form.manualEntryError}</p>
        {/if}
    </div>

    <!-- Stats -->
    <div class="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-secondary/10 shadow-sm">
        <div class="grid grid-cols-3 gap-2 text-center divide-x divide-secondary/10">
            <div>
                <p class="text-xs uppercase tracking-wider text-secondary/60">Total</p>
                <p class="text-xl font-bold text-secondary">{assignments.length}</p>
            </div>
            <div>
                <p class="text-xs uppercase tracking-wider text-secondary/60">Done</p>
                <p class="text-xl font-bold text-green-700">{completed}</p>
            </div>
            <div>
                <p class="text-xs uppercase tracking-wider text-secondary/60">Active</p>
                <p class="text-xl font-bold text-orange-600">{remaining}</p>
            </div>
        </div>
    </div>

    <!-- Assigned Projects List -->
    <h2 class="text-xs font-bold uppercase tracking-widest text-secondary/50 mb-3">Your History</h2>
    
    <div class="space-y-3 pb-20">
        {#each assignments as assignment}
            <a href="/judge/project/{assignment.project?.id}" 
               class="block bg-white rounded-xl p-4 shadow-sm border border-secondary/5 hover:border-accent/30 transition-all active:scale-[0.98] group relative overflow-hidden ring-offset-2 focus:outline-none focus:ring-2 focus:ring-accent">
                
                {#if assignment.status === 'completed'}
                    <div class="absolute top-0 right-0 p-3">
                         <div class="bg-green-100 text-green-700 rounded-full p-1">
                            <Icon icon="mdi:check" width="16" height="16" />
                         </div>
                    </div>
                {/if}

                <h3 class="font-bold text-lg text-secondary group-hover:text-accent transition-colors">{assignment.project?.name}</h3>
                <p class="text-sm text-secondary/70 mb-2">{assignment.project?.track}</p>
                
                <div class="flex items-center text-xs font-medium {assignment.status === 'completed' ? 'text-green-600' : 'text-accent'}">
                    {#if assignment.status === 'completed'}
                        Review Score
                    {:else}
                        Continue Judging →
                    {/if}
                </div>
            </a>
        {/each}
        {#if assignments.length === 0}
            <div class="text-center py-8 text-secondary/40 italic">
                No history yet. Start judging!
            </div>
        {/if}
    </div>
</div>
