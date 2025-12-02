import { env } from "$env/dynamic/private";
import * as postmark from "postmark";

const client = new postmark.ServerClient(env.POSTMARK_API_KEY || "");

const APPROVAL_EMAIL_TEXT = 
`Hi there,

Great news! Your application to Kent Hack Enough 2026 has been approved.

The event will take place on March 28–29th. More updates will be shared soon, so stay tuned.

In the meantime, be sure to join our community Discord:
https://discord.gg/FHrw9AHtA8

And remember to sign up on our Devpost page so you will be able to submit your project during the hackathon:
https://kent-hack-enough-2026.devpost.com/

If you have any questions at all, feel free to reach out. We are here to help.

Thanks,
Kent Hack Enough 2026 Team`;

const APPROVAL_EMAIL_HTML = 
`<p>Hi there,</p>
<p>Great news! Your application to <strong>Kent Hack Enough 2026</strong> has been approved.</p>
<p>The event will take place on <strong>March 28–29th</strong>. More updates will be shared soon, so stay tuned.</p>
<p>In the meantime, be sure to join our community Discord:<br>
<a href="https://discord.gg/FHrw9AHtA8">https://discord.gg/FHrw9AHtA8</a></p>
<p>And remember to sign up on our Devpost page so you will be able to submit your project during the hackathon:<br>
<a href="https://kent-hack-enough-2026.devpost.com/">https://kent-hack-enough-2026.devpost.com/</a></p>
<p>If you have any questions at all, feel free to reach out. We are here to help.</p>
<p>Thanks,<br>
<strong>Kent Hack Enough 2026 Team</strong></p>`;

const REVOKED_EMAIL_TEXT = "Your application to Kent Hack Enough has been updated, and your approval status has been revoked. Please re-submit your application if you wish to be considered again.";

const REVOKED_EMAIL_HTML = "<p>Your application to <strong>Kent Hack Enough</strong> has been updated, and your approval status has been revoked. Please re-submit your application if you wish to be considered again.</p>";

export const sendApprovalEmail = async (to: string) => {
    try {
        await client.sendEmail({
            From: env.POSTMARK_SENDER || "staff@khe.io",
            To: to,
            Subject: "Your application to KHE has been approved!",
            TextBody: APPROVAL_EMAIL_TEXT,
            HtmlBody: APPROVAL_EMAIL_HTML,
        });
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
            TextBody: REVOKED_EMAIL_TEXT,
            HtmlBody: REVOKED_EMAIL_HTML,
        });
    } catch (error: any) {
        console.error("Error sending revocation email:", error);
        if (error.message) {
            console.error(error.message);
        }
    }
};
