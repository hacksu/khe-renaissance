import { env } from "$env/dynamic/private";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "judging-core/prisma";
import { magicLink } from "better-auth/plugins";

export const auth = betterAuth({
    basePath: "/api/auth",
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3100",
        "http://localhost.khe.io:3000",
        "http://judge.localhost.khe.io:3100",
        "https://khe.io",
        "https://*.khe.io"
    ],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        magicLink({
            expiresIn: 60 * 60 * 24,
            sendMagicLink: async () => {
                throw new Error("The judge app does not send magic links -- invites are sent from the main site.");
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
    advanced: {
        crossSubDomainCookies: {
            enabled: true,
            domain: env.COOKIE_DOMAIN || ".khe.io"
        }
    }
});
