# SAHAYAK — Project Description & Technical Specification
## For AI Assistants: Context File for Feature Development

---

## 1. WHAT IS SAHAYAK?

SAHAYAK (सहायक / ସହାୟକ — meaning "Helper" in Hindi and Odia) is a full-stack web application + Chrome browser extension that helps Indian citizens:
1. **Scan government documents** (Aadhaar, PAN, Voter ID, Driving Licence, Income Certificate) using OCR and AI
2. **Build a unified verified profile** from those scanned documents
3. **Discover government welfare schemes** they are eligible for (PM-KISAN, PMJAY, PMSBY, PMMY, PMAY, NMMSS, etc.)
4. **Auto-fill government forms** on any website using a Chrome Extension that reads their verified profile

It is a multilingual app supporting **English, Hindi (हिंदी), and Odia (ଓଡ଼ିଆ)**.

---

## 2. TARGET USERS

- Rural and semi-urban Indian citizens who struggle with government paperwork
- Farmers, students, small business owners, daily wage workers
- Citizens who want to know which government schemes they qualify for
- Anyone needing to fill repetitive government forms online

---

## 3. TECH STACK

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **Styling**: Vanilla CSS (custom design system — no TailwindCSS in use)
- **State Management**: React `useState` / `useEffect` + `localStorage` + `sessionStorage`
- **Language**: Multilingual context via `LanguageContext` (English / Hindi / Odia)
- **Icons**: Google Material Symbols (loaded via CDN)
- **Fonts**: Inter (Google Fonts)
- **Deployment**: Vercel (frontend Vite service)
- **Live URL**: https://sahayak-seven-rho.vercel.app

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Deployment**: Vercel (Python serverless — FastAPI service at `/api/*`)
- **Entry Point**: `backend/api/index.py` (mounts all routers)
- **Authentication**: Google OAuth2 (ID token verification) + guest session tokens
- **Database**: Firebase Firestore (user profiles, document metadata)
- **Storage**: Firebase Storage (uploaded document images)
- **OCR**: EasyOCR (local) + Google Gemini Flash Vision (cloud fallback)
- **LLM**: Groq API (LLaMA 3 / Mixtral) for structured data extraction from OCR text
- **AI Key**: GROQ_API_KEY, GEMINI_API_KEY (set in environment variables)

### Chrome Extension
- **Manifest Version**: 3
- **Files**: `extension/manifest.json`, `extension/popup.html`, `extension/popup.js`, `extension/popup.css`, `extension/content.js`, `extension/background.js`
- **Distribution**: Sideloaded (no Chrome Web Store — packaged as `public/sahayak-extension.zip`)
- **Permissions**: `storage`, `activeTab`, `scripting`, `tabs`, `<all_urls>`

---

## 4. PROJECT FILE STRUCTURE

