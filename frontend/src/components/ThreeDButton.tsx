import React from 'react';

export interface ThreeDButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const ThreeDButton: React.FC<ThreeDButtonProps> = ({
  children,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <>
      <style>{`
        .btn-3d-box {
          -webkit-appearance: none;
          appearance: none;
          position: relative;
          border-width: 0;
          padding: 0 4px 10px;
          min-width: 10em;
          box-sizing: border-box;
          background: transparent;
          font: inherit;
          cursor: pointer;
          border-radius: 0 !important;
        }

        .btn-3d-top {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 0;
          padding: 10px 22px;
          transform: translateY(0);
          text-align: center;
          color: #000000;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: transform 0.15s ease-out;
          -webkit-user-select: none;
          user-select: none;
          border-radius: 0 !important;
        }

        .btn-3d-box:hover .btn-3d-top {
          transform: translateY(-1px);
        }

        .btn-3d-box:active .btn-3d-top {
          transform: translateY(6px);
        }

        .btn-3d-top::after {
          content: '';
          position: absolute;
          z-index: -1;
          border-radius: 0 !important;
          inset: 0;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          background: #ffffff;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 -1px 1px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.15);
          transition: all 0.15s ease-out;
        }

        .btn-3d-bottom {
          position: absolute;
          z-index: -1;
          bottom: 2px;
          left: 2px;
          border-radius: 0 !important;
          padding-top: 6px;
          width: calc(100% - 4px);
          height: calc(100% - 8px);
          box-sizing: border-box;
          background-color: #000000;
          border: 1px solid #3f3f46;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.8), inset 0 -1px 2px rgba(255, 255, 255, 0.1);
          transition: padding-top 0.15s ease-out;
        }

        .btn-3d-box:active .btn-3d-bottom {
          padding-top: 0;
        }

        .btn-3d-base {
          position: absolute;
          z-index: -2;
          top: 4px;
          left: 0;
          border-radius: 0 !important;
          width: 100%;
          height: calc(100% - 4px);
          background-color: #000000;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
        }
      `}</style>
      <button
        type={type}
        className={`btn-3d-box ${className}`}
        onClick={onClick}
        {...props}
      >
        <div className="btn-3d-top">{children}</div>
        <div className="btn-3d-bottom" />
        <div className="btn-3d-base" />
      </button>
    </>
  );
};

export default ThreeDButton;

