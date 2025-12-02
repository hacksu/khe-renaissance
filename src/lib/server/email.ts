import { env } from "$env/dynamic/private";
import { google } from "googleapis";

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
    const text = "Congratulations! Your application to Kent Hack Enough has been approved. We look forward to seeing you there!";
    const html = "<p>Congratulations! Your application to <strong>Kent Hack Enough</strong> has been approved. We look forward to seeing you there!</p>";
    
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
    const text = "Your application to Kent Hack Enough has been updated, and your approval status has been revoked. Please re-submit your application if you wish to be considered again.";
    const html = "<p>Your application to <strong>Kent Hack Enough</strong> has been updated, and your approval status has been revoked. Please re-submit your application if you wish to be considered again.</p>";
    
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
