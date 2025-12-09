import { auth } from "$lib/server/auth";
import { prisma } from "$lib/server/prisma";
import { Utils } from "$lib/util";
import { sendApprovalEmail, sendApprovalRevokedEmail } from "$lib/server/email";
import { error, redirect, type Actions } from "@sveltejs/kit";
import fs from "fs/promises";
import countries from "../../assets/json/countries.json";
import schools from "../../assets/json/schools.json";
import type { PageServerLoad } from "./$types";

const saveApplication = async (userId: string, form: FormData) => {
    const formValues = Utils.formToDict(form);

    // Fetch current application to check for changes
    const currentApplication = await prisma.application.findUnique({
        where: { userId }
    });

    if (!currentApplication) {
        throw new Error("Application not found");
    }

    // Detect if there are any changes
    const hasChanges =
        currentApplication.firstName !== formValues["first-name"] ||
        currentApplication.lastName !== formValues["last-name"] ||
        currentApplication.phoneNumber !== formValues["phone-number"] ||
        currentApplication.email !== formValues["email"] ||
        currentApplication.countryOfResidence !== formValues["country-of-residence"] ||
        currentApplication.school !== formValues["school"] ||
        currentApplication.levelOfStudy !== formValues["level-of-study"] ||
        currentApplication.fieldOfStudy !== formValues["field-of-study"] ||
        currentApplication.githubUrl !== formValues["github-url"] ||
        currentApplication.projectIdea !== formValues["project-idea"] ||
        currentApplication.age !== Utils.toNumber(formValues["age"]) ||
        currentApplication.dietaryRestriction !== formValues["dietary-restriction"] ||
        currentApplication.gender !== formValues["gender"] ||
        currentApplication.pronouns !== formValues["pronouns"] ||
        currentApplication.personalUrl !== formValues["personal-url"] ||
        currentApplication.mlhCodeOfConduct !== !!formValues["mlh-code"] ||
        currentApplication.mlhAuthorization !== !!formValues["mlh-authorization"] ||
        currentApplication.mlhEmails !== !!formValues["mlh-emails"];

    // Update fields ONLY. Do not touch approved/submitted status here.
    const application = await prisma.application.update({
        data: {
            firstName: formValues["first-name"],
            lastName: formValues["last-name"],
            phoneNumber: formValues["phone-number"],
            email: formValues["email"],
            countryOfResidence: formValues["country-of-residence"],
            school: formValues["school"],
            levelOfStudy: formValues["level-of-study"],
            fieldOfStudy: formValues["field-of-study"],
            githubUrl: formValues["github-url"],
            projectIdea: formValues["project-idea"] ?? "",
            age: Utils.toNumber(formValues["age"]),
            dietaryRestriction: formValues["dietary-restriction"],
            gender: formValues["gender"],
            pronouns: formValues["pronouns"],
            personalUrl: formValues["personal-url"],
            mlhCodeOfConduct: !!formValues["mlh-code"],
            mlhAuthorization: !!formValues["mlh-authorization"],
            mlhEmails: !!formValues["mlh-emails"],
        },
        where: { userId }
    });

    const resume = form.get("resume") as File | null;
    if (resume && resume.type === "application/pdf") {
        const buffer = await resume.bytes();
        await fs.writeFile(`./resumes/${application.id}.pdf`, buffer);
    }

    return { application, hasChanges, previousApproved: currentApplication.approved, previousSubmitted: currentApplication.submitted };
}

export const actions: Actions = {
    save: async ({ request }) => {
        const session = await auth.api.getSession(request);
        if (!session) {
            throw error(401, "Your session has expired. Please re-login.");
        }

        const userId = session.user.id;
        const form = await request.formData();
        const { application, hasChanges, previousApproved } = await saveApplication(userId, form);

        // Matrix Logic:
        // Approved, Save, no changes: Do nothing (already saved fields, keep approved)
        // Approved, save, changes: Unapprove, send email
        // unapproved, save, no changes: do nothing (already saved fields)
        // unapproved, save, changes: save changes (already saved fields)

        if (previousApproved && hasChanges) {
            // Approved + Changes -> Unapprove, Send Email
            await prisma.application.update({
                where: { id: application.id },
                data: { approved: false }
            });
            await sendApprovalRevokedEmail(application.email);
        }
        // All other cases require no further action (fields are already saved by saveApplication)
    },
    submit: async ({ request }) => {
        const session = await auth.api.getSession(request);
        if (!session) {
            throw error(401, "Your session has expired. Please re-login.");
        }

        const userId = session.user.id;
        const form = await request.formData();

        // We need to know if we are "Submitting" or "Un-submitting".
        // The button text toggles based on current state.
        // If currently submitted -> Unsubmit.
        // If currently NOT submitted -> Submit.

        // We call saveApplication first to save any potential edits made before clicking submit/unsubmit.
        const { application, previousApproved, previousSubmitted } = await saveApplication(userId, form);

        const isUnsubmitting = previousSubmitted;

        if (isUnsubmitting) {
            // Approved, unsubmit: unapprove, no email
            // (Also applies if unapproved and unsubmit, just unsubmit)
            await prisma.application.update({
                where: { id: application.id },
                data: {
                    submitted: false,
                    approved: false // Always unapprove on unsubmit
                }
            });
        } else {
            // unaproved, submit: submit for approval.
            // (If approved and submit... shouldn't happen if UI is correct, but if it does, ensure submitted=true)
            await prisma.application.update({
                where: { id: application.id },
                data: { submitted: true }
            });
        }
    }
};

export const load: PageServerLoad = async ({ request }) => {
    const session = await auth.api.getSession(request);
    if (!session) {
        throw redirect(301, "/auth/login");
    }

    const userId = session.user.id;

    let application = await prisma.application
        .findUnique({
            where: { userId },
            omit: { userId: true }
        })
        .catch(_ => null);

    if (!application) {
        application = await prisma.application.create({ data: { userId } });
    }

    return { schools, application, countries };
};
