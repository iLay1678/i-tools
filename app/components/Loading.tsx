"use client";

import { useState, useEffect } from "react";

export default function Loading() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPageLoaded = () => {
      if (document.readyState === "complete") {
        setLoading(false);
      }
    };

    if (document.readyState === "complete") {
      setLoading(false);
    } else {
      window.addEventListener("load", checkPageLoaded);
    }

    return () => {
      window.removeEventListener("load", checkPageLoaded);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-wave">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="loading-text">加载中...</div>
      </div>

      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #f8fafc;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .loading-wave {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          height: 40px;
          gap: 8px;
        }

        .loading-wave > div {
          width: 8px;
          height: 100%;
          background: linear-gradient(45deg, #60a5fa, #3b82f6);
          border-radius: 4px;
          animation: wave 1s ease-in-out infinite;
        }

        .loading-wave > div:nth-child(2) { animation-delay: 0.1s; }
        .loading-wave > div:nth-child(3) { animation-delay: 0.2s; }
        .loading-wave > div:nth-child(4) { animation-delay: 0.3s; }
        .loading-wave > div:nth-child(5) { animation-delay: 0.4s; }

        .loading-text {
          color: #3b82f6;
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
