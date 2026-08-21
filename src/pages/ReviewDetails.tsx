import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { UserProfile } from '../types';
import { getProfile, updateProfile, saveVerifiedProfile } from '../services/api';
import { validateName, cleanName, validateDOB, normalizeDOB, validateIndianState, validateAddress } from './ProcessingDocuments';

interface ReviewDetailsProps {
  profile: UserProfile | null;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}

export const ReviewDetails: React.FC<ReviewDetailsProps> = ({ profile, onProfileUpdated }) => {
  const navigate = useNavigate();
  
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
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
          const confJson = localStorage.getItem('sahayak_confidence_data');
          const conf = confJson ? JSON.parse(confJson) : {};
          
          const rawName = d.full_name || '';
          const nameConf = conf.full_name?.confidence ?? 100;
          const isNameValid = validateName(rawName) && (typeof nameConf !== 'number' || nameConf >= 70);
          const validName = isNameValid ? cleanName(rawName) : '';

          const rawDob = d.date_of_birth || '';
          const dobConf = conf.date_of_birth?.confidence ?? 100;
          const isDobValid = validateDOB(rawDob) && (typeof dobConf !== 'number' || dobConf >= 70);
          const validDob = isDobValid ? normalizeDOB(rawDob) : '';

          const rawState = d.state || '';
          const stateConf = conf.state?.confidence ?? 100;
          const isStateValid = validateIndianState(rawState) && (typeof stateConf !== 'number' || stateConf >= 70);
          const validState = isStateValid ? rawState : '';

          const rawAddress = d.address || '';
          const addrConf = conf.address?.confidence ?? 100;
          const isAddrValid = validateAddress(rawAddress) && (typeof addrConf !== 'number' || addrConf >= 70);
          const validAddress = isAddrValid ? rawAddress : '';

          console.log("FINAL UI DATA:", {
            fullName: validName,
            dob: validDob,
            state: validState,
            address: validAddress
          });

          setFullName(validName);
          setDob(validDob);
          setState(validState);
          setAddress(validAddress);
          setAnnualIncome(d.annual_income || '');
          setOccupation(d.occupation || '');
          setGender(d.gender || '');
          setFatherName(d.father_name || '');
          setMotherName(d.mother_name || '');
          setBloodGroup(d.blood_group || '');
          setAadhaarNumber(d.aadhaar_number || '');
          setPanNumber(d.pan_number || '');
          setDrivingLicenceNumber(d.driving_licence_number || '');
          setVoterIdNumber(d.voter_id_number || '');
          setDistrict(d.district || '');
          setPinCode(d.pin_code || '');
          return;
        }
      } catch (err) {
        console.warn('[DATA FLOW WARNING] Backend /api/profile unavailable, checking client state:', err);
      }

      if (profile) {
        const confJson = localStorage.getItem('sahayak_confidence_data');
        const conf = confJson ? JSON.parse(confJson) : {};

        const rawName = profile.fullName || '';
        const nameConf = conf.full_name?.confidence ?? 100;
        const isNameValid = validateName(rawName) && (typeof nameConf !== 'number' || nameConf >= 70);
        const validName = isNameValid ? cleanName(rawName) : '';

        const rawDob = profile.dob || '';
        const dobConf = conf.date_of_birth?.confidence ?? 100;
        const isDobValid = validateDOB(rawDob) && (typeof dobConf !== 'number' || dobConf >= 70);
        const validDob = isDobValid ? normalizeDOB(rawDob) : '';

        const rawState = profile.state || '';
        const stateConf = conf.state?.confidence ?? 100;
        const isStateValid = validateIndianState(rawState) && (typeof stateConf !== 'number' || stateConf >= 70);
        const validState = isStateValid ? rawState : '';

        const rawAddress = profile.address || '';
        const addrConf = conf.address?.confidence ?? 100;
        const isAddrValid = validateAddress(rawAddress) && (typeof addrConf !== 'number' || addrConf >= 70);
        const validAddress = isAddrValid ? rawAddress : '';

        console.log("FINAL UI DATA:", {
          fullName: validName,
          dob: validDob,
          state: validState,
          address: validAddress
        });

        setFullName(validName);
        setDob(validDob);
        setState(validState);
        setAddress(validAddress);
        setAnnualIncome(profile.annualIncome || '');
        setOccupation(profile.occupation || '');
        setGender(profile.gender || '');
        setFatherName(profile.fatherName || '');
        setMotherName(profile.motherName || '');
        setBloodGroup(profile.bloodGroup || '');
        setAadhaarNumber(profile.aadhaarNumber || '');
        setPanNumber(profile.panNumber || '');
        setDrivingLicenceNumber(profile.drivingLicenceNumber || '');
        setVoterIdNumber(profile.voterIdNumber || '');
        setDistrict(profile.district || '');
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
      setNoticeMessage("DOB could not be confidently extracted. Please review and enter it manually.");
      setNoticeType('warning');
    } else if (successStr === 'false') {
      setNoticeMessage("We couldn't confidently extract all details. Please enter or edit them manually.");
      setNoticeType('warning');
    } else if (confidenceJson) {
      try {
        const confData = JSON.parse(confidenceJson);
        let hasLowConfidence = false;
        for (const key of Object.keys(confData)) {
          const item = confData[key];
          if (item) {
            // Check confidence ratings
            if (item.confidence === 'low' || (typeof item.confidence === 'number' && item.confidence < 60)) {
              hasLowConfidence = true;
              break;
            }
          }
        }
        if (hasLowConfidence) {
          setNoticeMessage("Some details could not be confidently extracted. Please review and edit them.");
          setNoticeType('info');
        }
      } catch (err) {
        console.error("Failed to parse confidence data:", err);
      }
    }
  }, [profile]);

  const handleSaveChanges = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!dob.trim()) newErrors.dob = 'Date of Birth is required.';
    if (!state.trim()) newErrors.state = 'State is required.';
    if (!address.trim()) newErrors.address = 'Address is required.';

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
      pinCode
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
        pin_code: pinCode
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
      setPinCode(backupProfile.pinCode || '');
    }
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationErrors({});
    
    // Inline validation for required fields
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!dob.trim()) newErrors.dob = 'Date of Birth is required.';
    if (!state.trim()) newErrors.state = 'State is required.';
    if (!address.trim()) newErrors.address = 'Address is required.';

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    const updated: UserProfile = {
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
    };

    setIsSaving(true);
    setSaveError(null);
    setIsEditing(false);

    // 1. Save verified profile to backend POST /profile
    try {
      console.log('[DATA FLOW] Saving verified profile to POST /profile:', updated);
      await saveVerifiedProfile({
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
        pin_code: pinCode
      });
    } catch (err: any) {
      console.error('[DATA FLOW ERROR] POST /profile failed:', err);
      setSaveError(err.message || 'Failed to save verified profile. Please try again.');
      setIsSaving(false);
      return; // Stop navigation!
    }

    // 2. Concurrently update backend GET/PUT endpoint for completeness
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
        pin_code: pinCode
      });
    } catch (err) {
      console.warn('[DATA FLOW WARNING] Backend PUT /api/profile sync failed:', err);
    }

    setIsSaving(false);
    localStorage.setItem('sahayak_user_profile', JSON.stringify(updated));
    onProfileUpdated(updated);
    navigate('/schemes');
  };

  const handleBack = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Header />

      <main className="flex-grow py-12 px-4 md:px-margin-desktop w-full">
        <div className="max-w-[720px] mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-tertiary-fixed mb-4">
              <span className="material-symbols-outlined text-on-tertiary-fixed-variant" style={{ fontVariationSettings: "'FILL' 1" }}>
                task_alt
              </span>
            </div>
            <h1 className="font-display-lg text-3xl md:text-display-lg text-on-surface mb-stack-sm tracking-tight font-semibold">
              Please review your details
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto">
              We found this information in your document. Please check that everything is correct.
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
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-10 bloom-shadow border border-outline-variant/30">
            {isEditing ? (
              <div className="flex justify-end gap-3 mb-6 animate-fade-in">
                <button 
                  type="button"
                  onClick={handleCancelChanges}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline text-on-surface rounded-full font-label-md text-xs hover:bg-surface-container-low transition-colors font-bold shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSaveChanges}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-full font-label-md text-xs hover:bg-primary-hover shadow-sm transition-colors font-bold"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Changes
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
                  Edit Details
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
                <h3 className="text-on-surface font-bold text-lg mb-4 border-b border-outline-variant pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="fullName">
                      Full Name
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
                      Date of Birth
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
                      Gender
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">wc</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="gender"
                        type="text"
                        value={isEditing ? gender : (gender || 'Not available')}
                        onChange={(e) => setGender(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Father's Name */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="fatherName">
                      Father's Name
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
                        value={isEditing ? fatherName : (fatherName || 'Not available')}
                        onChange={(e) => setFatherName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Mother's Name */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="motherName">
                      Mother's Name
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
                        value={isEditing ? motherName : (motherName || 'Not available')}
                        onChange={(e) => setMotherName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="bloodGroup">
                      Blood Group
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
                        value={isEditing ? bloodGroup : (bloodGroup || 'Not available')}
                        onChange={(e) => setBloodGroup(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2 — IDENTITY DETAILS */}
              <div className="col-span-1 md:col-span-2 pt-6 mt-4">
                <h3 className="text-on-surface font-bold text-lg mb-4 border-b border-outline-variant pb-2">Identity Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aadhaar Number */}
                  {(isEditing || aadhaarNumber) && (
                    <div className="col-span-1">
                      <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="aadhaarNumber">
                        Aadhaar Number
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 top-3 text-outline">fingerprint</span>
                        <input
                          disabled={!isEditing}
                          className={`w-full border rounded-lg pl-12 pr-12 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                            isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                          }`}
                          id="aadhaarNumber"
                          type={showAadhaar || isEditing ? 'text' : 'password'}
                          value={isEditing ? aadhaarNumber : (aadhaarNumber ? (showAadhaar ? aadhaarNumber : `XXXX XXXX ${aadhaarNumber.replace(/\D/g, '').substring(8)}`) : 'Not available')}
                          onChange={(e) => setAadhaarNumber(e.target.value)}
                        />
                        {!isEditing && aadhaarNumber && (
                          <button
                            type="button"
                            onClick={() => setShowAadhaar(!showAadhaar)}
                            className="absolute right-4 text-outline hover:text-primary transition-colors"
                            title={showAadhaar ? "Hide Aadhaar" : "Show Aadhaar"}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {showAadhaar ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PAN Number */}
                  {(isEditing || panNumber) && (
                    <div className="col-span-1">
                      <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="panNumber">
                        PAN Number
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-3 text-outline">badge</span>
                        <input
                          disabled={!isEditing}
                          className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                            isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                          }`}
                          id="panNumber"
                          type="text"
                          value={isEditing ? panNumber : (panNumber || 'Not available')}
                          onChange={(e) => setPanNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Driving Licence Number */}
                  {(isEditing || drivingLicenceNumber) && (
                    <div className="col-span-1">
                      <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="drivingLicenceNumber">
                        Driving Licence Number
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-3 text-outline">directions_car</span>
                        <input
                          disabled={!isEditing}
                          className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                            isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                          }`}
                          id="drivingLicenceNumber"
                          type="text"
                          value={isEditing ? drivingLicenceNumber : (drivingLicenceNumber || 'Not available')}
                          onChange={(e) => setDrivingLicenceNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Voter ID Number */}
                  {(isEditing || voterIdNumber) && (
                    <div className="col-span-1">
                      <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="voterIdNumber">
                        Voter ID Number
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-3 text-outline">how_to_vote</span>
                        <input
                          disabled={!isEditing}
                          className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                            isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                          }`}
                          id="voterIdNumber"
                          type="text"
                          value={isEditing ? voterIdNumber : (voterIdNumber || 'Not available')}
                          onChange={(e) => setVoterIdNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3 — ADDRESS */}
              <div className="col-span-1 md:col-span-2 pt-6 mt-4">
                <h3 className="text-on-surface font-bold text-lg mb-4 border-b border-outline-variant pb-2">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Address */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="address">
                      Full Address
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
                      State
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
                      District
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
                        value={isEditing ? district : (district || 'Not available')}
                        onChange={(e) => setDistrict(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* PIN Code */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="pinCode">
                      PIN Code
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-3 text-outline">pin_drop</span>
                      <input
                        disabled={!isEditing}
                        className={`w-full border rounded-lg pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                          isEditing ? 'bg-white border-outline' : 'input-recessed border-transparent cursor-not-allowed'
                        }`}
                        id="pinCode"
                        type="text"
                        value={isEditing ? pinCode : (pinCode || 'Not available')}
                        onChange={(e) => setPinCode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4 — ADDITIONAL INFORMATION */}
              <div className="col-span-1 md:col-span-2 pt-6 mt-4">
                <h3 className="text-on-surface font-bold text-lg mb-4 border-b border-outline-variant pb-2">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Annual Income */}
                  <div className="col-span-1">
                    <label className="block font-label-md text-label-md text-on-surface mb-unit font-semibold" htmlFor="income">
                      Annual Income
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
                      Occupation
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

              {/* Action Buttons inside Form to support Enter key submit */}
              <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 mt-10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full md:w-auto px-8 py-3 rounded-full border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-low hover:border-outline transition-all duration-200"
                >
                  Back
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
                  {isSaving ? 'Saving Profile...' : 'Confirm & Continue'}
                  {!isSaving && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                </button>
              </div>
            </form>
          </div>

          {/* Privacy Note */}
          <div className="flex justify-center items-center gap-2 mt-8 text-on-surface-variant opacity-80">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span className="font-label-sm text-label-sm">Your information is used only to personalize your experience.</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
