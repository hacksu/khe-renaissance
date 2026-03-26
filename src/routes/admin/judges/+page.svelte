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
    let assignForm = $state<HTMLFormElement | undefined>();

    // Add Judge State
    let showAddJudgeModal = $state(false);
    let newJudgeEmail = $state("");
    let isAddingJudge = $state(false);
    let resendingId = $state<string | null>(null);

    async function addJudge() {
        if (!newJudgeEmail) return;
        isAddingJudge = true;
        try {
            await fetch("/api/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newJudgeEmail, role: "judge" })
            });
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

    async function resendLink(judge: any) {
        resendingId = judge.id;
        try {
            await fetch("/api/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: judge.email, role: "judge" })
            });
            await authClient.signIn.magicLink({
                email: judge.email,
                callbackURL: "/judge",
                name: judge.name
            });
            alert(`Magic link sent to ${judge.email}`);
        } catch (e) {
            alert("Failed to send link");
            console.error(e);
        } finally {
            resendingId = null;
        }
    }

    // CSV Import State
    type CsvRow = { email: string; name: string; status: 'pending' | 'sending' | 'done' | 'error' };
    let showImportModal = $state(false);
    let csvRows = $state<CsvRow[]>([]);
    let isImporting = $state(false);
    let importDone = $state(false);

    function parseCsv(text: string): CsvRow[] {
        const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
        if (lines.length === 0) return [];

        const firstCells = lines[0].split(',').map(c => c.trim().toLowerCase().replace(/"/g, ''));
        const hasHeader = firstCells.some(c => c === 'email' || c === 'name');
        const dataLines = hasHeader ? lines.slice(1) : lines;

        let emailIdx = 0, nameIdx = 1;
        if (hasHeader) {
            const ei = firstCells.indexOf('email');
            const ni = firstCells.indexOf('name');
            if (ei !== -1) emailIdx = ei;
            if (ni !== -1) nameIdx = ni;
        }

        return dataLines.map(line => {
            const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            const email = cells[emailIdx]?.toLowerCase() ?? '';
            const name = cells[nameIdx] ?? email.split('@')[0];
            return { email, name, status: 'pending' };
        }).filter(r => r.email.includes('@'));
    }

    function handleFileChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            csvRows = parseCsv(ev.target?.result as string);
            importDone = false;
        };
        reader.readAsText(file);
    }

    async function importJudges() {
        if (csvRows.length === 0 || isImporting) return;
        isImporting = true;
        for (let i = 0; i < csvRows.length; i++) {
            const row = csvRows[i];
            if (row.status === 'done') continue;
            csvRows[i] = { ...row, status: 'sending' };
            try {
                await fetch("/api/invite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: row.email, role: "judge" })
                });
                await authClient.signIn.magicLink({
                    email: row.email,
                    callbackURL: "/judge",
                    name: row.name
                });
                csvRows[i] = { ...csvRows[i], status: 'done' };
            } catch {
                csvRows[i] = { ...csvRows[i], status: 'error' };
            }
        }
        isImporting = false;
        importDone = true;
        await invalidateAll();
    }

    let pendingImportCount = $derived(csvRows.filter(r => r.status === 'pending').length);

    let projectByTable = $derived(
        Object.fromEntries(
            (data.projects || []).map((p: any) => [parseInt(p.tableNumber || "0"), p])
        )
    );

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

    // Remove Judge State
    let showRemoveJudgeModal = $state(false);
    let judgeToRemove = $state<any>(null);
    let removeJudgeForm = $state<HTMLFormElement | undefined>();

    function handleRemoveConfirm() {
        if (removeJudgeForm) removeJudgeForm.requestSubmit();
        showRemoveJudgeModal = false;
    }

    // Timer polling
    let now = $state(Date.now());

    $effect(() => {
        const tick = setInterval(() => now = Date.now(), 1000);
        const poll = setInterval(() => invalidateAll(), 10_000);
        return () => { clearInterval(tick); clearInterval(poll); };
    });

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    // Curve State
    let showCurveModal = $state(false);
    let curveJudge = $state<any>(null);
    let curveForm = $state<HTMLFormElement | undefined>();

    function openCurveModal(judge: any) {
        curveJudge = judge;
        showCurveModal = true;
    }

    function handleCurveConfirm() {
        if (curveForm) curveForm.requestSubmit();
    }

    const submitCurve = () => {
        return async ({ result, update }: { result: any, update: any }) => {
            if (result.type === 'success') {
                showCurveModal = false;
            }
            await update();
        };
    };
