/* eslint-disable */
// Copper Corridor — Originkit

// Delivered by Originkit · stack: nextjs
"use client"
import { useEffect, useRef, useState, type CSSProperties } from "react"

// ── moved controls (builder) ──
/**
 * Controls moved in the builder: into Advanced, out of it, or into groups of
 * their own. The code reads each one where it was first written, so the props
 * are put back in that shape before anything reads them.
 */
const MOVED_CONTROLS: { into: Record<string, string>; out: Record<string, string> } = {"into":{},"out":{"hover":"advanced"}}
const GROUP_FALLBACKS: Record<string, any> = {  }
function withMovedControls(props: any): any {
    const out = { ...props }
    for (const [k, g] of Object.entries(MOVED_CONTROLS.into)) out[k] = props?.[g]?.[k] ?? GROUP_FALLBACKS[g]?.[k]
    for (const [k, g] of Object.entries(MOVED_CONTROLS.out)) {
        if (out[k] !== undefined) out[g] = { ...(out[g] ?? {}), [k]: out[k] }
    }
    return out
}
// ── /moved controls ──

/**
 * CopperCorridor — a first-person flight down an endless throat of light.
 * Filaments line a tube that cinches and flares again and again along its
 * length, a chain of hourglass waists one behind another, and the camera
 * flies through them: the next waist glows sharp ahead while the last one's
 * strands flare past the edges of the frame as wide, prismatic spindles.
 */

// ── Reference frame ─────────────────────────────────────────────────────────
const REF_W = 1200
const REF_H = 800
const REF_ASPECT = REF_W / REF_H
const WORLD_PERIOD = 12
const BULGE_R = 0.55
const Z_NEAR = 0.035
const Z_BACK = -0.6
const CAP_FAR = 300
const TAB_W = 512
const STEP_LENS = 0.05
const GLINT_SEG = 16
const BK_W = 1024
const GLINT_RANGE = 6
const DUST_RANGE = 4
const DUST_PER_UNIT = 2400
const FLY_RATE = 0.42
const SURGE_RATE = 1.9
const GLOW_R = 0.22
const GLOW_GAIN = 1.6
const HOVER_RATE = 0.35
const START_Z = 0
const SOFT_LO = 2.2
const SOFT_HI = 3.6
const MAX_PIXELS = 2.6e6
const QUALITY_LEVELS = [1, 0.85, 0.72, 0.6]

// ── Defaults ────────────────────────────────────────────────────────────────
const DEFAULTS = {
    background: "#131212",
    baseColor: "#FF8A3A",
    accentColor: "#5FE0E0",
    density: 89,
    pinch: 50,
    fringe: 62,
    surge: 4.6,
    speed: 30,
}

const DEFAULT_PLACEMENT = { x: 0, y: 0, angle: 0, tilt: 0 }
type Placement = typeof DEFAULT_PLACEMENT

const DEFAULT_ADVANCED = {
    seed: 1,
    strands: 120,
    bedStrands: 160,
    bundles: 5,
    lean: 45,
    wind: 100,
    depth: 9,
    fov: 74,
    focus: 60,
    defocus: 100,
    streakLength: 45,
    streakWidth: 1,
    coreColor: "#EADBB9",
    violetColor: "#8A6CFF",
    midColor: "#8D6A61",
    hazeColor: "#6E4A40",
    dustColor: "#D8D0C8",
    cyanShare: 15,
    violetShare: 10,
    exposure: 140,
    bloom: 75,
    haze: 60,
    fibres: 100,
    glints: 55,
    dust: 50,
    stars: 50,
    grain: 12,
    vignette: 22,
    hover: 50,
    glintSpeed: 35,
    flicker: 30,
    breathe: 6,
    breathePeriod: 6000,
}
type Advanced = typeof DEFAULT_ADVANCED

export interface CopperCorridorProps {
    background?: string
    baseColor?: string
    accentColor?: string
    density?: number
    pinch?: number
    fringe?: number
    placement?: Partial<Placement>
    surge?: number
    speed?: number
    advanced?: Partial<Advanced>
    style?: CSSProperties
}

// ── Small helpers ───────────────────────────────────────────────────────────
type RGB = [number, number, number]
const COLOR_CACHE = new Map<string, { c: RGB; a: number } | null>()

function parseColorA(input: unknown, fallback: RGB): { c: RGB; a: number } {
    if (typeof input !== "string") return { c: fallback, a: 1 }
    let hit = COLOR_CACHE.get(input)
    if (hit === undefined) {
        hit = parseColorRaw(input)
        COLOR_CACHE.set(input, hit)
    }
    return hit ?? { c: fallback, a: 1 }
}
function parseColor(input: unknown, fallback: RGB): RGB {
    return parseColorA(input, fallback).c
}

function parseColorRaw(raw: string): { c: RGB; a: number } | null {
    let s = raw.trim()
    const v = /^var\(\s*--[^,]+,\s*(.+)\)$/.exec(s)
    if (v) s = v[1].trim()
    if (s[0] === "#") {
        const h = s.slice(1)
        const x = (t: string) => parseInt(t, 16) / 255
        let c: RGB
        let a = 1
        if (h.length === 3 || h.length === 4) {
            c = [x(h[0] + h[0]), x(h[1] + h[1]), x(h[2] + h[2])]
            if (h.length === 4) a = x(h[3] + h[3])
        } else if (h.length === 6 || h.length === 8) {
            c = [x(h.slice(0, 2)), x(h.slice(2, 4)), x(h.slice(4, 6))]
            if (h.length === 8) a = x(h.slice(6, 8))
        } else return null
        return c.every(Number.isFinite) && Number.isFinite(a) ? { c, a } : null
    }
    const m = /^(rgba?|hsla?)\(([^)]*)\)$/i.exec(s)
    if (!m) return null
    const parts = m[2].split(/[\s,/]+/).filter(Boolean)
    if (parts.length < 3) return null
    const pn = (p: string, scale: number) => (p.endsWith("%") ? (parseFloat(p) / 100) * scale : parseFloat(p))
    const a = parts.length > 3 ? pn(parts[3], 1) : 1
    let rgb: RGB
    if (m[1].toLowerCase().startsWith("rgb")) {
        rgb = [pn(parts[0], 255) / 255, pn(parts[1], 255) / 255, pn(parts[2], 255) / 255]
    } else {
        const hh = (((parseFloat(parts[0]) % 360) + 360) % 360) / 360
        const ss = pn(parts[1], 1)
        const ll = pn(parts[2], 1)
        const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss
        const p = 2 * ll - q
        const f = (t: number) => {
            t = (t + 1) % 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }
        rgb = [f(hh + 1 / 3), f(hh), f(hh - 1 / 3)]
    }
    if (!rgb.every(Number.isFinite) || !Number.isFinite(a)) return null
    return { c: rgb.map((c) => Math.min(1, Math.max(0, c))) as RGB, a: Math.min(1, Math.max(0, a)) }
}

function asLight(c: RGB): RGB {
    const f = (v: number) => -Math.log(1 - Math.min(v, 0.96) * 0.97)
    return [f(c[0]), f(c[1]), f(c[2])]
}

function num(v: unknown, d: number, lo = -Infinity, hi = Infinity): number {
    const n = typeof v === "number" && Number.isFinite(v) ? v : d
    return Math.min(hi, Math.max(lo, n))
}

function sameProps(a: CopperCorridorProps, b: CopperCorridorProps | null): boolean {
    if (!b) return false
    const ka = Object.keys(a) as (keyof CopperCorridorProps)[]
    if (ka.length !== Object.keys(b).length) return false
    for (const k of ka) {
        const x = a[k]
        const y = b[k]
        if (x === y || k === "style") continue
        if (x && y && typeof x === "object" && typeof y === "object") {
            const ox = x as Record<string, unknown>
            const oy = y as Record<string, unknown>
            const kx = Object.keys(ox)
            if (kx.length !== Object.keys(oy).length) return false
            for (const kk of kx) if (ox[kk] !== oy[kk]) return false
            continue
        }
        return false
    }
    return true
}

function waistRadius(pinch: number): number {
    return 0.44 * Math.pow(0.05 / 0.44, pinch / 100)
}

function axisX(z: number, wind: number): number {
    return wind * 0.12 * Math.sin((2 * Math.PI * z) / 4)
}
function axisY(z: number, wind: number): number {
    return wind * 0.075 * Math.sin((2 * Math.PI * z) / 6 + 1.1)
}

// ── GLSL ────────────────────────────────────────────────────────────────────
const HEAD = `#version 300 es
precision highp float;
precision highp int;
`

const TUBE_GLSL = `
uniform vec4 uTube;
uniform vec4 uCamR;
uniform vec4 uCamU;
uniform vec4 uCamF;
uniform vec4 uProj;
uniform vec4 uProj2;
uniform vec4 uDofP;
uniform vec4 uDepth;
uniform vec4 uPass;
uniform vec4 uSeedB;
uniform vec4 uPtr;
const float PI = 3.14159265;
const float TAU = 6.2831853;
const float WP = ${WORLD_PERIOD.toFixed(1)};

uint hu(uint x) { x ^= x >> 16; x *= 0x7feb352du; x ^= x >> 15; x *= 0x846ca68bu; x ^= x >> 16; return x; }
vec4 h4(uint x) {
    uint a = hu(x); uint b = hu(a ^ 0x9e3779b9u); uint c = hu(b ^ 0x85ebca6bu); uint d = hu(c ^ 0xc2b2ae35u);
    return vec4(float(a >> 8u), float(b >> 8u), float(c >> 8u), float(d >> 8u)) * (1.0 / 16777216.0);
}

float sOf(float z) { return sin(PI * (z - 0.5)); }
vec2 centreAt(float z) { return uTube.w * vec2(0.12 * sin(TAU * z / 4.0), 0.075 * sin(TAU * z / 6.0 + 1.1)); }
vec3 tubeAt(float th0, float rho, float z) {
    float k = uTube.y * sOf(z);
    float r = uTube.x * sqrt(1.0 + k * k) * rho;
    float th = th0 + uTube.z * atan(k);
    return vec3(centreAt(z) + r * vec2(cos(th), sin(th)), z);
}
vec3 toView(vec3 p) {
    vec3 d = p - vec3(uCamR.w, uCamU.w, uCamF.w);
    return vec3(dot(uCamR.xyz, d), dot(uCamU.xyz, d), dot(uCamF.xyz, d));
}
vec2 toScreen(vec3 v) {
    vec2 q = vec2(v.x, -v.y) * (uProj.x / max(v.z, 0.02));
    return uProj.yz + vec2(q.x * uProj2.x - q.y * uProj2.y, q.x * uProj2.y + q.y * uProj2.x);
}
vec4 toClip(vec2 s) {
    return vec4(s.x / uProj2.z * 2.0 - 1.0, 1.0 - s.y / uProj2.w * 2.0, 0.0, 1.0);
}
float cocAt(float vz) { return min(uDofP.x * abs(1.0 / max(vz, 0.02) - uDofP.y), uDofP.w); }
float passW(float sig) {
    float f = 1.0 - smoothstep(uPass.y, uPass.z, sig);
    return uPass.x > 0.5 ? f : 1.0 - f;
}
const float ZCLIP = 0.03;
const float EXT_SIG = 2.8;
float gExp(float s) { s = max(s, 0.3); return -0.7213475 / (s * s); }
float ptrGlow(vec2 s) {
    if (uPtr.w <= 0.0) return 0.0;
    vec2 d = (s - uPtr.xy) / max(uPtr.z, 1.0);
    return uPtr.w * exp(-0.5 * dot(d, d));
}
float depthW(float vz, float zr) {
    return smoothstep(ZCLIP, 0.09, vz) * (1.0 - smoothstep(uDepth.y * 0.7, uDepth.y, zr)) * (0.1 + 0.9 * exp(-zr / uDepth.w));
}
vec2 frameAt(vec2 sp, vec2 s0, vec2 sn, bool okP, bool okN, out float extMax, out float pxLen) {
    vec2 a = okP ? s0 - sp : vec2(0.0);
    vec2 b = okN ? sn - s0 : vec2(0.0);
    float la = length(a);
    float lb = length(b);
    bool ha = la > 1e-4;
    bool hb = lb > 1e-4;
    vec2 ta = ha ? a / la : vec2(0.0);
    vec2 tb = hb ? b / lb : vec2(0.0);
    vec2 tt = ta + tb;
    vec2 t = dot(tt, tt) > 1e-8 ? normalize(tt) : (ha ? ta : (hb ? tb : vec2(1.0, 0.0)));
    float c = (ha && hb) ? clamp(dot(ta, tb), -1.0, 1.0) : 1.0;
    float th = sqrt(max(1.0 - c, 0.0) / max(1.0 + c, 1e-4));
    float lm = (ha && hb) ? min(la, lb) : max(la, lb);
    extMax = th > 1e-4 ? 0.5 * lm / th : 1e6;
    pxLen = (ha && hb) ? 0.5 * (la + lb) : max(la, lb);
    return t;
}
float bundleAt(float th0, float z) {
    float b = 0.0;
    uint sd = uint(uSeedB.x) * 0x2f9be6cdu;
    for (int j = 0; j < 8; j++) {
        if (float(j) >= uSeedB.y) break;
        vec4 hb = h4(uint(j) * 0x61c88647u + sd + 77u);
        float c = th0 - TAU * hb.x - 0.6 * sin(TAU * (z * (1.0 + floor(hb.z * 3.0)) / WP + hb.w));
        b += (0.45 + 0.55 * hb.w) * pow(max(cos(c), 0.0), 4.0 + 18.0 * hb.y);
    }
    return 0.2 + uPass.w * b;
}
`

