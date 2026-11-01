/* eslint-disable */
// Light Waterfall Pool — Originkit

// Delivered by Originkit · stack: nextjs
"use client"
import React, { useEffect, useRef, type CSSProperties } from "react"

/*
 * ZirconTorrent — a column of blue light pours out of the dark and lands on
 * a wet, glowing floor: hairline strands stream down a white-hot core,
 * flare into a concave skirt at the impact, and the floor beneath shimmers
 * with caustics, perspective streaks and cyan sparkles.
 */

// ---------------------------------------------------------------- types

interface Placement {
    x: number
    y: number
    angle: number
    tilt: number
}

interface Direction {
    flow: "down" | "up"
    ripple: "away" | "toward"
    streaks: "away" | "toward"
}

const DEFAULT_ADVANCED = {
    horizon: 73,
    coreWidth: 25,
    sheathWidth: 72,
    flare: 100,
    lineWidth: 100,
    strandContrast: 75,
    dashLength: 30,
    dashBoost: 90,
    flowCycles: 4,
    sway: 15,
    breathe: 10,
    bloomWidth: 300,
    bloomColor: "#7FB8FF",
    horizonColor: "#CFE4FF",
    floorTop: "#040B1C",
    floorDeep: "#000206",
    causticColor: "#5497D4",
    causticScale: 80,
    ripple: 100,
    streakCount: 12,
    streakOpacity: 70,
    reflection: 100,
    sparkles: 12,
    sparkleColor: "#9FE4FF",
    specks: 10,
    lift: 100,
    lean: 0,
    grain: 20,
    vignette: 0,
}
type Advanced = typeof DEFAULT_ADVANCED

export interface ZirconTorrentProps {
    /** The void behind the column. */
    background?: string
    /** The blue of the strands, the floor and the spill. */
    baseColor?: string
    /** The pale tint the brightest light runs toward. */
    accentColor?: string
    /** How many hairline strands make up the column. */
    strands?: number
    /** Brightness of the white core and the impact pool. */
    glow?: number
    /** Brightness of the floor: caustics, streaks, reflection, sparkles. */
    floor?: number
    /** Width of the column and its pool, as a share of the reference. */
    scale?: number
    /** How big the whole scene draws in its frame. */
    zoom?: number
    /** Where the scene sits in its frame and how it is turned. */
    placement?: Partial<Placement>
    /** How far the torrent's base swings to land under the pointer. */
    hover?: number
    /** How much faster the light streams while hovered, in % on top of Speed. */
    hoverSpeed?: number

    /** Tap to send a surge down the column, or ripple the floor where tapped. */
    surge?: boolean
    /** How fast the light streams. 0 holds the frame still. */
    speed?: number
    /** Which way the strands stream, and which way the floor's light and trails travel. */
    direction?: Partial<Direction>
    /** Tuning constants behind the look. */
    advanced?: Partial<Advanced>
    style?: CSSProperties
}

// ---------------------------------------------------------------- defaults

const REF_W = 1200
const REF_H = 800
const REF_ASPECT = REF_W / REF_H

const DEFAULTS = {
    background: "#000000",
    baseColor: "#509AD1",
    accentColor: "#9C9BCC",
    strands: 400,
    glow: 29,
    floor: 71,
    scale: 300,
    zoom: 69,
    hover: 19,
    hoverSpeed: 134,
    surge: true,
    speed: 74,
}
const DEFAULT_PLACEMENT: Placement = { x: 0, y: 0, angle: 0, tilt: 0 }
const DEFAULT_DIRECTION: Direction = { flow: "down", ripple: "away", streaks: "away" }

// ---------------------------------------------------------------- constants

const PERSPECTIVE = 2.5
const MAX_SURGES = 4
const SURGE_LIFE = 4.5
const SWING_W = 5.7
const SWING_Z = 0.45
const RUSH_S = 0.6
const FOLLOW_S = 0.09

const PIXEL_BUDGET = 2.6e6
const LADDER = [1, 0.85, 0.72, 0.6]

// ---------------------------------------------------------------- colour

type RGB = [number, number, number]
const COLOR_CACHE = new Map<string, RGB | null>()

function parseColor(input: unknown, fallback: RGB): RGB {
    if (typeof input !== "string") return fallback
    let hit = COLOR_CACHE.get(input)
    if (hit === undefined) {
        hit = parseColorRaw(input)
        COLOR_CACHE.set(input, hit)
    }
    return hit ?? fallback
}

function parseColorRaw(raw: string): RGB | null {
    let s = raw.trim()
    const v = /^var\(\s*--[^,]+,\s*(.+)\)$/.exec(s)
    if (v) s = v[1].trim()
    if (s[0] === "#") {
        const h = s.slice(1)
        const x = (a: string) => parseInt(a, 16) / 255
        let out: RGB
        if (h.length === 3 || h.length === 4) out = [x(h[0] + h[0]), x(h[1] + h[1]), x(h[2] + h[2])]
        else if (h.length === 6 || h.length === 8) out = [x(h.slice(0, 2)), x(h.slice(2, 4)), x(h.slice(4, 6))]
        else return null
        return out.every(Number.isFinite) ? out : null
    }
    const m = /^(rgba?|hsla?)\(([^)]*)\)$/i.exec(s)
    if (!m) return null
    const parts = m[2].split(/[\s,/]+/).filter(Boolean)
    if (parts.length < 3) return null
    const num = (p: string, scale: number) => (p.endsWith("%") ? (parseFloat(p) / 100) * scale : parseFloat(p))
    let rgb: RGB
    if (m[1].toLowerCase().startsWith("rgb")) {
        rgb = [num(parts[0], 255) / 255, num(parts[1], 255) / 255, num(parts[2], 255) / 255]
    } else {
        const hh = (((parseFloat(parts[0]) % 360) + 360) % 360) / 360
        const ss = num(parts[1], 1)
        const ll = num(parts[2], 1)
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
    return rgb.every(Number.isFinite) ? (rgb.map((c) => Math.min(1, Math.max(0, c))) as RGB) : null
}

function num(v: unknown, d: number, lo = -Infinity, hi = Infinity): number {
    const n = typeof v === "number" && Number.isFinite(v) ? v : d
    return Math.min(hi, Math.max(lo, n))
}

