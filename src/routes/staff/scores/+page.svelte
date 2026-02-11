<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { onMount } from "svelte";
    import Button from "$components/Button.svelte";
    import Icon from "@iconify/svelte";
    import Modal from "$components/Modal.svelte";

    let { data } = $props();
    let isClearing = $state(false);
    let isEmailing = $state(false);
    
    let showEmailModal = $state(false);
    let emailForm: HTMLFormElement;

    // We can rely on correct form behavior with the modal
    const handleEmailConfirm = () => {
        if (emailForm) emailForm.requestSubmit();
        showEmailModal = false;
    };

    let showSingleEmailModal = $state(false);
    let selectedTeamId = $state<string>("");
    let selectedTeamName = $state<string>("");
    let isSendingSingleEmail = $state(false);
    let singleEmailForm: HTMLFormElement;

    const handleSingleEmailConfirm = () => {
        if (singleEmailForm) singleEmailForm.requestSubmit();
        showSingleEmailModal = false;
    };


    const confirmClear = () => {
        return confirm("Are you sure? This will delete ALL judgements and assignments. This cannot be undone.");
    };

    onMount(() => {
        const interval = setInterval(() => {
            invalidateAll();
        }, 5000);

        return () => clearInterval(interval);
    });
</script>

<Modal
    open={showEmailModal}
    title="Email All Teams?"
    message="This will send an email to ALL team members with their score breakdown and comments. This action cannot be undone."
    confirmText="Send Emails"
    onConfirm={handleEmailConfirm}
    onCancel={() => showEmailModal = false}
/>

<Modal
    open={showSingleEmailModal}
    title={`Email ${selectedTeamName}?`}
    message="This will send an email to the team members with their score breakdown and comments."
    confirmText={isSendingSingleEmail ? "Sending..." : "Send Email"}
    onConfirm={handleSingleEmailConfirm}
    onCancel={() => showSingleEmailModal = false}
/>

<!-- Hidden form for single team email -->
<form method="POST" action="?/emailTeam" bind:this={singleEmailForm} use:enhance={() => {
    isSendingSingleEmail = true;
    return async ({ update }) => {
        isSendingSingleEmail = false;
        await update();
        alert(`Email sent to ${selectedTeamName} successfully!`);
    };
}} class="hidden">
    <input type="hidden" name="id" value={selectedTeamId} />
</form>

<div class="p-6 pt-24 min-h-screen">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold font-serif text-secondary">Results & Scores</h1>
            <p class="text-secondary/70">Live ranking of teams based on average judge scores.</p>
        </div>
        
        <div class="flex gap-2">
            <!-- Email Form (Hidden) -->
            <form method="POST" action="?/emailResults" bind:this={emailForm} use:enhance={() => {
                isEmailing = true;
                return async ({ update }) => {
                    isEmailing = false;
                    await update();
                    alert("Emails sent successfully!");
                };
            }} class="hidden"></form>

            <button 
                onclick={() => showEmailModal = true}
                disabled={isEmailing}
                class="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-bold text-sm disabled:opacity-50"
            >
                <Icon icon="mdi:email-outline" />
                {isEmailing ? "Sending..." : "Email Results"}
            </button>

            <form method="POST" action="?/clearAll" use:enhance={() => {
                if(!confirmClear()) return ({ update }) => update({ reset: false }); // Cancel
                isClearing = true;
                return async ({ update }) => {
                    isClearing = false;
                    await update();
                };
            }}>
                <button class="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-bold text-sm">
                    <Icon icon="mdi:trash-can-outline" />
                    Clear All Scores
                </button>
            </form>
        </div>
    </div>

    <!-- Leaderboard Table -->
    <div class="space-y-12">
        {#each Object.entries(data.results) as [track, results]}
            <div class="space-y-4">
                <div class="flex items-center gap-4">
                    <h2 class="text-xl font-bold font-serif text-secondary">{track}</h2>
                    <div class="h-px flex-1 bg-secondary/10"></div>
                </div>

                <div class="bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm overflow-hidden">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-secondary/5 border-b border-secondary/10 text-secondary/60 uppercase tracking-widest text-xs">
                            <tr>
                                <th class="p-4 font-bold w-16 text-center">Rank</th>
                                <th class="p-4 font-bold">Team</th>
                                <th class="p-4 font-bold text-center w-24">Judges</th>
                                <th class="p-4 font-bold text-right w-32">Avg Score</th>
                                <th class="p-4 font-bold text-right w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-secondary/5">
                            {#each results as result, i}
                                <tr class="hover:bg-white/50 transition-colors">
                                    <td class="p-4 font-mono text-secondary/50 text-center">#{i + 1}</td>
                                    <td class="p-4 font-bold text-secondary">
                                        {result.name}
                                        {#if result.tableNumber}
                                            <span class="ml-2 text-xs font-normal text-secondary/50 bg-secondary/5 px-1.5 py-0.5 rounded">T-{result.tableNumber}</span>
                                        {/if}
                                    </td>
                                    <td class="p-4 text-center">
                                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10 text-xs font-bold text-secondary">
                                            {result.judgementCount}
                                        </span>
                                    </td>
                                    <td class="p-4 text-right font-mono font-bold text-lg text-accent">
                                        {result.averageScore}
                                    </td>
                                    <td class="p-4 text-right">
                                        <button 
                                            onclick={() => {
                                                selectedTeamId = result.id;
                                                selectedTeamName = result.name;
                                                showSingleEmailModal = true;
                                            }}
                                            class="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                            title="Send feedback email to this team"
                                        >
                                            Email Feedback
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                            {#if results.length === 0}
                                <tr>
                                    <td colspan="4" class="p-8 text-center text-secondary/40 italic">
                                        No scores recorded yet.
                                    </td>
                                </tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        {/each}

        {#if Object.keys(data.results).length === 0}
            <div class="text-center py-20 text-secondary/40 italic">
                No projects found.
            </div>
        {/if}
    </div>
</div>