const STRAND_BAKE_VS =
    HEAD +
    TUBE_GLSL +
    `
uniform vec4 uSt;
uniform highp sampler2D uZs;
out vec4 oP;
out vec4 oQ;
void main() {
    int nS = int(uSt.z);
    int sid = gl_VertexID / nS;
    int i = gl_VertexID - sid * nS;
    uint sd = uint(uSeedB.x) * 0x9E3779B1u;
    bool bright = float(sid) < uSt.x;
    vec4 h = h4(uint(sid) * 0x27d4eb2du + sd);
    float th0 = bright ? TAU * (float(sid) + 0.8 * (h.x - 0.5)) / uSt.x : TAU * h.x;
    float rho = bright ? 0.94 + 0.12 * h.y : 0.84 + 0.32 * h.y;
    float zr = texelFetch(uZs, ivec2(i, 0), 0).r;
    float z = uCamF.w + zr;
    vec3 v = toView(tubeAt(th0, rho, z));
    if (v.z < ZCLIP) {
        float zo = texelFetch(uZs, ivec2(min(i + 1, nS - 1), 0), 0).r;
        vec3 vo = toView(tubeAt(th0, rho, uCamF.w + zo));
        if (vo.z < ZCLIP) {
            zo = texelFetch(uZs, ivec2(max(i - 1, 0), 0), 0).r;
            vo = toView(tubeAt(th0, rho, uCamF.w + zo));
        }
        if (vo.z >= ZCLIP) {
            zr = mix(zr, zo, clamp((ZCLIP - v.z) / max(vo.z - v.z, 1e-6), 0.0, 1.0));
            z = uCamF.w + zr;
            v = toView(tubeAt(th0, rho, z));
        }
    }
    oP = vec4(toScreen(v), v.z, zr);
    oQ = vec4(toScreen(toView(vec3(centreAt(z), z))), bundleAt(th0, z), z);
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}
`

const BAKE_FS =
    HEAD +
    `
out vec4 o;
void main() { o = vec4(0.0); }
`

const BK_GLSL = `
uniform highp sampler2D uBk;
vec4 bk(int k) { return texelFetch(uBk, ivec2(k & ${BK_W - 1}, k >> ${Math.log2(BK_W)}), 0); }
`

const STRAND_VS =
    HEAD +
    TUBE_GLSL +
    BK_GLSL +
    `
uniform vec4 uSt;
uniform vec4 uSt2;
uniform vec4 uSt3;
uniform vec4 uSt4;
uniform vec3 uCoreE;
uniform vec3 uBaseE;
uniform vec3 uAccE;
uniform vec3 uVioE;
uniform vec3 uMidE;
out vec4 vA;
out vec3 vCore;
out vec3 vHalo;
void main() {
    int seg = int(uSt.z);
    int per = 2 * seg + 4;
    int sid = gl_VertexID / per;
    int k = clamp(gl_VertexID - sid * per - 1, 0, 2 * seg + 1);
    int smp = k >> 1;
    float side = (k & 1) == 0 ? -1.0 : 1.0;
    uint sd = uint(uSeedB.x) * 0x9E3779B1u;
    bool bright = float(sid) < uSt.x;
    vec4 h2 = h4(hu(uint(sid) ^ 0x5bd1e995u) + sd);
    vec4 hk = h4(hu(uint(sid) * 0x165667b1u) + sd);

    int stride = int(uSt.w);
    int nS = int(uSt2.x);
    int last = nS - 1;
    int i0 = min(smp * stride, last);
    int base = sid * nS;
    vec4 P = bk((base + i0) * 2);
    vec4 Q = bk((base + i0) * 2 + 1);
    vec4 Pp = bk((base + max(i0 - stride, 0)) * 2);
    vec4 Pn = bk((base + min(i0 + stride, last)) * 2);
    float rim = ptrGlow(P.xy);
    vec2 s0 = P.xy;
    float vz = P.z;
    float zr = P.w;
    float z = Q.w;
    float env = Q.z;
    bool okP = i0 > 0 && Pp.z >= ZCLIP;
    bool okN = i0 < last && Pn.z >= ZCLIP;
    float dz = max(Pn.w - zr, zr - Pp.w);
    float extMax;
    float pxLen;
    vec2 t = frameAt(Pp.xy, s0, Pn.xy, okP, okN, extMax, pxLen);
    float pxPerZ = pxLen / max((okP && okN) ? 0.5 * (Pn.w - Pp.w) : dz, 1e-4);
    vec2 n = vec2(-t.y, t.x);

    float coc = cocAt(vz);
    float hair = uDofP.z;
    float wpx = uSt4.x * (bright ? 1.0 : 0.6) * uProj.x / max(vz, 0.02);
    float body = max(hair, wpx);
    float sig = sqrt(body * body + coc * coc);
    float sc = sqrt(hair * hair + coc * coc);

    float bz = sig / max(pxPerZ, 1e-3);
    float k1 = 6.0 + floor(hk.x * 12.0);
    float k2 = 24.0 + floor(hk.y * 25.0);
    float k3 = 60.0 + floor(hk.z * 61.0);
    float c1 = exp(-19.7 * (bz * k1 / WP) * (bz * k1 / WP));
    float c2 = exp(-19.7 * (bz * k2 / WP) * (bz * k2 / WP)) * (1.0 - smoothstep(0.2, 0.45, dz * k2 / WP));
    float c3 = exp(-19.7 * (bz * k3 / WP) * (bz * k3 / WP)) * (1.0 - smoothstep(0.2, 0.45, dz * k3 / WP));
    float nn = 0.5 * sin(TAU * (k1 * z / WP + h2.x)) + 0.32 * c2 * sin(TAU * (k2 * z / WP + h2.y)) + 0.18 * c3 * sin(TAU * (k3 * z / WP + h2.z));
    float tt = clamp((nn + (bright ? 0.12 : 0.35)) / 0.8, 0.0, 1.0);
    float along = mix(bright ? 0.5 : 0.68, tt * tt * (3.0 - 2.0 * tt), c1);
    float sub = sqrt(min(1.0, wpx / hair));
    float w = passW(sig) * depthW(vz, zr) * (bright ? 1.0 : 1.0 - smoothstep(5.0, 12.0, sig));
    float delta = min(uSt3.x + uSt3.y * coc, 0.3 * extMax);
    float sigE = max(min(sig, (extMax - delta - 1.0) / EXT_SIG), 0.3);
    float I = (bright ? uSt2.z : uSt2.w) * along * sub * w * (body / sig) * (bright ? env : 0.5 + 0.5 * env) * (1.0 + rim);

    float cs = smoothstep(2.0, 10.0, coc);
    vec3 core = uCoreE;
    vec3 halo;
    if (bright) {
        float hj = hk.w - 0.5;
        halo = uBaseE * vec3(1.0, 1.0 + 0.9 * hj, 1.0 + 1.2 * hj);
        if (h2.w < uSt3.z * 2.0 * cs) { halo = uAccE; core = mix(uCoreE, uAccE, 0.7); }
        else if (h2.w < (uSt3.z + uSt3.w) * 2.0 * cs) { halo = uVioE; core = mix(uCoreE, uVioE, 0.7); }
        halo = mix(halo, uCoreE * 0.6, smoothstep(0.6, 1.6, env) * 0.6);
    } else {
        halo = uMidE;
        core = uMidE * 0.6;
    }
    halo = mix(halo, core * 0.6, min(rim, 1.0) * 0.35);
    delta *= dot(n, s0 - Q.xy) < 0.0 ? -1.0 : 1.0;
    float ext = w > 1e-4 ? EXT_SIG * sigE + abs(delta) + 0.5 / uProj.w : 0.0;
    gl_Position = toClip(s0 + n * side * ext);
    vA = vec4(side * ext, gExp(min(sc, sigE)), gExp(sigE), delta);
    vCore = I * core * (hair / sc) * 0.6;
    vHalo = I * halo;
}
`

const RIBBON_FS =
    HEAD +
    `
in vec4 vA;
in vec3 vCore;
in vec3 vHalo;
uniform float uOut;
out vec4 o;
void main() {
    vec3 d = vec3(vA.x - vA.w, vA.x, vA.x + vA.w);
    d *= d;
    vec3 E = vCore * exp2(d * vA.y) + vHalo * exp2(d * vA.z);
    o = vec4(clamp(E, vec3(0.0), vec3(64.0)) * uOut, 0.0);
}
`