```
web/                                    ← Root (also frontend service root for Vercel)
├── src/
│   ├── App.tsx                         ← Root router, global state (profile, scheme, files)
│   ├── main.tsx                        ← React entry point
│   ├── pages/
│   │   ├── LandingPage.tsx             ← Home/hero page, Google login, guest login, extension CTA
│   │   ├── UploadDocuments.tsx         ← Document type selection + file upload
│   │   ├── ProcessingDocuments.tsx     ← OCR extraction loading screen → calls POST /api/documents/extract
│   │   ├── ReviewDetails.tsx           ← View/edit extracted profile fields form (with validation)
│   │   ├── EligibleSchemes.tsx         ← Scheme eligibility dashboard (calls GET /api/eligibility)
│   │   └── SchemeDetails.tsx           ← Detailed view for a single scheme + official portal link
│   ├── components/
│   │   ├── Header.tsx                  ← Sticky nav with emblem logo, language switcher, Add Extension button
│   │   ├── Footer.tsx                  ← Page footer
│   │   ├── ProtectedRoute.tsx          ← Guards routes requiring auth token
│   │   └── RefreshWarningBanner.tsx    ← Toast warning users not to refresh (SPA issue workaround)
│   ├── context/
│   │   └── LanguageContext.tsx         ← Global language state (en/hi/or), t() translation function
│   ├── data/
│   │   ├── schemes.ts                  ← Frontend scheme catalog (12 schemes with official_link, descriptions in 3 languages)
│   │   └── translations.ts             ← All UI translation strings (en/hi/or)
│   ├── services/
│   │   └── api.ts                      ← All API fetch functions (getProfile, updateProfile, extractDocument, getEligibility, explainScheme)
│   └── types/
│       └── index.ts                    ← TypeScript interfaces: UserProfile, Scheme, DocumentType, LanguageCode
│
├── backend/
│   ├── api/
│   │   └── index.py                    ← FastAPI app factory, CORS config, router registration
│   └── app/
│       ├── models/
│       │   └── profile.py              ← Pydantic Profile model (all fields Optional)
│       ├── routes/
│       │   ├── auth.py                 ← POST /api/auth/google, POST /api/auth/guest
│       │   ├── profile.py              ← GET/POST /api/profile
│       │   ├── documents.py            ← POST /api/documents/extract (OCR + AI extraction)
│       │   ├── schemes.py              ← GET /api/schemes, GET /api/schemes/{id}
│       │   ├── eligibility.py          ← GET/POST /api/eligibility
│       │   └── explain.py              ← GET /api/explain/{scheme_id}?language=&simple=
│       └── services/
│           ├── auth.py                 ← Google token verification, guest token generation
│           ├── firebase_service.py     ← Firestore read/write helpers
│           ├── storage_service.py      ← Firebase Storage upload/download
│           ├── ocr_service.py          ← Image preprocessing + EasyOCR text extraction
│           ├── groq_service.py         ← Stage 1: Gemini Vision OCR, Stage 2: Groq LLM → structured JSON
│           ├── profile_service.py      ← Profile CRUD in Firestore
│           ├── scheme_service.py       ← 12 government schemes master data
│           └── eligibility_service.py  ← Deterministic eligibility rules engine
│
├── extension/
│   ├── manifest.json                   ← Chrome Extension manifest v3
│   ├── popup.html                      ← Extension popup UI
│   ├── popup.js                        ← Popup logic: fetch profile, display, autofill trigger
│   ├── popup.css                       ← Extension popup styling
│   ├── content.js                      ← Injected into every page: form field detection + autofill
│   └── background.js                   ← Service worker: message passing
│
├── public/
│   ├── emblem.jpg                      ← Indian national emblem (local asset)
│   ├── sahayak-extension.zip           ← Packaged extension for direct download/install
│   ├── test-form.html                  ← Test government form for extension testing
│   └── _redirects                      ← Netlify-style SPA fallback (not used by Vercel)
│
├── vite.config.ts                      ← Vite config + vercelSpaPlugin (generates dist/vercel.json)
├── vercel.json                         ← Multi-service config: frontend (Vite) + backend (FastAPI)
└── html_files/                         ← Standalone HTML prototypes (not deployed)
```

---

## 5. USER FLOW (Step by Step)

```
[Landing Page]
     │
     ├── Google OAuth Login  ──→ POST /api/auth/google ──→ JWT token stored in localStorage
     │
     └── Guest Login ──→ POST /api/auth/guest ──→ guest token stored in localStorage
           │
           ▼
[Upload Documents Page]  (/upload)
     │  User selects document type (Aadhaar / PAN / Voter ID / DL / Income Cert)
     │  User uploads image(s) or PDF
     │
     ▼
[Processing Page]  (/processing)
     │  POST /api/documents/extract  →  
     │    Step 1: Image → Gemini Flash Vision → raw OCR text
     │    Step 2: OCR text → Groq LLM → structured profile JSON
     │    Step 3: Merge extracted data with existing profile in Firestore
     │
     ▼
[Review Details Page]  (/review)
     │  GET /api/profile → display all extracted fields in an editable form
     │  User can correct any field, then confirm
     │  POST /api/profile → save to Firestore
     │
     ▼
[Eligible Schemes Page]  (/schemes)
     │  GET /api/eligibility → deterministic rules engine evaluates profile against 12 schemes
     │  Shows 3 lists: ELIGIBLE / MAY BE ELIGIBLE / NEEDS MORE INFO
     │  Buttons: "Upload More Documents" → /upload, "Edit Profile" → /review
     │
     ▼
[Scheme Details Page]  (/scheme-details?id=<scheme_id>)
     │  GET /api/explain/{scheme_id}?language=en&simple=true
     │  Shows: scheme name, description, eligibility, how to apply, required docs
     │  "Visit Official Portal" button → opens official .gov.in website
```

