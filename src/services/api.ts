// Centralized API configuration for SAHAYAK Backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sahayak-seven-rho.vercel.app';

/**
 * Check if the token is expired client-side
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  // Guest tokens format: guest_<random>_<timestamp>
  if (token.startsWith('guest_')) {
    const parts = token.split('_');
    const timestamp = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(timestamp)) {
      // Expire guest session after 7 days
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > sevenDaysMs) return true;
    }
    return false;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const payloadB64 = parts[0];
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (parsed.exp && typeof parsed.exp === 'number') {
      return Date.now() / 1000 > parsed.exp;
    }
  } catch (e) {
    console.warn('[AUTH] Error parsing token expiry:', e);
  }
  return false;
}

/**
 * Clear user auth tokens and session data from localStorage
 */
export function clearAuthSession() {
  localStorage.removeItem('sahayak_token');
  localStorage.removeItem('sahayak_user');
  localStorage.removeItem('sahayak_guest_id');
}

/**
 * Custom fetch wrapper that handles token verification and 401 unauthorized responses
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('sahayak_token');
  if (token && isTokenExpired(token)) {
    console.warn('[AUTH] Session token expired. Clearing credentials.');
    clearAuthSession();
    window.dispatchEvent(new CustomEvent('sahayak:session_expired'));
    throw new Error('Your session has expired. Please sign in again.');
  }

  const res = await fetch(url, options);

  if (res.status === 401) {
    console.warn('[AUTH] 401 Unauthorized received. Clearing credentials.');
    clearAuthSession();
    window.dispatchEvent(new CustomEvent('sahayak:session_expired'));
    const errorData = await res.clone().json().catch(() => ({}));
    const detail = errorData.detail || 'Session expired or invalid authentication token. Please sign in again.';
    throw new Error(detail);
  }

  return res;
}

/**
 * Construct authorization and extra headers dynamically from localStorage session tokens
 */
export function getHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('sahayak_token');
  const headers: Record<string, string> = { ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface ExtractedFieldsResponse {
  success: boolean;
  raw_text?: string;
  extracted_data?: {
    full_name: string | null;
    date_of_birth: string | null;
    state: string | null;
    address: string | null;
    annual_income: string | null;
    occupation: string | null;
    gender?: string | null;
    father_name?: string | null;
    mother_name?: string | null;
    blood_group?: string | null;
    aadhaar_number?: string | null;
    pan_number?: string | null;
    driving_licence_number?: string | null;
    voter_id_number?: string | null;
    district?: string | null;
    city?: string | null;
    pin_code?: string | null;
  };
  confidence_data?: any;
  extracted_files?: any[];
}

export interface ProfileResponse {
  success: boolean;
  profile?: any;
  data?: {
    full_name: string | null;
    date_of_birth: string | null;
    state: string | null;
    address: string | null;
    annual_income: string | null;
    occupation: string | null;
    gender?: string | null;
    father_name?: string | null;
    mother_name?: string | null;
    blood_group?: string | null;
    aadhaar_number?: string | null;
    pan_number?: string | null;
    driving_licence_number?: string | null;
    voter_id_number?: string | null;
    district?: string | null;
    city?: string | null;
    pin_code?: string | null;
  };
}

export interface EvaluatedScheme {
  id: string;
  name: string;
  category: string;
  status: 'eligible' | 'possible' | 'needs_more_information' | 'not_eligible';
  reasons: string[];
  missing_information: string[];
  official_link: string;
}

export interface EligibilityApiResponse {
  success: boolean;
  profile: {
    full_name: string | null;
    date_of_birth: string | null;
    age: number | null;
    state: string | null;
    address: string | null;
    annual_income: string | null;
    annual_income_numeric: number | null;
    occupation: string | null;
  };
  eligible_schemes: EvaluatedScheme[];
  possible_schemes: EvaluatedScheme[];
  needs_more_information: EvaluatedScheme[];
  all_schemes: EvaluatedScheme[];
}

export interface SchemeDetailData {
  id: string;
  name: string;
  category: string;
  official_link: string;
  eligibility_criteria: string;
  parameters_evaluated: string[];
  required_documents: string[];
  application_information: string;
}

export interface SchemeDetailResponse {
  success: boolean;
  data?: SchemeDetailData;
}

/**
 * Upload a document to POST /api/documents/upload
 */
export async function uploadDocument(
  fileOrFiles: File | File[],
  documentType?: string,
  documentSubtype?: string
) {
  const formData = new FormData();
  if (Array.isArray(fileOrFiles)) {
    fileOrFiles.forEach((f) => {
      formData.append('files', f);
    });
    if (fileOrFiles.length > 0) {
      formData.append('file', fileOrFiles[0]);
    }
  } else {
    formData.append('file', fileOrFiles);
  }

  if (documentType) {
    formData.append('document_type', documentType);
  }
  if (documentSubtype) {
    formData.append('document_subtype', documentSubtype);
  }

  const res = await authFetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    body: formData,
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload document');
  }

  return await res.json();
}