// ---------------------------------------------------------------- shaders

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uRes;
uniform float uUnit;
uniform float uPx;
uniform vec4 uPlaceA;
uniform vec4 uPlaceB;
uniform float uZoom;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec4 uSurge[${MAX_SURGES}];
uniform float uSteer;
uniform float uSwing;
uniform vec3 uBg;
uniform vec3 uKBlue;
uniform vec3 uKPale;
uniform vec3 uKHalo;
uniform vec3 uKCore;
uniform vec3 uKBloom;
uniform vec3 uKHorizon;
uniform vec3 uKCaustic;
uniform vec3 uKCausticDeep;
uniform vec3 uKStreak;
uniform vec3 uKSpark;
uniform vec3 uKSpeck;
uniform vec3 uEFloorTop;
uniform vec3 uEFloorDeep;
uniform float uScale;
uniform float uHoverAmt;
uniform float uStrands;
uniform float uStrandMean;
uniform float uFlowDir;
uniform float uRippleDir;
uniform float uStreakDir;
uniform float uColReach;
uniform float uGlow;
uniform float uFloor;
uniform float uHorizon;
uniform float uCoreW;
uniform float uSheathW;
uniform float uFlare;
uniform float uLine;
uniform float uContrast;
uniform float uDashLen;
uniform float uDashBoost;
uniform float uFlow;
uniform float uSway;
uniform float uBreathe;
uniform float uBloomW;
uniform float uCausticScale;
uniform float uRipple;
uniform float uStreaks;
uniform float uStreakOp;
uniform float uReflect;
uniform float uSparkles;
uniform float uSpecks;
uniform float uLift;
uniform float uLean;
uniform float uGrain;
uniform float uVignette;
out vec4 outColor;

const float TAU = 6.2831853;
const float FLARE_L = 0.09;
const float FLARE_A = 2.0;
const float FOOT_L = 0.05;
const float CORE_L = 0.065;
const float COL_LEAN = 0.008;
const float HALO_W = 0.1;
const float REFL_D = 0.08;
const float REFL_SQ = 2.2;
const float FALL_A = 12.85;
const float FALL_B = 40.0;
const float SURGE_V = 1.1;
const float RING_V = 0.32;
const float GATHER_T = 1.8;
const float RING_GATHER = 0.9;

float sq(float x) { return x * x; }
float h11(float n) { n = fract(n * 0.1031); n *= n + 33.33; n *= n + n; return fract(n); }
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbmAA(vec2 p, float fpx) {
    float s = 0.0, a = 0.5, n = 0.0;
    for (int i = 0; i < 4; i++) {
        float k = clamp((0.45 - fpx) * 4.0, 0.0, 1.0);
        s += a * mix(0.5, vnoise(p), k);
        n += a;
        p = mat2(1.62, 1.18, -1.18, 1.62) * p + 7.1;
        fpx *= 2.03;
        a *= 0.5;
    }
    return s / n;
}
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h11(i), h11(i + 1.0), f); }
float asinhS(float v) { float a = abs(v); return sign(v) * log(a + sqrt(a * a + 1.0)); }

vec2 toWorld(vec2 frag, out float ok) {
    vec2 p = (frag - 0.5 * uRes) / uUnit - uPlaceA.xy;
    p = vec2(uPlaceA.z * p.x - uPlaceA.w * p.y, uPlaceA.w * p.x + uPlaceA.z * p.y);
    float D = uPlaceB.z;
    float den = D * uPlaceB.x - p.y * uPlaceB.y;
    ok = step(1e-3, den);
    float t = D * uPlaceB.x / max(den, 1e-3);
    p = vec2(t * p.x, t * p.y * uPlaceB.x - D * (1.0 - t) * uPlaceB.y);
    return p / uZoom;
}

float strands(float u, float lanes, float cellPx, float sig, float seed, float P, float t) {
    float v = u * lanes;
    float cell = floor(v);
    float sum = 0.0;
    for (int k = -1; k <= 1; k++) {
        float i = cell + float(k);
        float h = h11(i * 1.731 + seed);
        float h2 = h11(i * 3.117 + seed + 9.1);
        float h3 = h11(i * 0.913 + seed + 21.7);
        float c = i + 0.5 + (h2 - 0.5) * 0.5 + uSway * sin(TAU * t / 6.0 + h3 * TAU);
        float dpx = (v - c) * cellPx;
        float ln = exp(-(dpx * dpx) / max(sig * sig, 1e-4));
        float h6 = h * h * h; h6 *= h6;
        float cyc = max(1.0, uFlow + floor(h3 * 3.0) - 1.0);
        float along = P - uFlowDir * t * cyc / 15.0;
        float lvl = mix(1.0, (0.25 + 3.0 * h6) * (0.4 + 1.2 * n1(along * 5.0 + h3 * 17.0)), uContrast);
        float q = fract(P * 2.5 - uFlowDir * t * cyc / 6.0 + h2 * 7.0);
        float dash = smoothstep(0.0, 0.05, q) * (1.0 - smoothstep(uDashLen * 0.35, max(uDashLen, 0.02), q));
        sum += ln * lvl * (0.55 + uDashBoost * dash);
    }
    return sum * clamp(cellPx / max(sig * 1.7725, 1e-3), 0.0, 2.5);
}

vec3 column(float x, float d, float pxu, float sig, float P, float t, float br) {
    float fl = exp(-d / FLARE_L);
    float foot = exp(-d / FOOT_L);
    float w = uSheathW * (0.8 + uFlare * FLARE_A * fl) * (x < 0.0 ? 1.04 : 1.0);
    float u = x / w;
    float au = abs(u);
    vec3 E = vec3(0.0);
    if (au < 2.6) {
        float env = exp(-pow(au, 2.0 + 1.5 * foot));
        float wpx = w * pxu;
        float lanes = max(min(uStrands, wpx / max(sig * 0.8, 1e-3)), 1.0);
        float lanes2 = lanes * 0.61;
        float lanes3 = max(min(uStrands * 2.7, wpx / max(sig * 0.8, 1e-3)), 1.0);
        float s = strands(u, lanes, wpx / lanes, sig, 0.0, P, t) * 0.45
                + strands(u, lanes2, wpx / lanes2, sig, 37.0, P, t) * 0.25
                + strands(u, lanes3, wpx / lanes3, sig, 71.0, P, t) * 0.3;
        s /= uStrandMean;
        float sa = mix(0.3, 0.65, smoothstep(0.25, 1.3, au));
        float eb = 3.1 * (1.0 + 0.5 * foot) * env * mix(1.0, s, sa);
        E += mix(uKBlue, uKPale, max(0.65 * foot, 0.75 * smoothstep(1.2, 4.5, eb))) * eb;
    }
    E += uKHalo * 0.28 * uLift * exp(-pow(abs(x) / (HALO_W * (1.0 + 0.3 * fl)), 1.5)) * br;
    float cw = uCoreW * (1.0 + uFlare * 5.0 * exp(-d / CORE_L)) * (1.0 + (br - 1.0) * 0.8);
    float cx = x / cw;
    E += uKCore * 4.0 * uGlow * br * exp(-cx * cx);
    E += uKBloom * 0.9 * uGlow * br * exp(-sq(cx / 2.4));
    return E;
}

vec3 finish(vec3 col) {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 vq = (uv - 0.5) * vec2(uRes.x / uRes.y / 1.5, 1.0) * 1.6;
    col *= 1.0 - uVignette * smoothstep(0.35, 1.1, length(vq));
    float fr = mod(floor(uTime * 24.0), 48.0);
    float gr = h21(floor(gl_FragCoord.xy / max(uPx, 1.0)) + vec2(fr * 17.0, fr * 31.0)) - 0.5;
    float v = max(col.b, col.g);
    col += gr * uGrain * 0.12 * sqrt(v + 0.004) * (1.0 - 0.85 * v * v);
    return clamp(col, 0.0, 1.0);
}

