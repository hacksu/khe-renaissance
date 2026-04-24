<script lang="ts">
    const { data } = $props();

    const { stats, demographics, education, experience, logistics, geography, referral, submittedCount } = data;

    function pct(n: number, total: number) {
        if (!total) return 0;
        return Math.round((n / total) * 100);
    }

    function barPct(n: number, entries: [string, number][]) {
        const max = entries[0]?.[1] ?? 1;
        if (!max) return 0;
        return Math.round((n / max) * 100);
    }

    const colorMap: Record<string, string> = {
        blue: "bg-blue-400",
        green: "bg-green-400",
        orange: "bg-orange-400",
        pink: "bg-pink-400",
        teal: "bg-teal-400",
        violet: "bg-violet-400",
        amber: "bg-amber-400",
        cyan: "bg-cyan-400",
        purple: "bg-purple-400",
        rose: "bg-rose-400",
        slate: "bg-slate-400",
        lime: "bg-lime-400",
        indigo: "bg-indigo-400",
        emerald: "bg-emerald-400",
        sky: "bg-sky-400",
    };
</script>

{#snippet metricCard(title: string, entries: [string, number][], total: number, color: string = "blue")}
    {@const barColor = colorMap[color] ?? "bg-gray-400"}
    <section class="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
        <div class="space-y-2">
            {#each entries as [label, count]}
                <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-600 w-32 shrink-0 truncate" title={label}>{label}</span>
                    <div class="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                            class="h-full {barColor} rounded-full transition-all"
                            style="width: {barPct(count, entries)}%"
                        ></div>
                    </div>
                    <span class="text-xs font-semibold text-gray-700 w-6 shrink-0 text-right">{count}</span>
                    <span class="text-xs text-gray-400 w-8 shrink-0">{pct(count, total)}%</span>
                </div>
            {/each}
        </div>
    </section>
{/snippet}

{#snippet wideChart(title: string, entries: [string, number][], total: number, color: string = "blue", note: string = "")}
    {@const barColor = colorMap[color] ?? "bg-gray-400"}
    <section class="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">
            {title}
            {#if note}<span class="text-gray-400 font-normal"> ({note})</span>{/if}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {#each entries as [label, count]}
                <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-600 w-44 shrink-0 truncate" title={label}>{label}</span>
                    <div class="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                            class="h-full {barColor} rounded-full"
                            style="width: {barPct(count, entries)}%"
                        ></div>
                    </div>
                    <span class="text-xs font-semibold text-gray-700 w-6 shrink-0 text-right">{count}</span>
                    <span class="text-xs text-gray-400 w-8 shrink-0">{pct(count, total)}%</span>
                </div>
            {/each}
        </div>
    </section>
{/snippet}

<div class="min-h-screen p-4 pt-8 pb-24 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Hacker Metrics</h1>

    <!-- Status Overview -->
    <section class="mb-8">
        <h2 class="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">Status Overview</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="text-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p class="text-xs uppercase tracking-wide text-gray-500 mb-1">Registered</p>
                <p class="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div class="text-center p-4 bg-yellow-50 border border-yellow-100 rounded-lg shadow-sm">
                <p class="text-xs uppercase tracking-wide text-yellow-600 mb-1">Submitted</p>
                <p class="text-3xl font-bold text-yellow-700">{stats.submitted}</p>
                <p class="text-xs text-yellow-500 mt-1">{pct(stats.submitted, stats.total)}% of registered</p>
            </div>
            <div class="text-center p-4 bg-green-50 border border-green-100 rounded-lg shadow-sm">
                <p class="text-xs uppercase tracking-wide text-green-600 mb-1">Approved</p>
                <p class="text-3xl font-bold text-green-700">{stats.approved}</p>
                <p class="text-xs text-green-500 mt-1">{pct(stats.approved, stats.submitted)}% of submitted</p>
            </div>
            <div class="text-center p-4 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                <p class="text-xs uppercase tracking-wide text-blue-600 mb-1">Checked In</p>
                <p class="text-3xl font-bold text-blue-700">{stats.checkedIn}</p>
                <p class="text-xs text-blue-500 mt-1">{pct(stats.checkedIn, stats.approved)}% of approved</p>
            </div>
            <div class="text-center p-4 bg-purple-50 border border-purple-100 rounded-lg shadow-sm">
                <p class="text-xs uppercase tracking-wide text-purple-600 mb-1">MLH Emails Opt-in</p>
                <p class="text-3xl font-bold text-purple-700">{stats.mlhEmails}</p>
                <p class="text-xs text-purple-500 mt-1">{pct(stats.mlhEmails, stats.submitted)}% of submitted</p>
            </div>
        </div>
    </section>

    <!-- 2-col grid of smaller charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {@render metricCard("Gender", demographics.gender, submittedCount, "pink")}

        <!-- Age Distribution -->
        <section class="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Age Distribution</h3>
            <div class="space-y-2">
                {#each demographics.ageBuckets as [bucket, count]}
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-gray-600 w-12 shrink-0 text-right">{bucket}</span>
                        <div class="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                            <div
                                class="h-full bg-indigo-400 rounded-full transition-all"
                                style="width: {barPct(count, demographics.ageBuckets)}%"
                            ></div>
                        </div>
                        <span class="text-xs font-semibold text-gray-700 w-6 shrink-0 text-right">{count}</span>
                        <span class="text-xs text-gray-400 w-8 shrink-0">{pct(count, submittedCount)}%</span>
                    </div>
                {/each}
            </div>
        </section>

        {@render metricCard("Race / Ethnicity", demographics.raceEthnicity, submittedCount, "orange")}
        {@render metricCard("Sexuality", demographics.sexuality, submittedCount, "rose")}
        {@render metricCard("First-Generation Student", demographics.firstGen, submittedCount, "teal")}
        {@render metricCard("Level of Study", education.levelOfStudy, submittedCount, "blue")}
        {@render metricCard("Field of Study", education.fieldOfStudy, submittedCount, "violet")}
        {@render metricCard("Experience Level", experience.level, submittedCount, "amber")}
        {@render metricCard("Hackathons Attended", experience.hackathonsAttended, submittedCount, "cyan")}
        {@render metricCard("Team Preference", logistics.teamPreference, submittedCount, "green")}
        {@render metricCard("Interested in Sponsor Opportunities", logistics.interestedInSponsors, submittedCount, "purple")}
        {@render metricCard("How They Heard About Us", referral.heardAboutUs, submittedCount, "slate")}
        {@render metricCard("T-Shirt Size", logistics.tshirtSize, submittedCount, "lime")}
        {@render metricCard("Dietary Restrictions", logistics.dietary, submittedCount, "orange")}
    </div>

    {@render wideChart("Areas of Interest", experience.areasOfInterest, submittedCount, "emerald", "multi-select")}
    {@render wideChart("Top Schools", education.school, submittedCount, "sky")}
    {@render wideChart("Country of Residence", geography.country, submittedCount, "amber")}

    <p class="mt-6 text-center text-xs text-gray-400">
        All breakdown charts are based on submitted applications ({submittedCount} total).
    </p>
</div>
