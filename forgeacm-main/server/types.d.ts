declare module 'pdf-parse/lib/pdf-parse.js' {
    interface PdfData {
        numpages: number;
        text: string;
        info?: Record<string, unknown>;
    }
    export default function pdfParse(data: Buffer, options?: Record<string, unknown>): Promise<PdfData>;
}