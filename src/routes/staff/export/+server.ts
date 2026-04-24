import { auth } from "$lib/server/auth";
import { prisma } from "$lib/server/prisma";
import { Role } from "$lib/server/external_roles";
import { toCsv } from "$lib/exportUtils";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import fs from "fs/promises";
import { zipSync, strToU8 } from "fflate";

export async function GET({ request }: RequestEvent) {
    const session = await auth.api.getSession(request);
    if (!session) {
        throw error(401, "Unauthorized");
    }

    if (session.user.role !== Role.STAFF) {
        throw error(403, "Forbidden: Staff access required");
    }

    const applications = await prisma.application.findMany({
        include: { user: true },
        orderBy: [{ approved: "desc" }, { updatedAt: "desc" }],
    });

    // Build JSON export (exclude internal DB relations, keep useful fields)
    const competitors = applications.map((app) => ({
        id: app.id,
        email: app.email || app.user.email,
        firstName: app.firstName,
        lastName: app.lastName,
        age: app.age,
        phoneNumber: app.phoneNumber,
        countryOfResidence: app.countryOfResidence,
        school: app.school,
        levelOfStudy: app.levelOfStudy,
        fieldOfStudy: app.fieldOfStudy,
        githubUrl: app.githubUrl,
        personalUrl: app.personalUrl,
        projectIdea: app.projectIdea,
        gender: app.gender,
        pronouns: app.pronouns,
        dietaryRestriction: app.dietaryRestriction,
        submitted: app.submitted,
        approved: app.approved,
        checkedIn: app.checkedIn,
        mlhCodeOfConduct: app.mlhCodeOfConduct,
        mlhAuthorization: app.mlhAuthorization,
        mlhEmails: app.mlhEmails,
    }));

    const files: Record<string, Uint8Array> = {
        "competitors.json": strToU8(JSON.stringify(competitors, null, 2)),
        "competitors.csv": strToU8(toCsv(competitors as Record<string, unknown>[])),
    };

    // Add each resume that exists
    for (const app of applications) {
        const resumePath = `./resumes/${app.id}.pdf`;
        try {
            await fs.access(resumePath);
            const buffer = await fs.readFile(resumePath);
            const firstName = (app.firstName || "applicant").replace(/\s+/g, "_").toLowerCase();
            const lastName = (app.lastName || "").replace(/\s+/g, "_").toLowerCase();
            const filename = `resumes/${firstName}_${lastName}_${app.id}.pdf`;
            files[filename] = new Uint8Array(buffer);
        } catch {
            // No resume for this applicant
        }
    }

    const zipped = zipSync(files);
    const date = new Date().toISOString().split("T")[0];

    return new Response(zipped, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="competitors-${date}.zip"`,
            "Content-Length": zipped.length.toString(),
        },
    });
}
