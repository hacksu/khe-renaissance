import { auth } from '$lib/server/auth.js';
import { Role } from '$lib/server/external_roles';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
    const session = await auth.api.getSession(request);
    if (!session) {
        throw redirect(301, "/auth/login");
    }

    const role = session.user.role;

    // Redirect staff to staff area
    if (role === Role.STAFF) {
        throw redirect(303, "/admin/judges");
    }

    // Only allow JUDGE access
    if (role !== Role.JUDGE) {
        throw error(401, "You do not have the permissions to access the judging platform.");
    }

    return { session };
}
