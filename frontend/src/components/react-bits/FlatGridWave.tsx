import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { getStudioSpacing } from '../../utils/gridSpacing';

export interface FlatGridWaveProps {
  lineThickness?: number;
  linesColor?: string;
  lineJitter?: number;
  speed?: number;
  interactive?: boolean;
  anchor?: 'bottom' | 'top';
  className?: string;
  style?: React.CSSProperties;
}

export const FlatGridWave: React.FC<FlatGridWaveProps> = ({
  lineThickness = 2.0,
  linesColor = '#f9f6fe',
  lineJitter = 0.0,
  speed = 1.0,
  interactive = false,
  anchor = 'bottom',
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  });
  const uniformsRef = useRef<any>(null);

  useEffect(() => {
    if (uniformsRef.current) {
      uniformsRef.current.uLineThickness.value = lineThickness;
      uniformsRef.current.uLineJitter.value = lineJitter;
      uniformsRef.current.uSpeed.value = speed;
      uniformsRef.current.uInteractive.value = interactive ? 1.0 : 0.0;
      uniformsRef.current.uLinesColor.value.set(linesColor);
      uniformsRef.current.uAnchorTop.value = anchor === 'top' ? 1.0 : 0.0;
    }
  }, [lineThickness, linesColor, lineJitter, speed, interactive, anchor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const col = new THREE.Color(linesColor);

    const initialSpacing = getStudioSpacing();

    const uniforms = {
      uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(container.clientWidth * 0.5, container.clientHeight * 0.5) },
      uLinesColor: { value: col },
      uGridSpacing: { value: initialSpacing },
      uLineThickness: { value: lineThickness },
      uLineJitter: { value: lineJitter },
      uSpeed: { value: speed },
      uInteractive: { value: interactive ? 1.0 : 0.0 },
      uAnchorTop: { value: anchor === 'top' ? 1.0 : 0.0 }
    };
    uniformsRef.current = uniforms;

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // 2D Planar Orthogonal Grid with exact GridScan style, aligned seamlessly to Studio's ceiling/floor grid
    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uLinesColor;
      uniform float uGridSpacing;
      uniform float uLineThickness;
      uniform float uLineJitter;
      uniform float uSpeed;
      uniform float uInteractive;
      uniform float uAnchorTop;

      void main() {
        // Center x coordinates identically to GridScan's horizontal center
        vec2 gridUV;
        gridUV.x = (gl_FragCoord.x - uResolution.x * 0.5) / uGridSpacing;

        // Y positioning: 'bottom' anchors from bottom edge, 'top' anchors from top edge
        if (uAnchorTop > 0.5) {
          gridUV.y = (uResolution.y - gl_FragCoord.y) / uGridSpacing;
        } else {
          gridUV.y = gl_FragCoord.y / uGridSpacing;
        }

        // Smooth organic sway / wave motion: boxes gently undulate & sway ("goyang-goyang dikit aja")
        float t = uTime * uSpeed;
        float jitterAmt = clamp(uLineJitter, 0.0, 1.0);
        if (jitterAmt > 0.0) {
          float yRef = uAnchorTop > 0.5 ? gridUV.y : (4.0 - gridUV.y);
          float scaleAmt = jitterAmt / 0.1;

          // Primary gentle undulation matching the calm breathing motion of audio drop
          vec2 j = vec2(
            sin(yRef * 1.6 + t * 1.5) * 0.032,
            cos(gridUV.x * 1.5 - t * 1.3) * 0.032
          ) * scaleAmt;

          // Secondary organic harmonic for natural fluid cadence
          j += vec2(
            cos(yRef * 1.0 - t * 0.9) * 0.014,
            sin(gridUV.x * 1.1 + t * 1.0) * 0.014
          ) * scaleAmt;

          // Gentle ambient floating sway of the grid boxes (subtle living breathing motion)
          j += vec2(
            sin(t * 1.05) * 0.016,
            cos(t * 0.85) * 0.016
          );

          // Taper vertical jitter near the bottom edge so the junction line stays cleanly aligned
          float seamBlend = smoothstep(0.0, 0.5, gridUV.y);
          j.y *= seamBlend;

          // Interactive cursor ripple
          if (uInteractive > 0.5) {
            vec2 mGrid = vec2(
              (uMouse.x - uResolution.x * 0.5) / uGridSpacing,
              uMouse.y / uGridSpacing
            );
            float dM = length(gridUV - mGrid);
            float mouseWave = sin(dM * 0.8 - t * 2.6) * exp(-dM * 0.14) * 0.03;
            j += vec2(mouseWave, mouseWave);
          }

          gridUV += j;
        }

        // Anti-aliased line mask calculation matching GridScan
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
        float lineMask = max(lineX, lineY);

        // Soft bloom-like aura along lines matching GridScan post-processing feel
        float glowX = 1.0 - smoothstep(tx, tx + aax * 3.2, ax);
        float glowY = 1.0 - smoothstep(ty, ty + aay * 3.2, ay);
        float glowMask = max(glowX, glowY);

        // Clean, uniform lines with subtle aura on deep black canvas
        vec3 color = uLinesColor * lineMask + uLinesColor * (glowMask * 0.22);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
      uniforms.uGridSpacing.value = getStudioSpacing();
    };

    window.addEventListener('resize', handleResize);

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = rect.height - (e.clientY - rect.top);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Initial mouse center
    mouseRef.current.x = container.clientWidth * 0.5;
    mouseRef.current.y = container.clientHeight * 0.5;
    mouseRef.current.targetX = mouseRef.current.x;
    mouseRef.current.targetY = mouseRef.current.y;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      // Drive uTime directly by performance.now() / 1000 to synchronize in phase with GridScan
      uniforms.uTime.value = performance.now() / 1000;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
      uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [lineThickness, linesColor, lineJitter, speed, interactive]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden bg-black select-none pointer-events-auto ${className}`}
      style={style}
    />
  );
};

export default FlatGridWave;