---

## 6. CHROME EXTENSION FLOW

```
[User visits any government form website]
     │
     ▼
[content.js is injected into the page]
     │  Scans all <input>, <select>, <textarea> elements
     │  Scores each field by matching keywords in name/id/placeholder/label against known profile fields
     │
     ▼
[User clicks SAHAYAK extension icon]
     │  popup.js fetches profile from GET /api/profile using stored token
     │  Displays all profile fields in the popup with masked sensitive data (Aadhaar, PAN)
     │
     ▼
[User clicks "Auto-Fill This Form"]
     │  popup.js sends {action: "AUTOFILL", profileData: {...}} message to content.js
     │  content.js iterates all form fields, scores them, fills best match
     │  Supports: text inputs, date pickers, dropdowns, radio buttons, checkboxes
     │  DOB is filled in multiple formats (DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY)
```

---

## 7. BACKEND API ENDPOINTS

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/google | Verify Google ID token, return session JWT |
| POST | /api/auth/guest | Generate guest session token |
| GET | /api/profile | Get current user's profile from Firestore |
| POST | /api/profile | Save/update user profile to Firestore |
| POST | /api/documents/extract | Upload document, run OCR + AI, return extracted profile fields |
| GET | /api/schemes | List all 12 government schemes |
| GET | /api/schemes/{scheme_id} | Get one scheme's full details |
| GET | /api/eligibility | Evaluate user profile against all schemes (uses stored profile) |
| POST | /api/eligibility | Evaluate a provided profile object against all schemes |
| GET | /api/explain/{scheme_id} | Get scheme explanation + official link (supports language param) |

---

## 8. USER PROFILE DATA MODEL

```typescript
interface UserProfile {
  fullName: string;           // Full name from Aadhaar / PAN
  dob: string;                // Date of birth (DD/MM/YYYY or YYYY-MM-DD)
  gender?: string;            // Male / Female / Other
  fatherName?: string;        // Father's name
  motherName?: string;        // Mother's name
  bloodGroup?: string;        // A+, B+, O+, etc.
  aadhaarNumber?: string;     // 12-digit Aadhaar (masked in UI: XXXX-XXXX-1234)
  panNumber?: string;         // 10-character PAN
  drivingLicenceNumber?: string;
  voterIdNumber?: string;
  address?: string;           // Full residential address (optional — not required)
  state?: string;             // Indian state name
  district?: string;
  city?: string;
  pinCode?: string;
  annualIncome?: string;      // Annual income (string, e.g. "85000" or "₹8,50,000")
  occupation?: string;        // Farmer / Student / Business / Service / etc.
}
```

---

## 9. GOVERNMENT SCHEMES CATALOG (12 Schemes)

| ID | Scheme Name | Category | Official Link |
|----|-------------|----------|---------------|
| pm-kisan | PM-KISAN | Agriculture | pmkisan.gov.in |
| pmjay | Ayushman Bharat PMJAY | Health | pmjay.gov.in |
| pmjjby | PMJJBY (Life Insurance) | Insurance | jansuraksha.gov.in |
| pmsby | PMSBY (Accident Insurance) | Insurance | jansuraksha.gov.in |
| pmkmy | PM Kisan Maandhan Yojana | Agriculture/Pension | maandhan.in |
| pmfby | PM Fasal Bima Yojana | Agriculture | pmfby.gov.in |
| nmmss | National Means-Merit Scholarship | Education | scholarships.gov.in |
| student-scholarship | State Post-Matric Scholarship | Education | scholarships.gov.in |
| pmegp | PM Employment Generation Programme | Employment | kviconline.gov.in |
| pmmy | PM Mudra Yojana | Business Loan | mudra.org.in |
| pmay-u | PM Awas Yojana (Urban) | Housing | pmaymis.gov.in |
| pmay-g | PM Awas Yojana (Gramin) | Housing | pmayg.nic.in |

