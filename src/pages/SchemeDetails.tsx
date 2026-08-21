import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { Scheme } from '../types';
import { explainScheme, getSchemeById } from '../services/api';
import type { SchemeDetailData, SchemeExplanationResponse } from '../services/api';
import { SCHEMES } from '../data/schemes';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../data/translations';

interface SchemeDetailsProps {
  selectedScheme: Scheme | null;
}

export const SchemeDetails: React.FC<SchemeDetailsProps> = ({ selectedScheme }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const schemeIdFromUrl = searchParams.get('id');

  const activeId = schemeIdFromUrl || selectedScheme?.id || 'pm-kisan';

  // Connect to the global language context
  const { language, setLanguage } = useLanguage();
  const [explainSimply, setExplainSimply] = useState(true);
  const [loading, setLoading] = useState(false);
  const [explanationData, setExplanationData] = useState<SchemeExplanationResponse | null>(null);
  const [formalData, setFormalData] = useState<SchemeDetailData | null>(null);

  // Load simplified or formal details from backend
  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        console.log(`[DATA FLOW] Fetching explain API for ID: ${activeId}, lang: ${language}, simple: ${explainSimply}`);
        const data = await explainScheme(activeId, language, explainSimply);
        setExplanationData(data);

        // Also pre-fetch formal details for comparison or fallback UI
        const formalRes = await getSchemeById(activeId);
        if (formalRes.success && formalRes.data) {
          setFormalData(formalRes.data);
        }
      } catch (err) {
        console.warn('[DATA FLOW WARNING] Failed to fetch backend explanations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [activeId, language, explainSimply]);

  const localFallback = SCHEMES.find(s => s.id.toLowerCase() === activeId.toLowerCase()) || SCHEMES[0];

  const schemeName = explanationData?.scheme_name || localFallback.name;
  const category = formalData?.category || localFallback.category;
  const officialLink = explanationData?.official_link || formalData?.official_link || localFallback.whoCanGet?.en?.[0] || 'https://india.gov.in';

  const criteriaText = formalData?.eligibility_criteria || localFallback.description.en;
  const parameters = formalData?.parameters_evaluated || ['Age', 'Income', 'State', 'Occupation'];
  const requiredDocs = formalData?.required_documents || ['Aadhaar Card', 'Identity Proof', 'Income Proof'];
  const applicationInfo = formalData?.application_information || 'Apply online on the official government portal.';

  // Heading labels depending on language
  const labels = {
    en: {
      back: 'Back to eligible schemes',
      explainSimply: 'Explain Simply',
      explainDesc: 'Switch to a friendly, easy-to-understand explanation of this scheme.',
      simpleTitle: 'The Simple Version',
      officialTitle: 'Official Information',
      howToGet: 'How do you get it?',
      whoCanGet: 'Who can get this?',
      requiredDocs: 'Required Documents',
      evaluatedParams: 'Evaluated Parameters',
      applyNow: 'Visit Official Portal',
      description: 'Description',
      howToApply: 'How to Apply',
      appPortal: 'Application Portal',
      appPortalDesc: 'Click below to open the official government website and complete your application.',
      missingInfo: 'Missing Info:',
      updatingDetails: 'Updating details representation...'
    },
    hi: {
      back: 'पात्र योजनाओं पर वापस जाएं',
      explainSimply: 'सरल भाषा में समझाएं',
      explainDesc: 'इस योजना के बारे में एक आसान और समझने योग्य विवरण देखें।',
      simpleTitle: 'सरल संस्करण',
      officialTitle: 'आधिकारिक जानकारी',
      howToGet: 'यह आपको कैसे मिलेगा?',
      whoCanGet: 'यह किसे मिल सकता है?',
      requiredDocs: 'आवश्यक दस्तावेज',
      evaluatedParams: 'जांचे गए मानदंड',
      applyNow: 'आधिकारिक पोर्टल पर जाएं',
      description: 'विवरण',
      howToApply: 'आवेदन कैसे करें',
      appPortal: 'आवेदन पोर्टल',
      appPortalDesc: 'अपना आवेदन पूरा करने के लिए आधिकारिक सरकारी वेबसाइट खोलने के लिए नीचे क्लिक करें।',
      missingInfo: 'लापता जानकारी:',
      updatingDetails: 'विवरण अद्यतन किया जा रहा है...'
    },
    or: {
      back: 'ଯୋଗ୍ୟ ଯୋଜନାକୁ ଫେରିଯାଆନ୍ତୁ',
      explainSimply: 'ସହଜ ଭାଷାରେ ବୁଝନ୍ତୁ',
      explainDesc: 'ଏହି ଯୋଜନା ବିଷୟରେ ଏକ ସରଳ ଏବଂ ସହଜ ବୁଝାପଡ଼ୁଥିବା ବିବରଣୀ ଦେଖନ୍ତୁ |',
      simpleTitle: 'ସରଳ ସଂସ୍କରଣ',
      officialTitle: 'ଆଧିକାରିକ ସୂଚନା',
      howToGet: 'ଏହା ଆପଣଙ୍କୁ କିପରି ମିଳିବ?',
      whoCanGet: 'ଏହା କାହାକୁ ମିଳିପାରିବ?',
      requiredDocs: 'ଆବଶ୍ୟକୀୟ ଦସ୍ତାବେଜ',
      evaluatedParams: 'ଯାଞ୍ଚ ହୋଇଥିବା ମାପଦଣ୍ଡ',
      applyNow: 'ଆଧିକାରିକ ପୋର୍ଟାଲ ଯାଆନ୍ତୁ',
      description: 'ବିବରଣୀ',
      howToApply: 'କିପରି ଆବେଦନ କରିବେ',
      appPortal: 'ଆବେଦନ ପୋର୍ଟାଲ',
      appPortalDesc: 'ଆପଣଙ୍କର ଆବେଦନ ସମ୍ପୂର୍ଣ୍ଣ କରିବାକୁ ସରକାରୀ ଆଧିକାରିକ ୱେବସାଇଟ୍ ଖୋଲିବା ପାଇଁ ତଳେ କ୍ଲିକ୍ କରନ୍ତୁ |',
      missingInfo: 'ଅସମ୍ପୂର୍ଣ୍ଣ ତଥ୍ୟ:',
      updatingDetails: 'ତଥ୍ୟ ଅପଡେଟ୍ ହେଉଛି...'
    }
  }[language as Language] || {
    back: 'Back to eligible schemes',
    explainSimply: 'Explain Simply',
    explainDesc: 'Switch to a friendly, easy-to-understand explanation of this scheme.',
    simpleTitle: 'The Simple Version',
    officialTitle: 'Official Information',
    howToGet: 'How do you get it?',
    whoCanGet: 'Who can get this?',
    requiredDocs: 'Required Documents',
    evaluatedParams: 'Evaluated Parameters',
    applyNow: 'Visit Official Portal',
    description: 'Description',
    howToApply: 'How to Apply',
    appPortal: 'Application Portal',
    appPortalDesc: 'Click below to open the official government website and complete your application.',
    missingInfo: 'Missing Info:',
    updatingDetails: 'Updating details representation...'
  };

  const handleBack = () => {
    navigate('/schemes');
  };

  const handleOfficialPortalClick = () => {
    window.open(officialLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Header />

      <main className="flex-grow max-w-container-max mx-auto w-full px-4 md:px-margin-desktop py-10 flex flex-col gap-8">
        
        {/* Back Link */}
        <button
          onClick={handleBack}
          className="text-primary font-semibold flex items-center gap-1.5 hover:underline w-fit"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          {labels.back}
        </button>

        {/* Header Title with Language Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md border-b border-outline-variant/30 pb-4">
          <div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block opacity-85 uppercase tracking-wider">
              {category}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">
              {schemeName}
            </h1>
          </div>
          
          {/* Vernacular Language Selector */}
          <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant/30 shrink-0">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 rounded-full font-label-md text-xs transition-colors font-bold ${
                language === 'en' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-4 py-1.5 rounded-full font-label-md text-xs transition-colors font-bold ${
                language === 'hi' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLanguage('or')}
              className={`px-4 py-1.5 rounded-full font-label-md text-xs transition-colors font-bold ${
                language === 'or' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              ଓଡ଼ିଆ
            </button>
          </div>
        </div>

        {/* Explain Simply Toggle Banner */}
        <div className="bg-secondary-container/20 border border-secondary/20 rounded-xl p-5 flex justify-between items-center shadow-natural-bloom gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-secondary text-on-secondary p-2.5 rounded-full shrink-0">
              <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <div>
              <h3 className="font-title-lg text-lg text-on-surface font-extrabold">{labels.explainSimply}</h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-tight">
                {labels.explainDesc}
              </p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox"
              checked={explainSimply} 
              onChange={(e) => setExplainSimply(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-14 h-7 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary">
            </div>
          </label>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
            <p className="text-on-surface-variant font-medium">{labels.updatingDetails}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">
              
              {explainSimply && explanationData ? (
                /* Explain Simply: Simple Version Card */
                <div className="bg-surface rounded-2xl shadow-natural-bloom p-6 md:p-8 border-2 border-secondary/30 relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 w-2.5 h-full bg-secondary"></div>
                  <div className="flex items-center gap-2 mb-6 text-secondary">
                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                    <h2 className="text-xl font-bold">{labels.simpleTitle}</h2>
                  </div>
                  
                  <div className="space-y-6 text-on-surface">
                    <p className="text-lg leading-relaxed font-medium">
                      {explanationData.explanation}
                    </p>
                    
                    {explanationData.how_to_get && (
                      <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/20">
                        <h4 className="font-bold text-base mb-2 text-primary">{labels.howToGet}</h4>
                        <p className="text-sm text-on-surface-variant">{explanationData.how_to_get}</p>
                      </div>
                    )}

                    <div className="p-5 bg-secondary/5 rounded-xl border border-secondary/10">
                      <h4 className="font-bold text-base mb-2 text-secondary">{labels.whoCanGet}</h4>
                      <p className="text-sm text-on-surface-variant mb-2">
                        {explanationData.eligibility_explanation}
                      </p>
                      {explanationData.missing_information && explanationData.missing_information.length > 0 && (
                        <div className="mt-3 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                          <strong>{labels.missingInfo}</strong> {explanationData.missing_information.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Formal Mode: Official Information Card */
                <div className="bg-surface rounded-2xl shadow-natural-bloom p-6 md:p-8 border border-outline-variant/20 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/20 pb-4 text-primary">
                    <span className="material-symbols-outlined">account_balance</span>
                    <h2 className="text-xl font-bold">{labels.officialTitle}</h2>
                  </div>
                  
                  <div className="space-y-6 text-on-surface">
                    <section>
                      <h3 className="font-bold text-base mb-2">{labels.description}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {criteriaText}
                      </p>
                    </section>
                    
                    {formalData && (
                      <>
                        <section>
                          <h3 className="font-bold text-base mb-2">{labels.evaluatedParams}</h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
                            {parameters.map((param, idx) => <li key={idx}>{param}</li>)}
                          </ul>
                        </section>

                        <section>
                          <h3 className="font-bold text-base mb-2">{labels.requiredDocs}</h3>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-on-surface-variant">
                            {requiredDocs.map((doc, idx) => <li key={idx}>{doc}</li>)}
                          </ul>
                        </section>
                      </>
                    )}

                    <section className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/20">
                      <h3 className="font-bold text-base mb-2">{labels.howToApply}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {applicationInfo}
                      </p>
                    </section>
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar Controls Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-natural-bloom space-y-4">
                <h3 className="font-bold text-lg text-on-surface">{labels.appPortal}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {labels.appPortalDesc}
                </p>
                <button
                  onClick={handleOfficialPortalClick}
                  className="w-full bg-primary hover:bg-primary-hover text-on-primary font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{labels.applyNow}</span>
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
