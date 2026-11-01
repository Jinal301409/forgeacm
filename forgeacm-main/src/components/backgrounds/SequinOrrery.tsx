/* eslint-disable */
// Sequin Orrery — Originkit

"use client"

import React, { useEffect, useRef, type CSSProperties } from "react"

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

/* -------------------------------------------------------------------------
 * SequinOrrery
 *
 * A tilted disk of dotted light chains circling a dark eye at the upper
 * left, seen through a steep perspective: tight ellipses of white, red and
 * orange beads near the eye, flattening into a bright blue → white → peach →
 * red → brick band low in the frame, with a navy river of soft bokeh and
 * horizontal streaks before the horizon. The chains orbit (inner rings
 * faster), lone dots twinkle, the bokeh drifts.
 * ---------------------------------------------------------------------- */

const REF_W = 1200
const REF_H = 800
const REF_ASPECT = REF_W / REF_H

const PARALLAX = 0.06
const LEAN = 0.45
const NEAR_REACH = 0.29
const STIR_GAIN = 3.5
const STIR_DECAY = 2.2

const LENS = 0.3
const SWIRL = 0.45

const PULSE_SPEED = 0.8
const PULSE_W = 0.04
const PULSE_LIFE = 1.4

const PITCH_MIN = 0.0045
const PITCH_MAX = 0.009

const GRAIN_PX = 1
const PIX_BUDGET = 4.2e6
const DENSITY_CAP = 1.5
const AUTO_LEVELS = [1, 0.85, 0.72, 0.6]
const GPU_BUDGET = 15

const BAND_STOPS: [number, number, number, number][] = [
    [0.0, 8, 16, 34], [0.1, 10, 24, 50], [0.19, 12, 30, 62], [0.23, 29, 46, 81], [0.27, 23, 41, 67], [0.31, 13, 25, 45],
    [0.37, 11, 25, 47], [0.45, 10, 21, 35], [0.55, 10, 18, 28], [0.63, 10, 20, 32], [0.67, 24, 41, 74], [0.71, 34, 59, 105],
    [0.79, 48, 83, 147], [0.87, 68, 102, 162], [0.95, 84, 119, 179], [1.03, 121, 153, 201], [1.11, 123, 153, 200],
    [1.19, 151, 177, 216], [1.23, 217, 229, 243], [1.29, 217, 226, 241], [1.35, 251, 251, 252], [1.41, 249, 240, 236],
    [1.47, 240, 199, 192], [1.53, 244, 208, 178], [1.59, 229, 204, 214], [1.65, 209, 131, 110], [1.71, 212, 94, 56],
    [1.77, 195, 91, 70], [1.85, 194, 113, 92], [1.93, 169, 64, 58], [2.01, 150, 35, 30], [2.09, 164, 54, 40],
    [2.19, 123, 31, 30], [2.31, 118, 29, 34], [2.45, 154, 39, 31], [2.61, 126, 31, 27], [2.75, 84, 28, 37],
    [2.91, 98, 22, 18], [3.05, 52, 14, 16], [3.21, 56, 23, 34], [3.41, 51, 28, 51], [3.61, 44, 25, 49], [3.85, 49, 14, 22],
    [4.09, 44, 13, 20], [4.41, 37, 11, 10], [4.75, 27, 12, 11], [5.3, 21, 12, 14], [5.95, 12, 12, 17], [6.65, 13, 13, 20],
    [7.5, 12, 15, 26], [8.5, 12, 19, 39], [9.75, 12, 20, 41], [11.25, 11, 19, 39], [13.0, 11, 17, 29], [15.5, 11, 14, 21],
    [19.0, 8, 9, 10], [23.5, 7, 8, 8], [26.0, 6, 7, 7],
]
const LUT_RMAX = 26
const LUT_N = 512

export interface SequinOrreryAdvanced {
    centerX: number
    centerY: number
    horizon: number
    roll: number
    rings: number
    particles: number
    innerTurns: number
    loopS: number
    dotSize: number
    lineWidth: number
    glow: number
    ambient: number
    dotted: number
    redRings: number
    whiteRings: number
    stars: number
    twinkle: number
    bokeh: number
    bokehSize: number
    bokehTurns: number
    coreColor: string
    exposure: number
    grain: number
    vignette: number
    hover: number
}

const DEFAULT_ADVANCED: SequinOrreryAdvanced = {
    centerX: -20,
    centerY: 36,
    horizon: 160,
    roll: 11.4,
    rings: 59,
    particles: 4,
    innerTurns: 9,
    loopS: 40,
    dotSize: 1.8,
    lineWidth: 16,
    glow: 48,
    ambient: 100,
    dotted: 80,
    redRings: 34,
    whiteRings: 60,
    stars: 50,
    twinkle: 69,
    bokeh: 58,
    bokehSize: 66,
    bokehTurns: 3,
    coreColor: "#F2F0F0",
    exposure: 100,
    grain: 44,
    vignette: 100,
    hover: 47,
}

export interface SequinOrreryPlacement {
    x: number
    y: number
    angle: number
}

const DEFAULT_PLACEMENT: SequinOrreryPlacement = { x: 0, y: 0, angle: 0 }

export interface SequinOrreryProps {
    background?: string
    baseColor?: string
    accentColor?: string
    density?: number
    tilt?: number
    trail?: number
    scale?: number
    placement?: Partial<SequinOrreryPlacement>
    speed?: number
    advanced?: Partial<SequinOrreryAdvanced>
    style?: CSSProperties
}

/* ---- shaders ----------------------------------------------------------- */

