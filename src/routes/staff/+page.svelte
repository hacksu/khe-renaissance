<script lang="ts">
    import Card from "$components/Card.svelte";
    import Divider from "$components/Divider.svelte";
    import { Utils } from "$lib/util";

    const { data } = $props();
    console.log(data);

</script>

<div class="min-h-screen flex">
    <div class="mt-24 w-full h-full p-2 gap-2 flex flex-col sm:grid sm:grid-cols-3">
        {#each data.applications as application}
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
                </div>
            </Card>
        {/each}
    </div>
</div>
