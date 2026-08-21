import type { Scheme } from '../types';

export const SCHEMES: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    category: 'Agriculture & Farming',
    state: 'All States',
    description: {
      en: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector scheme with 100% funding from Government of India. The scheme aims to supplement the financial needs of the Small and Marginal Farmers (SMFs) in procuring various inputs to ensure proper crop health and appropriate yields, commensurate with the anticipated farm income at the end of each crop cycle.',
      hi: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN) भारत सरकार से 100% वित्त पोषण वाली एक केंद्रीय क्षेत्र की योजना है। इस योजना का उद्देश्य छोटे और सीमांत किसानों (SMF) की वित्तीय आवश्यकताओं को पूरा करना है ताकि प्रत्येक फसल चक्र के अंत में अनुमानित कृषि आय के अनुरूप उचित फसल स्वास्थ्य और उचित उपज सुनिश्चित की जा सके।'
    },
    benefits: {
      en: 'Under the scheme an income support of Rs. 6,000/- per year in three equal installments will be provided to all land holding farmer families. The fund will be directly transferred to the bank accounts of the beneficiaries.',
      hi: 'योजना के तहत सभी भूमिधारक किसान परिवारों को प्रति वर्ष 6,000/- रुपये की आय सहायता तीन समान किस्तों में प्रदान की जाएगी। यह राशि सीधे लाभार्थियों के बैंक खातों में स्थानांतरित की जाएगी।'
    },
    eligibilityCriteria: {
      en: [
        'All landholding farmers\' families, which have cultivable landholding in their names.',
        'Institutional land holders are not eligible.',
        'Farmer families belonging to higher economic status are excluded (e.g., former/present constitutional post holders, income tax payers, professionals like doctors/engineers).'
      ],
      hi: [
        'सभी भूमिधारक किसान परिवार, जिनके नाम पर खेती योग्य भूमि है।',
        'संस्थागत भूमि धारक पात्र नहीं हैं।',
        'उच्च आर्थिक स्थिति वाले किसान परिवारों को बाहर रखा गया है (जैसे, पूर्व/वर्तमान संवैधानिक पद धारक, आयकर दाता, डॉक्टर/इंजीनियर जैसे पेशेवर)।'
      ]
    },
    simpleDescription: {
      en: 'Think of PM-KISAN as a helping hand from the government for farmers. If you own farm land, you can get ₹6,000 every year directly into your bank account.',
      hi: 'PM-KISAN को सरकार की तरफ से किसानों के लिए एक मदद की तरह समझें। अगर आपके नाम खेती की ज़मीन है, तो आपको हर साल ₹6,000 सीधे आपके बैंक खाते में मिल सकते हैं।'
    },
    howToGet: {
      en: 'The money isn\'t given all at once. It comes in 3 parts throughout the year. Every 4 months, ₹2,000 is sent to your account.',
      hi: 'यह पैसा एक साथ नहीं दिया जाता है। यह साल भर में 3 किस्तों में आता है। हर 4 महीने में आपके खाते में ₹2,000 भेजे जाते हैं।'
    },
    whoCanGet: {
      en: [
        'You must own farm land in your name.',
        'It doesn\'t matter how big or small your land is.',
        'Exception: If you are a doctor, engineer, pay income tax, or have a high-level government job, you cannot get this money, even if you farm.'
      ],
      hi: [
        'आपके नाम पर खेती की ज़मीन होनी चाहिए।',
        'इससे कोई फर्क नहीं पड़ता कि आपकी ज़मीन कितनी बड़ी या छोटी है।',
        'अपवाद: यदि आप डॉक्टर, इंजीनियर हैं, आयकर देते हैं, या उच्च सरकारी पद पर हैं, तो आप यह राशि प्राप्त नहीं कर सकते, भले ही आप खेती करते हों।'
      ]
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'For identity proof', hi: 'पहचान प्रमाण के लिए' } },
      { name: 'Land Ownership Papers', desc: { en: 'Khatauni or equivalent', hi: 'खतौनी या समकक्ष दस्तावेज़' } },
      { name: 'Bank Account Details', desc: { en: 'Passbook copy for money transfer', hi: 'पैसे ट्रांसफर के लिए पासबुक की कॉपी' } }
    ]
  },
  {
    id: 'student-scholarship',
    name: 'Student Scholarship Program',
    category: 'Education',
    state: 'Odisha',
    description: {
      en: 'Financial assistance program designed by the State Government of Odisha to support meritorious students belonging to low-income families in pursuing higher education.',
      hi: 'ओडिशा राज्य सरकार द्वारा शुरू किया गया वित्तीय सहायता कार्यक्रम, जिसका उद्देश्य कम आय वाले परिवारों के मेधावी छात्रों को उच्च शिक्षा प्राप्त करने में सहायता करना है।'
    },
    benefits: {
      en: 'Full reimbursement of tuition fees and a monthly stipend of Rs. 1,000 for textbooks and living expenses during the academic year.',
      hi: 'शैक्षणिक वर्ष के दौरान ट्यूशन फीस की पूरी प्रतिपूर्ति और पाठ्यपुस्तकों और रहने के खर्च के लिए 1,000 रुपये प्रति माह का वजीफा।'
    },
    eligibilityCriteria: {
      en: [
        'Must be a permanent resident of Odisha.',
        'Family income should be less than or equal to Rs. 2,50,000 per annum.',
        'Must have scored at least 60% in the last qualifying examination.'
      ],
      hi: [
        'ओडिशा का स्थायी निवासी होना चाहिए।',
        'पारिवारिक आय प्रति वर्ष 2,50,000 रुपये से कम या उसके बराबर होनी चाहिए।',
        'पिछली योग्यता परीक्षा में कम से कम 60% अंक प्राप्त किए होने चाहिए।'
      ]
    },
    simpleDescription: {
      en: 'If you are a student in Odisha and your family does not make a lot of money, the government will help pay for your college fees and books.',
      hi: 'अगर आप ओडिशा में छात्र हैं और आपके परिवार की आमदनी अधिक नहीं है, तो सरकार आपके कॉलेज की फीस और किताबों का खर्च उठाने में मदद करेगी।'
    },
    howToGet: {
      en: 'Apply online through the state scholarship portal. The scholarship amount is directly credited to the student\'s Aadhaar-linked bank account.',
      hi: 'राज्य छात्रवृत्ति पोर्टल के माध्यम से ऑनलाइन आवेदन करें। छात्रवृत्ति की राशि सीधे छात्र के आधार-लिंक्ड बैंक खाते में जमा की जाती है।'
    },
    whoCanGet: {
      en: [
        'Students enrolled in recognized schools/colleges in Odisha.',
        'Annual household income must be below Rs. 2.5 Lakhs.',
        'Must maintain 75% attendance in class.'
      ],
      hi: [
        'ओडिशा में मान्यता प्राप्त स्कूलों/कॉलेजों में नामांकित छात्र।',
        'पारिवारिक वार्षिक आय 2.5 लाख रुपये से कम होनी चाहिए।',
        'कक्षा में 75% उपस्थिति बनाए रखनी होगी।'
      ]
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'For resident & identity proof', hi: 'निवास और पहचान प्रमाण के लिए' } },
      { name: 'Income Certificate', desc: { en: 'Issued by competent revenue authority', hi: 'सक्षम राजस्व अधिकारी द्वारा जारी आय प्रमाण पत्र' } },
      { name: 'College Admission Receipt', desc: { en: 'Proof of active study status', hi: 'सक्रिय अध्ययन स्थिति का प्रमाण' } }
    ]
  },
  {
    id: 'teacher-welfare',
    name: 'National Teacher Welfare Fund',
    category: 'Education & Welfare',
    state: 'Delhi',
    description: {
      en: 'A dedicated welfare scheme launched by the government to provide financial relief and medical assistance to school teachers in Delhi who are in financial distress.',
      hi: 'दिल्ली में आर्थिक संकट से जूझ रहे स्कूली शिक्षकों को वित्तीय राहत और चिकित्सा सहायता प्रदान करने के लिए सरकार द्वारा शुरू की गई एक समर्पित कल्याणकारी योजना।'
    },
    benefits: {
      en: 'Provides one-time financial aid of up to Rs. 50,000 for medical emergencies or children\'s higher education, and pension support.',
      hi: 'चिकित्सा आपातकाल या बच्चों की उच्च शिक्षा के लिए 50,000 रुपये तक की एकमुश्त वित्तीय सहायता और पेंशन सहायता प्रदान करता है।'
    },
    eligibilityCriteria: {
      en: [
        'Must be currently employed as a teacher in a recognized school in Delhi.',
        'Should have completed at least 3 years of service.',
        'Household income must not exceed Rs. 10,000,000 per annum.'
      ],
      hi: [
        'वर्तमान में दिल्ली के एक मान्यता प्राप्त स्कूल में शिक्षक के रूप में कार्यरत होना चाहिए।',
        'कम से कम 3 वर्ष की सेवा पूरी कर ली हो।',
        'पारिवारिक वार्षिक आय 10,00,000 रुपये से अधिक नहीं होनी चाहिए।'
      ]
    },
    simpleDescription: {
      en: 'This is a special support fund for school teachers in Delhi. If you need help with medical expenses or your kids\' college education, you can get money from this fund.',
      hi: 'यह दिल्ली में स्कूल शिक्षकों के लिए एक विशेष सहायता कोष है। यदि आपको चिकित्सा खर्चों या अपने बच्चों की कॉलेज शिक्षा के लिए मदद की आवश्यकता है, तो आपको इस कोष से सहायता मिल सकती है।'
    },
    howToGet: {
      en: 'Submit an application form endorsed by your School Principal to the Delhi Directorate of Education office.',
      hi: 'अपने स्कूल के प्रधानाचार्य द्वारा समर्थित आवेदन पत्र दिल्ली शिक्षा निदेशालय के कार्यालय में जमा करें।'
    },
    whoCanGet: {
      en: [
        'Teachers working in Delhi schools.',
        'Emergency financial need verified by school management.',
        'Income should be within the permissible bracket.'
      ],
      hi: [
        'दिल्ली के स्कूलों में कार्यरत शिक्षक।',
        'स्कूल प्रबंधन द्वारा सत्यापित आपातकालीन वित्तीय आवश्यकता।',
        'आय स्वीकार्य सीमा के भीतर होनी चाहिए।'
      ]
    },
    requiredDocs: [
      { name: 'Employment ID Card', desc: { en: 'Proof of active teacher status', hi: 'सक्रिय शिक्षक होने का प्रमाण' } },
      { name: 'Salary Slip', desc: { en: 'For income verification', hi: 'आय सत्यापन के लिए वेतन पर्ची' } },
      { name: 'Medical Bills or Fee Receipts', desc: { en: 'For verification of emergency', hi: 'आपातकाल के सत्यापन के लिए मेडिकल बिल या फीस रसीदें' } }
    ]
  }
];