const VERT = `#version 300 es
void main() {
    vec2 c = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
    gl_Position = vec4(c * 4.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform mat2 uM;
uniform vec2 uT;
uniform vec2 uCenter;
uniform float uA;
uniform float uHor;
uniform float uRoll;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseV;
uniform float uHover;
uniform float uHoverK;
uniform float uStir;
uniform float uPulse;
uniform vec2 uPulseP;
uniform float uFill;
uniform float uTrail;
uniform float uRings;
uniform float uMaxP;
uniform float uInner;
uniform float uLoop;
uniform float uDotPx;
uniform float uLine;
uniform float uGlow;
uniform float uAmbient;
uniform float uDotted;
uniform float uRed;
uniform float uWhite;
uniform float uStars;
uniform float uTwinkle;
uniform float uBokeh;
uniform float uBokehSize;
uniform float uBokehTurns;
uniform float uExposure;
uniform float uGrain;
uniform float uVignette;
uniform float uCell;
uniform float uSdev;
uniform vec3 uBg;
uniform vec3 uBase;
uniform vec3 uAccent;
uniform vec3 uCore;
uniform sampler2D uLut;
uniform highp sampler2D uRingT;
uniform float uRingN;
uniform int uPair;
out vec4 outColor;

float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vn1(float x) { float i = floor(x); float f = x - i; f = f * f * (3.0 - 2.0 * f); return mix(h11(i + 0.37), h11(i + 1.37), f); }

vec3 band(float r) { return texture(uLut, vec2(sqrt(clamp(r, 0.0, ${LUT_RMAX}.0) / ${LUT_RMAX}.0), 0.5)).rgb; }

float fillZone(float r) {
    float z = mix(0.7, 0.8, smoothstep(0.42, 0.55, r));
    z = mix(z, 0.75, smoothstep(0.85, 1.05, r));
    z = mix(z, 0.9, smoothstep(1.15, 1.3, r));
    z = mix(z, 0.6, smoothstep(2.6, 3.4, r));
    return mix(z, 0.35, smoothstep(5.0, 7.0, r));
}

vec3 strayColor(float h) {
    if (h < 0.3) return vec3(1.0, 0.3, 0.2);
    if (h < 0.5) return vec3(1.0, 0.7, 0.3);
    if (h < 0.7) return vec3(0.5, 0.8, 1.0);
    if (h < 0.85) return vec3(0.55, 1.0, 0.75);
    return vec3(1.0, 0.55, 0.8);
}

vec3 ringK(float k, float f, float r, float u, vec2 nh, vec2 th, mat2 Ji, float rp, float tt, float near) {
    if (k < 0.0 || k >= uRingN) return vec3(0.0);
    int ik = int(k);
    vec4 t0 = texelFetch(uRingT, ivec2(ik, 0), 0);
    if (t0.x <= 0.0) return vec3(0.0);
    vec4 t1 = texelFetch(uRingT, ivec2(ik, 1), 0);
    vec4 t2 = texelFetch(uRingT, ivec2(ik, 2), 0);
    vec4 t3 = texelFetch(uRingT, ivec2(ik, 3), 0);
    vec4 t4 = texelFetch(uRingT, ivec2(ik, 4), 0);
    float fk = k + 0.5;
    float rk = exp2(fk / uRings - 5.0);

    float K = t0.y;
    float cyc = fract(t0.z * tt / uLoop);
    float ph = t0.w;
    float sK = (u + ph + cyc) * K;
    float sl = floor(sK);
    float fr = sK - sl;
    float Ls = t1.x;
    float cov = 0.0;
    for (int j = 0; j < 3; j++) {
        float sj = mod(sl - float(j), K);
        float hp = 0.1 + 0.8 * h21(vec2(k, sj) + vec2(3.7, 1.9));
        float x = (fr + float(j) - hp) / Ls;
        float on = step(0.0, x) * step(x, 1.0);
        cov = max(cov, on * smoothstep(0.0, 0.12, x) * (1.0 - 0.7 * smoothstep(0.35, 1.0, x)));
    }
    cov *= t4.x;
    vec3 col = t2.rgb;
    float cls = t2.a;
    float dpx = abs(f - fk) * rp;
    vec3 acc = vec3(0.0);

    if (t1.y > 0.0) {
        float D = t1.y;
        float sD = (u + ph + cyc) * D;
        float jd = floor(sD + 0.5);
        vec2 ta = Ji * th;
        float tl = length(ta);
        vec2 ah = ta / max(tl, 1e-6);
        float pitchPx = tl * 6.2832 * rk / D;
        float R0 = uDotPx * t3.x * (1.0 + 0.7 * near);
        float kx = t3.y;
        float dim = t3.z;
        float jm = mod(jd, D);
        uvec2 hq = uvec2(uint(ik + 65536), uint(jm)) * uvec2(1597334677u, 3812015801u);
        uint hn = (hq.x ^ hq.y) * 1597334677u;
        hn ^= hn >> 16; hn *= 0x7feb352du; hn ^= hn >> 15;
        uint hm = hn * 0x846ca68bu; hm ^= hm >> 16;
        float hd = float(hn & 255u) / 255.0;
        float hp2 = float((hn >> 8) & 255u) / 255.0;
        float hj = float((hn >> 16) & 255u) / 255.0;
        float hR = float(hn >> 24) / 255.0;
        float hs = float(hm & 65535u) / 65535.0;
        float m = 8.0 + floor(float(hm >> 16) / 65536.0 * 13.0);
        float single = step(hs, t1.w);
        float onChain = cov * step(hp2, t1.z);
        float lineCov = max(onChain, single * 0.9) * (0.35 + 0.65 * hd) * dim;
        float dots = 0.0;
        vec3 dcol = col;
        float R = R0 * (0.75 + 0.5 * hR);
        vec2 dw = nh * (rk - r) + th * ((jd - sD) / D * 6.2832 * rk);
        vec2 e = Ji * dw;
        float along = dot(e, ah);
        vec2 ac = e - ah * along;
        float q2 = along * along / (kx * kx) + dot(ac, ac);
        if (q2 < 36.0 * R * R && lineCov > 0.0) {
            float tw = mix(1.0, 0.55 + 0.45 * sin(6.2832 * (m * tt / uLoop + hs)), uTwinkle);
            float wgt = max(onChain, single * tw * (0.6 + 0.6 * hd));
            float q = sqrt(q2);
            float disc = 0.7 * (1.0 - smoothstep(R - 0.6, R + 0.6, q)) + 0.3 * exp(-q2 / (R * R * 0.7)) + uGlow * 0.3 * exp(-q / (R * 1.6));
            dots = disc * wgt * (0.35 + 0.65 * hd) * dim;
            float strayP = mix(t3.w, 0.5, single);
            if (hj < strayP) dcol = strayColor(hj / strayP);
            else if (cls == 0.0) dcol = mix(col, vec3(1.0, 0.95, 0.85), step(0.6, hj) * 0.5);
        }
        float Rl = min(R0, max(0.5, rp * 0.45));
        float line = (1.0 - smoothstep(Rl - 0.7, Rl + 0.7, dpx)) * min(1.0, 1.6 * R0 / max(pitchPx, 1e-3)) * lineCov * 0.5;
        float mixL = 1.0 - smoothstep(1.2 * R0, 2.0 * R0, pitchPx);
        acc = mix(dcol * dots, col * line, mixL);
    } else {
        float Rl = min(uLine, max(0.5, rp * 0.45));
        float line = 1.0 - smoothstep(Rl - 0.7, Rl + 0.7, dpx);
        line += uGlow * 0.4 * exp(-dpx / (Rl * 2.5));
        acc = mix(uBase, vec3(0.6, 0.75, 1.0), 0.5) * line * 0.3 * (0.4 + 0.6 * cov / max(t4.x, 1e-3)) * t4.y;
    }
    return acc * t0.x * (1.0 + 1.8 * near);
}

vec3 bokeh(float qx, float d, float r, float u, float A, float tt) {
    vec3 acc = vec3(0.0);
    if (uBokeh <= 0.0) return acc;
    const float Z0 = 0.38;
    const float LH = 0.03;
    float z = r / (A + r / uHor);
    float lf = (z - Z0) / LH;
    if (lf < -1.0 || lf > 9.0) return acc;
    float l0 = floor(lf);
    for (int dl = -1; dl <= 1; dl++) {
        float lane = l0 + float(dl);
        if (lane < 0.0 || lane > 7.0) continue;
        float zm = Z0 + (lane + 0.5) * LH;
        if (zm > uHor * 0.97) continue;
        float dep = (lane + 0.5) / 8.0;
        float rm = zm * A / (1.0 - zm / uHor);
        float N = max(6.0, floor(6.2832 * rm * A / (0.06 * (A + rm / uHor))));
        float nl = max(1.0, floor(uBokehTurns * (0.7 + 0.6 * dep) + 0.5));
        float cyc = fract(nl * tt / uLoop);
        float c0 = floor((u + cyc) * N);
        float laneK = mix(0.6, 1.0, smoothstep(0.0, 2.0, lane)) * (1.0 - 0.5 * step(6.5, lane));
        for (int k = -1; k <= 1; k++) {
            float cc = c0 + float(k);
            vec2 id = vec2(mod(cc, N), lane);
            if (h21(id + vec2(0.37, 5.1)) > uBokeh * 0.65 * laneK) continue;
            float ox = 0.2 + 0.6 * h21(id + vec2(1.3, 7.7));
            float oy = 0.25 + 0.5 * h21(id + vec2(2.9, 3.4));
            float zc = Z0 + (lane + oy) * LH;
            if (zc > uHor * 0.97) continue;
            float rc = zc * A / (1.0 - zc / uHor);
            float th = 6.2832 * ((cc + ox) / N - cyc);
            vec2 Pc = rc * vec2(cos(th), sin(th));
            float dd = A + Pc.y / uHor;
            if (dd < 0.05) continue;
            vec2 qc = vec2(Pc.x * A / dd, Pc.y / dd);
            float rad = (0.003 + 0.007 * dep) * uBokehSize * (0.5 + 0.9 * h21(id + vec2(4.1, 9.2)));
            vec2 dv = vec2((qx - qc.x) / 1.8, d - qc.y) / rad;
            float e = length(dv);
            if (e > 1.6) continue;
            float blur = 0.3 + 0.4 * dep;
            float a = 1.0 - smoothstep(1.0 - blur, 1.0 + blur * 0.35, e);
            float hb = h21(id + vec2(6.6, 2.2));
            vec3 c = vec3(0.5, 0.42, 0.9);
            if (hb < 0.35) c = vec3(1.0, 0.55, 0.22);
            else if (hb < 0.55) c = vec3(0.92, 0.25, 0.16);
            else if (hb < 0.68) c = vec3(1.0, 0.5, 0.62);
            else if (hb < 0.88) c = vec3(0.75, 0.82, 1.0);
            float core = step(0.75, h21(id + vec2(3.3, 6.1))) * exp(-e * e * 6.0) * 0.7;
            acc += c * (a * (0.45 + 0.6 * h21(id + vec2(8.8, 0.9))) + core);
        }
    }
    return acc;
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 s = uM * vec2(frag.x, uRes.y - frag.y) + uT;
    float hk = clamp(uHover * uHoverK, 0.0, 2.0);
    float tt = uTime;

    vec2 md = s - uMouse;
    float near = exp(-dot(md, md) * ${(1 / (NEAR_REACH * NEAR_REACH)).toFixed(3)}) * hk;
    float swirl = near * (${SWIRL.toFixed(3)} + clamp(uStir, -3.0, 3.0) * 0.3);
    float cs = cos(swirl), sn = sin(swirl);
    s = uMouse + mat2(cs, sn, -sn, cs) * md * (1.0 - ${LENS.toFixed(3)} * min(near, 1.0));

    vec2 pd = s - uPulseP;
    float pr = length(pd);
    float pw = (pr - uPulse * ${PULSE_SPEED.toFixed(3)}) / ${PULSE_W.toFixed(3)};
    float wave = exp(-pw * pw) * (1.0 - smoothstep(0.0, ${PULSE_LIFE.toFixed(3)}, uPulse)) * min(uHoverK, 2.0);
    s -= pd / max(pr, 1e-4) * wave * 0.025;

    vec2 c = uCenter + (uMouse - uCenter) * ${PARALLAX.toFixed(4)} * hk;
    float A = max(uA * (1.0 + (0.5 - uMouseV) * ${LEAN.toFixed(4)} * hk), 1.0);
    vec2 pq = s - c;
    float cr = cos(uRoll), sr = sin(uRoll);
    float qx = cr * pq.x - sr * pq.y;
    float d = sr * pq.x + cr * pq.y;
    float den = 1.0 - d / uHor;
    float hz = smoothstep(0.02, 0.12, den);
    float w = 1.0 / max(den, 0.02);
    vec2 P = vec2(qx * w, d * A * w);
    float r = max(length(P), 1e-4);
    float u = atan(P.y, P.x) / 6.2832;
    vec2 nh = P / r;
    vec2 th = vec2(-nh.y, nh.x);
    mat2 J = mat2(dFdx(P), dFdy(P));
    float det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
    mat2 Ji = abs(det) > 1e-12 ? inverse(J) : mat2(0.0);

    float f = (log2(r) + 5.0) * uRings;
    float rp = 1.0 / max(length(vec2(dFdx(f), dFdy(f))), 1e-5);
    float k0 = floor(f);
    float fr = f - k0;
    float k1 = k0 + (fr > 0.5 ? 1.0 : -1.0);

    float dense = 1.0 - smoothstep(0.8, 1.6, rp);
    vec3 lines = vec3(0.0);
    if (dense < 0.999) {
        float reach = max(24.0 * uDotPx, 8.0 * uLine) + 1.5;
        for (int i = 0; i < uPair; i++) {
            float kk = i == 0 ? k0 : k1;
            if (abs(f - (kk + 0.5)) * rp < reach) lines += ringK(kk, f, r, u, nh, th, Ji, rp, tt, near);
        }
    }
    float grp = 0.55 + 0.9 * vn1(f / 7.0);
    vec3 exp_ = mix(vec3(0.96, 0.97, 1.0), vec3(1.0, 0.6, 0.3), smoothstep(1.4, 1.9, r)) * fillZone(r) * uFill * grp * 0.08 * (1.0 - 0.8 * smoothstep(2.3, 4.0, r)) * (1.0 + 1.8 * near);
    lines = mix(lines, exp_, dense);
    lines += uCore * dot(lines, vec3(0.333)) * near * 0.8;
    lines *= 1.0 + 2.5 * wave;

    vec3 amb = band(r) * (1.0 + 0.25 * (P.y / r) * (1.0 - smoothstep(0.8, 1.3, r)));
    vec3 col = amb * uAmbient * hz * (1.0 + 0.35 * near + 0.6 * wave);
    col += lines * hz;
    col += mix(uCore, uAccent, 0.5) * wave * 0.12 * hz;

    float z = r / (A + r / uHor);
    float riverE = smoothstep(0.46, 0.52, z) * (1.0 - 0.88 * smoothstep(0.58, 0.64, z));
    float st = vn1(z * uSdev / (uCell * 3.0) + 11.0) * vn1(z * uSdev / (uCell * 11.0) + 3.0);
    col += vec3(0.1, 0.17, 0.42) * st * riverE * 0.55 * hz;
    col += bokeh(qx, d, r, u, A, tt) * 0.9 * hz;
    col = mix(uBg, col, hz);

    float skyK = (1.0 - hz) * smoothstep(uHor, uHor + 0.18, d);
    if (skyK > 0.0) {
        float cellPx = uCell * 22.0;
        vec2 sp = frag / cellPx;
        vec2 sc0 = floor(sp);
        if (h21(sc0 + vec2(0.71, 4.3)) < 0.3) {
            vec2 o = 0.15 + 0.7 * vec2(h21(sc0 + vec2(3.1, 8.2)), h21(sc0 + vec2(7.9, 2.6)));
            float sdp = length(sp - sc0 - o) * cellPx;
            float srad = max((0.45 + 0.9 * h21(sc0 + vec2(1.7, 6.6))) * uCell, 0.5);
            float hcs = h21(sc0 + vec2(2.3, 9.7));
            vec3 scol = hcs < 0.12 ? vec3(1.0, 0.35, 0.25) : hcs < 0.2 ? vec3(1.0, 0.65, 0.3) : hcs < 0.3 ? vec3(0.6, 0.8, 1.0) : vec3(1.0);
            col += scol * exp(-sdp * sdp / (srad * srad)) * (0.35 + 0.55 * h21(sc0 + vec2(8.3, 1.1))) * skyK;
        }
    }

    col *= uExposure;
    vec2 vv = frag / uRes - 0.5;
    col *= 1.0 - uVignette * smoothstep(0.25, 0.75, length(vv * vec2(1.0, 0.9)));
    vec2 gc = floor(frag / uCell);
    float g = h21(gc + fract(uTime * 7.3) * vec2(113.1, 71.7)) - 0.5;
    col += g * uGrain * 0.15;
    outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`

