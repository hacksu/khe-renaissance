<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "$components/Button.svelte";
    import Card from "$components/Card.svelte";
    import Divider from "$components/Divider.svelte";
    import Input from "$components/form/Input.svelte";
    import { Utils } from "$lib/util";

    const { data } = $props();

    let term = $state("");
    const searchedApplications = $derived(data.applications
        .filter(({ firstName, lastName }) => `${firstName} ${lastName}`.includes(term)))

    async function exportEmails() {
        const approvedEmails = data.applications
            .filter(app => app.approved)
            .map(app => app.email)
            .join(',\n');
        
        const blob = new Blob([approvedEmails], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `approved-emails-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async function exportIdeas() {
        console.log('Export ideas clicked');
        console.log('Total applications:', data.applications.length);
        
        const applicationsWithIdeas = data.applications.filter(app => app.projectIdea);
        console.log('Applications with project ideas:', applicationsWithIdeas.length);
        console.log('Sample ideas:', applicationsWithIdeas.slice(0, 3));
        
        const ideas = applicationsWithIdeas
            .map(app => `${app.firstName} ${app.lastName}: ${app.projectIdea}`)
            .join('\n\n');
        
        console.log('Generated ideas text length:', ideas.length);
        console.log('First 200 chars:', ideas.substring(0, 200));
        
        if (ideas.length === 0) {
            console.log('No project ideas found!');
            alert('No project ideas to export');
            return;
        }
        
        const blob = new Blob([ideas], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-ideas-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
</script>

<div class="min-h-screen flex">
    <div class="p-2 mt-24 w-full h-full">
        <div class="mb-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-gray-800">Application Statistics</h2>
                <button 
                    onclick={exportEmails}
                    class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    Export Emails
                </button>
                <button 
                    onclick={exportIdeas}
                    class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                    Export Project Ideas
                </button>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                    <p class="text-xs uppercase tracking-wide text-gray-500 mb-1">Total</p>
                    <p class="text-3xl font-bold text-gray-900">{data.stats.total}</p>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                    <p class="text-xs uppercase tracking-wide text-green-600 mb-1">Approved</p>
                    <p class="text-3xl font-bold text-green-700">{data.stats.approved}</p>
                </div>
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <p class="text-xs uppercase tracking-wide text-blue-600 mb-1">Checked In</p>
                    <p class="text-3xl font-bold text-blue-700">{data.stats.checkedIn}</p>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <p class="text-xs uppercase tracking-wide text-purple-600 mb-1">Check In Rate</p>
                    <p class="text-3xl font-bold text-purple-700">{data.stats.approved > 0 ? Math.round((data.stats.checkedIn / data.stats.approved) * 100) : 0}%</p>
                </div>
            </div>
        </div>
        <Input placeholder="Search" bind:value={term} />
        <div class="mt-2 gap-2 flex flex-col sm:grid sm:grid-cols-3">
            {#each searchedApplications as application}
                <Card>
                    <div class="p-2 flex flex-col">
                        <h3 class="font-bold text-xl">{application.user.email}</h3>
                        <p class="text-xs">{application.id}</p>
                        <Divider>Personal</Divider>
                        <div class="flex justify-between">
                            <p>Name:</p>
                            <p class="font-semibold">{Utils.concatExclude(" ", application.firstName, application.lastName) || "EMPTY"}</p>
                        </div>
                        <div class="flex justify-between"><p>Gender:</p><p>{application.gender}</p></div>
                        <div class="flex justify-between"><p>Pronouns:</p><p>{application.pronouns}</p></div>
                        <div class="flex justify-between"><p>Phone:</p><p>{application.phoneNumber}</p></div>
                        <div class="flex justify-between"><p>Country of Residence:</p><p>{application.countryOfResidence}</p></div>
                        <div class="flex justify-between"><p>Dietary Restrictions:</p><p>{application.dietaryRestriction}</p></div>
                        <Divider>Education</Divider>
                        <div class="flex justify-between"><p>Field of Study:</p><p>{application.fieldOfStudy}</p></div>
                        <div class="flex justify-between"><p>Level of Study:</p><p>{application.levelOfStudy}</p></div>
                        <div class="flex justify-between"><p>School:</p><p>{application.school}</p></div>
                        <Divider>Portfolio</Divider>
                        <div class="flex justify-between"><p>Github:</p><p>{application.githubUrl}</p></div>
                        <div class="flex justify-between"><p>Personal:</p><p>{application.personalUrl}</p></div>
                         <div class="flex justify-between items-center">
                            <p>Resume:</p>
                            <a 
                                href={`/staff/resume/${application.id}`}
                                target="_blank"
                                class="text-blue-600 hover:text-blue-800 underline text-sm"
                            >
                                Download PDF
                            </a>
                        </div>
                        {#if application.projectIdea}
                            <div class="mt-2">
                                <p class="text-sm font-semibold mb-1">Project Idea:</p>
                                <p class="text-sm text-white whitespace-pre-wrap">{application.projectIdea}</p>
                            </div>
                        {/if}
                        <Divider>MLH</Divider>
                        <div class="flex justify-between"><p>MLH Authorization:</p><p class={``}>{application.mlhAuthorization ? "Yes" : "No"}</p></div>
                        <div class="flex justify-between"><p>MLH Code Of Conduct:</p><p>{application.mlhAuthorization ? "Yes" : "No"}</p></div>
                        <div class="flex justify-between"><p>MLH Emails:</p><p>{application.mlhAuthorization ? "Yes" : "No"}</p></div>
                        {#if application.submitted}
                            <Divider />
                            <form method="POST" use:enhance={() => {
                                return async ({ update }) => {
                                    await update({ reset: false })
                                }
                            }}>
                                <div class="flex gap-2">
                                    <input name="id" class="hidden" value={application.id} />
                                    {#if application.approved}
                                        <Button type="submit" formaction="?/approve">Un-approve</Button>
                                        {#if application.checkedIn}
                                            <Button type="submit" formaction="?/checkIn" disabled class="bg-green-600 hover:bg-green-600 cursor-not-allowed">✓ Checked In</Button>
                                        {:else}
                                            <Button type="submit" formaction="?/checkIn">Check In</Button>
                                        {/if}
                                    {:else}
                                        <Button type="submit" formaction="?/approve">Approve</Button>
                                    {/if}
                                </div>
                            </form>
                        {/if}
                    </div>
                </Card>
            {/each}
        </div>
    </div>
</div>



