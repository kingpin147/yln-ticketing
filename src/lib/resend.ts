import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_...') {
        console.log('Skipping email send - no API key provided');
        return;
    }

    try {
        const data = await resend.emails.send({
            from: 'YLN Support <onboarding@resend.dev>', // You can customize this later
            to,
            subject,
            html,
        });

        return data;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}