/* ---- helpers ----------------------------------------------------------- */

type RGB = [number, number, number]

const colorCache = new Map<string, RGB>()
function parseColor(c: unknown, fb: RGB): RGB {
    if (typeof c !== "string") return fb
    const hit = colorCache.get(c)
    if (hit) return hit
    let s = c.trim()
    const v = /^var\(\s*--[^,]+,\s*(.+)\)$/.exec(s)
    if (v) s = v[1].trim()
    let out: RGB | null = null
    const hex = s.match(/#([0-9a-f]{3,8})\b/i)
    if (hex) {
        let h = hex[1]
        if (h.length === 3 || h.length === 4)
            h = h
                .split("")
                .map((x) => x + x)
                .join("")
        if (h.length >= 6) out = [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]
    }
    if (!out) {
        const m = /^(rgba?|hsla?)\(([^)]*)\)$/i.exec(s)
        if (m) {
            const parts = m[2].split(/[\s,/]+/).filter(Boolean)
            const num = (p: string, scale: number) => (p.endsWith("%") ? (parseFloat(p) / 100) * scale : parseFloat(p))
            if (parts.length >= 3) {
                if (m[1].toLowerCase().startsWith("rgb")) {
                    out = [num(parts[0], 255) / 255, num(parts[1], 255) / 255, num(parts[2], 255) / 255]
                } else {
                    const hh = (((parseFloat(parts[0]) % 360) + 360) % 360) / 360
                    const ss = num(parts[1], 1), ll = num(parts[2], 1)
                    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss
                    const p = 2 * ll - q
                    const f = (t: number) => {
                        t = (t + 1) % 1
                        if (t < 1 / 6) return p + (q - p) * 6 * t
                        if (t < 1 / 2) return q
                        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
                        return p
                    }
                    out = [f(hh + 1 / 3), f(hh), f(hh - 1 / 3)]
                }
            }
        }
    }
    if (!out || !out.every((x) => isFinite(x))) return fb
    out = out.map((x) => Math.min(1, Math.max(0, x))) as RGB
    if (colorCache.size > 64) colorCache.clear()
    colorCache.set(c, out)
    return out
}

