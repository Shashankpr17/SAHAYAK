import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DocumentType, UserProfile } from '../types';
import { extractFields } from '../services/api';

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
  
  return day >= 1 && day <= daysInMonths[month - 1];
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

export const validateAddress = (address: string | null | undefined): boolean => {
  if (!address) return false;
  const trimmed = address.trim();
  const letters = trimmed.replace(/[^A-Za-z]/g, '');
  if (letters.length < 10) return false;
  const nonAlphanumeric = trimmed.replace(/[A-Za-z0-9\s,\/\.\-]/g, '');
  return nonAlphanumeric.length / trimmed.length <= 0.25;
};

interface ProcessingDocumentsProps {
  uploadedFiles: File[];
  documentType: DocumentType | null;
  documentSubtype: string | null;
  onProcessingComplete: (profile: UserProfile) => void;
}

export const ProcessingDocuments: React.FC<ProcessingDocumentsProps> = ({ 
  uploadedFiles,
  documentType, 
  documentSubtype,
  onProcessingComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1); // 1 = Reading, 2 = Extracting, 3 = Preparing, 4 = Navigating
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const processDocument = async () => {
      try {
        setErrorMessage(null);
        setCurrentStep(1); // Reading document

        // Step 1 timer
        await new Promise((r) => setTimeout(r, 1500));
        if (!isMounted) return;

        setCurrentStep(2); // Extracting information

        let extractedProfile: UserProfile = {
          fullName: '',
          dob: '',
          state: '',
          address: '',
          annualIncome: '',
          occupation: '',
          gender: '',
          fatherName: '',
          motherName: '',
          bloodGroup: '',
          aadhaarNumber: '',
          panNumber: '',
          drivingLicenceNumber: '',
          voterIdNumber: '',
          district: '',
          pinCode: '',
        };

        if (uploadedFiles && uploadedFiles.length > 0) {
          console.log('[DATA FLOW] Sending files to backend extract-fields API:', uploadedFiles.map(f => f.name));
          const res = await extractFields(uploadedFiles, documentType || 'Other', documentSubtype || undefined);
          console.log('[DATA FLOW] Backend extract-fields response:', res);

          if (res.success && res.extracted_data) {
            const ext = res.extracted_data;
            const conf = res.confidence_data || {};
            
            // Validate name
            const rawName = ext.full_name || '';
            const nameConf = conf.full_name?.confidence ?? 100;
            const isNameValid = validateName(rawName) && (typeof nameConf !== 'number' || nameConf >= 70);
            const validName = isNameValid ? cleanName(rawName) : '';

            // Validate DOB
            const rawDob = ext.date_of_birth || '';
            const isDobValid = validateDOB(rawDob);
            const validDob = isDobValid ? normalizeDOB(rawDob) : '';

            // Validate State
            const rawState = ext.state || '';
            const stateConf = conf.state?.confidence ?? 100;
            const isStateValid = validateIndianState(rawState) && (typeof stateConf !== 'number' || stateConf >= 70);
            const validState = isStateValid ? rawState : '';

            // Validate Address
            const rawAddress = ext.address || '';
            const addrConf = conf.address?.confidence ?? 100;
            const isAddrValid = validateAddress(rawAddress) && (typeof addrConf !== 'number' || addrConf >= 70);
            const validAddress = isAddrValid ? rawAddress : '';

            extractedProfile = {
              fullName: validName,
              dob: validDob,
              state: validState,
              address: validAddress,
              annualIncome: ext.annual_income || '',
              occupation: ext.occupation || '',
              gender: ext.gender || '',
              fatherName: ext.father_name || '',
              motherName: ext.mother_name || '',
              bloodGroup: ext.blood_group || '',
              aadhaarNumber: ext.aadhaar_number || '',
              panNumber: ext.pan_number || '',
              drivingLicenceNumber: ext.driving_licence_number || '',
              voterIdNumber: ext.voter_id_number || '',
              district: ext.district || '',
              pinCode: ext.pin_code || '',
            };

            // Debug prints
            console.log("RAW EXTRACTION:", ext);
            console.log("VALIDATED RESULT:", extractedProfile);

            localStorage.setItem('sahayak_extraction_success', 'true');
            if (res.confidence_data) {
              localStorage.setItem('sahayak_confidence_data', JSON.stringify(res.confidence_data));
            } else {
              localStorage.removeItem('sahayak_confidence_data');
            }
          } else {
            localStorage.setItem('sahayak_extraction_success', 'false');
            localStorage.removeItem('sahayak_confidence_data');
          }
        } else {
          // If no file was passed (e.g. direct URL visit), fetch existing profile from backend
          const res = await fetch('http://127.0.0.1:8001/api/profile').then(r => r.json()).catch(() => ({}));
          if (res.success && res.data) {
            const d = res.data;
            const rawName = d.full_name || '';
            const validName = validateName(rawName) ? cleanName(rawName) : '';
            const rawDob = d.date_of_birth || '';
            const validDob = validateDOB(rawDob) ? normalizeDOB(rawDob) : '';
            const rawState = d.state || '';
            const validState = validateIndianState(rawState) ? rawState : '';
            const rawAddress = d.address || '';
            const validAddress = validateAddress(rawAddress) ? rawAddress : '';

            extractedProfile = {
              fullName: validName,
              dob: validDob,
              state: validState,
              address: validAddress,
              annualIncome: d.annual_income || '',
              occupation: d.occupation || '',
              gender: d.gender || '',
              fatherName: d.father_name || '',
              motherName: d.mother_name || '',
              bloodGroup: d.blood_group || '',
              aadhaarNumber: d.aadhaar_number || '',
              panNumber: d.pan_number || '',
              drivingLicenceNumber: d.driving_licence_number || '',
              voterIdNumber: d.voter_id_number || '',
              district: d.district || '',
              pinCode: d.pin_code || '',
            };
          }
        }

        if (!isMounted) return;
        setCurrentStep(3); // Preparing profile

        await new Promise((r) => setTimeout(r, 1500));
        if (!isMounted) return;

        // Save profile and navigate
        console.log('[DATA FLOW] Saving extracted profile and navigating to /review:', extractedProfile);
        localStorage.setItem('sahayak_user_profile', JSON.stringify(extractedProfile));
        onProcessingComplete(extractedProfile);
        setCurrentStep(4);
        navigate('/review');

      } catch (err: any) {
        console.error('[DATA FLOW ERROR] Document extraction failed:', err);
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to extract document content. Please try again.');
        }
      }
    };

    processDocument();

    return () => {
      isMounted = false;
    };
  }, [uploadedFiles, documentType, documentSubtype, navigate, onProcessingComplete]);

  const handleCancel = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Top Banner (Minimal header, suppression of main nav per layout rules) */}
      <header className="bg-surface shadow-sm h-20 flex items-center px-4 md:px-margin-desktop w-full shrink-0">
        <div className="max-w-container-max mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              alt="State Emblem of India" 
              className="h-10 w-auto"
              src="https://lh3.googleusercontent.com/aida/AP1WRLvpacausV289CU9wbrAYrstiDM35Kyo3CN87nc0Gfp9QY6gCcaDsTwNN38c2XVpFb3M_Jo-2Q7X6F_PGpFFIQlNoAT6K__6BF0CC75k77cjCypZ8sT9rrrz5SCSLArQfME1daiSxtGedJHV8a4je-_Rl7MFHVYiJxNk2HfcuBI08dSB0ehcXIkoxj-ad4b8fAEAOrhtH1VJcwRo1gBdQHAQgjWVS-TO9srGotOFfch7SrmaMgOELW0S3v8"
            />
            <div className="text-title-lg font-title-lg font-bold text-primary">SAHAYAK</div>
          </div>
          <button 
            onClick={handleCancel}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-label-md font-label-md"
          >
            <span className="material-symbols-outlined text-[20px]">close</span> 
            Cancel
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 md:px-margin-desktop">
        {errorMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-error/10 border border-error text-error px-6 py-4 rounded-xl shadow-lg flex items-center gap-4">
            <span>{errorMessage}</span>
            <button onClick={() => navigate('/upload')} className="underline font-semibold">Try Again</button>
          </div>
        )}
        <div className="max-w-container-max mx-auto w-full flex flex-col lg:flex-row gap-gutter lg:gap-margin-desktop items-center lg:items-stretch h-full min-h-[500px]">
          
          {/* Left: Document Preview (Blurred) */}
          <div className="flex-1 w-full max-w-[600px] min-h-[350px] bg-surface-container-low rounded-xl shadow-natural-bloom flex items-center justify-center p-6 relative overflow-hidden border border-outline-variant/30">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-10 flex items-center justify-center">
              <div className="bg-surface/80 p-stack-lg rounded-xl flex flex-col items-center gap-stack-md text-center max-w-[80%]">
                <span className="material-symbols-outlined text-[48px] text-primary pulse-border rounded-full p-4 border-2">
                  document_scanner
                </span>
                <p className="text-title-lg font-title-lg text-primary font-semibold">Scanning Documents</p>
                <p className="text-sm text-on-surface-variant">Uploading {uploadedFiles.length} file(s) for OCR validation</p>
              </div>
            </div>
            {/* Mock document content underneath blur */}
            <div className="w-full h-full bg-white shadow-sm p-8 flex flex-col gap-4 opacity-50 pointer-events-none">
              <div className="h-8 bg-surface-variant rounded w-1/3"></div>
              <div className="h-4 bg-surface-variant rounded w-full mt-4"></div>
              <div className="h-4 bg-surface-variant rounded w-full"></div>
              <div className="h-4 bg-surface-variant rounded w-5/6"></div>
              <div className="h-32 bg-surface-variant rounded w-full mt-8"></div>
              <div className="h-4 bg-surface-variant rounded w-full mt-4"></div>
              <div className="h-4 bg-surface-variant rounded w-3/4"></div>
            </div>
          </div>

          {/* Right: Reading Status Card */}
          <div className="flex-1 w-full max-w-[500px] flex flex-col justify-center">
            <div className="bg-surface-container-lowest rounded-xl shadow-natural-bloom p-6 md:p-margin-desktop border border-surface-container flex flex-col gap-stack-lg">
              <div>
                <h1 className="text-headline-lg font-headline-lg text-on-surface mb-unit font-bold">Reading your documents</h1>
                <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
                  Please wait while we extract important information to save you time.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex flex-col gap-stack-md">
                
                {/* Step 1: Uploaded (Always Done here) */}
                <div className="flex items-start gap-stack-md">
                  <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-title-lg font-title-lg text-on-surface font-semibold">{uploadedFiles.length} File(s) uploaded</span>
                    <span className="text-body-md font-body-md text-on-surface-variant">Securely transferred</span>
                  </div>
                </div>

                {/* Step 2: Reading Document */}
                <div className={`flex items-start gap-stack-md relative transition-opacity duration-300 ${currentStep < 1 ? 'opacity-50' : 'opacity-100'}`}>
                  {/* Connecting Line */}
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
                      Reading Documents
                    </span>
                    <span className="text-body-md font-body-md text-on-surface-variant">Scanning document layouts...</span>
                    {currentStep === 1 && (
                      <div className="mt-4 h-2 bg-surface-container rounded-full overflow-hidden w-full max-w-[200px]">
                        <div className="h-full bg-primary rounded-full w-2/3 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Extracting Info */}
                <div className={`flex items-start gap-stack-md relative transition-opacity duration-300 ${currentStep < 2 ? 'opacity-50' : 'opacity-100'}`}>
                  {/* Connecting Line */}
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
                      Extracting Important Information
                    </span>
                    <span className="text-body-md font-body-md text-on-surface-variant">Extracting name, address, and IDs...</span>
                    {currentStep === 2 && (
                      <div className="mt-4 h-2 bg-surface-container rounded-full overflow-hidden w-full max-w-[200px]">
                        <div className="h-full bg-primary rounded-full w-1/2 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 4: Preparing Profile */}
                <div className={`flex items-start gap-stack-md relative transition-opacity duration-300 ${currentStep < 3 ? 'opacity-50' : 'opacity-100'}`}>
                  {/* Connecting Line */}
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
                      Preparing Your Profile
                    </span>
                    <span className="text-body-md font-body-md text-on-surface-variant">Almost there...</span>
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

        </div>
      </main>
    </div>
  );
};