</script>

<div class="p-6 pt-24 min-h-screen">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold font-serif text-secondary">Judge Assignments</h1>
            <p class="text-secondary/70">Assign specific tables to judges.</p>
        </div>
        <div class="flex gap-2">
            <Button onclick={() => showAddJudgeModal = true} class="bg-primary text-white whitespace-nowrap">
                Add Judge
            </Button>
            <Button onclick={() => { showImportModal = true; csvRows = []; importDone = false; }} class="bg-secondary/10 text-secondary border-none shadow-none whitespace-nowrap">
                Import CSV
            </Button>
        </div>
    </div>

    <div class="bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm overflow-hidden">
        <table class="w-full text-left text-sm">
            <thead class="bg-secondary/5 border-b border-secondary/10 text-secondary/60 uppercase tracking-widest text-xs">
                <tr>
                    <th class="p-4 font-bold">Judge Name</th>
                    <th class="p-4 font-bold">Role</th>
                    <th class="p-4 font-bold">Assigned Tables</th>
                    {#if data.timePerTable}
                        <th class="p-4 font-bold">Timer</th>
                    {/if}
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
                            <p class="text-xs font-normal text-secondary/40 mt-0.5">{judge._count.judgeAssignments} judged</p>
                        </td>
                        <td class="p-4">
                            <span class="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs font-bold uppercase">{judge.role}</span>
                        </td>
                        <td class="p-4">
                            {#if judge.judgeAssignments.length > 0}
                                <div class="flex flex-wrap gap-1">
                                    {#each judge.judgeAssignments.slice(0, 10) as assignment}
                                        <span class="bg-white border border-secondary/10 text-secondary px-1.5 py-0.5 rounded text-xs font-mono">
                                            {assignment.project?.name ?? '?'}{#if assignment.project?.tableNumber} (#{assignment.project.tableNumber}){/if}
                                        </span>
                                    {/each}
                                    {#if judge.judgeAssignments.length > 10}
                                        <span class="text-xs text-secondary/50">+{judge.judgeAssignments.length - 10} more</span>
                                    {/if}
                                </div>
                            {:else}
                                <span class="text-secondary/30 italic">No assignments</span>
                            {/if}
                        </td>
                        {#if data.timePerTable}
                            <td class="p-4">
                                {#if judge.judgeAssignments[0]?.startedAt}
                                    {@const active = judge.judgeAssignments[0]}
                                    {@const end = active.completedAt ? new Date(active.completedAt).getTime() : now}
                                    {@const elapsed = Math.floor((end - new Date(active.startedAt!).getTime()) / 1000)}
                                    {@const total = data.timePerTable * 60}
                                    {@const pct = elapsed / total}
                                    <span class="text-sm font-mono font-bold tabular-nums px-2 py-0.5 rounded-md
                                        {pct >= 1     ? 'bg-red-500 text-white animate-pulse' :
                                         pct >= 0.75  ? 'bg-red-100 text-red-600' :
                                         pct >= 0.5   ? 'bg-orange-100 text-orange-600' :
                                                        'bg-secondary/10 text-secondary/70'}">
                                        {formatTime(elapsed)} / {formatTime(total)}
                                    </span>
                                {:else}
                                    <span class="text-secondary/30 text-sm">—</span>
                                {/if}
                            </td>
                        {/if}
                        <td class="p-4 text-right flex gap-1 justify-end">
                             <Button
                                class="text-xs border-none shadow-none"
                                onclick={() => openEditModal(judge)}
                            >
                                Assign
                            </Button>
                            <Button
                                class="text-xs border-none shadow-none"
                                onclick={() => openCurveModal(judge)}
                            >
                                Curve: {judge.curve ?? 0}
                            </Button>
                            <Button
                                class="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 border-none shadow-none disabled:opacity-50"
                                onclick={() => resendLink(judge)}
                                disabled={resendingId === judge.id}
                            >
                                {resendingId === judge.id ? "Sending..." : "Resend Link"}
                            </Button>
                            <Button
                                class="text-xs bg-red-500 hover:bg-red-600 text-white border-none shadow-none"
                                onclick={() => { judgeToRemove = judge; showRemoveJudgeModal = true; }}
                            >
                                Remove
                            </Button>
                        </td>
                    </tr>
                {/each}
                {#if data.judges.length === 0}
                    <tr>
                        <td colspan={data.timePerTable ? 5 : 4} class="p-8 text-center text-secondary/40 italic">
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
                            class="flex items-center gap-1 bg-white text-secondary px-2 py-1 rounded text-sm shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                            onclick={() => removeTable(table)}
                        >
                            <span class="font-bold">{projectByTable[table]?.name ?? `Table ${table}`}</span>
                            <span class="font-mono text-xs opacity-60">#{table}</span>
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
                        onclick={(e) => { }}
                        onchange={addTable}
                    >
                        <option value="" class="text-secondary">Select a table to add...</option>
                        {#each availableTables as table}
                            <option value={table} class="text-secondary">{projectByTable[table]?.name ?? `Table ${table}`} (#{table})</option>
                        {/each}
                    </select>
                </div>
            </div>

        </form>
    {/if}
</Modal>

<form method="POST" action="?/removeJudge" bind:this={removeJudgeForm} use:enhance class="hidden">
    <input type="hidden" name="userId" value={judgeToRemove?.id ?? ""} />
</form>

<Modal
    open={showCurveModal}
    title={`Curve for ${curveJudge?.name}`}
    confirmText="Save"
    onConfirm={handleCurveConfirm}
    onCancel={() => showCurveModal = false}
>
    {#if curveJudge}
        <form
            bind:this={curveForm}
            method="POST"
            action="?/updateCurve"
            use:enhance={submitCurve}
            class="space-y-3"
        >
            <input type="hidden" name="userId" value={curveJudge.id} />
            <p class="text-sm text-white/70">Score modifier added to each category score for this judge.</p>
            <div class="space-y-1">
                <label class="text-xs font-bold text-white/70 uppercase tracking-wider block">Curve</label>
                <input
                    type="number"
                    name="curve"
                    step="0.1"
                    value={curveJudge.curve ?? 0}
                    class="w-full rounded-md border-white/20 bg-white/10 text-white shadow-sm focus:border-accent focus:ring-accent text-sm"
                />
            </div>
        </form>
    {/if}
</Modal>

<Modal
    open={showRemoveJudgeModal}
    title="Remove Judge"
    message={`Are you sure you want to remove ${judgeToRemove?.name}? Their role will be reverted and all table assignments will be cleared.`}
    onConfirm={handleRemoveConfirm}
    onCancel={() => showRemoveJudgeModal = false}
/>

<Modal
    open={showImportModal}
    title="Import Judges from CSV"
    confirmText={importDone ? "Done" : isImporting ? `Sending ${csvRows.filter(r => r.status === 'done' || r.status === 'error').length}/${csvRows.length}...` : `Send ${pendingImportCount} Invitation${pendingImportCount === 1 ? '' : 's'}`}
    onConfirm={importDone ? () => showImportModal = false : importJudges}
    onCancel={() => showImportModal = false}
>
    <div class="space-y-4">
        <p class="text-sm text-white/70">
            Upload a CSV with an <code class="bg-white/10 px-1 rounded">email</code> column and optional <code class="bg-white/10 px-1 rounded">name</code> column. Header row is optional.
        </p>
        <input
            type="file"
            accept=".csv,text/csv"
            onchange={handleFileChange}
            class="text-sm text-white/70 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-white/20 file:text-white hover:file:bg-white/30"
        />
        {#if csvRows.length > 0}
            <div class="max-h-56 overflow-y-auto rounded-md border border-white/20">
                <table class="w-full text-xs">
                    <thead class="bg-white/10 sticky top-0">
                        <tr>
                            <th class="p-2 text-left text-white/60 font-bold">Email</th>
                            <th class="p-2 text-left text-white/60 font-bold">Name</th>
                            <th class="p-2 text-center text-white/60 font-bold w-16">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each csvRows as row}
                            <tr class="border-t border-white/10">
                                <td class="p-2 text-white/80 font-mono">{row.email}</td>
                                <td class="p-2 text-white/70">{row.name}</td>
                                <td class="p-2 text-center">
                                    {#if row.status === 'done'}
                                        <span class="text-green-400">✓</span>
                                    {:else if row.status === 'error'}
                                        <span class="text-red-400">✗</span>
                                    {:else if row.status === 'sending'}
                                        <span class="text-white/50 animate-pulse">...</span>
                                    {:else}
                                        <span class="text-white/30">—</span>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            <p class="text-xs text-white/40">{csvRows.length} row{csvRows.length === 1 ? '' : 's'} parsed</p>
        {/if}
    </div>
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
