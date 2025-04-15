import { redirect } from '@sveltejs/kit';

export const GET = async ({ params: { provider }, url }) => {
    return redirect(303, `/api/auth/callback/${provider}?${url.searchParams.toString()}`);
}