function num(v: unknown, fb: number): number {
    const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN
    return isFinite(n) ? n : fb
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)

const DEF_BASE: RGB = [0x4e / 255, 0x74 / 255, 0xd4 / 255]
const DEF_ACCENT: RGB = [0xe0 / 255, 0x55 / 255, 0x2c / 255]
const DEF_CORE: RGB = [0xf2 / 255, 0xf0 / 255, 0xf0 / 255]

function decompose(c: RGB): number[] {
    const cols = [DEF_BASE, DEF_CORE, DEF_ACCENT]
    let active = [0, 1, 2]
    let w = [0, 0, 0]
    for (let iter = 0; iter < 4; iter++) {
        const n = active.length
        const G: number[][] = []
        const b: number[] = []
        for (let i = 0; i < n; i++) {
            G.push([])
            let bi = 0
            for (let j = 0; j < n; j++) {
                let g = 0
                for (let k = 0; k < 3; k++) g += cols[active[i]][k] * cols[active[j]][k]
                G[i].push(g)
            }
            for (let k = 0; k < 3; k++) bi += cols[active[i]][k] * c[k]
            b.push(bi)
        }
        const x = b.slice()
        const M = G.map((r) => r.slice())
        for (let i = 0; i < n; i++) {
            const piv = M[i][i] || 1e-9
            for (let r = i + 1; r < n; r++) {
                const fct = M[r][i] / piv
                for (let cc = i; cc < n; cc++) M[r][cc] -= fct * M[i][cc]
                x[r] -= fct * x[i]
            }
        }
        for (let i = n - 1; i >= 0; i--) {
            let s = x[i]
            for (let cc = i + 1; cc < n; cc++) s -= M[i][cc] * x[cc]
            x[i] = s / (M[i][i] || 1e-9)
        }
        w = [0, 0, 0]
        active.forEach((a, i) => (w[a] = x[i]))
        const neg = active.filter((a) => w[a] < 0)
        if (neg.length === 0 || active.length === 1) break
        active = active.filter((a) => w[a] >= 0)
        if (active.length === 0) {
            w = [0, 0, 0]
            break
        }
    }
    w = w.map((v) => Math.max(0, v))
    const res: number[] = []
    for (let k = 0; k < 3; k++) res.push(c[k] - (w[0] * DEF_BASE[k] + w[1] * DEF_CORE[k] + w[2] * DEF_ACCENT[k]))
    return [w[0], w[1], w[2], res[0], res[1], res[2]]
}

const STOP_DECOMP = BAND_STOPS.map((s) => decompose([s[1] / 255, s[2] / 255, s[3] / 255]))

function buildLut(out: Uint8Array, base: RGB, core: RGB, accent: RGB) {
    let si = 0
    for (let i = 0; i < LUT_N; i++) {
        const t = i / (LUT_N - 1)
        const r = LUT_RMAX * t * t
        while (si < BAND_STOPS.length - 2 && BAND_STOPS[si + 1][0] <= r) si++
        const a = BAND_STOPS[si], b = BAND_STOPS[si + 1]
        const da = STOP_DECOMP[si], db = STOP_DECOMP[si + 1]
        const k = clamp((r - a[0]) / Math.max(b[0] - a[0], 1e-6), 0, 1)
        for (let ch = 0; ch < 3; ch++) {
            const wa = da[0] * base[ch] + da[1] * core[ch] + da[2] * accent[ch] + da[3 + ch]
            const wb = db[0] * base[ch] + db[1] * core[ch] + db[2] * accent[ch] + db[3 + ch]
            out[i * 4 + ch] = Math.round(clamp(wa + (wb - wa) * k, 0, 1) * 255)
        }
        out[i * 4 + 3] = 255
    }
}

/* ---- ring table: per-ring setup, built on the CPU ---------------------- */

const RING_ROWS = 5
const RING_MAX = 2048

