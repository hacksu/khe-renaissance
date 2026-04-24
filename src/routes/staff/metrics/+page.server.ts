import { prisma } from "$lib/server/prisma";
import type { PageServerLoad } from "./$types";

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of items) {
        const val = key(item).trim() || "Not specified";
        counts[val] = (counts[val] || 0) + 1;
    }
    return counts;
}

function topN(counts: Record<string, number>, n = 10): [string, number][] {
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function toDateKey(d: Date) {
    return d.toISOString().slice(0, 10);
}

function buildTimeSeriesAligned(
    regDates: Date[],
    apprDates: Date[]
): { date: string; reg: number; appr: number }[] {
    if (!regDates.length && !apprDates.length) return [];

    const regCounts: Record<string, number> = {};
    for (const d of regDates) regCounts[toDateKey(d)] = (regCounts[toDateKey(d)] || 0) + 1;
    const apprCounts: Record<string, number> = {};
    for (const d of apprDates) apprCounts[toDateKey(d)] = (apprCounts[toDateKey(d)] || 0) + 1;

    const allKeys = [...new Set([...Object.keys(regCounts), ...Object.keys(apprCounts)])].sort();
    const start = new Date(allKeys[0]);
    const end = new Date(allKeys[allKeys.length - 1]);

    const series: { date: string; reg: number; appr: number }[] = [];
    let cumReg = 0, cumAppr = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = toDateKey(d);
        cumReg += regCounts[key] ?? 0;
        cumAppr += apprCounts[key] ?? 0;
        series.push({ date: key, reg: cumReg, appr: cumAppr });
    }
    return series;
}

export const load: PageServerLoad = async () => {
    const [applications, users] = await Promise.all([
        prisma.application.findMany({
            select: {
                submitted: true,
                approved: true,
                checkedIn: true,
                submittedAt: true,
                approvedAt: true,
                gender: true,
                raceEthnicity: true,
                sexuality: true,
                firstGenStudent: true,
                age: true,
                levelOfStudy: true,
                fieldOfStudy: true,
                school: true,
                countryOfResidence: true,
                experienceLevel: true,
                hackatonsAttended: true,
                areasOfInterest: true,
                heardAboutUs: true,
                tshirtSize: true,
                dietaryRestriction: true,
                teamPreference: true,
                interestedInSponsors: true,
                mlhEmails: true,
            }
        }),
        prisma.user.findMany({ select: { createdAt: true } }),
    ]);

    const total = applications.length;
    const submitted = applications.filter(a => a.submitted).length;
    const approved = applications.filter(a => a.approved).length;
    const checkedIn = applications.filter(a => a.checkedIn).length;
    const mlhEmails = applications.filter(a => a.mlhEmails).length;

    const submittedApps = applications.filter(a => a.submitted);

    const ageBuckets: Record<string, number> = { "<18": 0, "18-20": 0, "21-23": 0, "24-26": 0, "27+": 0 };
    for (const app of submittedApps) {
        const age = app.age;
        if (age < 18) ageBuckets["<18"]++;
        else if (age <= 20) ageBuckets["18-20"]++;
        else if (age <= 23) ageBuckets["21-23"]++;
        else if (age <= 26) ageBuckets["24-26"]++;
        else ageBuckets["27+"]++;
    }

    const interestCounts: Record<string, number> = {};
    for (const app of submittedApps) {
        const interests = app.areasOfInterest.split(",").map(s => s.trim()).filter(Boolean);
        for (const interest of interests) {
            interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        }
    }

    const timeSeries = buildTimeSeriesAligned(
        users.map(u => u.createdAt),
        applications.filter(a => a.approvedAt).map(a => a.approvedAt!)
    );

    return {
        stats: { total, submitted, approved, checkedIn, mlhEmails },
        timeSeries,
        demographics: {
            gender: topN(countBy(submittedApps, a => a.gender)),
            raceEthnicity: topN(countBy(submittedApps, a => a.raceEthnicity)),
            sexuality: topN(countBy(submittedApps, a => a.sexuality)),
            firstGen: topN(countBy(submittedApps, a => a.firstGenStudent)),
            ageBuckets: Object.entries(ageBuckets),
        },
        education: {
            levelOfStudy: topN(countBy(submittedApps, a => a.levelOfStudy)),
            fieldOfStudy: topN(countBy(submittedApps, a => a.fieldOfStudy)),
            school: topN(countBy(submittedApps, a => a.school), 15),
        },
        experience: {
            level: topN(countBy(submittedApps, a => a.experienceLevel)),
            hackathonsAttended: topN(countBy(submittedApps, a => a.hackatonsAttended)),
            areasOfInterest: topN(interestCounts, 15),
        },
        logistics: {
            tshirtSize: topN(countBy(submittedApps, a => a.tshirtSize)),
            dietary: topN(countBy(submittedApps, a => a.dietaryRestriction)),
            teamPreference: topN(countBy(submittedApps, a => a.teamPreference)),
            interestedInSponsors: topN(countBy(submittedApps, a => a.interestedInSponsors)),
        },
        geography: {
            country: topN(countBy(submittedApps, a => a.countryOfResidence), 15),
        },
        referral: {
            heardAboutUs: topN(countBy(submittedApps, a => a.heardAboutUs)),
        },
        submittedCount: submittedApps.length,
    };
};
