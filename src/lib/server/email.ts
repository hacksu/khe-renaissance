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

export const sendApprovalRevocationEmail = async (to: string) => {
    try {
        await client.sendEmail({
            From: env.POSTMARK_SENDER || "staff@khe.io",
            To: to,
            Subject: "Your KHE application approval has been revoked",
            TextBody: "Your application to Kent Hack Enough has been updated. As a result, your previous approval has been revoked. Your application will need to be reviewed and re-approved by our staff. We will notify you once your application has been reviewed.",
            HtmlBody: "<p>Your application to <strong>Kent Hack Enough</strong> has been updated. As a result, your previous approval has been revoked.</p><p>Your application will need to be reviewed and re-approved by our staff. We will notify you once your application has been reviewed.</p>",
        });
        console.log(`Approval revocation email sent to ${to}`);
    } catch (error: any) {
        console.error("Error sending approval revocation email:", error);
        if (error.message) {
            console.error(error.message);
        }
    }
};
