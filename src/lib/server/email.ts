import { env } from "$env/dynamic/private";
import { google } from "googleapis";

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

const REVOKED_EMAIL_TEXT =
    `Hi there, 
You have made changes to your application and that has caused your approval to be revoked.
Please wait for staff to review your application again. If you have any questions, feel free to reach out.
Thanks,
Kent Hack Enough 2026 Team`;

const REVOKED_EMAIL_HTML =
    `<p>Hi there,</p>
<p>You have made changes to your application and that has caused your approval to be revoked.</p>
<p>Please wait for staff to review your application again. If you have any questions, feel free to reach out.</p>
<p>Thanks,<br>
<strong>Kent Hack Enough 2026 Team</strong></p>`;

const MANUALLY_REVOKED_EMAIL_TEXT =
    `Hi there,

Due to a discrepancy in your application, we have had to revoke your approval for Kent Hack Enough 2026.
Please review your application and make any necessary changes. Once updated, our staff will review your application again.

If you have any questions, feel free to reach out.
Thanks,
Kent Hack Enough 2026 Team`;

const MANUALLY_REVOKED_EMAIL_HTML =
    `<p>Hi there,</p>
<p>Due to a discrepancy in your application, we have had to revoke your approval for <strong>Kent Hack Enough 2026</strong>.</p>
<p>Please review your application and make any necessary changes. Once updated, our staff will review your application again.</p>
<p>If you have any questions, feel free to reach out.</p>
<p>Thanks,<br>
<strong>Kent Hack Enough 2026 Team</strong></p>`;

const JUDGE_FEEDBACK_EMAIL_SUBJECT = "Your Judge Feedback - Kent Hack Enough 2026";

const createFeedbackEmailText = (projectName: string, feedback: string) => `Hi there,

Here is the feedback for your project "${projectName}" at Kent Hack Enough 2026.

${feedback}

Thank you for participating!

Best,
Kent Hack Enough 2026 Team`;

const createFeedbackEmailHtml = (projectName: string, feedbackHtml: string) => `<p>Hi there,</p>
<p>Here is the feedback for your project "<strong>${projectName}</strong>" at Kent Hack Enough 2026.</p>
${feedbackHtml}
<p>Thank you for participating!</p>
<p>Best,<br>
<strong>Kent Hack Enough 2026 Team</strong></p>`;


// Gmail API client for OAuth2
const oauth2Client = new google.auth.OAuth2(
    env.GMAIL_CLIENT_ID,
    env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: env.GMAIL_REFRESH_TOKEN,
});

const gmailClient = google.gmail({ version: "v1", auth: oauth2Client });

// Helper function to create RFC 2822 email message
const createEmailMessage = (from: string, to: string, subject: string, text: string, html: string): string => {
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let message = `From: ${from}\r\n`;
    message += `To: ${to}\r\n`;
    message += `Subject: ${subject}\r\n`;
    message += `MIME-Version: 1.0\r\n`;
    message += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;

    // Text part
    message += `--${boundary}\r\n`;
    message += `Content-Type: text/plain; charset=UTF-8\r\n`;
    message += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
    message += `${text}\r\n\r\n`;

    // HTML part
    message += `--${boundary}\r\n`;
    message += `Content-Type: text/html; charset=UTF-8\r\n`;
    message += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
    message += `${html}\r\n\r\n`;

    message += `--${boundary}--\r\n`;

    return message;
};

export const sendApprovalEmail = async (to: string) => {
    const from = env.GMAIL_FROM || env.GMAIL_USER || "staff@khe.io";
    const subject = "Your application to KHE has been approved!";
    const text = APPROVAL_EMAIL_TEXT;
    const html = APPROVAL_EMAIL_HTML;

    try {
        const message = createEmailMessage(from, to, subject, text, html);
        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        await gmailClient.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });
    } catch (error: any) {
        console.error("Failed to send approval email:", error);
    }
};