void main() {
    float ok;
    vec2 wp = toWorld(gl_FragCoord.xy, ok);
    if (ok < 0.5) { outColor = vec4(finish(uBg), 1.0); return; }
    float okm;
    vec2 mw = toWorld(uMouse, okm);
    float x = wp.x;
    float y = wp.y + 0.5;
    float t = uTime;
    float pxH = uUnit * uZoom;
    float sig = max(0.75 * uLine * uPx, 0.9);
    float yH = uHorizon;
    float sc = max(uScale, 0.05);
    float xs = x / sc;
    float br = 1.0 + uBreathe * 0.5 * (cos(TAU * t / 3.0) - 1.0);
    float hv = uHover * uHoverAmt * okm;
    vec2 m = vec2(mw.x, mw.y + 0.5);
    float d = y - yH;
    float topD = max(1.0 - yH, 1e-3);
    vec3 E = vec3(0.0);

    float pulse = 0.0;
    float pk = 0.0;
    float flash = 0.0;
    vec3 SPL = vec3(0.0);
    float xq = x - uSteer;
    vec4 ring[${MAX_SURGES}];
    for (int i = 0; i < ${MAX_SURGES}; i++) {
        vec4 s = uSurge[i];
        ring[i] = vec4(0.0, 0.0, -1.0, 0.0);
        if (s.w < 0.5) continue;
        float okt;
        vec2 tw = toWorld(s.xy, okt);
        float ty = tw.y + 0.5;
        if (ty > yH) {
            float fall = uFlowDir > 0.0 ? (ty - yH) / SURGE_V : 1e3;
            float yp = ty - uFlowDir * SURGE_V * s.z;
            if (s.z < fall) {
                float behind = (y - yp) * uFlowDir;
                float on = smoothstep(0.0, 0.15, s.z);
                pulse += (behind > 0.0 ? exp(-behind / 0.25) : 0.0) * on * 0.6;
                pk += exp(-sq(behind / 0.03)) * on;
            } else {
                float a = s.z - fall;
                flash += exp(-a / 0.4) * smoothstep(0.0, 0.03, a);
                pulse += exp(-max(y - yH, 0.0) / 0.25) * exp(-a / 0.25) * 0.6;
                float hgt = 0.09 * sqrt(clamp(a / 0.5, 0.0, 1.0));
                float fade = exp(-a / 0.35) * smoothstep(0.0, 0.04, a);
                float wq = (0.03 + 0.25 * a) * max(uScale, 0.05);
                SPL += uKPale * 2.2 * fade * exp(-sq(xq / wq))
                     * exp(-(d > 0.0 ? d / max(hgt, 0.004) : -d / 0.02));
                if (uRippleDir < 0.0) ring[i] = vec4(uSteer, yH - 0.02, a * RING_V, exp(-a / 1.6) * smoothstep(0.0, 0.1, a));
            }
            if (uRippleDir > 0.0 && s.z < GATHER_T) {
                float k = s.z / GATHER_T;
                ring[i] = vec4(uSteer, yH - 0.02, RING_GATHER * (1.0 - k), smoothstep(0.0, 0.15, s.z) * (1.0 - smoothstep(0.85, 1.0, k)));
            }
        } else if (okt > 0.5) {
            ring[i] = vec4(tw.x, ty, s.z * RING_V * 0.8, exp(-s.z / 1.4) * smoothstep(0.0, 0.05, s.z));
        }
    }

    float xr = x - clamp(x, min(0.0, uSteer), max(0.0, uSteer));
    if (d > -REFL_D && abs(xr) < uColReach + 0.12 * abs(uSwing)) {
        float dd = d >= 0.0 ? d : -d * REFL_SQ;
        float yc = yH + dd;
        float xa = x;
        float leanAmt = clamp(m.x / 0.6, -1.0, 1.0) * uLean * hv;
        float shp = pow(1.0 - clamp(dd / topD, 0.0, 1.0), 1.6);
        float aim = uSteer * shp - uSwing * 0.4 * shp * (1.0 - shp);
        xa -= COL_LEAN * min(dd / 0.7, 1.0) + leanAmt * pow(clamp(dd / topD, 0.0, 1.0), 1.5) + aim;
        xa /= 1.0 + 0.35 * pk;
        vec3 C = column(xa / sc, dd, pxH * sc, sig, 1.0 - yc, t, br);
        C *= 1.0 + 1.2 * pulse + 2.2 * pk;
        float below = clamp(-d * pxH, 0.0, 1.0);
        float wet = 0.45 + 1.1 * vnoise(vec2(x * 45.0, log(max(-d, 1e-4)) * 16.0));
        E += C * mix(1.0, 0.45 * uReflect * exp(d / 0.035) * wet, below);
    }

    float xp = (x - uSteer) / sc;
    float bw = uBloomW * (1.0 + (br - 1.0) * 0.8);
    float pb = br * uGlow * (1.0 + 1.2 * flash);
    E += uKCore * 2.5 * pb * exp(-sq(xp / (bw * 0.45)) - sq(d / (d > 0.0 ? 0.01 : 0.03)));
    E += uKPale * 0.3 * pb * exp(-sq(xp / bw) - sq(d / 0.02));
    E += SPL;
    E += uKHorizon * 0.3 * exp(-sq(d / 0.015) - sq(xp / 0.2)) * mix(1.0, uFloor, 0.5);
    E += uKCaustic * 0.22 * exp(-abs(d) / (d > 0.0 ? 0.018 : 0.03))
       * (0.35 + 0.65 * exp(-sq((x - uSteer) / 0.6))) * clamp(uFloor * 2.5, 0.2, 1.5);

    if (d < 0.0) {
        float dy = -d;
        float id = 1.0 / max(dy, 1e-4);
        float A = asinhS(x * id);
        float B = -log(max(dy, 1e-4));
        float rate = id / pxH;
        float flow = t * 0.16 * uRipple * uRippleDir;
        float xl = x - uSteer;
        float lat = 0.85 * exp(-sq(xp / (0.19 + 0.3 * dy))) + 0.06 * exp(-abs(xp) / 0.4);
        float fu = max(dy - 0.03, 0.0);
        float il = 4.5 * exp(-FALL_A * fu - FALL_B * fu * fu) * lat;

        float pw = 0.25 / (1.0 + 3.0 * dy);
        vec2 q = vec2(x / pw * 2.0, 5.5 * (flow - B - 3.0 * abs(x))) * uCausticScale;
        q.x += (vnoise(q * vec2(0.2, 0.3) + 5.3) - 0.5) * 1.6;
        q = mat2(0.8, 0.6, -0.6, 0.8) * q;
        float fpx = max(5.5 * rate, 2.0 / (pw * pxH)) * uCausticScale;
        float T = fbmAA(q, fpx);
        float Tc = smoothstep(0.4, 0.88, T);
        float patchF = mix(1.0, 0.55 + 2.2 * Tc, clamp((0.45 - fpx) * 4.0, 0.0, 1.0));
        float lv = log2(1.0 / (1.8 * uPx * rate));
        float o0 = floor(lv);
        float f0 = exp2(o0);
        float fb = fract(lv);
        float BF = B;
        vec2 k0 = vec2(o0 * 7.7, o0 * 3.1);
        vec2 k1 = k0 + vec2(7.7, 3.1);
        float wA = mix(vnoise(vec2(A * f0, BF * f0 * 0.33) + k0), vnoise(vec2(A * f0 * 2.0, BF * f0 * 0.66) + k1), fb);
        float wB = mix(vnoise(vec2(A * f0 * 0.33, BF * f0) - k0), vnoise(vec2(A * f0 * 0.66, BF * f0 * 2.0) - k1), fb);
        float ray = smoothstep(0.02, 0.12, dy);
        wA = smoothstep(0.28, 0.72, wA);
        wB = smoothstep(0.28, 0.72, wB);
        float mid = exp(-sq((dy - 0.07) / 0.06));
        float speck = h21(floor(gl_FragCoord.xy / max(uPx, 1.0)) + 17.0) - 0.5;
        float weave = 1.0 + (0.4 + 0.25 * mid) * ray * (wA - 0.5) + (0.2 + 0.2 * (1.0 - ray) + 0.2 * mid) * (wB - 0.5) + 0.12 * speck;

        float rp = 0.0;
        for (int i = 0; i < ${MAX_SURGES}; i++) {
            vec4 r = ring[i];
            if (r.z < 0.0) continue;
            float dy0 = max(yH - r.y, 0.002);
            vec2 fq = vec2(x * id - r.x / dy0, id - 1.0 / dy0) * dy0;
            float rr = length(fq);
            float wdt = 0.012 + 0.08 * r.z;
            rp += r.w * (exp(-sq((rr - r.z) / wdt)) + 0.45 * exp(-sq((rr - 0.6 * r.z) / (wdt * 0.8))));
        }

        float near = exp(-dy / 0.05);
        float bk = clamp((0.45 - 45.0 * rate) * 4.0, 0.0, 1.0);
        float brush = 0.6 * vnoise(vec2(x * 14.0, (B - flow) * 22.0)) + 0.4 * vnoise(vec2(x * 33.0 + 4.1, (B - flow) * 45.0));
        float brushF = mix(1.0, 0.35 + 1.5 * smoothstep(0.3, 0.75, brush), near * bk);
        float fe = il * patchF * brushF * max(weave, 0.0) * (1.0 + 3.5 * rp);
        vec3 Ef = mix(uKCausticDeep, uKCaustic, smoothstep(0.0, 2.0, fe)) * fe + vec3(0.35) * max(fe - 2.5, 0.0);
        Ef += mix(uEFloorTop, uEFloorDeep, smoothstep(0.0, 0.2, dy)) * max(weave, 0.0);

        float rw = 0.06 + 0.5 * dy;
        Ef += uKPale * 2.0 * exp(-sq((xp + (Tc - 0.5) * 0.04) / rw) - dy / 0.07) * (0.5 + Tc) * br * uReflect;

        float sv = asinhS(xl * id) * uStreaks;
        float scell = dy * pxH / max(uStreaks, 1.0);
        float sci = floor(sv);
        float st = 0.0;
        for (int k = -1; k <= 1; k++) {
            float i = sci + float(k);
            float hp = h11(i * 2.371 + 51.0);
            float hc = h11(i * 5.113 + 13.0);
            float dpx = (sv - (i + 0.2 + 0.6 * hc)) * scell;
            float sw = max(sig * 1.6, 1.0);
            float ln = exp(-sq(dpx / sw)) + 0.12 * exp(-abs(dpx) / (sw * 2.5));
            float run = smoothstep(0.55, 0.9, n1(B * 6.0 + hp * 31.0));
            float qq = fract((B - t * 0.16 * uRipple * uStreakDir) * 0.7 + hp * 5.0);
            float pu = smoothstep(0.0, 0.1, qq) * (1.0 - smoothstep(0.2, 0.5, qq));
            st += step(0.4, hp) * ln * run * (0.3 + 0.7 * hc) * (0.6 + 0.9 * pu);
        }
        st *= smoothstep(0.06, 0.16, dy) * exp(-sq(xl / (0.2 + 0.7 * dy))) * exp(-dy / 0.3);
        Ef += uKStreak * st * uStreakOp * (1.0 + 2.0 * rp);
        Ef *= uFloor;

        float fk = clamp(uFloor * 2.5, 0.0, 1.5);
        Ef += (uKPale * 1.2 + uKBloom * 0.5) * rp * clamp(uFloor * 2.5, 0.5, 1.5);
        Ef += uKCaustic * 0.45 * fk * exp(-sq(xl / (0.3 + 1.1 * dy)) - dy / 0.14);
        float wob = (vnoise(vec2(B * 7.0 - t * 0.6, 3.1)) - 0.5) * 0.12 * dy;
        float rph = B * 55.0 - t * 2.4 * uRipple + 6.0 * vnoise(vec2(x * 18.0, B * 6.0));
        float rib = mix(0.5, 0.5 + 0.5 * sin(rph), clamp(1.0 - 55.0 * rate, 0.0, 1.0));
        float rw2 = (0.02 + 0.1 * dy) * sc;
        Ef += uKPale * 1.1 * uReflect * br * exp(-sq((xl + wob) / rw2) - dy / 0.2) * (0.3 + 0.7 * rib);

        vec2 fcell = vec2(0.35, 0.6);
        vec2 gi = floor(vec2(x * id, id) / fcell);
        float hs = h21(gi + 11.3);
        vec2 cp = (gi + 0.2 + 0.6 * vec2(h21(gi + 3.7), h21(gi + 5.9))) * fcell;
        float cdy = 1.0 / max(cp.y, 1e-3);
        vec2 gc = vec2(cp.x * cdy, cdy);
        float reachL = exp(-sq((gc.x - uSteer) / (0.22 + 0.9 * gc.y)));
        float sow = smoothstep(0.05, 0.09, gc.y) * (1.0 - smoothstep(0.3, 0.55, gc.y)) * reachL;
        if (hs < uSparkles * 0.02 * sow) {
            float dpx = length(vec2(x - gc.x, dy - gc.y)) * pxH;
            float sz = (0.6 + 0.5 * h21(gi + 8.1)) * uPx * (0.7 + 2.0 * gc.y);
            float kk = 3.0 + floor(h21(gi + 2.2) * 3.0);
            float tw = pow(max(0.5 + 0.5 * sin(TAU * kk * t / 6.0 + hs * 97.0), 0.0), 6.0);
            float dotv = exp(-sq(dpx / sz)) + 0.1 * exp(-dpx / (sz * 2.5));
            Ef += uKSpark * dotv * (0.25 + 3.0 * tw) * (1.0 + 2.0 * rp) * (0.4 + 0.6 * reachL) * min(uFloor, 1.5);
        }
        E = mix(E, E + Ef, smoothstep(0.0, 1.0, dy * pxH / (8.0 * uPx)));
    } else {
        float cs = 0.08;
        vec2 g = vec2(x, y) / cs;
        vec2 gi = floor(g);
        float hs = h21(gi + 41.7);
        vec2 cp = gi + 0.15 + 0.7 * vec2(h21(gi + 1.3), h21(gi + 6.1));
        vec2 cw = cp * cs;
        if (hs < uSpecks * 0.023 && abs(cw.x) > 0.16 && cw.y > yH + 0.06) {
            float dpx = length(g - cp) * cs * pxH;
            float sz = 0.8 * uPx;
            float tw = 0.5 + 0.5 * sin(TAU * 2.0 * t / 6.0 + hs * 53.0);
            E += uKSpeck * exp(-sq(dpx / sz)) * (0.6 + 0.8 * h21(gi + 9.9)) * (0.4 + 0.6 * tw);
        }
    }

    vec3 col = uBg + (vec3(1.0) - uBg) * (vec3(1.0) - exp(-E));
    outColor = vec4(finish(col), 1.0);
}`

// ---------------------------------------------------------------- props

const energy = (v: number) => -Math.log(Math.max(1e-3, 1 - Math.min(v, 0.97)))
const energyOf = (c: RGB, gain = 1): RGB => [energy(c[0]) * gain, energy(c[1]) * gain, energy(c[2]) * gain]
function chromaOf(c: RGB, k = 1, gain = 1): RGB {
    const e = energyOf(c)
    const m = Math.max(e[0], e[1], e[2], 1e-3)
    return [Math.pow(e[0] / m, k) * gain, Math.pow(e[1] / m, k) * gain, Math.pow(e[2] / m, k) * gain]
}
const mixRGB = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

interface Config {
    placement: Placement
    zoom: number
    surge: boolean
    speed: number
    hover: number
    hoverSpeed: number
    vecs: [UName, RGB][]
    floats: [UName, number][]
}

function resolve(p: ZirconTorrentProps): Config {
    const legacy = (p.advanced as { hover?: number } | undefined)?.hover
    const a = { ...DEFAULT_ADVANCED, ...(p.advanced ?? {}) }
    const base = parseColor(p.baseColor ?? DEFAULTS.baseColor, [0.31, 0.6, 0.82])
    const accent = parseColor(p.accentColor ?? DEFAULTS.accentColor, [0.84, 0.95, 0.97])
    const contrast = num(a.strandContrast, 75, 0, 100) / 100
    const dashLen = num(a.dashLength, 30, 2, 95) / 100
    const dashBoost = num(a.dashBoost, 90, 0, 400) / 100
    const strandMean = (1 + (0.25 + 3 / 7 - 1) * contrast) * (0.55 + dashBoost * Math.max(0.01, 0.675 * dashLen - 0.025))
    const dir = { ...DEFAULT_DIRECTION, ...(p.direction ?? {}) }
    const beam = num(p.scale, DEFAULTS.scale, 10, 300) / 100
    const sheath = num(a.sheathWidth, 72, 20, 400) / 2000
    const flare = num(a.flare, 100, 0, 300) / 100
    const reach = beam * Math.max(0.45, sheath * (0.8 + 1.85 * flare) * 2.6 + 0.08) + 0.06
    return {
        placement: { ...DEFAULT_PLACEMENT, ...(p.placement ?? {}) },
        zoom: num(p.zoom, DEFAULTS.zoom, 30, 100) / 100,
        surge: p.surge ?? DEFAULTS.surge,
        speed: num(p.speed, DEFAULTS.speed, 0, 100),
        hover: num(p.hover ?? legacy, DEFAULTS.hover, 0, 100) / 50,
        hoverSpeed: num(p.hoverSpeed, DEFAULTS.hoverSpeed, 0, 300) / 100,
        vecs: [
            ["uBg", parseColor(p.background ?? DEFAULTS.background, [0, 0.004, 0.02])],
            ["uKBlue", chromaOf(base, 1.15)],
            ["uKPale", chromaOf(mixRGB(base, accent, 0.5))],
            ["uKHalo", chromaOf(base, 3.5)],
            ["uKCore", mixRGB([1, 1, 1], chromaOf(accent), 0.25)],
            ["uKBloom", chromaOf(parseColor(a.bloomColor, [0.5, 0.72, 1]))],
            ["uKHorizon", chromaOf(parseColor(a.horizonColor, [0.81, 0.89, 1]), 1, 1.5)],
            ["uKCaustic", chromaOf(parseColor(a.causticColor, [0.33, 0.59, 0.83]))],
            ["uKCausticDeep", chromaOf(parseColor(a.causticColor, [0.33, 0.59, 0.83]), 1.5)],
            ["uKStreak", chromaOf(mixRGB(base, accent, 0.2), 1, 0.9)],
            ["uKSpark", chromaOf(parseColor(a.sparkleColor, [0.62, 0.89, 1]))],
            ["uKSpeck", chromaOf(mixRGB(base, accent, 0.5), 1, 0.6)],
            ["uEFloorTop", energyOf(parseColor(a.floorTop, [0.04, 0.1, 0.23]))],
            ["uEFloorDeep", energyOf(parseColor(a.floorDeep, [0.01, 0.02, 0.06]))],
        ],
        floats: [
            ["uScale", beam],
            ["uHoverAmt", num(p.hover ?? legacy, DEFAULTS.hover, 0, 100) / 50],
            ["uStrands", num(p.strands, DEFAULTS.strands, 50, 400) / 16],
            ["uStrandMean", strandMean],
            ["uFlowDir", dir.flow === "up" ? -1 : 1],
            ["uRippleDir", dir.ripple === "toward" ? -1 : 1],
            ["uStreakDir", dir.streaks === "toward" ? -1 : 1],
            ["uColReach", reach],
            ["uGlow", num(p.glow, DEFAULTS.glow, 0, 100) / 70],
            ["uFloor", num(p.floor, DEFAULTS.floor, 0, 100) / 60],
            ["uHorizon", 1 - num(a.horizon, 73, 40, 95) / 100],
            ["uCoreW", num(a.coreWidth, 25, 2, 200) / 2000],
            ["uSheathW", sheath],
            ["uFlare", flare],
            ["uLine", num(a.lineWidth, 100, 20, 500) / 100],
            ["uContrast", contrast],
            ["uDashLen", dashLen],
            ["uDashBoost", dashBoost],
            ["uFlow", Math.round(num(a.flowCycles, 4, 1, 12))],
            ["uSway", num(a.sway, 15, 0, 25) / 100],
            ["uBreathe", num(a.breathe, 10, 0, 50) / 100],
            ["uBloomW", num(a.bloomWidth, 300, 50, 600) / 2000],
            ["uCausticScale", num(a.causticScale, 80, 25, 400) / 100],
            ["uRipple", num(a.ripple, 100, 0, 300) / 100],
            ["uStreaks", num(a.streakCount, 12, 2, 40)],
            ["uStreakOp", num(a.streakOpacity, 70, 0, 100) / 100],
            ["uReflect", num(a.reflection, 100, 0, 200) / 100],
            ["uSparkles", num(a.sparkles, 12, 0, 50)],
            ["uSpecks", num(a.specks, 10, 0, 40)],
            ["uLift", num(a.lift, 100, 0, 200) / 100],
            ["uLean", num(a.lean, 0, 0, 60) / 1000],
            ["uGrain", num(a.grain, 20, 0, 100) / 100],
            ["uVignette", num(a.vignette, 0, 0, 100) / 100],
        ],
    }
}

function sameProps(a: ZirconTorrentProps, b: ZirconTorrentProps): boolean {
    const ka = Object.keys(a) as (keyof ZirconTorrentProps)[]
    if (ka.length !== Object.keys(b).length) return false
    for (const k of ka) {
        const x = a[k]
        const y = b[k]
        if (x === y) continue
        if (k === "style" || !x || !y || typeof x !== "object" || typeof y !== "object") return false
        const ox = x as Record<string, unknown>
        const oy = y as Record<string, unknown>
        const kx = Object.keys(ox)
        if (kx.length !== Object.keys(oy).length) return false
        for (const kk of kx) if (ox[kk] !== oy[kk]) return false
    }
    return true
}

const UNIFORMS = [
    "uRes", "uUnit", "uPx", "uPlaceA", "uPlaceB", "uZoom", "uTime", "uMouse", "uHover", "uSurge", "uSteer", "uSwing", "uBg",
    "uKBlue", "uKPale", "uKHalo", "uKCore", "uKBloom", "uKHorizon", "uKCaustic", "uKCausticDeep", "uKStreak", "uKSpark",
    "uKSpeck", "uEFloorTop", "uEFloorDeep", "uScale", "uHoverAmt", "uStrands",
    "uStrandMean", "uFlowDir", "uRippleDir", "uStreakDir", "uColReach", "uGlow", "uFloor", "uHorizon", "uCoreW", "uSheathW", "uFlare", "uLine", "uContrast",
    "uDashLen", "uDashBoost", "uFlow", "uSway", "uBreathe", "uBloomW", "uCausticScale", "uRipple",
    "uStreaks", "uStreakOp", "uReflect", "uSparkles", "uSpecks", "uLift", "uLean", "uGrain", "uVignette",
] as const
type UName = (typeof UNIFORMS)[number]

// ---------------------------------------------------------------- component

function __OriginkitBase_ZirconTorrent(props: ZirconTorrentProps) {
    const { background = DEFAULTS.background, style } = props
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const propsRef = useRef(props)
    const cfgRef = useRef<Config | null>(null)
    const wakeRef = useRef<(() => void) | null>(null)
    if (!cfgRef.current) cfgRef.current = resolve(props)
    if (!sameProps(propsRef.current, props)) {
        propsRef.current = props
        cfgRef.current = resolve(props)
        wakeRef.current?.()
    }

    useEffect(() => {
        const root = rootRef.current
        const canvas = canvasRef.current
        if (!root || !canvas) return
        const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

        let gl: WebGL2RenderingContext | null = null
        let loc = {} as Record<UName, WebGLUniformLocation | null>
        const cache = new Float64Array(UNIFORMS.length * 4)
        const idx = {} as Record<UName, number>
        UNIFORMS.forEach((n, i) => (idx[n] = i * 4))
        const surgeBuf = new Float32Array(MAX_SURGES * 4)

        const f1 = (n: UName, a: number) => {
            const i = idx[n]
            if (cache[i] === a) return
            cache[i] = a
            gl!.uniform1f(loc[n], a)
        }
        const f2 = (n: UName, a: number, b: number) => {
            const i = idx[n]
            if (cache[i] === a && cache[i + 1] === b) return
            cache[i] = a
            cache[i + 1] = b
            gl!.uniform2f(loc[n], a, b)
        }
        const f3 = (n: UName, c: RGB) => {
            const i = idx[n]
            if (cache[i] === c[0] && cache[i + 1] === c[1] && cache[i + 2] === c[2]) return
            cache[i] = c[0]
            cache[i + 1] = c[1]
            cache[i + 2] = c[2]
            gl!.uniform3f(loc[n], c[0], c[1], c[2])
        }
        const f4 = (n: UName, a: number, b: number, c: number, d: number) => {
            const i = idx[n]
            if (cache[i] === a && cache[i + 1] === b && cache[i + 2] === c && cache[i + 3] === d) return
            cache[i] = a
            cache[i + 1] = b
            cache[i + 2] = c
            cache[i + 3] = d
            gl!.uniform4f(loc[n], a, b, c, d)
        }

        const init = (): boolean => {
            gl = canvas.getContext("webgl2", {
                alpha: false,
                antialias: false,
                depth: false,
                stencil: false,
                powerPreference: "low-power",
                preserveDrawingBuffer: false,
            })
            if (!gl) return false
            const sh = (type: number, src: string) => {
                const s = gl!.createShader(type)!
                gl!.shaderSource(s, src)
                gl!.compileShader(s)
                if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS) && !gl!.isContextLost())
                    console.error("ZirconTorrent shader:", gl!.getShaderInfoLog(s))
                return s
            }
            const prog = gl.createProgram()!
            const vs = sh(gl.VERTEX_SHADER, VERT)
            const fs = sh(gl.FRAGMENT_SHADER, FRAG)
            gl.attachShader(prog, vs)
            gl.attachShader(prog, fs)
            gl.linkProgram(prog)
            gl.deleteShader(vs)
            gl.deleteShader(fs)
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                if (!gl.isContextLost()) console.error("ZirconTorrent link:", gl.getProgramInfoLog(prog))
                gl = null
                return false
            }
            gl.useProgram(prog)
            const buf = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, buf)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
            const a = gl.getAttribLocation(prog, "aPos")
            gl.enableVertexAttribArray(a)
            gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
            loc = {} as Record<UName, WebGLUniformLocation | null>
            for (const n of UNIFORMS) loc[n] = gl.getUniformLocation(prog, n === "uSurge" ? "uSurge[0]" : n)
            cache.fill(NaN)
            return true
        }

        // ---------------- size
        let W = 0
        let H = 0
        let shown = 1
        let level = 0
        let wantW = 0
        let wantH = 0
        const measureShown = () => {
            const r = root.getBoundingClientRect()
            if (W > 0 && r.width > 0) {
                const s = r.width / W
                if (Math.abs(s - shown) / shown > 0.05) shown = s
            }
        }
        const request = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            let k = dpr * Math.min(2, Math.max(1, shown)) * LADDER[level]
            const px = W * H * k * k
            if (px > PIXEL_BUDGET) k *= Math.sqrt(PIXEL_BUDGET / px)
            wantW = Math.max(1, Math.round(W * k))
            wantH = Math.max(1, Math.round(H * k))
        }
        const ro = new ResizeObserver((entries) => {
            const r = entries[0].contentRect
            W = r.width
            H = r.height
            measureShown()
            request()
            dirty = true
            wake()
        })
        ro.observe(root)

        // ---------------- visibility
        let visible = true
        const io = new IntersectionObserver((e) => {
            visible = e[e.length - 1].isIntersecting
            if (visible) wake()
        })
        io.observe(root)
        const onVis = () => {
            if (!document.hidden) wake()
        }
        document.addEventListener("visibilitychange", onVis)

        // ---------------- pointer
        let cx = 0
        let cy = 0
        let moved = false
        let over = false
        let tu = 0.5
        let tv = 0.5
        let mu = 0.5
        let mv = 0.5
        let vu = 0
        let vv = 0
        let hov = 0
        let scrolled = false
        const taps: { u: number; v: number; age: number }[] = []
        let sx = 0
        let svx = 0
        let steerT = 0
        let rush = 0

        const onMove = (e: PointerEvent) => {
            if (e.clientX === cx && e.clientY === cy && over) return
            cx = e.clientX
            cy = e.clientY
            moved = true
            if (!over) {
                over = true
                snapNext = hov < 0.02
            }
            wake()
        }
        let snapNext = true
        const onLeave = () => {
            over = false
            wake()
        }
        const onDown = (e: PointerEvent) => {
            onMove(e)
            if (e.pointerType !== "mouse") snapNext = true
            if (!cfgRef.current!.surge) return
            const r = root.getBoundingClientRect()
            if (r.width <= 0 || r.height <= 0) return
            if (taps.length >= MAX_SURGES) taps.shift()
            taps.push({ u: (e.clientX - r.left) / r.width, v: (e.clientY - r.top) / r.height, age: 0 })
            wake()
        }
        const onUp = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") onLeave()
        }
        const onScroll = () => {
            if (over) {
                scrolled = true
                wake()
            }
        }

        // Window-level tracking so mouse movement over overlaid content still swings the torrent
        const onWindowPointer = (e: PointerEvent) => {
            const r = root.getBoundingClientRect()
            if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
                onMove(e)
            } else if (over) {
                onLeave()
            }
        }

        root.addEventListener("pointermove", onMove)
        root.addEventListener("pointerdown", onDown)
        root.addEventListener("pointerup", onUp)
        root.addEventListener("pointercancel", onLeave)
        root.addEventListener("pointerleave", onLeave)
        window.addEventListener("pointermove", onWindowPointer, { passive: true })
        window.addEventListener("scroll", onScroll, { passive: true, capture: true })

        // ---------------- loop
        let raf = 0
        let running = false
        let lost = false
        let dirty = true
        let clock = 0
        let lastTick = -1
        let lastDraw = -1
        const gaps = new Float64Array(15)
        let gapN = 0
        const sortBuf = new Float64Array(20)
        let cadence = 1000 / 60
        let every = 1
        let everyFloor = 1
        let lateEma = 0
        let drawnTotal = 0
        const drawGaps = new Float64Array(20)
        let drawN = 0
        let slowFor = 0
        let goodFor = 0
        let probe: { from: number; base: number; t: number } | null = null
        let banUntil = 0
        let climbBanUntil = 0
        let climbBan = 30000

        const median = (src: Float64Array, n: number) => {
            const m = Math.min(n, src.length)
            for (let i = 0; i < m; i++) sortBuf[i] = src[i]
            const s = sortBuf.subarray(0, m).sort()
            return s[m >> 1]
        }

        const wake = () => {
            if (running || lost || !gl || !visible || document.hidden) return
            running = true
            lastTick = -1
            raf = requestAnimationFrame(tick)
        }
        wakeRef.current = () => {
            dirty = true
            wake()
        }

        const uploadStatic = (c: Config) => {
            for (let i = 0; i < c.vecs.length; i++) f3(c.vecs[i][0], c.vecs[i][1])
            for (let i = 0; i < c.floats.length; i++) f1(c.floats[i][0], c.floats[i][1])
            f1("uZoom", c.zoom)
        }

        const draw = () => {
            const g = gl!
            if (canvas.width !== wantW || canvas.height !== wantH) {
                canvas.width = wantW
                canvas.height = wantH
            }
            const bw = canvas.width
            const bh = canvas.height
            const c = cfgRef.current!
            uploadStatic(c)
            const k = W > 0 ? bw / W : 1
            const S = Math.min(H, W / REF_ASPECT)
            const pl = c.placement
            const ang = (num(pl.angle, 0, -180, 180) * Math.PI) / 180
            const tilt = (num(pl.tilt, 0, -60, 60) * Math.PI) / 180
            g.viewport(0, 0, bw, bh)
            f2("uRes", bw, bh)
            f1("uUnit", S * k)
            f1("uPx", k)
            f4(
                "uPlaceA",
                S > 0 ? ((num(pl.x, 0, -50, 50) / 100) * W) / S : 0,
                S > 0 ? (-(num(pl.y, 0, -50, 50) / 100) * H) / S : 0,
                Math.cos(ang),
                Math.sin(ang),
            )
            f4("uPlaceB", Math.cos(tilt), Math.sin(tilt), PERSPECTIVE, 0)
            f1("uTime", clock)
            f2("uMouse", mu * bw, (1 - mv) * bh)
            f1("uHover", hov)
            for (let i = 0; i < MAX_SURGES; i++) {
                const tp = taps[i]
                surgeBuf[i * 4] = tp ? tp.u * bw : 0
                surgeBuf[i * 4 + 1] = tp ? (1 - tp.v) * bh : 0
                surgeBuf[i * 4 + 2] = tp ? tp.age : 0
                surgeBuf[i * 4 + 3] = tp ? 1 : 0
            }
            g.uniform4fv(loc.uSurge, surgeBuf)
            f1("uSteer", sx)
            f1("uSwing", Math.max(-1.5, Math.min(1.5, svx)))
            g.drawArrays(g.TRIANGLES, 0, 3)
        }

        const spring = (dt: number) => {
            const w = 5.8 / FOLLOW_S
            let n = Math.ceil(dt / 0.004)
            const h = dt / Math.max(1, n)
            while (n-- > 0) {
                vu += (w * w * (tu - mu) - 2 * w * vu) * h
                vv += (w * w * (tv - mv) - 2 * w * vv) * h
                mu += vu * h
                mv += vv * h
            }
            if (Math.abs(tu - mu) < 1e-4 && Math.abs(tv - mv) < 1e-4 && Math.abs(vu) < 1e-3 && Math.abs(vv) < 1e-3) {
                mu = tu
                mv = tv
                vu = vv = 0
            }
        }
        const ease = (x: number, to: number, dt: number, T: number) => {
            const y = x + (to - x) * (1 - Math.exp((-dt * 4.6) / T))
            return Math.abs(to - y) < 0.004 ? to : y
        }

        const ladder = (now: number, gap: number) => {
            const usual = drawN >= 20 ? median(drawGaps, drawN) : 0
            if (++drawnTotal > 90 && usual > 0) lateEma += ((gap > usual * 1.6 ? 1 : 0) - lateEma) * 0.015
            if (lateEma > 0.02) {
                if (usual < 15.5 && (usual * (every + 1)) / every < 21) {
                    everyFloor = every + 1
                    every = everyFloor
                } else if (level < LADDER.length - 1 && now > banUntil) {
                    level++
                    climbBanUntil = now + climbBan
                    climbBan = Math.min(climbBan * 2, 240000)
                    request()
                }
                lateEma = 0
                drawN = 0
                return
            }
            drawGaps[drawN++ % drawGaps.length] = gap
            if (drawN < 30) return
            const target = every * cadence
            const med = median(drawGaps, drawN)
            const late = med > Math.min(Math.max(target * 1.3, 16), 33.4 * 1.3) && med > target + 4
            if (probe) {
                if (now - probe.t > 1500) {
                    if (med > probe.base * 0.87) {
                        level = probe.from
                        banUntil = now + 30000
                        request()
                    } else {
                        climbBanUntil = now + climbBan
                        climbBan = Math.min(climbBan * 2, 240000)
                    }
                    probe = null
                }
                return
            }
            if (late) {
                goodFor = 0
                slowFor += gap
                if (slowFor > 500 && level < LADDER.length - 1 && now > banUntil) {
                    probe = { from: level, base: med, t: now }
                    level++
                    slowFor = 0
                    drawN = 0
                    request()
                }
            } else {
                slowFor = 0
                goodFor += gap
                if (goodFor > 8000 && level > 0 && now > climbBanUntil) {
                    level--
                    goodFor = 0
                    drawN = 0
                    climbBanUntil = now + 3000
                    request()
                }
            }
        }

        const tick = (now: number) => {
            raf = 0
            if (!gl || lost || !visible || document.hidden) {
                running = false
                return
            }
            if (lastTick >= 0) {
                const gp = now - lastTick
                if (gp > 0 && gp < 100) gaps[gapN++ % gaps.length] = gp
                if (gapN >= 5) {
                    cadence = Math.min(50, Math.max(4, median(gaps, gapN)))
                    const x = 16.7 / cadence
                    if (x < every - 0.1 || x >= every + 1.1) every = Math.max(1, Math.floor(x + 0.1))
                    every = Math.max(every, everyFloor)
                }
            }
            lastTick = now
            const c = cfgRef.current!
            const flowing = c.speed > 0 && !reduced
            const springing = mu !== tu || mv !== tv || hov !== (over ? 1 : 0)
            const surging = taps.length > 0 || sx !== steerT || svx !== 0 || rush !== (over ? 1 : 0)
            if (!dirty && !flowing && !springing && !surging && !moved && !scrolled) {
                running = false
                lastDraw = -1
                return
            }
            raf = requestAnimationFrame(tick)
            if (lastDraw >= 0 && now - lastDraw < (every - 0.5) * cadence) return
            const dt = lastDraw < 0 ? 1 / 60 : Math.min(0.1, (now - lastDraw) / 1000)
            if (lastDraw >= 0) ladder(now, now - lastDraw)
            lastDraw = now

            if (moved || scrolled) {
                const r = root.getBoundingClientRect()
                if (r.width > 0 && r.height > 0) {
                    tu = (cx - r.left) / r.width
                    tv = (cy - r.top) / r.height
                    if (W > 0) {
                        const s = r.width / W
                        if (Math.abs(s - shown) / shown > 0.05) {
                            shown = s
                            request()
                        }
                    }
                }
                if (snapNext) {
                    mu = tu
                    mv = tv
                    vu = vv = 0
                    snapNext = false
                }
                moved = scrolled = false
            }
            spring(dt)
            hov = ease(hov, over ? 1 : 0, dt, FOLLOW_S * 2)
            const Sc = Math.min(H, W / REF_ASPECT)
            const plX = Sc > 0 ? ((num(c.placement.x, 0, -50, 50) / 100) * W) / Sc : 0
            steerT =
                over && Sc > 0
                    ? Math.max(-0.9, Math.min(0.9, (((mu - 0.5) * W) / Sc - plX) / c.zoom)) * Math.min(1, c.hover)
                    : 0
            const sw = SWING_W * Math.max(0.6, Math.min(1.4, c.hover))
            let sn = Math.ceil(dt / 0.004)
            const sh = dt / Math.max(1, sn)
            while (sn-- > 0) {
                svx += (sw * sw * (steerT - sx) - 2 * SWING_Z * sw * svx) * sh
                sx += svx * sh
            }
            if (Math.abs(steerT - sx) < 1e-4 && Math.abs(svx) < 1e-3) {
                sx = steerT
                svx = 0
            }
            rush = ease(rush, over ? 1 : 0, dt, RUSH_S)
            if (flowing) clock = (clock + dt * (c.speed / 50) * (1 + c.hoverSpeed * rush)) % 3600
            for (let i = taps.length - 1; i >= 0; i--) {
                taps[i].age += dt
                if (taps[i].age > SURGE_LIFE) taps.splice(i, 1)
            }
            dirty = false
            draw()
        }

        const onLost = (e: Event) => {
            e.preventDefault()
            lost = true
            if (raf) cancelAnimationFrame(raf)
            raf = 0
            running = false
        }
        const onRestored = () => {
            lost = false
            if (init()) {
                dirty = true
                wake()
            }
        }
        canvas.addEventListener("webglcontextlost", onLost)
        canvas.addEventListener("webglcontextrestored", onRestored)

        if (init()) wake()

        return () => {
            if (raf) cancelAnimationFrame(raf)
            running = false
            wakeRef.current = null
            ro.disconnect()
            io.disconnect()
            document.removeEventListener("visibilitychange", onVis)
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerdown", onDown)
            root.removeEventListener("pointerup", onUp)
            root.removeEventListener("pointercancel", onLeave)
            root.removeEventListener("pointerleave", onLeave)
            window.removeEventListener("pointermove", onWindowPointer)
            window.removeEventListener("scroll", onScroll, { capture: true })
            canvas.removeEventListener("webglcontextlost", onLost)
            canvas.removeEventListener("webglcontextrestored", onRestored)
        }
    }, [])

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background,
                touchAction: "pan-y",
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
            />
        </div>
    )
}

const __originkitPresetProps = {
  "accentColor": "#9C9BCC",
  "glow": 29,
  "floor": 71,
  "zoom": 69,
  "hoverSpeed": 134
};

export default function ZirconTorrent(props: Record<string, unknown>) {
  return <__OriginkitBase_ZirconTorrent {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}
