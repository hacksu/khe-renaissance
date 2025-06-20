import { auth } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request }) => {
    const session = await auth.api.getSession(request);
    if (session) {
        throw redirect(301, "/profile");
    }
};