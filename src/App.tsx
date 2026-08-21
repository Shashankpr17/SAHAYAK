import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { UploadDocuments } from './pages/UploadDocuments';
import { ProcessingDocuments } from './pages/ProcessingDocuments';
import { ReviewDetails } from './pages/ReviewDetails';
import { EligibleSchemes } from './pages/EligibleSchemes';
import { SchemeDetails } from './pages/SchemeDetails';
import { ProtectedRoute } from './components/ProtectedRoute';
import type { DocumentType, UserProfile, Scheme } from './types';

const App: React.FC = () => {
  // Global states
  const [uploadedFileType, setUploadedFileType] = useState<DocumentType | null>(() => {
    const saved = localStorage.getItem('sahayak_doc_type');
    return saved ? (saved as DocumentType) : null;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sahayak_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(() => {
    const saved = localStorage.getItem('sahayak_selected_scheme');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync to local storage
  useEffect(() => {
    if (uploadedFileType) {
      localStorage.setItem('sahayak_doc_type', uploadedFileType);
    } else {
      localStorage.removeItem('sahayak_doc_type');
    }
  }, [uploadedFileType]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('sahayak_user_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('sahayak_user_profile');
    }
  }, [userProfile]);

  useEffect(() => {
    if (selectedScheme) {
      localStorage.setItem('sahayak_selected_scheme', JSON.stringify(selectedScheme));
    } else {
      localStorage.removeItem('sahayak_selected_scheme');
    }
  }, [selectedScheme]);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedFileSubtype, setUploadedFileSubtype] = useState<string | null>(null);

  const handleDocumentUploaded = (files: File[], type: DocumentType, subtype: string | null) => {
    setUploadedFiles(files);
    setUploadedFileType(type);
    setUploadedFileSubtype(subtype);
    console.log(`[DATA FLOW] Documents uploaded:`, files.map(f => f.name), `type: ${type}, subtype: ${subtype}`);
  };

  const handleProcessingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleSelectScheme = (scheme: Scheme) => {
    setSelectedScheme(scheme);
  };

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Document Upload Page (Protected) */}
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute>
              <UploadDocuments onDocumentUploaded={handleDocumentUploaded} />
            </ProtectedRoute>
          } 
        />

        {/* Processing/Loading Transition Page (Protected) */}
        <Route 
          path="/processing" 
          element={
            <ProtectedRoute>
              <ProcessingDocuments 
                uploadedFiles={uploadedFiles}
                documentType={uploadedFileType} 
                documentSubtype={uploadedFileSubtype}
                onProcessingComplete={handleProcessingComplete} 
              />
            </ProtectedRoute>
          } 
        />

        {/* Details Review Form Page (Protected) */}
        <Route 
          path="/review" 
          element={
            <ProtectedRoute>
              <ReviewDetails 
                profile={userProfile} 
                onProfileUpdated={handleProfileUpdated} 
              />
            </ProtectedRoute>
          } 
        />

        {/* Eligible Schemes List Page (Protected) */}
        <Route 
          path="/schemes" 
          element={
            <ProtectedRoute>
              <EligibleSchemes 
                profile={userProfile} 
                onSelectScheme={handleSelectScheme} 
              />
            </ProtectedRoute>
          } 
        />

        {/* Scheme Info Details Page (Protected) */}
        <Route 
          path="/scheme-details" 
          element={
            <ProtectedRoute>
              <SchemeDetails selectedScheme={selectedScheme} />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
