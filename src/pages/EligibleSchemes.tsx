import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { UserProfile, Scheme } from '../types';
import { getEligibility } from '../services/api';
import type { EvaluatedScheme, EligibilityApiResponse } from '../services/api';
import { SCHEMES } from '../data/schemes';
import { useLanguage } from '../context/LanguageContext';

interface EligibleSchemesProps {
  profile: UserProfile | null;
  onSelectScheme: (scheme: Scheme) => void;
}

export const EligibleSchemes: React.FC<EligibleSchemesProps> = ({ profile: _profile, onSelectScheme }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [eligibilityData, setEligibilityData] = useState<EligibilityApiResponse | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    const loadEligibility = async () => {
      try {
        setLoading(true);
        console.log('[DATA FLOW] Fetching eligibility evaluation from GET /api/eligibility');
        const res = await getEligibility();
        console.log('[DATA FLOW] GET /api/eligibility response:', res);
        if (res.success) {
          setEligibilityData(res);
        }
      } catch (err) {
        console.warn('[DATA FLOW WARNING] Failed to fetch backend eligibility:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEligibility();
  }, []);

  const handleSchemeClick = (evalScheme: EvaluatedScheme) => {
    const foundLocal = SCHEMES.find(s => s.id.toLowerCase() === evalScheme.id.toLowerCase());
    const schemeToSelect: Scheme = foundLocal || {
      id: evalScheme.id,
      name: evalScheme.name,
      category: evalScheme.category,
      state: 'All India',
      description: { en: evalScheme.name, hi: evalScheme.name },
      benefits: { en: 'Government welfare benefit', hi: 'सरकारी कल्याणकारी लाभ' },
      eligibilityCriteria: { en: evalScheme.reasons, hi: evalScheme.reasons },
      simpleDescription: { en: evalScheme.name, hi: evalScheme.name },
      howToGet: { en: 'Apply via official portal', hi: 'आधिकारिक पोर्टल से आवेदन करें' },
      whoCanGet: { en: evalScheme.reasons, hi: evalScheme.reasons },
      requiredDocs: [
        { name: 'Aadhaar Card', desc: { en: 'Proof of Identity', hi: 'पहचान का प्रमाण' } }
      ]
    };

    onSelectScheme(schemeToSelect);
    navigate(`/scheme-details?id=${encodeURIComponent(evalScheme.id)}`);
  };

  const renderSchemeCard = (scheme: EvaluatedScheme, borderStyle: string, badgeBg: string, badgeText: string) => {
    // Dynamic status display
    const statusLabel = scheme.status === 'eligible' 
      ? t('gender_male') === 'Male' ? 'Eligible' : language === 'hi' ? 'योग्य' : 'ଯୋଗ୍ୟ'
      : scheme.status === 'possible' 
        ? t('gender_male') === 'Male' ? 'May Be Eligible' : language === 'hi' ? 'संभावित योग्य' : 'ଯୋଗ୍ୟ ହୋଇପାରନ୍ତି'
        : t('gender_male') === 'Male' ? 'More Info Needed' : language === 'hi' ? 'अतिरिक्त जानकारी आवश्यक' : 'ଅଧିକ ସୂଚନା ଆବଶ୍ୟକ';

    return (
      <div
        key={scheme.id}
        className={`bg-surface-container-lowest rounded-2xl p-6 shadow-natural-bloom hover:shadow-lg transition-all duration-300 border ${borderStyle} flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="bg-surface-variant text-on-surface-variant font-label-sm text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {scheme.category}
            </span>
            <span className={`${badgeBg} ${badgeText} text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
              {statusLabel}
            </span>
          </div>

          <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-3">
            {scheme.name}
          </h3>

          {/* Explainable Reasons */}
          {scheme.reasons && scheme.reasons.length > 0 && (
            <div className="mb-4 bg-surface-container-low p-3 rounded-xl">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                {language === 'en' ? 'Why You Match:' : language === 'hi' ? 'आप क्यों मेल खाते हैं:' : 'ଆପଣ କାହିଁକି ମେଳ ଖାଉଛନ୍ତି:'}
              </h4>
              <ul className="space-y-1">
                {scheme.reasons.map((reason, idx) => (
                  <li key={idx} className="text-sm text-on-surface-variant flex items-start gap-1.5">
                    <span className="text-primary font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Information if any */}
          {scheme.missing_information && scheme.missing_information.length > 0 && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">help_outline</span>
                {language === 'en' ? 'Information Needed:' : language === 'hi' ? 'जानकारी आवश्यक:' : 'ସୂଚନା ଆବଶ୍ୟକ:'}
              </h4>
              <ul className="space-y-1">
                {scheme.missing_information.map((info, idx) => (
                  <li key={idx} className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1">
                    <span>-</span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={() => handleSchemeClick(scheme)}
          className="mt-4 w-full bg-primary hover:bg-primary-hover text-on-primary py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <span>{t("view_details")}</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    );
  };

  const eligibleList = eligibilityData?.eligible_schemes || [];
  const possibleList = eligibilityData?.possible_schemes || [];
  const needsInfoList = eligibilityData?.needs_more_information || [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Header />

      <main className="flex-grow max-w-container-max mx-auto w-full px-4 md:px-margin-desktop py-10 flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
              {language === 'en' ? 'Eligibility Results' : language === 'hi' ? 'पात्रता परिणाम' : 'ଯୋଗ୍ୟତା ଫଳାଫଳ'}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface">
              {t("dashboard_title")}
            </h1>
            {eligibilityData?.profile && (
              <p className="text-on-surface-variant text-sm mt-1">
                {language === 'en' ? 'Evaluated for: ' : language === 'hi' ? 'मूल्यांकनकर्ता: ' : 'ମୂଲ୍ୟାଙ୍କନ କରାଯାଇଛି: '}
                <span className="font-bold text-on-surface">{eligibilityData.profile.full_name || 'Applicant'}</span> 
                {eligibilityData.profile.age && <span> ({eligibilityData.profile.age} {language === 'en' ? 'years old' : language === 'hi' ? 'वर्षीय' : 'ବର୍ଷ ବୟସ୍କ'})</span>} 
                {eligibilityData.profile.state && <span> • {eligibilityData.profile.state}</span>}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/upload')}
              className="bg-primary/10 hover:bg-primary/20 text-primary font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm transition-all border border-primary/20"
            >
              <span className="material-symbols-outlined text-base">upload_file</span>
              {language === 'en' ? 'Upload More Documents' : language === 'hi' ? 'दस्तावेज़ अपलोड करें' : 'ଦସ୍ତାବିଜ ଅପଲୋଡ୍ କରନ୍ତୁ'}
            </button>
            <button
              onClick={() => navigate('/review')}
              className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm transition-all border border-outline-variant"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              {language === 'en' ? 'Edit Profile' : language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'ପ୍ରୋଫାଇଲ୍ ସଂଶୋଧନ'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
            <p className="text-on-surface-variant font-medium">
              {language === 'en' ? 'Evaluating scheme eligibility criteria...' : language === 'hi' ? 'योजना पात्रता मानदंडों का मूल्यांकन किया जा रहा है...' : 'ଯୋଜନା ଯୋଗ୍ୟତା ମାପଦଣ୍ଡ ମୂଲ୍ୟାଙ୍କନ କରାଯାଉଛି...'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Section 1: Eligible for You */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
                <h2 className="text-2xl font-bold text-on-surface">
                  {language === 'en' ? `Eligible for You (${eligibleList.length})` : language === 'hi' ? `आपके लिए पात्र (${eligibleList.length})` : `ଆପଣଙ୍କ ପାଇଁ ଯୋଗ୍ୟ (${eligibleList.length})`}
                </h2>
              </div>

              {eligibleList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eligibleList.map(scheme =>
                    renderSchemeCard(scheme, 'border-emerald-500/30', 'bg-emerald-100 text-emerald-800', 'ELIGIBLE')
                  )}
                </div>
              ) : (
                <div className="bg-surface-container-low rounded-xl p-6 text-center text-on-surface-variant">
                  {language === 'en' 
                    ? 'No schemes strictly matched all eligibility thresholds based on current profile parameters.' 
                    : language === 'hi' 
                      ? 'वर्तमान प्रोफ़ाइल मापदंडों के आधार पर कोई भी योजना आपकी पात्रता से मेल नहीं खाई।' 
                      : 'ବର୍ତ୍ତମାନର ପ୍ରୋଫାଇଲ୍ ତଥ୍ୟ ଆଧାରରେ କୌଣସି ଯୋଜନା ଯୋଗ୍ୟତା ସହ ମେଳ ଖାଇଲା ନାହିଁ |'}
                </div>
              )}
            </div>

            {/* Section 2: You May Be Eligible */}
            {possibleList.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-amber-600 text-2xl">stars</span>
                  <h2 className="text-2xl font-bold text-on-surface">
                    {language === 'en' ? `You May Be Eligible (${possibleList.length})` : language === 'hi' ? `आप पात्र हो सकते हैं (${possibleList.length})` : `ଆପଣ ଯୋଗ୍ୟ ହୋଇପାରନ୍ତି (${possibleList.length})`}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {possibleList.map(scheme =>
                    renderSchemeCard(scheme, 'border-amber-500/30', 'bg-amber-100 text-amber-800', 'MAY BE ELIGIBLE')
                  )}
                </div>
              </div>
            )}

            {/* Section 3: More Information Needed */}
            {needsInfoList.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-blue-600 text-2xl">info</span>
                  <h2 className="text-2xl font-bold text-on-surface">
                    {language === 'en' ? `More Information Needed (${needsInfoList.length})` : language === 'hi' ? `अधिक जानकारी आवश्यक (${needsInfoList.length})` : `ଅଧିକ ସୂଚନା ଆବଶ୍ୟକ (${needsInfoList.length})`}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {needsInfoList.map(scheme =>
                    renderSchemeCard(scheme, 'border-blue-500/30', 'bg-blue-100 text-blue-800', 'MORE INFO NEEDED')
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
