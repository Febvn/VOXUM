import React from 'react';

export interface CubeLoaderProps {
  className?: string;
  size?: number; // size in px, defaults to 100
}

export const CubeLoader: React.FC<CubeLoaderProps> = ({ className = '', size = 100 }) => {
  const halfSize = size / 2;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <style>{`
        .loader-cube-viewport {
          perspective: 800px;
        }

        .loader-cube-box {
          position: relative;
          transform-style: preserve-3d;
          transform-origin: 50% 50%;
          animation: cubeRotate 4s infinite linear;
        }

        .loader-cube-face {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1.5px solid rgba(255, 255, 255, 0.65);
          box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(2px);
          backface-visibility: visible;
        }

        /* Monochrome Faces: High-contrast directional lighting shades */
        .face-front {
          transform: rotateY(0deg) translateZ(${halfSize}px);
          background-color: rgba(255, 255, 255, 0.16);
        }

        .face-top {
          transform: rotateX(90deg) translateZ(${halfSize}px);
          background-color: rgba(255, 255, 255, 0.28);
        }

        .face-back {
          transform: rotateY(180deg) translateZ(${halfSize}px);
          background-color: rgba(18, 18, 22, 0.70);
        }

        .face-bottom {
          transform: rotateX(-90deg) translateZ(${halfSize}px);
          background-color: rgba(10, 10, 12, 0.85);
        }

        .face-right {
          transform: rotateY(90deg) translateZ(${halfSize}px);
          background-color: rgba(210, 210, 220, 0.22);
        }

        .face-left {
          transform: rotateY(-90deg) translateZ(${halfSize}px);
          background-color: rgba(60, 60, 70, 0.45);
        }

        @keyframes cubeRotate {
          0% {
            transform: rotateY(0deg) rotateX(0deg);
          }
          100% {
            transform: rotateY(1turn) rotateX(1turn);
          }
        }
      `}</style>

      <div className="loader-cube-viewport flex items-center justify-center">
        <div
          className="loader-cube-box"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <div className="loader-cube-face face-front" />
          <div className="loader-cube-face face-top" />
          <div className="loader-cube-face face-back" />
          <div className="loader-cube-face face-bottom" />
          <div className="loader-cube-face face-right" />
          <div className="loader-cube-face face-left" />
        </div>
      </div>
    </div>
  );
};

export default CubeLoader;

