'use client';

import * as faceapi from 'face-api.js';
import { BloomEffect, ChromaticAberrationEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './GridScan.css';

export type GridScanProps = {
  enableHover?: boolean;
  enableWebcam?: boolean;
  showPreview?: boolean;
  modelsPath?: string;
  sensitivity?: number;

  lineThickness?: number;
  linesColor?: string;

  gridScale?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineJitter?: number;

  enablePost?: boolean;
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;

  scanColor?: string;
  scanOpacity?: number;
  scanDirection?: 'forward' | 'backward' | 'pingpong';
  scanSoftness?: number;
  scanGlow?: number;
  scanPhaseTaper?: number;
  scanDuration?: number;
  scanDelay?: number;
  enableGyro?: boolean;
  scanOnClick?: boolean;
  snapBackDelay?: number;
  lightMode?: boolean;
  showFloorFlags?: boolean;
  floorFlagRow?: number;
  selectedLanguage?: string;
  onSelectLanguage?: (code: string) => void;
  className?: string;
  style?: React.CSSProperties;
};

interface FloorFlagItem {
  code: string;
  label: string;
  nativeName: string;
  col: number;
}

const FLOOR_FLAGS: FloorFlagItem[] = [
  { code: 'fr',   label: 'FR',    nativeName: 'Français',     col: -4 },
  { code: 'id',   label: 'ID',    nativeName: 'Indonesia',    col: -3 },
  { code: 'en',   label: 'EN',    nativeName: 'English',      col: -2 },
  { code: 'auto', label: 'MULTI', nativeName: 'Multilingual', col: -1 },
  { code: 'de',   label: 'DE',    nativeName: 'Deutsch',      col: 1 },
  { code: 'ja',   label: 'JA',    nativeName: '日本語',      col: 2 },
  { code: 'zh',   label: 'ZH',    nativeName: '中文',         col: 3 },
];

function getFloorFlagItem(col: number): FloorFlagItem | null {
  if (col === -4) return { code: 'fr', label: 'FR', nativeName: 'Français', col: -4 };
  if (col === -3) return { code: 'id', label: 'ID', nativeName: 'Indonesia', col: -3 };
  if (col === -2) return { code: 'en', label: 'EN', nativeName: 'English', col: -2 };
  if (col === -1 || col === 0) return { code: 'auto', label: 'MULTI', nativeName: 'Multilingual', col: -1 };
  if (col === 1) return { code: 'de', label: 'DE', nativeName: 'Deutsch', col: 1 };
  if (col === 2) return { code: 'ja', label: 'JA', nativeName: '日本語', col: 2 };
  if (col === 3) return { code: 'zh', label: 'ZH', nativeName: '中文', col: 3 };
  return null;
}

function drawFlagToCanvas(
  ctx: CanvasRenderingContext2D,
  code: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  switch (code) {
    case 'auto': {
      ctx.fillStyle = '#080c14';
      ctx.fillRect(x, y, w, h);

      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = 90;

      // Outer circle (clean pure white)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Longitude meridians (pure white)
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.35, r, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.70, r, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Equator (pure white)
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.stroke();

      // Latitude parallels (pure white)
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.866, cy - r * 0.5);
      ctx.lineTo(cx + r * 0.866, cy - r * 0.5);
      ctx.moveTo(cx - r * 0.866, cy + r * 0.5);
      ctx.lineTo(cx + r * 0.866, cy + r * 0.5);
      ctx.stroke();
      break;
    }
    case 'id': {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x, y, w, h / 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y + h / 2, w, h / 2);
      break;
    }
    case 'en': {
      ctx.fillStyle = '#012169';
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 36;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y);
      ctx.stroke();

      ctx.strokeStyle = '#c8102e';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 54;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w / 2, y + h);
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();

      ctx.strokeStyle = '#c8102e';
      ctx.lineWidth = 34;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w / 2, y + h);
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();
      break;
    }

    case 'fr': {
      const colW = w / 3;
      ctx.fillStyle = '#002395';
      ctx.fillRect(x, y, colW, h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + colW, y, colW, h);
      ctx.fillStyle = '#ed2939';
      ctx.fillRect(x + colW * 2, y, colW, h);
      break;
    }
    case 'de': {
      const rowH = h / 3;
      ctx.fillStyle = '#0f0f11';
      ctx.fillRect(x, y, w, rowH);
      ctx.fillStyle = '#dd0000';
      ctx.fillRect(x, y + rowH, w, rowH);
      ctx.fillStyle = '#ffce00';
      ctx.fillRect(x, y + rowH * 2, w, rowH);
      break;
    }
    case 'ja': {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#bc002d';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.32, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'zh': {
      ctx.fillStyle = '#de2910';
      ctx.fillRect(x, y, w, h);

      const drawStar = (cx: number, cy: number, r: number) => {
        ctx.fillStyle = '#ffde00';
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const currR = i % 2 === 0 ? r : r * 0.45;
          const sx = cx + currR * Math.cos(angle);
          const sy = cy + currR * Math.sin(angle);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      };

      drawStar(x + 58, y + 64, 36);
      drawStar(x + 106, y + 34, 13);
      drawStar(x + 128, y + 56, 13);
      drawStar(x + 128, y + 90, 13);
      drawStar(x + 106, y + 114, 13);
      break;
    }
  }


  // Crisp border around tile
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  ctx.restore();
}

function createFlagTextureAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Slot 0 (col -4): France (pindah ke posisi lama global)
    drawFlagToCanvas(ctx, 'fr', 0 * 256, 0, 256, 256);
    // Slot 1 (col -3): Indonesia
    drawFlagToCanvas(ctx, 'id', 1 * 256, 0, 256, 256);
    // Slot 2 (col -2): English
    drawFlagToCanvas(ctx, 'en', 2 * 256, 0, 256, 256);
    // Slot 3 & 4 (col -1 & 0): Global / Auto (makan 2 tempat Spanyol & France, 512px)
    drawFlagToCanvas(ctx, 'auto', 3 * 256, 0, 512, 256);
    // Slot 5 (col 1): Germany
    drawFlagToCanvas(ctx, 'de', 5 * 256, 0, 256, 256);
    // Slot 6 (col 2): Japan
    drawFlagToCanvas(ctx, 'ja', 6 * 256, 0, 256, 256);
    // Slot 7 (col 3): China
    drawFlagToCanvas(ctx, 'zh', 7 * 256, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function getFloorCellUnderPointer(
  container: HTMLElement,
  clientX: number,
  clientY: number,
  gridScale: number
): { col: number; row: number } | null {
  const rect = container.getBoundingClientRect();
  const mouseX = clientX - rect.left;
  const mouseY = clientY - rect.top;

  const px = (2.0 * mouseX - rect.width) / rect.height;
  const py = -(2.0 * mouseY - rect.height) / rect.height;

  if (py >= -0.01) return null;

  const hitZ = -0.4 / py;
  const hitX = (px * hitZ) / 2.0;

  if (hitX < -0.55 || hitX > 0.55) return null;

  const col = Math.floor(hitX / gridScale);
  const row = Math.floor(hitZ / gridScale);

  return { col, row };
}

const vert = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const frag = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
uniform float uLightMode;
uniform sampler2D uFlagAtlas;
uniform float uShowFlags;
uniform float uSelectedFlagCol;
uniform float uHoveredFlagCol;
uniform float uClickCol;
uniform float uClickScale;
uniform float uFlagRow;
varying vec2 vUv;

uniform float uScanStarts[8];
uniform float uScanCount;

const int MAX_SCANS = 8;

float smoother01(float a, float b, float x){
  float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

    vec3 ro = vec3(0.0);
    vec3 rd = normalize(vec3(p, 2.0));

    float cR = cos(uTilt), sR = sin(uTilt);
    rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;

    float cY = cos(uYaw), sY = sin(uYaw);
    rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

    vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
    rd.xy += skew * rd.z;

    vec3 color = vec3(0.0);
  float minT = 1e20;
  float gridScale = max(1e-5, uGridScale);
    float fadeStrength = 2.0;
    vec2 gridUV = vec2(0.0);

  float hitIsY = 1.0;
    for (int i = 0; i < 4; i++)
    {
        float isY = float(i < 2);
        float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
        float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
        float den = isY * rd.y + (1.0 - isY) * rd.x;
        float t = num / den;
        vec3 h = ro + rd * t;

        float depthBoost = smoothstep(0.0, 3.0, h.z);
        h.xy += skew * 0.15 * depthBoost;

    bool use = t > 0.0 && t < minT;
    gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
    minT = use ? t : minT;
    hitIsY = use ? isY : hitIsY;
    }

    vec3 hit = ro + rd * minT;
    float dist = length(hit - ro);

  float jitterAmt = clamp(uLineJitter, 0.0, 1.0);
  if (jitterAmt > 0.0) {
    vec2 j = vec2(
      sin(gridUV.y * 2.7 + iTime * 1.8),
      cos(gridUV.x * 2.3 - iTime * 1.6)
    ) * (0.15 * jitterAmt);
    gridUV += j;
  }
  float fx = fract(gridUV.x);
  float fy = fract(gridUV.y);
  float ax = min(fx, 1.0 - fx);
  float ay = min(fy, 1.0 - fy);
  float wx = fwidth(gridUV.x);
  float wy = fwidth(gridUV.y);
  float halfPx = max(0.0, uLineThickness) * 0.5;

  float tx = halfPx * wx;
  float ty = halfPx * wy;

  float aax = wx;
  float aay = wy;

  float lineX = 1.0 - smoothstep(tx, tx + aax, ax);
  float lineY = 1.0 - smoothstep(ty, ty + aay, ay);
  if (uLineStyle > 0.5) {
    float dashRepeat = 4.0;
    float dashDuty = 0.5;
    float vy = fract(gridUV.y * dashRepeat);
    float vx = fract(gridUV.x * dashRepeat);
    float dashMaskY = step(vy, dashDuty);
    float dashMaskX = step(vx, dashDuty);
    if (uLineStyle < 1.5) {
      lineX *= dashMaskY;
      lineY *= dashMaskX;
    } else {
      float dotRepeat = 6.0;
      float dotWidth = 0.18;
      float cy = abs(fract(gridUV.y * dotRepeat) - 0.5);
      float cx = abs(fract(gridUV.x * dotRepeat) - 0.5);
      float dotMaskY = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.y * dotRepeat), cy);
      float dotMaskX = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.x * dotRepeat), cx);
      lineX *= dotMaskY;
      lineY *= dotMaskX;
    }
  }
  float primaryMask = max(lineX, lineY);

  vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;
  if (jitterAmt > 0.0) {
    vec2 j2 = vec2(
      cos(gridUV2.y * 2.1 - iTime * 1.4),
      sin(gridUV2.x * 2.5 + iTime * 1.7)
    ) * (0.15 * jitterAmt);
    gridUV2 += j2;
  }
  float fx2 = fract(gridUV2.x);
  float fy2 = fract(gridUV2.y);
  float ax2 = min(fx2, 1.0 - fx2);
  float ay2 = min(fy2, 1.0 - fy2);
  float wx2 = fwidth(gridUV2.x);
  float wy2 = fwidth(gridUV2.y);
  float tx2 = halfPx * wx2;
  float ty2 = halfPx * wy2;
  float aax2 = wx2;
  float aay2 = wy2;
  float lineX2 = 1.0 - smoothstep(tx2, tx2 + aax2, ax2);
  float lineY2 = 1.0 - smoothstep(ty2, ty2 + aay2, ay2);
  if (uLineStyle > 0.5) {
    float dashRepeat2 = 4.0;
    float dashDuty2 = 0.5;
    float vy2m = fract(gridUV2.y * dashRepeat2);
    float vx2m = fract(gridUV2.x * dashRepeat2);
    float dashMaskY2 = step(vy2m, dashDuty2);
    float dashMaskX2 = step(vx2m, dashDuty2);
    if (uLineStyle < 1.5) {
      lineX2 *= dashMaskY2;
      lineY2 *= dashMaskX2;
    } else {
      float dotRepeat2 = 6.0;
      float dotWidth2 = 0.18;
      float cy2 = abs(fract(gridUV2.y * dotRepeat2) - 0.5);
      float cx2 = abs(fract(gridUV2.x * dotRepeat2) - 0.5);
      float dotMaskY2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.y * dotRepeat2), cy2);
      float dotMaskX2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.x * dotRepeat2), cx2);
      lineX2 *= dotMaskY2;
      lineY2 *= dotMaskX2;
    }
  }
    float altMask = max(lineX2, lineY2);

    float edgeDistX = min(abs(hit.x - (-0.5)), abs(hit.x - 0.5));
    float edgeDistY = min(abs(hit.y - (-0.2)), abs(hit.y - 0.2));
    float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
    float edgeGate = 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);
    altMask *= edgeGate;

  float lineMask = max(primaryMask, altMask);

    float fade = exp(-dist * fadeStrength);

    float dur = max(0.05, uScanDuration);
    float del = max(0.0, uScanDelay);
    float scanZMax = 2.0;
    float widthScale = max(0.1, uScanGlow);
    float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
    float sigmaA = sigma * 2.0;

    float combinedPulse = 0.0;
    float combinedAura = 0.0;

    float cycle = dur + del;
    float tCycle = mod(iTime, cycle);
    float scanPhase = clamp((tCycle - del) / dur, 0.0, 1.0);
    float phase = scanPhase;
    if (uScanDirection > 0.5 && uScanDirection < 1.5) {
      phase = 1.0 - phase;
    } else if (uScanDirection > 1.5) {
      float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
      phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
    }
    float scanZ = phase * scanZMax;
    float dz = abs(hit.z - scanZ);
    float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
    float taper = clamp(uPhaseTaper, 0.0, 0.49);
    float headW = taper;
    float tailW = taper;
    float headFade = smoother01(0.0, headW, phase);
    float tailFade = 1.0 - smoother01(1.0 - tailW, 1.0, phase);
    float phaseWindow = headFade * tailFade;
    float pulseBase = lineBand * phaseWindow;
    combinedPulse += pulseBase * clamp(uScanOpacity, 0.0, 1.0);
    float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));
    combinedAura += (auraBand * 0.25) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);

    for (int i = 0; i < MAX_SCANS; i++) {
      if (float(i) >= uScanCount) break;
      float tActiveI = iTime - uScanStarts[i];
      float phaseI = clamp(tActiveI / dur, 0.0, 1.0);
      if (uScanDirection > 0.5 && uScanDirection < 1.5) {
        phaseI = 1.0 - phaseI;
      } else if (uScanDirection > 1.5) {
        phaseI = (phaseI < 0.5) ? (phaseI * 2.0) : (1.0 - (phaseI - 0.5) * 2.0);
      }
      float scanZI = phaseI * scanZMax;
      float dzI = abs(hit.z - scanZI);
      float lineBandI = exp(-0.5 * (dzI * dzI) / (sigma * sigma));
      float headFadeI = smoother01(0.0, headW, phaseI);
      float tailFadeI = 1.0 - smoother01(1.0 - tailW, 1.0, phaseI);
      float phaseWindowI = headFadeI * tailFadeI;
      combinedPulse += lineBandI * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
      float auraBandI = exp(-0.5 * (dzI * dzI) / (sigmaA * sigmaA));
      combinedAura += (auraBandI * 0.25) * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
    }

  float lineVis = lineMask;
  vec3 gridCol = uLinesColor * lineVis * fade;
  vec3 scanCol = uScanColor * combinedPulse;
  vec3 scanAura = uScanColor * combinedAura;

    color = gridCol + scanCol + scanAura;

  // Floor flag perspective rendering conforming to grid floor cells
  float outGlowAlpha = 0.0;
  if (uShowFlags > 0.5 && hitIsY > 0.5 && hit.y < -0.19) {
    vec2 floorBaseUV = hit.xz / gridScale;
    float fRow = floor(floorBaseUV.y);
    float fCol = floor(floorBaseUV.x);

    // Outward glow radiating strictly OUTSIDE the hovered box (subtle, tight, refined)
    if (uHoveredFlagCol > -900.0 && (uSelectedFlagCol <= -900.0 || abs(uHoveredFlagCol - uSelectedFlagCol) > 0.1)) {
      bool isAutoHov = abs(uHoveredFlagCol - (-1.0)) < 0.1;
      float hXMin = isAutoHov ? -1.0 : uHoveredFlagCol;
      float hXMax = isAutoHov ? 1.0 : uHoveredFlagCol + 1.0;
      vec2 hCenter = vec2((hXMin + hXMax) * 0.5, uFlagRow + 0.5);
      vec2 hHalf = vec2((hXMax - hXMin) * 0.5, 0.5);
      vec2 pH = floorBaseUV - hCenter;
      vec2 dBoxH = abs(pH) - hHalf;
      float distOutH = length(max(dBoxH, vec2(0.0)));
      if (distOutH > 0.001 && distOutH < 0.085) {
        float g = 1.0 - smoothstep(0.001, 0.08, distOutH);
        g = pow(g, 2.5) * 0.45;
        color += vec3(1.0, 1.0, 1.0) * g;
        outGlowAlpha = max(outGlowAlpha, g * 0.5);
      }
    }

    if (abs(fRow - uFlagRow) < 0.1 && fCol >= -4.0 && fCol <= 3.0) {
      vec2 cUV = fract(floorBaseUV);
      vec2 pad = vec2(0.06, 0.08);

      bool isAutoCol = (abs(fCol - (-1.0)) < 0.1 || abs(fCol) < 0.1);
      bool isSel = (abs(uSelectedFlagCol - (-1.0)) < 0.1 && isAutoCol) || (abs(fCol - uSelectedFlagCol) < 0.1);
      bool isHov = (abs(uHoveredFlagCol - (-1.0)) < 0.1 && isAutoCol) || (abs(fCol - uHoveredFlagCol) < 0.1);
      bool isClick = (abs(uClickCol - (-1.0)) < 0.1 && isAutoCol) || (abs(fCol - uClickCol) < 0.1);

      // Selected flag stays slightly smaller (agak kecil: 0.91) after click
      // Unselected flags remain at full size (1.0)
      float s = isSel ? 0.91 : 1.0;
      if (isClick && uClickScale > 0.1) {
        s = uClickScale;
      } else if (isHov && !isSel) {
        s = 1.015;
      }

      if (isAutoCol) {
        // Combined double-wide tile across col -1 and col 0 (span floorBaseUV.x from -1.0 to 1.0)
        float totalX = (floorBaseUV.x - (-1.0)) / 2.0;
        vec2 autoPad = vec2(0.03, 0.08);

        // Scale around center of double-wide tile
        float scaledTotalX = 0.5 + (totalX - 0.5) / s;
        float scaledY = 0.5 + (cUV.y - 0.5) / s;

        // 3D recessed socket shadow when tile shrinks on click (s < 0.99)
        if (s < 0.99) {
          float bDistX = min(totalX, 1.0 - totalX);
          float bDistY = min(cUV.y, 1.0 - cUV.y);
          if (min(bDistX, bDistY) < 0.04) {
            color = mix(color, vec3(0.0), 0.55);
          }
        }

        if (scaledTotalX > autoPad.x && scaledTotalX < (1.0 - autoPad.x) && scaledY > autoPad.y && scaledY < (1.0 - autoPad.y)) {
          vec2 localUV = vec2((scaledTotalX - autoPad.x) / (1.0 - 2.0 * autoPad.x), (scaledY - autoPad.y) / (1.0 - 2.0 * autoPad.y));
          // Atlas slots 3 & 4 (start at slot 3, span 2 slots out of 8)
          vec2 atlasUV = vec2((3.0 + localUV.x * 2.0) / 8.0, localUV.y);
          vec4 flagTex = texture2D(uFlagAtlas, atlasUV);

          vec3 fRgb = pow(flagTex.rgb, vec3(2.2));

          // Translucent black layer (kedalaman smoked 3D)
          if (isClick && s < 0.96) {
            fRgb = mix(fRgb, vec3(0.0), 0.38);
          } else if (isSel) {
            fRgb = mix(fRgb, vec3(0.0), 0.20);
          } else if (isHov) {
            fRgb = mix(fRgb, vec3(0.0), 0.12);
          }
          color = mix(color, fRgb, flagTex.a);
        }
      } else {
        float flagIdx = fCol + 4.0;
        vec2 pCentered = cUV - vec2(0.5);
        vec2 scaledUV = vec2(0.5) + pCentered / s;

        // 3D recessed socket shadow when tile shrinks on click (s < 0.99)
        if (s < 0.99) {
          float bDistX = min(cUV.x, 1.0 - cUV.x);
          float bDistY = min(cUV.y, 1.0 - cUV.y);
          if (min(bDistX, bDistY) < 0.04) {
            color = mix(color, vec3(0.0), 0.55);
          }
        }

        if (scaledUV.x > pad.x && scaledUV.x < (1.0 - pad.x) && scaledUV.y > pad.y && scaledUV.y < (1.0 - pad.y)) {
          vec2 localUV = (scaledUV - pad) / (vec2(1.0) - 2.0 * pad);
          vec2 atlasUV = vec2((flagIdx + localUV.x) / 8.0, localUV.y);
          vec4 flagTex = texture2D(uFlagAtlas, atlasUV);

          vec3 fRgb = pow(flagTex.rgb, vec3(2.2));

          // Translucent black layer (kedalaman smoked 3D)
          if (isClick && s < 0.96) {
            fRgb = mix(fRgb, vec3(0.0), 0.38);
          } else if (isSel) {
            fRgb = mix(fRgb, vec3(0.0), 0.20);
          } else if (isHov) {
            fRgb = mix(fRgb, vec3(0.0), 0.12);
          }
          color = mix(color, fRgb, flagTex.a);
        }
      }

      // Crisp white box border strictly framing the selected tile (kotak aja)
      if (isSel) {
        float bDistX = 0.0;
        float bDistY = 0.0;
        if (isAutoCol) {
          float totalX = (floorBaseUV.x - (-1.0)) / 2.0;
          float scaledTotalX = 0.5 + (totalX - 0.5) / s;
          float scaledY = 0.5 + (cUV.y - 0.5) / s;
          bDistX = min(scaledTotalX, 1.0 - scaledTotalX) * 2.0;
          bDistY = min(scaledY, 1.0 - scaledY);
        } else {
          vec2 pCentered = cUV - vec2(0.5);
          vec2 scaledUV = vec2(0.5) + pCentered / s;
          bDistX = min(scaledUV.x, 1.0 - scaledUV.x);
          bDistY = min(scaledUV.y, 1.0 - scaledUV.y);
        }
        float dEdge = min(bDistX, bDistY);
        float cellBrd = 1.0 - smoothstep(0.003, 0.024, dEdge);
        vec3 brdCol = vec3(1.0, 1.0, 1.0);
        color += brdCol * cellBrd * 1.5;
      }
    }
  }

  float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898,78.233))) * 43758.5453123);
  color += (n - 0.5) * uNoise;
  color = clamp(color, 0.0, 1.0);
  float alpha = clamp(max(lineVis, combinedPulse), 0.0, 1.0);
  float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + aax * 2.0, ax);
  float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + aay * 2.0, ay);
  float halo = max(gx, gy) * fade;
  alpha = max(alpha, halo * clamp(uBloomOpacity, 0.0, 1.0));

  if (uShowFlags > 0.5 && hitIsY > 0.5 && hit.y < -0.19) {
    vec2 floorBaseUV = hit.xz / gridScale;
    float fRow = floor(floorBaseUV.y);
    float fCol = floor(floorBaseUV.x);
    if (abs(fRow - uFlagRow) < 0.1 && fCol >= -4.0 && fCol <= 3.0) {
      alpha = 1.0;
    }
    if (outGlowAlpha > 0.0) {
      alpha = max(alpha, outGlowAlpha);
    }
  }
  if (uLightMode > 0.5) {
    float energy = max(max(color.r, color.g), color.b);
    float coverage = clamp(max(alpha, smoothstep(0.0, 0.55, energy) * 0.82), 0.0, 0.9);
    coverage *= smoothstep(0.015, 0.12, energy);
    vec3 chroma = clamp(color / max(energy, 0.0001), 0.0, 1.0);
    chroma = pow(chroma, vec3(1.2));
    fragColor = vec4(mix(vec3(1.0), chroma, coverage * 0.94), 1.0);
  } else {
    fragColor = vec4(color, alpha);
  }
}

