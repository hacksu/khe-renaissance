<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$components/Button.svelte";
    import Modal from "$components/Modal.svelte";
    import Icon from "@iconify/svelte";
    import { authClient } from "$lib/client";
    import { invalidateAll } from "$app/navigation";
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    type Judge = PageData['judges'][number];

    // Add Judge State
    let showAddJudgeModal = $state(false);
    let newJudgeEmail = $state("");
    let isAddingJudge = $state(false);
    let resendingId = $state<string | null>(null);

    // Remove Judge State
    let showRemoveJudgeModal = $state(false);
    let judgeToRemove = $state<Judge | null>(null);
    let removeJudgeForm = $state<HTMLFormElement | undefined>();

    // Inline track editing
    let editingTrackId = $state<string | null>(null);
    let editingTrackValue = $state<string>("");

    function startEditTrack(judge: Judge) {
        editingTrackId = judge.id;
        editingTrackValue = judge.judgeTrack ?? "";
    }

    function cancelEditTrack() {
        editingTrackId = null;
        editingTrackValue = "";
    }

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

    async function resendLink(judge: Judge) {
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

    function handleRemoveConfirm() {
        if (removeJudgeForm) removeJudgeForm.requestSubmit();
        showRemoveJudgeModal = false;
    }

    $effect(() => {
        const poll = setInterval(() => invalidateAll(), 10_000);
        return () => clearInterval(poll);
    });
</script>

<div class="p-6 pt-24 min-h-screen">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold font-serif text-secondary">Judges</h1>
            <p class="text-secondary/70">Pairwise judging overview — comparisons completed and current assignment status.</p>
        </div>
        <div class="flex gap-2">
            <Button onclick={() => showAddJudgeModal = true} class="bg-primary text-white whitespace-nowrap">
                Add Judge
            </Button>
        </div>
    </div>

    <div class="bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm overflow-hidden">
        <table class="w-full text-left text-sm">
            <thead class="bg-secondary/5 border-b border-secondary/10 text-secondary/60 uppercase tracking-widest text-xs">
                <tr>
                    <th class="p-4 font-bold">Judge</th>
                    <th class="p-4 font-bold">Track</th>
                    <th class="p-4 font-bold text-center w-36">Completed</th>
                    <th class="p-4 font-bold">Current Assignment</th>
                    <th class="p-4 font-bold text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-secondary/5">
                {#each data.judges as judge}
                    {@const currentPair = judge.pairAssignments[0] ?? null}
                    <tr class="hover:bg-white/50 transition-colors">
                        <td class="p-4">
                            <div class="font-bold text-secondary">{judge.name}</div>
                            <div class="text-xs text-secondary/50">{judge.email}</div>
                        </td>
                        <td class="p-4">
                            {#if editingTrackId === judge.id}
                                <form
                                    method="POST"
                                    action="?/updateTrack"
                                    use:enhance={() => {
                                        return async ({ update }: { update: () => Promise<void> }) => {
                                            editingTrackId = null;
                                            await update();
                                        };
                                    }}
                                    class="flex items-center gap-2"
                                >
                                    <input type="hidden" name="userId" value={judge.id} />
                                    <input
                                        type="text"
                                        name="judgeTrack"
                                        bind:value={editingTrackValue}
                                        placeholder="General"
                                        class="w-32 text-sm rounded border border-secondary/20 px-2 py-1 text-secondary"
                                    />
                                    <button type="submit" class="text-accent text-xs font-bold hover:underline">Save</button>
                                    <button type="button" onclick={cancelEditTrack} class="text-secondary/50 text-xs hover:underline">Cancel</button>
                                </form>
                            {:else}
                                <div class="flex items-center gap-2">
                                    <span class="inline-block bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs font-bold">
                                        {judge.judgeTrack ?? "General"}
                                    </span>
                                    <button onclick={() => startEditTrack(judge)} class="text-accent text-xs hover:underline">Edit</button>
                                </div>
                            {/if}
                        </td>
                        <td class="p-4 text-center">
                            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent text-sm font-bold">
                                {judge._count.pairAssignments}
                            </span>
                        </td>
                        <td class="p-4">
                            {#if currentPair}
                                <div class="flex items-center gap-2">
                                    <span class="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    <span class="text-secondary/70 text-xs">
                                        {currentPair.projectA.name} vs {currentPair.projectB.name}
                                    </span>
                                </div>
                            {:else}
                                <span class="text-secondary/30 italic text-xs">No active assignment</span>
                            {/if}
                        </td>
                        <td class="p-4 text-right flex gap-1 justify-end">
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
                        <td colspan="5" class="p-8 text-center text-secondary/40 italic">No judges found.</td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>

<!-- Hidden remove form -->
<form method="POST" action="?/removeJudge" bind:this={removeJudgeForm} use:enhance class="hidden">
    <input type="hidden" name="userId" value={judgeToRemove?.id ?? ""} />
</form>

<Modal
    open={showRemoveJudgeModal}
    title="Remove Judge"
    message={`Are you sure you want to remove ${judgeToRemove?.name}? Their role will be reverted.`}
    onConfirm={handleRemoveConfirm}
    onCancel={() => showRemoveJudgeModal = false}
/>

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
