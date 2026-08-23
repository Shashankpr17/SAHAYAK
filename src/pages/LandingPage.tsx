import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('sahayak_token'));
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (isAuthenticated) return;

    // Load Google Identity Services script dynamically
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '2149112259-o2tc61qg5iquupqtmcrkaklnpe85atm3.apps.googleusercontent.com';
      
      try {
        (window as any).google?.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            handleGoogleLogin(response.credential);
          }
        });
        
        const btnContainer = document.getElementById("google-login-btn-container");
        if (btnContainer) {
          (window as any).google?.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            type: "standard",
            shape: "pill",
            text: "continue_with"
          });
        }
      } catch (err) {
        console.error("Failed to initialize Google Sign-In:", err);
      }
    };
    
    document.body.appendChild(script);

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, [isAuthenticated]);

  const handleGuestLogin = () => {
    setIsLoggingIn(true);
    try {
      let guestId = localStorage.getItem('sahayak_guest_id');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
        localStorage.setItem('sahayak_guest_id', guestId);
      }
      
      localStorage.setItem('sahayak_token', guestId);
      localStorage.setItem('sahayak_user', JSON.stringify({
        id: guestId,
        email: 'guest@sahayak.local',
        name: 'Guest User',
        is_guest: true
      }));
      
      setIsAuthenticated(true);
      console.log(`[AUTH] Successfully signed in Guest: ${guestId}`);
      checkProfileAndNavigate(guestId);
    } catch (err) {
      console.error('Guest Sign-In failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const checkProfileAndNavigate = async (token: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://sahayak-seven-rho.vercel.app';
      const res = await fetch(`${apiUrl}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.profile) {
        localStorage.setItem('sahayak_user_profile', JSON.stringify(data.profile));
        navigate('/schemes');
      } else {
        navigate('/upload');
      }
    } catch (err) {
      console.error("Failed to check existing verified profile status:", err);
      navigate('/upload');
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    setIsLoggingIn(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://sahayak-seven-rho.vercel.app';
      const res = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_token: idToken })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('sahayak_token', data.token);
        localStorage.setItem('sahayak_user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        console.log(`[AUTH] Successfully signed in user: ${data.user.email}`);
        await checkProfileAndNavigate(data.token);
      } else {
        alert('Authentication failed: ' + (data.detail || data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Google Sign-In backend connection failed:', err);
      alert('Could not connect to SAHAYAK authentication server. Please check that backend is running.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGetStarted = async () => {
    const token = localStorage.getItem('sahayak_token');
    if (token) {
      setIsLoggingIn(true);
      await checkProfileAndNavigate(token);
      setIsLoggingIn(false);
    } else {
      navigate('/upload');
    }
  };

  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Header />
      
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-section-gap flex flex-col gap-16 md:gap-section-gap flex-grow">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center min-h-[500px] lg:min-h-[600px]">
          <div className="flex flex-col gap-stack-lg max-w-2xl">
            <h1 className="font-display-lg text-4xl md:text-display-lg text-on-surface tracking-tight leading-tight">
              {t("hero_title_1")} <span className="text-primary font-bold">{t("hero_title_2")}</span>
            </h1>
            <p className="font-body-lg text-lg md:text-body-lg text-on-surface-variant leading-relaxed">
              {t("hero_desc")}
            </p>
            <div className="flex flex-wrap gap-4 items-center pt-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleGetStarted}
                    className="font-label-md text-label-md bg-primary-container text-on-primary-container px-6 py-3 rounded-lg hover:shadow-floating transition-all font-bold"
                  >
                    {t("go_to_dashboard")}
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('sahayak_token');
                      localStorage.removeItem('sahayak_user');
                      localStorage.removeItem('sahayak_user_profile');
                      localStorage.removeItem('sahayak_doc_type');
                      localStorage.removeItem('sahayak_selected_scheme');
                      localStorage.removeItem('sahayak_guest_id');
                      setIsAuthenticated(false);
                    }}
                    className="font-label-md text-label-md bg-transparent border border-outline-variant text-on-surface px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors"
                  >
                    {t("logout")}
                  </button>
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-4 py-2">
                  <div id="google-login-btn-container"></div>
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="font-label-md text-label-md bg-secondary text-on-secondary px-6 py-3 rounded-lg hover:shadow-floating transition-all font-bold flex items-center gap-2 border border-transparent hover:bg-secondary/90"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_outline</span>
                    {t("continue_as_guest")}
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowExtensionModal(true)}
                className="font-label-md text-label-md bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">extension</span>
                {t("add_chrome_extension")}
              </button>
              <button
                onClick={() => handleScrollTo('how-it-works')}
                className="font-label-md text-label-md bg-transparent border border-outline-variant text-on-surface px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors"
              >
                {t("how_it_works")}
              </button>
            </div>
          </div>
          
          {/* Hero Illustration / App Preview */}
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] bg-surface-container-highest rounded-xl shadow-natural-bloom overflow-hidden flex items-center justify-center p-8 border border-surface-variant">
            <img 
              className="object-cover w-full h-full rounded-lg mix-blend-multiply"
              alt="SAHAYAK App Preview Illustration"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4Op9CA5mL5Ac4PlgtrGI5EmOj96A64t8Kzu02dWt7PwfKa_pNIoIqHcKHxQ87E-HN9v0K3gBMqfz66Hppid9qRXzClVn8VoWPJpjKQFy6i3M_MpySBgVZV6eSAEAgbZowHYTD68YzuKAVLbtq2RipI5xuyETKjhQ0OhmgawioVDONylYritAk3ufu6PUdK2-qhi2bVTTQXU2dIvuaqeEu8D1_5iPSYE15ytgZjjC1lEW3WwjyjWYlykRY03TLzCvCYrbp9KFw3iiPhw"
            />
          </div>
        </section>

        {/* How it Works / Features Section */}
        <section id="features" className="flex flex-col gap-stack-lg pt-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-headline-lg text-3xl md:text-headline-lg text-on-surface">{t("features_title")}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Feature 1 */}
            <div 
              onClick={handleGetStarted}
              className="bg-surface-container-lowest rounded-xl p-8 shadow-natural-bloom border border-surface-container flex flex-col gap-4 group hover:shadow-floating transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container mb-2 shrink-0">
                <span className="material-symbols-outlined">document_scanner</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">{t("feature_1_title")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t("feature_1_desc")}
              </p>
            </div>
            
            {/* Feature 2 */}
            <div 
              onClick={handleGetStarted}
              className="bg-surface-container-lowest rounded-xl p-8 shadow-natural-bloom border border-surface-container flex flex-col gap-4 group hover:shadow-floating transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container mb-2 shrink-0">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">{t("feature_2_title")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t("feature_2_desc")}
              </p>
            </div>
            
            {/* Feature 3 */}
            <div 
              onClick={handleGetStarted}
              className="bg-surface-container-lowest rounded-xl p-8 shadow-natural-bloom border border-surface-container flex flex-col gap-4 group hover:shadow-floating transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mb-2 shrink-0">
                <span className="material-symbols-outlined">translate</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">{t("feature_3_title")}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t("feature_3_desc")}
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Explainer Block */}
        <section id="how-it-works" className="bg-surface-container-low rounded-2xl p-8 md:p-12 border border-surface-variant/30 flex flex-col gap-8">
          <div>
            <h2 className="font-headline-lg text-2xl md:text-headline-lg text-on-surface font-semibold mb-2">{t("how_it_works_title")}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">{t("how_it_works_desc")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <h4 className="font-title-lg text-title-lg text-on-surface font-semibold mb-1">{t("step_1_title")}</h4>
                <p className="font-body-md text-sm text-on-surface-variant">{t("step_1_desc")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <h4 className="font-title-lg text-title-lg text-on-surface font-semibold mb-1">{t("step_2_title")}</h4>
                <p className="font-body-md text-sm text-on-surface-variant">{t("step_2_desc")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center shrink-0">3</div>
              <div>
                <h4 className="font-title-lg text-title-lg text-on-surface font-semibold mb-1">{t("step_3_title")}</h4>
                <p className="font-body-md text-sm text-on-surface-variant">{t("step_3_desc")}</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />

      {/* Extension Install Guide Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-on-surface border border-outline-variant/30 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowExtensionModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[28px]">extension</span>
              </div>
              <div>
                <h3 className="font-title-lg text-lg font-bold text-on-surface">{t("install_ext_title")}</h3>
                <p className="text-xs text-on-surface-variant">{t("install_ext_subtitle")}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-3.5 my-5 text-sm">
              <div className="flex gap-3 items-start bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div className="flex-grow">
                  <p className="font-semibold text-on-surface">{t("ext_step1_title")}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{t("ext_step1_desc")}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div className="flex-grow">
                  <p className="font-semibold text-on-surface">{t("ext_step2_title")}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {t("ext_step2_desc")}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('chrome://extensions');
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="mt-1.5 text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    {copiedUrl ? t("copied_extensions_url") : t("copy_extensions_url")}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div className="flex-grow">
                  <p className="font-semibold text-on-surface">{t("ext_step3_title")}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{t("ext_step3_desc")}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="/sahayak-extension.zip"
                download="sahayak-extension.zip"
                className="flex-1 bg-secondary hover:bg-secondary/90 text-on-secondary py-3 px-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                {t("download_ext_zip")}
              </a>
              <a
                href="/test-form.html"
                target="_blank"
                rel="noreferrer"
                className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-3 px-4 rounded-xl font-bold text-center flex items-center justify-center gap-1.5 border border-outline-variant text-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                {t("open_test_form")}
              </a>
            </div>

          </div>
        </div>
      )}

      {isLoggingIn && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-label-lg text-lg text-primary animate-pulse">{t("checking_profile")}</p>
        </div>
      )}
    </div>
  );
};
