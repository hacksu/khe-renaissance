import { env } from '$env/dynamic/private';
import { auth } from '$lib/server/auth.js';
import { Role } from '$lib/server/external_roles';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const MAIN_APP_URL = () => env.MAIN_APP_URL || 'https://khe.io';

export const load: LayoutServerLoad = async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
        throw redirect(303, `${MAIN_APP_URL()}/auth/login`);
    }

    const role = session.user.role;

    if (role === Role.STAFF) {
        throw redirect(303, `${MAIN_APP_URL()}/admin/judges`);
    }

    if (role !== Role.JUDGE) {
        throw error(401, `You do not have the permissions to access the judging platform. Expected role "${Role.JUDGE}", got "${role ?? "none"}" for ${session.user.email}.`);
    }

    return { session };
}
