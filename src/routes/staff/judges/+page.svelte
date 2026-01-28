<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$components/Button.svelte";
    import Modal from "$components/Modal.svelte";
    import Icon from "@iconify/svelte";
    import { Utils } from "$lib/util";
    import { authClient } from "$lib/client";
    import { invalidateAll } from "$app/navigation";

    let { data } = $props();

    let showEditModal = $state(false);
    let selectedJudge = $state<any>(null);
    let selectedTables = $state<number[]>([]);
    let isSubmitting = $state(false);
    let assignForm: HTMLFormElement;

    // Add Judge State
    let showAddJudgeModal = $state(false);
    let newJudgeEmail = $state("");
    let isAddingJudge = $state(false);

    async function addJudge() {
        if (!newJudgeEmail) return;
        isAddingJudge = true;
        try {
            await authClient.signIn.magicLink({ 
                email: newJudgeEmail, 
                callbackURL: "/judge",
                name: newJudgeEmail.split("@")[0]
            });
            alert("Invitation sent!");
            showAddJudgeModal = false;
            newJudgeEmail = "";
            await invalidateAll();
        } catch (e) {
            alert("Failed to send invitation");
            console.error(e);
        } finally {
            isAddingJudge = false;
        }
    }

    // Derived list of available tables (excluding already selected ones)
    let availableTables = $derived(
        (data.projects || [])
            .map((p: any) => parseInt(p.tableNumber || "0"))
            .filter((n: number) => n > 0 && !selectedTables.includes(n))
            .sort((a: number, b: number) => a - b)
    );

    function openEditModal(judge: any) {
        selectedJudge = judge;
        // Parse current assignments
        selectedTables = judge.judgeAssignments
            .filter((a: any) => a.project?.tableNumber)
            .map((a: any) => parseInt(a.project.tableNumber))
            .sort((a: number, b: number) => a - b);
        
        showEditModal = true;
    }

    function addTable(e: Event) {
        const select = e.target as HTMLSelectElement;
        const val = parseInt(select.value);
        if (val && !selectedTables.includes(val)) {
            selectedTables = [...selectedTables, val].sort((a, b) => a - b);
            select.value = ""; // Reset
        }
    }

    function removeTable(table: number) {
        selectedTables = selectedTables.filter(t => t !== table);
    }

    const submitAssignments = () => {
        isSubmitting = true;
        return async ({ result, update }: { result: any, update: any }) => {
            isSubmitting = false;
            if (result.type === 'success') {
                showEditModal = false;
            }
            await update();
        };
    };

    function handleConfirm() {
        if (assignForm) {
            assignForm.requestSubmit();
        }
    }
</script>

