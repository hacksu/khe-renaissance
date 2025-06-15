import { auth } from "$lib/server/auth";
import { prisma } from "$lib/server/prisma";
import { Utils } from "$lib/util";
import { error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const saveApplication = async (userId: string, form: FormData) => {
    const data = {
        firstName: form.get("first-name") as string,
        lastName: form.get("last-name") as string,
        phoneNumber: form.get("phone-number") as string,
        email: form.get("email") as string,
        countryOfResidence: form.get("country-of-residence") as string,
        school: form.get("school") as string,
        levelOfStudy: form.get("level-of-study") as string,
        fieldOfStudy: form.get("field-of-study") as string,
        linkedinUrl: form.get("linkedin-url") as string,
        githubUrl: form.get("github-url") as string,
        age: Utils.toNumber(form.get("age")),
    }

    return await prisma.application.upsert({
        create: { ...data, userId },
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

export const load: PageServerLoad = async ({ fetch, request }) => {
    const session = await auth.api.getSession(request);
    if (!session) {
        throw error(401, "Your session has expired. Please re-login.");
    }

    const userId = session.user.id;
    const schools = await fetch("https://raw.githubusercontent.com/MLH/mlh-policies/refs/heads/main/schools.csv")
        .then(res => res.text())
        .then(res => res.replaceAll(/"/g, "").split("\n"))
        .catch(_ => [] as string[]);

    const application = await prisma.application
        .findUnique({
            where: { userId },
            omit: { userId: true }
        })
        .catch(_ => null);

    if (!application) {
        throw redirect(301, "/login");
    }

    return { schools, application };
};