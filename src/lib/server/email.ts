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
        // Silently fail - errors are handled by caller if needed
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
        // Silently fail - errors are handled by caller if needed
    }
};