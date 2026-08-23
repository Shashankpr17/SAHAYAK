import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  minimal?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ minimal = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const { language, setLanguage, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!localStorage.getItem('sahayak_token');
  const userJson = localStorage.getItem('sahayak_user');
  const user = userJson ? JSON.parse(userJson) : null;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScrollTo = (elementId: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sahayak_token');
    localStorage.removeItem('sahayak_user');
    localStorage.removeItem('sahayak_user_profile');
    localStorage.removeItem('sahayak_doc_type');
    localStorage.removeItem('sahayak_selected_scheme');
    localStorage.removeItem('sahayak_guest_id');
    window.location.href = '/';
  };

  return (
    <header className="bg-surface dark:bg-on-surface shadow-sm sticky top-0 z-50 w-full transition-colors duration-200">
      <nav className="flex justify-between items-center h-20 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <Link 
          className="text-title-lg font-title-lg font-bold text-primary dark:text-primary-fixed tracking-tight flex items-center"
          to="/"
        >
          <img 
            alt="National Emblem" 
            className="h-8 w-auto inline-block mr-2"
            src="https://lh3.googleusercontent.com/aida/AP1WRLvpacausV289CU9wbrAYrstiDM35Kyo3CN87nc0Gfp9QY6gCcaDsTwNN38c2XVpFb3M_Jo-2Q7X6F_PGpFFIQlNoAT6K__6BF0CC75k77cjCypZ8sT9rrrz5SCSLArQfME1daiSxtGedJHV8a4je-_Rl7MFHVYiJxNk2HfcuBI08dSB0ehcXIkoxj-ad4b8fAEAOrhtH1VJcwRo1gBdQHAQgjWVS-TO9srGotOFfch7SrmaMgOELW0S3v8"
          />
          {t("logo")}
        </Link>

        {!minimal && (
          <>
            <div className="hidden md:flex justify-end items-center gap-gutter">
              <button
                onClick={() => handleScrollTo('how-it-works')}
                className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
              >
                {t("how_it_works")}
              </button>
              <button
                onClick={() => handleScrollTo('features')}
                className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
              >
                {t("features")}
              </button>

              {/* Direct Add Extension Button */}
              <a
                href="/sahayak-extension.zip"
                download="sahayak-extension.zip"
                className="font-label-md text-label-md bg-secondary/10 hover:bg-secondary/20 text-secondary px-3.5 py-1.5 rounded-lg font-bold border border-secondary/30 flex items-center gap-1.5 transition-all"
                title="Download SAHAYAK Chrome Extension"
              >
                <span className="material-symbols-outlined text-[18px]">extension</span>
                <span>Add Extension</span>
              </a>
              
              {/* Language Selector Dropdown */}
              <div className="relative mr-2" ref={dropdownRef}>
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200 flex items-center gap-1 bg-surface-container-low hover:bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/30"
                  aria-haspopup="true"
                  aria-expanded={langDropdownOpen}
                >
                  <span className="material-symbols-outlined text-sm">language</span>
                  <span>{language === 'en' ? 'English' : language === 'hi' ? 'हिन्दी' : 'ଓଡ଼ିଆ'}</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-200" style={{ transform: langDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                    arrow_drop_down
                  </span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-surface dark:bg-on-surface border border-outline-variant rounded-xl shadow-natural-bloom py-1.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 font-label-md text-sm hover:bg-surface-container-high transition-colors ${language === 'en' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => { setLanguage('hi'); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 font-label-md text-sm hover:bg-surface-container-high transition-colors ${language === 'hi' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant'}`}
                    >
                      हिन्दी
                    </button>
                    <button
                      onClick={() => { setLanguage('or'); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 font-label-md text-sm hover:bg-surface-container-high transition-colors ${language === 'or' ? 'text-primary font-bold bg-primary/5' : 'text-on-surface-variant'}`}
                    >
                      ଓଡ଼ିଆ
                    </button>
                  </div>
                )}
              </div>

              {isAuthenticated && user && (
                <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-4">
                  {user.picture_url ? (
                    <img 
                      src={user.picture_url} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full border border-primary/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/a/default-user=s80-p';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface leading-tight max-w-[120px] truncate">{user.name}</span>
                    <span className="text-[10px] text-on-surface-variant leading-none max-w-[120px] truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-2 font-label-md text-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-3 py-1.5 rounded-md border border-outline-variant transition-colors"
                  >
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-on-surface-variant flex items-center"
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </>
        )}
      </nav>

      {/* Mobile Menu Dropdown */}
      {!minimal && mobileMenuOpen && (
        <div className="md:hidden bg-surface dark:bg-on-surface border-t border-surface-container py-4 px-4 flex flex-col gap-4 shadow-sm absolute left-0 right-0 z-40">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleScrollTo('how-it-works');
            }}
            className="text-left font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary py-2"
          >
            {t("how_it_works")}
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleScrollTo('features');
            }}
            className="text-left font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary py-2"
          >
            {t("features")}
          </button>

          {/* Mobile Language Selector */}
          <div className="flex flex-col gap-2 border-t border-outline-variant/30 pt-3">
            <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">language</span>
              {t("languages")}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { setLanguage('en'); setMobileMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${language === 'en' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30'}`}
              >
                English
              </button>
              <button
                onClick={() => { setLanguage('hi'); setMobileMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${language === 'hi' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30'}`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => { setLanguage('or'); setMobileMenuOpen(false); }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${language === 'or' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30'}`}
              >
                ଓଡ଼ିଆ
              </button>
            </div>
          </div>

          {isAuthenticated && user && (
            <div className="border-t border-surface-container pt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {user.picture_url ? (
                  <img src={user.picture_url} alt={user.name} className="w-10 h-10 rounded-full border border-primary/20" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-on-surface">{user.name}</span>
                  <span className="text-xs text-on-surface-variant">{user.email}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="font-label-md text-label-md bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-2 rounded-lg text-center font-bold border border-outline-variant"
              >
                {t("logout")}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
