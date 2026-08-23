import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const INNER_ROUTES = ['/upload', '/processing', '/review', '/schemes', '/scheme-details'];
const STORAGE_KEY = 'sahayak_refresh_warning_dismissed';

export const RefreshWarningBanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const isInnerPage = INNER_ROUTES.some(r => location.pathname.startsWith(r));

  useEffect(() => {
    if (!isInnerPage) return;

    // Show banner if user landed here via direct load (no navigation history within the SPA)
    const wasNavigated = sessionStorage.getItem('sahayak_navigated');
    const dismissed = sessionStorage.getItem(STORAGE_KEY);

    if (!wasNavigated && !dismissed) {
      setVisible(true);
    }

    // Mark that user has navigated within the SPA
    sessionStorage.setItem('sahayak_navigated', '1');
  }, [isInnerPage]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
  };

  if (!visible || !isInnerPage) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#1e293b',
        color: '#f1f5f9',
        padding: '14px 20px',
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '14px',
        fontFamily: 'inherit',
        maxWidth: '420px',
        width: 'calc(100vw - 48px)',
        animation: 'slideUp 0.3s ease',
      }}
    >
      <span style={{ fontSize: '22px', flexShrink: 0 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: '2px' }}>Avoid refreshing this page</div>
        <div style={{ opacity: 0.75, fontSize: '12px' }}>
          If you refreshed and see an error,{' '}
          <button
            onClick={() => { navigate('/'); dismiss(); }}
            style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '12px', textDecoration: 'underline' }}
          >
            click here to go home
          </button>
          {' '}and navigate back.
        </div>
      </div>
      <button
        onClick={dismiss}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: '#f1f5f9',
          borderRadius: '8px',
          cursor: 'pointer',
          padding: '6px 10px',
          fontSize: '12px',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        Got it
      </button>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};
