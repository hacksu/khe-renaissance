import type { Session } from "better-auth";
import type { SocialProvider } from "better-auth/social-providers";
import { auth } from "./auth";

const DISCORD_GUILD_ID = "632634799303032852";
const DISCORD_ROLES = ["1239730741882130542", "634455003834089513", "1362900867186950274"]

type ExternalRoleHandler = (request: Request, session: Session) => Promise<Role>;
const handlers: Partial<Record<SocialProvider, ExternalRoleHandler>> = {
    "discord": async (request: Request, session: Session) => {
        const tokens = await auth.api.getAccessToken({
            body: {
                providerId: "discord",
                userId: session.userId
            },
            headers: request.headers
        });
        const member = await fetch(`https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`, {
            headers: {
                "Authorization": `Bearer ${tokens.accessToken}`
            },
        })
            .then(res => res.json())
            .catch(_ => null);

        const hasLeaderRole = member?.roles?.some((role: string) => DISCORD_ROLES.includes(role));
        if (hasLeaderRole) return Role.STAFF; // Staff implies Judge access usually, or we can make them distinct. 
        return hasLeaderRole ? Role.STAFF : Role.USER;
    }
}

export enum Role {
    USER = "user",
    STAFF = "staff",
    JUDGE = "judge"
}

export const getRole = async (provider: SocialProvider, request: Request, session: Session): Promise<Role> => {
    const handler = handlers[provider];
    if (handler && request && session) {
        return await handler(request, session);
    }
    return Role.USER;
};
