<script lang="ts">
   import { enhance } from "$app/forms";
   import { slide, fade } from "svelte/transition";
   import Button from "$components/Button.svelte";
   import Card from "$components/Card.svelte";
   import Divider from "$components/Divider.svelte";
   import Input from "$components/form/Input.svelte";
   import Modal from "$components/Modal.svelte";
   import Icon from "@iconify/svelte";
   import { Utils } from "$lib/util";

   let { data } = $props();
   // data.projects, data.unassignedParticipants

   let showCreateModal = $state(false);
   let showAddMemberModal = $state(false);
   let showEditModal = $state(false);
   let selectedProjectForAdd = $state<any>(null);
   let selectedProjectForEdit = $state<any>(null);
   let isSubmitting = $state(false);
   
   let createForm: HTMLFormElement;
   let editForm: HTMLFormElement;
   let assignForm: HTMLFormElement;

   let searchTerm = $state("");
   // Filter unassigned
   let filteredUnassigned = $derived(
       (data.unassignedParticipants || []).filter(p => {
           const match = (p.firstName + " " + p.lastName + " " + p.email).toLowerCase();
           return match.includes(searchTerm.toLowerCase());
       })
   );

   function openAddMember(project: any) {
       selectedProjectForAdd = project;
       showAddMemberModal = true;
   }
   
   function openEditProject(project: any) {
         selectedProjectForEdit = project;
         showEditModal = true;
   }

   function handleCreateSubmit() {
       if (createForm) createForm.requestSubmit();
   }
   
   function handleEditSubmit() {
       if (editForm) editForm.requestSubmit();
   }

   const submitProject = () => {
        isSubmitting = true;
        return async ({ result, update }: { result: any, update: any }) => {
            isSubmitting = false;
            if (result.type === 'success') {
                showCreateModal = false;
            }
            await update();
        };
   };
   
   const submitEdit = () => {
        isSubmitting = true;
        return async ({ result, update }: { result: any, update: any }) => {
            isSubmitting = false;
            if (result.type === 'success') {
                showEditModal = false;
            }
            await update();
        };
   };
   
   const handleEnhance = () => {
        isSubmitting = true;
        return async ({ update }: { update: any }) => {
            isSubmitting = false;
            await update();
        };
   }
</script>

