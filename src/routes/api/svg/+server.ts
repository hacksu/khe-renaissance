import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const target = url.searchParams.get('url');
    if (!target) return new Response('Missing url', { status: 400 });

    try {
        const response = await fetch(target);
        if (!response.ok) return new Response('Upstream error', { status: response.status });
        const body = await response.arrayBuffer();
        return new Response(body, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch {
        return new Response('Failed to fetch', { status: 502 });
    }
};
