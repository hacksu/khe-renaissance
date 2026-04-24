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
    import Datalist from "../../components/form/Datalist.svelte";
    import { goto, beforeNavigate } from "$app/navigation";

    const auth = authClient.useSession();
    const user = $derived($auth.data?.user);

    async function logout() {
        await authClient.signOut();
        goto("/auth/login");
    }

    const { data } = $props();
    const application = $derived(data.application);

    let loading = $state(false);
    let mlhCodeChecked = $state(application?.mlhCodeOfConduct ?? false);
    let mlhAuthChecked = $state(application?.mlhAuthorization ?? false);
    let schoolNotFound = $state(false);
    let schoolValue = $state(application?.school ?? "");

    let firstName        = $state(application?.firstName ?? "");
    let lastName         = $state(application?.lastName ?? "");
    let phoneNumber      = $state(application?.phoneNumber ?? "");
    let email            = $state(application?.email ?? "");
    let countryOfResidence = $state(application?.countryOfResidence ?? "");
    let levelOfStudy     = $state(application?.levelOfStudy ?? "");
    let fieldOfStudy     = $state(application?.fieldOfStudy ?? "");
    let gender           = $state(application?.gender ?? "");
    let pronouns         = $state(application?.pronouns ?? "");
    let githubUrl        = $state(application?.githubUrl ?? "");
    let tshirtSize       = $state(application?.tshirtSize ?? "");
    let referral         = $state(application?.heardAboutUs ?? "");

    const stepDone = $derived([
        !!(firstName && lastName && phoneNumber && email && countryOfResidence),
        !!(schoolValue && levelOfStudy && fieldOfStudy),
        true,
        true,
        !!(githubUrl),
        !!(tshirtSize && referral),
        mlhCodeChecked && mlhAuthChecked,
    ]);
    const allStepsDone = $derived(stepDone.every(Boolean));

    const canSubmit = $derived(mlhCodeChecked && mlhAuthChecked);
    const canSubmitFull = $derived(allStepsDone && canSubmit);

    let step = $state(0);
    const STEPS = [
        { label: "Personal",   title: "Who are you?",           subtitle: "Just the basics." },
        { label: "Education",  title: "Where do you study?",    subtitle: "Tell us about your academic background." },
        { label: "Identity",   title: "About you",              subtitle: "Optional, helps us make KHE more inclusive." },
        { label: "Experience", title: "What do you build?",     subtitle: "Tell us about your skills and interests." },
        { label: "Portfolio",  title: "Show your work",         subtitle: "Links, ideas, and your resume." },
        { label: "Logistics",  title: "The details",            subtitle: "A few things to help us plan the event." },
        { label: "Finish",     title: "Almost there!",          subtitle: "Agree to the MLH policies and submit." },
    ];

    // Unsaved-changes tracking
    let isDirty = $state(false);

    beforeNavigate(({ cancel }) => {
        if (isDirty && !confirm("You have unsaved changes. If you leave now they'll be lost — continue?")) {
            cancel();
        }
    });

    $effect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    });

    // Change detection (for approved-application warning)
    let originalApplication = $state<any>(null);

    // Warning modal
    let showWarningModal = $state(false);
    let pendingSubmitter = $state<HTMLElement | null>(null);
    let warningConfirmed = $state(false);

    $effect(() => {
        if (application && !originalApplication) {
            originalApplication = { ...application };
        }
    });

    $effect(() => {
        schoolValue = application?.school ?? "";
        if (application?.school && !data.schools.includes(application.school)) {
            schoolNotFound = true;
        } else {
            schoolNotFound = false;
        }
    });

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
            raceEthnicity: formData.get("race-ethnicity"),
            sexuality: formData.get("sexuality"),
            firstGenStudent: formData.get("first-gen-student"),
            hackatonsAttended: formData.get("hackathons-attended"),
            experienceLevel: formData.get("experience-level"),
            areasOfInterest: (formData.getAll("areas-of-interest") as string[]).join(","),
            heardAboutUs: formData.get("heard-about-us"),
            linkedinUrl: formData.get("linkedin-url"),
            interestedInSponsors: formData.get("interested-in-sponsors"),
            teamPreference: formData.get("team-preference"),
            tshirtSize: formData.get("tshirt-size"),
            mlhCodeOfConduct: !!formData.get("mlh-code"),
            mlhAuthorization: !!formData.get("mlh-authorization"),
            mlhEmails: !!formData.get("mlh-emails"),
        };
        for (const [key, value] of Object.entries(formValues)) {
            if (originalApplication[key] !== value) return true;
        }
        return false;
    }

    function handleModalConfirm() {
        warningConfirmed = true;
        showWarningModal = false;
        if (pendingSubmitter) pendingSubmitter.click();
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
            <div class="flex justify-between items-start">
                <h3 class="font-bold">Hi {user?.name}!</h3>
                <button onclick={logout} class="text-xs text-white/60 hover:text-white transition-colors">Log out</button>
            </div>
            <p class="text-white/70 text-sm mt-1">
                Welcome to your Kent Hack Enough profile. Fill out your application — you can save at any point and come back later.
            </p>
            {#if data.applicationsClosed}
                <p class="mt-4 font-semibold text-red-400">KHE 2026 has ended. Applications are now closed.</p>
            {/if}
            {#if application}
                <p class="mt-3 text-sm">
                    Status:
                    {#if application.approved}
                        <span class="font-bold text-green-400">approved</span>
                    {:else if application.submitted}
                        <span class="font-bold text-yellow-400">under review</span>
                    {:else}
                        <span class="font-bold text-white/50">draft</span>
                    {/if}
                </p>
            {:else}
                <p class="mt-3 text-sm text-white/50">No application on file.</p>
            {/if}
        </div>
    </Card>

    {#if application}
        <Card padded>
            <div class="flex items-start w-full mb-8">
                {#each STEPS as s, i}
                    {#if i > 0}
                        <div class="flex-1 mt-[15px] h-0.5 transition-colors duration-500
                            {stepDone[i - 1] ? 'bg-castle-torchOrange' : 'bg-castle-stoneMid'}">
                        </div>
                    {/if}
                    <div
                        class="flex flex-col items-center gap-1 cursor-pointer"
                        role="button"
                        onclick={() => {
                            if (isDirty && i !== step && application.submitted) {
                                if (!confirm("You have unsaved changes. If you submit later, your approval status will be revoked and you'll need re-review. Continue navigating?")) return;
                            }
                            step = i;
                        }}
                        onkeydown={(e) => {
                            if (e.key !== 'Enter' && e.key !== ' ') return;
                            if (isDirty && i !== step && application.submitted) {
                                if (!confirm("You have unsaved changes. If you submit later, your approval status will be revoked and you'll need re-review. Continue navigating?")) return;
                            }
                            step = i;
                        }}
                    >
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                            {stepDone[i] && step !== i ? 'bg-castle-torchOrange text-white shadow-[0_0_8px_rgba(255,107,26,0.4)]' :
                             step === i && stepDone[i] ? 'bg-castle-torchOrange text-white shadow-[0_0_10px_rgba(255,107,26,0.6)]' :
                             step === i               ? 'border-2 border-castle-torchOrange text-castle-torchAmber' :
                                                        'border-2 border-castle-stoneMid text-castle-stoneHighlight hover:border-castle-stoneHighlight'}">
                            {stepDone[i] ? '✓' : i + 1}
                        </div>
                        <span class="text-xs hidden sm:block transition-colors duration-300 whitespace-nowrap
                            {step === i    ? 'text-white font-medium' :
                             stepDone[i]   ? 'text-castle-torchOrange/60' :
                                             'text-white/25'}">
                            {s.label}
                        </span>
                    </div>
                {/each}
            </div>

            <form enctype="multipart/form-data" method="POST" novalidate
                oninput={() => isDirty = true}
                onchange={() => isDirty = true}
                use:enhance={({ formData, cancel, submitter }) => {
                    if (data.applicationsClosed) { cancel(); return; }

                    const isSave   = submitter?.getAttribute("formaction") === "?/save";
                    const isSubmit = submitter?.getAttribute("formaction") === "?/submit";

                    if (application.approved && !warningConfirmed) {
                        if ((isSave || isSubmit) && hasFormChanges(formData)) {
                            cancel();
                            pendingSubmitter = submitter;
                            showWarningModal = true;
                            return;
                        }
                    }
                    if (warningConfirmed) {
                        warningConfirmed = false;
                        pendingSubmitter = null;
                    }

                    loading = true;
                    return async ({ update }) => {
                        await update({ reset: false });
                        loading = false;
                        isDirty = false;
                    };
                }}
            >
                <div class="{step !== 0 ? 'h-0 overflow-hidden' : 'flex flex-col gap-4'}">
                    <div>
                        <h3 class="font-bold text-lg text-white">{STEPS[0].title}</h3>
                        <p class="text-white/50 text-sm">{STEPS[0].subtitle}</p>
                    </div>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <Input label="First Name <span class='text-red-500'>*</span>" name="first-name" bind:value={firstName} />
                        <Input label="Last Name <span class='text-red-500'>*</span>" name="last-name" bind:value={lastName} />
                        <Input label="Age <span class='text-red-500'>*</span>" name="age" type="number" value={application.age} />
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <Input label="Phone Number <span class='text-red-500'>*</span>" name="phone-number" type="tel" bind:value={phoneNumber} />
                        <Input label="Email <span class='text-red-500'>*</span>" name="email" type="email" bind:value={email} />
                    </div>
                    <Datalist
                        label="Country of Residence <span class='text-red-500'>*</span>"
                        name="country-of-residence"
                        placeholder="Search your country"
                        options={Object.entries(data.countries).map(([code, name]) => ({ value: code, label: name }))}
                        bind:value={countryOfResidence}
                    />
                </div>
                <div class="{step !== 1 ? 'h-0 overflow-hidden' : 'flex flex-col gap-4'}">
                    <div>
                        <h3 class="font-bold text-lg text-white">{STEPS[1].title}</h3>
                        <p class="text-white/50 text-sm">{STEPS[1].subtitle}</p>
                    </div>
                    <div class="flex flex-col gap-1 w-full">
                        <div class={schoolNotFound ? "hidden" : "block"}>
                            <Datalist
                                label="School <span class='text-red-500'>*</span>"
                                name={schoolNotFound ? "" : "school"}
                                options={data.schools}
                                placeholder="Search your school"
                                bind:value={schoolValue}
                            />
                        </div>
                        <div class={schoolNotFound ? "block" : "hidden"}>
                            <Input
                                label="School <span class='text-red-500'>*</span>"
                                name={schoolNotFound ? "school" : ""}
                                placeholder="Enter your school name"
                                bind:value={schoolValue}
                            />
                        </div>
                        <div class="flex items-center gap-2 mt-1">
                            <Checkbox
                                checked={schoolNotFound}
                                onchange={(e) => schoolNotFound = e.currentTarget.checked}
                            >
                                I can't find my school
                            </Checkbox>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <Select label="Level of Study <span class='text-red-500'>*</span>" name="level-of-study" value={application.levelOfStudy} onchange={(e) => levelOfStudy = e.currentTarget.value}>
                            <option value="" disabled>Select...</option>
                            <option>Less than Secondary / High School</option>
                            <option>Secondary / High School</option>
                            <option>Undergraduate University (2 year - community college or similar)</option>
                            <option>Undergraduate University (3+ year)</option>
                            <option>Graduate University (Masters, Professional, Doctoral, etc)</option>
                            <option>Code School / Bootcamp</option>
                            <option>Other Vocational / Trade Program or Apprenticeship</option>
                            <option>Post Doctorate</option>
                            <option>Other</option>
                            <option>I'm not currently a student</option>
                            <option>Prefer not to answer</option>
                        </Select>
                        <Input label="Major <span class='text-red-500'>*</span>" name="field-of-study" bind:value={fieldOfStudy} />
                    </div>
                </div>

                <div class="{step !== 2 ? 'h-0 overflow-hidden' : 'flex flex-col gap-4'}">
                    <div>
                        <h3 class="font-bold text-lg text-white">{STEPS[2].title}</h3>
                        <p class="text-white/50 text-sm">{STEPS[2].subtitle}</p>
                    </div>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <Select label="Gender" name="gender" value={application.gender} onchange={(e) => gender = e.currentTarget.value}>
                            <option value="" disabled>Select...</option>
                            <option>Man</option>
                            <option>Woman</option>
                            <option>Non-Binary</option>
                            <option>Prefer to self-describe</option>
                            <option>Prefer Not to Answer</option>
                        </Select>
                        <Select label="Pronouns" name="pronouns" value={application.pronouns} onchange={(e) => pronouns = e.currentTarget.value}>
                            <option value="" disabled>Select...</option>
                            <option>She/Her</option>
                            <option>He/Him</option>
                            <option>They/Them</option>
                            <option>She/They</option>
                            <option>He/They</option>
                            <option>Prefer Not to Answer</option>
                            <option>Other</option>
                        </Select>
                    </div>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <Select label="Race / Ethnicity" name="race-ethnicity" value={application.raceEthnicity}>
                            <option value="">Prefer not to answer</option>
                            <option>American Indian or Alaska Native</option>
                            <option>Asian or Pacific Islander</option>
                            <option>Black or African American</option>
                            <option>Hispanic or Latino</option>
                            <option>White / Caucasian</option>
                            <option>Two or more ethnicities</option>
                            <option>Other</option>
                        </Select>
                        <Select label="Sexuality" name="sexuality" value={application.sexuality}>
                            <option value="">Prefer not to answer</option>
                            <option>Straight / Heterosexual</option>
                            <option>Gay or Lesbian</option>
                            <option>Bisexual</option>
                            <option>Prefer to self-describe</option>
                        </Select>
                    </div>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <Select label="First-generation college student?" name="first-gen-student" value={application.firstGenStudent}>
                            <option value="">Prefer not to answer</option>
                            <option>Yes</option>
                            <option>No</option>
                            <option>N/A</option>
                        </Select>
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
                </div>

                <div class="{step !== 3 ? 'h-0 overflow-hidden' : 'flex flex-col gap-4'}">
                    <div>
                        <h3 class="font-bold text-lg text-white">{STEPS[3].title}</h3>
                        <p class="text-white/50 text-sm">{STEPS[3].subtitle}</p>
                    </div>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <Select label="Hackathons attended" name="hackathons-attended" value={application.hackatonsAttended}>
                            <option value="">Prefer not to answer</option>
                            <option>0 — this is my first!</option>
                            <option>1–3</option>
                            <option>4–7</option>
                            <option>8+</option>
                        </Select>
                        <Select label="Experience level" name="experience-level" value={application.experienceLevel}>
                            <option value="">Prefer not to answer</option>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </Select>
                    </div>
                    <div>
                        <p class="text-sm mb-2">
                            Areas of interest
                            <span class="text-white/40 font-normal"> — select all that apply</span>
                        </p>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                            {#each [
                                "Web Development",
                                "Mobile Development",
                                "AI / Machine Learning",
                                "Cybersecurity",
                                "Game Development",
                                "Embedded / Hardware",
                                "Data Science",
                                "Blockchain",
                                "UX / Design",
                                "Robotics",
                                "Cloud / DevOps",
                                "Other",
                            ] as area}
                                <Checkbox
                                    name="areas-of-interest"
                                    value={area}
                                    checked={application.areasOfInterest?.split(",").includes(area)}
                                >
                                    {area}
                                </Checkbox>
                            {/each}
                        </div>
                    </div>
                </div>

                <div class="{step !== 4 ? 'h-0 overflow-hidden' : 'flex flex-col gap-4'}">
                    <div>
                        <h3 class="font-bold text-lg text-white">{STEPS[4].title}</h3>
                        <p class="text-white/50 text-sm">{STEPS[4].subtitle}</p>
                    </div>
                    <Input label="What are you planning to build?" name="project-idea" value={application.projectIdea} placeholder="Describe your idea, or just say you don't know yet!" />
                    <div class="flex flex-col sm:flex-row gap-2">
                        <Input label="GitHub <span class='text-red-500'>*</span>" name="github-url" bind:value={githubUrl} placeholder="https://github.com/..." />
                        <Input label="LinkedIn" name="linkedin-url" value={application.linkedinUrl} placeholder="https://linkedin.com/in/..." />
                    </div>
                    <Input label="Personal Website" name="personal-url" value={application.personalUrl} placeholder="https://..." />
                    <Input
                        label={data.hasResume
                            ? "Resume (already uploaded) — upload a new one to replace"
                            : "Resume <span class='text-red-500'>*</span>"}
                        name="resume"
                        type="file"
                        accept=".pdf"
                    />
                </div>

                <div class="{step !== 5 ? 'h-0 overflow-hidden' : 'flex flex-col gap-4'}">
                    <div>
                        <h3 class="font-bold text-lg text-white">{STEPS[5].title}</h3>
                        <p class="text-white/50 text-sm">{STEPS[5].subtitle}</p>
                    </div>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <Select label="T-shirt size <span class='text-red-500'>*</span>" name="tshirt-size" value={application.tshirtSize} onchange={(e) => tshirtSize = e.currentTarget.value}>
                            <option value="" disabled>Select a size</option>
                            <option>XS</option>
                            <option>S</option>
                            <option>M</option>
                            <option>L</option>
                            <option>XL</option>
                            <option>XXL</option>
                        </Select>
                        <Select label="How did you hear about KHE? <span class='text-red-500'>*</span>" name="heard-about-us" value={application.heardAboutUs} onchange={(e) => referral = e.currentTarget.value}>
                            <option value="" disabled>Who told you about us?</option>
                            <option>Instagram</option>
                            <option>LinkedIn</option>
                            <option>TikTok</option>
                            <option>YouTube</option>
                            <option>HacKSU Club Meeting</option>
                            <option>HacKSU Class Outreach</option>
                            <option>Friend / Word of mouth</option>
                            <option>Other Hackathon</option>
                            <option>Previous KHE attendee</option>
                            <option>Professor or faculty</option>
                            <option>MLH</option>
                            <option>Devpost</option>
                            <option>Other Campus club or organization</option>
                            <option>Campus flyer or poster</option>
                            <option>Email newsletter</option>
                            <option>Discord</option>
                            <option>Google search</option>
                        </Select>
                    </div>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <Select label="Interested in talking to sponsors?" name="interested-in-sponsors" value={application.interestedInSponsors}>
                            <option value="">Prefer not to answer</option>
                            <option>Yes! I'd love to meet recruiters!</option>
                            <option>Maybe</option>
                            <option>No thanks</option>
                        </Select>
                        <Select label="Team preference" name="team-preference" value={application.teamPreference}>
                            <option value="">Prefer not to answer</option>
                            <option>Going solo</option>
                            <option>I already have a full team</option>
                            <option>Looking for teammates</option>
                        </Select>
                    </div>
                </div>

                <div class="{step !== 6 ? 'h-0 overflow-hidden' : 'flex flex-col gap-4'}">
                    <div>
                        <h3 class="font-bold text-lg text-white">{STEPS[6].title}</h3>
                        <p class="text-white/50 text-sm">{STEPS[6].subtitle}</p>
                    </div>
                    <div class="flex flex-col gap-3">
                        <Checkbox name="mlh-code" checked={application.mlhCodeOfConduct} onchange={(e) => mlhCodeChecked = e.currentTarget.checked}>
                            I have read and agree to the <Link href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md">MLH Code of Conduct</Link>. <span class="text-red-500">*</span>
                        </Checkbox>
                        <Checkbox name="mlh-authorization" checked={application.mlhAuthorization} onchange={(e) => mlhAuthChecked = e.currentTarget.checked}>
                            I authorize you to share my application/registration information with Major League Hacking for event administration, ranking, and MLH administration in-line with the <Link href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md">MLH Privacy Policy</Link>. I further agree to the terms of both the <Link href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md">MLH Contest Terms and Conditions</Link> and the <Link href="https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md">MLH Privacy Policy</Link>. <span class="text-red-500">*</span>
                        </Checkbox>
                        <Checkbox name="mlh-emails" checked={application.mlhEmails}>
                            I authorize MLH to send me occasional emails about relevant events, career opportunities, and community announcements.
                        </Checkbox>
                    </div>
                    {#if !allStepsDone}
                        <p class="text-yellow-400/80 text-sm">
                            Some required fields are still missing: look for steps without a checkmark above.
                        </p>
                    {:else if !canSubmit}
                        <p class="text-red-400/80 text-sm">Check the first two boxes above to submit.</p>
                    {/if}
                </div>

                <div class="flex flex-col gap-3 mt-8 pt-4 border-t border-castle-stoneMid">
                    {#if !data.applicationsClosed && application.submitted}
                        <Button type="submit" formaction="?/submit" disabled={loading} class="w-full">
                            Un-submit
                        </Button>
                    {/if}
                    <div class="flex justify-between items-center">
                        <div>
                            {#if step > 0}
                                <button
                                    type="button"
                                    onclick={() => step--}
                                    class="text-sm text-white/50 hover:text-white transition-colors px-2 py-1"
                                >
                                    ← Back
                                </button>
                            {/if}
                        </div>

                        <div class="flex gap-2 items-center">
                            <Button type="submit" formaction="?/save" disabled={loading || data.applicationsClosed} class="bg-castle-stoneMid hover:bg-castle-stoneLight">
                                Save
                            </Button>
                            {#if !data.applicationsClosed}
                                {#if step < STEPS.length - 1}
                                    <Button type="button" onclick={() => { step++; window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={loading}>
                                        Next
                                    </Button>
                                {/if}
                                {#if (canSubmitFull || step === STEPS.length - 1) && !application.submitted}
                                    <Button type="submit" formaction="?/submit" disabled={loading || !canSubmitFull}>
                                        Submit
                                    </Button>
                                {/if}
                            {:else}
                                <p class="text-sm text-red-400">Applications are closed.</p>
                            {/if}
                        </div>
                    </div>
                </div>
            </form>
        </Card>
    {:else}
        <Card padded>
            <p class="text-white/90">
                KHE 2026 has ended, so new applications are not being accepted.
            </p>
        </Card>
    {/if}
</div>