---

## 10. MULTILINGUAL SUPPORT

- 3 languages: English (`en`), Hindi (`hi`), Odia (`or`)
- All UI strings stored in `src/data/translations.ts` as a nested object
- Language selected via `LanguageContext` — persists in `localStorage`
- Language switcher in Header available on all pages
- Scheme descriptions, eligibility criteria, and how-to-apply text all have 3-language versions in `src/data/schemes.ts`
- Extension popup also has 3-language support (controlled by the same language setting)

---

## 11. AUTHENTICATION SYSTEM

- **Google OAuth2**: Users click the Google Sign-In button → get an ID token → POST to `/api/auth/google` → backend verifies with Google → returns a SAHAYAK session JWT
- **Guest Mode**: Users click "Continue as Guest" → POST to `/api/auth/guest` → returns a guest JWT tied to a randomly generated guest ID
- **Token Storage**: JWT stored in `localStorage` as `sahayak_token`
- **Protected Routes**: `ProtectedRoute` component checks for `sahayak_token` — redirects to `/` if missing
- **Profile Routing**: After login, the app checks `/api/profile` — if a profile exists, goes to `/schemes`, otherwise goes to `/upload`

---

## 12. KEY DESIGN DECISIONS & CONSTRAINTS

1. **No Chrome Web Store**: Extension is distributed as a `.zip` for manual sideloading — there's a 3-step interactive modal on the landing page explaining how to install it
2. **SPA Routing Issue**: Vercel's multi-service config doesn't support SPA fallback properly — direct URL refresh causes 404. Workaround: `beforeunload` warning intercepts browser refresh, and a toast banner tells users not to refresh
3. **Address is Optional**: Address field is NOT required in profile review — many ID documents (PAN, Voter ID front) don't contain address
4. **OCR Pipeline**: Two-stage: (1) Gemini Vision for raw text, (2) Groq LLM for structured JSON extraction
5. **Autofill Scoring**: The extension scores form fields using keyword matching with weighted scores — `full_name` weight=15, `date_of_birth` weight=15, etc.
6. **Profile Merging**: Each new document scan MERGES extracted data into the existing profile (non-destructive — only fills empty fields or overwrites with higher confidence)

---

## 13. ENVIRONMENT VARIABLES

```env
# Backend (.env)
ENVIRONMENT=production
ALLOWED_ORIGINS=https://sahayak-seven-rho.vercel.app,...
GOOGLE_CLIENT_ID=<google-oauth-client-id>
SESSION_SECRET=<jwt-secret>
GROQ_API_KEY=<groq-api-key>           # For LLM extraction (LLaMA 3 / Mixtral)
GEMINI_API_KEY=<gemini-api-key>       # For Vision OCR (Gemini Flash)
# Firebase (service account JSON or individual keys)

# Frontend (.env)
VITE_API_URL=https://sahayak-seven-rho.vercel.app
VITE_GOOGLE_CLIENT_ID=<google-oauth-client-id>
```

---

## 14. HOW TO ADD A NEW FEATURE (Prompt Template)

When asking another AI to add a feature to SAHAYAK, use this prompt format:

```
I am working on a project called SAHAYAK. Here is the full project description: [paste this file]

The project is a React + TypeScript frontend (Vite), FastAPI Python backend, and a Chrome Extension (MV3).

I want to add the following feature: [describe your feature here]

The feature should:
- [specific requirement 1]
- [specific requirement 2]

Please give me:
1. Which files to modify (with full paths)
2. The exact code changes needed
3. Any new files to create
4. Any new API endpoints required
5. How to test the feature
```

---

## 15. LIVE LINKS

- **Web App**: https://sahayak-seven-rho.vercel.app
- **GitHub Repo**: https://github.com/Shashankpr17/SAHAYAK
- **Test Form**: https://sahayak-seven-rho.vercel.app/test-form.html
- **Extension**: Download from the app's landing page → "Add Chrome Extension" button

---

*Last updated: August 2026*
*Maintained by: Shashank Prashant (@Shashankpr17)*
