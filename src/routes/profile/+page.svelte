<script lang="ts">
    import { enhance } from "$app/forms";
    import { authClient } from "$lib/client";
    import Button from "../../components/Button.svelte";
    import Card from "../../components/Card.svelte";
    import Input from "../../components/Input.svelte";
    import Select from "../../components/Select.svelte";

    const auth = authClient.useSession();
    const user = $derived($auth.data?.user);

    const { data } = $props();
    const application = $derived(data.application);
    
    let loading = $state(false);
</script>

<div class="py-24 px-4 md:px-24 lg:px-60 xl:px-96 flex flex-col gap-4 justify-center text-black">
    <Card padded>
        <div class="w-full">
            <h3 class="font-bold">Hi {user?.name}!</h3>
            <p>
                Welcome to your Kent Hack Enough profile. You can edit and
                submit your application from here. If you submit your
                application and need to edit it later, don't worry! You can
                always go back, edit and re-submit the application later.
            </p>
            <p class="mt-5">
                Your current application status is:
                {#if application.approved}
                    <span class="font-bold text-green-400">approved</span>
                {:else}
                    <span class="font-bold text-red-400">unapproved</span>
                {/if}
            </p>
        </div>
    </Card>
    <Card padded>
        <form enctype="multipart/form-data" method="POST" use:enhance={() => {
            loading = true;
            return async ({ update }) => {
                await update({ reset: false });
                loading = false;
            }
        }}>
            <div class="w-full flex flex-col gap-4">
                <div>
                    <h3 class="font-bold">Personal</h3>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <Input label="First Name" name="first-name" value={application.firstName} />
                        <Input label="Last Name" name="last-name" value={application.lastName} />
                        <Input label="Age" name="age" type="number" value={application.age} />
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <Input label="Phone Number" name="phone-number" type="tel" value={application.phoneNumber} />
                        <Input label="Email" name="email" type="email" value={application.email || user?.email} />
                    </div>
                    <Select label="Country of Residence" name="country-of-residence" value={application.countryOfResidence}>
                        {#each Object.entries(data.countries) as [code, name]}
                            <option value={code}>{name}</option>
                        {/each}
                    </Select>
                </div>
                <div>
                    <h3 class="font-bold">Education</h3>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <Select label="School" name="school" value={application.school}>
                            {#each data.schools as school}
                                <option>{school}</option>
                            {/each}
                        </Select>
                        <Select label="Level of Study" name="level-of-study" value={application.levelOfStudy}>
                            <option>Less than Secondary / High School</option>
                            <option>Secondary / High School</option>
                            <option>Undergraduate University (2 year - community college or similar)</option>
                            <option>Undergraduate University (3+ year)</option>
                            <option>Graduate University (Masters, Professional, Doctoral, etc)</option>
                            <option>Code School / Bootcamp</option>
                            <option>Other Vocational / Trade Program or Apprenticeship</option>
                            <option>Post Doctorate</option>
                            <option>Other </option>
                            <option>I'm not currently a student</option>
                            <option>Prefer not to answer</option>
                        </Select>
                        <Input label="Major" name="field-of-study" value={application.fieldOfStudy} />
                    </div>
                </div>
                <div>
                    <h3 class="font-bold">Demographics</h3>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <Select label="Gender" name="gender" value={application.gender}>
                            <option>Man</option>
                            <option>Woman</option>
                            <option>Non-Binary</option>
                            <option>Prefer to self-describe</option>
                            <option>Prefer Not to Answer</option>
                        </Select>
                        <Select label="Pronouns" name="pronouns" value={application.pronouns}>
                            <option>She/Her</option>
                            <option>He/Him</option>
                            <option>They/Them</option>
                            <option>She/They</option>
                            <option>He/They</option>
                            <option>Prefer Not to Answer</option>
                            <option>Other</option>
                        </Select>
                    </div>
                    <Select label="Dietary Restriction" name="dietary-restriction" value={application.dietaryRestriction}>
                        <option>Vegetarian</option>
                        <option>Vegan</option>
                        <option>Celiac Disease</option>
                        <option>Allergies</option>
                        <option>Kosher</option>
                        <option>Halal</option>
                    </Select>
                </div>
                <div>
                    <h3 class="font-bold">Portfolio</h3>
                    <div class="flex flex-col gap-2">
                        <Input label="Personal Website" name="personal-url" value={application.personalUrl} />
                        <Input label="Github" name="github-url" value={application.githubUrl} />
                        <Input label="Resume" name="resume" type="file" accept=".pdf" />
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <Button type="submit" formaction="?/save" disabled={loading}>Save</Button>
                    <Button type="submit" formaction="?/submit" disabled={loading}>{application.submitted ? "Un-submit" : "Submit"}</Button>
                </div>
            </div>
        </form>
    </Card>
</div>
