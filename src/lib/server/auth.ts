import { env } from "$env/dynamic/private";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import type { SocialProvider } from "better-auth/social-providers";
import { getRole } from "./external_roles";
import { prisma } from "./prisma";
import { magicLink } from "better-auth/plugins";
import { sendMagicLinkEmail } from "./email";

export const auth = betterAuth({
    basePath: "/api/auth",
    trustedOrigins: [
        "http://localhost:3000",
        "https://khe.io",
        "https://*.khe.io"
    ],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        magicLink({
            expiresIn: 60 * 60 * 24, // 24 hours
            sendMagicLink: async ({ email, url }) => {
                await sendMagicLinkEmail(email, url);
            }
        })
    ],
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
            const { path, request, params } = ctx;

            if (path === "/magic-link/verify" || path === "/sign-in/magic-link/verify") {
                const newSession = ctx.context?.newSession;
                if (request && newSession) {
                    try {
                        const { user } = newSession;

                        // Re-insert the token so the same magic link works again next time
                        const token = new URL(request.url).searchParams.get('token');
                        if (token) {
                            await prisma.verification.create({
                                data: {
                                    identifier: user.email,
                                    value: token,
                                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                }
                            });
                        }

                        const invite = await prisma.invite.findFirst({
                            where: { email: user.email },
                            orderBy: { createdAt: "desc" }
                        });
                        const role = invite?.role ?? user.role ?? "judge";
                        await prisma.user.update({
                            data: { role },
                            where: { id: user.id }
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
                return;
            }

            if (path != "/callback/:id") {
                return;
            }
            const provider = params.id as SocialProvider;
            const newSession = ctx.context?.newSession;
            if (request && newSession) {
                const { session, user } = newSession;
                let role = await getRole(provider, request, session, user.role);
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
    }
});
