import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const INNER_ROUTES = ['/upload', '/processing', '/review', '/schemes', '/scheme-details'];

export const RefreshWarningBanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerVisible, setBannerVisible] = useState(false);

  const isInnerPage = INNER_ROUTES.some(r => location.pathname.startsWith(r));

  // 1. Intercept F5 / Ctrl+R / browser refresh — show native browser warning
  useEffect(() => {
    if (!isInnerPage) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = 'Refreshing will break the page. Use the app navigation instead.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isInnerPage]);

  // 2. Show an in-app sticky tip banner (always visible on inner pages, dismissible)
  useEffect(() => {
    if (!isInnerPage) return;
    const dismissed = sessionStorage.getItem('sahayak_refresh_tip_ok');
    if (!dismissed) setBannerVisible(true);
  }, [isInnerPage, location.pathname]);

  const dismiss = () => {
    setBannerVisible(false);
    sessionStorage.setItem('sahayak_refresh_tip_ok', '1');
  };

  if (!isInnerPage || !bannerVisible) return null;

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
        padding: '16px 18px',
        borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)',
        fontSize: '13px',
        fontFamily: 'Inter, system-ui, sans-serif',
        maxWidth: '340px',
        animation: 'sahayakSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: '18px',
      }}>
        ⚡
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '5px', lineHeight: 1.3 }}>
          Don't refresh this page!
        </div>
        <div style={{ opacity: 0.65, lineHeight: 1.5 }}>
          Refreshing causes a 404 error. Instead, use the{' '}
          <button
            onClick={() => { navigate('/'); dismiss(); }}
            style={{
              color: '#38bdf8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: '13px',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            home button
          </button>
          {' '}to navigate.
        </div>
      </div>

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#94a3b8',
          borderRadius: '8px',
          cursor: 'pointer',
          padding: '4px 10px',
          fontSize: '18px',
          lineHeight: 1,
          flexShrink: 0,
          alignSelf: 'flex-start',
          marginTop: '-2px',
        }}
      >
        ×
      </button>

      <style>{`
        @keyframes sahayakSlideIn {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
};
