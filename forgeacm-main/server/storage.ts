/**
 * CivicLens AI - Media and File Ingestion Layer
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

export type DetectedType = { mime: string; ext: string; kind: 'image' | 'pdf' | 'text' };

export function detectFileType(buf: Buffer, declaredMime = ''): DetectedType | null {
    if (buf.length < 4) return null;
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: '.jpg', kind: 'image' };
    if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: 'image/png', ext: '.png', kind: 'image' };
    if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return { mime: 'image/webp', ext: '.webp', kind: 'image' };
    if (buf.slice(0, 3).toString('ascii') === 'GIF') return { mime: 'image/gif', ext: '.gif', kind: 'image' };
    if (buf.slice(0, 5).toString('ascii') === '%PDF-') return { mime: 'application/pdf', ext: '.pdf', kind: 'pdf' };

    const sample = buf.slice(0, 4096);
    if (!sample.includes(0)) {
        const looksTextual = declaredMime.startsWith('text/') || declaredMime === 'application/json' || declaredMime === '';
        if (looksTextual) {
            const asText = sample.toString('utf8');
            const bad = (asText.match(/[\u0001-\u0008\u000e-\u001f]/g) || []).length;
            if (bad / Math.max(asText.length, 1) < 0.02) return { mime: 'text/plain', ext: '.txt', kind: 'text' };
        }
    }
    return null;
}

export function dataUrlToBuffer(input: string): Buffer {
    const commaIndex = input.startsWith('data:') ? input.indexOf(',') : -1;
    const raw = commaIndex >= 0 ? input.slice(commaIndex + 1) : input;
    return Buffer.from(raw, 'base64');
}

export function sha256(buf: Buffer): string {
    return crypto.createHash('sha256').update(buf).digest('hex');
}

function parseCloudinaryUrl(): { cloud: string; key: string; secret: string } | null {
    const raw = process.env.CLOUDINARY_URL?.trim();
    if (!raw) return null;
    const m = raw.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (!m) return null;
    return { key: m[1], secret: m[2], cloud: m[3] };
}

async function uploadToCloudinary(buf: Buffer, type: DetectedType): Promise<string | null> {
    const cfg = parseCloudinaryUrl();
    if (!cfg) return null;
    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const folder = 'civiclens';
        const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${cfg.secret}`).digest('hex');

        const form = new FormData();
        form.append('file', new Blob([new Uint8Array(buf)], { type: type.mime }), `upload${type.ext}`);
        form.append('api_key', cfg.key);
        form.append('timestamp', timestamp);
        form.append('folder', folder);
        form.append('signature', signature);

        const resourceType = type.kind === 'image' ? 'image' : 'raw';
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloud}/${resourceType}/upload`, { method: 'POST', body: form });
        const json: any = await res.json();
        if (!res.ok || !json.secure_url) throw new Error(json?.error?.message || `HTTP ${res.status}`);
        return json.secure_url as string;
    } catch (err: any) {
        console.warn('[Storage] Cloudinary upload failed, using local disk:', err?.message || err);
        return null;
    }
}

export function storageProvider(): string {
    return parseCloudinaryUrl() ? 'Cloudinary Cloud Storage' : 'Persistent Local Media Server';
}

export async function saveFile(buf: Buffer, type: DetectedType): Promise<string> {
    const cloudUrl = await uploadToCloudinary(buf, type);
    if (cloudUrl) return cloudUrl;

    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${type.ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
    return `/uploads/${name}`;
}