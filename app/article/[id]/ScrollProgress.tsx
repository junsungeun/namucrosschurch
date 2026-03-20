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
        .sp-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: #3D6B4F;
          z-index: 50;
          transition: width 0.1s linear;
        }

        /* 데스크톱: 오른쪽 네모 박스 */
        .sp-box {
          display: none;
        }

        @media (min-width: 769px) {
          .sp-bar {
            display: none;
          }

          .sp-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            position: fixed;
            right: calc((100vw - 640px) / 2 - 80px);
            top: 50%;
            transform: translateY(-50%);
            z-index: 50;
          }

          .sp-track {
            width: 4px;
            height: 120px;
            background: #eee;
            border-radius: 2px;
            overflow: hidden;
            position: relative;
          }

          .sp-fill {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #3D6B4F;
            border-radius: 2px;
            transition: height 0.1s linear;
          }

          .sp-pct {
            font-family: 'Pretendard Variable', 'Pretendard', sans-serif;
            font-size: 11px;
            font-weight: 600;
            color: #3D6B4F;
          }
        }

        @media (min-width: 769px) and (max-width: 900px) {
          .sp-box {
            right: 16px;
          }
        }
      `}</style>

      {/* 모바일 상단 바 */}
      <div className="sp-bar" style={{ width: `${progress}%` }} />

      {/* 데스크톱 오른쪽 박스 */}
      <div className="sp-box">
        <div className="sp-pct">{progress}%</div>
        <div className="sp-track">
          <div className="sp-fill" style={{ height: `${progress}%` }} />
        </div>
      </div>
    </>
  );
}
