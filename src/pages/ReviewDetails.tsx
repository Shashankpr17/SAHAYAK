import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { UserProfile } from '../types';
import { getProfile, updateProfile, saveVerifiedProfile } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface ReviewDetailsProps {
  profile: UserProfile | null;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
  extractedFiles?: any[];
}

export const ReviewDetails: React.FC<ReviewDetailsProps> = ({ profile, onProfileUpdated, extractedFiles }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  // Local form state
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [drivingLicenceNumber, setDrivingLicenceNumber] = useState('');
  const [voterIdNumber, setVoterIdNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [city, setCity] = useState('');
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [backupProfile, setBackupProfile] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [noticeType, setNoticeType] = useState<'warning' | 'info' | null>(null);

  // Load profile details from backend GET /api/profile when page is loaded
  useEffect(() => {
    const loadProfile = async () => {
      try {
        console.log('[DATA FLOW] Fetching profile from GET /api/profile');
        const res = await getProfile();
        console.log('[DATA FLOW] GET /api/profile response:', res);
        
        if (res.success && res.data) {
          const d = res.data;

          console.log("FINAL UI DATA FROM BACKEND:", {
            fullName: d.full_name,
            dob: d.date_of_birth,
            state: d.state,
            address: d.address
          });

          setFullName(d.full_name || '');
          setDob(d.date_of_birth || '');
          setState(d.state || '');
          setAddress(d.address || '');
          setAnnualIncome(d.annual_income || '');
          setOccupation(d.occupation || '');
          setGender(d.gender || '');
          setFatherName(d.father_name || '');
          setMotherName(d.mother_name || '');
          setBloodGroup(d.blood_group || '');
          setAadhaarNumber(d.aadhaar_number || '');
          console.log(`[DEBUG LOG] frontend received Aadhaar exists (loadProfile): ${!!d.aadhaar_number}`);
          setPanNumber(d.pan_number || '');
          setDrivingLicenceNumber(d.driving_licence_number || '');
          setVoterIdNumber(d.voter_id_number || '');
          setDistrict(d.district || '');
          setCity(d.city || '');
          setPinCode(d.pin_code || '');
          return;
        }
      } catch (err) {
        console.warn('[DATA FLOW WARNING] Backend /api/profile unavailable, checking client state:', err);
      }

      if (profile) {
        console.log("FINAL UI DATA FROM CLIENT PROFILE PROP:", {
          fullName: profile.fullName,
          dob: profile.dob,
          state: profile.state,
          address: profile.address
        });

        setFullName(profile.fullName || '');
        setDob(profile.dob || '');
        setState(profile.state || '');
        setAddress(profile.address || '');
        setAnnualIncome(profile.annualIncome || '');
        setOccupation(profile.occupation || '');
        setGender(profile.gender || '');
        setFatherName(profile.fatherName || '');
        setMotherName(profile.motherName || '');
        setBloodGroup(profile.bloodGroup || '');
        setAadhaarNumber(profile.aadhaarNumber || '');
        console.log(`[DEBUG LOG] frontend received Aadhaar exists (profile fallback): ${!!profile.aadhaarNumber}`);
        setPanNumber(profile.panNumber || '');
        setDrivingLicenceNumber(profile.drivingLicenceNumber || '');
        setVoterIdNumber(profile.voterIdNumber || '');
        setDistrict(profile.district || '');
        setCity(profile.city || '');
        setPinCode(profile.pinCode || '');
      }
    };

    loadProfile();

    // Check extraction state
    const successStr = localStorage.getItem('sahayak_extraction_success');
    const confidenceJson = localStorage.getItem('sahayak_confidence_data');
    
    let isDobConfidenceLow = false;
    if (confidenceJson) {
      try {
        const confData = JSON.parse(confidenceJson);
        const dobConf = confData.date_of_birth;
        if (dobConf) {
          if (dobConf.confidence === 'low' || (typeof dobConf.confidence === 'number' && dobConf.confidence < 70)) {
            isDobConfidenceLow = true;
          }
        }
      } catch (e) {}
    }

    if (isDobConfidenceLow) {
      setNoticeMessage(
        language === 'en' 
          ? "DOB could not be confidently extracted. Please review and enter it manually." 
          : language === 'hi' 
            ? "जन्म तिथि विश्वास के साथ नहीं निकाली जा सकी। कृपया समीक्षा करें और इसे मैन्युअल रूप से दर्ज करें।" 
            : "ଜନ୍ମ ତାରିଖ ସଠିକ୍ ଭାବେ ବାହାର କରିହେଲାନାହିଁ | ଦୟାକରି ଯାଞ୍ଚ କରି ନିଜେ ଲେଖନ୍ତୁ |"
      );
      setNoticeType('warning');
    } else if (successStr === 'false') {
      setNoticeMessage(
        language === 'en' 
          ? "We couldn't confidently extract all details. Please enter or edit them manually." 
          : language === 'hi' 
            ? "हम सभी विवरण विश्वास के साथ नहीं निकाल पाए। कृपया उन्हें मैन्युअल रूप से दर्ज करें या सुधारें।" 
            : "ଆମେ ସମସ୍ତ ବିବରଣୀ ସଠିକ୍ ଭାବେ ବାହାର କରିପାରିଲୁ ନାହିଁ | ଦୟାକରି ଯାଞ୍ଚ କରନ୍ତୁ କିମ୍ବା ନିଜେ ସଂଶୋଧନ କରନ୍ତୁ |"
      );
      setNoticeType('warning');
    } else if (confidenceJson) {
      try {
        const confData = JSON.parse(confidenceJson);
        let hasLowConfidence = false;
        for (const key of Object.keys(confData)) {
          const item = confData[key];
          if (item) {
            if (item.confidence === 'low' || (typeof item.confidence === 'number' && item.confidence < 60)) {
              hasLowConfidence = true;
              break;
            }
          }
        }
        if (hasLowConfidence) {
          setNoticeMessage(t("uncertain_warning"));
          setNoticeType('info');
        }
      } catch (err) {
        console.error("Failed to parse confidence data:", err);
      }
    }
  }, [profile, language]);

  const handleSaveChanges = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = language === 'en' ? 'Full Name is required.' : language === 'hi' ? 'पूरा नाम आवश्यक है।' : 'ସମ୍ପୂର୍ଣ୍ଣ ନାମ ଆବଶ୍ୟକ |';
    if (!dob.trim()) newErrors.dob = language === 'en' ? 'Date of Birth is required.' : language === 'hi' ? 'जन्म तिथि आवश्यक है।' : 'ଜନ୍ମ ତାରିଖ ଆବଶ୍ୟକ |';
    if (!state.trim()) newErrors.state = language === 'en' ? 'State is required.' : language === 'hi' ? 'राज्य आवश्यक है।' : 'ରାଜ୍ୟ ଆବଶ୍ୟକ |';
    if (!address.trim()) newErrors.address = language === 'en' ? 'Address is required.' : language === 'hi' ? 'पता आवश्यक है।' : 'ଠିକଣା ଆବଶ୍ୟକ |';

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setValidationErrors({});
    setIsEditing(false);

    const updated = {
      fullName,
      dob,
      state,
      address,
      annualIncome,
      occupation,
      gender,
      fatherName,
      motherName,
      bloodGroup,
      aadhaarNumber,
      panNumber,
      drivingLicenceNumber,
      voterIdNumber,
      district,
      pinCode,
      city
    };

    try {
      await updateProfile({
        full_name: fullName,
        date_of_birth: dob,
        state: state,
        address: address,
        annual_income: annualIncome,
        occupation: occupation,
        gender: gender,
        father_name: fatherName,
        mother_name: motherName,
        blood_group: bloodGroup,
        aadhaar_number: aadhaarNumber,
        pan_number: panNumber,
        driving_licence_number: drivingLicenceNumber,
        voter_id_number: voterIdNumber,
        district: district,
        pin_code: pinCode,
        city: city
      });
    } catch (err) {
      console.warn('[DATA FLOW] updateProfile failed:', err);
    }
    localStorage.setItem('sahayak_user_profile', JSON.stringify(updated));
    onProfileUpdated(updated);
  };

  const handleCancelChanges = () => {
    if (backupProfile) {
      setFullName(backupProfile.fullName);
      setDob(backupProfile.dob);
      setState(backupProfile.state);
      setAddress(backupProfile.address);
      setAnnualIncome(backupProfile.annualIncome);
      setOccupation(backupProfile.occupation);
      setGender(backupProfile.gender || '');
      setFatherName(backupProfile.fatherName || '');
      setMotherName(backupProfile.motherName || '');
      setBloodGroup(backupProfile.bloodGroup || '');
      setAadhaarNumber(backupProfile.aadhaarNumber || '');
      setPanNumber(backupProfile.panNumber || '');
      setDrivingLicenceNumber(backupProfile.drivingLicenceNumber || '');
      setVoterIdNumber(backupProfile.voterIdNumber || '');
      setDistrict(backupProfile.district || '');
      setCity(backupProfile.city || '');
      setPinCode(backupProfile.pinCode || '');
    }
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = language === 'en' ? 'Full Name is required.' : language === 'hi' ? 'पूरा नाम आवश्यक है।' : 'ସମ୍ପୂର୍ଣ୍ଣ ନାମ ଆବଶ୍ୟକ |';
    if (!dob.trim()) newErrors.dob = language === 'en' ? 'Date of Birth is required.' : language === 'hi' ? 'जन्म तिथि आवश्यक है।' : 'ଜନ୍ମ ତାରିଖ ଆବଶ୍ୟକ |';
    if (!state.trim()) newErrors.state = language === 'en' ? 'State is required.' : language === 'hi' ? 'राज्य आवश्यक है।' : 'ରାଜ୍ୟ ଆବଶ୍ୟକ |';
    if (!address.trim()) newErrors.address = language === 'en' ? 'Address is required.' : language === 'hi' ? 'पता आवश्यक है।' : 'ଠିକଣା ଆବଶ୍ୟକ |';

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      console.log(`[DATA FLOW] Confirming profile details and saving to verified profile schema`);
      const payload = {
        full_name: fullName.trim(),
        date_of_birth: dob.trim(),
        state: state.trim(),
        address: address.trim(),
        annual_income: annualIncome.trim(),
        occupation: occupation.trim(),
        gender: gender || '',
        father_name: fatherName || '',
        mother_name: motherName || '',
        blood_group: bloodGroup || '',
        aadhaar_number: aadhaarNumber || '',
        pan_number: panNumber || '',
        driving_licence_number: drivingLicenceNumber || '',
        voter_id_number: voterIdNumber || '',
        district: district || '',
        pin_code: pinCode || '',
        city: city || ''
      };

      const updated = {
        fullName: payload.full_name,
        dob: payload.date_of_birth,
        state: payload.state,
        address: payload.address,
        annualIncome: payload.annual_income,
        occupation: payload.occupation,
        gender: payload.gender,
        fatherName: payload.father_name,
        motherName: payload.mother_name,
        bloodGroup: payload.blood_group,
        aadhaarNumber: payload.aadhaar_number,
        panNumber: payload.pan_number,
        drivingLicenceNumber: payload.driving_licence_number,
        voterIdNumber: payload.voter_id_number,
        district: payload.district,
        pinCode: payload.pin_code,
        city: payload.city
      };

      localStorage.setItem('sahayak_user_profile', JSON.stringify(updated));
      onProfileUpdated(updated);

      const res = await saveVerifiedProfile(payload);
      console.log(`[DATA FLOW] saveVerifiedProfile response:`, res);
      
      if (res.success) {
        navigate('/schemes');
      } else {
        setSaveError(res.detail || res.message || 'Failed to save verified profile details.');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError(err.message || 'An error occurred while saving the profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/upload');
  };

  const getMaskedVal = (val: string, show: boolean, placeholder: string = 'Not available') => {
    if (!val) return language === 'en' ? placeholder : language === 'hi' ? 'उपलब्ध नहीं' : 'ଉପଲବ୍ଧ ନାହିଁ';
    const digits = val.replace(/\D/g, '');
    if (show) {
      if (digits.length === 12) {
        return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
      }
      return val;
    }
    // Mask sensitive digits
    if (digits.length <= 4) return val;
    const visible = digits.slice(-4);
    const masked = 'X'.repeat(digits.length - 4);
    
    // Format Aadhaar Style: XXXX XXXX 1234
    if (digits.length === 12) {
      return `XXXX XXXX ${visible}`;
    }
    return `${masked}${visible}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Header />

      <main className="flex-grow max-w-container-max mx-auto w-full px-4 md:px-margin-desktop py-10 flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          
          {/* Header Block */}
          <div className="text-center space-y-2 mb-4">
            <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                task_alt
              </span>
            </div>
            <h1 className="font-display-lg text-3xl md:text-display-lg text-on-surface mb-stack-sm tracking-tight font-semibold">
              {language === 'en' ? 'Please review your details' : language === 'hi' ? 'कृपया अपने विवरण की समीक्षा करें' : 'ଦୟାକରି ଆପଣଙ୍କ ବିବରଣୀ ସମୀକ୍ଷା କରନ୍ତୁ'}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto">
              {language === 'en' 
                ? 'We found this information in your document. Please check that everything is correct.' 
                : language === 'hi' 
                  ? 'हमें आपके दस्तावेज़ में यह जानकारी मिली है। कृपया जांचें कि सब कुछ सही है।' 
                  : 'ଆମେ ଆପଣଙ୍କ ଦସ୍ତାବିଜରେ ଏହି ସୂଚନା ପାଇଛୁ | ଦୟାକରି ସମସ୍ତ ତଥ୍ୟ ଯାଞ୍ଚ କରନ୍ତୁ |'}
            </p>
          </div>

          {noticeMessage && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
              noticeType === 'warning' 
                ? 'bg-error-container/20 border-error/20 text-error' 
                : 'bg-primary-container/20 border-primary/20 text-primary'
            }`}>
              <span className="material-symbols-outlined shrink-0 mt-0.5">
                {noticeType === 'warning' ? 'warning' : 'info'}
              </span>
              <p className="font-body-md text-sm leading-relaxed">{noticeMessage}</p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-10 border border-outline-variant/30 shadow-sm">
            {isEditing ? (
              <div className="flex justify-end gap-3 mb-6 animate-fade-in">
                <button 
                  type="button"
                  onClick={handleCancelChanges}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline text-on-surface rounded-full font-label-md text-xs hover:bg-surface-container-low transition-colors font-bold shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  {language === 'en' ? 'Cancel' : language === 'hi' ? 'रद्द करें' : 'ବାତିଲ୍ କରନ୍ତୁ'}
                </button>
                <button 
                  type="button"
                  onClick={handleSaveChanges}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-full font-label-md text-xs hover:bg-primary-hover shadow-sm transition-colors font-bold"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  {language === 'en' ? 'Save Changes' : language === 'hi' ? 'परिवर्तन सुरक्षित करें' : 'ପରିବର୍ତ୍ତନ ସଂରକ୍ଷଣ କରନ୍ତୁ'}
                </button>
              </div>
            ) : (
              <div className="flex justify-end mb-6">
                <button 
                  type="button"
                  onClick={() => {
                    setBackupProfile({
                      fullName,
                      dob,
                      state,
                      address,
                      annualIncome,
                      occupation,
                      gender,
                      fatherName,
                      motherName,
                      bloodGroup,
                      aadhaarNumber,
                      panNumber,
                      drivingLicenceNumber,
                      voterIdNumber,
                      district,
                      pinCode
                    });
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center gap-2 text-primary font-label-md text-label-md hover:text-primary/80 transition-colors font-semibold"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                  {language === 'en' ? 'Edit Details' : language === 'hi' ? 'विवरण संपादित करें' : 'ବିବରଣୀ ସଂଶୋଧନ କରନ୍ତୁ'}
                </button>
              </div>
            )}
            {saveError && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-sm text-red-900 dark:text-red-300 animate-fade-in">
                <span className="material-symbols-outlined text-red-700 dark:text-red-500">error</span>
                <span>{saveError}</span>
              </div>
            )}
            
            <form onSubmit={handleConfirm}>
              {/* SECTION 1 — PERSONAL DETAILS */}
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-on-surface font-bold text-lg mb-4 border-b border-outline-variant pb-2">{t("sec_personal")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="fullName">
                      {t("full_name")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">person</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    {validationErrors.fullName && (
                      <p className="text-error text-xs font-bold mt-1 animate-fade-in">{validationErrors.fullName}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="dob">
                      {t("date_of_birth")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">calendar_month</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="dob"
                        type="text"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </div>
                    {validationErrors.dob && (
                      <p className="text-error text-xs font-bold mt-1 animate-fade-in">{validationErrors.dob}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="gender">
                      {t("gender")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">wc</span>
                      {isEditing ? (
                        <select
                          className="w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white border-outline"
                          id="gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="">{t("gender_placeholder")}</option>
                          <option value="Male">{t("gender_male")}</option>
                          <option value="Female">{t("gender_female")}</option>
                          <option value="Transgender">{t("gender_other")}</option>
                        </select>
                      ) : (
                        <input
                          disabled
                          className="w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface border-transparent input-recessed cursor-not-allowed"
                          id="gender"
                          type="text"
                          value={
                            gender === 'Male' ? t('gender_male') : gender === 'Female' ? t('gender_female') : gender === 'Transgender' ? t('gender_other') : (gender || (language === 'en' ? 'Not available' : language === 'hi' ? 'उपलब्ध नहीं' : 'ଉପଲବ୍ଧ ନାହିଁ'))
                          }
                        />
                      )}
                    </div>
                  </div>

                  {/* Father's Name */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="fatherName">
                      {t("father_name")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">family_restroom</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="fatherName"
                        type="text"
                        value={isEditing ? fatherName : (fatherName || (language === 'en' ? 'Not available' : language === 'hi' ? 'उपलब्ध नहीं' : 'ଉପଲବ୍ଧ ନାହିଁ'))}
                        onChange={(e) => setFatherName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Mother's Name */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="motherName">
                      {t("mother_name")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">woman</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="motherName"
                        type="text"
                        value={isEditing ? motherName : (motherName || (language === 'en' ? 'Not available' : language === 'hi' ? 'उपलब्ध नहीं' : 'ଉପଲବ୍ଧ ନାହିଁ'))}
                        onChange={(e) => setMotherName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="bloodGroup">
                      {t("blood_group")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">bloodtype</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="bloodGroup"
                        type="text"
                        value={isEditing ? bloodGroup : (bloodGroup || (language === 'en' ? 'Not available' : language === 'hi' ? 'उपलब्ध नहीं' : 'ଉପଲବ୍ଧ ନାହିଁ'))}
                        onChange={(e) => setBloodGroup(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2 — IDENTITY INFORMATION */}
              <div className="col-span-1 md:col-span-2 pt-6 mt-4">
                <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
                  <h3 className="text-on-surface font-bold text-lg">{t("sec_identity")}</h3>
                  
                  {/* Masking Toggle Control */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={!showAadhaar} 
                      onChange={(e) => setShowAadhaar(!e.target.checked)}
                      className="rounded border-outline text-primary focus:ring-primary"
                    />
                    <span className="text-xs text-on-surface-variant font-medium">
                      {t("mask_aadhaar_check")}
                    </span>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aadhaar Number */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="aadhaar">
                      {t("aadhaar_number")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">fingerprint</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="aadhaar"
                        type="text"
                        value={isEditing ? aadhaarNumber : getMaskedVal(aadhaarNumber, showAadhaar)}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* PAN Number */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="pan">
                      {t("pan_number")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">badge</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="pan"
                        type="text"
                        value={isEditing ? panNumber : getMaskedVal(panNumber, showAadhaar)}
                        onChange={(e) => setPanNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Driving Licence Number */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="dl">
                      {t("driving_licence_number")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">car_rental</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="dl"
                        type="text"
                        value={isEditing ? drivingLicenceNumber : getMaskedVal(drivingLicenceNumber, showAadhaar)}
                        onChange={(e) => setDrivingLicenceNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Voter ID */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="voter">
                      {t("voter_id_number")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">how_to_vote</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="voter"
                        type="text"
                        value={isEditing ? voterIdNumber : getMaskedVal(voterIdNumber, showAadhaar)}
                        onChange={(e) => setVoterIdNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3 — ADDRESS DETAILS */}
              <div className="col-span-1 md:col-span-2 pt-6 mt-4">
                <h3 className="text-on-surface font-bold text-lg mb-4 border-b border-outline-variant pb-2">{t("sec_address")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Address */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="address">
                      {t("address")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">home</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    {validationErrors.address && (
                      <p className="text-error text-xs font-bold mt-1 animate-fade-in">{validationErrors.address}</p>
                    )}
                  </div>

                  {/* State */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="state">
                      {t("state")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">map</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="state"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    {validationErrors.state && (
                      <p className="text-error text-xs font-bold mt-1 animate-fade-in">{validationErrors.state}</p>
                    )}
                  </div>

                  {/* District */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="district">
                      {t("district")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">location_city</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="district"
                        type="text"
                        value={isEditing ? district : (district || (language === 'en' ? 'Not available' : language === 'hi' ? 'उपलब्ध नहीं' : 'ଉପଲବ୍ଧ ନାହିଁ'))}
                        onChange={(e) => setDistrict(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="city">
                      {t("city")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">location_city</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="city"
                        type="text"
                        value={isEditing ? city : (city || (language === 'en' ? 'Not available' : language === 'hi' ? 'उपलब्ध नहीं' : 'ଉପଲବ୍ଧ ନାହିଁ'))}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* PIN Code */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="pinCode">
                      {t("pin_code")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">pin</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="pinCode"
                        type="text"
                        value={isEditing ? pinCode : (pinCode || (language === 'en' ? 'Not available' : language === 'hi' ? 'उपलब्ध नहीं' : 'ଉପଲବ୍ଧ ନାହିଁ'))}
                        onChange={(e) => setPinCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4 — ADDITIONAL INFORMATION */}
              <div className="col-span-1 md:col-span-2 pt-6 mt-4">
                <h3 className="text-on-surface font-bold text-lg mb-4 border-b border-outline-variant pb-2">{t("sec_additional")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Annual Income */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="income">
                      {t("annual_income")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">payments</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="income"
                        type="text"
                        value={annualIncome}
                        onChange={(e) => setAnnualIncome(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Occupation */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="occupation">
                      {t("occupation")}
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">work</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="occupation"
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside Form */}
              <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 mt-10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full md:w-auto px-8 py-3 rounded-full border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-low hover:border-outline transition-all duration-200"
                >
                  {t("back_btn")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`w-full md:w-auto px-8 py-3 rounded-full font-label-md text-label-md shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 font-bold ${
                    isSaving 
                      ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-75' 
                      : 'bg-primary text-on-primary hover:bg-primary/90'
                  }`}
                >
                  {isSaving ? (language === 'en' ? 'Saving Profile...' : language === 'hi' ? 'प्रोफ़ाइल सहेजा जा रहा है...' : 'ପ୍ରୋଫାଇଲ୍ ସଂରକ୍ଷଣ ହେଉଛି...') : (language === 'en' ? 'Confirm & Continue' : language === 'hi' ? 'पुष्टि करें और जारी रखें' : 'ନିଶ୍ଚିତ କରନ୍ତୁ ଏବଂ ଜାରି ରଖନ୍ତୁ')}
                  {!isSaving && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                </button>
              </div>
            </form>
          </div>

          {/* Extracted Documents Section */}
          {extractedFiles && extractedFiles.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm mt-4 animate-fade-in">
              <h3 className="text-on-surface font-bold text-lg mb-4 border-b border-outline-variant pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                <span>
                  {language === 'en' ? 'Extracted Document Content' : language === 'hi' ? 'निकाली गई दस्तावेज़ सामग्री' : 'ଦସ୍ତାବିଜରୁ ବାହାର କରାଯାଇଥିବା ତଥ୍ୟ'}
                </span>
              </h3>
              
              <div className="space-y-4">
                {extractedFiles.map((file, idx) => (
                  <div key={idx} className="border border-outline-variant/20 rounded-xl p-4 bg-surface-container-low">
                    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-on-surface-variant text-base">
                          {file.file_type?.includes('pdf') ? 'picture_as_pdf' : 'image'}
                        </span>
                        <span className="font-title-md font-semibold text-on-surface text-sm truncate max-w-xs md:max-w-md">
                          {file.filename}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        file.status === 'success' 
                          ? 'bg-success-container/20 text-success' 
                          : 'bg-error-container/20 text-error'
                      }`}>
                        {file.status === 'success' 
                          ? (language === 'en' ? 'Success' : language === 'hi' ? 'सफल' : 'ସଫଳ') 
                          : (language === 'en' ? 'Failed' : language === 'hi' ? 'विफल' : 'ବିଫଳ')}
                      </span>
                    </div>

                    {file.status === 'success' ? (
                      <div className="mt-2 text-xs font-body-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/10 font-mono">
                        {file.text}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs font-body-sm text-error/80 flex items-center gap-1.5 p-2 bg-error-container/10 rounded-lg">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        <span>
                          {language === 'en' 
                            ? 'Failed to extract readable text from this file.' 
                            : language === 'hi' 
                              ? 'इस फ़ाइल से पठनीय पाठ निकालने में विफल।' 
                              : 'ଏହି ଫାଇଲରୁ ପଠନଯୋଗ୍ୟ ତଥ୍ୟ ବାହାର କରିବାରେ ବିଫଳ |'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex justify-center items-center gap-2 mt-8 text-on-surface-variant opacity-80">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span className="font-label-sm text-label-sm">
              {language === 'en' 
                ? 'Your information is used only to personalize your experience.' 
                : language === 'hi' 
                  ? 'आपकी जानकारी का उपयोग केवल आपके अनुभव को व्यक्तिगत बनाने के लिए किया जाता है।' 
                  : 'ଆପଣଙ୍କ ଅଭିଜ୍ଞତାକୁ ବ୍ୟକ୍ତିଗତ କରିବା ପାଇଁ କେବଳ ଆପଣଙ୍କ ସୂଚନା ବ୍ୟବହାର କରାଯାଏ |'}
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
