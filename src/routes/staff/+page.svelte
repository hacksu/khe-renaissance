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
        const formData = new FormData();
        const response = await fetch('?/exportEmails', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        if (result.type === 'success' && result.data?.emails) {
            const blob = new Blob([result.data.emails], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `approved-emails-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }
</script>

<div class="min-h-screen flex">
    <div class="p-2 mt-24 w-full h-full">
        <div class="mb-4 p-4 bg-gray-100 rounded-lg flex justify-between items-center">
            <div class="flex gap-8">
                <div>
                    <p class="text-sm text-gray-600">Total Applications</p>
                    <p class="text-2xl font-bold">{data.stats.total}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Approved</p>
                    <p class="text-2xl font-bold text-green-600">{data.stats.approved}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Checked In</p>
                    <p class="text-2xl font-bold text-blue-600">{data.stats.checkedIn}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Approval Rate</p>
                    <p class="text-2xl font-bold">{data.stats.total > 0 ? Math.round((data.stats.approved / data.stats.total) * 100) : 0}%</p>
                </div>
            </div>
            <Button onclick={exportEmails}>Export Approved Emails</Button>
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
                        <div class="flex justify-between"><p>Resume:</p><p>{application.personalUrl}</p></div>
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
                                        <Button type="submit" formaction="?/checkIn">Check In</Button>
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
