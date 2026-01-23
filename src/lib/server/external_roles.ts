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
        // For this task, user said "copy those role ids". So checks will be same.
        // But wait, the strict requirement is "role of judge in discord".
        // If I return Role.STAFF, I need to make sure my check in +layout.server.ts allows STAFF as well or if I strictly return JUDGE.
        // Let's modify logic to return an array of roles maybe? Or just hierarchy.
        // Simpler: Just make the existing roles also grant JUDGE.
        // Actually, the type signature is Promise<Role>. It returns a SINGLE role.
        // If I want someone to be both, I might need to change `Role`.
        // However, usually Staff > Judge.
        // Let's add JUDGE. And for now, if they have the role, they are STAFF.
        // Wait, if I change the return to JUDGE, they might lose STAFF access if they are staff.
        // The user said: "needs to have role of judge in discord... see how admin is done, and copy those role ids for right now"
        // Existing code: `return hasLeaderRole ? Role.STAFF : Role.USER;`
        // I will change it to: 
        // if (hasLeaderRole) return Role.STAFF; // assume staff can judge? 
        // actually, let's just make a new Role.JUDGE and if they have the role, return Role.JUDGE.
        // BUT if they are staff, they need to access staff pages. 
        // If I return JUDGE, check if it breaks staff page access.
        // Staff page: `if (role != Role.STAFF)`. Strict equality.
        // So if I return JUDGE, they lose staff access.
        // I should probably make `Role` an enum where STAFF includes JUDGE privileges, OR just let's add `JUDGE` and assume for this specific task/user session they are testing as Judges.
        // actually, let's look at the user request again: "Also needs to be auth protected, and needs to have role of judge in discord... copy those role ids for right now"

        // I will just add JUDGE to the enum.
        // And I will Update the logic:
        // if (hasLeaderRole) return Role.STAFF;

        // Wait, if I use the SAME IDs, `hasLeaderRole` is true. So it returns `Role.STAFF`.
        // So `Role.JUDGE` will never be returned if I use the same list.
        // I will add a `Role.JUDGE` to the enum.
        // And I'll leave the logic as is for now, but I'll update the `+layout.server.ts` of the judge route to accept `Role.STAFF` OR `Role.JUDGE`. 
        // That seems safest without modifying the single-return structure of `getRole`.

        // Revised plan for this file: Just add JUDGE to enum.
        // Wait, I need a way to get Role.JUDGE if I am to test it specifically?
        // Let's just say: `Role.STAFF` is the superuser.
        // I will add `JUDGE = "judge"` to the enum.
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