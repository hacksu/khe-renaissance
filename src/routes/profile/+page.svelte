<script lang="ts">
    import { enhance } from "$app/forms";
    import Checkbox from "$components/form/Checkbox.svelte";
    import Link from "$components/Link.svelte";
    import { authClient } from "$lib/client";
    import Modal from "../../components/Modal.svelte";
    import Button from "../../components/Button.svelte";
    import Card from "../../components/Card.svelte";
    import Input from "../../components/form/Input.svelte";
    import Select from "../../components/form/Select.svelte";

    const auth = authClient.useSession();
    const user = $derived($auth.data?.user);

    const { data } = $props();
    const application = $derived(data.application);
    
    let loading = $state(false);
    let mlhCodeChecked = $state(application?.mlhCodeOfConduct ?? false);
    let mlhAuthChecked = $state(application?.mlhAuthorization ?? false);
    
    const canSubmit = $derived(mlhCodeChecked && mlhAuthChecked);
    
    // Store original application state for change detection
    let originalApplication = $state<any>(null);
    
    // Modal state
    let showWarningModal = $state(false);
    let pendingSubmitter = $state<HTMLElement | null>(null);
    let warningConfirmed = $state(false);
    
    // Initialize original state on mount
    $effect(() => {
        if (application && !originalApplication) {
            originalApplication = { ...application };
        }
    });
    
    // Function to detect if form has changes
    function hasFormChanges(formData: FormData): boolean {
        if (!originalApplication) return false;
        
        const formValues: Record<string, any> = {
            firstName: formData.get("first-name"),
            lastName: formData.get("last-name"),
            phoneNumber: formData.get("phone-number"),
            email: formData.get("email"),
            countryOfResidence: formData.get("country-of-residence"),
            school: formData.get("school"),
            levelOfStudy: formData.get("level-of-study"),
            fieldOfStudy: formData.get("field-of-study"),
            githubUrl: formData.get("github-url"),
            projectIdea: formData.get("project-idea"),
            age: parseInt(formData.get("age") as string) || 18,
            dietaryRestriction: formData.get("dietary-restriction"),
            gender: formData.get("gender"),
            pronouns: formData.get("pronouns"),
            personalUrl: formData.get("personal-url"),
            mlhCodeOfConduct: !!formData.get("mlh-code"),
            mlhAuthorization: !!formData.get("mlh-authorization"),
            mlhEmails: !!formData.get("mlh-emails"),
        };
        
        // Compare each field with original
        for (const [key, value] of Object.entries(formValues)) {
            if (originalApplication[key] !== value) {
                return true;
            }
        }
        
        return false;
    }

    function handleModalConfirm() {
        warningConfirmed = true;
        showWarningModal = false;
        if (pendingSubmitter) {
            // Re-trigger the click on the button that caused the submit
            pendingSubmitter.click();
        }
    }

    function handleModalCancel() {
        showWarningModal = false;
        pendingSubmitter = null;
        warningConfirmed = false;
    }
</script>

<Modal 
    open={showWarningModal} 
    title="Warning: Approval Will Be Revoked" 
    message="Your application is currently approved. Making changes will revoke your approval and you will need to be re-approved. Do you want to continue?"
    onConfirm={handleModalConfirm}
    onCancel={handleModalCancel}
