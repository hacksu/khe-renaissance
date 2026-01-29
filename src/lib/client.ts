import { createAuthClient } from "better-auth/svelte";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: import.meta.env.BETTER_AUTH_URL,
    plugins: [
        magicLinkClient()
    ]
})