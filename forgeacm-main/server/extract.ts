/**
 * CivicLens AI - Document Text Extraction (PDF + Vision OCR)
 */
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { DetectedType } from './storage.js';
import { extractTextWithGemini, isGeminiConfigured } from './gemini.js';

export const MAX_EXTRACTED_CHARS = 60_000;

export interface Extraction {
    text: string;
    method: 'text-file' | 'pdf-text' | 'ai-ocr';
    pages?: number;
    truncated: boolean;
}

function clean(text: string): string {
    return text
        .replace(/\u0000/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function finish(text: string, method: Extraction['method'], pages?: number): Extraction {
    const cleaned = clean(text);
    const truncated = cleaned.length > MAX_EXTRACTED_CHARS;
    return { text: truncated ? cleaned.slice(0, MAX_EXTRACTED_CHARS) : cleaned, method, pages, truncated };
}

export async function extractDocumentText(buffer: Buffer, type: DetectedType): Promise<Extraction> {
    if (type.kind === 'text') {
        return finish(buffer.toString('utf8'), 'text-file');
    }

    if (type.kind === 'pdf') {
        let pdfText = '';
        let pages: number | undefined;
        try {
            const parsed = await pdfParse(buffer);
            pdfText = clean(parsed.text || '');
            pages = parsed.numpages;
        } catch (err: any) {
            console.warn('[Extract] pdf-parse failed, attempting OCR fallback:', err?.message || err);
        }

        if (pdfText.length >= 200) return finish(pdfText, 'pdf-text', pages);

        if (isGeminiConfigured()) {
            const ocr = await extractTextWithGemini(buffer, 'application/pdf');
            if (ocr.length > pdfText.length) return finish(ocr, 'ai-ocr', pages);
        }
        if (pdfText.length > 0) return finish(pdfText, 'pdf-text', pages);
        throw new Error('This PDF contains no extractable text layer and OCR is unavailable. Please paste document text.');
    }

    const ocr = await extractTextWithGemini(buffer, type.mime);
    if (!ocr) throw new Error('No legible text found in document image.');
    return finish(ocr, 'ai-ocr');
}