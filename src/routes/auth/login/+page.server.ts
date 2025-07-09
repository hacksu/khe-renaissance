import { auth } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { SocialProvider } from "better-auth/social-providers";
import type { PageServerLoad } from "./$types";

type Provider = {
    name: string;
    icon: string,
    provider: SocialProvider
}
const PROVIDERS: Provider[] = [
    {
        icon: "discord",
        name: "Discord",
        provider: "discord"
    },
    {
        icon: "github",
        name: "Github",
        provider: "github"
    },
    {
        icon: "google",
        name: "Google",
        provider: "google"
    },
    {
        icon: "microsoft",
        name: "Microsoft",
        provider: "microsoft"
    }
]

export const load: PageServerLoad = async ({ request }) => {
    const session = await auth.api.getSession(request);
    if (session) {
        throw redirect(301, "/profile");
    }

    return { providers: PROVIDERS };
};