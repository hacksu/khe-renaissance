import type { Session } from "better-auth";
import type { SocialProvider } from "better-auth/social-providers";
import { auth } from "./auth";
import { prisma } from "./prisma";

const DISCORD_GUILD_ID = "632634799303032852";
const DISCORD_ROLES = ["1239730741882130542", "634455003834089513", "1362900867186950274"]

type ExternalRoleHandler = (request: Request, session: Session) => Promise<Role>;
const handlers: Partial<Record<SocialProvider, ExternalRoleHandler>> = {
    "discord": async (request: Request, session: Session) => {
        const account = await prisma.account.findFirst({
            where: { userId: session.userId, providerId: "discord" },
            select: { id: true }
        });
        if (!account) return Role.USER;

        const tokens = await auth.api.getAccessToken({
            body: {
                accountId: account.id,
                userId: session.userId
            }
        });
        const response = await fetch(`https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`, {
            headers: {
                "Authorization": `Bearer ${tokens.accessToken}`
            },
        }).catch((e) => {
            console.error(`[discord-role] guild member request failed for ${session.userId}:`, e);
            return null;
        });

        const member = response ? await response.json().catch(() => null) : null;

        if (!response?.ok) {
            console.error(
                `[discord-role] guild ${DISCORD_GUILD_ID} lookup returned ${response?.status ?? "no response"} for user ${session.userId}:`,
                member
            );
            return Role.USER;
        }

        const actualRoles: string[] = member?.roles ?? [];
        const hasLeaderRole = actualRoles.some((role: string) => DISCORD_ROLES.includes(role));

        console.log(
            `[discord-role] user ${session.userId} -> ${hasLeaderRole ? Role.STAFF : Role.USER}\n` +
            `  expected any of: ${DISCORD_ROLES.join(", ")}\n` +
            `  actual roles:    ${actualRoles.length ? actualRoles.join(", ") : "(none)"}`
        );

        return hasLeaderRole ? Role.STAFF : Role.USER;
    }
}

export enum Role {
    USER = "user",
    STAFF = "staff",
    JUDGE = "judge"
}

export const getRole = async (provider: SocialProvider, request: Request, session: Session, currentRole?: string | null): Promise<Role> => {
    const handler = handlers[provider];
    if (handler && request && session) {
        return await handler(request, session);
    }
    // Preserve the existing role for providers without a handler rather than demoting to USER
    return (currentRole as Role) ?? Role.USER;
};
