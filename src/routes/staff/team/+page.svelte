<script lang="ts">
    import Button from "$components/Button.svelte";
    import Modal from "$components/Modal.svelte";
    import Icon from "@iconify/svelte";
    import { authClient } from "$lib/client";
    import { invalidateAll } from "$app/navigation";

    let { data } = $props();

    let showInviteModal = $state(false);
    let newStaffEmail = $state("");
    let isInviting = $state(false);

    async function inviteStaff() {
        if (!newStaffEmail) return;
        isInviting = true;
        try {
            await fetch("/api/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newStaffEmail, role: "staff" })
            });
            await authClient.signIn.magicLink({
                email: newStaffEmail,
                callbackURL: "/staff",
                name: newStaffEmail.split("@")[0]
            });
            alert("Staff invitation sent!");
            showInviteModal = false;
            newStaffEmail = "";
            await invalidateAll();
        } catch (e) {
            alert("Failed to send invitation");
            console.error(e);
        } finally {
            isInviting = false;
        }
    }
</script>

<div class="p-6 pt-24 min-h-screen">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold font-serif text-secondary">Staff Team</h1>
            <p class="text-secondary/70">Manage staff members and send invitations.</p>
        </div>
        <Button onclick={() => showInviteModal = true} class="bg-primary text-white">
            <Icon icon="mdi:plus" /> Invite Staff
        </Button>
    </div>

    <div class="bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm overflow-hidden mb-6">
        <table class="w-full text-left text-sm">
            <thead class="bg-secondary/5 border-b border-secondary/10 text-secondary/60 uppercase tracking-widest text-xs">
                <tr>
                    <th class="p-4 font-bold">Name</th>
                    <th class="p-4 font-bold">Email</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-secondary/5">
                {#each data.staffMembers as member}
                    <tr class="hover:bg-white/50 transition-colors">
                        <td class="p-4 font-bold text-secondary">{member.name}</td>
                        <td class="p-4 text-secondary/70">{member.email}</td>
                    </tr>
                {/each}
                {#if data.staffMembers.length === 0}
                    <tr>
                        <td colspan="2" class="p-8 text-center text-secondary/40 italic">
                            No staff members found.
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>

    {#if data.pendingInvites.length > 0}
        <h2 class="text-lg font-bold font-serif text-secondary mb-3">Pending Invitations</h2>
        <div class="bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-secondary/5 border-b border-secondary/10 text-secondary/60 uppercase tracking-widest text-xs">
                    <tr>
                        <th class="p-4 font-bold">Email</th>
                        <th class="p-4 font-bold">Invited</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-secondary/5">
                    {#each data.pendingInvites as invite}
                        <tr class="hover:bg-white/50 transition-colors">
                            <td class="p-4 text-secondary">{invite.email}</td>
                            <td class="p-4 text-secondary/50">{new Date(invite.createdAt).toLocaleDateString()}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<Modal
    open={showInviteModal}
    title="Invite Staff Member"
    confirmText={isInviting ? "Sending..." : "Send Invitation"}
    onConfirm={inviteStaff}
    onCancel={() => showInviteModal = false}
>
    <div class="space-y-4">
        <p class="text-sm text-white/70">
            Enter the staff member's email address. They will receive a magic link to log in with staff access.
        </p>
        <div>
            <label class="text-xs font-bold text-white/70 uppercase tracking-wider block mb-1">Email Address</label>
            <input
                bind:value={newStaffEmail}
                type="email"
                placeholder="staff@example.com"
                class="w-full rounded-md border-white/20 bg-white/10 text-white shadow-sm focus:border-accent focus:ring-accent text-sm placeholder-white/50"
            />
        </div>
    </div>
</Modal>
