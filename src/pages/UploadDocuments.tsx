import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { DocumentType } from '../types';

interface UploadDocumentsProps {
  onDocumentUploaded: (files: File[], type: DocumentType, subtype: string | null) => void;
}

type WizardStage = 
  | 'id_select' 
  | 'id_upload' 
  | 'income_ask' 
  | 'income_upload' 
  | 'address_ask' 
  | 'address_select' 
  | 'address_upload' 
  | 'other_ask' 
  | 'other_input' 
  | 'other_upload' 
  | 'summary';

export const UploadDocuments: React.FC<UploadDocumentsProps> = ({ onDocumentUploaded }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progressive Wizard Stage
  const [stage, setStage] = useState<WizardStage>('id_select');

  // ID Proof States
  const [selectedIdSubtypes, setSelectedIdSubtypes] = useState<string[]>([]);
  const [idFiles, setIdFiles] = useState<{ [subtype: string]: File[] }>({});

  // Income Certificate States
  const [incomeFiles, setIncomeFiles] = useState<File[]>([]);

  // Address Proof States
  const [selectedAddressSubtypes, setSelectedAddressSubtypes] = useState<string[]>([]);
  const [addressFiles, setAddressFiles] = useState<{ [subtype: string]: File[] }>({});

  // Other Documents States
  const [otherDocs, setOtherDocs] = useState<{ name: string; files: File[] }[]>([]);
  const [tempOtherName, setTempOtherName] = useState('');

  // Drag and Drop active states
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeUploadSubtype, setActiveUploadSubtype] = useState<string | null>(null);

  // Global Alerts
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Calculate current total files
  const getGlobalFileCount = () => {
    let count = 0;
    Object.values(idFiles).forEach(files => count += files.length);
    count += incomeFiles.length;
    Object.values(addressFiles).forEach(files => count += files.length);
    otherDocs.forEach(doc => count += doc.files.length);
    return count;
  };

  const globalFileCount = getGlobalFileCount();
  const maxLimit = 10;

  // Add files to a target group
  const addFilesToGroup = (files: FileList, category: 'id' | 'income' | 'address' | 'other', subtypeKey?: string) => {
    setAlertMessage(null);
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validExtensions.includes(file.type)) {
        setAlertMessage('Unsupported file type. Please upload JPG, PNG, or PDF files.');
        return;
      }
      newFiles.push(file);
    }

    if (globalFileCount + newFiles.length > maxLimit) {
      setAlertMessage(`You have reached the maximum limit of ${maxLimit} files.`);
      return;
    }

    if (category === 'id' && subtypeKey) {
      setIdFiles(prev => ({
        ...prev,
        [subtypeKey]: [...(prev[subtypeKey] || []), ...newFiles]
      }));
    } else if (category === 'income') {
      setIncomeFiles(prev => [...prev, ...newFiles]);
    } else if (category === 'address' && subtypeKey) {
      setAddressFiles(prev => ({
        ...prev,
        [subtypeKey]: [...(prev[subtypeKey] || []), ...newFiles]
      }));
    } else if (category === 'other' && subtypeKey) {
      // Find or update otherDoc
      setOtherDocs(prev => {
        const idx = prev.findIndex(d => d.name === subtypeKey);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], files: [...updated[idx].files, ...newFiles] };
          return updated;
        } else {
          return [...prev, { name: subtypeKey, files: newFiles }];
        }
      });
    }
  };

  // Remove files
  const removeFileFromGroup = (idxToRemove: number, category: 'id' | 'income' | 'address' | 'other', subtypeKey?: string) => {
    setAlertMessage(null);
    if (category === 'id' && subtypeKey) {
      setIdFiles(prev => ({
        ...prev,
        [subtypeKey]: prev[subtypeKey].filter((_, idx) => idx !== idxToRemove)
      }));
    } else if (category === 'income') {
      setIncomeFiles(prev => prev.filter((_, idx) => idx !== idxToRemove));
    } else if (category === 'address' && subtypeKey) {
      setAddressFiles(prev => ({
        ...prev,
        [subtypeKey]: prev[subtypeKey].filter((_, idx) => idx !== idxToRemove)
      }));
    } else if (category === 'other' && subtypeKey) {
      setOtherDocs(prev => {
        const idx = prev.findIndex(d => d.name === subtypeKey);
        if (idx !== -1) {
          const updated = [...prev];
          const newFiles = updated[idx].files.filter((_, idx) => idx !== idxToRemove);
          if (newFiles.length === 0) {
            return updated.filter(d => d.name !== subtypeKey);
          }
          updated[idx] = { ...updated[idx], files: newFiles };
          return updated;
        }
        return prev;
      });
    }
  };

  // Handle Drag events
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragEnter = (e: React.DragEvent, subtype: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
    setActiveUploadSubtype(subtype);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setActiveUploadSubtype(null);
  };

  const onDrop = (e: React.DragEvent, category: 'id' | 'income' | 'address' | 'other', subtypeKey?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setActiveUploadSubtype(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToGroup(e.dataTransfer.files, category, subtypeKey);
    }
  };

  // Continue to Extract Flow
  const handleFinalContinue = () => {
    if (globalFileCount === 0) {
      setAlertMessage('Please upload at least one document to proceed.');
      return;
    }

    // Flat pool of all files
    const allFiles: File[] = [];
    let mainCategory: DocumentType = 'Other';
    let mainSubtype: string | null = null;

    // Gather files
    Object.entries(idFiles).forEach(([subtype, files]) => {
      if (files.length > 0) {
        allFiles.push(...files);
        if (!mainSubtype) {
          mainCategory = 'ID Proof';
          mainSubtype = subtype;
        }
      }
    });

    if (incomeFiles.length > 0) {
      allFiles.push(...incomeFiles);
      if (!mainSubtype) {
        mainCategory = 'Income Certificate';
        mainSubtype = 'Income Certificate';
      }
    }

    Object.entries(addressFiles).forEach(([subtype, files]) => {
      if (files.length > 0) {
        allFiles.push(...files);
        if (!mainSubtype) {
          mainCategory = 'Address Proof';
          mainSubtype = subtype;
        }
      }
    });

    otherDocs.forEach(doc => {
      if (doc.files.length > 0) {
        allFiles.push(...doc.files);
        if (!mainSubtype) {
          mainCategory = 'Other';
          mainSubtype = doc.name;
        }
      }
    });

    onDocumentUploaded(allFiles, mainCategory, mainSubtype);
    navigate('/processing');
  };

  // Step indicator mapping
  const getActiveStep = () => {
    if (stage === 'id_select' || stage === 'id_upload') return 1;
    if (stage === 'income_ask' || stage === 'income_upload') return 2;
    if (stage === 'address_ask' || stage === 'address_select' || stage === 'address_upload') return 3;
    if (stage === 'other_ask' || stage === 'other_input' || stage === 'other_upload') return 4;
    return 5; // summary
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Header />

      <main className="flex-grow py-10 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col items-center gap-8">
        
        {/* Wizard Steps Indicator */}
        <div className="w-full max-w-3xl mb-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 bg-surface-container-highest rounded-full z-0"></div>
            
            {[
              { num: 1, label: 'ID Proof' },
              { num: 2, label: 'Income Info' },
              { num: 3, label: 'Address Info' },
              { num: 4, label: 'Other Docs' },
              { num: 5, label: 'Summary' }
            ].map((s) => {
              const active = getActiveStep() >= s.num;
              const current = getActiveStep() === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center relative z-10 gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md ring-4 ring-background transition-all duration-300 ${
                    current 
                      ? 'bg-primary text-on-primary scale-110 shadow' 
                      : active 
                        ? 'bg-primary/70 text-on-primary' 
                        : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    {s.num}
                  </div>
                  <span className={`font-label-sm text-[10px] sm:text-xs transition-colors duration-300 ${
                    active ? 'text-primary font-bold' : 'text-on-surface-variant'
                  }`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Alert Notification */}
        {alertMessage && (
          <div className="w-full max-w-3xl bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 text-sm text-amber-900 dark:text-amber-300 animate-fade-in">
            <span className="material-symbols-outlined text-amber-700 dark:text-amber-500">warning</span>
            <span>{alertMessage}</span>
          </div>
        )}

        {/* Global Files Counter */}
        <div className="w-full max-w-3xl flex justify-between items-center bg-surface-container-low rounded-xl px-4 py-2 border border-outline-variant/30">
          <span className="text-xs font-semibold text-on-surface-variant">Global Upload Pool</span>
          <span className="text-xs font-bold text-primary">
            {globalFileCount} / {maxLimit} files uploaded
          </span>
        </div>

        {/* WIZARD CONTAINER CARDS */}
        <div className="w-full max-w-3xl bg-surface-container-lowest rounded-2xl p-6 md:p-10 border border-outline-variant/30 shadow-sm min-h-[350px] flex flex-col justify-between">
          
          {/* STAGE 1: ID Select */}
          {stage === 'id_select' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">Step 1: Select ID Proof</h2>
                <p className="text-sm text-on-surface-variant">Please choose one or more identity proofs to upload. You can select multiple cards.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {['Aadhaar Card', 'PAN Card', 'Voter ID', 'Driving Licence', 'Passport'].map((subtype) => {
                  const isSelected = selectedIdSubtypes.includes(subtype);
                  return (
                    <button
                      key={subtype}
                      onClick={() => {
                        setSelectedIdSubtypes(prev => 
                          prev.includes(subtype) ? prev.filter(s => s !== subtype) : [...prev, subtype]
                        );
                      }}
                      className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 font-bold relative focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        isSelected 
                          ? 'border-primary ring-2 ring-primary bg-surface-container-low text-primary' 
                          : 'border-outline-variant hover:border-primary hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-xs absolute right-2 top-2 bg-primary text-on-primary rounded-full p-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check
                        </span>
                      )}
                      <span className="material-symbols-outlined text-2xl">badge</span>
                      <span className="text-xs">{subtype}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => {
                    if (selectedIdSubtypes.length === 0) {
                      setStage('income_ask');
                    } else {
                      setStage('id_upload');
                    }
                  }}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover flex items-center gap-2"
                >
                  <span>{selectedIdSubtypes.length === 0 ? 'Skip ID Proof' : 'Continue to Upload'}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: ID Upload */}
          {stage === 'id_upload' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">Upload ID Proof Documents</h2>
                <p className="text-sm text-on-surface-variant">Please drop or browse files for each of your selected ID proofs.</p>
              </div>

              <div className="space-y-6 pt-2">
                {selectedIdSubtypes.map((subtype) => {
                  const filesForSubtype = idFiles[subtype] || [];
                  const isDragOverThis = isDragActive && activeUploadSubtype === subtype;
                  return (
                    <div key={subtype} className="border border-outline-variant/40 rounded-xl p-4 space-y-3 bg-surface-container-low/30">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">{subtype}</h3>
                        <span className="text-[10px] text-on-surface-variant font-bold">{filesForSubtype.length} files</span>
                      </div>

                      {/* Dropzone */}
                      <div
                        onDragEnter={(e) => onDragEnter(e, subtype)}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, 'id', subtype)}
                        onClick={() => {
                          const el = document.getElementById(`input-id-${subtype}`);
                          el?.click();
                        }}
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                          isDragOverThis 
                            ? 'border-primary bg-primary/5' 
                            : 'border-outline-variant/70 hover:border-primary hover:bg-surface-container-lowest'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl text-primary mb-1">upload_file</span>
                        <p className="text-xs text-on-surface-variant">Drag files or <span className="text-primary hover:underline font-bold">Browse</span></p>
                        <input
                          id={`input-id-${subtype}`}
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              addFilesToGroup(e.target.files, 'id', subtype);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>

                      {/* Files list */}
                      {filesForSubtype.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {filesForSubtype.map((f, idx) => (
                            <div key={idx} className="bg-surface-container-lowest border rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs">
                              <span className="truncate max-w-[150px] font-semibold text-on-surface">{f.name}</span>
                              <button
                                onClick={() => removeFileFromGroup(idx, 'id', subtype)}
                                className="text-error hover:bg-error/10 p-1 rounded-full flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setStage('id_select')}
                  className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  Back
                </button>
                <button
                  onClick={() => setStage('income_ask')}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover flex items-center gap-2"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: Income Ask */}
          {stage === 'income_ask' && (
            <div className="animate-fade-in space-y-6 my-auto text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl">payments</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">💰 Add an Income Certificate?</h2>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                  Adding it helps us identify eligibility for government schemes that are restricted based on your annual household income.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => setStage('income_upload')}
                  className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover"
                >
                  Yes, Add Income Certificate
                </button>
                <button
                  onClick={() => setStage('address_ask')}
                  className="px-6 py-3 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  No, Skip This Step
                </button>
              </div>

              <div className="pt-6 text-center">
                <button
                  onClick={() => {
                    if (selectedIdSubtypes.length === 0) {
                      setStage('id_select');
                    } else {
                      setStage('id_upload');
                    }
                  }}
                  className="text-xs text-on-surface-variant hover:underline"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: Income Upload */}
          {stage === 'income_upload' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">Upload Income Certificate</h2>
                <p className="text-sm text-on-surface-variant">Please drop or browse files representing your Income Certificate.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div
                  onDragEnter={(e) => onDragEnter(e, 'income')}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, 'income')}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                    isDragActive && activeUploadSubtype === 'income'
                      ? 'border-primary bg-primary/5' 
                      : 'border-outline-variant hover:border-primary hover:bg-surface-container-lowest'
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl text-primary mb-2">upload_file</span>
                  <p className="text-sm text-on-surface font-semibold">Drag & drop files here or click to browse</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        addFilesToGroup(e.target.files, 'income');
                        e.target.value = '';
                      }
                    }}
                  />
                </div>

                {incomeFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Uploaded Files</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {incomeFiles.map((f, idx) => (
                        <div key={idx} className="bg-surface-container-lowest border rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                          <span className="truncate font-semibold text-on-surface">{f.name}</span>
                          <button
                            onClick={() => removeFileFromGroup(idx, 'income')}
                            className="text-error hover:bg-error/10 p-1.5 rounded-full flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setStage('income_ask')}
                  className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  Back
                </button>
                <button
                  onClick={() => setStage('address_ask')}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover flex items-center gap-2"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: Address Ask */}
          {stage === 'address_ask' && (
            <div className="animate-fade-in space-y-6 my-auto text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl">home</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">🏠 Add Address Proof?</h2>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                  Adding address proof helps us verify location-based criteria for state/local scheme eligibility.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => setStage('address_select')}
                  className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover"
                >
                  Yes, Add Address Proof
                </button>
                <button
                  onClick={() => setStage('other_ask')}
                  className="px-6 py-3 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  No, Skip This Step
                </button>
              </div>

              <div className="pt-6 text-center">
                <button
                  onClick={() => {
                    if (incomeFiles.length > 0) {
                      setStage('income_upload');
                    } else {
                      setStage('income_ask');
                    }
                  }}
                  className="text-xs text-on-surface-variant hover:underline"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: Address Select */}
          {stage === 'address_select' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">Step 3: Select Address Proof</h2>
                <p className="text-sm text-on-surface-variant">Please choose one or more options to upload.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {['Aadhaar Card', 'Electricity Bill', 'Water Bill', 'Bank Statement', 'Ration Card', 'Other'].map((subtype) => {
                  const isSelected = selectedAddressSubtypes.includes(subtype);
                  return (
                    <button
                      key={subtype}
                      onClick={() => {
                        setSelectedAddressSubtypes(prev => 
                          prev.includes(subtype) ? prev.filter(s => s !== subtype) : [...prev, subtype]
                        );
                      }}
                      className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 font-bold relative focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        isSelected 
                          ? 'border-primary ring-2 ring-primary bg-surface-container-low text-primary' 
                          : 'border-outline-variant hover:border-primary hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-xs absolute right-2 top-2 bg-primary text-on-primary rounded-full p-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check
                        </span>
                      )}
                      <span className="material-symbols-outlined text-2xl">home</span>
                      <span className="text-xs">{subtype}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setStage('address_ask')}
                  className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (selectedAddressSubtypes.length === 0) {
                      setStage('other_ask');
                    } else {
                      setStage('address_upload');
                    }
                  }}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover"
                >
                  Continue to Upload
                </button>
              </div>
            </div>
          )}

          {/* STAGE 7: Address Upload */}
          {stage === 'address_upload' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">Upload Address Proof Documents</h2>
                <p className="text-sm text-on-surface-variant">Please drop or browse files for each of your selected Address proofs.</p>
              </div>

              <div className="space-y-6 pt-2">
                {selectedAddressSubtypes.map((subtype) => {
                  const filesForSubtype = addressFiles[subtype] || [];
                  const isDragOverThis = isDragActive && activeUploadSubtype === subtype;
                  return (
                    <div key={subtype} className="border border-outline-variant/40 rounded-xl p-4 space-y-3 bg-surface-container-low/30">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">{subtype}</h3>
                        <span className="text-[10px] text-on-surface-variant font-bold">{filesForSubtype.length} files</span>
                      </div>

                      {/* Dropzone */}
                      <div
                        onDragEnter={(e) => onDragEnter(e, subtype)}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, 'address', subtype)}
                        onClick={() => {
                          const el = document.getElementById(`input-addr-${subtype}`);
                          el?.click();
                        }}
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                          isDragOverThis 
                            ? 'border-primary bg-primary/5' 
                            : 'border-outline-variant/70 hover:border-primary hover:bg-surface-container-lowest'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl text-primary mb-1">upload_file</span>
                        <p className="text-xs text-on-surface-variant">Drag files or <span className="text-primary hover:underline font-bold">Browse</span></p>
                        <input
                          id={`input-addr-${subtype}`}
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) {
                              addFilesToGroup(e.target.files, 'address', subtype);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>

                      {/* Files list */}
                      {filesForSubtype.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {filesForSubtype.map((f, idx) => (
                            <div key={idx} className="bg-surface-container-lowest border rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs">
                              <span className="truncate max-w-[150px] font-semibold text-on-surface">{f.name}</span>
                              <button
                                onClick={() => removeFileFromGroup(idx, 'address', subtype)}
                                className="text-error hover:bg-error/10 p-1 rounded-full flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setStage('address_select')}
                  className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  Back
                </button>
                <button
                  onClick={() => setStage('other_ask')}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover flex items-center gap-2"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 8: Other Ask */}
          {stage === 'other_ask' && (
            <div className="animate-fade-in space-y-6 my-auto text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl">description</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">📄 Add any other supporting documents?</h2>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                  Adding Caste, Disability, Domicile, or Bank certificates helps personalized eligibility scans.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => {
                    setTempOtherName('');
                    setStage('other_input');
                  }}
                  className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover"
                >
                  Yes, Add Other Document
                </button>
                <button
                  onClick={() => setStage('summary')}
                  className="px-6 py-3 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  No, Continue to Summary
                </button>
              </div>

              <div className="pt-6 text-center">
                <button
                  onClick={() => {
                    if (selectedAddressSubtypes.length > 0) {
                      setStage('address_upload');
                    } else {
                      setStage('address_ask');
                    }
                  }}
                  className="text-xs text-on-surface-variant hover:underline"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* STAGE 9: Other Input */}
          {stage === 'other_input' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">Describe Supporting Document</h2>
                <p className="text-sm text-on-surface-variant">Please write the name of the document you want to add.</p>
              </div>

              <div className="max-w-md mx-auto space-y-4 pt-2">
                <div>
                  <label htmlFor="input-other-name" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Document Name</label>
                  <input
                    id="input-other-name"
                    type="text"
                    value={tempOtherName}
                    onChange={(e) => setTempOtherName(e.target.value)}
                    placeholder="e.g. Caste Certificate, Disability Certificate"
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setStage('other_ask')}
                  className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!tempOtherName.trim()) {
                      setAlertMessage('Please enter a valid document name.');
                      return;
                    }
                    setStage('other_upload');
                  }}
                  disabled={!tempOtherName.trim()}
                  className={`px-6 py-2.5 rounded-full font-bold flex items-center gap-2 ${
                    tempOtherName.trim()
                      ? 'bg-primary text-on-primary hover:bg-primary-hover'
                      : 'bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 10: Other Upload */}
          {stage === 'other_upload' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">Upload: {tempOtherName}</h2>
                <p className="text-sm text-on-surface-variant">Please drop or browse files for your supporting document.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div
                  onDragEnter={(e) => onDragEnter(e, 'other')}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, 'other', tempOtherName)}
                  onClick={() => {
                    const el = document.getElementById(`input-other-${tempOtherName}`);
                    el?.click();
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                    isDragActive && activeUploadSubtype === 'other'
                      ? 'border-primary bg-primary/5' 
                      : 'border-outline-variant hover:border-primary hover:bg-surface-container-lowest'
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl text-primary mb-2">upload_file</span>
                  <p className="text-sm text-on-surface font-semibold">Drag & drop files or click to browse</p>
                  <input
                    id={`input-other-${tempOtherName}`}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        addFilesToGroup(e.target.files, 'other', tempOtherName);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>

                {/* Show current uploaded file list */}
                {(() => {
                  const docObj = otherDocs.find(d => d.name === tempOtherName);
                  if (!docObj || docObj.files.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Uploaded Files</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {docObj.files.map((f, idx) => (
                          <div key={idx} className="bg-surface-container-lowest border rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                            <span className="truncate font-semibold text-on-surface">{f.name}</span>
                            <button
                              onClick={() => removeFileFromGroup(idx, 'other', tempOtherName)}
                              className="text-error hover:bg-error/10 p-1.5 rounded-full flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setStage('other_input')}
                  className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    const docObj = otherDocs.find(d => d.name === tempOtherName);
                    if (!docObj || docObj.files.length === 0) {
                      setAlertMessage('Please upload at least one file or cancel.');
                      return;
                    }
                    setStage('other_ask');
                  }}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover flex items-center gap-2"
                >
                  <span>Done</span>
                  <span className="material-symbols-outlined text-sm">check</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 11: Summary Review */}
          {stage === 'summary' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">Review Your Documents</h2>
                <p className="text-sm text-on-surface-variant">Here is a summary of all uploaded documents. Make sure you are satisfied before extracting details.</p>
              </div>

              <div className="space-y-4 pt-2 border border-outline-variant/30 rounded-xl p-4 bg-surface-container-low/20">
                
                {/* ID Proof Section */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">🪪 ID Proof Documents</p>
                  {selectedIdSubtypes.length === 0 || Object.values(idFiles).every(f => f.length === 0) ? (
                    <p className="text-xs text-on-surface-variant italic pl-2">Not added</p>
                  ) : (
                    <div className="space-y-1.5 pl-2">
                      {selectedIdSubtypes.map(subtype => {
                        const count = idFiles[subtype]?.length || 0;
                        if (count === 0) return null;
                        return (
                          <div key={subtype} className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-on-surface">{subtype}</span>
                            <span className="font-bold text-primary">{count} files</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <hr className="border-outline-variant/20" />

                {/* Income Certificate Section */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">💰 Income Certificate</p>
                  {incomeFiles.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic pl-2">Not added</p>
                  ) : (
                    <div className="flex justify-between items-center text-xs pl-2">
                      <span className="font-semibold text-on-surface">Income Certificate</span>
                      <span className="font-bold text-primary">{incomeFiles.length} files</span>
                    </div>
                  )}
                </div>

                <hr className="border-outline-variant/20" />

                {/* Address Proof Section */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">🏠 Address Proof Documents</p>
                  {selectedAddressSubtypes.length === 0 || Object.values(addressFiles).every(f => f.length === 0) ? (
                    <p className="text-xs text-on-surface-variant italic pl-2">Not added</p>
                  ) : (
                    <div className="space-y-1.5 pl-2">
                      {selectedAddressSubtypes.map(subtype => {
                        const count = addressFiles[subtype]?.length || 0;
                        if (count === 0) return null;
                        return (
                          <div key={subtype} className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-on-surface">{subtype}</span>
                            <span className="font-bold text-primary">{count} files</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <hr className="border-outline-variant/20" />

                {/* Other Documents Section */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">📄 Other Supporting Documents</p>
                  {otherDocs.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic pl-2">Not added</p>
                  ) : (
                    <div className="space-y-1.5 pl-2">
                      {otherDocs.map(doc => (
                        <div key={doc.name} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-on-surface">{doc.name}</span>
                          <span className="font-bold text-primary">{doc.files.length} files</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Total Counters */}
              <div className="text-center font-bold text-sm text-primary pt-2">
                Total Files Uploaded: {globalFileCount} / {maxLimit}
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setStage('other_ask')}
                  className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  Go Back
                </button>
                <button
                  onClick={handleFinalContinue}
                  disabled={globalFileCount === 0}
                  className={`px-8 py-3 rounded-full font-bold shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    globalFileCount > 0
                      ? 'bg-primary text-on-primary hover:bg-primary-hover hover:shadow'
                      : 'bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span>Continue to Extract Details</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
};
