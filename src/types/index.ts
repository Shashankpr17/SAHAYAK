export type DocumentType = 'ID Proof' | 'Income Certificate' | 'Address Proof' | 'Other';

export interface UserProfile {
  fullName: string;
  dob: string;
  state: string;
  address: string;
  annualIncome: string; // e.g. "₹ 8,50,000" or similar
  occupation: string;
  gender?: string;
  fatherName?: string;
  motherName?: string;
  bloodGroup?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  drivingLicenceNumber?: string;
  voterIdNumber?: string;
  district?: string;
  city?: string;
  pinCode?: string;
}

export type LanguageCode = 'en' | 'hi' | 'or'; // English, Hindi, Odia

export interface SchemeTranslation {
  en: string;
  hi: string;
  or?: string;
}

export interface SchemeListTranslation {
  en: string[];
  hi: string[];
  or?: string[];
}

export interface Scheme {
  id: string;
  name: string;
  category: string;
  state: string;
  official_link?: string;
  benefitAmount?: SchemeTranslation;
  description: SchemeTranslation;
  benefits: SchemeTranslation;
  eligibilityCriteria: SchemeListTranslation;
  simpleDescription: SchemeTranslation;
  howToGet: SchemeTranslation;
  whoCanGet: SchemeListTranslation;
  requiredDocs: {
    name: string;
    desc: SchemeTranslation;
  }[];
}