export const sendApprovalRevokedEmail = async (to: string) => {
    const from = env.GMAIL_FROM || env.GMAIL_USER || "staff@khe.io";
    const subject = "Your KHE application approval has been revoked";
    const text = REVOKED_EMAIL_TEXT;
    const html = REVOKED_EMAIL_HTML;

    try {
        const message = createEmailMessage(from, to, subject, text, html);
        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        await gmailClient.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });
    } catch (error: any) {
        console.error("Failed to send revocation email:", error);
    }
};

export const sendManualRevocationEmail = async (to: string) => {
    const from = env.GMAIL_FROM || env.GMAIL_USER || "staff@khe.io";
    const subject = "Your KHE application approval has been revoked";
    const text = MANUALLY_REVOKED_EMAIL_TEXT;
    const html = MANUALLY_REVOKED_EMAIL_HTML;

    try {
        const message = createEmailMessage(from, to, subject, text, html);
        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        await gmailClient.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });
    } catch (error: any) {
        console.error("Failed to send manual revocation email:", error);
    }
};

export const sendJudgeFeedbackEmail = async (to: string, projectName: string, feedbackText: string, feedbackHtml: string) => {
    const from = env.GMAIL_FROM || env.GMAIL_USER || "staff@khe.io";
    const subject = JUDGE_FEEDBACK_EMAIL_SUBJECT;
    const text = createFeedbackEmailText(projectName, feedbackText);
    const html = createFeedbackEmailHtml(projectName, feedbackHtml);
    try {
        const message = createEmailMessage(from, to, subject, text, html);
        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        await gmailClient.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });
    } catch (error: any) {
        console.error("Failed to send feedback email to " + to, error);
    }
};

const REMINDER_EMAIL_TEXT =
    `Hi there,

We noticed you have started an account but haven't submitted your application for Kent Hack Enough 2026 yet!

The deadline is approaching fast, so please head over to our website and complete your application as soon as possible.

If you have any questions or need assistance, feel free to reply to this email.

Best,
Kent Hack Enough 2026 Team`;

const REMINDER_EMAIL_HTML =
    `<p>Hi there,</p>
<p>We noticed you have started an account but haven't submitted your application for <strong>Kent Hack Enough 2026</strong> yet!</p>
<p>The deadline is approaching fast, so please head over to our website and complete your application as soon as possible.</p>
<p>If you have any questions or need assistance, feel free to reply to this email.</p>
<p>Best,<br>
<strong>Kent Hack Enough 2026 Team</strong></p>`;

export const sendReminderEmail = async (to: string) => {
    const from = env.GMAIL_FROM || env.GMAIL_USER || "staff@khe.io";
    const subject = "Don't forget to submit your application for KHE 2026!";
    const text = REMINDER_EMAIL_TEXT;
    const html = REMINDER_EMAIL_HTML;

    try {
        const message = createEmailMessage(from, to, subject, text, html);
        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        await gmailClient.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });
    } catch (error: any) {
        console.error("Failed to send reminder email:", error);
    }
};

const MAGIC_LINK_EMAIL_TEXT = (url: string) => `Hi there,

Here is your magic link to log in to Kent Hack Enough 2026:
${url}

If you did not request this, you can ignore this email.

Thanks,
Kent Hack Enough 2026 Team`;

const MAGIC_LINK_EMAIL_HTML = (url: string) => `<p>Hi there,</p>
<p>Here is your magic link to log in to <strong>Kent Hack Enough 2026</strong>:</p>
<p><a href="${url}" style="display:inline-block;background:#E11D48;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Login to KHE 2026</a></p>
<p>Or copy and paste this link: <a href="${url}">${url}</a></p>
<p>If you did not request this, you can ignore this email.</p>
<p>Thanks,<br>
<strong>Kent Hack Enough 2026 Team</strong></p>`;

export const sendMagicLinkEmail = async (to: string, url: string) => {
    const from = env.GMAIL_FROM || env.GMAIL_USER || "staff@khe.io";
    const subject = "Login to Kent Hack Enough 2026";
    const text = MAGIC_LINK_EMAIL_TEXT(url);
    const html = MAGIC_LINK_EMAIL_HTML(url);

    try {
        const message = createEmailMessage(from, to, subject, text, html);
        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        await gmailClient.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });
    } catch (error: any) {
        console.error("Failed to send magic link email:", error);
    }
};