from typing import List, Dict, Any

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
        "name": "PM-KISAN",
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
        "application_information": "Submit applications on the National Scholarship Portal (NSP) at scholarships.gov.in during the registration window."
    },
    {
        "id": "csss",
        "name": "Central Sector Scholarship for College & University Students",
        "category": "Education & Scholarships",
        "official_link": "https://scholarships.gov.in/",
        "eligibility_criteria": "Financial assistance to meritorious students from low-income families pursuing higher education in colleges and universities.",
        "parameters_evaluated": ["Class 12 Pass-out Percentile (> 80th percentile)", "Annual Family Income (< ₹4.5 Lakh)", "Regular Course Enrollment"],
        "required_documents": [
            "Class 12 Marksheet & Passing Certificate",
            "Annual Family Income Certificate",
            "Admission Fee Receipt / College ID",
            "Bank Passbook linked with Aadhaar"
        ],
        "application_information": "Apply online through the National Scholarship Portal (scholarships.gov.in)."
    },
    {
        "id": "rte",
        "name": "Right to Education – RTE EWS Quota",
        "category": "Education & Scholarships",
        "official_link": "https://www.education.gov.in/rte",
        "eligibility_criteria": "25% reservation of seats in private non-aided schools at entry-level classes (Pre-school/Class 1) for children belonging to Disadvantaged Groups and Economically Weaker Sections.",
        "parameters_evaluated": ["Child Age (Entry-level: 3-7 years)", "State / Resident Address", "State EWS Income Threshold"],
        "required_documents": [
            "Birth Certificate of Child",
            "Address Proof (Aadhaar / Ration Card / Electricity Bill)",
            "Income Certificate / Caste Certificate"
        ],
        "application_information": "Apply via your respective State RTE Admission Portal during the annual admission notification cycle."
    },
    {
        "id": "pmsym",
        "name": "Pradhan Mantri Shram Yogi Maandhan – PM-SYM",
        "category": "Employment & Pension",
        "official_link": "https://maandhan.in/",
        "eligibility_criteria": "Voluntary pension scheme for unorganized workers assuring a monthly pension of ₹3,000 after attaining the age of 60 years.",
        "parameters_evaluated": ["Age (18-40 years)", "Occupation (Unorganized Worker)", "Monthly Income (< ₹15,000)"],
        "required_documents": [
            "Aadhaar Card",
            "Savings Bank Account / Jan Dhan Account with IFSC"
        ],
        "application_information": "Visit nearest CSC center or self-enroll on maandhan.in with your Aadhaar and bank details."
    },
    {
        "id": "apy",
        "name": "Atal Pension Yojana – APY",
        "category": "Employment & Pension",
        "official_link": "https://npscra.nsdl.co.in/nsdl/scheme-details/apy",
        "eligibility_criteria": "Guaranteed monthly pension ranging from ₹1,000 to ₹5,000 for unorganized sector workers based on contribution amount and entry age.",
        "parameters_evaluated": ["Age (18-40 years)", "Savings Bank Account", "Non-Income-Taxpayer Status"],
        "required_documents": [
            "Aadhaar Card",
            "Savings Bank Account Details",
            "Mobile Number"
        ],
        "application_information": "Fill out the APY registration form at any bank branch or subscribe via your bank's net banking app."
    },
    {
        "id": "pm-vishwakarma",
        "name": "PM Vishwakarma Scheme",
        "category": "Employment & Pension",
        "official_link": "https://pmvishwakarma.gov.in/",
        "eligibility_criteria": "End-to-end holistic support for traditional artisans and craftspeople engaged in 18 trades, providing recognition, skill training, toolkits, and collateral-free credit support.",
        "parameters_evaluated": ["Age (18+ years)", "Occupation (Recognized Traditional Artisan Trade)"],
        "required_documents": [
            "Aadhaar Card",
            "Bank Account Details",
            "Trade / Skill Verification Certificate"
        ],
        "application_information": "Register at pmvishwakarma.gov.in or visit a nearby CSC for verification and Vishwakarma Digital Certificate issuance."
    },
    {
        "id": "pmsvanidhi",
        "name": "PM SVANidhi",
        "category": "Employment & Pension",
        "official_link": "https://pmsvanidhi.mohua.gov.in/",
        "eligibility_criteria": "Micro-credit facility providing collateral-free working capital loans starting at ₹10,000 to street vendors to restart their livelihoods.",
        "parameters_evaluated": ["Occupation (Street Vendor / Hawker)", "Urban Local Body Vending Certificate / Letter of Recommendation"],
        "required_documents": [
            "Aadhaar Card / Voter ID",
            "Certificate of Vending / ID Card issued by ULB",
            "Bank Account Details"
        ],
        "application_information": "Apply online at pmsvanidhi.mohua.gov.in or through a local Urban Local Body (ULB) / bank officer."
    },
    {
        "id": "pmay",
        "name": "Pradhan Mantri Awas Yojana – PMAY",
        "category": "Housing",
        "official_link": "https://pmaymis.gov.in/",
        "eligibility_criteria": "Housing scheme providing interest subsidies and financial assistance for pucca house construction to urban and rural poor families.",
        "parameters_evaluated": ["Annual Income (EWS/LIG/MIG brackets)", "No prior Pucca House ownership", "State / Location"],
        "required_documents": [
            "Aadhaar Card of all family members",
            "Income Certificate / Affidavit",
            "Land Ownership or Allotment Documents"
        ],
        "application_information": "Apply online via pmaymis.gov.in or consult your local Gram Panchayat / Municipal Corporation office."
    }
]
