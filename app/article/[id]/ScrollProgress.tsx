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
          background: #e8e8e8;
          z-index: 50;
        }

        .sp-mobile-fill {
          height: 100%;
          background: #3D6B4F;
          transition: width 0.15s linear;
        }

        /* 데스크톱: 오른쪽 세로 네모 박스 */
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
            right: calc((100vw - 640px) / 2 - 56px);
            top: 50%;
            transform: translateY(-50%);
            z-index: 50;
          }

          .sp-track {
            width: 8px;
            height: 140px;
            background: #e8e8e8;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
          }

          .sp-fill {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #3D6B4F;
            border-radius: 4px;
            transition: height 0.15s linear;
          }
        }

        @media (min-width: 769px) and (max-width: 880px) {
          .sp-side {
            right: 12px;
          }
        }
      `}</style>

      {/* 모바일: 상단 가로 바 */}
      <div className="sp-mobile">
        <div className="sp-mobile-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* 데스크톱: 오른쪽 세로 박스 */}
      <div className="sp-side">
        <div className="sp-track">
          <div className="sp-fill" style={{ height: `${progress}%` }} />
        </div>
      </div>
    </>
  );
}
