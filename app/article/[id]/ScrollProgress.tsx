"use client";

import { useState, useEffect } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const scrollHeight = h.scrollHeight - h.clientHeight;
      if (scrollHeight > 0) {
        setProgress(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)));
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        /* 모바일: 상단 가로 바 */
        .sp-mobile {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #E8E0D8;
          z-index: 50;
        }

        .sp-mobile-fill {
          height: 100%;
          background: #3D6B4F;
          transition: width 0.12s linear;
        }

        /* 데스크톱: 오른쪽 세로 직사각형 바 */
        .sp-side {
          display: none;
        }

        @media (min-width: 769px) {
          .sp-mobile {
            display: none;
          }

          .sp-side {
            display: block;
            position: fixed;
            right: calc((100vw - 640px) / 2 - 64px);
            top: 50%;
            transform: translateY(-50%);
            z-index: 50;
          }

          .sp-track {
            width: 16px;
            height: 200px;
            background: #E8E0D8;
            overflow: hidden;
            position: relative;
          }

          .sp-fill {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background: #6B4A3D;
            transition: height 0.12s linear;
          }
        }

        @media (min-width: 769px) and (max-width: 880px) {
          .sp-side {
            right: 8px;
          }
        }
      `}</style>

      {/* 모바일: 상단 가로 바 */}
      <div className="sp-mobile">
        <div className="sp-mobile-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* 데스크톱: 오른쪽 세로 직사각형 */}
      <div className="sp-side">
        <div className="sp-track">
          <div className="sp-fill" style={{ height: `${progress}%` }} />
        </div>
      </div>
    </>
  );
}
