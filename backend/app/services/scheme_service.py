"""
scheme_service.py — Government Schemes Master Data & Repository
"""

from typing import List, Dict, Any, Optional

ALL_SCHEMES_DATA: List[Dict[str, Any]] = [
    {
        "id": "pmjay",
        "name": "Ayushman Bharat – PMJAY",
        "category": "Health & Insurance",
        "official_link": "https://pmjay.gov.in/",
        "eligibility_criteria": "Health coverage up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization to poor and vulnerable families.",
        "parameters_evaluated": ["Annual Income / Deprivation Category", "Occupation", "State / Location"],
        "required_documents": [
            "Aadhaar Card or Voter ID",
            "Ration Card or Family Identification Document",
            "Proof of Income / EWS Certificate (if applicable)"
        ],
        "application_information": "Check eligibility online at pmjay.gov.in or visit the nearest Ayushman Mitra at empaneled public or private hospitals."
    },
    {
        "id": "pmjjby",
        "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana – PMJJBY",
        "category": "Health & Insurance",
        "official_link": "https://jansuraksha.gov.in/",
        "eligibility_criteria": "Life insurance cover of ₹2 Lakh for death due to any cause. Entry age 18 to 50 years with an active savings bank account.",
        "parameters_evaluated": ["Age (18-50 years)", "Savings Bank Account"],
        "required_documents": [
            "Aadhaar Card",
            "Bank Account Passbook / Savings Account Details",
            "Auto-debit Consent Form"
        ],
        "application_information": "Enroll through your bank branch, net banking portal, or submit the auto-debit consent form at any participating bank."
    },
    {
        "id": "pmsby",
        "name": "Pradhan Mantri Suraksha Bima Yojana – PMSBY",
        "category": "Health & Insurance",
        "official_link": "https://jansuraksha.gov.in/",
        "eligibility_criteria": "Accident insurance cover of ₹2 Lakh for accidental death or permanent total disability, and ₹1 Lakh for permanent partial disability. Entry age 18 to 70 years.",
        "parameters_evaluated": ["Age (18-70 years)", "Savings Bank Account"],
        "required_documents": [
            "Aadhaar Card",
            "Savings Bank Account Details",
            "Nominee Details"
        ],
        "application_information": "Apply via your savings bank branch or online bank portal with an annual premium auto-debit consent of ₹20."
    },
    {
        "id": "pm-kisan",
        "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "category": "Agriculture & Farmers",
        "official_link": "https://pmkisan.gov.in/",
        "eligibility_criteria": "Direct financial support of ₹6,000 per year in three equal installments to all landholding farmer families across India.",
        "parameters_evaluated": ["Occupation (Farmer / Landholder)", "Non-taxpayer Status", "Landholding Records"],
        "required_documents": [
            "Aadhaar Card",
            "Land Ownership Records (Khasra / Khatauni)",
            "Bank Account Passbook"
        ],
        "application_information": "Self-register on the PM-KISAN portal (pmkisan.gov.in), via PM-KISAN mobile app, or through nearest CSC center."
    },
    {
        "id": "pmkmy",
        "name": "Pradhan Mantri Kisan Maandhan Yojana – PMKMY",
        "category": "Agriculture & Farmers",
        "official_link": "https://maandhan.in/",
        "eligibility_criteria": "Voluntary and contributory pension scheme providing a minimum assured pension of ₹3,000 per month after reaching 60 years of age for small and marginal farmers.",
        "parameters_evaluated": ["Age (18-40 years)", "Occupation (Small / Marginal Farmer)", "Cultivable Land up to 2 Hectares"],
        "required_documents": [
            "Aadhaar Card",
            "Savings Bank Account / PM-KISAN Account Details",
            "Land Holding Documents"
        ],
        "application_information": "Visit your nearest Common Service Centre (CSC) or self-enroll at maandhan.in."
    },
    {
        "id": "pmfby",
        "name": "Pradhan Mantri Fasal Bima Yojana – PMFBY",
        "category": "Agriculture & Farmers",
        "official_link": "https://pmfby.gov.in/",
        "eligibility_criteria": "Crop insurance scheme supporting sustainable production in agriculture by providing financial support to farmers facing crop loss or damage.",
        "parameters_evaluated": ["Occupation (Farmer)", "State / District Notified Crops", "Sowing / Land Records"],
        "required_documents": [
            "Aadhaar Card",
            "Land Possession Certificate (LPC) / Sowing Certificate",
            "Bank Passbook Details"
        ],
        "application_information": "Enroll through designated insurance companies, banks, CSC portal, or directly at pmfby.gov.in before the cutoff date."
    },
    {
        "id": "nmmss",
        "name": "National Means-cum-Merit Scholarship Scheme – NMMSS",
        "category": "Education & Scholarships",
        "official_link": "https://scholarships.gov.in/",
        "eligibility_criteria": "Scholarship of ₹12,000 per annum to meritorious students of economically weaker sections to arrest dropouts at Class 8 and encourage education up to Class 12.",
        "parameters_evaluated": ["Student Enrollment (Class 9)", "Annual Family Income (< ₹3.5 Lakh)", "Minimum Marks in Class 8"],
        "required_documents": [
            "Class 8 Marksheet",
            "Income Certificate (Issued by competent authority)",
            "Aadhaar Card",
            "Bank Account Details"
        ],
        "application_information": "Apply online through the National Scholarship Portal (NSP) at scholarships.gov.in."
    },
    {
        "id": "student-scholarship",
        "name": "State Post-Matric & Higher Education Scholarship",
        "category": "Education & Scholarships",
        "official_link": "https://scholarships.gov.in/",
        "eligibility_criteria": "Financial assistance covering tuition fees and maintenance allowance for post-secondary and college students from low-income families.",
        "parameters_evaluated": ["Student Status", "Annual Family Income (<= ₹2.5 Lakh)", "State Domicile"],
        "required_documents": [
            "Aadhaar Card",
            "Income Certificate",
            "College Enrollment / Fee Receipt",
            "Previous Academic Marksheet"
        ],
        "application_information": "Register and apply on your State Scholarship Portal or National Scholarship Portal."
    },
    {
        "id": "pmegp",
        "name": "Prime Minister's Employment Generation Programme – PMEGP",
        "category": "Employment & Skill Development",
        "official_link": "https://www.kviconline.gov.in/pmegpeportal/",
        "eligibility_criteria": "Credit-linked subsidy programme to generate self-employment through setting up micro-enterprises in non-farm sector. Subsidy up to 35%.",
        "parameters_evaluated": ["Age (18+ years)", "Education (Class 8 pass for projects > ₹10L in manufacturing)", "Beneficiary Category"],
        "required_documents": [
            "Aadhaar Card and PAN Card",
            "Project Report / Business Plan",
            "Educational Qualification Certificate",
            "Special Category Certificate (SC/ST/OBC/Women/Ex-Servicemen if applicable)"
        ],
        "application_information": "Apply online via the PMEGP e-Portal (kviconline.gov.in/pmegpeportal)."
    },
    {
        "id": "pmmy",
        "name": "Pradhan Mantri Mudra Yojana – PMMY",
        "category": "Business & Self-Employment",
        "official_link": "https://www.mudra.org.in/",
        "eligibility_criteria": "Loans up to ₹10 Lakh to non-corporate, non-farm small/micro enterprises through banks and NBFCs across Shishu, Kishore, and Tarun categories.",
        "parameters_evaluated": ["Non-farm Enterprise Activity", "Identity Proof", "Business Purpose"],
        "required_documents": [
            "Identity Proof (Aadhaar / Voter ID / PAN)",
            "Residence Proof",
            "Business Enterprise Proof / Quotation for machinery"
        ],
        "application_information": "Apply through any commercial bank, RRB, small finance bank, MFI, or online at udyamimitra.in."
    },
    {
        "id": "pmay-u",
        "name": "Pradhan Mantri Awas Yojana (Urban) – PMAY-U",
        "category": "Housing & Urban Affairs",
        "official_link": "https://pmaymis.gov.in/",
        "eligibility_criteria": "Central assistance for housing to eligible urban beneficiaries including EWS/LIG categories who do not own a pucca house anywhere in India.",
        "parameters_evaluated": ["Annual Income (EWS <= ₹3L, LIG <= ₹6L)", "No Pucca House Ownership", "Urban Resident"],
        "required_documents": [
            "Aadhaar Card",
            "Income Proof / Salary Slip",
            "Affidavit confirming no pucca house ownership",
            "Bank Account Details"
        ],
        "application_information": "Apply through your local Urban Local Body (ULB) or online at pmaymis.gov.in."
    },
    {
        "id": "pmay-g",
        "name": "Pradhan Mantri Awas Yojana (Gramin) – PMAY-G",
        "category": "Housing & Rural Affairs",
        "official_link": "https://pmayg.nic.in/",
        "eligibility_criteria": "Financial assistance of ₹1.20 Lakh in plains and ₹1.30 Lakh in hilly/difficult areas to houseless and families living in kutcha/dilapidated houses in rural areas.",
        "parameters_evaluated": ["SECC Deprivation Data", "Kutcha House", "Rural Resident"],
        "required_documents": [
            "Aadhaar Card",
            "Bank Passbook Details",
            "Job Card Number (MGNREGA)",
            "Consent document for Aadhaar authentication"
        ],
        "application_information": "Beneficiary list is finalized by the Gram Sabha based on SECC data. Contact your Gram Panchayat or Block Development Office."
    }
]


def get_all_schemes() -> List[Dict[str, Any]]:
    """Return list of all government schemes."""
    return ALL_SCHEMES_DATA


def get_scheme_by_id(scheme_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve details for a single scheme by identifier (case-insensitive)."""
    target = scheme_id.strip().lower()
    for scheme in ALL_SCHEMES_DATA:
        if scheme["id"].lower() == target:
            return scheme
    return None
