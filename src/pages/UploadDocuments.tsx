import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { DocumentType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../data/translations';

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
  const { t, language } = useLanguage();
  
  const labels = {
    en: {
      idSelectTitle: "Step 1: Select ID Proof",
      idSelectDesc: "Please choose one or more identity proofs to upload. You can select multiple cards.",
      continueUpload: "Continue to Upload",
      skipIdProof: "Skip ID Proof",
      uploadIdProof: "Upload ID Proof",
      uploadIdDesc: "Please upload the front and back side for your selected ID proofs.",
      skipUpload: "Skip Upload",
      continue: "Continue",
      incomeAskTitle: "Do you have an Income Certificate?",
      incomeAskDesc: "Uploading your income certificate helps us match you with schemes that have specific income criteria.",
      yesHaveIt: "Yes, I have it",
      noSkipStep: "No, Skip this step",
      uploadIncomeTitle: "Upload Income Certificate",
      uploadIncomeDesc: "Please upload your Income Certificate. This will help match eligibility criteria.",
      addressAskTitle: "Do you have an Address Proof?",
      addressAskDesc: "Uploading address proof lets us check state and district eligibility.",
      selectAddressTitle: "Select Address Proof Type",
      selectAddressDesc: "Choose which address proof you want to upload.",
      uploadAddressTitle: "Upload Address Proof",
      uploadAddressDesc: "Please upload front and back side for your selected address proof.",
      otherAskTitle: "Do you want to upload other certificates?",
      otherAskDesc: "Like caste certificates, disability certificates, educational marksheets, etc.",
      yesWantUpload: "Yes, I want to upload",
      noGoSummary: "No, go to Summary",
      whatDocTitle: "What document is this?",
      whatDocDesc: "Enter a name for the document you want to upload (e.g. Caste Certificate)",
      docNamePlaceholder: "Document Name",
      reviewDocsTitle: "Review Uploaded Documents",
      reviewDocsDesc: "Verify all the documents you have added to your profile pool. You can delete or add more.",
      idProofs: "Identity Proofs",
      incomeProofs: "Income Proofs",
      addressProofs: "Address Proofs",
      otherProofs: "Other Proofs",
      front: "Front",
      back: "Back",
      globalPool: "Global Upload Pool",
      filesUploaded: "files uploaded",
      unsupportedType: "Unsupported file type. Please upload JPG, PNG, or PDF files.",
      limitReached: "You have reached the maximum limit of 10 files.",
      uploading: "Uploading...",
      successUpload: "Files uploaded successfully!",
      errorUpload: "Upload failed. Please try again."
    },
    hi: {
      idSelectTitle: "चरण 1: पहचान पत्र चुनें",
      idSelectDesc: "कृपया अपलोड करने के लिए एक या अधिक पहचान पत्र चुनें। आप कई कार्ड चुन सकते हैं।",
      continueUpload: "अपलोड करने के लिए आगे बढ़ें",
      skipIdProof: "पहचान पत्र छोड़ें",
      uploadIdProof: "पहचान पत्र अपलोड करें",
      uploadIdDesc: "कृपया अपने चुने हुए पहचान पत्रों के लिए सामने और पीछे का हिस्सा अपलोड करें।",
      skipUpload: "अपलोड छोड़ें",
      continue: "जारी रखें",
      incomeAskTitle: "क्या आपके पास आय प्रमाण पत्र है?",
      incomeAskDesc: "अपना आय प्रमाण पत्र अपलोड करने से हमें विशिष्ट आय मानदंडों वाली योजनाओं से आपको मिलाने में मदद मिलती है।",
      yesHaveIt: "हाँ, मेरे पास है",
      noSkipStep: "नहीं, यह चरण छोड़ें",
      uploadIncomeTitle: "आय प्रमाण पत्र अपलोड करें",
      uploadIncomeDesc: "कृपया अपना आय प्रमाण पत्र अपलोड करें। इससे पात्रता मानदंडों का मिलान करने में मदद मिलेगी।",
      addressAskTitle: "क्या आपके पास पते का प्रमाण है?",
      addressAskDesc: "पते का प्रमाण अपलोड करने से हमें राज्य और जिले की पात्रता की जांच करने में मदद मिलती है।",
      selectAddressTitle: "पते के प्रमाण का प्रकार चुनें",
      selectAddressDesc: "चुनें कि आप कौन सा पते का प्रमाण अपलोड करना चाहते हैं।",
      uploadAddressTitle: "पते का प्रमाण अपलोड करें",
      uploadAddressDesc: "कृपया अपने चुने हुए पते के प्रमाण के लिए सामने और पीछे का हिस्सा अपलोड करें।",
      otherAskTitle: "क्या आप अन्य प्रमाणपत्र अपलोड करना चाहते हैं?",
      otherAskDesc: "जैसे जाति प्रमाण पत्र, विकलांगता प्रमाण पत्र, शैक्षिक अंकतालिकाएं, आदि।",
      yesWantUpload: "हाँ, मैं अपलोड करना चाहता हूँ",
      noGoSummary: "नहीं, सारांश पर जाएं",
      whatDocTitle: "यह कौन सा दस्तावेज़ है?",
      whatDocDesc: "उस दस्तावेज़ के लिए एक नाम दर्ज करें जिसे आप अपलोड करना चाहते हैं (जैसे जाति प्रमाण पत्र)",
      docNamePlaceholder: "दस्तावेज़ का नाम",
      reviewDocsTitle: "अपलोड किए गए दस्तावेज़ों की समीक्षा करें",
      reviewDocsDesc: "उन सभी दस्तावेज़ों को सत्यापित करें जिन्हें आपने अपने प्रोफ़ाइल पूल में जोड़ा है। आप हटा सकते हैं या अधिक जोड़ सकते हैं।",
      idProofs: "पहचान के प्रमाण",
      incomeProofs: "आय के प्रमाण",
      addressProofs: "पते के प्रमाण",
      otherProofs: "अन्य प्रमाण",
      front: "सामने",
      back: "पीछे",
      globalPool: "वैश्विक अपलोड पूल",
      filesUploaded: "फ़ाइलें अपलोड की गईं",
      unsupportedType: "असमर्थित फ़ाइल प्रकार। कृपया JPG, PNG या PDF फ़ाइलें अपलोड करें।",
      limitReached: "आप 10 फ़ाइलों की अधिकतम सीमा तक पहुँच चुके हैं।",
      uploading: "अपलोड हो रहा है...",
      successUpload: "फ़ाइलें सफलतापूर्वक अपलोड हो गईं!",
      errorUpload: "अपलोड विफल रहा। कृपया पुनः प्रयास करें।"
    },
    or: {
      idSelectTitle: "ପଦକ୍ଷେପ 1: ପରିଚୟ ପତ୍ର ଚୟନ କରନ୍ତୁ",
      idSelectDesc: "ଦୟାକରି ଅପଲୋଡ୍ କରିବା ପାଇଁ ଏକ କିମ୍ବା ଏକାଧିକ ପରିଚୟ ପତ୍ର ଚୟନ କରନ୍ତୁ |",
      continueUpload: "ଅପଲୋଡ୍ କରିବା ପାଇଁ ଆଗକୁ ଯାଆନ୍ତୁ",
      skipIdProof: "ପରିଚୟ ପତ୍ର ବାଦ୍ ଦିଅନ୍ତୁ",
      uploadIdProof: "ପରିଚୟ ପତ୍ର ଅପଲୋଡ୍ କରନ୍ତୁ",
      uploadIdDesc: "ଦୟାକରି ଚୟନ କରିଥିବା ପରିଚୟ ପତ୍ରର ସମ୍ମୁଖ ଏବଂ ପଛ ପାର୍ଶ୍ୱ ଅପଲୋଡ୍ କରନ୍ତୁ |",
      skipUpload: "ଅପଲୋଡ୍ ବାଦ୍ ଦିଅନ୍ତୁ",
      continue: "ଜାରି ରଖନ୍ତୁ",
      incomeAskTitle: "ଆପଣଙ୍କ ପାଖରେ ଆୟ ପ୍ରମାଣପତ୍ର ଅଛି କି?",
      incomeAskDesc: "ଆୟ ପ୍ରମାଣପତ୍ର ଅପଲୋଡ୍ କରିବା ଦ୍ୱାରା ନିର୍ଦ୍ଦିଷ୍ଟ ଆୟ ସୀମା ଥିବା ଯୋଜନାଗୁଡ଼ିକ ସହ ମେଳ କରିବାରେ ସହଜ ହୁଏ |",
      yesHaveIt: "ହଁ, ମୋ ପାଖରେ ଅଛି",
      noSkipStep: "ନାହିଁ, ଏହି ପଦକ୍ଷେପ ବାଦ୍ ଦିଅନ୍ତୁ",
      uploadIncomeTitle: "ଆୟ ପ୍ରମାଣପତ୍ର ଅପଲୋଡ୍ କରନ୍ତୁ",
      uploadIncomeDesc: "ଦୟାକରି ଆପଣଙ୍କର ଆୟ ପ୍ରମାଣପତ୍ର ଅପଲୋଡ୍ କରନ୍ତୁ | ଏହା ଯୋଗ୍ୟତା ମାପଦଣ୍ଡ ମିଳାଇବାରେ ସାହାଯ୍ୟ କରିବ |",
      addressAskTitle: "ଆପଣଙ୍କ ପାଖରେ ଠିକଣା ପ୍ରମାଣପତ୍ର ଅଛି କି?",
      addressAskDesc: "ଠିକଣା ପ୍ରମାଣପତ୍ର ଅପଲୋଡ୍ କରିବା ଦ୍ୱାରา ରାଜ୍ୟ ଏବଂ ଜିଲ୍ଲା ଯୋଗ୍ୟତା ଯାଞ୍ଚ କରିବାରେ ସୁବିଧା ହୁଏ |",
      selectAddressTitle: "ଠିକଣା ପ୍ରମାଣ ପ୍ରକାର ଚୟନ କରନ୍ତୁ",
      selectAddressDesc: "ଆପଣ କେଉଁ ଠିକଣା ପ୍ରମାଣପତ୍ର ଅପଲୋଡ୍ କରିବାକୁ ଚାହୁଁଛନ୍ତି ବାଛନ୍ତୁ |",
      uploadAddressTitle: "ଠିକଣା ପ୍ରମାଣ ଅପଲୋଡ୍ କରନ୍ତୁ",
      uploadAddressDesc: "ଦୟାକରି ଆପଣଙ୍କର ଚୟନିତ ଠିକଣା ପ୍ରମାଣପତ୍ରର ସମ୍ମୁଖ ଏବଂ ପଛ ପାର୍ଶ୍ୱ ଅପଲୋଡ୍ କରନ୍ତୁ |",
      otherAskTitle: "ଆପଣ ଅନ୍ୟ ପ୍ରମାଣପତ୍ର ଅପଲୋଡ୍ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି?",
      otherAskDesc: "ଯେପରିକି ଜାତି ପ୍ରମାଣପତ୍ର, ଭିନ୍ନକ୍ଷମ ପ୍ରମାଣପତ୍ର, ଶିକ୍ଷାଗତ ମାର୍କସିଟ୍ ଇତ୍ୟାଦି |",
      yesWantUpload: "ହଁ, ମୁଁ ଅପଲୋଡ୍ କରିବାକୁ ଚାହେଁ",
      noGoSummary: "ନାହିଁ, ସଂକ୍ଷିପ୍ତ ସୂଚୀକୁ ଯାଆନ୍ତୁ",
      whatDocTitle: "ଏହା କେଉଁ ଦସ୍ତାବିଜ୍ ଅଟେ?",
      whatDocDesc: "ଆପଣ ଅପଲୋଡ୍ କରିବାକୁ ଚାହୁଁଥିବା ଦସ୍ତାବିଜ୍ ର ନାମ ଲେଖନ୍ତୁ (ଯେପରିକି ଜାତି ପ୍ରମାଣପତ୍ର)",
      docNamePlaceholder: "ଦସ୍ତାବିଜ୍ ନାମ",
      reviewDocsTitle: "ଅପଲୋଡ୍ ହୋଇଥିବା ଦସ୍ତାବିଜ୍ ସମୀକ୍ଷା",
      reviewDocsDesc: "ଆପଣ ପ୍ରୋଫାଇଲରେ ଯୋଡିଥିବା ସମସ୍ତ ଦସ୍ତାବିଜ୍ ଯାଞ୍ଚ କରନ୍ତୁ | ଆପଣ ଚାହିଁଲେ ଡିଲିଟ୍ କରିପାରିବେ |",
      idProofs: "ପରିଚୟ ପ୍ରମାଣପତ୍ର",
      incomeProofs: "ଆୟ ପ୍ରମାଣପତ୍ର",
      addressProofs: "ଠିକଣା ପ୍ରମାଣପତ୍ର",
      otherProofs: "ଅନ୍ୟାନ୍ୟ ଦସ୍ତାବିଜ୍",
      front: "ସମ୍ମୁଖ",
      back: "ପଛ",
      globalPool: "ସାମଗ୍ରିକ ଅପଲୋଡ୍ ସୀମା",
      filesUploaded: "ଫାଇଲ୍ ଅପଲୋଡ୍ ହୋଇଛି",
      unsupportedType: "ଅସମର୍ଥିତ ଫାଇଲ୍ | ଦୟାକରି JPG, PNG କିମ୍ବା PDF ଫାଇଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ |",
      limitReached: "ଆପଣ ସର୍ବାଧିକ 10 ଟି ଫାଇଲ୍ ର ସୀମାରେ ପହଞ୍ଚିଛନ୍ତି |",
      uploading: "ଅପଲୋଡ୍ ହେଉଛି...",
      successUpload: "ଫାଇଲ୍ ଗୁଡିକ ସଫଳତାର ସହ ଅପଲୋଡ୍ ହୋଇଛି!",
      errorUpload: "ଅପଲୋଡ୍ ବିଫଳ ହେଲା | ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତु।"
    }
  }[language as Language] || {
    idSelectTitle: "Step 1: Select ID Proof",
    idSelectDesc: "Please choose one or more identity proofs to upload. You can select multiple cards.",
    continueUpload: "Continue to Upload",
    skipIdProof: "Skip ID Proof",
    uploadIdProof: "Upload ID Proof",
    uploadIdDesc: "Please upload the front and back side for your selected ID proofs.",
    skipUpload: "Skip Upload",
    continue: "Continue",
    incomeAskTitle: "Do you have an Income Certificate?",
    incomeAskDesc: "Uploading your income certificate helps us match you with schemes that have specific income criteria.",
    yesHaveIt: "Yes, I have it",
    noSkipStep: "No, Skip this step",
    uploadIncomeTitle: "Upload Income Certificate",
    uploadIncomeDesc: "Please upload your Income Certificate. This will help match eligibility criteria.",
    addressAskTitle: "Do you have an Address Proof?",
    addressAskDesc: "Uploading address proof lets us check state and district eligibility.",
    selectAddressTitle: "Select Address Proof Type",
    selectAddressDesc: "Choose which address proof you want to upload.",
    uploadAddressTitle: "Upload Address Proof",
    uploadAddressDesc: "Please upload front and back side for your selected address proof.",
    otherAskTitle: "Do you want to upload other certificates?",
    otherAskDesc: "Like caste certificates, disability certificates, educational marksheets, etc.",
    yesWantUpload: "Yes, I want to upload",
    noGoSummary: "No, go to Summary",
    whatDocTitle: "What document is this?",
    whatDocDesc: "Enter a name for the document you want to upload (e.g. Caste Certificate)",
    docNamePlaceholder: "Document Name",
    reviewDocsTitle: "Review Uploaded Documents",
    reviewDocsDesc: "Verify all the documents you have added to your profile pool. You can delete or add more.",
    idProofs: "Identity Proofs",
    incomeProofs: "Income Proofs",
    addressProofs: "Address Proofs",
    otherProofs: "Other Proofs",
    front: "Front",
    back: "Back",
    globalPool: "Global Upload Pool",
    filesUploaded: "files uploaded",
    unsupportedType: "Unsupported file type. Please upload JPG, PNG, or PDF files.",
    limitReached: "You have reached the maximum limit of 10 files.",
    uploading: "Uploading...",
    successUpload: "Files uploaded successfully!",
    errorUpload: "Upload failed. Please try again."
  };

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
        setAlertMessage(labels.unsupportedType);
        return;
      }
      newFiles.push(file);
    }

    if (globalFileCount + newFiles.length > maxLimit) {
      setAlertMessage(labels.limitReached);
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
              { num: 1, label: t('sec_identity') },
              { num: 2, label: t('annual_income') },
              { num: 3, label: t('sec_address') },
              { num: 4, label: labels.otherProofs },
              { num: 5, label: t('tab_summary') }
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
          <span className="text-xs font-semibold text-on-surface-variant">{labels.globalPool}</span>
          <span className="text-xs font-bold text-primary">
            {globalFileCount} / {maxLimit} {labels.filesUploaded}
          </span>
        </div>

        {/* WIZARD CONTAINER CARDS */}
        <div className="w-full max-w-3xl bg-surface-container-lowest rounded-2xl p-6 md:p-10 border border-outline-variant/30 shadow-sm min-h-[350px] flex flex-col justify-between">
          
          {/* STAGE 1: ID Select */}
          {stage === 'id_select' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">{labels.idSelectTitle}</h2>
                <p className="text-sm text-on-surface-variant">{labels.idSelectDesc}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {['Aadhaar Card', 'PAN Card', 'Voter ID', 'Driving Licence', 'Passport'].map((subtype) => {
                  const isSelected = selectedIdSubtypes.includes(subtype);
                  
                  // Local display translation helper
                  const getDocSubtypeLabel = (sub: string) => {
                    if (sub === 'Aadhaar Card') return t('aadhaar_card');
                    if (sub === 'PAN Card') return t('pan_card');
                    if (sub === 'Driving Licence') return t('driving_licence');
                    if (sub === 'Voter ID') return t('voter_id');
                    if (sub === 'Passport') return language === 'hi' ? 'पासपोर्ट' : language === 'or' ? 'ପାସପୋର୍ଟ' : 'Passport';
                    return sub;
                  };
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
                      <span className="text-xs">{getDocSubtypeLabel(subtype)}</span>
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
                  <span>{selectedIdSubtypes.length === 0 ? labels.skipIdProof : labels.continueUpload}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: ID Upload */}
          {stage === 'id_upload' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">{labels.uploadIdProof}</h2>
                <p className="text-sm text-on-surface-variant">{labels.uploadIdDesc}</p>
              </div>

              <div className="space-y-6 pt-2">
                {selectedIdSubtypes.map((subtype) => {
                  const filesForSubtype = idFiles[subtype] || [];
                  const isDragOverThis = isDragActive && activeUploadSubtype === subtype;
                  
                  // Local display helper
                  const getDocSubtypeLabel = (sub: string) => {
                    if (sub === 'Aadhaar Card') return t('aadhaar_card');
                    if (sub === 'PAN Card') return t('pan_card');
                    if (sub === 'Driving Licence') return t('driving_licence');
                    if (sub === 'Voter ID') return t('voter_id');
                    if (sub === 'Passport') return language === 'hi' ? 'पासपोर्ट' : language === 'or' ? 'ପାସପୋର୍ଟ' : 'Passport';
                    return sub;
                  };

                  return (
                    <div key={subtype} className="border border-outline-variant/40 rounded-xl p-4 space-y-3 bg-surface-container-low/30">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">{getDocSubtypeLabel(subtype)}</h3>
                        <span className="text-[10px] text-on-surface-variant font-bold">{filesForSubtype.length} {language === 'en' ? 'files' : language === 'hi' ? 'फ़ाइलें' : 'ଫାଇଲ୍'}</span>
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
                        <p className="text-xs text-on-surface-variant">{language === 'en' ? 'Drag files or ' : language === 'hi' ? 'फ़ाइलें यहाँ खींचें या ' : 'ଫାଇଲ୍ ଏଠାକୁ ଟାଣନ୍ତୁ କିମ୍ବା '}<span className="text-primary hover:underline font-bold">{language === 'en' ? 'Browse' : language === 'hi' ? 'फाइलें चुनें' : 'ଫାଇଲ୍ ବାଛନ୍ତୁ'}</span></p>
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
                  {t("back_btn")}
                </button>
                <button
                  onClick={() => setStage('income_ask')}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover flex items-center gap-2"
                >
                  <span>{language === 'en' ? 'Continue' : language === 'hi' ? 'जारी रखें' : 'ଜାରି ରଖନ୍ତୁ'}</span>
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
                <h2 className="text-2xl font-extrabold text-primary">💰 {labels.incomeAskTitle}</h2>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                  {labels.incomeAskDesc}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => setStage('income_upload')}
                  className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover"
                >
                  {labels.yesHaveIt}
                </button>
                <button
                  onClick={() => setStage('address_ask')}
                  className="px-6 py-3 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  {labels.noSkipStep}
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
                  {language === 'en' ? 'Go Back' : language === 'hi' ? 'पीछे जाएं' : 'ପଛକୁ ଫେରିଯାଆନ୍ତୁ'}
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: Income Upload */}
          {stage === 'income_upload' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">{labels.uploadIncomeTitle}</h2>
                <p className="text-sm text-on-surface-variant">{labels.uploadIncomeDesc}</p>
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
                  <p className="text-sm text-on-surface font-semibold">{language === 'en' ? 'Drag & drop files here or click to browse' : language === 'hi' ? 'फ़ाइलें यहाँ खींचें या फ़ाइलें चुनने के लिए क्लिक करें' : 'ଫାଇଲ୍ ଏଠାକୁ ଟାଣନ୍ତୁ କିମ୍ବା ବ୍ରାଉଜ୍ କରିବାକୁ କ୍ଲିକ୍ କରନ୍ତୁ'}</p>
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
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{language === 'en' ? 'Uploaded Files' : language === 'hi' ? 'अपलोड की गई फ़ाइलें' : 'ଅପଲୋଡ୍ ହୋଇଥିବା ଫାଇଲ୍ ଗୁଡିକ'}</p>
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
                  {t("back_btn")}
                </button>
                <button
                  onClick={() => setStage('address_ask')}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover flex items-center gap-2"
                >
                  <span>{language === 'en' ? 'Continue' : language === 'hi' ? 'जारी रखें' : 'ଜାରି ରଖନ୍ତୁ'}</span>
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
                <h2 className="text-2xl font-extrabold text-primary">🏠 {labels.addressAskTitle}</h2>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                  {labels.addressAskDesc}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => setStage('address_select')}
                  className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover"
                >
                  {labels.yesHaveIt}
                </button>
                <button
                  onClick={() => setStage('other_ask')}
                  className="px-6 py-3 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  {labels.noSkipStep}
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
                  {language === 'en' ? 'Go Back' : language === 'hi' ? 'पीछे जाएं' : 'ପଛକୁ ଫେରିଯାଆନ୍ତୁ'}
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: Address Select */}
          {stage === 'address_select' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">{labels.selectAddressTitle}</h2>
                <p className="text-sm text-on-surface-variant">{labels.selectAddressDesc}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {['Aadhaar Card', 'Electricity Bill', 'Water Bill', 'Bank Statement', 'Ration Card', 'Other'].map((subtype) => {
                  const isSelected = selectedAddressSubtypes.includes(subtype);
                  
                  // Local display helper
                  const getAddrSubtypeLabel = (sub: string) => {
                    if (sub === 'Aadhaar Card') return t('aadhaar_card');
                    if (sub === 'Electricity Bill') return language === 'hi' ? 'बिजली का बिल' : language === 'or' ? 'ବିଦ୍ୟୁତ ବିଲ୍' : 'Electricity Bill';
                    if (sub === 'Water Bill') return language === 'hi' ? 'पानी का बिल' : language === 'or' ? 'ପାଣି ବିଲ୍' : 'Water Bill';
                    if (sub === 'Bank Statement') return language === 'hi' ? 'बैंक विवरण' : language === 'or' ? 'ବ୍ୟାଙ୍କ ବିବରଣୀ' : 'Bank Statement';
                    if (sub === 'Ration Card') return language === 'hi' ? 'राशन कार्ड' : language === 'or' ? 'ରାସନ କାର୍ଡ' : 'Ration Card';
                    if (sub === 'Other') return language === 'hi' ? 'अन्य' : language === 'or' ? 'ଅନ୍ୟାନ୍ୟ' : 'Other';
                    return sub;
                  };

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
                      <span className="text-xs">{getAddrSubtypeLabel(subtype)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setStage('address_ask')}
                  className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  {t("back_btn")}
                </button>
                <button
                  onClick={() => {
                    if (selectedAddressSubtypes.length === 0) {
                      setStage('other_ask');
                    } else {
                      setStage('address_upload');
                    }
                  }}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover flex items-center gap-2"
                >
                  <span>{language === 'en' ? 'Continue to Upload' : language === 'hi' ? 'अपलोड करने के लिए जारी रखें' : 'ଅପଲୋଡ୍ କରିବାକୁ ଜାରି ରଖନ୍ତୁ'}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 7: Address Upload */}
          {stage === 'address_upload' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">{labels.uploadAddressTitle}</h2>
                <p className="text-sm text-on-surface-variant">{labels.uploadAddressDesc}</p>
              </div>

              <div className="space-y-6 pt-2">
                {selectedAddressSubtypes.map((subtype) => {
                  const filesForSubtype = addressFiles[subtype] || [];
                  const isDragOverThis = isDragActive && activeUploadSubtype === subtype;
                  
                  // Local display helper
                  const getAddrSubtypeLabel = (sub: string) => {
                    if (sub === 'Aadhaar Card') return t('aadhaar_card');
                    if (sub === 'Electricity Bill') return language === 'hi' ? 'बिजली का बिल' : language === 'or' ? 'ବିଦ୍ୟୁତ ବିଲ୍' : 'Electricity Bill';
                    if (sub === 'Water Bill') return language === 'hi' ? 'पानी का बिल' : language === 'or' ? 'ପାଣି ବିଲ୍' : 'Water Bill';
                    if (sub === 'Bank Statement') return language === 'hi' ? 'बैंक विवरण' : language === 'or' ? 'ବ୍ୟାଙ୍କ ବିବରଣୀ' : 'Bank Statement';
                    if (sub === 'Ration Card') return language === 'hi' ? 'राशन कार्ड' : language === 'or' ? 'ରାସନ କାର୍ଡ' : 'Ration Card';
                    if (sub === 'Other') return language === 'hi' ? 'अन्य' : language === 'or' ? 'ଅନ୍ୟାନ୍ୟ' : 'Other';
                    return sub;
                  };

                  return (
                    <div key={subtype} className="border border-outline-variant/40 rounded-xl p-4 space-y-3 bg-surface-container-low/30">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">{getAddrSubtypeLabel(subtype)}</h3>
                        <span className="text-[10px] text-on-surface-variant font-bold">{filesForSubtype.length} {language === 'en' ? 'files' : language === 'hi' ? 'फ़ाइलें' : 'ଫାଇଲ୍'}</span>
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
                        <p className="text-xs text-on-surface-variant">{language === 'en' ? 'Drag files or ' : language === 'hi' ? 'फ़ाइलें यहाँ खींचें या ' : 'ଫାଇଲ୍ ଏଠାକୁ ଟାଣନ୍ତୁ କିମ୍ବା '}<span className="text-primary hover:underline font-bold">{language === 'en' ? 'Browse' : language === 'hi' ? 'फाइलें चुनें' : 'ଫାଇଲ୍ ବାଛନ୍ତୁ'}</span></p>
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
                  <span>{language === 'en' ? 'Continue' : language === 'hi' ? 'जारी रखें' : 'ଜାରି ରଖନ୍ତୁ'}</span>
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
                <h2 className="text-2xl font-extrabold text-primary">📄 {labels.otherAskTitle}</h2>
                <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                  {labels.otherAskDesc}
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
                  {labels.yesWantUpload}
                </button>
                <button
                  onClick={() => setStage('summary')}
                  className="px-6 py-3 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  {labels.noGoSummary}
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
                  {language === 'en' ? 'Go Back' : language === 'hi' ? 'पीछे जाएं' : 'ପଛକୁ ଫେରିଯାଆନ୍ତୁ'}
                </button>
              </div>
            </div>
          )}

          {/* STAGE 9: Other Input */}
          {stage === 'other_input' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">{labels.whatDocTitle}</h2>
                <p className="text-sm text-on-surface-variant">{labels.whatDocDesc}</p>
              </div>

              <div className="max-w-md mx-auto space-y-4 pt-2">
                <div>
                  <label htmlFor="input-other-name" className="block text-xs font-bold text-on-surface-variant uppercase mb-2">{labels.docNamePlaceholder}</label>
                  <input
                    id="input-other-name"
                    type="text"
                    value={tempOtherName}
                    onChange={(e) => setTempOtherName(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Caste Certificate, Disability Certificate' : language === 'hi' ? 'जैसे जाति प्रमाण पत्र, विकलांगता प्रमाण पत्र' : 'ଯେପରିକି ଜାତି ପ୍ରମାଣପତ୍ର, ଭିନ୍ନକ୍ଷମ ପ୍ରମାଣପତ୍ର'}
                    className="w-full bg-surface-container-low border border-outline rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setStage('other_ask')}
                  className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  {language === 'en' ? 'Cancel' : language === 'hi' ? 'रद्द करें' : 'ବାତିଲ୍ କରନ୍ତୁ'}
                </button>
                <button
                  onClick={() => {
                    if (!tempOtherName.trim()) {
                      setAlertMessage(language === 'en' ? 'Please enter a valid document name.' : language === 'hi' ? 'कृपया एक वैध दस्तावेज़ नाम दर्ज करें।' : 'ଦୟାକରି ଏକ ସଠିକ୍ ଦସ୍ତାବିଜ୍ ନାମ ଲେଖନ୍ତୁ |');
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
                  <span>{language === 'en' ? 'Continue' : language === 'hi' ? 'जारी रखें' : 'ଜାରି ରଖନ୍ତୁ'}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 10: Other Upload */}
          {stage === 'other_upload' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">{language === 'en' ? 'Upload' : language === 'hi' ? 'अपलोड करें' : 'ଅପଲୋଡ୍ କରନ୍ତୁ'}: {tempOtherName}</h2>
                <p className="text-sm text-on-surface-variant">{language === 'en' ? 'Please drop or browse files for your supporting document.' : language === 'hi' ? 'कृपया अपने सहायक दस्तावेज़ के लिए फ़ाइलें यहाँ खींचें या चुनें।' : 'ଦୟାକରି ଆପଣଙ୍କର ସହାୟକ ଦସ୍ତାବିଜ୍ ଅପଲୋଡ୍ କରନ୍ତୁ |'}</p>
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
                  <p className="text-sm text-on-surface font-semibold">{language === 'en' ? 'Drag & drop files or click to browse' : language === 'hi' ? 'फ़ाइलें यहाँ खींचें या फ़ाइलें चुनने के लिए क्लिक करें' : 'ଫାଇଲ୍ ଏଠାକୁ ଟାଣନ୍ତୁ କିମ୍ବା ବ୍ରାଉଜ୍ କରିବାକୁ କ୍ଲିକ୍ କରନ୍ତୁ'}</p>
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
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{language === 'en' ? 'Uploaded Files' : language === 'hi' ? 'अपलोड की गई फ़ाइलें' : 'ଅପଲୋଡ୍ ହୋଇଥିବା ଫାଇଲ୍ ଗୁଡିକ'}</p>
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
                  {t("back_btn")}
                </button>
                <button
                  onClick={() => {
                    const docObj = otherDocs.find(d => d.name === tempOtherName);
                    if (!docObj || docObj.files.length === 0) {
                      setAlertMessage(language === 'en' ? 'Please upload at least one file or cancel.' : language === 'hi' ? 'कृपया कम से कम एक फ़ाइल अपलोड करें या रद्द करें।' : 'ଦୟାକରି କମ ସେ କମ ଗୋଟିଏ ଫାଇଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ |');
                      return;
                    }
                    setStage('other_ask');
                  }}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:bg-primary-hover flex items-center gap-2"
                >
                  <span>{language === 'en' ? 'Done' : language === 'hi' ? 'पूर्ण' : 'ସମାପ୍ତ'}</span>
                  <span className="material-symbols-outlined text-sm">check</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 11: Summary Review */}
          {stage === 'summary' && (
            <div className="animate-fade-in space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold text-primary">{labels.reviewDocsTitle}</h2>
                <p className="text-sm text-on-surface-variant">{labels.reviewDocsDesc}</p>
              </div>

              <div className="space-y-4 pt-2 border border-outline-variant/30 rounded-xl p-4 bg-surface-container-low/20">
                
                {/* ID Proof Section */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">🪪 {labels.idProofs}</p>
                  {selectedIdSubtypes.length === 0 || Object.values(idFiles).every(f => f.length === 0) ? (
                    <p className="text-xs text-on-surface-variant italic pl-2">{language === 'en' ? 'Not added' : language === 'hi' ? 'नहीं जोड़ा गया' : 'ଯୋଡା ହୋଇନାହିଁ'}</p>
                  ) : (
                    <div className="space-y-1.5 pl-2">
                      {selectedIdSubtypes.map(subtype => {
                        const count = idFiles[subtype]?.length || 0;
                        if (count === 0) return null;
                        
                        // Local display translator helper
                        const getDocSubtypeLabel = (sub: string) => {
                          if (sub === 'Aadhaar Card') return t('aadhaar_card');
                          if (sub === 'PAN Card') return t('pan_card');
                          if (sub === 'Driving Licence') return t('driving_licence');
                          if (sub === 'Voter ID') return t('voter_id');
                          if (sub === 'Passport') return language === 'hi' ? 'पासपोर्ट' : language === 'or' ? 'ପାସପୋର୍ଟ' : 'Passport';
                          return sub;
                        };

                        return (
                          <div key={subtype} className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-on-surface">{getDocSubtypeLabel(subtype)}</span>
                            <span className="font-bold text-primary">{count} {language === 'en' ? 'files' : language === 'hi' ? 'फ़ाइलें' : 'ଫାଇଲ୍'}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <hr className="border-outline-variant/20" />

                {/* Income Certificate Section */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">💰 {labels.incomeProofs}</p>
                  {incomeFiles.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic pl-2">{language === 'en' ? 'Not added' : language === 'hi' ? 'नहीं जोड़ा गया' : 'ଯୋଡା ହୋଇନାହିଁ'}</p>
                  ) : (
                    <div className="flex justify-between items-center text-xs pl-2">
                      <span className="font-semibold text-on-surface">{t("annual_income")}</span>
                      <span className="font-bold text-primary">{incomeFiles.length} {language === 'en' ? 'files' : language === 'hi' ? 'फ़ाइलें' : 'ଫାଇଲ୍'}</span>
                    </div>
                  )}
                </div>

                <hr className="border-outline-variant/20" />

                {/* Address Proof Section */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">🏠 {labels.addressProofs}</p>
                  {selectedAddressSubtypes.length === 0 || Object.values(addressFiles).every(f => f.length === 0) ? (
                    <p className="text-xs text-on-surface-variant italic pl-2">{language === 'en' ? 'Not added' : language === 'hi' ? 'नहीं जोड़ा गया' : 'ଯୋଡା ହୋଇନାହିଁ'}</p>
                  ) : (
                    <div className="space-y-1.5 pl-2">
                      {selectedAddressSubtypes.map(subtype => {
                        const count = addressFiles[subtype]?.length || 0;
                        if (count === 0) return null;
                        
                        // Local display helper
                        const getAddrSubtypeLabel = (sub: string) => {
                          if (sub === 'Aadhaar Card') return t('aadhaar_card');
                          if (sub === 'Electricity Bill') return language === 'hi' ? 'बिजली का बिल' : language === 'or' ? 'ବିଦ୍ୟୁତ ବିଲ୍' : 'Electricity Bill';
                          if (sub === 'Water Bill') return language === 'hi' ? 'पानी का बिल' : language === 'or' ? 'ପାଣି ବିଲ୍' : 'Water Bill';
                          if (sub === 'Bank Statement') return language === 'hi' ? 'बैंक विवरण' : language === 'or' ? 'ବ୍ୟାଙ୍କ ବିବରଣୀ' : 'Bank Statement';
                          if (sub === 'Ration Card') return language === 'hi' ? 'राशन कार्ड' : language === 'or' ? 'ରାସନ କାର୍ଡ' : 'Ration Card';
                          if (sub === 'Other') return language === 'hi' ? 'अन्य' : language === 'or' ? 'ଅନ୍ୟାନ୍ୟ' : 'Other';
                          return sub;
                        };

                        return (
                          <div key={subtype} className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-on-surface">{getAddrSubtypeLabel(subtype)}</span>
                            <span className="font-bold text-primary">{count} {language === 'en' ? 'files' : language === 'hi' ? 'फ़ाइलें' : 'ଫାଇଲ୍'}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <hr className="border-outline-variant/20" />

                {/* Other Documents Section */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">📄 {labels.otherProofs}</p>
                  {otherDocs.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic pl-2">{language === 'en' ? 'Not added' : language === 'hi' ? 'नहीं जोड़ा गया' : 'ଯୋଡା ହୋଇନାହିଁ'}</p>
                  ) : (
                    <div className="space-y-1.5 pl-2">
                      {otherDocs.map(doc => (
                        <div key={doc.name} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-on-surface">{doc.name}</span>
                          <span className="font-bold text-primary">{doc.files.length} {language === 'en' ? 'files' : language === 'hi' ? 'फ़ाइलें' : 'ଫାଇଲ୍'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Total Counters */}
              <div className="text-center font-bold text-sm text-primary pt-2">
                {language === 'en' ? 'Total Files Uploaded' : language === 'hi' ? 'कुल अपलोड की गई फ़ाइलें' : 'ମୋଟ ଅପଲୋଡ୍ ହୋଇଥିବା ଫାଇଲ୍'}: {globalFileCount} / {maxLimit}
              </div>

              <div className="flex justify-between pt-6 border-t border-outline-variant/30">
                <button
                  onClick={() => setStage('other_ask')}
                  className="px-6 py-2.5 border border-outline text-on-surface rounded-full font-bold hover:bg-surface-container-low"
                >
                  {language === 'en' ? 'Go Back' : language === 'hi' ? 'पीछे जाएं' : 'ପଛକୁ ଫେରିଯାଆନ୍ତୁ'}
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
                  <span>{language === 'en' ? 'Analyze Documents & Extract Profile' : language === 'hi' ? 'दस्तावेज़ों का विश्लेषण करें और प्रोफ़ाइल बनाएं' : 'ଦସ୍ତାବିଜ୍ ଯାଞ୍ଚ କରି ପ୍ରୋଫାଇଲ୍ ବାହାର କରନ୍ତୁ'}</span>
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
