import { env } from "$env/dynamic/private";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import type { SocialProvider } from "better-auth/social-providers";
import { getRole } from "./external_roles";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
                required: false,
                input: false,
            }
        }
    },
    hooks: {
        after: createAuthMiddleware(async ctx => {
            const { path, request, params, context: { newSession } } = ctx;
            if (path != "/callback/:id") {
                return;
            }
            const provider = params.id as SocialProvider;
            if (request && newSession) {
                const { session, user }= newSession;
                let role = await getRole(provider, request, session);
                await prisma.user.update({
                    data: { role },
                    where: { id: user.id }
                });
            }
        })
    },
    socialProviders: {
        discord: {
            scope: ["guilds.members.read"],
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        },
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
        },
        google: {
            prompt: "select_account",
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
        microsoft: {
            clientId: env.MICROSOFT_CLIENT_ID,
            clientSecret: env.MICROSOFT_CLIENT_SECRET,
        }
    }
});