const GLINT_BAKE_VS =
    HEAD +
    TUBE_GLSL +
    `
uniform vec4 uGl;
uniform vec4 uGl2;
uniform vec4 uGl4;
out vec4 oP;
out vec4 oQ;
out vec4 oR;
const int SEG = ${GLINT_SEG};
void main() {
    int gid = gl_VertexID / (SEG + 1);
    int smp = gl_VertexID - gid * (SEG + 1);
    int NS = int(uGl.y);
    int sid = gid / NS;
    int slot = gid - sid * NS;
    uint sd = uint(uSeedB.x) * 0x9E3779B1u;
    vec4 h = h4(uint(sid) * 0x27d4eb2du + sd);
    float th0 = TAU * (float(sid) + 0.8 * (h.x - 0.5)) / uGl.x;
    float rho = 0.94 + 0.12 * h.y;
    vec4 hl = h4(uint(gid) * 0x7a3c5b1du + sd);
    float P = uGl.w;
    float cell = uGl.z;
    float m = (float(slot) + hl.x) * cell - uGl2.x;
    float cyc = floor(m / P);
    float mw = m - cyc * P;
    uint cu = uint(int(cyc) - int(uGl2.y) + 4096) & 1023u;
    vec4 hs = h4(uint(gid) * 0x165667b1u + cu * 0x61c88647u + sd);
    vec4 hs2 = h4(hu(uint(gid) ^ 0x5bd1e995u) + cu * 0x2545f491u + sd);
    float zc = uDepth.x + mw;
    float fade = smoothstep(0.0, 0.6, P - mw);
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 1.0;
    if (hs.x > uGl2.z || fade < 0.01) {
        oP = vec4(0.0);
        oQ = vec4(0.0);
        oR = vec4(0.0);
        return;
    }
    float wq = hs.w;
    float kz = uTube.y * sOf(uCamF.w + zc);
    float spread = sqrt(1.0 + kz * kz) / sqrt(1.0 + uTube.y * uTube.y);
    float len = cell * (0.1 + 0.45 * hs.y * hs.y) * (1.0 + 2.0 * wq * wq) * uGl4.z * (0.6 + 0.6 * spread);
    float zr = zc + (float(smp) / float(SEG) - 0.5) * len;
    float z = uCamF.w + zr;
    vec3 v = toView(tubeAt(th0, rho, z));
    if (v.z < ZCLIP) {
        float zo = zc + 0.5 * len;
        vec3 vo = toView(tubeAt(th0, rho, uCamF.w + zo));
        if (vo.z >= ZCLIP) {
            zr = mix(zr, zo, clamp((ZCLIP - v.z) / max(vo.z - v.z, 1e-6), 0.0, 1.0));
            z = uCamF.w + zr;
            v = toView(tubeAt(th0, rho, z));
        }
    }
    float fl = 1.0 - uGl4.y + uGl4.y * (0.5 + 0.5 * sin(TAU * (uSeedB.z * (0.15 + 0.5 * hs2.x) + hs2.y)));
    float gain = uGl2.w * fade * fl * (0.25 + 0.75 * hs.z * hs.z) * (0.4 + 0.6 * bundleAt(th0, z));
    oP = vec4(toScreen(v), v.z, max(gain, 1e-6));
    oQ = vec4(toScreen(toView(vec3(centreAt(z), z))), wq, hs2.z);
    oR = vec4(hs2.w, zr, 0.0, 0.0);
}
`

const GLINT_VS =
    HEAD +
    TUBE_GLSL +
    BK_GLSL +
    `
uniform vec4 uGl3;
uniform vec4 uGl4;
uniform vec3 uCoreE;
uniform vec3 uBaseE;
uniform vec3 uAccE;
uniform vec3 uVioE;
out vec4 vA;
out vec3 vCore;
out vec3 vHalo;
const int SEG = ${GLINT_SEG};
void main() {
    int per = 2 * SEG + 4;
    int gid = gl_VertexID / per;
    int k = clamp(gl_VertexID - gid * per - 1, 0, 2 * SEG + 1);
    int smp = k >> 1;
    float side = (k & 1) == 0 ? -1.0 : 1.0;
    int base = gid * (SEG + 1);
    vec4 P = bk((base + smp) * 3);
    if (P.w <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    vec4 Q = bk((base + smp) * 3 + 1);
    vec4 R = bk((base + smp) * 3 + 2);
    vec4 Pp = bk((base + max(smp - 1, 0)) * 3);
    vec4 Pn = bk((base + min(smp + 1, SEG)) * 3);
    vec2 ch = bk((base + SEG) * 3).xy - bk(base * 3).xy;
    float rim = 1.3 * ptrGlow(P.xy);
    vec2 s0 = P.xy;
    float vz = P.z;
    float extMax;
    float pxLen;
    vec2 t = frameAt(Pp.xy, s0, Pn.xy, smp > 0 && Pp.z >= ZCLIP, smp < SEG && Pn.z >= ZCLIP, extMax, pxLen);
    t = t * max(pxLen, 1e-4) + ch * (0.3 / float(SEG)) + vec2(1e-5, 0.0);
    t /= length(t);
    vec2 n = vec2(-t.y, t.x);
    float tau = float(smp) / float(SEG);
    float a = sin(PI * tau);
    a *= a;
    float wq = Q.z;
    float coc = cocAt(vz);
    float hair = uDofP.z;
    float wpx = uGl4.x * pow(10.0, wq) * uProj.x / max(vz, 0.02);
    float body = max(hair, wpx) * (0.35 + 0.65 * sqrt(a));
    float sig = sqrt(body * body + coc * coc);
    float sc = sqrt(hair * hair + coc * coc);
    float w = passW(sig) * depthW(vz, R.y);
    float delta = min(uGl3.x + uGl3.y * coc, 0.3 * extMax);
    float sigE = max(min(sig, (extMax - delta - 1.0) / EXT_SIG), 0.3);
    float I = P.w * w * a * (body / sig) * sqrt(min(1.0, wpx / hair)) * (1.0 + rim);

    float cs = smoothstep(2.0, 10.0, coc);
    float hj = R.x - 0.5;
    vec3 halo = uBaseE * vec3(1.0, 1.0 + 0.9 * hj, 1.0 + 1.2 * hj);
    vec3 core = uCoreE;
    float slim = 1.0 - smoothstep(0.35, 0.6, wq);
    if (Q.w < uGl3.z * 2.0 * cs * slim) { halo = uAccE; core = mix(uCoreE, uAccE, 0.7); }
    else if (Q.w < (uGl3.z + uGl3.w) * 2.0 * cs * slim) { halo = uVioE; core = mix(uCoreE, uVioE, 0.7); }
    halo = mix(halo, core * 0.6, smoothstep(0.5, 0.85, wq));
    delta *= dot(n, s0 - Q.xy) < 0.0 ? -1.0 : 1.0;
    float ext = w > 1e-4 ? EXT_SIG * sigE + abs(delta) + 0.5 / uProj.w : 0.0;
    gl_Position = toClip(s0 + n * side * ext);
    vA = vec4(side * ext, gExp(min(sc, sigE)), gExp(sigE), delta);
    vCore = I * core * (hair / sc) * 0.6 * sqrt(a);
    vHalo = I * halo;
}
`

const DUST_VS =
    HEAD +
    TUBE_GLSL +
    `
uniform vec4 uDu;
uniform vec4 uDu2;
uniform vec3 uVel;
uniform vec3 uDustE;
out vec3 vC;
out vec4 vQ;
void main() {
    int id = gl_VertexID / 6;
    int c = gl_VertexID - id * 6;
    float al = (c == 1 || c == 4 || c == 5) ? 1.0 : 0.0;
    float side = (c == 2 || c == 3 || c == 5) ? 1.0 : -1.0;
    uint sd = uint(uSeedB.x) * 0x297a2d39u;
    vec4 h = h4(uint(id) * 0x2c1b3c6du + sd);
    float P = uDu.x;
    float m = h.y * P - uDu.y;
    float cyc = floor(m / P);
    float mw = m - cyc * P;
    uint cu = uint(int(cyc) - int(uDu.z) + 4096) & 1023u;
    vec4 h2 = h4(hu(uint(id) ^ 0x51ed270bu) + cu * 0x2545f491u + sd);
    float zr = uDepth.x + mw;
    float z = uCamF.w + zr;
    float th = TAU * h2.x;
    float rho = h2.y < 0.9 ? 0.9 + 0.2 * h2.z : 0.85 * sqrt(h2.z);
    float kz = uTube.y * sOf(z);
    float r = uTube.x * sqrt(1.0 + kz * kz) * rho;
    vec3 v = toView(vec3(centreAt(z) + r * vec2(cos(th), sin(th)), z));
    vec2 s0 = toScreen(v);
    vec2 sp = toScreen(v + uVel);
    vec2 dv = s0 - sp;
    float len = length(dv);
    vec2 dir = len > 1e-4 ? dv / len : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    float coc = min(cocAt(v.z) * 0.6, 10.0);
    float rad = sqrt(uDu2.x * uDu2.x + coc * coc);
    float tw = max(0.0, 0.55 + 0.45 * sin(TAU * (uSeedB.z * (0.3 + 1.4 * h2.w) + h.w)));
    float fade = smoothstep(0.0, 0.8, P - mw) * smoothstep(0.03, 0.1, v.z) * exp(-zr / 1.1);
    float b = uDu.w * tw * fade * (0.25 + 0.75 * h.z) * (uDu2.x / rad) * (uDu2.x / rad) * rad / (rad + 0.35 * len) * (h2.y < 0.9 ? 1.0 : 0.5);
    float e = 2.5 * rad;
    vec2 pos = mix(sp, s0, al) + dir * (al * 2.0 - 1.0) * e + nrm * side * e;
    gl_Position = b < 0.003 ? vec4(2.0, 2.0, 2.0, 1.0) : toClip(pos);
    vQ = vec4(al * len + (al * 2.0 - 1.0) * e, side * e, len, rad);
    vC = uDustE * b * (1.0 + ptrGlow(s0));
}
`

const DUST_FS =
    HEAD +
    `
in vec3 vC;
in vec4 vQ;
uniform float uOut;
out vec4 o;
void main() {
    float t = clamp(vQ.x, 0.0, vQ.z);
    vec2 d = vec2(vQ.x - t, vQ.y);
    o = vec4(vC * exp(-0.5 * dot(d, d) / (vQ.w * vQ.w)) * uOut, 0.0);
}
`

const QUAD_VS =
    HEAD +
    `
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const DOWN_FS =
    HEAD +
    `
uniform sampler2D uSrc;
uniform sampler2D uSoft;
uniform vec2 uSrcPx;
uniform vec2 uDstRes;
uniform float uSoftK;
out vec4 o;
void main() {
    vec2 uv = gl_FragCoord.xy / uDstRes;
    vec2 d = uSrcPx;
    vec4 c = 0.25 * (texture(uSrc, uv + vec2(-d.x, -d.y)) + texture(uSrc, uv + vec2(d.x, -d.y)) +
                texture(uSrc, uv + vec2(-d.x, d.y)) + texture(uSrc, uv + d));
    if (uSoftK > 0.0) c += uSoftK * texture(uSoft, uv);
    o = (any(isnan(c)) || any(isinf(c))) ? vec4(0.0) : min(c, vec4(64.0));
}
`

const BLUR_FS =
    HEAD +
    `