void main(){
  vec4 c;
  mainImage(c, vUv * iResolution.xy);
  gl_FragColor = c;
}
`;

export const GridScan: React.FC<GridScanProps> = ({
  enableHover = false,
  enableWebcam = false,
  showPreview = false,
  modelsPath = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights',
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = '#2F293A',
  scanColor = '#FF9FFC',
  scanOpacity = 0.4,
  gridScale = 0.1,
  lineStyle = 'solid',
  lineJitter = 0.1,
  scanDirection = 'pingpong',
  enablePost = true,
  bloomIntensity = 0,
  bloomThreshold = 0,
  bloomSmoothing = 0,
  chromaticAberration = 0.002,
  noiseIntensity = 0.01,
  scanGlow = 0.5,
  scanSoftness = 2,
  scanPhaseTaper = 0.9,
  scanDuration = 2.0,
  scanDelay = 2.0,
  enableGyro = false,
  scanOnClick = false,
  snapBackDelay = 250,
  lightMode = false,
  showFloorFlags = false,
  floorFlagRow = 4.0,
  selectedLanguage = 'auto',
  onSelectLanguage,
  className,
  style
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomRef = useRef<BloomEffect | null>(null);
  const chromaRef = useRef<ChromaticAberrationEffect | null>(null);
  const rafRef = useRef<number | null>(null);
  const flagAtlasRef = useRef<THREE.CanvasTexture | null>(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [uiFaceActive, setUiFaceActive] = useState(false);
  const hoveredColRef = useRef<number>(-999);
  const clickScaleRef = useRef<number>(1.0);
  const clickScaleVelRef = useRef<number>(0.0);
  const clickColRef = useRef<number>(-999);
  const isPressingRef = useRef<boolean>(false);

  const lookTarget = useRef(new THREE.Vector2(0, 0));
  const tiltTarget = useRef(0);
  const yawTarget = useRef(0);

  const lookCurrent = useRef(new THREE.Vector2(0, 0));
  const lookVel = useRef(new THREE.Vector2(0, 0));
  const tiltCurrent = useRef(0);
  const tiltVel = useRef(0);
  const yawCurrent = useRef(0);
  const yawVel = useRef(0);

  const MAX_SCANS = 8;
  const scanStartsRef = useRef<number[]>([]);

  const pushScan = (t: number) => {
    const arr = scanStartsRef.current.slice();
    if (arr.length >= MAX_SCANS) arr.shift();
    arr.push(t);
    scanStartsRef.current = arr;
    if (materialRef.current) {
      const u = materialRef.current.uniforms;
      const buf = new Array(MAX_SCANS).fill(0);
      for (let i = 0; i < arr.length && i < MAX_SCANS; i++) buf[i] = arr[i];
      u.uScanStarts.value = buf;
      u.uScanCount.value = arr.length;
    }
  };

  const bufX = useRef<number[]>([]);
  const bufY = useRef<number[]>([]);
  const bufT = useRef<number[]>([]);
  const bufYaw = useRef<number[]>([]);

  const s = THREE.MathUtils.clamp(sensitivity, 0, 1);
  const skewScale = THREE.MathUtils.lerp(0.06, 0.2, s);
  const tiltScale = THREE.MathUtils.lerp(0.12, 0.3, s);
  const yawScale = THREE.MathUtils.lerp(0.1, 0.28, s);
  const depthResponse = THREE.MathUtils.lerp(0.25, 0.45, s);
  const smoothTime = THREE.MathUtils.lerp(0.45, 0.12, s);
  const maxSpeed = Infinity;

  const yBoost = THREE.MathUtils.lerp(1.2, 1.6, s);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let leaveTimer: number | null = null;
    const onMove = (e: MouseEvent) => {
      if (!enableHover) return;
      if (uiFaceActive) return;
      if (leaveTimer) {
        clearTimeout(leaveTimer);
        leaveTimer = null;
      }
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      lookTarget.current.set(nx, ny);
    };
    const onClick = async () => {
      const nowSec = performance.now() / 1000;
      if (scanOnClick) pushScan(nowSec);
      if (
        enableGyro &&
        typeof window !== 'undefined' &&
        (window as any).DeviceOrientationEvent &&
        (DeviceOrientationEvent as any).requestPermission
      ) {
        try {
          await (DeviceOrientationEvent as any).requestPermission();
        } catch {}
      }
    };
    const onEnter = () => {
      if (!enableHover) return;
      if (leaveTimer) {
        clearTimeout(leaveTimer);
        leaveTimer = null;
      }
    };
    const onLeave = () => {
      if (!enableHover) return;
      if (uiFaceActive) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(
        () => {
          lookTarget.current.set(0, 0);
          tiltTarget.current = 0;
          yawTarget.current = 0;
        },
        Math.max(0, snapBackDelay || 0)
      );
    };
    const handlePointerMove = (e: MouseEvent) => {
      if (enableHover) onMove(e);

      if (showFloorFlags) {
        const cell = getFloorCellUnderPointer(el, e.clientX, e.clientY, gridScale);
        if (cell && Math.abs(cell.row - floorFlagRow) < 0.5 && cell.col >= -4 && cell.col <= 3) {
          const item = getFloorFlagItem(cell.col);
          if (item) {
            if (hoveredColRef.current !== item.col) {
              hoveredColRef.current = item.col;
              if (materialRef.current) {
                materialRef.current.uniforms.uHoveredFlagCol.value = item.col;
              }
            }
            el.style.cursor = 'pointer';
            return;
          }
        }
        if (hoveredColRef.current !== -999) {
          hoveredColRef.current = -999;
          el.style.cursor = 'default';
          if (materialRef.current) {
            materialRef.current.uniforms.uHoveredFlagCol.value = -999;
          }
        }
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (showFloorFlags) {
        const cell = getFloorCellUnderPointer(el, e.clientX, e.clientY, gridScale);
        if (cell && Math.abs(cell.row - floorFlagRow) < 0.5 && cell.col >= -4 && cell.col <= 3) {
          const item = getFloorFlagItem(cell.col);
          if (item) {
            isPressingRef.current = true;
            clickColRef.current = item.col;
            clickScaleRef.current = 0.84;
            clickScaleVelRef.current = -0.3;
            if (materialRef.current) {
              materialRef.current.uniforms.uClickCol.value = item.col;
              materialRef.current.uniforms.uClickScale.value = 0.84;
            }
          }
        }
      }
    };

    const handlePointerUp = () => {
      isPressingRef.current = false;
    };

    const handlePointerClick = async (e: MouseEvent) => {
      if (showFloorFlags) {
        const cell = getFloorCellUnderPointer(el, e.clientX, e.clientY, gridScale);
        if (cell && Math.abs(cell.row - floorFlagRow) < 0.5 && cell.col >= -4 && cell.col <= 3) {
          const item = getFloorFlagItem(cell.col);
          if (item) {
            clickColRef.current = item.col;
            clickScaleRef.current = 0.84;
            clickScaleVelRef.current = 0.35; // spring bounce recoil up to 0.91
            isPressingRef.current = false;
            if (materialRef.current) {
              materialRef.current.uniforms.uClickCol.value = item.col;
              materialRef.current.uniforms.uClickScale.value = 0.84;
              materialRef.current.uniforms.uSelectedFlagCol.value = item.col;
            }
            onSelectLanguage?.(item.code);
            const nowSec = performance.now() / 1000;
            if (scanOnClick) pushScan(nowSec);
            return;
          }
        }
      }
      onClick();
    };

    const handlePointerLeave = () => {
      isPressingRef.current = false;
      if (hoveredColRef.current !== -999) {
        hoveredColRef.current = -999;
        el.style.cursor = 'default';
        if (materialRef.current) {
          materialRef.current.uniforms.uHoveredFlagCol.value = -999;
        }
      }
      onLeave();
    };

    el.addEventListener('mousemove', handlePointerMove);
    el.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);
    el.addEventListener('mouseleave', handlePointerLeave);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('click', handlePointerClick);

    return () => {
      el.removeEventListener('mousemove', handlePointerMove);
      el.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      el.removeEventListener('mouseleave', handlePointerLeave);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('click', handlePointerClick);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [uiFaceActive, snapBackDelay, scanOnClick, enableGyro, enableHover, showFloorFlags, floorFlagRow, gridScale, onSelectLanguage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const flagAtlas = createFlagTextureAtlas();
    flagAtlasRef.current = flagAtlas;

    const selectedItem = FLOOR_FLAGS.find((f) => f.code === selectedLanguage || (f.code === 'auto' && (selectedLanguage === 'multi' || selectedLanguage === 'auto')));
    const initialSelectedCol = selectedItem ? selectedItem.col : -1;

    const uniforms = {
      iResolution: {
        value: new THREE.Vector3(container.clientWidth, container.clientHeight, renderer.getPixelRatio())
      },
      iTime: { value: 0 },
      uSkew: { value: new THREE.Vector2(0, 0) },
      uTilt: { value: 0 },
      uYaw: { value: 0 },
      uLineThickness: { value: lineThickness },
      uLinesColor: { value: srgbColor(linesColor) },
      uScanColor: { value: srgbColor(scanColor) },
      uGridScale: { value: gridScale },
      uLineStyle: { value: lineStyle === 'dashed' ? 1 : lineStyle === 'dotted' ? 2 : 0 },
      uLineJitter: { value: Math.max(0, Math.min(1, lineJitter || 0)) },
      uScanOpacity: { value: scanOpacity },
      uNoise: { value: noiseIntensity },
      uBloomOpacity: { value: bloomIntensity },
      uScanGlow: { value: scanGlow },
      uScanSoftness: { value: scanSoftness },
      uPhaseTaper: { value: scanPhaseTaper },
      uScanDuration: { value: scanDuration },
      uScanDelay: { value: scanDelay },
      uScanDirection: { value: scanDirection === 'backward' ? 1 : scanDirection === 'pingpong' ? 2 : 0 },
      uScanStarts: { value: new Array(MAX_SCANS).fill(0) },
      uScanCount: { value: 0 },
      uLightMode: { value: lightMode ? 1 : 0 },
      uFlagAtlas: { value: flagAtlas },
      uShowFlags: { value: showFloorFlags ? 1.0 : 0.0 },
      uSelectedFlagCol: { value: initialSelectedCol },
      uHoveredFlagCol: { value: -999.0 },
      uClickCol: { value: -999.0 },
      uClickScale: { value: 1.0 },
      uFlagRow: { value: floorFlagRow }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: false
    });
    materialRef.current = material;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    let composer: EffectComposer | null = null;
    if (enablePost) {
      composer = new EffectComposer(renderer);
      composerRef.current = composer;
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloom = new BloomEffect({
        intensity: 1.0,
        luminanceThreshold: bloomThreshold,
        luminanceSmoothing: bloomSmoothing
      });
      bloom.blendMode.opacity.value = Math.max(0, bloomIntensity);
      bloomRef.current = bloom;

      const chroma = new ChromaticAberrationEffect({
        offset: new THREE.Vector2(chromaticAberration, chromaticAberration),
        radialModulation: true,
        modulationOffset: 0.0
      });
      chromaRef.current = chroma;

      const effectPass = new EffectPass(camera, bloom, chroma);
      effectPass.renderToScreen = true;
      composer.addPass(effectPass);
    }

    const onResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      material.uniforms.iResolution.value.set(container.clientWidth, container.clientHeight, renderer.getPixelRatio());
      if (composerRef.current) composerRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;

      lookCurrent.current.copy(
        smoothDampVec2(lookCurrent.current, lookTarget.current, lookVel.current, smoothTime, maxSpeed, dt)
      );

      const tiltSm = smoothDampFloat(
        tiltCurrent.current,
        tiltTarget.current,
        { v: tiltVel.current },
        smoothTime,
        maxSpeed,
        dt
      );
      tiltCurrent.current = tiltSm.value;
      tiltVel.current = tiltSm.v;

      const yawSm = smoothDampFloat(
        yawCurrent.current,
        yawTarget.current,
        { v: yawVel.current },
        smoothTime,
        maxSpeed,
        dt
      );
      yawCurrent.current = yawSm.value;
      yawVel.current = yawSm.v;

      if (!enableHover && !uiFaceActive && !enableGyro) {
        material.uniforms.uSkew.value.set(0, 0);
        material.uniforms.uTilt.value = 0;
        material.uniforms.uYaw.value = 0;
      } else {
        const skew = new THREE.Vector2(lookCurrent.current.x * skewScale, -lookCurrent.current.y * yBoost * skewScale);
        material.uniforms.uSkew.value.set(skew.x, skew.y);
        material.uniforms.uTilt.value = tiltCurrent.current * tiltScale;
        material.uniforms.uYaw.value = THREE.MathUtils.clamp(yawCurrent.current * yawScale, -0.6, 0.6);
      }

      if (clickColRef.current > -900) {
        const isSelCol = (clickColRef.current === material.uniforms.uSelectedFlagCol.value);
        const targetScale = isPressingRef.current ? 0.84 : (isSelCol ? 0.91 : 1.0);
        const k = 190.0;
        const damping = 15.0;
        const diff = clickScaleRef.current - targetScale;
        const accel = -k * diff - damping * clickScaleVelRef.current;
        clickScaleVelRef.current += accel * dt;
        clickScaleRef.current += clickScaleVelRef.current * dt;

        if (!isPressingRef.current && Math.abs(diff) < 0.002 && Math.abs(clickScaleVelRef.current) < 0.01) {
          clickScaleRef.current = targetScale;
          clickScaleVelRef.current = 0;
          clickColRef.current = -999;
        }

        material.uniforms.uClickScale.value = clickScaleRef.current;
        material.uniforms.uClickCol.value = clickColRef.current;
      }

      material.uniforms.iTime.value = now / 1000;
      renderer.clear(true, true, true);
      if (composerRef.current) {
        composerRef.current.render(dt);
      } else {
        renderer.render(scene, camera);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      material.dispose();
      (quad.geometry as THREE.BufferGeometry).dispose();
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }
      if (flagAtlasRef.current) {
        flagAtlasRef.current.dispose();
        flagAtlasRef.current = null;
      }
      renderer.dispose();
      renderer.forceContextLoss();
      container.removeChild(renderer.domElement);
    };
  }, [
    enableHover,
    uiFaceActive,
    enableGyro,
    sensitivity,
    lineThickness,
    linesColor,
    scanColor,
    scanOpacity,
    gridScale,
    lineStyle,
    lineJitter,
    scanDirection,
    enablePost
  ]);

  useEffect(() => {
    const m = materialRef.current;
    if (m) {
      const u = m.uniforms;
      u.uLineThickness.value = lineThickness;
      (u.uLinesColor.value as THREE.Color).copy(srgbColor(linesColor));
      (u.uScanColor.value as THREE.Color).copy(srgbColor(scanColor));
      u.uGridScale.value = gridScale;
      u.uLineStyle.value = lineStyle === 'dashed' ? 1 : lineStyle === 'dotted' ? 2 : 0;
      u.uLineJitter.value = Math.max(0, Math.min(1, lineJitter || 0));
      u.uBloomOpacity.value = Math.max(0, bloomIntensity);
      u.uNoise.value = Math.max(0, noiseIntensity);
      u.uScanGlow.value = scanGlow;
      u.uScanOpacity.value = Math.max(0, Math.min(1, scanOpacity));
      u.uScanDirection.value = scanDirection === 'backward' ? 1 : scanDirection === 'pingpong' ? 2 : 0;
      u.uScanSoftness.value = scanSoftness;
      u.uPhaseTaper.value = scanPhaseTaper;
      u.uScanDuration.value = Math.max(0.05, scanDuration);
      u.uScanDelay.value = Math.max(0.0, scanDelay);
      u.uLightMode.value = lightMode ? 1 : 0;
      u.uShowFlags.value = showFloorFlags ? 1.0 : 0.0;
      u.uFlagRow.value = floorFlagRow;
    }
    if (bloomRef.current) {
      bloomRef.current.blendMode.opacity.value = Math.max(0, bloomIntensity);
      (bloomRef.current as any).luminanceMaterial.threshold = bloomThreshold;
      (bloomRef.current as any).luminanceMaterial.smoothing = bloomSmoothing;
    }
    if (chromaRef.current) {
      chromaRef.current.offset.set(chromaticAberration, chromaticAberration);
    }
  }, [
    lineThickness,
    linesColor,
    scanColor,
    gridScale,
    lineStyle,
    lineJitter,
    bloomIntensity,
    bloomThreshold,
    bloomSmoothing,
    chromaticAberration,
    noiseIntensity,
    scanGlow,
    scanOpacity,
    scanDirection,
    scanSoftness,
    scanPhaseTaper,
    scanDuration,
    scanDelay,
    lightMode,
    showFloorFlags,
    floorFlagRow
  ]);

  useEffect(() => {
    if (!materialRef.current) return;
    const item = FLOOR_FLAGS.find((f) => f.code === selectedLanguage || (f.code === 'auto' && (selectedLanguage === 'multi' || selectedLanguage === 'auto')));
    const col = item ? item.col : -1;
    materialRef.current.uniforms.uSelectedFlagCol.value = col;
  }, [selectedLanguage]);

  useEffect(() => {
    if (!enableGyro) return;
    const handler = (e: DeviceOrientationEvent) => {
      if (uiFaceActive) return;
      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 0;
      const nx = THREE.MathUtils.clamp(gamma / 45, -1, 1);
      const ny = THREE.MathUtils.clamp(-beta / 30, -1, 1);
      lookTarget.current.set(nx, ny);
      tiltTarget.current = THREE.MathUtils.degToRad(gamma) * 0.4;
    };
    window.addEventListener('deviceorientation', handler);
    return () => {
      window.removeEventListener('deviceorientation', handler);
    };
  }, [enableGyro, uiFaceActive]);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelsPath)
        ]);
        if (!canceled) setModelsReady(true);
      } catch {
        if (!canceled) setModelsReady(false);
      }
    };
    load();
    return () => {
      canceled = true;
    };
  }, [modelsPath]);

  useEffect(() => {
    let stop = false;
    let lastDetect = 0;

    const start = async () => {
      if (!enableWebcam || !modelsReady) return;
      const video = videoRef.current;
      if (!video) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        video.srcObject = stream;
        await video.play();
      } catch {
        return;
      }

      const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });

      const detect = async (ts: number) => {
        if (stop) return;

        if (ts - lastDetect >= 33) {
          lastDetect = ts;
          try {
            const res = await faceapi.detectSingleFace(video, opts).withFaceLandmarks(true);
            if (res && res.detection) {
              const det = res.detection;
              const box = det.box;
              const vw = video.videoWidth || 1;
              const vh = video.videoHeight || 1;

              const cx = box.x + box.width * 0.5;
              const cy = box.y + box.height * 0.5;
              const nx = (cx / vw) * 2 - 1;
              const ny = (cy / vh) * 2 - 1;
              medianPush(bufX.current, nx, 5);
              medianPush(bufY.current, ny, 5);
              const nxm = median(bufX.current);
              const nym = median(bufY.current);

              const look = new THREE.Vector2(Math.tanh(nxm), Math.tanh(nym));

              const faceSize = Math.min(1, Math.hypot(box.width / vw, box.height / vh));
              const depthScale = 1 + depthResponse * (faceSize - 0.25);
              lookTarget.current.copy(look.multiplyScalar(depthScale));

              const leftEye = res.landmarks.getLeftEye();
              const rightEye = res.landmarks.getRightEye();
              const lc = centroid(leftEye);
              const rc = centroid(rightEye);
              const tilt = Math.atan2(rc.y - lc.y, rc.x - lc.x);
              medianPush(bufT.current, tilt, 5);
              tiltTarget.current = median(bufT.current);

              const nose = res.landmarks.getNose();
              const tip = nose[nose.length - 1] || nose[Math.floor(nose.length / 2)];
              const jaw = res.landmarks.getJawOutline();
              const leftCheek = jaw[3] || jaw[2];
              const rightCheek = jaw[13] || jaw[14];
              const dL = dist2(tip, leftCheek);
              const dR = dist2(tip, rightCheek);
              const eyeDist = Math.hypot(rc.x - lc.x, rc.y - lc.y) + 1e-6;
              let yawSignal = THREE.MathUtils.clamp((dR - dL) / (eyeDist * 1.6), -1, 1);
              yawSignal = Math.tanh(yawSignal);
              medianPush(bufYaw.current, yawSignal, 5);
              yawTarget.current = median(bufYaw.current);

              setUiFaceActive(true);
            } else {
              setUiFaceActive(false);
            }
          } catch {
            setUiFaceActive(false);
          }
        }

        if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
          (video as any).requestVideoFrameCallback(() => detect(performance.now()));
        } else {
          requestAnimationFrame(detect);
        }
      };

      requestAnimationFrame(detect);
    };

    start();

    return () => {
      stop = true;
      const video = videoRef.current;
      if (video) {
        const stream = video.srcObject as MediaStream | null;
        if (stream) stream.getTracks().forEach(t => t.stop());
        video.pause();
        video.srcObject = null;
      }
    };
  }, [enableWebcam, modelsReady, depthResponse]);

  return (
    <div ref={containerRef} className={`gridscan${className ? ` ${className}` : ''}`} style={style}>
      {showPreview && (
        <div className="gridscan__preview">
          <video ref={videoRef} muted playsInline autoPlay className="gridscan__video" />
          <div className="gridscan__badge">
            {enableWebcam
              ? modelsReady
                ? uiFaceActive
                  ? 'Face: tracking'
                  : 'Face: searching'
                : 'Loading models'
              : 'Webcam disabled'}
          </div>
        </div>
      )}

    </div>
  );
};

function srgbColor(hex: string) {
  const c = new THREE.Color(hex);
  return c.convertSRGBToLinear();
}

function smoothDampVec2(
  current: THREE.Vector2,
  target: THREE.Vector2,
  currentVelocity: THREE.Vector2,
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
): THREE.Vector2 {
  const out = current.clone();
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let change = current.clone().sub(target);
  const originalTo = target.clone();

  const maxChange = maxSpeed * smoothTime;
  if (change.length() > maxChange) change.setLength(maxChange);

  target = current.clone().sub(change);
  const temp = currentVelocity.clone().addScaledVector(change, omega).multiplyScalar(deltaTime);
  currentVelocity.sub(temp.clone().multiplyScalar(omega));
  currentVelocity.multiplyScalar(exp);

  out.copy(target.clone().add(change.add(temp).multiplyScalar(exp)));

  const origMinusCurrent = originalTo.clone().sub(current);
  const outMinusOrig = out.clone().sub(originalTo);
  if (origMinusCurrent.dot(outMinusOrig) > 0) {
    out.copy(originalTo);
    currentVelocity.set(0, 0);
  }
  return out;
}

function smoothDampFloat(
  current: number,
  target: number,
  velRef: { v: number },
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
): { value: number; v: number } {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let change = current - target;
  const originalTo = target;

  const maxChange = maxSpeed * smoothTime;
  change = Math.sign(change) * Math.min(Math.abs(change), maxChange);

  target = current - change;
  const temp = (velRef.v + omega * change) * deltaTime;
  velRef.v = (velRef.v - omega * temp) * exp;

  let out = target + (change + temp) * exp;

  const origMinusCurrent = originalTo - current;
  const outMinusOrig = out - originalTo;
  if (origMinusCurrent * outMinusOrig > 0) {
    out = originalTo;
    velRef.v = 0;
  }
  return { value: out, v: velRef.v };
}

function medianPush(buf: number[], v: number, maxLen: number) {
  buf.push(v);
  if (buf.length > maxLen) buf.shift();
}

function median(buf: number[]) {
  if (buf.length === 0) return 0;
  const a = [...buf].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) * 0.5;
}

function centroid(points: { x: number; y: number }[]) {
  let x = 0,
    y = 0;
  const n = points.length || 1;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  return { x: x / n, y: y / n };
}

function dist2(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default GridScan;

