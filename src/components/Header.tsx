import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  minimal?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ minimal = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('sahayak_token');
  const userJson = localStorage.getItem('sahayak_user');
  const user = userJson ? JSON.parse(userJson) : null;

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
          SAHAYAK
        </Link>

        {!minimal && (
          <>
            <div className="hidden md:flex justify-end items-center gap-gutter">
              <button
                onClick={() => handleScrollTo('how-it-works')}
                className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
              >
                How it Works
              </button>
              <button
                onClick={() => handleScrollTo('features')}
                className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200"
              >
                Features
              </button>
              <span className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant cursor-not-allowed opacity-50 mr-2">
                Languages
              </span>

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
                    Logout
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
            How it Works
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleScrollTo('features');
            }}
            className="text-left font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary py-2"
          >
            Features
          </button>

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
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