<div class="p-6 pt-24 min-h-screen">
    
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold font-serif text-secondary">Judging Management</h1>
            <p class="text-secondary/70">Create teams and assign participants.</p>
        </div>
        <Button onclick={() => showCreateModal = true}>+ Create Team</Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <!-- Projects Grid -->
        <div class="lg:col-span-2 space-y-4">
             <div class="flex justify-between items-end">
                <h2 class="font-bold text-lg text-secondary uppercase tracking-widest">Teams ({data.projects.length})</h2>
                <!-- Future: Sorting/Filtering controls -->
             </div>
             
             {#if data.projects.length === 0}
                <div in:fade class="p-12 text-center border-2 border-dashed border-secondary/20 rounded-xl">
                    <p class="text-secondary/50 font-bold text-lg mb-2">No Teams Created Yet</p>
                    <p class="text-secondary/40 text-sm">Click "Create Team" to get started.</p>
                </div>
             {/if}

             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each data.projects as project (project.id)}
                    <div in:slide|local class="bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm h-full flex flex-col transition-all hover:shadow-md">
                        <div class="p-4 flex flex-col h-full">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h3 class="font-bold text-xl text-secondary leading-tight">{project.name}</h3>
                                    <div class="flex flex-wrap gap-2 text-xs font-mono text-secondary/60 mt-1">
                                        <span class="bg-secondary/5 px-1.5 py-0.5 rounded">{project.track}</span>
                                        {#if project.tableNumber}<span class="bg-secondary/5 px-1.5 py-0.5 rounded">Table {project.tableNumber}</span>{/if}
                                    </div>
                                </div>
                                <button class="text-secondary/30 hover:text-accent transition-colors p-1" title="Edit Project" onclick={() => openEditProject(project)}>
                                    <Icon icon="mdi:pencil" width="18" />
                                </button>
                            </div>

                            <Divider class="my-3 opacity-50" />
                            
                            <div class="flex-1 space-y-2">
                                {#if project.members.length === 0}
                                    <div class="py-4 text-center">
                                        <p class="text-sm text-secondary/40 italic">No members assigned</p>
                                    </div>
                                {:else}
                                    <div class="space-y-1">
                                        {#each project.members as member (member.id)}
                                            <div transition:slide|local class="flex justify-between items-center bg-white/50 border border-secondary/5 rounded-md px-2 py-1.5 text-sm group">
                                                <div class="flex flex-col overflow-hidden">
                                                    <span class="truncate font-medium text-secondary">{Utils.concatExclude(" ", member.firstName, member.lastName)}</span>
                                                    <span class="truncate text-[10px] text-secondary/50">{member.email}</span>
                                                </div>
                                                <form method="POST" action="?/removeParticipant" use:enhance={handleEnhance} class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <input type="hidden" name="applicationId" value={member.id} />
                                                    <button class="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50" title="Remove Member" disabled={isSubmitting}>
                                                        <Icon icon="mdi:close" width="16" />
                                                    </button>
                                                </form>
                                            </div>
                                        {/each}
                                    </div>
                                {/if}
                            </div>

                            <div class="mt-4 pt-3 border-t border-secondary/10">
                                <Button 
                                    class="w-full text-xs py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border-none shadow-none" 
                                    onclick={() => openAddMember(project)}
                                >
                                    + Add Member
                                </Button>
                            </div>
                        </div>
                    </div>
                {/each}
             </div>
        </div>

        <!-- Unassigned Sidebar -->
        <div class="lg:sticky lg:top-24 bg-white/60 backdrop-blur-md rounded-xl border border-secondary/10 shadow-sm flex flex-col h-[calc(100vh-8rem)]">
            <div class="p-4 border-b border-secondary/5">
                <h2 class="font-bold text-sm text-secondary uppercase tracking-widest mb-1">Unassigned Pool</h2>
                <div class="flex justify-between items-end">
                     <p class="text-xs text-secondary/60">Checked-in but without a team</p>
                     <span class="bg-secondary/10 text-secondary text-xs font-bold px-2 py-0.5 rounded-full">{data.unassignedParticipants.length}</span>
                </div>
            </div>
            
            <div class="p-3 bg-secondary/5">
                <Input placeholder="Search people..." bind:value={searchTerm} class="bg-white border-none shadow-sm text-sm" />
            </div>
            
            <div class="overflow-y-auto flex-1 p-2 space-y-2">
                {#each filteredUnassigned as person}
                    <div class="p-3 bg-white hover:bg-white/80 rounded-lg border border-secondary/5 shadow-sm transition-all group">
                        <div class="flex justify-between items-start">
                            <p class="font-bold text-sm text-secondary">{Utils.concatExclude(" ", person.firstName, person.lastName)}</p>
                            <!-- Potential Quick Action -->
                        </div>
                        <p class="text-xs text-secondary/60 truncate">{person.email}</p>
                        {#if person.school}
                            <p class="text-[10px] text-secondary/40 font-mono mt-1 uppercase tracking-wide truncate">{person.school}</p>
                        {/if}
                    </div>
                {/each}
                 {#if filteredUnassigned.length === 0}
                    <div class="h-full flex flex-col items-center justify-center text-center p-4 text-secondary/40">
                        <Icon icon="mdi:account-off-outline" width="32" class="mb-2 opacity-50" />
                        <p class="text-sm">No matches found</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<!-- Create Project Modal -->
<Modal
    open={showCreateModal}
    title="Create New Team"
    onConfirm={handleCreateSubmit}
    onCancel={() => showCreateModal = false}
>
    <form method="POST" action="?/createProject" bind:this={createForm} use:enhance={submitProject} class="space-y-4">
        <Input name="name" label="Team Name" placeholder="e.g. The Hackers" required />
        <div class="grid grid-cols-2 gap-4">
             <div class="space-y-1">
                <label class="text-sm font-bold text-secondary">Track</label>
                <select name="track" class="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent">
                    <option value="General">General</option>
                    <option value="Business Analytics">Business Analytics</option>
                    <option value="Education Tech">Education Tech</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Consumer">Consumer</option>
                    <option value="New Frontiers">New Frontiers</option>
                </select>
             </div>
            <Input name="tableNumber" label="Table #" placeholder="e.g. 12" />
        </div>
    </form>
</Modal>

<!-- Add Member Modal -->
<Modal
    open={showAddMemberModal}
    title={`Add Member to ${selectedProjectForAdd?.name || 'Team'}`}
    confirmText="Done"
    onConfirm={() => showAddMemberModal = false}
    onCancel={() => showAddMemberModal = false}
>
    <div class="space-y-4 max-h-[60vh] overflow-hidden flex flex-col">
        <Input placeholder="Search to add..." bind:value={searchTerm} />
        <div class="overflow-y-auto flex-1 space-y-1 p-1">
            {#each filteredUnassigned as person}
                <form method="POST" action="?/assignParticipant" use:enhance class="flex justify-between items-center p-2 hover:bg-secondary/5 rounded group">
                    <div>
                        <p class="text-sm font-bold">{Utils.concatExclude(" ", person.firstName, person.lastName)}</p>
                        <p class="text-xs text-secondary/50">{person.email}</p>
                    </div>
                    <input type="hidden" name="projectId" value={selectedProjectForAdd?.id} />
                    <input type="hidden" name="applicationId" value={person.id} />
                    <button class="px-3 py-1 bg-secondary text-white text-xs rounded hover:bg-accent transition-colors">
                        Add
                    </button>
                </form>
            {/each}
            {#if filteredUnassigned.length === 0}
                <p class="text-center text-sm text-secondary/50">No matching participants.</p>
            {/if}
        </div>
    </div>
</Modal>

<!-- Edit Project Modal -->
<Modal
    open={showEditModal}
    title={`Edit ${selectedProjectForEdit?.name || 'Team'}`}
    onConfirm={handleEditSubmit}
    onCancel={() => showEditModal = false}
>
    {#if selectedProjectForEdit}
        <form method="POST" action="?/updateProject" bind:this={editForm} use:enhance={submitEdit} class="space-y-4">
            <input type="hidden" name="id" value={selectedProjectForEdit.id} />
            <Input name="name" label="Team Name" value={selectedProjectForEdit.name} required />
            <div class="grid grid-cols-2 gap-4">
                 <div class="space-y-1">
                    <label class="text-sm font-bold text-secondary">Track</label>
                    <select name="track" value={selectedProjectForEdit.track} class="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent text-black">
                        <option value="General">General</option>
                        <option value="Business Analytics">Business Analytics</option>
                        <option value="Education Tech">Education Tech</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Consumer">Consumer</option>
                        <option value="New Frontiers">New Frontiers</option>
                    </select>
                 </div>
                <Input name="tableNumber" label="Table #" value={selectedProjectForEdit.tableNumber || ''} />
            </div>
        </form>
    {/if}
</Modal>