/**
 * Extract raw OCR text from POST /api/documents/extract-text
 */
export async function extractText(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await authFetch(`${API_BASE_URL}/api/documents/extract-text`, {
    method: 'POST',
    body: formData,
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to extract text from document');
  }

  return await res.json();
}

/**
 * Extract structured fields from POST /api/documents/extract-fields
 */
export async function extractFields(
  fileOrFiles: File | File[],
  documentType?: string,
  documentSubtype?: string
): Promise<ExtractedFieldsResponse> {
  const formData = new FormData();
  if (Array.isArray(fileOrFiles)) {
    fileOrFiles.forEach((f) => {
      formData.append('files', f);
    });
  } else {
    formData.append('file', fileOrFiles);
  }

  if (documentType) {
    formData.append('document_type', documentType);
  }
  if (documentSubtype) {
    formData.append('document_subtype', documentSubtype);
  }

  const res = await authFetch(`${API_BASE_URL}/api/documents/extract-fields`, {
    method: 'POST',
    body: formData,
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to extract fields from document');
  }

  return await res.json();
}

/**
 * Retrieve current extracted profile from GET /api/profile
 */
export async function getProfile(): Promise<ProfileResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/profile`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch profile');
  }

  return await res.json();
}

/**
 * Update current profile via PUT /api/profile
 */
export async function updateProfile(data: {
  full_name?: string;
  date_of_birth?: string;
  state?: string;
  address?: string;
  annual_income?: string;
  occupation?: string;
  gender?: string;
  father_name?: string;
  mother_name?: string;
  blood_group?: string;
  aadhaar_number?: string;
  pan_number?: string;
  driving_licence_number?: string;
  voter_id_number?: string;
  district?: string;
  city?: string;
  pin_code?: string;
}) {
  const res = await authFetch(`${API_BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: getHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update profile');
  }

  return await res.json();
}

/**
 * Fetch eligibility evaluations from GET /api/eligibility
 */
export async function getEligibility(): Promise<EligibilityApiResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/eligibility`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch eligibility');
  }

  return await res.json();
}

/**
 * Fetch all scheme master records from GET /api/schemes
 */
export async function getSchemes() {
  const res = await authFetch(`${API_BASE_URL}/api/schemes`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch schemes list');
  }

  return await res.json();
}

/**
 * Fetch single scheme details from GET /api/schemes/{scheme_id}
 */
export async function getSchemeById(schemeId: string): Promise<SchemeDetailResponse> {
  const res = await authFetch(`${API_BASE_URL}/api/schemes/${encodeURIComponent(schemeId)}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch scheme details');
  }

  return await res.json();
}

export interface SchemeExplanationResponse {
  scheme_id: string;
  scheme_name: string;
  language: string;
  simple: boolean;
  title: string;
  explanation: string;
  how_to_get?: string;
  eligibility_explanation: string;
  missing_information: string[];
  official_link: string;
}

/**
 * Fetch simplified or formal scheme explanations from GET /api/explain/{scheme_id}
 */
export async function explainScheme(
  schemeId: string,
  language: string,
  simple: boolean
): Promise<SchemeExplanationResponse> {
  const res = await authFetch(
    `${API_BASE_URL}/api/explain/${encodeURIComponent(schemeId)}?language=${encodeURIComponent(
      language
    )}&simple=${simple}`,
    {
      headers: getHeaders(),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch explanation');
  }

  return await res.json();
}

/**
 * Save verified profile via POST /api/profile
 */
export async function saveVerifiedProfile(data: {
  full_name: string;
  date_of_birth: string;
  state: string;
  address: string;
  annual_income: string;
  occupation: string;
  gender?: string;
  father_name?: string;
  mother_name?: string;
  blood_group?: string;
  aadhaar_number?: string;
  pan_number?: string;
  driving_licence_number?: string;
  voter_id_number?: string;
  district?: string;
  city?: string;
  pin_code?: string;
}) {
  const res = await authFetch(`${API_BASE_URL}/api/profile`, {
    method: 'POST',
    headers: getHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to save verified profile');
  }

  return await res.json();
}

/**
 * Retrieve verified profile from GET /api/profile
 */
export async function getVerifiedProfile() {
  const res = await authFetch(`${API_BASE_URL}/api/profile`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch verified profile');
  }

  return await res.json();
}
