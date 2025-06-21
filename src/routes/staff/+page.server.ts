import { auth } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';



export const load = async ({ request }) => {
    const session = await auth.api.getSession(request);
    if (!session) {
        throw redirect(301, "/auth/login");
    }
}