const fract = (v: number) => v - Math.floor(v)
const sstep = (a: number, b: number, x: number) => {
    const t = clamp((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
function h11(v: number) {
    let p = fract(v * 0.1031)
    p *= p + 33.33
    p *= p + p
    return fract(p)
}
function vn1(x: number) {
    const i = Math.floor(x)
    let f = x - i
    f = f * f * (3 - 2 * f)
    return lerp(h11(i + 0.37), h11(i + 1.37), f)
}

function fillZoneJs(r: number) {
    let z = lerp(0.7, 0.8, sstep(0.42, 0.55, r))
    z = lerp(z, 0.75, sstep(0.85, 1.05, r))
    z = lerp(z, 0.9, sstep(1.15, 1.3, r))
    z = lerp(z, 0.6, sstep(2.6, 3.4, r))
    return lerp(z, 0.35, sstep(5.0, 7.0, r))
}
type V3 = [number, number, number]
const mix3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

function beadZone(r: number): V3 {
    let z: V3 = [1, 1, 1]
    z = mix3(z, [0.7, 1.3, 1.3], sstep(0.42, 0.55, r))
    z = mix3(z, [0.4, 1.4, 1.2], sstep(0.58, 0.7, r))
    z = mix3(z, [0.18, 1.3, 1.0], sstep(0.8, 0.95, r))
    z = mix3(z, [0.04, 1.0, 0.8], sstep(1.12, 1.25, r))
    z = mix3(z, [1.0, 1.0, 0.8], sstep(1.45, 1.55, r))
    return mix3(z, [0.6, 1.4, 1.1], sstep(2.6, 3.4, r))
}

function classZone(r: number): V3 {
    let w: V3 = [0.52, 0.13, 0.25]
    w = mix3(w, [0.73, 0.07, 0.08], sstep(0.28, 0.36, r))
    w = mix3(w, [0.68, 0.07, 0.02], sstep(0.5, 0.6, r))
    w = mix3(w, [0.12, 0.01, 0.01], sstep(0.78, 0.86, r))
    w = mix3(w, [0.98, 0.0, 0.0], sstep(0.98, 1.06, r))
    w = mix3(w, [0.41, 0.13, 0.46], sstep(1.3, 1.5, r))
    w = mix3(w, [0.29, 0.47, 0.23], sstep(1.85, 2.0, r))
    w = mix3(w, [0.64, 0.22, 0.09], sstep(2.45, 2.7, r))
    w = mix3(w, [0.51, 0.12, 0.27], sstep(3.4, 3.9, r))
    return mix3(w, [0.76, 0.13, 0.01], sstep(5.5, 7.0, r))
}

interface RingParams {
    rings: number
    fill: number
    maxP: number
    inner: number
    trail: number
    dotted: number
    white: number
    red: number
    stars: number
    base: RGB
    accent: RGB
}

function ringCount(rings: number) {
    return Math.min(RING_MAX, Math.ceil((Math.log2(LUT_RMAX) + 5) * rings) + 1)
}

function buildRingTable(out: Float32Array, N: number, P: RingParams) {
    const row = (y: number, k: number) => (y * N + k) * 4
    for (let k = 0; k < N; k++) {
        const fk = k + 0.5
        const rk = Math.pow(2, fk / P.rings - 5)
        const gz = sstep(0.4, 0.6, rk)
        const v = vn1(fk / 7)
        const grp = lerp(0.7 + 0.6 * v, 0.55 + 0.9 * v, gz)
        const lit = h11(k + 0.5) <= fillZoneJs(rk) * P.fill * grp
        const bandZ = sstep(1.15, 1.35, rk)
        const far = sstep(2.3, 4.0, rk)
        const ha = h11(k + 17.0)
        const amp = lit ? lerp(0.45 + 0.55 * ha, 0.7 + 0.3 * ha, bandZ) : 0
        const K = Math.max(1, P.maxP - Math.floor(h11(k + 3.1) * (P.maxP * 0.5 + 0.5)))
        const n = Math.max(1, Math.floor(P.inner * Math.pow(0.1 / Math.max(rk, 0.02), 1.5) + 0.5))
        const ph = h11(k + 7.7)
        const Ls = clamp((P.trail / 6.2832) * K * (0.6 + 0.8 * h11(k + 11.3)), 0.03, 2.9)
        const cz = classZone(rk)
        const pW = clamp((cz[0] * P.white) / 0.6, 0, 1)
        const pR = clamp((cz[1] * P.red) / 0.1, 0, 1)
        const hc = h11(k + 5.3)
        let col: V3
        let cls: number
        if (hc < pW) { col = [0.96, 0.97, 1.0]; cls = 0 }
        else if (hc < pW + pR) { col = mix3([P.accent[0] * 1.1, P.accent[1] * 1.1, P.accent[2] * 1.1], [1.0, 0.25, 0.18], 0.6); cls = 1 }
        else if (hc < pW + pR + cz[2]) { col = h11(k + 4.4) >= 0.7 ? [1.0, 0.85, 0.35] : [1.0, 0.62, 0.22]; cls = 2 }
        else { col = mix3(P.base, [0.6, 0.75, 1.0], 0.35); cls = 3 }
        const dotted = P.dotted >= h11(k + 9.3)
        const bz = beadZone(rk)
        const pitch = (PITCH_MIN + (PITCH_MAX - PITCH_MIN) * h11(k + 13.7)) * bz[1]
        const D = dotted ? Math.floor((6.2832 * rk) / pitch) + 1 : 0
        const pS = P.stars * 0.1 * lerp(0.5, 1, sstep(0.3, 0.5, rk)) * (1 - 0.7 * sstep(1.1, 1.4, rk)) * (1 + 0.8 * sstep(2.6, 3.4, rk))
        const dim = lerp(1, 0.6, sstep(0.85, 1.05, rk)) * lerp(1, 0.45, bandZ) * 1.35
        let o = row(0, k)
        out[o] = amp; out[o + 1] = K; out[o + 2] = n; out[o + 3] = ph
        o = row(1, k)
        out[o] = Ls; out[o + 1] = D; out[o + 2] = bz[0]; out[o + 3] = pS * (0.15 + 0.85 * bz[0])
        o = row(2, k)
        out[o] = col[0]; out[o + 1] = col[1]; out[o + 2] = col[2]; out[o + 3] = cls
        o = row(3, k)
        out[o] = (0.85 + 0.3 * h11(k + 21.0)) * bz[2]; out[o + 1] = 1 + 2.5 * clamp(rk - 1, 0, 2); out[o + 2] = dim; out[o + 3] = lerp(0.07, 0.3, gz * (1 - bandZ))
        o = row(4, k)
        out[o] = 1 - 0.8 * far; out[o + 1] = 1 - 0.7 * far; out[o + 2] = 0; out[o + 3] = 0
    }
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
    const sh = gl.createShader(type)
    if (!sh) throw new Error("createShader failed")
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS) && !gl.isContextLost()) {
        const log = gl.getShaderInfoLog(sh)
        gl.deleteShader(sh)
        throw new Error("Shader compile: " + log)
    }
    return sh
}

function program(gl: WebGL2RenderingContext, vs: string, fs: string, names: string[]) {
    const p = gl.createProgram()
    if (!p) throw new Error("createProgram failed")
    const v = compile(gl, gl.VERTEX_SHADER, vs)
    const f = compile(gl, gl.FRAGMENT_SHADER, fs)
    gl.attachShader(p, v)
    gl.attachShader(p, f)
    gl.linkProgram(p)
    gl.deleteShader(v)
    gl.deleteShader(f)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error("Link: " + gl.getProgramInfoLog(p))
    const u: Record<string, WebGLUniformLocation | null> = {}
    for (const n of names) u[n] = gl.getUniformLocation(p, n)
    return { p, u }
}

function shallowSame(a: Record<string, unknown>, b: Record<string, unknown>) {
    const ka = Object.keys(a)
    if (ka.length !== Object.keys(b).length) return false
    for (const k of ka) {
        const x = a[k], y = b[k]
        if (x === y) continue
        if (x && y && typeof x === "object" && typeof y === "object") {
            const ox = x as Record<string, unknown>, oy = y as Record<string, unknown>
            const kx = Object.keys(ox)
            if (kx.length !== Object.keys(oy).length) return false
            for (const kk of kx) if (ox[kk] !== oy[kk]) return false
            continue
        }
        return false
    }
    return true
}

interface GLRes {
    prog: ReturnType<typeof program>
    vao: WebGLVertexArrayObject | null
    lut: WebGLTexture | null
    ringT: WebGLTexture | null
}

/* ---- base component ---------------------------------------------------- */

function __OriginkitBase_SequinOrrery(props: SequinOrreryProps) {
    props = withMovedControls(props)
    const {
        background = "#060A14",
        baseColor = "#4E74D4",
        accentColor = "#E0552C",
        density = 99,
        tilt = 10,
        trail = 159,
        scale = 72,
        placement,
        speed = 75,
        advanced,
        style,
    } = props

    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const merged = {
        background,
        baseColor,
        accentColor,
        density,
        tilt,
        trail,
        scale,
        speed,
        plc: { ...DEFAULT_PLACEMENT, ...placement },
        adv: { ...DEFAULT_ADVANCED, ...advanced },
    }
    const propsRef = useRef(merged)
    const lastRaw = useRef<Record<string, unknown> | null>(null)
    const wakeRef = useRef<((redraw?: boolean) => void) | null>(null)
    propsRef.current = merged

    useEffect(() => {
        const raw = props as unknown as Record<string, unknown>
        if (lastRaw.current && shallowSame(lastRaw.current, raw)) return
        lastRaw.current = raw
        wakeRef.current?.(true)
    })

    useEffect(() => {
        const root = rootRef.current
        const canvas = canvasRef.current
        if (!root || !canvas) return
        const glc = canvas.getContext("webgl2", {
            antialias: false,
            alpha: false,
            depth: false,
            stencil: false,
            preserveDrawingBuffer: false,
            powerPreference: "low-power",
        }) as WebGL2RenderingContext | null
        if (!glc) return
        const gl: WebGL2RenderingContext = glc
        const cv: HTMLCanvasElement = canvas

        const UNIFORMS = [
            "uRes", "uM", "uT", "uCenter", "uA", "uHor", "uRoll", "uTime", "uMouse", "uMouseV", "uHover", "uHoverK",
            "uStir", "uPulse", "uPulseP",
            "uFill", "uTrail", "uRings", "uMaxP", "uInner", "uLoop", "uDotPx", "uLine", "uGlow", "uAmbient", "uDotted",
            "uRed", "uWhite", "uStars", "uTwinkle", "uBokeh", "uBokehSize", "uBokehTurns", "uExposure", "uGrain",
            "uVignette", "uCell", "uSdev", "uBg", "uBase", "uAccent", "uCore", "uLut", "uPair", "uRingT", "uRingN",
        ]
        let R: GLRes | null = null
        const lutData = new Uint8Array(LUT_N * 4)
        let lutKey = ""
        const ringData = new Float32Array(RING_MAX * RING_ROWS * 4)
        let ringKey = ""
        let ringN = 0

        const build = (): GLRes | null => {
            try {
                const prog = program(gl, VERT, FRAG, UNIFORMS)
                const lut = gl.createTexture()
                gl.activeTexture(gl.TEXTURE0)
                gl.bindTexture(gl.TEXTURE_2D, lut)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
                const ringT = gl.createTexture()
                gl.activeTexture(gl.TEXTURE1)
                gl.bindTexture(gl.TEXTURE_2D, ringT)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
                lutKey = ""
                ringKey = ""
                return { prog, vao: gl.createVertexArray(), lut, ringT }
            } catch (err) {
                console.error(err)
                return null
            }
        }
        const destroy = (r: GLRes | null) => {
            if (!r || gl.isContextLost()) return
            gl.deleteProgram(r.prog.p)
            gl.deleteVertexArray(r.vao)
            gl.deleteTexture(r.lut)
            gl.deleteTexture(r.ringT)
        }
        R = build()

        /* ---- state ---- */
        const st = {
            cssW: Math.max(1, root.offsetWidth || REF_W),
            cssH: Math.max(1, root.offsetHeight || REF_H),
            shown: 1,
            dpr: 1,
            clock: 0,
            last: 0,
            due: 0,
            cx: 0,
            cy: 0,
            moved: false,
            u: 0.5,
            v: 0.5,
            mu: 0.5,
            mv: 0.5,
            pu: 0.5,
            inside: false,
            over: 0,
            stir: 0,
            pulse: 9,
            pressU: 0.5,
            pressV: 0.5,
            dirty: true,
            visible: true,
            running: false,
            lost: false,
            raf: 0,
            frames: 0,
            drawEma: 16.7,
            cad: 16.7,
            lastDraw: 0,
            auto: 1,
            li: 0,
            slowT: 0,
            fastT: 0,
            gpuEma: 0,
            gpuN: 0,
            gpuSkip: 0,
        }
        const mq = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null
        const tq = gl.getExtension("EXT_disjoint_timer_query_webgl2") as { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number } | null
        const qFree: WebGLQuery[] = []
        const qWait: WebGLQuery[] = []
        const failAt = AUTO_LEVELS.map(() => -1e9)
        const pollGpu = () => {
            if (!tq || !qWait.length) return
            if (gl.getParameter(tq.GPU_DISJOINT_EXT)) {
                while (qWait.length) qFree.push(qWait.shift() as WebGLQuery)
                return
            }
            while (qWait.length && gl.getQueryParameter(qWait[0], gl.QUERY_RESULT_AVAILABLE)) {
                const q = qWait.shift() as WebGLQuery
                const ms = (gl.getQueryParameter(q, gl.QUERY_RESULT) as number) / 1e6
                qFree.push(q)
                if (st.gpuSkip > 0) { st.gpuSkip--; continue }
                st.gpuEma = st.gpuN ? st.gpuEma + (ms - st.gpuEma) * 0.15 : ms
                st.gpuN++
            }
        }

        const measureShown = () => {
            const r = root.getBoundingClientRect()
            const sh = st.cssW > 0 ? r.width / st.cssW : 1
            if (isFinite(sh) && sh > 0 && Math.abs(sh - st.shown) / st.shown > 0.05) {
                st.shown = sh
                return true
            }
            return false
        }

        const sizeCanvas = () => {
            const base = Math.min(window.devicePixelRatio || 1, DENSITY_CAP)
            let s = Math.min(2, base * clamp(st.shown, 1, 2))
            const px = st.cssW * st.cssH * s * s
            if (px > PIX_BUDGET) s *= Math.sqrt(PIX_BUDGET / px)
            s *= st.auto
            st.dpr = s
            const w = Math.max(1, Math.round(st.cssW * s))
            const h = Math.max(1, Math.round(st.cssH * s))
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w
                canvas.height = h
                draw()
            }
        }

        const ro = new ResizeObserver((entries) => {
            const e = entries[0]
            const cr = e && e.contentRect
            st.cssW = Math.max(1, cr ? cr.width : root.offsetWidth)
            st.cssH = Math.max(1, cr ? cr.height : root.offsetHeight)
            measureShown()
            sizeCanvas()
            wake(true)
        })
        ro.observe(root)
        const io = new IntersectionObserver((es) => {
            const e = es[es.length - 1]
            st.visible = e.isIntersecting
            if (st.visible) wake(true)
        })
        io.observe(root)
        const onVis = () => {
            if (!document.hidden) wake(true)
        }
        document.addEventListener("visibilitychange", onVis)

        const onMove = (e: PointerEvent) => {
            if (e.clientX === st.cx && e.clientY === st.cy && st.inside) return
            st.cx = e.clientX
            st.cy = e.clientY
            st.moved = true
            st.inside = true
            wake()
        }
        const onDown = (e: PointerEvent) => {
            onMove(e)
            const r = root.getBoundingClientRect()
            if (r.width > 0 && r.height > 0) {
                st.pressU = (e.clientX - r.left) / r.width
                st.pressV = (e.clientY - r.top) / r.height
            }
            st.pulse = 0
            wake()
        }
        const onLeave = () => {
            st.inside = false
            wake()
        }
        const onUp = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") {
                st.inside = false
                wake()
            }
        }
        const onScroll = () => {
            if (st.inside) {
                st.moved = true
                wake()
            }
        }
        root.addEventListener("pointermove", onMove)
        root.addEventListener("pointerenter", onMove)
        root.addEventListener("pointerdown", onDown)
        root.addEventListener("pointerleave", onLeave)
        window.addEventListener("pointerup", onUp)
        window.addEventListener("pointercancel", onUp)
        window.addEventListener("scroll", onScroll, { passive: true, capture: true })

        const onLost = (e: Event) => {
            e.preventDefault()
            st.lost = true
            R = null
            qFree.length = 0
            qWait.length = 0
            cancelAnimationFrame(st.raf)
            st.running = false
        }
        const onRestored = () => {
            st.lost = false
            R = build()
            sizeCanvas()
            wake(true)
        }
        canvas.addEventListener("webglcontextlost", onLost)
        canvas.addEventListener("webglcontextrestored", onRestored)

        const step = (dt: number) => {
            const p = propsRef.current
            const reduced = !!(mq && mq.matches)
            if (st.moved) {
                st.moved = false
                const r = root.getBoundingClientRect()
                if (r.width > 0 && r.height > 0) {
                    st.u = (st.cx - r.left) / r.width
                    st.v = (st.cy - r.top) / r.height
                }
            }
            const hk = Math.max(0, num(p.adv.hover, 50)) / 50
            const du = st.inside ? st.u - st.pu : 0
            st.pu = st.u
            if (dt > 0 && st.inside) st.stir += du * STIR_GAIN * hk
            st.stir *= Math.exp(-dt * STIR_DECAY)
            if (Math.abs(st.stir) < 0.02) st.stir = 0
            st.pulse = Math.min(st.pulse + dt, 9)
            const k = 1 - Math.exp(-dt * 12)
            st.mu += (st.u - st.mu) * k
            st.mv += (st.v - st.mv) * k
            st.over += ((st.inside ? 1 : 0) - st.over) * (1 - Math.exp(-dt * (st.inside ? 6 : 3)))
            if (!st.inside && st.over < 0.005) st.over = 0
            const rate = (clamp(num(p.speed, 75), 0, 100) / 50) * (reduced ? 0.25 : 1)
            st.clock = (st.clock + dt * rate + st.stir * dt) % 36000
            const ptrMoving = Math.abs(st.u - st.mu) > 1e-4 || Math.abs(st.v - st.mv) > 1e-4
            return rate > 1e-4 || st.stir !== 0 || ptrMoving || (st.over > 0 && st.over < 1 - 1e-3) || st.pulse < PULSE_LIFE
        }

        const mM = new Float32Array(4)
        function draw() {
            const r = R
            if (!r || st.lost || gl.isContextLost()) return
            const p = propsRef.current
            const adv = p.adv
            const plc = p.plc
            const cw = cv.width, ch = cv.height
            const dpr = st.dpr
            const W = st.cssW, H = st.cssH
            const S = Math.min(H, W / REF_ASPECT)
            const sc = clamp(num(p.scale, 100), 10, 300) / 100
            const ang = (clamp(num(plc.angle, 0), -180, 180) * Math.PI) / 180
            const offX = (clamp(num(plc.x, 0), -100, 100) / 100) * W
            const offY = (clamp(num(plc.y, 0), -100, 100) / 100) * H
            const ca = Math.cos(-ang), sa = Math.sin(-ang)
            const k = 1 / (S * sc)
            const Fx = W / 2, Fy = H / 2
            mM[0] = (ca * k) / dpr; mM[1] = (sa * k) / dpr
            mM[2] = (-sa * k) / dpr; mM[3] = (ca * k) / dpr
            const ox = Fx + offX, oy = Fy + offY
            const Tx = REF_ASPECT / 2 - (ca * ox - sa * oy) * k
            const Ty = 0.5 - (sa * ox + ca * oy) * k
            const px = st.mu * W, py = st.mv * H
            const msx = Tx + (ca * px - sa * py) * k
            const msy = Ty + (sa * px + ca * py) * k
            const qx = st.pressU * W, qy = st.pressV * H
            const psx = Tx + (ca * qx - sa * qy) * k
            const psy = Ty + (sa * qx + ca * qy) * k

            const base = parseColor(p.baseColor, DEF_BASE)
            const acc = parseColor(p.accentColor, DEF_ACCENT)
            const core = parseColor(adv.coreColor, DEF_CORE)
            const bg = parseColor(p.background, [0.024, 0.04, 0.08])
            const key = p.baseColor + "|" + p.accentColor + "|" + adv.coreColor
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, r.lut)
            if (key !== lutKey) {
                lutKey = key
                buildLut(lutData, base, core, acc)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, LUT_N, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, lutData)
            }

            const cl = (v: unknown, d: number, lo: number, hi: number) => clamp(num(v, d), lo, hi)
            const ringsV = cl(adv.rings, 140, 20, 400) * (40 / 140)
            const rp: RingParams = {
                rings: ringsV,
                fill: cl(p.density, 100, 20, 100) / 100,
                maxP: cl(adv.particles, 4, 1, 8),
                inner: cl(adv.innerTurns, 6, 1, 20),
                trail: (cl(p.trail, 103, 5, 180) * Math.PI) / 180,
                dotted: cl(adv.dotted, 80, 0, 100) / 100,
                white: cl(adv.whiteRings, 60, 0, 100) / 100,
                red: cl(adv.redRings, 10, 0, 100) / 100,
                stars: cl(adv.stars, 50, 0, 100) / 100,
                base,
                accent: acc,
            }
            const rKey = [rp.rings, rp.fill, rp.maxP, rp.inner, rp.trail, rp.dotted, rp.white, rp.red, rp.stars, p.baseColor, p.accentColor].join("|")
            gl.activeTexture(gl.TEXTURE1)
            gl.bindTexture(gl.TEXTURE_2D, r.ringT)
            if (rKey !== ringKey) {
                ringKey = rKey
                ringN = ringCount(ringsV)
                buildRingTable(ringData, ringN, rp)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, ringN, RING_ROWS, 0, gl.RGBA, gl.FLOAT, ringData.subarray(0, ringN * RING_ROWS * 4))
            }
            const tiltR = (cl(p.tilt, 26, 5, 60) * Math.PI) / 180
            const Sdev = S * sc * dpr
            const u = r.prog.u
            gl.viewport(0, 0, cw, ch)
            gl.useProgram(r.prog.p)
            gl.bindVertexArray(r.vao)
            gl.uniform2f(u.uRes, cw, ch)
            gl.uniformMatrix2fv(u.uM, false, mM)
            gl.uniform2f(u.uT, Tx, Ty)
            gl.uniform2f(u.uCenter, cl(adv.centerX, -20, -50, 100) / 100, cl(adv.centerY, 36, 0, 100) / 100)
            gl.uniform1f(u.uA, 1 / Math.max(Math.sin(tiltR), 1e-3))
            gl.uniform1f(u.uHor, cl(adv.horizon, 66, 20, 300) / 100)
            gl.uniform1f(u.uRoll, (cl(adv.roll, 0.8, -30, 30) * Math.PI) / 180)
            gl.uniform1f(u.uTime, st.clock)
            gl.uniform2f(u.uMouse, msx, msy)
            gl.uniform1f(u.uMouseV, st.mv)
            gl.uniform1f(u.uHover, st.over)
            gl.uniform1f(u.uHoverK, cl(adv.hover, 50, 0, 100) / 50)
            gl.uniform1f(u.uStir, st.stir)
            gl.uniform1f(u.uPulse, st.pulse)
            gl.uniform2f(u.uPulseP, psx, psy)
            gl.uniform1f(u.uFill, cl(p.density, 100, 20, 100) / 100)
            gl.uniform1f(u.uTrail, (cl(p.trail, 103, 5, 180) * Math.PI) / 180)
            gl.uniform1f(u.uRings, ringsV)
            gl.uniform1f(u.uMaxP, cl(adv.particles, 4, 1, 8))
            gl.uniform1f(u.uInner, cl(adv.innerTurns, 6, 1, 20))
            gl.uniform1f(u.uLoop, cl(adv.loopS, 40, 5, 120))
            gl.uniform1f(u.uDotPx, Math.max(0.35, cl(adv.dotSize, 1.0, 0.3, 12) * (Sdev / REF_H)))
            gl.uniform1f(u.uLine, Math.max(0.35, (cl(adv.lineWidth, 7, 2, 40) / 10) * (Sdev / REF_H)))
            gl.uniform1f(u.uGlow, cl(adv.glow, 35, 0, 100) / 100)
            gl.uniform1f(u.uAmbient, cl(adv.ambient, 100, 0, 200) / 100)
            gl.uniform1f(u.uDotted, cl(adv.dotted, 80, 0, 100) / 100)
            gl.uniform1f(u.uRed, cl(adv.redRings, 10, 0, 100) / 100)
            gl.uniform1f(u.uWhite, cl(adv.whiteRings, 60, 0, 100) / 100)
            gl.uniform1f(u.uStars, cl(adv.stars, 50, 0, 100) / 100)
            gl.uniform1f(u.uTwinkle, cl(adv.twinkle, 50, 0, 100) / 100)
            gl.uniform1f(u.uBokeh, cl(adv.bokeh, 60, 0, 100) / 100)
            gl.uniform1f(u.uBokehSize, cl(adv.bokehSize, 100, 20, 300) / 100)
            gl.uniform1f(u.uBokehTurns, cl(adv.bokehTurns, 6, 1, 20))
            gl.uniform1f(u.uExposure, cl(adv.exposure, 100, 20, 300) / 100)
            gl.uniform1f(u.uGrain, cl(adv.grain, 6, 0, 100) / 100)
            gl.uniform1f(u.uVignette, cl(adv.vignette, 0, 0, 100) / 100)
            gl.uniform1f(u.uCell, GRAIN_PX * dpr)
            gl.uniform1f(u.uSdev, Sdev)
            gl.uniform3f(u.uBg, bg[0], bg[1], bg[2])
            gl.uniform3f(u.uBase, base[0], base[1], base[2])
            gl.uniform3f(u.uAccent, acc[0], acc[1], acc[2])
            gl.uniform3f(u.uCore, core[0], core[1], core[2])
            gl.uniform1i(u.uLut, 0)
            gl.uniform1i(u.uPair, 2)
            gl.uniform1i(u.uRingT, 1)
            gl.uniform1f(u.uRingN, ringN)
            const q = tq && qWait.length < 4 && !st.lost ? qFree.pop() || gl.createQuery() : null
            if (q && tq) gl.beginQuery(tq.TIME_ELAPSED_EXT, q)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
            if (q && tq) {
                gl.endQuery(tq.TIME_ELAPSED_EXT)
                qWait.push(q)
            }
            gl.bindVertexArray(null)
        }

        const tick = (now: number) => {
            st.raf = 0
            if (st.lost) { st.running = false; return }
            const raw = st.last ? now - st.last : 16.7
            const dt = Math.min(raw / 1000, 0.05)
            st.last = now
            st.cad = Math.min(st.cad + 0.2, Math.max(4, raw))
            pollGpu()
            const active = step(dt)
            let drew = false
            if (st.dirty || (active && now >= st.due - 3)) {
                st.due = Math.max(st.due + 1000 / 60, now)
                let resize = ++st.frames % 30 === 0 && measureShown()
                if (st.lastDraw && st.frames > 30 && active) {
                    const gap = Math.min(now - st.lastDraw, 100)
                    let slow: boolean, fast: boolean
                    const up = st.li > 0 ? (AUTO_LEVELS[st.li - 1] / AUTO_LEVELS[st.li]) ** 2 : 1
                    if (st.gpuN > 3) {
                        slow = st.gpuEma > GPU_BUDGET
                        fast = st.li > 0 && st.gpuEma * up < GPU_BUDGET * 0.8
                    } else {
                        st.drawEma += (gap - st.drawEma) * 0.08
                        const target = Math.ceil(1000 / 60 / st.cad - 0.05) * st.cad
                        slow = st.drawEma > target * 1.5
                        fast = st.li > 0 && st.drawEma * up < target * 1.1
                    }
                    if (slow) { st.slowT += gap; st.fastT = 0 }
                    else if (fast) { st.fastT += gap; st.slowT = 0 }
                    else { st.slowT = 0; st.fastT = 0 }
                    let li = st.li
                    if (st.slowT > 500 && li < AUTO_LEVELS.length - 1) { failAt[li] = now; li++ }
                    else if (st.fastT > 2500 && li > 0 && now - failAt[li - 1] > 3000) li--
                    if (li !== st.li) {
                        st.li = li
                        st.auto = AUTO_LEVELS[li]
                        st.slowT = 0
                        st.fastT = 0
                        st.gpuSkip = qWait.length
                        st.drawEma = 1000 / 60
                        resize = true
                    }
                }
                if (resize) sizeCanvas()
                draw()
                st.lastDraw = now
                st.dirty = false
                drew = true
            }
            if ((active || st.dirty) && st.visible && !document.hidden) {
                st.raf = requestAnimationFrame(tick)
            } else {
                st.running = false
                st.last = 0
                if (!drew) st.lastDraw = 0
            }
        }

        function wake(redraw = false) {
            if (redraw) st.dirty = true
            if (st.running || st.lost || !st.visible || document.hidden) return
            st.running = true
            st.last = 0
            st.lastDraw = 0
            st.due = 0
            st.raf = requestAnimationFrame(tick)
        }
        wakeRef.current = wake

        sizeCanvas()
        draw()
        wake(true)

        return () => {
            wakeRef.current = null
            cancelAnimationFrame(st.raf)
            st.running = false
            ro.disconnect()
            io.disconnect()
            document.removeEventListener("visibilitychange", onVis)
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerenter", onMove)
            root.removeEventListener("pointerdown", onDown)
            root.removeEventListener("pointerleave", onLeave)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("pointercancel", onUp)
            window.removeEventListener("scroll", onScroll, { capture: true })
            canvas.removeEventListener("webglcontextlost", onLost)
            canvas.removeEventListener("webglcontextrestored", onRestored)
            if (!gl.isContextLost()) for (const q of [...qFree, ...qWait]) gl.deleteQuery(q)
            destroy(R)
            R = null
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
  background: "#060A14",
  baseColor: "#4E74D4",
  accentColor: "#E0552C",
  density: 99,
  tilt: 10,
  trail: 159,
  scale: 72,
  speed: 75,
  placement: {
    x: 0,
    y: 0,
    angle: 0,
  },
  advanced: {
    centerX: -20,
    centerY: 36,
    horizon: 160,
    roll: 11.4,
    rings: 59,
    particles: 4,
    innerTurns: 9,
    loopS: 40,
    dotSize: 1.8,
    lineWidth: 16,
    glow: 48,
    ambient: 100,
    dotted: 80,
    redRings: 34,
    whiteRings: 60,
    stars: 50,
    twinkle: 69,
    bokeh: 58,
    bokehSize: 66,
    bokehTurns: 3,
    coreColor: "#F2F0F0",
    exposure: 100,
    grain: 44,
    vignette: 100,
    hover: 47,
  },
}

export default function SequinOrrery(props: Partial<SequinOrreryProps>) {
  const merged: SequinOrreryProps = {
    ...__originkitPresetProps,
    ...props,
    placement: {
      ...__originkitPresetProps.placement,
      ...(props.placement || {}),
    },
    advanced: {
      ...__originkitPresetProps.advanced,
      ...(props.advanced || {}),
    },
  }
  return <__OriginkitBase_SequinOrrery {...merged} />
}