<div class="p-6 pt-24 min-h-screen">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold font-serif text-secondary">Judge Assignments</h1>
            <p class="text-secondary/70">Assign specific tables to judges.</p>
        </div>
        <Button onclick={() => showAddJudgeModal = true} class="bg-primary text-white">
            <Icon icon="mdi:plus" /> Add Judge
        </Button>
    </div>

    <div class="bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm overflow-hidden">
        <table class="w-full text-left text-sm">
            <thead class="bg-secondary/5 border-b border-secondary/10 text-secondary/60 uppercase tracking-widest text-xs">
                <tr>
                    <th class="p-4 font-bold">Judge Name</th>
                    <th class="p-4 font-bold">Role</th>
                    <th class="p-4 font-bold">Assigned Tables</th>
                    <th class="p-4 font-bold text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-secondary/5">
                {#each data.judges as judge}
                    <tr class="hover:bg-white/50 transition-colors">
                        <td class="p-4 font-bold text-secondary">
                            <div>
                                {judge.name}
                                <p class="text-xs font-normal text-secondary/50">{judge.email}</p>
                            </div>
                        </td>
                        <td class="p-4">
                            <span class="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs font-bold uppercase">{judge.role}</span>
                        </td>
                        <td class="p-4">
                            {#if judge.judgeAssignments.length > 0}
                                <div class="flex flex-wrap gap-1">
                                    {#each judge.judgeAssignments.slice(0, 10) as assignment}
                                         {#if assignment.project?.tableNumber}
                                            <span class="bg-white border border-secondary/10 text-secondary px-1.5 py-0.5 rounded text-xs font-mono">
                                                {assignment.project.tableNumber}
                                            </span>
                                         {:else}
                                             <span class="bg-white border border-secondary/10 text-secondary px-1.5 py-0.5 rounded text-xs font-mono">?</span>
                                         {/if}
                                    {/each}
                                    {#if judge.judgeAssignments.length > 10}
                                        <span class="text-xs text-secondary/50">+{judge.judgeAssignments.length - 10} more</span>
                                    {/if}
                                </div>
                            {:else}
                                <span class="text-secondary/30 italic">No assignments</span>
                            {/if}
                        </td>
                        <td class="p-4 text-right">
                             <Button 
                                class="text-xs py-1 px-3 bg-secondary/10 hover:bg-secondary/20 text-secondary border-none shadow-none" 
                                onclick={() => openEditModal(judge)}
                            >
                                Assign
                            </Button>
                        </td>
                    </tr>
                {/each}
                {#if data.judges.length === 0}
                    <tr>
                        <td colspan="4" class="p-8 text-center text-secondary/40 italic">
                            No judges found.
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>

<Modal
    open={showEditModal}
    title={`Assign Tables to ${selectedJudge?.name}`}
    confirmText={isSubmitting ? "Saving..." : "Save"}
    onConfirm={handleConfirm}
    onCancel={() => showEditModal = false}
>
    {#if selectedJudge}
        <form 
            bind:this={assignForm}
            method="POST" 
            action="?/updateAssignments" 
            use:enhance={submitAssignments} 
            class="space-y-4"
        >
            <input type="hidden" name="userId" value={selectedJudge.id} />
            <input type="hidden" name="tableNumbers" value={selectedTables.join(",")} />
            
            <div class="space-y-3">
                <p class="text-sm text-white/70">
                    Select tables to assign to this judge.
                </p>
                
                <!-- Selected Pills -->
                <div class="flex flex-wrap gap-2 min-h-[40px] p-2 bg-white/10 rounded-md border border-white/20">
                    {#each selectedTables as table}
                        <button 
                            type="button"
                            class="flex items-center gap-1 bg-white text-secondary px-2 py-1 rounded text-sm font-mono shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                            onclick={() => removeTable(table)}
                        >
                            {table}
                            <Icon icon="mdi:close" width="14" />
                        </button>
                    {/each}
                    {#if selectedTables.length === 0}
                         <span class="text-white/30 italic text-sm self-center">No tables assigned</span>
                    {/if}
                </div>

                <!-- Add Table Selector -->
                <div class="space-y-1">
                    <label class="text-xs font-bold text-white/70 uppercase tracking-wider">Add Table</label>
                    <select 
                        class="w-full rounded-md border-white/20 bg-white/10 text-white shadow-sm focus:border-accent focus:ring-accent text-sm placeholder-white/50"
                        onclick={(e) => {
                             // This is tricky because we want 'onchange' but if user selects same thing twice?
                             // But wait, we remove it from list so they can't select same thing twice.
                        }}
                        onchange={addTable}
                    >
                        <option value="" class="text-secondary">Select a table to add...</option>
                        {#each availableTables as table}
                            <option value={table} class="text-secondary">Table {table}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <!-- Curve Input -->
            <div class="space-y-1 pt-4 border-t border-white/10">
                <label class="text-xs font-bold text-white/70 uppercase tracking-wider block">Judge Curve (Score Modifier)</label>
                <p class="text-[10px] text-white/50 mb-1">Added to EACH category score.</p>
                <input 
                    type="number" 
                    name="curve" 
                    step="0.1" 
                    value={selectedJudge?.curve || 0} 
                    class="w-full rounded-md border-white/20 bg-white/10 text-white shadow-sm focus:border-accent focus:ring-accent text-sm placeholder-white/50"
                />
            </div>
        </form>
    {/if}
</Modal>

<Modal
    open={showAddJudgeModal}
    title="Invite Judge"
    confirmText={isAddingJudge ? "Sending..." : "Send Invitation"}
    onConfirm={addJudge}
    onCancel={() => showAddJudgeModal = false}
>
    <div class="space-y-4">
        <p class="text-sm text-white/70">
            Enter the judge's email address. They will receive a magic link to log in.
        </p>
        <div>
            <label class="text-xs font-bold text-white/70 uppercase tracking-wider block mb-1">Email Address</label>
            <input 
                bind:value={newJudgeEmail}
                type="email" 
                placeholder="judge@example.com"
                class="w-full rounded-md border-white/20 bg-white/10 text-white shadow-sm focus:border-accent focus:ring-accent text-sm placeholder-white/50"
            />
        </div>
    </div>
</Modal>
