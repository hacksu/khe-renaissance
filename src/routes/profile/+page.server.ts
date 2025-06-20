import { auth } from "$lib/server/auth";
import { prisma } from "$lib/server/prisma";
import { Utils } from "$lib/util";
import { error, redirect, type Actions } from "@sveltejs/kit";
import fs from "fs/promises";
import countries from "../../assets/json/countries.json";
import schools from "../../assets/json/schools.json";
import type { PageServerLoad } from "./$types";

const saveApplication = async (userId: string, form: FormData) => { 
    const formValues = Utils.formToDict(form);
    const data = {
        firstName: formValues["first-name"],
        lastName: formValues["last-name"],
        phoneNumber: formValues["phone-number"],
        email: formValues["email"],
        countryOfResidence: formValues["country-of-residence"],
        school: formValues["school"],
        levelOfStudy: formValues["level-of-study"],
        fieldOfStudy: formValues["field-of-study"],
        githubUrl: formValues["github-url"],
        age: Utils.toNumber(formValues["age"]),
        dietaryRestriction: formValues["dietary-restriction"],
        gender: formValues["gender"],
        pronouns: formValues["pronouns"],
        personalUrl: formValues["personal-url"],
    }

    // TODO: finish implementation for file save
    const resume = form.get("resume") as File | null;
    if (resume) {
        const buffer = await resume.bytes();
        await fs.writeFile("test.pdf", buffer);
    }

    return await prisma.application.upsert({
        create: { 
            ...data,
            user: {
                connect: { id: userId }
            }
        },
        update: data,
        where: { userId }
    });
}

export const actions: Actions = {
    save: async ({ request }) => {
        const session = await auth.api.getSession(request);
        if (!session) {
            throw error(401, "Your session has expired. Please re-login.");
        }

        const userId = session.user.id;
        const form = await request.formData();
        await saveApplication(userId, form);
    },
    submit: async ({ request }) => {
        const session = await auth.api.getSession(request);
        if (!session) {
            throw error(401, "Your session has expired. Please re-login.");
        }

        const userId = session.user.id;
        const form = await request.formData();
        const application = await saveApplication(userId, form);
        await prisma.application.update({
            data: { 
                submitted: !application.submitted,
                approved: false
            },
            where: { id: application.id }
        });
    }
};

export const load: PageServerLoad = async ({ request }) => {
    const session = await auth.api.getSession(request);
    if (!session) {
        throw redirect(301, "/login");
    }

    const userId = session.user.id;
    
    let application = await prisma.application
        .findUnique({
            where: { userId },
            omit: { userId: true }
        })
        .catch(_ => null);

    if (!application) {
        application = await prisma.application.create({
            data: { userId }
        });
    }

    return { schools, application, countries };
};