/>

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
        <form enctype="multipart/form-data" method="POST" use:enhance={({ formData, cancel, submitter }) => {
            // Check for changes
            const hasChanges = hasFormChanges(formData);
            
            // If application is approved AND has changes, warn the user
            // But ONLY if we haven't already confirmed the warning
            if (application.approved && hasChanges && !warningConfirmed) {
                cancel();
                pendingSubmitter = submitter;
                showWarningModal = true;
                return;
            }
            
            // Reset confirmation state after successful pass-through
            if (warningConfirmed) {
                warningConfirmed = false;
                pendingSubmitter = null;
            }

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
                        <Input label="First Name <span class='text-red-500'>*</span>" name="first-name" value={application.firstName} required />
                        <Input label="Last Name <span class='text-red-500'>*</span>" name="last-name" value={application.lastName} required />
                        <Input label="Age" name="age" type="number" value={application.age} required />
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <Input label="Phone Number <span class='text-red-500'>*</span>" name="phone-number" type="tel" value={application.phoneNumber} required />
                        <Input label="Email" name="email" type="email" value={application.email || user?.email} required />
                    </div>
                    <Select label="Country of Residence <span class='text-red-500'>*</span>" name="country-of-residence" value={application.countryOfResidence} required>
                        {#each Object.entries(data.countries) as [code, name]}
                            <option value={code}>{name}</option>
                        {/each}
                    </Select>
                </div>
                <div>
                    <h3 class="font-bold">Education</h3>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <Select label="School <span class='text-red-500'>*</span>" name="school" value={application.school} required>
                            {#each data.schools as school}
                                <option>{school}</option>
                            {/each}
                        </Select>
                        <Select label="Level of Study <span class='text-red-500'>*</span>" name="level-of-study" value={application.levelOfStudy} required>
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
                        <Input label="Major <span class='text-red-500'>*</span>" name="field-of-study" value={application.fieldOfStudy} required />
                    </div>
                </div>
                <div>
                    <h3 class="font-bold">Demographics</h3>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <Select label="Gender <span class='text-red-500'>*</span>" name="gender" value={application.gender} required>
                            <option>Man</option>
                            <option>Woman</option>
                            <option>Non-Binary</option>
                            <option>Prefer to self-describe</option>
                            <option>Prefer Not to Answer</option>
                        </Select>
                        <Select label="Pronouns <span class='text-red-500'>*</span>" name="pronouns" value={application.pronouns} required>
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
                        <Input label="What are you planning to build?" name="project-idea" value={application.projectIdea} />
                        <Input label="Personal Website" name="personal-url" value={application.personalUrl} />
                        <Input label="Github <span class='text-red-500'>*</span>" name="github-url" value={application.githubUrl} required />
                        <Input label="Resume <span class='text-red-500'>*</span>" name="resume" type="file" accept=".pdf" required />
                    </div>
                </div>
                <div>
                    <h3 class="font-bold">MLH</h3>
                    <div class="mt-2 flex flex-col sm:flex-row justify-between">
                        <Checkbox name="mlh-code" checked={application.mlhCodeOfConduct} onchange={(e) => mlhCodeChecked = e.currentTarget.checked}>I have read and agree to the <Link href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md">MLH Code of Conduct</Link>. <span class="text-red-500">*</span></Checkbox>
                        <Checkbox name="mlh-authorization" checked={application.mlhAuthorization} onchange={(e) => mlhAuthChecked = e.currentTarget.checked}>I authorize you to share my application/registration information with Major League Hacking for event administration, ranking, and MLH administration in-line with the <Link href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md">MLH Privacy Policy</Link>. I further agree to the terms of both the <Link href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md">MLH Contest Terms and Conditions</Link> and the <Link href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md">MLH Privacy Policy</Link>. <span class="text-red-500">*</span></Checkbox>
                        <Checkbox name="mlh-emails" checked={application.mlhEmails}>I authorize MLH to send me occasional emails about relevant events, career opportunities, and community announcements.</Checkbox>
                    </div>
                    {#if !canSubmit}
                        <p class="text-red-500 text-sm mt-2">* Required to submit application</p>
                    {/if}
                </div>
                
                <div class="flex justify-end gap-2">
                    <Button type="submit" formaction="?/save" disabled={loading}>Save</Button>
                    <Button type="submit" formaction="?/submit" disabled={loading || !canSubmit}>{application.submitted ? "Un-submit" : "Submit"}</Button>
                </div>
            </div>
        </form>
    </Card>
</div>
