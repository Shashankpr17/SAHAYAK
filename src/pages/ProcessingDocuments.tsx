import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DocumentType, UserProfile } from '../types';
import { extractFields } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const validateName = (name: string | null | undefined): boolean => {
  if (!name) return false;
  const trimmed = name.trim();
  if (!/^[A-Za-z\s\.]+$/.test(trimmed)) return false;
  if (trimmed.length < 3 || trimmed.length > 50) return false;
  
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;
  
  for (const word of words) {
    if (word.length < 2 && !word.endsWith('.')) return false;
    
    const upper = word.toUpperCase();
    if (['GET', 'CET', 'CRT', 'ARS', 'PDF', 'DOC', 'IMG', 'DOB', 'UID', 'VID', 'GOVT', 'INDIA'].includes(upper)) {
      return false;
    }
    
    if (word.length >= 3 && !word.endsWith('.')) {
      const hasVowel = /[AEIOUaeiou]/.test(word);
      if (!hasVowel) return false;
    }
  }
  return true;
};

export const cleanName = (name: string): string => {
  return name.replace(/\s+/g, ' ').trim();
};

export const validateDOB = (dob: string | null | undefined): boolean => {
  if (!dob) return false;
  const trimmed = dob.trim();
  const parts = trimmed.split(/[/\.\-]/);
  if (parts.length !== 3) return false;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (year < 1900 || year > 2026) return false;
  if (month < 1 || month > 12) return false;
  
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
    daysInMonths[1] = 29;
  }
  
  if (day < 1 || day > daysInMonths[month - 1]) return false;
  
  return true;
};

export const normalizeDOB = (dob: string): string => {
  const trimmed = dob.trim();
  const parts = trimmed.split(/[/\.\-]/);
  if (parts.length !== 3) return dob;
  
  const day = parseInt(parts[0], 10).toString().padStart(2, '0');
  const month = parseInt(parts[1], 10).toString().padStart(2, '0');
  const year = parts[2];
  return `${day}/${month}/${year}`;
};

export const validateIndianState = (state: string | null | undefined): boolean => {
  if (!state) return false;
  const trimmed = state.trim().toLowerCase();
  const indianStates = [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh", "goa", "gujarat", 
    "haryana", "himachal pradesh", "jharkhand", "karnataka", "kerala", "madhya pradesh", 
    "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "punjab", 
    "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura", "uttar pradesh", 
    "uttarakhand", "west bengal", "delhi", "jammu & kashmir", "jammu and kashmir", 
    "ladakh", "puducherry", "chandigarh", "lakshadweep", "daman & diu", "daman and diu", 
    "dadra & nagar haveli", "dadra and nagar haveli", "andaman & nicobar", "andaman and nicobar"
  ];
  return indianStates.includes(trimmed);
};

export const validateAddress = (addr: string | null | undefined): boolean => {
  if (!addr) return false;
  const trimmed = addr.trim();
  if (trimmed.length < 10 || trimmed.length > 250) return false;
  
  const uppercase = trimmed.toUpperCase();
  if (uppercase.includes('NOT AVAILABLE') || uppercase.includes('UNKNOWN') || uppercase.includes('N/A')) {
    return false;
  }
  
  return true;
};

interface ProcessingDocumentsProps {
  uploadedFiles: File[];
  documentType: DocumentType | null;
  documentSubtype: string | null;
  onProcessingComplete: (profile: UserProfile) => void;
  setExtractedFiles: (files: any[]) => void;
}

