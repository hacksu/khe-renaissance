import { env } from "$env/dynamic/private";
import * as postmark from "postmark";

const client = new postmark.ServerClient(env.POSTMARK_API_KEY || "");

export const sendApprovalEmail = async (to: string) => {
    try {
        await client.sendEmail({
            From: env.POSTMARK_SENDER || "staff@khe.io",
            To: to,
            Subject: "Your application to KHE has been approved!",
            TextBody: "Congratulations! Your application to Kent Hack Enough has been approved. We look forward to seeing you there!",
            HtmlBody: "<p>Congratulations! Your application to <strong>Kent Hack Enough</strong> has been approved. We look forward to seeing you there!</p>",
        });
        console.log(`Approval email sent to ${to}`);
    } catch (error: any) {
        console.error("Error sending approval email:", error);
        if (error.message) {
            console.error(error.message);
        }
    }
};

export const sendApprovalRevokedEmail = async (to: string) => {
    try {
        await client.sendEmail({
            From: env.POSTMARK_SENDER || "staff@khe.io",
            To: to,
            Subject: "Your KHE application approval has been revoked",
            TextBody: "Your application to Kent Hack Enough has been updated, and your approval status has been revoked. Please re-submit your application if you wish to be considered again.",
            HtmlBody: "<p>Your application to <strong>Kent Hack Enough</strong> has been updated, and your approval status has been revoked. Please re-submit your application if you wish to be considered again.</p>",
        });
        console.log(`Revocation email sent to ${to}`);
    } catch (error: any) {
        console.error("Error sending revocation email:", error);
        if (error.message) {
            console.error(error.message);
        }
    }
};