uniform sampler2D uSrc;
uniform vec2 uStep;
uniform vec2 uDstRes;
out vec4 o;
void main() {
    vec2 uv = gl_FragCoord.xy / uDstRes;
    vec4 acc = texture(uSrc, uv) * 0.16;
    float w[5] = float[5](0.1478, 0.1078, 0.0688, 0.0384, 0.0187);
    for (int i = 0; i < 5; i++) {
        vec2 off = uStep * float(i + 1);
        acc += (texture(uSrc, uv + off) + texture(uSrc, uv - off)) * w[i];
    }
    o = acc / (0.16 + 2.0 * 0.3815);
}
`

const COMP_FS =
    HEAD +
    `
uniform sampler2D uScene;
uniform sampler2D uSoft;
uniform sampler2D uBloomA;
uniform sampler2D uBloomB;
uniform vec2 uBuf;
uniform vec4 uLook;
uniform vec4 uBg;
uniform vec4 uFx;
uniform vec4 uHaze;
uniform vec3 uHazeE;
uniform vec3 uDustE;
uniform vec4 uRot0;
uniform vec4 uRot1;
uniform vec4 uRot2;
uniform vec4 uProjC;
uniform vec2 uRoll;
uniform float uSeed;
out vec4 o;
uint hu(uint x) { x ^= x >> 16; x *= 0x7feb352du; x ^= x >> 15; x *= 0x846ca68bu; x ^= x >> 16; return x; }
vec4 h4(uint x) {
    uint a = hu(x); uint b = hu(a ^ 0x9e3779b9u); uint c = hu(b ^ 0x85ebca6bu); uint d = hu(c ^ 0xc2b2ae35u);
    return vec4(float(a >> 8u), float(b >> 8u), float(c >> 8u), float(d >> 8u)) * (1.0 / 16777216.0);
}
void main() {
    float pxc = uLook.w;
    vec2 css = vec2(gl_FragCoord.x, uBuf.y - gl_FragCoord.y) / pxc;
    vec2 uv = gl_FragCoord.xy / uBuf;
    vec3 E = ((texture(uScene, uv).rgb + texture(uSoft, uv).rgb) * (1.0 - uLook.y) + uLook.y * (0.5 * texture(uBloomA, uv).rgb + 0.5 * texture(uBloomB, uv).rgb)) * uLook.z;
    float r = length(css - uHaze.xy);
    float R = max(uHaze.z, 1.0);
    E += uHazeE * uHaze.w * (0.6 * exp(-0.5 * r * r / (R * R)) + 0.3 * exp(-r / (2.4 * R)));
    vec3 lit = 1.0 - exp(-max(E, vec3(0.0)) * uLook.x);

    vec2 d = css - uProjC.yz;
    vec2 q = vec2(d.x * uRoll.x + d.y * uRoll.y, -d.x * uRoll.y + d.y * uRoll.x);
    vec3 vv = vec3(q.x / uProjC.x, -q.y / uProjC.x, 1.0);
    vec3 dir = vv.x * uRot0.xyz + vv.y * uRot1.xyz + vv.z * uRot2.xyz;
    vec2 ang = dir.xy / max(dir.z, 0.2) * uProjC.x;
    vec2 cell = floor(ang / 14.0);
    uint hk = hu(uint(int(cell.x) + 65536) * 0x8da6b343u + uint(int(cell.y) + 65536) * 0xd8163841u + uint(uSeed) * 0xcb1ab31fu);
    float star = 0.0;
    if (float(hk >> 8u) * (1.0 / 16777216.0) < uFx.z) {
        vec4 hs = h4(hk);
        vec2 c = (cell + 0.15 + 0.7 * hs.yz) * 14.0;
        vec2 dd = (ang - c) * pxc;
        float rad = 0.35 * pxc + 0.2;
        float tw = 0.8 + 0.2 * sin(uFx.w * (0.4 + hs.w) * 2.0 + hs.y * 40.0);
        star = (0.08 + 0.55 * hs.w * hs.w * hs.w) * tw * exp(-dot(dd, dd) / (2.0 * rad * rad));
    }
    lit = 1.0 - (1.0 - lit) * (1.0 - star * uDustE / max(max(uDustE.r, uDustE.g), max(uDustE.b, 1e-3)));

    float la = max(max(lit.r, lit.g), lit.b);
    vec3 rgb = lit + uBg.rgb * uBg.a * (1.0 - lit);
    float al = uBg.a + la * (1.0 - uBg.a);
    float vd = length(uv - 0.5) * 1.4142;
    rgb *= 1.0 - uFx.y * smoothstep(0.35, 1.0, vd);
    float hg = float(hu(uint(gl_FragCoord.x) * 0x9e3779b1u + uint(gl_FragCoord.y) * 0x85ebca77u + uint(uFx.w * 24.0) * 0xc2b2ae3du) >> 8u) * (1.0 / 16777216.0);
    rgb += (hg - 0.5) * uFx.x * al;
    o = vec4(clamp(rgb, 0.0, al), al);
}
`

function compile(gl: WebGL2RenderingContext, vs: string, fs: string, varyings?: string[]): WebGLProgram {
    const sh = (type: number, src: string) => {
        const s = gl.createShader(type)
        if (!s) throw new Error("createShader failed")
        gl.shaderSource(s, src)
        gl.compileShader(s)
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
            const log = gl.getShaderInfoLog(s) || "shader compile failed"
            gl.deleteShader(s)
            throw new Error(log)
        }
        return s
    }
    const p = gl.createProgram()
    if (!p) throw new Error("createProgram failed")
    const v = sh(gl.VERTEX_SHADER, vs)
    const f = sh(gl.FRAGMENT_SHADER, fs)
    gl.attachShader(p, v)
    gl.attachShader(p, f)
    gl.bindAttribLocation(p, 0, "aPos")
    if (varyings) gl.transformFeedbackVaryings(p, varyings, gl.INTERLEAVED_ATTRIBS)
    gl.linkProgram(p)
    gl.deleteShader(v)
    gl.deleteShader(f)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) {
        throw new Error(gl.getProgramInfoLog(p) || "link failed")
    }
    return p
}

class Uniforms {
    private loc = new Map<string, WebGLUniformLocation | null>()
    private last = new Map<string, Float64Array>()
    constructor(
        private gl: WebGL2RenderingContext,
        private prog: WebGLProgram
    ) {}
    private get(name: string) {
        let l = this.loc.get(name)
        if (l === undefined) {
            l = this.gl.getUniformLocation(this.prog, name)
            this.loc.set(name, l)
        }
        return l
    }
    private changed(name: string, a: number, b = 0, c = 0, d = 0) {
        let v = this.last.get(name)
        if (!v) {
            v = new Float64Array([NaN, NaN, NaN, NaN])
            this.last.set(name, v)
        }
        if (v[0] === a && v[1] === b && v[2] === c && v[3] === d) return false
        v[0] = a
        v[1] = b
        v[2] = c
        v[3] = d
        return true
    }
    f1(n: string, a: number) {
        if (this.changed(n, a)) this.gl.uniform1f(this.get(n), a)
    }
    f2(n: string, a: number, b: number) {
        if (this.changed(n, a, b)) this.gl.uniform2f(this.get(n), a, b)
    }
    f3(n: string, a: number, b: number, c: number) {
        if (this.changed(n, a, b, c)) this.gl.uniform3f(this.get(n), a, b, c)
    }
    f4(n: string, a: number, b: number, c: number, d: number) {
        if (this.changed(n, a, b, c, d)) this.gl.uniform4f(this.get(n), a, b, c, d)
    }
    i1(n: string, a: number) {
        if (this.changed(n, a, -1)) this.gl.uniform1i(this.get(n), a)
    }
}

interface Baked {
    buf: WebGLBuffer
    tex: WebGLTexture
    rows: number
}

interface Target {
    tex: WebGLTexture
    fbo: WebGLFramebuffer
    w: number
    h: number
}

interface Camera {
    r: Float64Array
    px: number
    py: number
    pz: number
    f: number
    cx: number
    cy: number
    cr: number
    sr: number
}

function viewOf(cam: Camera, x: number, y: number, z: number, out: Float64Array) {
    const dx = x - cam.px
    const dy = y - cam.py
    const dz = z - cam.pz
    const r = cam.r
    out[0] = r[0] * dx + r[1] * dy + r[2] * dz
    out[1] = r[3] * dx + r[4] * dy + r[5] * dz
    out[2] = r[6] * dx + r[7] * dy + r[8] * dz
}
function screenOf(cam: Camera, v: Float64Array, out: Float64Array) {
    const k = cam.f / Math.max(v[2], 0.02)
    const qx = v[0] * k
    const qy = -v[1] * k
    out[0] = cam.cx + qx * cam.cr - qy * cam.sr
    out[1] = cam.cy + qx * cam.sr + qy * cam.cr
}

function __OriginkitBase_CopperCorridor(props: CopperCorridorProps) {
    props = withMovedControls(props)
    const {
        background = DEFAULTS.background,
        baseColor = DEFAULTS.baseColor,
        accentColor = DEFAULTS.accentColor,
        density = DEFAULTS.density,
        pinch = DEFAULTS.pinch,
        fringe = DEFAULTS.fringe,
        surge = DEFAULTS.surge,
        speed = DEFAULTS.speed,
        style,
    } = props
    void [baseColor, accentColor, density, pinch, fringe, surge, speed]
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const propsRef = useRef(props)
    propsRef.current = props
    const wakeRef = useRef<() => void>(() => {})
    const [gpu, setGpu] = useState(false)

    useEffect(() => {
        wakeRef.current()
    })

    useEffect(() => {
        const rootEl = rootRef.current
        const canvasEl = canvasRef.current
        if (!rootEl || !canvasEl) return
        const root: HTMLDivElement = rootEl
        const canvas: HTMLCanvasElement = canvasEl
        const mq = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null
        let reduced = !!(mq && mq.matches)
        const onMq = () => {
            reduced = !!(mq && mq.matches)
            wake()
        }
        mq?.addEventListener?.("change", onMq)

        let gl: WebGL2RenderingContext | null = null
        let strandProg: WebGLProgram | null = null
        let glintProg: WebGLProgram | null = null
        let sBakeProg: WebGLProgram | null = null
        let gBakeProg: WebGLProgram | null = null
        let dustProg: WebGLProgram | null = null
        let downProg: WebGLProgram | null = null
        let blurProg: WebGLProgram | null = null
        let compProg: WebGLProgram | null = null
        let uStrand: Uniforms | null = null
        let uGlint: Uniforms | null = null
        let uSBake: Uniforms | null = null
        let uGBake: Uniforms | null = null
        let tfo: WebGLTransformFeedback | null = null
        let sBk: Baked | null = null
        let gBk: Baked | null = null
        let uDust: Uniforms | null = null
        let uDown: Uniforms | null = null
        let uBlur: Uniforms | null = null
        let uComp: Uniforms | null = null
        let quadVao: WebGLVertexArrayObject | null = null
        let emptyVao: WebGLVertexArrayObject | null = null
        let zTex: WebGLTexture | null = null
        const zTab = new Float32Array(TAB_W)
        let scene: Target | null = null
        let soft: Target | null = null
        const q4: (Target | null)[] = [null, null]
        const q8: (Target | null)[] = [null, null]
        let floatOK = false
        let lost = false
        let timerExt: { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number } | null = null
        const queries: { q: WebGLQuery; level: number }[] = []

        let packedOK = true
        const makeTarget = (w: number, h: number, float: boolean): Target | null => {
            if (!gl) return null
            const tex = gl.createTexture()
            const fbo = gl.createFramebuffer()
            if (!tex || !fbo) return null
            gl.bindTexture(gl.TEXTURE_2D, tex)
            if (float && packedOK) gl.texImage2D(gl.TEXTURE_2D, 0, gl.R11F_G11F_B10F, w, h, 0, gl.RGB, gl.HALF_FLOAT, null)
            else gl.texImage2D(gl.TEXTURE_2D, 0, float ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
            const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            if (!ok) {
                gl.deleteTexture(tex)
                gl.deleteFramebuffer(fbo)
                if (float && packedOK) {
                    packedOK = false
                    return makeTarget(w, h, float)
                }
                return null
            }
            return { tex, fbo, w, h }
        }
        const dropTarget = (t: Target | null) => {
            if (!t || !gl) return
            gl.deleteTexture(t.tex)
            gl.deleteFramebuffer(t.fbo)
        }
        const ensureBaked = (b: Baked | null, texels: number): Baked | null => {
            if (!gl) return null
            const rows = Math.max(1, Math.ceil(texels / BK_W))
            if (b && b.rows >= rows) return b
            if (b) {
                gl.deleteBuffer(b.buf)
                gl.deleteTexture(b.tex)
            }
            const cap = Math.ceil(rows * 1.25)
            const buf = gl.createBuffer()
            const tex = gl.createTexture()
            if (!buf || !tex) return null
            gl.bindBuffer(gl.ARRAY_BUFFER, buf)
            gl.bufferData(gl.ARRAY_BUFFER, cap * BK_W * 16, gl.DYNAMIC_COPY)
            gl.bindBuffer(gl.ARRAY_BUFFER, null)
            gl.activeTexture(gl.TEXTURE6)
            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, BK_W, cap, 0, gl.RGBA, gl.FLOAT, null)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            return { buf, tex, rows: cap }
        }
        const bake = (prog: WebGLProgram, count: number, b: Baked, perVertex: number) => {
            if (!gl || !tfo || count <= 0) return
            gl.useProgram(prog)
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tfo)
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, b.buf)
            gl.enable(gl.RASTERIZER_DISCARD)
            gl.beginTransformFeedback(gl.POINTS)
            gl.drawArrays(gl.POINTS, 0, count)
            gl.endTransformFeedback()
            gl.disable(gl.RASTERIZER_DISCARD)
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
            gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, b.buf)
            gl.activeTexture(gl.TEXTURE6)
            gl.bindTexture(gl.TEXTURE_2D, b.tex)
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, BK_W, Math.ceil((count * perVertex) / BK_W), gl.RGBA, gl.FLOAT, 0)
            gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)
        }

        const initGL = (): boolean => {
            gl = canvas.getContext("webgl2", {
                alpha: true,
                antialias: false,
                depth: false,
                stencil: false,
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
                powerPreference: "low-power",
            })
            if (!gl) return false
            try {
                strandProg = compile(gl, STRAND_VS, RIBBON_FS)
                glintProg = compile(gl, GLINT_VS, RIBBON_FS)
                sBakeProg = compile(gl, STRAND_BAKE_VS, BAKE_FS, ["oP", "oQ"])
                gBakeProg = compile(gl, GLINT_BAKE_VS, BAKE_FS, ["oP", "oQ", "oR"])
                dustProg = compile(gl, DUST_VS, DUST_FS)
                downProg = compile(gl, QUAD_VS, DOWN_FS)
                blurProg = compile(gl, QUAD_VS, BLUR_FS)
                compProg = compile(gl, QUAD_VS, COMP_FS)
            } catch (e) {
                if (!gl.isContextLost()) console.error("CopperCorridor:", e)
                gl = null
                return false
            }
            uStrand = new Uniforms(gl, strandProg)
            uGlint = new Uniforms(gl, glintProg)
            uSBake = new Uniforms(gl, sBakeProg)
            uGBake = new Uniforms(gl, gBakeProg)
            tfo = gl.createTransformFeedback()
            sBk = gBk = null
            uDust = new Uniforms(gl, dustProg)
            uDown = new Uniforms(gl, downProg)
            uBlur = new Uniforms(gl, blurProg)
            uComp = new Uniforms(gl, compProg)
            floatOK = !!gl.getExtension("EXT_color_buffer_float") || !!gl.getExtension("EXT_color_buffer_half_float")
            gl.getExtension("OES_texture_float_linear")
            timerExt = gl.getExtension("EXT_disjoint_timer_query_webgl2") as typeof timerExt
            const quad = gl.createBuffer()
            quadVao = gl.createVertexArray()
            gl.bindVertexArray(quadVao)
            gl.bindBuffer(gl.ARRAY_BUFFER, quad)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
            gl.enableVertexAttribArray(0)
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
            emptyVao = gl.createVertexArray()
            gl.bindVertexArray(null)
            zTex = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, zTex)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, TAB_W, 1, 0, gl.RED, gl.FLOAT, null)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            packedOK = true
            scene = soft = null
            q4[0] = q4[1] = q8[0] = q8[1] = null
            queries.length = 0
            return true
        }

        let W = 0
        let H = 0
        let shown = 1
        let quality = 0
        let bufW = 0
        let bufH = 0
        let pxPerCss = 1
        const measureShown = (): boolean => {
            if (W <= 0) return false
            const r = root.getBoundingClientRect()
            const s = Math.min(2, Math.max(1, r.width / W))
            if (Math.abs(s - shown) / shown > 0.05) {
                shown = s
                return true
            }
            return false
        }
        let resizePending = true
        const applyResize = () => {
            resizePending = false
            if (!gl || W <= 0 || H <= 0) return
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            let k = dpr * shown * QUALITY_LEVELS[quality]
            const px = W * H * k * k
            if (px > MAX_PIXELS) k *= Math.sqrt(MAX_PIXELS / px)
            const bw = Math.max(1, Math.round(W * k))
            const bh = Math.max(1, Math.round(H * k))
            pxPerCss = bw / W
            if (bw === bufW && bh === bufH && scene) return
            bufW = bw
            bufH = bh
            canvas.width = bw
            canvas.height = bh
            for (const t of [scene, soft, q4[0], q4[1], q8[0], q8[1]]) dropTarget(t)
            scene = makeTarget(bw, bh, floatOK)
            if (!scene && floatOK) {
                floatOK = false
                scene = makeTarget(bw, bh, false)
            }
            soft = makeTarget(Math.max(1, Math.ceil(bw / 2)), Math.max(1, Math.ceil(bh / 2)), floatOK)
            const w4 = Math.max(1, Math.ceil(bw / 4))
            const h4 = Math.max(1, Math.ceil(bh / 4))
            const w8 = Math.max(1, Math.ceil(bw / 8))
            const h8 = Math.max(1, Math.ceil(bh / 8))
            q4[0] = makeTarget(w4, h4, floatOK)
            q4[1] = makeTarget(w4, h4, floatOK)
            q8[0] = makeTarget(w8, h8, floatOK)
            q8[1] = makeTarget(w8, h8, floatOK)
        }

        let ptrClientX = 0
        let ptrClientY = 0
        let ptrMoved = false
        let ptrInside = false
        let ptrU = 0.5
        let ptrV = 0.5
        let held = false
        const onMove = (e: PointerEvent) => {
            if (e.clientX === ptrClientX && e.clientY === ptrClientY && ptrInside) return
            ptrClientX = e.clientX
            ptrClientY = e.clientY
            ptrMoved = true
            ptrInside = true
            wake()
        }
        const onLeave = () => {
            ptrInside = false
            held = false
            wake()
        }
        const onDown = (e: PointerEvent) => {
            ptrClientX = e.clientX
            ptrClientY = e.clientY
            ptrMoved = true
            ptrInside = true
            if (e.button === 0 || e.pointerType !== "mouse") held = true
            wake()
        }
        const onUp = (e: PointerEvent) => {
            held = false
            if (e.pointerType !== "mouse") ptrInside = false
            wake()
        }
        const onWinUp = () => {
            if (held) {
                held = false
                wake()
            }
        }
        const onScroll = () => {
            if (ptrInside) {
                ptrMoved = true
                wake()
            }
        }
        root.addEventListener("pointermove", onMove)
        root.addEventListener("pointerenter", onMove)
        root.addEventListener("pointerleave", onLeave)
        root.addEventListener("pointerdown", onDown)
        root.addEventListener("pointerup", onUp)
        root.addEventListener("pointercancel", onLeave)
        window.addEventListener("pointerup", onWinUp)
        window.addEventListener("scroll", onScroll, { passive: true, capture: true })

        const cam: Camera = { r: new Float64Array(9), px: 0, py: 0, pz: 0, f: 1, cx: 0, cy: 0, cr: 1, sr: 0 }
        const tv = new Float64Array(3)
        const ts = new Float64Array(2)
        const st = { a: 0, b: 0, va: 0, vb: 0, ta: 0, tb: 0, sa: 0, sb: 0, vsa: 0, vsb: 0 }
        let travel = START_Z
        let glintPhase = 0
        let clock = 0
        let surgeK = 0
        let fov = 74
        let hoverK = 0
        let spotX = 0
        let spotY = 0
        let hoverMoving = false

        const buildCamera = (p: CopperCorridorProps, adv: Advanced) => {
            const pl = { ...DEFAULT_PLACEMENT, ...p.placement }
            const S = Math.min(H, W / REF_ASPECT)
            cam.f = S / 2 / Math.tan((fov * Math.PI) / 360)
            cam.cx = W / 2 + (num(pl.x, 0, -50, 50) / 100) * W
            cam.cy = H / 2 + (num(pl.y, 0, -50, 50) / 100) * H
            const ang = (num(pl.angle, 0, -180, 180) * Math.PI) / 180
            cam.cr = Math.cos(ang)
            cam.sr = Math.sin(ang)
            const tilt = (num(pl.tilt, 0, -60, 60) * Math.PI) / 180
            const wind = num(adv.wind, DEFAULT_ADVANCED.wind, 0, 300) / 100
            const zc = ((travel % WORLD_PERIOD) + WORLD_PERIOD) % WORLD_PERIOD
            const ax = axisX(zc, wind)
            const ay = axisY(zc, wind)
            let fx = axisX(zc + 0.6, wind) - ax
            let fy = axisY(zc + 0.6, wind) - ay
            let fz = 0.6
            let l = Math.hypot(fx, fy, fz)
            fx /= l
            fy /= l
            fz /= l
            let rx = fz
            let rz = -fx
            l = Math.hypot(rx, rz)
            rx /= l
            rz /= l
            const u0x = fy * rz
            const u0y = fz * rx - fx * rz
            const u0z = fx * 0 - fy * rx
            const ct = Math.cos(tilt)
            const stt = Math.sin(tilt)
            const pa = st.a
            const pb = -Math.tan(tilt) + st.b
            l = Math.hypot(pa, pb, 1)
            const qx = pa / l
            const qy = pb / l
            const qz = 1 / l
            const dx = qx
            const dy = ct * qy + stt * qz
            const dz = -stt * qy + ct * qz
            let mrx = dz
            let mrz = -dx
            l = Math.hypot(mrx, mrz) || 1
            mrx /= l
            mrz /= l
            const mry = 0
            let mux = dy * mrz - dz * mry
            let muy = dz * mrx - dx * mrz
            let muz = dx * mry - dy * mrx
            const bank = -0.22 * st.sa
            const cb = Math.cos(bank)
            const sb = Math.sin(bank)
            const r2x = mrx * cb + mux * sb
            const r2y = mry * cb + muy * sb
            const r2z = mrz * cb + muz * sb
            mux = -mrx * sb + mux * cb
            muy = -mry * sb + muy * cb
            muz = -mrz * sb + muz * cb
            const R = cam.r
            const c0 = [r2x, r2y, r2z]
            const c1 = [mux, muy, muz]
            const c2 = [dx, dy, dz]
            for (let i = 0; i < 3; i++) {
                R[i * 3 + 0] = c0[i] * rx + c1[i] * u0x + c2[i] * fx
                R[i * 3 + 1] = c0[i] * 0 + c1[i] * u0y + c2[i] * fy
                R[i * 3 + 2] = c0[i] * rz + c1[i] * u0z + c2[i] * fz
            }
            for (let j = 0; j < 3; j++) {
                const a1 = R[3 + j]
                const a2 = R[6 + j]
                R[3 + j] = ct * a1 - stt * a2
                R[6 + j] = stt * a1 + ct * a2
            }
            const Rw = waistRadius(num(p.pinch, DEFAULTS.pinch, 0, 100))
            const par = -0.55 * Math.min(Rw, 0.3)
            cam.px = ax + par * (st.sa * rx + st.sb * u0x)
            cam.py = ay + par * (st.sb * u0y)
            cam.pz = zc + par * (st.sa * rz + st.sb * u0z)
        }

        let raf = 0
        let running = false
        let visible = true
        let lastTick = -1
        let lastDraw = -1
        let dirty = true
        let lastProps: CopperCorridorProps | null = null
        let lateEma = 1
        let gpuEma = 0
        let goodFor = 0
        let slowFor = 0
        let banUntil = 0
        let downBan = 0
        let probeUntil = 0
        let probeGap = 0
        let probeSum = 0
        let probeN = 0
        let gapEma = 16.7
        let drawn = 0
        let painted = false
        let measuredAt = 0
        let warm = 0
        const gaps = new Float64Array(15)
        let gapN = 0
        let gapI = 0
        const gapSort = new Float64Array(15)
        let cadence = 16.7
        let every = 1

        const pass = (t: Target | null, prog: WebGLProgram) => {
            if (!gl || !t) return
            gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo)
            gl.viewport(0, 0, t.w, t.h)
            gl.useProgram(prog)
            gl.bindVertexArray(quadVao)
            gl.drawArrays(gl.TRIANGLES, 0, 3)
        }

        const draw = () => {
            if (resizePending) applyResize()
            if (!gl || lost || !strandProg || !glintProg || !sBakeProg || !gBakeProg || !dustProg || !downProg || !blurProg || !compProg) return
            if (!uStrand || !uGlint || !uSBake || !uGBake || !uDust || !uDown || !uBlur || !uComp || !scene || !soft) return
            if (W <= 0 || H <= 0) return
            const p = propsRef.current
            const adv: Advanced = { ...DEFAULT_ADVANCED, ...p.advanced }
            const sAmt = num(p.surge, DEFAULTS.surge, 0, 10) / 10
            const sk = surgeK * sAmt
            fov = num(adv.fov, DEFAULT_ADVANCED.fov, 30, 120) + 14 * sk
            buildCamera(p, adv)
            const seed = Math.round(num(adv.seed, DEFAULT_ADVANCED.seed, 0, 99))
            const dens = num(p.density, DEFAULTS.density, 10, 200) / 100
            const nBright = Math.max(8, Math.round(num(adv.strands, DEFAULT_ADVANCED.strands, 8, 400) * dens))
            const nBed = Math.round(num(adv.bedStrands, DEFAULT_ADVANCED.bedStrands, 0, 800) * dens)
            const nAll = nBright + nBed

            let q: WebGLQuery | null = null
            if (timerExt && queries.length < 4) {
                q = gl.createQuery()
                if (q) gl.beginQuery(timerExt.TIME_ELAPSED_EXT, q)
            }

            const outScale = floatOK ? 1 : 0.25
            const fringeK = (num(p.fringe, DEFAULTS.fringe, 0, 100) / 100) * (1 + 0.8 * sk)
            const coreE = asLight(parseColor(adv.coreColor, [0.92, 0.86, 0.73]))
            const baseE = asLight(parseColor(p.baseColor, [1, 0.54, 0.23]))
            const accE = asLight(parseColor(p.accentColor, [0.37, 0.88, 0.88]))
            const vioE = asLight(parseColor(adv.violetColor, [0.54, 0.42, 1]))
            const midE = asLight(parseColor(adv.midColor, [0.55, 0.42, 0.38]))
            const hazeE = asLight(parseColor(adv.hazeColor, [0.43, 0.29, 0.25]))
            const dustE = asLight(parseColor(adv.dustColor, [0.85, 0.82, 0.78]))
            const atCore = (c: RGB, k: number): RGB => {
                const m = (k * coreE[0]) / Math.max(c[0], c[1], c[2], 1e-3)
                return [c[0] * m, c[1] * m, c[2] * m]
            }
            const gBase = atCore(baseE, 0.8)
            const gAcc = atCore(accE, 1)
            const gVio = atCore(vioE, 1)

            const pinchV = num(p.pinch, DEFAULTS.pinch, 0, 100)
            const period = num(adv.breathePeriod, DEFAULT_ADVANCED.breathePeriod, 500, 30000) / 1000
            const ph = (2 * Math.PI * clock) / period
            const Rw = waistRadius(pinchV) * (1 + (num(adv.breathe, DEFAULT_ADVANCED.breathe, 0, 30) / 100) * Math.sin(ph))
            const K = Math.sqrt(Math.max(0, (BULGE_R / Rw) ** 2 - 1))
            const lean = num(adv.lean, DEFAULT_ADVANCED.lean, 0, 200) / 100
            const wind = num(adv.wind, DEFAULT_ADVANCED.wind, 0, 300) / 100
            const zFar = num(adv.depth, DEFAULT_ADVANCED.depth, 3, 12)
            const fog = 0.32 * zFar
            const S = Math.min(H, W / REF_ASPECT)
            const focus = num(adv.focus, DEFAULT_ADVANCED.focus, 10, 400) / 100
            const apF = 0.0042 * S * (num(adv.defocus, DEFAULT_ADVANCED.defocus, 0, 300) / 100)
            const hair = 0.45 * num(adv.streakWidth, DEFAULT_ADVANCED.streakWidth, 1, 20)
            const blurCap = 0.07 * S
            const bundleAmt = 1.6
            const R = cam.r
            const setTube = (u: Uniforms, passNo: number) => {
                u.f4("uTube", Rw, K, lean, wind)
                u.f4("uCamR", R[0], R[1], R[2], cam.px)
                u.f4("uCamU", R[3], R[4], R[5], cam.py)
                u.f4("uCamF", R[6], R[7], R[8], cam.pz)
                u.f4("uProj", cam.f, cam.cx, cam.cy, pxPerCss)
                u.f4("uProj2", cam.cr, cam.sr, W, H)
                u.f4("uDofP", apF, 1 / focus, hair, blurCap)
                u.f4("uDepth", Z_BACK, zFar, 0, fog)
                u.f4("uPass", passNo, SOFT_LO, SOFT_HI, bundleAmt)
                u.f4("uSeedB", seed, Math.round(num(adv.bundles, DEFAULT_ADVANCED.bundles, 0, 8)), clock, 0)
                u.f4("uPtr", spotX, spotY, GLOW_R * S, GLOW_GAIN * hoverK * (num(adv.hover, DEFAULT_ADVANCED.hover, 0, 100) / 50))
            }

            const zc0 = ((travel % WORLD_PERIOD) + WORLD_PERIOD) % WORLD_PERIOD
            const neck = 1 / (Math.PI * Math.max(K, 0.5) * (1 + lean))
            const stepAt = (zr: number) => {
                if (zr < Z_NEAR) return Math.max(1e-4, Math.min(0.03, Z_NEAR - zr))
                const s = Math.abs(Math.sin(Math.PI * (zc0 + zr - 0.5)))
                return Math.min(STEP_LENS * zr + 0.002, 0.3 * neck + 0.13 * s)
            }
            const fill = (z0: number, z1: number, cap: number): number => {
                let n = 0
                for (let z = z0; z < z1 && n < 4096; n++) z += stepAt(z)
                const k = Math.max(1, n / cap)
                let z = z0
                let i = 0
                zTab[0] = z0
                while (z < z1 && i < cap) {
                    z += k * stepAt(z)
                    i++
                    zTab[i] = Math.min(z, z1)
                }
                if (i === 0) {
                    i = 1
                    zTab[1] = z1
                }
                zTab[i] = Math.max(zTab[i], z1)
                return i
            }
            const sinF = Math.sqrt(Math.max(0, 1 - R[8] * R[8]))
            const zBack = -Math.min(-Z_BACK, (BULGE_R * 1.3 * sinF) / Math.max(R[8], 0.3))
            const segFar = fill(Math.min(zBack, Z_NEAR), zFar, CAP_FAR)
            gl.activeTexture(gl.TEXTURE5)
            gl.bindTexture(gl.TEXTURE_2D, zTex)
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, TAB_W, 1, gl.RED, gl.FLOAT, zTab)

            const fibK = num(adv.fibres, DEFAULT_ADVANCED.fibres, 0, 300) / 100
            const brightGain = fibK * 1.1 * Math.pow(120 / nBright, 0.5)
            const bedGain = fibK * 0.5 * Math.pow(160 / Math.max(1, nBed), 0.5) * 1.15
            const worldWidth = 0.0016
            const stretch = (num(adv.streakLength, DEFAULT_ADVANCED.streakLength, 5, 150) / 45) * (1 + 1.6 * sk)
            const cell = 0.75
            const NS = Math.max(1, Math.min(32, Math.ceil(GLINT_RANGE / cell)))
            const flight =
                FLY_RATE * (num(p.speed, DEFAULTS.speed, 0, 100) / 50) + SURGE_RATE * sk + HOVER_RATE * hoverK * (num(adv.hover, DEFAULT_ADVANCED.hover, 0, 100) / 50)
            const gpm = ((glintPhase % GLINT_RANGE) + GLINT_RANGE) % GLINT_RANGE
            const gpc = Math.floor(glintPhase / GLINT_RANGE) % 1024

            const drawStrands = (passNo: number) => {
                if (!gl || !uStrand || !strandProg) return
                gl.useProgram(strandProg)
                setTube(uStrand, passNo)
                const stride = passNo > 0.5 ? 1 : 2
                const seg = Math.ceil(segFar / stride)
                uStrand.f4("uSt", nBright, nAll, seg, stride)
                uStrand.f4("uSt2", segFar + 1, 0, brightGain, bedGain)
                uStrand.i1("uBk", 6)
                uStrand.f4("uSt3", 0.6 * fringeK, 0.45 * fringeK, num(adv.cyanShare, DEFAULT_ADVANCED.cyanShare, 0, 100) / 100, num(adv.violetShare, DEFAULT_ADVANCED.violetShare, 0, 100) / 100)
                uStrand.f4("uSt4", worldWidth, 0, 0, 0)
                uStrand.f3("uCoreE", coreE[0], coreE[1], coreE[2])
                uStrand.f3("uBaseE", gBase[0], gBase[1], gBase[2])
                uStrand.f3("uAccE", gAcc[0], gAcc[1], gAcc[2])
                uStrand.f3("uVioE", gVio[0], gVio[1], gVio[2])
                uStrand.f3("uMidE", midE[0], midE[1], midE[2])
                uStrand.f1("uOut", outScale)
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, nAll * (2 * seg + 4))
            }
            const occ = num(adv.glints, DEFAULT_ADVANCED.glints, 0, 100) / 100
            const drawGlints = (passNo: number) => {
                if (!gl || !uGlint || !glintProg || occ <= 0) return
                gl.useProgram(glintProg)
                setTube(uGlint, passNo)
                uGlint.i1("uBk", 7)
                uGlint.f4("uGl3", 0.6 * fringeK, 0.45 * fringeK, num(adv.cyanShare, DEFAULT_ADVANCED.cyanShare, 0, 100) / 100, num(adv.violetShare, DEFAULT_ADVANCED.violetShare, 0, 100) / 100)
                uGlint.f4("uGl4", worldWidth, num(adv.flicker, DEFAULT_ADVANCED.flicker, 0, 100) / 100, stretch, 0)
                uGlint.f3("uCoreE", coreE[0], coreE[1], coreE[2])
                uGlint.f3("uBaseE", gBase[0], gBase[1], gBase[2])
                uGlint.f3("uAccE", gAcc[0], gAcc[1], gAcc[2])
                uGlint.f3("uVioE", gVio[0], gVio[1], gVio[2])
                uGlint.f1("uOut", outScale)
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, nBright * NS * (2 * GLINT_SEG + 4))
            }

            gl.bindVertexArray(emptyVao)
            const nSamp = segFar + 1
            sBk = ensureBaked(sBk, nAll * nSamp * 2)
            if (!sBk) return
            gl.useProgram(sBakeProg)
            setTube(uSBake, 1)
            uSBake.f4("uSt", nBright, nAll, nSamp, 0)
            uSBake.i1("uZs", 5)
            bake(sBakeProg, nAll * nSamp, sBk, 2)
            const nGlintV = nBright * NS * (GLINT_SEG + 1)
            if (occ > 0) {
                gBk = ensureBaked(gBk, nGlintV * 3)
                if (!gBk) return
                gl.useProgram(gBakeProg)
                setTube(uGBake, 1)
                uGBake.f4("uGl", nBright, NS, GLINT_RANGE / NS, GLINT_RANGE)
                uGBake.f4("uGl2", gpm, gpc, occ, 2.6 * Math.pow(120 / nBright, 0.5))
                uGBake.f4("uGl4", worldWidth, num(adv.flicker, DEFAULT_ADVANCED.flicker, 0, 100) / 100, stretch, 0)
                bake(gBakeProg, nGlintV, gBk, 3)
            }
            gl.activeTexture(gl.TEXTURE6)
            gl.bindTexture(gl.TEXTURE_2D, sBk.tex)
            gl.activeTexture(gl.TEXTURE7)
            gl.bindTexture(gl.TEXTURE_2D, gBk ? gBk.tex : sBk.tex)

            gl.enable(gl.BLEND)
            gl.blendFunc(gl.ONE, gl.ONE)
            gl.clearColor(0, 0, 0, 0)
            gl.bindFramebuffer(gl.FRAMEBUFFER, soft.fbo)
            gl.viewport(0, 0, soft.w, soft.h)
            gl.clear(gl.COLOR_BUFFER_BIT)
            drawStrands(0)
            drawGlints(0)

            gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fbo)
            gl.viewport(0, 0, scene.w, scene.h)
            gl.clear(gl.COLOR_BUFFER_BIT)
            drawStrands(1)
            drawGlints(1)
            const dustAmt = num(adv.dust, DEFAULT_ADVANCED.dust, 0, 200) / 50
            if (dustAmt > 0 && dustProg && uDust) {
                const zoom = Math.min(3, Math.max(0.1, (S / REF_H) ** 2))
                const nDust = Math.round(DUST_PER_UNIT * DUST_RANGE * Math.min(2, dustAmt) * zoom)
                gl.useProgram(dustProg)
                setTube(uDust, 1)
                const dpm = ((travel % DUST_RANGE) + DUST_RANGE) % DUST_RANGE
                const dpc = Math.floor(travel / DUST_RANGE) % 1024
                uDust.f4("uDu", DUST_RANGE, dpm, dpc, 2.4 * Math.max(1, dustAmt / 2))
                uDust.f4("uDu2", 0.7, 0, 0, 0)
                const shutter = (1 / 30) * flight
                uDust.f3("uVel", R[2] * shutter, R[5] * shutter, R[8] * shutter)
                uDust.f3("uDustE", dustE[0], dustE[1], dustE[2])
                uDust.f1("uOut", outScale)
                gl.drawArrays(gl.TRIANGLES, 0, nDust * 6)
            }
            gl.disable(gl.BLEND)

            const bloomAmt = num(adv.bloom, DEFAULT_ADVANCED.bloom, 0, 200) / 100
            if (bloomAmt > 0 && q4[0] && q4[1] && q8[0] && q8[1]) {
                gl.activeTexture(gl.TEXTURE3)
                gl.bindTexture(gl.TEXTURE_2D, soft.tex)
                gl.activeTexture(gl.TEXTURE0)
                gl.useProgram(downProg)
                uDown.i1("uSrc", 0)
                uDown.i1("uSoft", 3)
                gl.bindTexture(gl.TEXTURE_2D, scene.tex)
                uDown.f2("uSrcPx", 1 / scene.w, 1 / scene.h)
                uDown.f2("uDstRes", q4[0].w, q4[0].h)
                uDown.f1("uSoftK", 1)
                pass(q4[0], downProg)
                gl.bindTexture(gl.TEXTURE_2D, q4[0].tex)
                uDown.f1("uSoftK", 0)
                uDown.f2("uSrcPx", 1 / q4[0].w, 1 / q4[0].h)
                uDown.f2("uDstRes", q8[0].w, q8[0].h)
                pass(q8[0], downProg)
                gl.useProgram(blurProg)
                uBlur.i1("uSrc", 0)
                for (const pair of [q4, q8]) {
                    const a = pair[0]
                    const b = pair[1]
                    if (!a || !b) continue
                    uBlur.f2("uDstRes", a.w, a.h)
                    gl.bindTexture(gl.TEXTURE_2D, a.tex)
                    uBlur.f2("uStep", 1 / a.w, 0)
                    pass(b, blurProg)
                    gl.bindTexture(gl.TEXTURE_2D, b.tex)
                    uBlur.f2("uStep", 0, 1 / a.h)
                    pass(a, blurProg)
                }
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.viewport(0, 0, bufW, bufH)
            gl.useProgram(compProg)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, scene.tex)
            gl.activeTexture(gl.TEXTURE1)
            gl.bindTexture(gl.TEXTURE_2D, q4[0] ? q4[0].tex : scene.tex)
            gl.activeTexture(gl.TEXTURE2)
            gl.bindTexture(gl.TEXTURE_2D, q8[0] ? q8[0].tex : scene.tex)
            gl.activeTexture(gl.TEXTURE3)
            gl.bindTexture(gl.TEXTURE_2D, soft.tex)
            uComp.i1("uScene", 0)
            uComp.i1("uSoft", 3)
            uComp.i1("uBloomA", 1)
            uComp.i1("uBloomB", 2)
            uComp.f2("uBuf", bufW, bufH)
            uComp.f4("uLook", (num(adv.exposure, DEFAULT_ADVANCED.exposure, 20, 400) / 140) * (1 + 0.1 * sk), Math.min(0.9, 0.6 * bloomAmt), 1 / outScale, pxPerCss)
            const bg = parseColorA(p.background, [0.075, 0.07, 0.07])
            uComp.f4("uBg", bg.c[0], bg.c[1], bg.c[2], bg.a)
            uComp.f4(
                "uFx",
                (num(adv.grain, DEFAULT_ADVANCED.grain, 0, 100) / 100) * 0.12,
                num(adv.vignette, DEFAULT_ADVANCED.vignette, 0, 100) / 100,
                0.06 * (num(adv.stars, DEFAULT_ADVANCED.stars, 0, 200) / 50),
                clock
            )
            const zc = ((travel % WORLD_PERIOD) + WORLD_PERIOD) % WORLD_PERIOD
            const zh = zc + 1.4
            viewOf(cam, axisX(zh, wind), axisY(zh, wind), zh, tv)
            screenOf(cam, tv, ts)
            const hazeAmt = (num(adv.haze, DEFAULT_ADVANCED.haze, 0, 200) / 100) * 0.55
            uComp.f4("uHaze", ts[0], ts[1], (cam.f * Math.max(Rw, 0.08) * 1.1) / 1.4 + 0.06 * S, tv[2] > 0.05 ? hazeAmt : 0)
            uComp.f3("uHazeE", hazeE[0], hazeE[1], hazeE[2])
            uComp.f3("uDustE", dustE[0], dustE[1], dustE[2])
            uComp.f4("uRot0", R[0], R[1], R[2], 0)
            uComp.f4("uRot1", R[3], R[4], R[5], 0)
            uComp.f4("uRot2", R[6], R[7], R[8], 0)
            uComp.f4("uProjC", cam.f, cam.cx, cam.cy, 0)
            uComp.f2("uRoll", cam.cr, cam.sr)
            uComp.f1("uSeed", seed)
            gl.bindVertexArray(quadVao)
            gl.drawArrays(gl.TRIANGLES, 0, 3)
            gl.bindVertexArray(null)

            if (q && timerExt) {
                gl.endQuery(timerExt.TIME_ELAPSED_EXT)
                queries.push({ q, level: quality })
            }
            drawn++
            if (!painted) {
                painted = true
                setGpu(true)
            }
        }

        const pollQueries = () => {
            if (!gl || !timerExt) return
            const disjoint = gl.getParameter(timerExt.GPU_DISJOINT_EXT)
            while (queries.length) {
                const { q, level } = queries[0]
                if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) break
                const ms = gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6
                gl.deleteQuery(q)
                queries.shift()
                if (!disjoint && level === quality && warm > 10 && ms > 0) gpuEma = gpuEma ? gpuEma * 0.9 + ms * 0.1 : ms
            }
        }

        const busy = (p: CopperCorridorProps): boolean => {
            const springs =
                Math.abs(st.a - st.ta) > 1e-4 ||
                Math.abs(st.b - st.tb) > 1e-4 ||
                Math.abs(st.va) + Math.abs(st.vb) > 1e-3 ||
                Math.abs(st.sa - st.a) > 1e-4 ||
                Math.abs(st.sb - st.b) > 1e-4 ||
                Math.abs(st.vsa) + Math.abs(st.vsb) > 1e-3
            if (springs || hoverMoving) return true
            if (surgeK > 0.001 || (held && num(p.surge, DEFAULTS.surge, 0, 10) > 0 && !reduced)) return true
            return !reduced && num(p.speed, DEFAULTS.speed, 0, 100) > 0
        }

        const tick = (now: number) => {
            raf = 0
            if (!running) return
            const gap = lastTick < 0 ? 0 : now - lastTick
            const dt = Math.min(0.1, gap / 1000)
            lastTick = now
            if (gap > 0 && gap < 100) {
                gaps[gapI] = gap
                gapI = (gapI + 1) % gaps.length
                gapN = Math.min(gaps.length, gapN + 1)
                if (gapN >= 5) {
                    for (let i = 0; i < gapN; i++) gapSort[i] = gaps[i]
                    const sub = gapSort.subarray(0, gapN).sort()
                    cadence = sub[gapN >> 1]
                    const x = 16.7 / cadence
                    if (x < every - 0.1 || x >= every + 1.1) every = Math.max(1, Math.floor(x + 0.1))
                }
            }
            const p = propsRef.current
            const adv = { ...DEFAULT_ADVANCED, ...p.advanced }
            const spd = num(p.speed, DEFAULTS.speed, 0, 100) / 50
            const sAmt = num(p.surge, DEFAULTS.surge, 0, 10) / 10

            const sTarget = held && sAmt > 0 && !reduced ? 1 : 0
            surgeK += (sTarget - surgeK) * (1 - Math.exp(-dt / (sTarget > surgeK ? 0.35 : 0.6)))
            if (Math.abs(sTarget - surgeK) < 0.001) surgeK = sTarget
            const sk = surgeK * sAmt
            const hv = num(adv.hover, DEFAULT_ADVANCED.hover, 0, 100) / 50
            const hTarget = ptrInside && hv > 0 && !reduced ? 1 : 0
            hoverK += (hTarget - hoverK) * (1 - Math.exp(-dt / (hTarget > hoverK ? 0.35 : 0.9)))
            if (Math.abs(hTarget - hoverK) < 0.001) hoverK = hTarget
            if (!reduced) {
                const flight = FLY_RATE * spd + SURGE_RATE * sk + HOVER_RATE * hoverK * hv
                travel = (travel + dt * flight) % (WORLD_PERIOD * DUST_RANGE * GLINT_RANGE * 1024)
                glintPhase += dt * (flight + 0.5 * spd * (num(adv.glintSpeed, DEFAULT_ADVANCED.glintSpeed, 0, 200) / 100))
                glintPhase %= GLINT_RANGE * 1024
                clock = (clock + dt * Math.max(spd, sk)) % 36000
            }

            if (ptrMoved) {
                ptrMoved = false
                const r = root.getBoundingClientRect()
                if (r.width > 0 && r.height > 0) {
                    ptrU = (ptrClientX - r.left) / r.width
                    ptrV = (ptrClientY - r.top) / r.height
                    if (W > 0) {
                        const s = Math.min(2, Math.max(1, r.width / W))
                        if (Math.abs(s - shown) / shown > 0.05) {
                            shown = s
                            resizePending = true
                        }
                    }
                }
            }
            const spTx = ptrU * W
            const spTy = ptrV * H
            if (hoverK < 0.01) {
                spotX = spTx
                spotY = spTy
            } else {
                const ks = 1 - Math.exp(-dt / 0.12)
                spotX += (spTx - spotX) * ks
                spotY += (spTy - spotY) * ks
            }
            hoverMoving = hoverK !== hTarget || (hoverK > 0 && Math.hypot(spTx - spotX, spTy - spotY) > 0.5)
            st.ta = 0
            st.tb = 0
            const om = 5.8 / 0.1
            const om2 = 5.8 / 0.45
            let rem = dt
            while (rem > 1e-6) {
                const h = Math.min(rem, 1 / 240)
                st.va += (om * om * (st.ta - st.a) - 2 * om * st.va) * h
                st.vb += (om * om * (st.tb - st.b) - 2 * om * st.vb) * h
                st.a += st.va * h
                st.b += st.vb * h
                st.vsa += (om2 * om2 * (st.a - st.sa) - 2 * om2 * st.vsa) * h
                st.vsb += (om2 * om2 * (st.b - st.sb) - 2 * om2 * st.vsb) * h
                st.sa += st.vsa * h
                st.sb += st.vsb * h
                rem -= h
            }
            if (Math.abs(st.ta - st.a) < 1e-4 && Math.abs(st.va) < 1e-3) {
                st.a = st.ta
                st.va = 0
            }
            if (Math.abs(st.tb - st.b) < 1e-4 && Math.abs(st.vb) < 1e-3) {
                st.b = st.tb
                st.vb = 0
            }
            if (Math.abs(st.a - st.sa) < 1e-4 && Math.abs(st.vsa) < 1e-3) {
                st.sa = st.a
                st.vsa = 0
            }
            if (Math.abs(st.b - st.sb) < 1e-4 && Math.abs(st.vsb) < 1e-3) {
                st.sb = st.b
                st.vsb = 0
            }

            if (!sameProps(p, lastProps)) {
                lastProps = p
                dirty = true
            }
            const moving = busy(p)
            let doDraw = dirty
            if (!doDraw && moving && (lastDraw < 0 || now - lastDraw >= (every - 0.5) * cadence)) doDraw = true
            if (doDraw) {
                const drawGap = lastDraw < 0 ? 0 : now - lastDraw
                const late = lastDraw < 0 ? 1 : drawGap / Math.min(Math.max(every * cadence, 16), 33.4)
                if (drawGap > 0) {
                    gapEma = gapEma * 0.8 + drawGap * 0.2
                    if (probeUntil > 0) {
                        if (probeN >= 0) probeSum += drawGap
                        probeN++
                    }
                }
                lastDraw = now
                pollQueries()
                adaptQuality(now, every * cadence, late, dt)
                draw()
                dirty = false
                warm++
            }
            if (drawn - measuredAt >= 30) {
                measuredAt = drawn
                if (measureShown()) resizePending = true
            }
            if (moving || dirty) raf = requestAnimationFrame(tick)
            else {
                running = false
                lastTick = -1
            }
        }

        const adaptQuality = (now: number, period: number, late: number, dt: number) => {
            if (period <= 0 || warm < 10) return
            lateEma = lateEma * 0.9 + Math.min(late, 4) * 0.1
            const target = Math.min(Math.max(period, 16), 33.4)
            const gpuShare = timerExt && gpuEma > 0 ? gpuEma / target : lateEma
            if (lateEma > 1.3 && gpuShare > 0.6) {
                slowFor += dt
                goodFor = 0
            } else {
                slowFor = 0
                goodFor += dt
            }
            if (probeUntil > 0 && now > probeUntil && probeN >= 3) {
                if (lateEma > 1.15 && probeSum / probeN > probeGap * 0.87 && quality > 0) {
                    quality--
                    resizePending = true
                    downBan = now + 30000
                }
                probeUntil = 0
            }
            if (slowFor > 0.5 && quality < QUALITY_LEVELS.length - 1 && now > downBan && probeUntil === 0) {
                quality++
                slowFor = goodFor = 0
                banUntil = now + 4000
                gpuEma = 0
                lateEma = 1.2
                probeGap = gapEma
                probeUntil = now + 1500
                probeSum = 0
                probeN = -1
                resizePending = true
            } else if (goodFor > 4 && quality > 0 && now > banUntil && (!timerExt || gpuEma <= 0 || gpuEma < target * 0.45)) {
                quality--
                goodFor = 0
                gpuEma = 0
                banUntil = now + 8000
                resizePending = true
            }
        }

        const wake = () => {
            dirty = true
            if (running || !visible || lost || !gl) return
            running = true
            lastTick = -1
            lastDraw = -1
            raf = requestAnimationFrame(tick)
        }
        wakeRef.current = () => {
            if (!sameProps(propsRef.current, lastProps)) wake()
        }

        const ro = new ResizeObserver((entries) => {
            const cr = entries[entries.length - 1].contentRect
            W = cr.width
            H = cr.height
            measureShown()
            resizePending = true
            draw()
            wake()
        })
        ro.observe(root)
        const io =
            typeof IntersectionObserver === "function"
                ? new IntersectionObserver((entries) => {
                      visible = entries[entries.length - 1].isIntersecting && document.visibilityState !== "hidden"
                      if (visible) wake()
                  })
                : null
        io?.observe(root)
        const onVis = () => {
            visible = document.visibilityState !== "hidden"
            if (visible) wake()
        }
        document.addEventListener("visibilitychange", onVis)

        const onLost = (e: Event) => {
            e.preventDefault()
            lost = true
            painted = false
            setGpu(false)
            running = false
            if (raf) cancelAnimationFrame(raf)
            raf = 0
        }
        const onRestored = () => {
            lost = false
            if (initGL()) {
                bufW = bufH = 0
                resizePending = true
                wake()
            }
        }
        canvas.addEventListener("webglcontextlost", onLost)
        canvas.addEventListener("webglcontextrestored", onRestored)

        if (initGL()) {
            const r = root.getBoundingClientRect()
            W = root.clientWidth || r.width
            H = root.clientHeight || r.height
            measureShown()
            resizePending = true
            wake()
        }

        return () => {
            running = false
            if (raf) cancelAnimationFrame(raf)
            wakeRef.current = () => {}
            ro.disconnect()
            io?.disconnect()
            mq?.removeEventListener?.("change", onMq)
            document.removeEventListener("visibilitychange", onVis)
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerenter", onMove)
            root.removeEventListener("pointerleave", onLeave)
            root.removeEventListener("pointerdown", onDown)
            root.removeEventListener("pointerup", onUp)
            root.removeEventListener("pointercancel", onLeave)
            window.removeEventListener("pointerup", onWinUp)
            window.removeEventListener("scroll", onScroll, { capture: true })
            canvas.removeEventListener("webglcontextlost", onLost)
            canvas.removeEventListener("webglcontextrestored", onRestored)
            if (gl) {
                for (const t of [scene, soft, q4[0], q4[1], q8[0], q8[1]]) dropTarget(t)
                for (const pr of [strandProg, glintProg, sBakeProg, gBakeProg, dustProg, downProg, blurProg, compProg]) if (pr) gl.deleteProgram(pr)
                for (const b of [sBk, gBk]) {
                    if (!b) continue
                    gl.deleteBuffer(b.buf)
                    gl.deleteTexture(b.tex)
                }
                if (tfo) gl.deleteTransformFeedback(tfo)
                if (zTex) gl.deleteTexture(zTex)
            }
        }
    }, [])

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                aspectRatio: `${REF_W} / ${REF_H}`,
                ...style,
                overflow: "hidden",
                background: gpu ? undefined : background,
                touchAction: "pan-y",
                userSelect: "none",
                WebkitUserSelect: "none",
            }}
        >
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />
        </div>
    )
}

const __originkitPresetProps = {
  "density": 89,
  "fringe": 62,
  "surge": 4.6,
  "speed": 30
};

export function CopperCorridor(props: Record<string, unknown>) {
  return <__OriginkitBase_CopperCorridor {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}

export default CopperCorridor;
