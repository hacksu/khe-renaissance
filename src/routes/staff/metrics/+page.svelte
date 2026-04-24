<script lang="ts">
    const { data } = $props();

    const { stats, timeSeries, demographics, education, experience, logistics, geography, referral, submittedCount } = data;

    const W = 800, H = 220, PL = 48, PR = 16, PT = 16, PB = 36;
    const chartW = W - PL - PR;
    const chartH = H - PT - PB;

    type Point = { x: number; y: number; date: string; reg: number; appr: number };

    function buildChart(series: typeof timeSeries) {
        if (!series.length) return null;

        const maxCount = Math.max(...series.map(d => d.reg), ...series.map(d => d.appr), 1);
        const n = series.length;

        const xScale = (i: number) => (i / (n - 1 || 1)) * chartW;
        const yScale = (v: number) => chartH - (v / maxCount) * chartH;

        const pts: Point[] = series.map((d, i) => ({
            x: xScale(i), y: 0, date: d.date, reg: d.reg, appr: d.appr,
        }));

        const regLine = pts.map(p => `${p.x},${yScale(p.reg)}`).join(' ');
        const apprLine = pts.map(p => `${p.x},${yScale(p.appr)}`).join(' ');

        const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
            y: yScale(f * maxCount),
            label: Math.round(f * maxCount),
        }));

        const step = Math.max(1, Math.floor(n / 6));
        const xTicks = pts
            .filter((_, i) => i % step === 0 || i === n - 1)
            .map(p => ({ x: p.x, label: p.date.slice(5) }));

        return { pts, regLine, apprLine, yTicks, xTicks, yScale };
    }

    const chart = $derived(buildChart(timeSeries));

    let hovered = $state<Point | null>(null);

    function findNearest(pts: Point[], mouseX: number) {
        if (!pts.length) return null;
        return pts.reduce((best, p) => Math.abs(p.x - mouseX) < Math.abs(best.x - mouseX) ? p : best);
    }

    function onMouseMove(e: MouseEvent) {
        if (!chart) return;
        const svg = e.currentTarget as SVGSVGElement;
        const rect = svg.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (W / rect.width) - PL;
        hovered = findNearest(chart.pts, mx);
    }

    function onMouseLeave() { hovered = null; }

    function pct(n: number, total: number) {
        if (!total) return 0;
        return Math.round((n / total) * 100);
    }

    function barPct(n: number, entries: [string, number][]) {
        const max = entries[0]?.[1] ?? 1;
        return pct(n, max);
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


    <section class="mb-8 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <h2 class="text-sm font-semibold text-gray-700 mb-4">Registrations &amp; Approvals Over Time</h2>
        {#if chart}
            <div class="relative">
                <svg
                    viewBox="0 0 {W} {H}"
                    class="w-full"
                    role="img"
                    onmousemove={onMouseMove}
                    onmouseleave={onMouseLeave}
                >
                    <g transform="translate({PL},{PT})">
                        {#each chart.yTicks as tick}
                            <line x1="0" y1={tick.y} x2={chartW} y2={tick.y} stroke="#e5e7eb" stroke-width="1" />
                            <text x="-6" y={tick.y + 4} text-anchor="end" font-size="10" fill="#9ca3af">{tick.label}</text>
                        {/each}

                        <polyline points={chart.regLine} fill="none" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round" />
                        <polyline points={chart.apprLine} fill="none" stroke="#22c55e" stroke-width="2" stroke-linejoin="round" />

                        {#each chart.xTicks as tick}
                            <text x={tick.x} y={chartH + 20} text-anchor="middle" font-size="10" fill="#9ca3af">{tick.label}</text>
                        {/each}

                        {#if hovered}
                            <line x1={hovered.x} y1="0" x2={hovered.x} y2={chartH} stroke="#d1d5db" stroke-width="1" stroke-dasharray="4 2" />
                            <circle cx={hovered.x} cy={chart.yScale(hovered.reg)} r="4" fill="#3b82f6" />
                            <circle cx={hovered.x} cy={chart.yScale(hovered.appr)} r="4" fill="#22c55e" />
                        {/if}
                    </g>
                </svg>

                {#if hovered}
                    <div class="absolute top-2 right-2 bg-white border border-gray-200 rounded shadow-sm text-xs p-2 space-y-1 pointer-events-none">
                        <p class="text-gray-500 font-medium">{hovered.date}</p>
                        <p class="text-blue-600">Registrations: <span class="font-bold">{hovered.reg}</span></p>
                        <p class="text-green-600">Approvals: <span class="font-bold">{hovered.appr}</span></p>
                    </div>
                {/if}
            </div>

            <div class="flex gap-6 mt-2 text-xs text-gray-500">
                <span class="flex items-center gap-1.5"><span class="inline-block w-4 h-0.5 bg-blue-500 rounded"></span> Registrations</span>
                <span class="flex items-center gap-1.5"><span class="inline-block w-4 h-0.5 bg-green-500 rounded"></span> Approvals</span>
            </div>
        {:else}
            <p class="text-sm text-gray-400 italic">No data yet.</p>
        {/if}
    </section>


    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {@render metricCard("Gender", demographics.gender, submittedCount, "pink")}

        <section class="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Age Distribution</h3>
            <div class="space-y-2">
                {#each demographics.ageBuckets as [bucket, count]}
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-gray-600 w-12 shrink-0 text-right">{bucket}</span>
                        <div class="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                            <div
                                class="h-full bg-red-400 rounded-full transition-all"
                                style="width: {barPct(count, submittedCount)}%"
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
