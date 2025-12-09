import { auth } from "$lib/server/auth";
import { prisma } from "$lib/server/prisma";
import { Role } from "$lib/server/external_roles";
import { error } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import fs from "fs/promises";

export async function GET({ params, request }: RequestEvent) {
    // Check authentication and staff role
    const session = await auth.api.getSession(request);
    if (!session) {
        throw error(401, "Unauthorized");
    }

    if (session.user.role !== Role.STAFF) {
        throw error(403, "Forbidden: Staff access required");
    }

    const applicationId = params.id;
    if (!applicationId) {
        throw error(400, "Application ID is required");
    }

    // Verify application exists
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { user: true }
    });

    if (!application) {
        throw error(404, "Application not found");
    }

    // Construct file path
    // Use the same relative path as when saving (./resumes/${applicationId}.pdf)
    // This ensures consistency with previously uploaded resumes
    const resumePath = `./resumes/${applicationId}.pdf`;

    try {
        // Check if file exists
        await fs.access(resumePath);
        
        // Read the file
        const fileBuffer = await fs.readFile(resumePath);
        
        // Generate filename from applicant name
        const firstName = application.firstName || "applicant";
        const lastName = application.lastName || "";
        const filename = `${firstName}_${lastName}_resume.pdf`.replace(/\s+/g, "_").toLowerCase();

        // Convert Buffer to Uint8Array for Response
        const uint8Array = new Uint8Array(fileBuffer);

        // Return PDF with proper headers
        return new Response(uint8Array, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": uint8Array.length.toString()
            }
        });
    } catch (err) {
        // File doesn't exist or can't be read
        throw error(404, "Resume not found");
    }
};

