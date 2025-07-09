import { auth } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request}) => {
    const session = await auth.api.getSession(request);
    if (session) {
        await auth.api.signOut({ headers: request.headers });
    }
    return redirect(301, "/auth/login");
};