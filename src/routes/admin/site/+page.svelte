<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$components/Button.svelte";
    import Card from "$components/Card.svelte";
    import Input from "$components/form/Input.svelte";

    let { data } = $props();

    let editingSponsor = $state<any>(null);
    let editingPrize = $state<any>(null);
    let editingEvent = $state<any>(null);

    const EVENT_TYPES = ['event', 'ceremony', 'meal', 'workshop', 'milestone'];
    const days = $derived([...new Set(data.schedule.map((e: any) => e.day))]);

</script>

<div class="p-6 pt-24 min-h-screen space-y-8">

    <div>
        <h1 class="text-2xl font-bold font-serif text-secondary mb-4">Site Config</h1>
        <p class="text-secondary/70">Manage sponsors and prizes shown on the homepage.</p>
    </div>

    <!-- Sponsors Manager -->
    <section>
        <h2 class="text-xl font-bold text-secondary mb-4">Sponsors</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                {#each data.sponsors as sponsor}
                    {#if editingSponsor?.id === sponsor.id}
                        <form method="POST" action="?/updateSponsor" use:enhance={() => { return async ({ update }) => { editingSponsor = null; await update(); }; }} class="bg-white/50 border border-accent/30 p-3 rounded-lg space-y-2">
                            <input type="hidden" name="id" value={sponsor.id} />
                            <input name="name" bind:value={editingSponsor.name} placeholder="Name" class="w-full text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" required />
                            <input name="url" bind:value={editingSponsor.url} placeholder="https://..." class="w-full text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" required />
                            <input name="imageUrl" bind:value={editingSponsor.imageUrl} placeholder="Image URL" class="w-full text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" required />
                            <div class="grid grid-cols-2 gap-2">
                                <select name="tier" bind:value={editingSponsor.tier} class="text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white">
                                    <option value="baron">Baron</option>
                                    <option value="knight">Knight</option>
                                    <option value="squire">Squire</option>
                                </select>
                                <input name="order" type="number" bind:value={editingSponsor.order} placeholder="Order" class="text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" />
                            </div>
                            <div class="flex gap-2 justify-end">
                                <button type="button" onclick={() => editingSponsor = null} class="text-xs text-secondary/60 hover:underline">Cancel</button>
                                <button type="submit" class="text-xs text-accent font-bold hover:underline">Save</button>
                            </div>
                        </form>
                    {:else}
                        <div class="flex justify-between items-center bg-white/50 border border-secondary/10 p-3 rounded-lg">
                            <div class="flex items-center gap-3">
                                <img src={sponsor.imageUrl} alt={sponsor.name} class="w-10 h-10 object-contain rounded" />
                                <div>
                                    <p class="font-bold text-secondary text-sm">{sponsor.name}</p>
                                    <span class="text-xs bg-secondary/10 px-1 rounded">{sponsor.tier}</span>
                                </div>
                            </div>
                            <div class="flex gap-2 items-center">
                                <button onclick={() => editingSponsor = { ...sponsor }} class="text-accent text-xs hover:underline">Edit</button>
                                <form method="POST" action="?/deleteSponsor" use:enhance>
                                    <input type="hidden" name="id" value={sponsor.id} />
                                    <button class="text-red-500 text-xs hover:underline">Delete</button>
                                </form>
                            </div>
                        </div>
                    {/if}
                {/each}
                {#if data.sponsors.length === 0}
                    <p class="text-secondary/40 italic">No sponsors yet.</p>
                {/if}
            </div>
            <Card>
                <form method="POST" action="?/createSponsor" use:enhance class="p-4 space-y-3">
                    <h3 class="font-bold text-lg mb-2">Add Sponsor</h3>
                    <Input name="name" label="Name" placeholder="e.g. Acme Corp" required />
                    <Input name="url" label="Website URL" placeholder="https://..." required />
                    <Input name="imageUrl" label="Image URL" placeholder="https://dev.hacksu.com/f/..." required />
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-xs font-bold text-secondary/70 block mb-1">Tier</label>
                            <select name="tier" class="w-full text-sm rounded border border-secondary/20 px-2 py-1 text-black bg-white">
                                <option value="squire">Squire</option>
                                <option value="knight">Knight</option>
                                <option value="baron">Baron</option>
                            </select>
                        </div>
                        <Input name="order" label="Order" type="number" value="0" />
                    </div>
                    <div class="pt-1"><Button class="w-full">Add Sponsor</Button></div>
                </form>
            </Card>
        </div>
    </section>

    <!-- Prizes Manager -->
    <section>
        <h2 class="text-xl font-bold text-secondary mb-4">Prizes</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                {#each data.prizes as prize}
                    {#if editingPrize?.id === prize.id}
                        <form method="POST" action="?/updatePrize" use:enhance={() => { return async ({ update }) => { editingPrize = null; await update(); }; }} class="bg-white/50 border border-accent/30 p-3 rounded-lg space-y-2">
                            <input type="hidden" name="id" value={prize.id} />
                            <input name="itemName" bind:value={editingPrize.itemName} placeholder="Item name" class="w-full text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" required />
                            <input name="detail" bind:value={editingPrize.detail} placeholder="Detail" class="w-full text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" />
                            <input name="imageUrl" bind:value={editingPrize.imageUrl} placeholder="Image URL" class="w-full text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" />
                            <div class="grid grid-cols-2 gap-2">
                                <input name="order" type="number" bind:value={editingPrize.order} placeholder="Order" class="text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" />
                                {#if editingPrize.category === 'overall'}
                                    <input name="place" bind:value={editingPrize.place} placeholder="1st / 2nd / 3rd" class="text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" />
                                {/if}
                            </div>
                            {#if editingPrize.category === 'overall'}
                                <div class="grid grid-cols-2 gap-2">
                                    <input name="crown" bind:value={editingPrize.crown} placeholder="Crown emoji" class="text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" />
                                    <input name="accentColor" bind:value={editingPrize.accentColor} placeholder="#c9a84c" class="text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" />
                                </div>
                            {/if}
                            {#if editingPrize.category === 'track'}
                                <input name="trackName" bind:value={editingPrize.trackName} placeholder="Track name" class="w-full text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" />
                            {/if}
                            {#if editingPrize.category === 'special'}
                                <input name="awardName" bind:value={editingPrize.awardName} placeholder="Award name" class="w-full text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" />
                            {/if}
                            <div class="flex gap-2 justify-end">
                                <button type="button" onclick={() => editingPrize = null} class="text-xs text-secondary/60 hover:underline">Cancel</button>
                                <button type="submit" class="text-xs text-accent font-bold hover:underline">Save</button>
                            </div>
                        </form>
                    {:else}
                        <div class="flex justify-between items-center bg-white/50 border border-secondary/10 p-3 rounded-lg">
                            <div>
                                <div class="flex gap-2 items-center">
                                    <span class="font-bold text-secondary text-sm">{prize.itemName}</span>
                                    <span class="text-xs bg-secondary/10 px-1 rounded">{prize.category}</span>
                                </div>
                                <p class="text-xs text-secondary/50">{prize.trackName ?? prize.place ?? prize.awardName ?? ''}</p>
                            </div>
                            <div class="flex gap-2 items-center">
                                <button onclick={() => editingPrize = { ...prize }} class="text-accent text-xs hover:underline">Edit</button>
                                <form method="POST" action="?/deletePrize" use:enhance>
                                    <input type="hidden" name="id" value={prize.id} />
                                    <button class="text-red-500 text-xs hover:underline">Delete</button>
                                </form>
                            </div>
                        </div>
                    {/if}
                {/each}
                {#if data.prizes.length === 0}
                    <p class="text-secondary/40 italic">No prizes yet.</p>
                {/if}
            </div>
            <Card>
                <form method="POST" action="?/createPrize" use:enhance class="p-4 space-y-3">
                    <h3 class="font-bold text-lg mb-2">Add Prize</h3>
                    <div>
                        <label class="text-xs font-bold text-secondary/70 block mb-1">Category</label>
                        <select name="category" class="w-full text-sm rounded border border-secondary/20 px-2 py-1 text-black" required>
                            <option value="overall">Overall</option>
                            <option value="track">Track</option>
                            <option value="special">Special</option>
                        </select>
                    </div>
                    <Input name="itemName" label="Item Name" placeholder="e.g. HyperX Headset" required />
                    <Input name="detail" label="Detail" placeholder="e.g. Wireless Gaming Headset" />
                    <Input name="imageUrl" label="Image URL" placeholder="https://dev.hacksu.com/f/..." />
                    <Input name="order" label="Order" type="number" value="0" />
                    <Input name="place" label="Place (overall only)" placeholder="1st / 2nd / 3rd" />
                    <Input name="crown" label="Crown emoji (overall only)" placeholder="crown emoji" />
                    <Input name="accentColor" label="Accent color (overall only)" placeholder="#c9a84c" />
                    <Input name="trackName" label="Track name (track only)" placeholder="e.g. Cybersecurity" />
                    <Input name="awardName" label="Award name (special only)" placeholder="e.g. Best Solo Hack" />
                    <div class="pt-1"><Button class="w-full">Add Prize</Button></div>
                </form>
            </Card>
        </div>
    </section>

    <!-- Schedule Manager -->
    <section>
        <h2 class="text-xl font-bold text-secondary mb-4">Schedule</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
                {#each days as day}
                    <div>
                        <h3 class="text-sm font-bold text-secondary/60 uppercase tracking-widest mb-2">{day}</h3>
                        <div class="space-y-1">
                            {#each data.schedule.filter((e: any) => e.day === day) as ev}
                                {#if editingEvent?.id === ev.id}
                                    <form method="POST" action="?/updateScheduleEvent" use:enhance={() => { return async ({ update }) => { editingEvent = null; await update(); }; }} class="bg-white/50 border border-accent/30 p-3 rounded-lg space-y-2">
                                        <input type="hidden" name="id" value={ev.id} />
                                        <div class="grid grid-cols-2 gap-2">
                                            <input name="day" bind:value={editingEvent.day} placeholder="Day" class="text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" required />
                                            <input name="time" bind:value={editingEvent.time} placeholder="10:00 AM" class="text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" required />
                                        </div>
                                        <input name="event" bind:value={editingEvent.event} placeholder="Event name" class="w-full text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" required />
                                        <div class="grid grid-cols-2 gap-2">
                                            <select name="type" bind:value={editingEvent.type} class="text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white">
                                                {#each EVENT_TYPES as t}<option value={t}>{t}</option>{/each}
                                            </select>
                                            <input name="order" type="number" bind:value={editingEvent.order} placeholder="Order" class="text-sm rounded border-secondary/20 px-2 py-1 text-black bg-white" />
                                        </div>
                                        <label class="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                                            <input type="checkbox" name="highlight" bind:checked={editingEvent.highlight} class="rounded" />
                                            <span>Highlight</span>
                                        </label>
                                        <div class="flex gap-2 justify-end">
                                            <button type="button" onclick={() => editingEvent = null} class="text-xs text-secondary/60 hover:underline">Cancel</button>
                                            <button type="submit" class="text-xs text-accent font-bold hover:underline">Save</button>
                                        </div>
                                    </form>
                                {:else}
                                    <div class="flex justify-between items-center bg-white/50 border border-secondary/10 p-2 rounded-lg">
                                        <div class="flex items-center gap-2 min-w-0">
                                            <span class="text-xs font-mono text-secondary/50 flex-shrink-0">{ev.time}</span>
                                            <span class="text-sm text-secondary font-medium truncate">{ev.event}</span>
                                            <span class="text-xs bg-secondary/10 px-1 rounded flex-shrink-0">{ev.type}</span>
                                            {#if ev.highlight}<span class="text-xs bg-accent/20 text-accent px-1 rounded flex-shrink-0">highlight</span>{/if}
                                        </div>
                                        <div class="flex gap-2 items-center flex-shrink-0 ml-2">
                                            <button onclick={() => editingEvent = { ...ev }} class="text-accent text-xs hover:underline">Edit</button>
                                            <form method="POST" action="?/deleteScheduleEvent" use:enhance>
                                                <input type="hidden" name="id" value={ev.id} />
                                                <button class="text-red-500 text-xs hover:underline">Delete</button>
                                            </form>
                                        </div>
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {/each}
                {#if data.schedule.length === 0}
                    <p class="text-secondary/40 italic">No events yet.</p>
                {/if}
            </div>
            <Card>
                <form method="POST" action="?/createScheduleEvent" use:enhance class="p-4 space-y-3">
                    <h3 class="font-bold text-lg mb-2">Add Event</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <Input name="day" label="Day" placeholder="e.g. Saturday" required />
                        <Input name="time" label="Time" placeholder="e.g. 10:00 AM" required />
                    </div>
                    <Input name="event" label="Event Name" placeholder="e.g. Opening Ceremony" required />
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-xs font-bold text-secondary/70 block mb-1">Type</label>
                            <select name="type" class="w-full text-sm rounded border border-secondary/20 px-2 py-1 text-black bg-white">
                                {#each EVENT_TYPES as t}<option value={t}>{t}</option>{/each}
                            </select>
                        </div>
                        <Input name="order" label="Order" type="number" value="0" />
                    </div>
                    <label class="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                        <input type="checkbox" name="highlight" class="rounded" />
                        <span>Highlight</span>
                    </label>
                    <div class="pt-1"><Button class="w-full">Add Event</Button></div>
                </form>
            </Card>
        </div>
    </section>

</div>
