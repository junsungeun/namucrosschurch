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
          background: #D6E4DA;
          z-index: 50;
        }

        .sp-mobile-fill {
          height: 100%;
          background: #3D6B4F;
          transition: width 0.12s linear;
        }

        /* 데스크톱: 오른쪽 끝 전체 높이 세로 바 */
        .sp-side {
          display: none;
        }

        @media (min-width: 769px) {
          .sp-mobile {
            display: none;
          }

          .sp-side {
            position: fixed;
            display: block;
            top: 0;
            right: 0;
            width: 20px;
            height: 100vh;
            background: #D6E4DA;
            z-index: 50;
          }

          .sp-fill {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background: #3D6B4F;
            transition: height 0.12s linear;
          }
        }
      `}</style>

      {/* 모바일: 상단 가로 바 */}
      <div className="sp-mobile">
        <div className="sp-mobile-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* 데스크톱: 오른쪽 끝 전체 높이 */}
      <div className="sp-side">
        <div className="sp-fill" style={{ height: `${progress}%` }} />
      </div>
    </>
  );
}
