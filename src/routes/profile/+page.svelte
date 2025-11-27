<script lang="ts">
    import { enhance } from "$app/forms";
    import Checkbox from "$components/form/Checkbox.svelte";
    import Link from "$components/Link.svelte";
    import { authClient } from "$lib/client";
    import Button from "../../components/Button.svelte";
    import Card from "../../components/Card.svelte";
    import ConfirmationModal from "../../components/ConfirmationModal.svelte";
    import Input from "../../components/form/Input.svelte";
    import Select from "../../components/form/Select.svelte";

    const auth = authClient.useSession();
    const user = $derived($auth.data?.user);

    const { data } = $props();
    const application = $derived(data.application);
    
    let loading = $state(false);
    let showConfirmModal = $state(false);
    let pendingAction = $state<string | null>(null);
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
        }} onsubmit={(e) => {
            // If application is already approved, show confirmation modal
            if (application.approved && !pendingAction) {
                e.preventDefault();
                const submitter = (e as SubmitEvent).submitter as HTMLButtonElement;
                const action = submitter?.getAttribute('formaction');
                pendingAction = action;
                showConfirmModal = true;
                loading = false;
                return false;
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
                        <option value="">None</option>
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
                <div>
                    <h3 class="font-bold">MLH</h3>
                    <div class="mt-2 flex flex-col sm:flex-row justify-between">
                        <Checkbox name="mlh-code" checked={application.mlhCodeOfConduct}>I have read and agree to the <Link href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md">MLH Code of Conduct</Link>.</Checkbox>
                        <Checkbox name="mlh-authorization" checked={application.mlhAuthorization}>I authorize you to share my application/registration information with Major League Hacking for event administration, ranking, and MLH administration in-line with the <Link href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md">MLH Privacy Policy</Link>. I further agree to the terms of both the <Link href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md">MLH Contest Terms and Conditions</Link> and the <Link href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md">MLH Privacy Policy</Link>.</Checkbox>
                        <Checkbox name="mlh-emails" checked={application.mlhEmails}>I authorize MLH to send me occasional emails about relevant events, career opportunities, and community announcements.</Checkbox>
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

<ConfirmationModal 
    show={showConfirmModal}
    title="Warning: Approval Will Be Revoked"
    confirmText="Proceed"
    cancelText="Cancel"
    onConfirm={() => {
        showConfirmModal = false;
        // Submit the form with the pending action
        if (pendingAction) {
            const form = document.querySelector('form') as HTMLFormElement;
            const button = document.createElement('button');
            button.setAttribute('formaction', pendingAction);
            button.type = 'submit';
            button.style.display = 'none';
            form.appendChild(button);
            button.click();
            form.removeChild(button);
            pendingAction = null;
        }
    }}
    onCancel={() => {
        showConfirmModal = false;
        pendingAction = null;
        loading = false;
    }}
>
    <p class="mb-4">
        Your application has already been <strong class="text-green-400">approved</strong>. 
        Making changes will revoke your approval and you will need to wait for staff to re-approve your application.
    </p>
    <p>
        You will receive an email notification confirming the revocation.
    </p>
    <p class="mt-4 font-semibold">
        Are you sure you want to proceed?
    </p>
</ConfirmationModal>
