import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Only active on routes where in-memory processing is ongoing
const SENSITIVE_ROUTES = ['/processing'];

export const RefreshWarningBanner: React.FC = () => {
  const location = useLocation();
  const [bannerVisible, setBannerVisible] = useState(false);

  const isSensitivePage = SENSITIVE_ROUTES.some(r => location.pathname === r || location.pathname.startsWith(r + '/'));

  // 1. Intercept F5 / Ctrl+R / browser refresh during active document processing
  useEffect(() => {
    if (!isSensitivePage) {
      setBannerVisible(false);
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Your documents are being processed. Refreshing will interrupt the analysis.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    setBannerVisible(true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSensitivePage, location.pathname]);

  const dismiss = () => {
    setBannerVisible(false);
  };

  if (!isSensitivePage || !bannerVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        padding: '14px 16px',
        borderRadius: '14px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)',
        fontSize: '13px',
        fontFamily: 'Inter, system-ui, sans-serif',
        maxWidth: '320px',
        animation: 'sahayakSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: '16px',
      }}>
        ⚡
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '3px', lineHeight: 1.3 }}>
          Processing in progress
        </div>
        <div style={{ opacity: 0.7, fontSize: '12px', lineHeight: 1.4 }}>
          Please do not refresh while your documents are being analyzed.
        </div>
      </div>

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#94a3b8',
          borderRadius: '6px',
          cursor: 'pointer',
          padding: '2px 8px',
          fontSize: '16px',
          lineHeight: 1,
          flexShrink: 0,
          alignSelf: 'flex-start',
        }}
      >
        ×
      </button>

      <style>{`
        @keyframes sahayakSlideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
};

