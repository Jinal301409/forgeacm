declare module 'pdf-parse/lib/pdf-parse.js' {
    interface PdfData {
        numpages: number;
        text: string;
        info?: Record<string, unknown>;
    }
    export default function pdfParse(data: Buffer, options?: Record<string, unknown>): Promise<PdfData>;
}

declare module 'nodemailer' {
    export interface Transporter {
        sendMail(mailOptions: { from?: string; to: string; subject: string; text: string }): Promise<any>;
    }
    export function createTransport(configOrUrl: any): Transporter;
    const nodemailer: {
        createTransport(configOrUrl: any): Transporter;
    };
    export default nodemailer;
}