<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$components/Button.svelte";
    import Card from "$components/Card.svelte";
    import Input from "$components/form/Input.svelte";
    import { Utils } from "$lib/util";

    let { data } = $props();
</script>

<div class="p-6 pt-24 min-h-screen space-y-8">
    
    <div>
        <h1 class="text-2xl font-bold font-serif text-secondary mb-4">Configuration</h1>
        <p class="text-secondary/70">Manage dynamic data for the event.</p>
    </div>

    <!-- Tracks Manager -->
    <section>
        <h2 class="text-xl font-bold text-secondary mb-4">Tracks</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- List -->
            <div class="space-y-2">
                {#each data.tracks as track}
                    <div class="flex justify-between items-center bg-white/50 border border-secondary/10 p-3 rounded-lg">
                        <div>
                            <p class="font-bold text-secondary">{track.name}</p>
                            <p class="text-xs text-secondary/60">{track.description || "No description"}</p>
                        </div>
                        <form method="POST" action="?/deleteTrack" use:enhance>
                            <input type="hidden" name="id" value={track.id} />
                            <button class="text-red-500 text-xs hover:underline">Delete</button>
                        </form>
                    </div>
                {/each}
                {#if data.tracks.length === 0}
                    <p class="text-secondary/40 italic">No tracks defined.</p>
                {/if}
            </div>

            <!-- Add Form -->
            <Card>
                <form method="POST" action="?/createTrack" use:enhance class="p-4 space-y-4">
                    <h3 class="font-bold text-lg mb-2">Add Track</h3>
                    <Input name="name" label="Name" placeholder="e.g. Healthcare" required />
                    <Input name="description" label="Description" placeholder="Optional..." />
                    <div class="pt-2">
                        <Button class="w-full">Create Track</Button>
                    </div>
                </form>
            </Card>
        </div>
    </section>

    <!-- Criteria Manager -->
    <section>
        <h2 class="text-xl font-bold text-secondary mb-4">Judging Criteria</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- List -->
            <div class="space-y-2">
                {#each data.criteria as criterion}
                    <div class="flex justify-between items-center bg-white/50 border border-secondary/10 p-3 rounded-lg">
                        <div>
                            <div class="flex gap-2 items-center">
                                <span class="font-bold text-secondary">{criterion.name}</span>
                                <span class="text-xs bg-secondary/10 px-1 rounded font-mono">Max: {criterion.maxScore}</span>
                            </div>
                            <p class="text-xs text-secondary/60">Slug: {criterion.slug}</p>
                        </div>
                        <form method="POST" action="?/deleteCriterion" use:enhance>
                            <input type="hidden" name="id" value={criterion.id} />
                            <button class="text-red-500 text-xs hover:underline">Delete</button>
                        </form>
                    </div>
                {/each}
                {#if data.criteria.length === 0}
                    <p class="text-secondary/40 italic">No criteria defined.</p>
                {/if}
            </div>

            <!-- Add Form -->
            <Card>
                <form method="POST" action="?/createCriterion" use:enhance class="p-4 space-y-4">
                    <h3 class="font-bold text-lg mb-2">Add Criterion</h3>
                    <Input name="name" label="Name" placeholder="e.g. Innovation" required />
                    <div class="grid grid-cols-2 gap-4">
                        <Input name="maxScore" label="Max Score" type="number" value="5" />
                        <Input name="order" label="Order" type="number" value="0" />
                    </div>
                    <div class="pt-2">
                        <Button class="w-full">Create Criterion</Button>
                    </div>
                </form>
            </Card>
        </div>
    </section>

</div>