export const ProcessingDocuments: React.FC<ProcessingDocumentsProps> = ({
  uploadedFiles,
  documentType,
  documentSubtype,
  onProcessingComplete,
  setExtractedFiles
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const propsRef = useRef({
    uploadedFiles,
    documentType,
    documentSubtype,
    onProcessingComplete,
    setExtractedFiles,
    navigate
  });

  useEffect(() => {
    propsRef.current = {
      uploadedFiles,
      documentType,
      documentSubtype,
      onProcessingComplete,
      setExtractedFiles,
      navigate
    };
  });

  useEffect(() => {
    let active = true;

    const runSteps = async () => {
      const {
        uploadedFiles,
        documentType,
        documentSubtype,
        onProcessingComplete,
        setExtractedFiles,
        navigate
      } = propsRef.current;

      console.log('[PIPELINE_STARTED]');
      uploadedFiles.forEach((file, idx) => {
        console.log(`[FILE_${idx + 1}_EXTRACTION_STARTED] Reading ${file.name}`);
      });

      // Step 0: Uploading Files (simulated transition delay)
      if (!active) return;
      await new Promise((r) => setTimeout(r, 1000));
      
      // Step 1: Reading Documents
      if (!active) return;
      setCurrentStep(1);
      
      try {
        console.log(`[DATA FLOW] Initiating backend API call POST /api/documents/extract-fields`);
        const result = await extractFields(uploadedFiles, documentType || 'ID Proof', documentSubtype || undefined);
        console.log(`[DATA FLOW] Backend API response received:`, result);
        
        if (!active) return;

        if (result.success && result.extracted_data) {
          console.log('[ALL_EXTRACTION_COMPLETED]');
          
          // Log each file status
          if (result.extracted_files) {
            result.extracted_files.forEach((file: any, idx: number) => {
              const fileNum = idx + 1;
              if (file.status === 'success') {
                console.log(`[FILE_${fileNum}_EXTRACTION_COMPLETED] ${file.filename} extraction succeeded.`);
              } else {
                console.log(`[FILE_${fileNum}_EXTRACTION_FAILED] ${file.filename} extraction failed.`);
              }
            });
          } else {
            uploadedFiles.forEach((file, idx) => {
              console.log(`[FILE_${idx + 1}_EXTRACTION_COMPLETED] ${file.name} extraction succeeded.`);
            });
          }

          console.log('[LLM_PROCESSING_STARTED] Performing document LLM parsing integration...');
          
          // Store raw extracted files list in state
          if (result.extracted_files) {
            setExtractedFiles(result.extracted_files);
          } else if (result.raw_text) {
            // Fallback: package combined text as a single file item
            setExtractedFiles([{
              filename: uploadedFiles.length > 0 ? uploadedFiles[0].name : 'Uploaded Document',
              file_type: uploadedFiles.length > 0 ? uploadedFiles[0].type : 'image/jpeg',
              text: result.raw_text,
              status: 'success',
              metadata: {}
            }]);
          }

          // Step 2: Extracting Info
          setCurrentStep(2);
          await new Promise((r) => setTimeout(r, 1200));

          console.log('[LLM_PROCESSING_COMPLETED] LLM profile processing complete.');
          console.log('[VALIDATION_STARTED] Validating extracted profile properties...');

          // Step 3: Preparing Profile
          if (!active) return;
          setCurrentStep(3);
          await new Promise((r) => setTimeout(r, 1000));

          // Verify if Name or DOB requires fallback flags:
          // A Name is invalid if it fails validateName logic or matches prohibited keywords
          const nameVal = result.extracted_data.full_name;
          const dobVal = result.extracted_data.date_of_birth;
          
          const isNameValid = validateName(nameVal);
          const isDobValid = validateDOB(dobVal);

          let cleanNameVal = isNameValid && nameVal ? nameVal : '';
          let cleanDobVal = isDobValid && dobVal ? dobVal : '';

          let notice = null;

          if (!isNameValid && nameVal) {
            console.log(`[VALIDATION_FALLBACK] Name '${nameVal}' failed strict check. Clearing value for review.`);
            notice = {
              type: 'warning',
              message: 'Some details could not be confidently extracted. Please review and edit them.'
            };
          }

          if (!isDobValid && dobVal) {
            console.log(`[VALIDATION_FALLBACK] DOB '${dobVal}' failed validation. Clearing value for review.`);
            notice = {
              type: 'warning',
              message: 'Some details could not be confidently extracted. Please review and edit them.'
            };
          }

          // If there were missing important keys, flag a generic warning
          const hasMissingImportant = !cleanNameVal || !cleanDobVal || !result.extracted_data.state || !result.extracted_data.address;
          if (hasMissingImportant && !notice) {
            notice = {
              type: 'info',
              message: 'Some details are missing. Please complete your profile to unlock all eligible matches.'
            };
          }

          if (notice) {
            localStorage.setItem('sahayak_notice_type', notice.type);
            localStorage.setItem('sahayak_notice_msg', notice.message);
          } else {
            localStorage.removeItem('sahayak_notice_type');
            localStorage.removeItem('sahayak_notice_msg');
          }

          const mappedProfile: UserProfile = {
            fullName: cleanNameVal,
            dob: cleanDobVal,
            state: result.extracted_data.state || '',
            address: result.extracted_data.address || '',
            annualIncome: result.extracted_data.annual_income || '',
            occupation: result.extracted_data.occupation || '',
            gender: result.extracted_data.gender || undefined,
            fatherName: result.extracted_data.father_name || undefined,
            motherName: result.extracted_data.mother_name || undefined,
            bloodGroup: result.extracted_data.blood_group || undefined,
            aadhaarNumber: result.extracted_data.aadhaar_number || undefined,
            panNumber: result.extracted_data.pan_number || undefined,
            drivingLicenceNumber: result.extracted_data.driving_licence_number || undefined,
            voterIdNumber: result.extracted_data.voter_id_number || undefined,
            district: result.extracted_data.district || undefined,
            city: result.extracted_data.city || undefined,
            pinCode: result.extracted_data.pin_code || undefined
          };

          console.log('[VALIDATION_COMPLETED] Mapping user profile:', mappedProfile);
          console.log(`[DEBUG LOG] frontend received Aadhaar exists: ${!!mappedProfile.aadhaarNumber}`);
          console.log('[PROFILE_PREPARATION_STARTED] Preparing profile for ReviewDetails page...');
          onProcessingComplete(mappedProfile);
          console.log('[PROFILE_PREPARATION_COMPLETED] Profile prepared successfully.');

          console.log('[NAVIGATION_TO_REVIEW] Heading to review page');
          navigate('/review');
        } else {
          console.log('[LLM_PROCESSING_FAILED] Backend reported failure.');
          setError('Failed to extract information from documents.');
        }
      } catch (err: any) {
        console.error('[LLM_PROCESSING_FAILED] Error during field extraction:', err);
        console.log('[VALIDATION_FAILED] Validation aborted due to processing errors.');
        if (active) {
          setError(err.message || 'An error occurred during document processing.');
        }
      }
    };

    runSteps();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-natural-bloom flex flex-col items-center gap-8">
          
          {/* Logo Branding */}
          <div className="text-display-sm font-display-sm text-primary font-bold tracking-tight">
            {t("logo")}
          </div>

          {error ? (
            <div className="text-center space-y-6 animate-fade-in w-full">
              <span className="material-symbols-outlined text-error text-5xl">error</span>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-on-surface">
                  {language === 'en' ? 'Processing Failed' : language === 'hi' ? 'प्रसंस्करण विफल' : 'ପ୍ରକ୍ରିୟାକରଣ ବିଫଳ ହେଲା'}
                </h2>
                <p className="text-sm text-on-surface-variant leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => navigate('/upload')}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover transition-colors inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>{language === 'en' ? 'Back to Upload' : language === 'hi' ? 'अपलोड पर वापस जाएं' : 'ଅପଲୋଡକୁ ଫେରିଯାଆନ୍ତୁ'}</span>
              </button>
            </div>
          ) : (
            <div className="w-full space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-on-surface">{t("processing_title")}</h2>
                <p className="text-sm text-on-surface-variant">
                  {language === 'en' ? 'This will only take a minute. Please keep this tab open.' : language === 'hi' ? 'इसमें बस एक मिनट लगेगा। कृपया इस टैब को खुला रखें।' : 'ଏଥିପାଇଁ କେବଳ ଏକ ମିନିଟ୍ ଲାଗିବ | ଦୟାକରି ଏହି ଟ୍ୟାବ୍ ଖୋଲା ରଖନ୍ତୁ |'}
                </p>
              </div>

              {/* Progress Steps Grid */}
              <div className="max-w-md mx-auto bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20">
                <div className="flex flex-col gap-6">
                  
                  {/* Step 1: Uploading Files */}
                  <div className="flex items-start gap-stack-md relative">
                    <div className="absolute left-4 top-10 bottom-[-24px] w-[2px] bg-secondary -z-10 transform -translate-x-1/2"></div>
                    <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-title-lg font-title-lg text-on-surface font-semibold">
                        {uploadedFiles.length} {language === 'en' ? 'File(s) uploaded' : language === 'hi' ? 'फ़ाइलें अपलोड की गईं' : 'ଫାଇଲ୍ ଅପଲୋଡ୍ ହୋଇଛି'}
                      </span>
                      <span className="text-body-md font-body-md text-on-surface-variant">
                        {language === 'en' ? 'Securely transferred' : language === 'hi' ? 'सुरक्षित रूप से स्थानांतरित' : 'ସୁରକ୍ଷିତ ଭାବେ ସ୍ଥାନାନ୍ତରିତ'}
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Reading Document */}
                  <div className={`flex items-start gap-stack-md relative transition-opacity duration-300 ${currentStep < 1 ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="absolute left-4 top-[-24px] bottom-[32px] w-[2px] bg-secondary -z-10 transform -translate-x-1/2"></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      currentStep === 1 
                        ? 'bg-primary-container text-on-primary-container' 
                        : currentStep > 1 
                          ? 'bg-secondary text-on-secondary' 
                          : 'border-2 border-outline-variant bg-surface text-outline-variant'
                    }`}>
                      {currentStep === 1 ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      ) : currentStep > 1 ? (
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-title-lg font-title-lg ${currentStep === 1 ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {language === 'en' ? 'Reading Documents' : language === 'hi' ? 'दस्तावेज़ पढ़े जा रहे हैं' : 'ଦସ୍ତାବିଜ୍ ପଢାଯାଉଛି'}
                      </span>
                      <span className="text-body-md font-body-md text-on-surface-variant">{t("processing_step_1")}</span>
                      {currentStep === 1 && (
                        <div className="mt-4 h-2 bg-surface-container rounded-full overflow-hidden w-full max-w-[200px]">
                          <div className="h-full bg-primary rounded-full w-2/3 animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Extracting Info */}
                  <div className={`flex items-start gap-stack-md relative transition-opacity duration-300 ${currentStep < 2 ? 'opacity-50' : 'opacity-100'}`}>
                    <div className={`absolute left-4 top-[-24px] bottom-[32px] w-[2px] -z-10 transform -translate-x-1/2 ${currentStep > 1 ? 'bg-secondary' : 'bg-surface-variant'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      currentStep === 2 
                        ? 'bg-primary-container text-on-primary-container' 
                        : currentStep > 2 
                          ? 'bg-secondary text-on-secondary' 
                          : 'border-2 border-outline-variant bg-surface text-outline-variant'
                    }`}>
                      {currentStep === 2 ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      ) : currentStep > 2 ? (
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-title-lg font-title-lg ${currentStep === 2 ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {language === 'en' ? 'Extracting Important Information' : language === 'hi' ? 'महत्वपूर्ण जानकारी निकाली जा रही है' : 'ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ସୂଚନା ବାହାର କରାଯାଉଛି'}
                      </span>
                      <span className="text-body-md font-body-md text-on-surface-variant">{t("processing_step_2")}</span>
                      {currentStep === 2 && (
                        <div className="mt-4 h-2 bg-surface-container rounded-full overflow-hidden w-full max-w-[200px]">
                          <div className="h-full bg-primary rounded-full w-1/2 animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Preparing Profile */}
                  <div className={`flex items-start gap-stack-md relative transition-opacity duration-300 ${currentStep < 3 ? 'opacity-50' : 'opacity-100'}`}>
                    <div className={`absolute left-4 top-[-24px] bottom-[32px] w-[2px] -z-10 transform -translate-x-1/2 ${currentStep > 2 ? 'bg-secondary' : 'bg-surface-variant'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                      currentStep === 3 
                        ? 'bg-primary-container text-on-primary-container' 
                        : currentStep > 3 
                          ? 'bg-secondary text-on-secondary' 
                          : 'border-2 border-outline-variant bg-surface text-outline-variant'
                    }`}>
                      {currentStep === 3 ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      ) : currentStep > 3 ? (
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">person</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-title-lg font-title-lg ${currentStep === 3 ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {language === 'en' ? 'Preparing Your Profile' : language === 'hi' ? 'आपकी प्रोफ़ाइल तैयार की जा रही है' : 'ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ପ୍ରସ୍ତୁତ କରାଯାଉଛି'}
                      </span>
                      <span className="text-body-md font-body-md text-on-surface-variant">{t("processing_step_3")}</span>
                      {currentStep === 3 && (
                        <div className="mt-4 h-2 bg-surface-container rounded-full overflow-hidden w-full max-w-[200px]">
                          <div className="h-full bg-primary rounded-full w-3/4 animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
export default ProcessingDocuments;
