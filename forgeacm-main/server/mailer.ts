/**
 * CivicLens AI - SMTP Mailer
 */
import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
    if (transporter !== undefined) return transporter;
    const url = process.env.SMTP_URL?.trim();
    const host = process.env.SMTP_HOST?.trim();
    if (url) {
        transporter = nodemailer.createTransport(url);
    } else if (host) {
        transporter = nodemailer.createTransport({
            host,
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT || 587) === 465,
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' } : undefined,
        });
    } else {
        transporter = null;
    }
    return transporter;
}

export const isMailConfigured = (): boolean => getTransporter() !== null;

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
    const t = getTransporter();
    if (!t) return false;
    try {
        await t.sendMail({ from: process.env.MAIL_FROM || 'CivicLens AI <no-reply@civiclens.gov>', to, subject, text });
        return true;
    } catch (err: any) {
        console.error('[Mail] Could not dispatch email:', err?.message || err);
        return false;
    }
}