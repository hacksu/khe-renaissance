<script lang="ts">
    import { enhance } from "$app/forms";
    import Icon from "@iconify/svelte";
    import Checkbox from "$components/form/Checkbox.svelte";
    import Link from "$components/Link.svelte";
    import { authClient } from "$lib/client";
    import Modal from "../../components/Modal.svelte";
    import Button from "../../components/Button.svelte";
    import Card from "../../components/Card.svelte";
    import Input from "../../components/form/Input.svelte";
    import Select from "../../components/form/Select.svelte";
    import Datalist from "../../components/form/Datalist.svelte";
    import { goto } from "$app/navigation";

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
    const phoneValid     = $derived(phoneNumber === "" || /^\+?[\d\s\-().]{7,15}$/.test(phoneNumber));
    let email            = $state(application?.email ?? "");
    let countryOfResidence = $state(application?.countryOfResidence ?? "");
    let age              = $state(application?.age ?? null as number | null);
    const ageValid       = $derived(age === null || age === 0 || (age >= 13 && age <= 100));
    let levelOfStudy     = $state(application?.levelOfStudy ?? "");
    let fieldOfStudy     = $state(application?.fieldOfStudy ?? "");
    let gender           = $state(application?.gender ?? "");
    let pronouns         = $state(application?.pronouns ?? "");
    let githubUrl        = $state(application?.githubUrl ?? "");
    const githubValid    = $derived(githubUrl === "" || /^https:\/\/github\.com\/.+/.test(githubUrl));
    let linkedinUrl      = $state(application?.linkedinUrl ?? "");
    const linkedinValid  = $derived(linkedinUrl === "" || /^https:\/\/(www\.)?linkedin\.com\/in\/.+/.test(linkedinUrl));
    let personalUrl      = $state(application?.personalUrl ?? "");
    const personalValid  = $derived(personalUrl === "" || /^https?:\/\/.+\..+/.test(personalUrl));
    let tshirtSize       = $state(application?.tshirtSize ?? "");
    let referral         = $state(application?.heardAboutUs ?? "");

    const stepDone = $derived([
        !!(firstName && lastName && phoneNumber && phoneValid && email && countryOfResidence && ageValid),
        !!(schoolValue && levelOfStudy && fieldOfStudy),
        true,
        true,
        !!(githubUrl && githubValid && linkedinValid && personalValid),
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
        { label: "Background", title: "About you",              subtitle: "Optional demographic details that help us make KHE more inclusive." },
        { label: "Experience", title: "What do you build?",     subtitle: "Tell us about your skills and interests." },
        { label: "Portfolio",  title: "Show your work",         subtitle: "Links, ideas, and your resume." },
        { label: "Logistics",  title: "The details",            subtitle: "A few things to help us plan the event." },
        { label: "Finish",     title: "Almost there!",          subtitle: "Agree to the MLH policies and submit." },
    ];

    // Auto-save state
    type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
    let saveStatus = $state<SaveStatus>('idle');
    let saveDebounce: ReturnType<typeof setTimeout> | null = null;
    let formEl = $state<HTMLFormElement | null>(null);

    function scheduleAutoSave() {
        if (application?.submitted) return;
        if (saveDebounce) clearTimeout(saveDebounce);
        saveDebounce = setTimeout(autoSave, 800);
    }

    async function autoSave() {
        if (!formEl || application?.submitted) return;
        saveStatus = 'saving';
        try {
            const formData = new FormData(formEl);
            const res = await fetch('?/save', { method: 'POST', body: formData });
            saveStatus = res.ok ? 'saved' : 'error';
        } catch {
            saveStatus = 'error';
        }
        if (saveStatus === 'saved') setTimeout(() => { if (saveStatus === 'saved') saveStatus = 'idle'; }, 2000);
    }

    $effect(() => {
        schoolValue = application?.school ?? "";
        if (application?.school && !data.schools.includes(application.school)) {
            schoolNotFound = true;
        } else {
            schoolNotFound = false;
        }
    });

    // Unsubmit modal
    let showUnsubmitModal = $state(false);
    let unsubmitFormEl = $state<HTMLFormElement | null>(null);
</script>

<Modal
    open={showUnsubmitModal}
    title="Unsubmit application?"
    message={application?.approved
        ? "Your application is currently approved. Unsubmitting will revoke your approval and you will need to be re-reviewed by staff. Continue?"
        : "Are you sure you want to unsubmit your application? You can re-submit at any time before the deadline."}
    onConfirm={() => { showUnsubmitModal = false; unsubmitFormEl?.requestSubmit(); }}
    onCancel={() => { showUnsubmitModal = false; }}
/>

<div class="py-24 px-4 md:px-24 lg:px-60 xl:px-96 flex flex-col gap-4 justify-center text-black">
    <Card padded>
        <div class="w-full">
            <div class="flex justify-between items-start">
                <h3 class="font-bold">Hi {user?.name}!</h3>
                <button onclick={logout} class="text-xs text-white/60 hover:text-white transition-colors">Log out</button>
            </div>
            <p class="text-white/70 text-sm mt-1">
                Welcome to your Kent Hack Enough profile. Fill out your application and come back any time.
            </p>
            {#if application && !application.submitted}
                <p class="text-white/40 text-xs mt-1">Changes are saved automatically.</p>
            {/if}
            {#if data.applicationsClosed}
                <p class="mt-4 font-semibold text-red-400">KHE 2027 has ended. Applications are now closed.</p>
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
                                step = i;
                        }}
                        onkeydown={(e) => {
                            if (e.key !== 'Enter' && e.key !== ' ') return;
                                step = i;
                        }}
                    >
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                            {stepDone[i] && step !== i ? 'bg-castle-torchOrange text-white shadow-[0_0_8px_rgba(255,107,26,0.4)]' :
                             step === i && stepDone[i] ? 'bg-castle-torchOrange text-white shadow-[0_0_10px_rgba(255,107,26,0.6)]' :
                             step === i               ? 'border-2 border-castle-torchOrange text-castle-torchAmber' :
                                                        'border-2 border-castle-stoneMid text-castle-stoneHighlight hover:border-castle-stoneHighlight'}">
                            {#if stepDone[i]}<Icon icon="mdi:check" />{:else}{i + 1}{/if}
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
                bind:this={formEl}
                oninput={scheduleAutoSave}
                onchange={scheduleAutoSave}
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        await update({ reset: false });
                        loading = false;
                    };
                }}
            >
            <fieldset disabled={application.submitted} class="contents">
                <div class="{step !== 0 ? 'h-0 overflow-hidden' : 'flex flex-col gap-4'}">
                    <div>
                        <h3 class="font-bold text-lg text-white">{STEPS[0].title}</h3>
                        <p class="text-white/50 text-sm">{STEPS[0].subtitle}</p>
                    </div>
                    <div class="flex gap-2 flex-col sm:flex-row">
                        <div class="flex-1"><Input label="First Name <span class='text-red-500'>*</span>" name="first-name" bind:value={firstName} /></div>
                        <div class="flex-1"><Input label="Last Name <span class='text-red-500'>*</span>" name="last-name" bind:value={lastName} /></div>
                        <div class="flex flex-col gap-1 w-24 shrink-0">
                            <Input label="Age <span class='text-red-500'>*</span>" name="age" type="number" min="13" max="100" bind:value={age} />
                            {#if age && !ageValid}
                                <p class="text-xs text-red-500 ml-1">Age must be between 13 and 100.</p>
                            {/if}
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <div class="flex flex-col gap-1 flex-1">
                            <Input label="Phone Number <span class='text-red-500'>*</span>" name="phone-number" type="tel" bind:value={phoneNumber} />
                            {#if phoneNumber && !phoneValid}
                                <p class="text-xs text-red-500 ml-1">Enter a valid phone number (7-15 digits, spaces, dashes, and parentheses allowed).</p>
                            {/if}
                        </div>
                        <div class="flex-1">
                            <Input label="Email <span class='text-red-500'>*</span>" name="email" type="email" bind:value={email} />
                        </div>
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

                            <optgroup label="Secondary / High School">
                                <option value="hs_freshman">High School Freshman (Grade 9)</option>
                                <option value="hs_sophomore">High School Sophomore (Grade 10)</option>
                                <option value="hs_junior">High School Junior (Grade 11)</option>
                                <option value="hs_senior">High School Senior (Grade 12)</option>
                                <option value="hs_ged">GED / High School Equivalency Program</option>
                            </optgroup>

                            <optgroup label="Undergraduate - 2-Year (Community College or Similar)">
                                <option value="cc_freshman">Community College 1st Year / Freshman</option>
                                <option value="cc_sophomore">Community College 2nd Year / Sophomore</option>
                                <option value="cc_certificate">Certificate Program (Short-term, &lt; 1 year)</option>
                            </optgroup>

                            <optgroup label="Undergraduate - 3+ Year University">
                                <option value="uni_freshman">University 1st Year / Freshman</option>
                                <option value="uni_sophomore">University 2nd Year / Sophomore</option>
                                <option value="uni_junior">University 3rd Year / Junior</option>
                                <option value="uni_senior">University 4th Year / Senior</option>
                                <option value="uni_super_senior">University 5th Year / Super Senior</option>
                            </optgroup>

                            <optgroup label="Graduate University">
                                <option value="grad_masters_1">Master's Year 1</option>
                                <option value="grad_masters_2">Master's Year 2+</option>
                                <option value="grad_professional_1">Professional Degree (JD, MD, MBA, etc.) Year 1</option>
                                <option value="grad_professional_2">Professional Degree Year 2</option>
                                <option value="grad_professional_3">Professional Degree Year 3+</option>
                                <option value="grad_phd_early">PhD Early Stage (Coursework)</option>
                                <option value="grad_phd_mid">PhD Mid Stage (Candidacy / Qualifying Exams)</option>
                                <option value="grad_phd_late">PhD Late Stage (Dissertation)</option>
                            </optgroup>

                            <optgroup label="Post-Doctorate">
                                <option value="postdoc">Post-Doctoral Fellow / Researcher</option>
                            </optgroup>

                            <optgroup label="Code School / Bootcamp">
                                <option value="bootcamp_enrolled">Code School / Bootcamp Currently Enrolled</option>
                                <option value="bootcamp_alumni">Code School / Bootcamp Completed / Alumni</option>
                            </optgroup>

                            <optgroup label="Vocational / Trade / Apprenticeship">
                                <option value="trade_apprentice_1">Apprenticeship Year 1</option>
                                <option value="trade_apprentice_2">Apprenticeship Year 2</option>
                                <option value="trade_apprentice_3">Apprenticeship Year 3+</option>
                                <option value="trade_enrolled">Vocational / Trade Program Currently Enrolled</option>
                                <option value="trade_completed">Vocational / Trade Program Completed</option>
                            </optgroup>

                            <optgroup label="Other">
                                <option value="other_self_taught">Self-taught / Informal Learning</option>
                                <option value="other_mooc">Online Courses / MOOCs (Coursera, Udemy, etc.)</option>
                                <option value="other_military">Military Training Program</option>
                                <option value="other_corporate">Corporate / Professional Training Program</option>
                                <option value="other">Other</option>
                            </optgroup>

                            <optgroup label="Not Currently a Student">
                                <option value="not_student_employed">Currently Employed (no active enrollment)</option>
                                <option value="not_student_unemployed">Unemployed / Between Programs</option>
                                <option value="not_student_retired">Retired from Education</option>
                            </optgroup>

                            <option value="no_answer">Prefer not to answer</option>
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
                        <Select label="First-Gen Student?" name="first-gen-student" value={application.firstGenStudent}>
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
                            <option>0 -- this is my first!</option>
                            <option>1-3</option>
                            <option>4-7</option>
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
                            <span class="text-white/40 font-normal"> -- select all that apply</span>
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
                        <div class="flex flex-col gap-1 flex-1">
                            <Input label="GitHub <span class='text-red-500'>*</span>" name="github-url" bind:value={githubUrl} placeholder="https://github.com/..." />
                            {#if githubUrl && !githubValid}
                                <p class="text-xs text-red-500 ml-1">Must be a valid GitHub URL (https://github.com/...).</p>
                            {/if}
                        </div>
                        <div class="flex flex-col gap-1 flex-1">
                            <Input label="LinkedIn" name="linkedin-url" bind:value={linkedinUrl} placeholder="https://linkedin.com/in/..." />
                            {#if linkedinUrl && !linkedinValid}
                                <p class="text-xs text-red-500 ml-1">Must be a valid LinkedIn URL (https://linkedin.com/in/...).</p>
                            {/if}
                        </div>
                    </div>
                    <div class="flex flex-col gap-1">
                        <Input label="Personal Website" name="personal-url" bind:value={personalUrl} placeholder="https://..." />
                        {#if personalUrl && !personalValid}
                            <p class="text-xs text-red-500 ml-1">Must be a valid URL starting with https://.</p>
                        {/if}
                    </div>
                    <Input
                        label={data.hasResume
                            ? "Resume (already uploaded) -- upload a new one to replace"
                            : "Resume <span class='text-red-500'>*</span>"}
                        name="resume"
                        type="file"
                        accept=".pdf"
                    />
                    <span>If you do not have a resume, you can create one <Link href="https://rg.barknote.top/">here</Link>.</span>
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
                    <div class="flex gap-2 flex-col sm:flex-row">
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
                        <Select label="Interested in talking to sponsors?" name="interested-in-sponsors" value={application.interestedInSponsors}>
                            <option value="">Prefer not to answer</option>
                            <option>Yes! I'd love to meet recruiters!</option>
                            <option>Maybe</option>
                            <option>No thanks</option>
                        </Select>
                    </div>
                    <Select label="Team preference" name="team-preference" value={application.teamPreference}>
                        <option value="">Prefer not to answer</option>
                        <option>Going solo</option>
                        <option>I already have a full team</option>
                        <option>Looking for teammates</option>
                    </Select>
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

                </fieldset>

                <div class="flex flex-col gap-3 mt-8 pt-4 border-t border-castle-stoneMid">
                    <div class="flex justify-between items-center">
                        <div>
                            {#if step > 0}
                                <button
                                    type="button"
                                    onclick={() => step--}
                                    class="text-sm text-white/50 hover:text-white transition-colors px-2 py-1"
                                >
                                    &larr; Back
                                </button>
                            {/if}
                        </div>

                        <div class="flex gap-2 items-center">
                            {#if saveStatus === 'saving'}
                                <span class="text-xs text-white/40">Saving...</span>
                            {:else if saveStatus === 'saved'}
                                <span class="text-xs text-castle-torchOrange/70">Saved</span>
                            {:else if saveStatus === 'error'}
                                <span class="text-xs text-red-400">Save failed</span>
                            {/if}

                            {#if data.applicationsClosed}
                                <p class="text-sm text-red-400">Applications are closed.</p>
                            {:else if application.submitted}
                                <Button type="button" onclick={() => showUnsubmitModal = true} disabled={loading} class="bg-castle-stoneMid hover:bg-castle-stoneLight whitespace-nowrap">
                                    Unsubmit and Modify
                                </Button>
                            {:else}
                                {#if allStepsDone}
                                    <Button type="submit" formaction="?/submit" disabled={loading || !canSubmitFull}>
                                        Submit
                                    </Button>
                                {/if}
                            {/if}

                            {#if step < STEPS.length - 1}
                                <Button type="button" onclick={() => { step++; window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={loading}>
                                    Next
                                </Button>
                            {/if}
                        </div>
                    </div>
                </div>
            </form>

            <form method="POST" action="?/unsubmit" bind:this={unsubmitFormEl} use:enhance={() => {
                loading = true;
                return async ({ update }) => { await update({ reset: false }); loading = false; };
            }}></form>
        </Card>
    {:else}
        <Card padded>
            <p class="text-white/90">
                KHE 2027 has ended, so new applications are not being accepted.
            </p>
        </Card>
    {/if}
</div>
