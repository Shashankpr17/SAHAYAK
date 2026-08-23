import type { Scheme } from '../types';

export const SCHEMES: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    category: 'Agriculture & Farming',
    state: 'All States',
    official_link: 'https://pmkisan.gov.in/',
    description: {
      en: 'PM-KISAN provides income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.',
      hi: 'PM-KISAN योजना भारत भर के सभी भूमिधारक किसान परिवारों को ₹6,000 प्रति वर्ष की आय सहायता तीन समान किस्तों में प्रदान करती है।',
      or: 'ପିଏମ୍-କିଷାନ୍ ଯୋଜନା ସମସ୍ତ ଜମିଧାରକ କୃଷକ ପରିବାରକୁ ବାର୍ଷିକ ୬,୦୦୦ ଟଙ୍କା ତିନୋଟି କିସ୍ତିରେ ପ୍ରଦାନ କରେ |'
    },
    benefits: {
      en: 'Direct bank transfer of ₹2,000 every 4 months (₹6,000 annually).',
      hi: 'हर 4 महीने में ₹2,000 का सीधा बैंक ट्रांसफर (वार्षिक ₹6,000)।',
      or: 'ପ୍ରତି ୪ ମାସରେ ୨,୦୦୦ ଟଙ୍କା ସିଧାସଳଖ ବ୍ୟାଙ୍କ ଖାତାକୁ (ବାର୍ଷିକ ୬,୦୦୦ ଟଙ୍କା) |'
    },
    eligibilityCriteria: {
      en: ['Landholding farmer family with cultivable land in their name.'],
      hi: ['नाम पर खेती योग्य भूमि वाले किसान परिवार।'],
      or: ['ନିଜ ନାମରେ ଚାଷଜମି ଥିବା କୃଷକ ପରିବାର |']
    },
    simpleDescription: {
      en: 'If you own farm land, you can get ₹6,000 every year directly into your bank account.',
      hi: 'यदि आपके पास खेती की जमीन है, तो आपको सीधे आपके बैंक खाते में हर साल ₹6,000 मिलेंगे।',
      or: 'ଯଦି ଆପଣଙ୍କର ଚାଷଜମି ଅଛି, ତେବେ ଆପଣଙ୍କୁ ପ୍ରତିବର୍ଷ ବ୍ୟାଙ୍କ ଖାତାରେ ୬,୦୦୦ ଟଙ୍କା ମିଳିବ |'
    },
    howToGet: {
      en: 'Apply online on pmkisan.gov.in or through nearest CSC center with Aadhaar and land records.',
      hi: 'आधार और भूमि रिकॉर्ड के साथ pmkisan.gov.in पर या नजदीकी CSC केंद्र पर ऑनलाइन आवेदन करें।',
      or: 'ଆଧାର ଏବଂ ଜମି ପଟ୍ଟା ସହିତ pmkisan.gov.in କିମ୍ବା ନିକଟସ୍ଥ CSC କେନ୍ଦ୍ର ମାଧ୍ୟମରେ ଆବେଦନ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['Small & marginal farmers owning cultivable land.'],
      hi: ['खेती योग्य भूमि वाले छोटे और सीमांत किसान।'],
      or: ['ଚାଷଜମି ଥିବା କ୍ଷୁଦ୍ର ଏବଂ ନାମମାତ୍ର ଚାଷୀ |']
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'Identity proof', hi: 'पहचान प्रमाण', or: 'ପରିଚୟ ପତ୍ର' } },
      { name: 'Land Ownership Records', desc: { en: 'Khatauni / Khasra / RoR', hi: 'खतौनी / खसरा', or: 'ଜମି ପଟ୍ଟା / ଖତିଆନ୍' } },
      { name: 'Bank Passbook', desc: { en: 'For direct benefit transfer', hi: 'डीबीटी हेतु बैंक पासबुक', or: 'ବ୍ୟାଙ୍କ ପାସବୁକ୍' } }
    ]
  },
  {
    id: 'pmjay',
    name: 'Ayushman Bharat – PMJAY',
    category: 'Health & Insurance',
    state: 'All States',
    official_link: 'https://pmjay.gov.in/',
    description: {
      en: 'Ayushman Bharat PM-JAY provides health insurance coverage of up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization.',
      hi: 'आयुष्मान भारत पीएम-जेएवाई गरीब और कमजोर परिवारों को अस्पताल में भर्ती होने पर प्रति वर्ष ₹5 लाख तक का स्वास्थ्य कवर प्रदान करता है।',
      or: 'ଆୟୁଷ୍ମାନ ଭାରତ ଯୋଜନା ପରିବାର ପିଛା ବାର୍ଷିକ ୫ ଲକ୍ଷ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ ମାଗଣା ସ୍ୱାସ୍ଥ୍ୟ ବୀମା ପ୍ରଦାନ କରେ |'
    },
    benefits: {
      en: 'Cashless treatment up to ₹5,00,000 annually across 27,000+ empaneled hospitals.',
      hi: '27,000+ सूचीबद्ध अस्पतालों में प्रति वर्ष ₹5,00,000 तक कैशलेस उपचार।',
      or: '୨୭,୦୦୦ ରୁ ଅଧିକ ହସ୍ପିଟାଲରେ ବାର୍ଷିକ ୫ ଲକ୍ଷ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ କ୍ୟାସଲେସ ଚିକିତ୍ସା |'
    },
    eligibilityCriteria: {
      en: ['Families listed in SECC 2011 database or holding active Ration Card.'],
      hi: ['SECC 2011 सूची में शामिल परिवार या राशन कार्ड धारक।'],
      or: ['SECC ୨୦୧୧ ଡାଟାବେସ କିମ୍ବା ରାସନ କାର୍ଡ ଥିବା ପରିବାର |']
    },
    simpleDescription: {
      en: 'Free hospital treatment up to ₹5 Lakh for you and your family every year.',
      hi: 'आपके और आपके परिवार के लिए हर साल ₹5 लाख तक का मुफ्त अस्पताल उपचार।',
      or: 'ଆପଣ ଏବଂ ଆପଣଙ୍କ ପରିବାର ପାଇଁ ପ୍ରତିବର୍ଷ ୫ ଲକ୍ଷ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ ମାଗଣା ଡାକ୍ତରଖାନା ଚିକିତ୍ସା |'
    },
    howToGet: {
      en: 'Visit pmjay.gov.in or nearest Ayushman Mitra at any government or empaneled hospital.',
      hi: 'pmjay.gov.in पर जाएं या किसी भी सरकारी या सूचीबद्ध अस्पताल में आयुष्मान मित्र से संपर्क करें।',
      or: 'pmjay.gov.in କୁ ଯାଆନ୍ତୁ କିମ୍ବା ଯେକୌଣସି ସରକାରୀ ଡାକ୍ତରଖାନାରେ ଆୟୁଷ୍ମାନ ମିତ୍ରଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['Low-income households, EWS category, rural and urban workers.'],
      hi: ['कम आय वाले परिवार, ईडब्ल्यूएस श्रेणी, ग्रामीण और शहरी श्रमिक।'],
      or: ['ସ୍ୱଳ୍ପ ଆୟକାରୀ ପରିବାର ଏବଂ ଶ୍ରମିକମାନେ |']
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'Identity proof', hi: 'पहचान प्रमाण', or: 'ପରିଚୟ ପତ୍ର' } },
      { name: 'Ration Card', desc: { en: 'Family identification', hi: 'पारिवारिक पहचान', or: 'ରାସନ କାର୍ଡ' } }
    ]
  },
  {
    id: 'pmjjby',
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    category: 'Health & Insurance',
    state: 'All States',
    official_link: 'https://jansuraksha.gov.in/',
    description: {
      en: 'Life insurance cover of ₹2 Lakh for death due to any reason for persons aged 18 to 50 years with a bank account.',
      hi: '18 से 50 वर्ष की आयु के बैंक खाताधारकों के लिए किसी भी कारण से मृत्यु होने पर ₹2 लाख का जीवन बीमा कवर।',
      or: '୧୮ ରୁ ୫୦ ବର୍ଷ ବୟସ୍କ ବ୍ୟକ୍ତିଙ୍କ ପାଇଁ ୨ ଲକ୍ଷ ଟଙ୍କାର ଜୀବନ ବୀମା ସୁରକ୍ଷା |'
    },
    benefits: {
      en: '₹2,00,000 life coverage paid to the nominee on member death at a low premium of ₹436/year.',
      hi: '₹436/वर्ष के कम प्रीमियम पर मृत्यु की स्थिति में नामांकित व्यक्ति को ₹2,00,000 का भुगतान।',
      or: 'ବାର୍ଷିକ ମାତ୍ର ୪୩୬ ଟଙ୍କା ପ୍ରିମିୟମରେ ୨ ଲକ୍ଷ ଟଙ୍କାର ଜୀବନ ବୀମା |'
    },
    eligibilityCriteria: {
      en: ['Age 18 to 50 years with an active savings bank account.'],
      hi: ['सक्रिय बचत बैंक खाते के साथ 18 से 50 वर्ष की आयु।'],
      or: ['୧୮ ରୁ ୫୦ ବର୍ଷ ବୟସ ଏବଂ ସଞ୍ଚୟ ବ୍ୟାଙ୍କ ଖାତା |']
    },
    simpleDescription: {
      en: 'Life insurance that gives ₹2 Lakh financial support to your family for just ₹436 a year.',
      hi: 'जीवन बीमा जो आपके परिवार को मात्र ₹436 प्रति वर्ष में ₹2 लाख की वित्तीय सुरक्षा देता है।',
      or: 'ଜୀବନ ବୀମା ଯାହା ବାର୍ଷିକ ମାତ୍ର ୪୩୬ ଟଙ୍କାରେ ଆପଣଙ୍କ ପରିବାରକୁ ୨ ଲକ୍ଷ ଟଙ୍କାର ସୁରକ୍ଷା ଦିଏ |'
    },
    howToGet: {
      en: 'Submit auto-debit consent form at your bank branch or enroll via Internet Banking.',
      hi: 'अपने बैंक शाखा में ऑटो-डेबिट फॉर्म जमा करें या नेट बैंकिंग से ऑनलाइन आवेदन करें।',
      or: 'ଆପଣଙ୍କର ବ୍ୟାଙ୍କ ଶାଖାରେ ଫର୍ମ ଦାଖଲ କରନ୍ତୁ କିମ୍ବା ନେଟ୍ ବ୍ୟାଙ୍କିଙ୍ଗ୍ ମାଧ୍ୟମରେ ଆବେଦନ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['Any Indian citizen aged 18-50 years with a bank account.'],
      hi: ['बैंक खाते वाले 18-50 वर्ष के सभी भारतीय नागरिक।'],
      or: ['୧୮ ରୁ ୫୦ ବର୍ଷର ଯେକୌଣସି ଭାରତୀୟ ନାଗରିକ |']
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'Identity proof', hi: 'पहचान प्रमाण', or: 'ପରିଚୟ ପତ୍ର' } },
      { name: 'Bank Passbook', desc: { en: 'Savings account details', hi: 'बचत खाता विवरण', or: 'ବ୍ୟାଙ୍କ ଖାତା ବିବରଣୀ' } }
    ]
  },
  {
    id: 'pmsby',
    name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    category: 'Health & Insurance',
    state: 'All States',
    official_link: 'https://jansuraksha.gov.in/',
    description: {
      en: 'Accident insurance coverage of ₹2 Lakh for accidental death or permanent disability for ₹20 per year.',
      hi: 'दुर्घटना मृत्यु या स्थायी विकलांगता के लिए ₹20 प्रति वर्ष पर ₹2 लाख का दुर्घटना बीमा कवर।',
      or: 'ଦୁର୍ଘଟଣାଜନିତ ମୃତ୍ୟୁ ବା ଅକ୍ଷମତା ପାଇଁ ବାର୍ଷିକ ମାତ୍ର ୨୦ ଟଙ୍କାରେ ୨ ଲକ୍ଷ ଟଙ୍କାର ଦୁର୍ଘଟଣା ବୀମା |'
    },
    benefits: {
      en: '₹2 Lakh for accidental death / total disability, ₹1 Lakh for partial disability.',
      hi: 'दुर्घटना में मृत्यु / पूर्ण विकलांगता पर ₹2 लाख, आंशिक विकलांगता पर ₹1 लाख।',
      or: 'ଦୁର୍ଘଟଣାଜନିତ ମୃତ୍ୟୁରେ ୨ ଲକ୍ଷ ଟଙ୍କା ଏବଂ ଆଂଶିକ ଅକ୍ଷମତାରେ ୧ ଲକ୍ଷ ଟଙ୍କା |'
    },
    eligibilityCriteria: {
      en: ['Age 18 to 70 years with an active savings bank account.'],
      hi: ['बचत बैंक खाते के साथ 18 से 70 वर्ष की आयु।'],
      or: ['୧୮ ରୁ ୭୦ ବର୍ଷ ବୟସ ଏବଂ ସଞ୍ଚୟ ବ୍ୟାଙ୍କ ଖାତା |']
    },
    simpleDescription: {
      en: 'Accident insurance giving up to ₹2 Lakh coverage for just ₹20 per year.',
      hi: 'दुर्घटना बीमा जो सिर्फ ₹20 प्रति वर्ष में ₹2 लाख तक का कवर देता है।',
      or: 'ଦୁର୍ଘଟଣା ବୀମା ଯାହା ବାର୍ଷିକ ମାତ୍ର ୨୦ ଟଙ୍କାରେ ୨ ଲକ୍ଷ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ ସୁରକ୍ଷା ଦିଏ |'
    },
    howToGet: {
      en: 'Enroll at your bank branch or via Net Banking / Mobile Banking.',
      hi: 'अपनी बैंक शाखा में या नेट बैंकिंग / मोबाइल बैंकिंग से आवेदन करें।',
      or: 'ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଶାଖାରେ କିମ୍ବା ମୋବାଇଲ୍ ବ୍ୟାଙ୍କିଙ୍ଗ୍ ମାଧ୍ୟମରେ ଆବେଦନ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['All individuals aged 18 to 70 years.'],
      hi: ['18 से 70 वर्ष की आयु के सभी व्यक्ति।'],
      or: ['୧୮ ରୁ ୭୦ ବର୍ଷ ବୟସର ସମସ୍ତ ବ୍ୟକ୍ତି |']
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'Identity proof', hi: 'पहचान प्रमाण', or: 'ପରିଚୟ ପତ୍ର' } },
      { name: 'Bank Passbook', desc: { en: 'Account details', hi: 'बैंक खाता विवरण', or: 'ବ୍ୟାଙ୍କ ଖାତା' } }
    ]
  },
  {
    id: 'pmkmy',
    name: 'Pradhan Mantri Kisan Maandhan Yojana (PMKMY)',
    category: 'Agriculture & Farming',
    state: 'All States',
    official_link: 'https://maandhan.in/',
    description: {
      en: 'Old age pension scheme assuring ₹3,000 monthly pension to small and marginal farmers after age 60.',
      hi: 'वृद्धावस्था पेंशन योजना जो 60 वर्ष की आयु के बाद छोटे और सीमांत किसानों को ₹3,000 मासिक पेंशन सुनिश्चित करती है।',
      or: '୬୦ ବର୍ଷ ପରେ କ୍ଷୁଦ୍ର ଚାଷୀଙ୍କ ପାଇଁ ମାସିକ ୩,୦୦୦ ଟଙ୍କା ନିଶ୍ଚିତ ପେନସନ୍ ଯୋଜନା |'
    },
    benefits: {
      en: 'Guaranteed pension of ₹3,000 per month upon reaching age 60.',
      hi: '60 वर्ष की आयु प्राप्त करने पर ₹3,000 प्रति माह की गारंटीकृत पेंशन।',
      or: '୬୦ ବର୍ଷ ବୟସ ପରେ ମାସିକ ୩,୦୦୦ ଟଙ୍କା ନିଶ୍ଚିତ ପେନସନ୍ |'
    },
    eligibilityCriteria: {
      en: ['Small and marginal farmers aged 18 to 40 years with cultivable land up to 2 hectares.'],
      hi: ['18 से 40 वर्ष की आयु वाले 2 हेक्टेयर तक भूमि के छोटे और सीमांत किसान।'],
      or: ['୧୮ ରୁ ୪୦ ବର୍ଷ ବୟସର ୨ ହେକ୍ଟର ପର୍ଯ୍ୟନ୍ତ ଜମି ଥିବା କ୍ଷୁଦ୍ର ଚାଷୀ |']
    },
    simpleDescription: {
      en: 'Save a small monthly amount now, get ₹3,000 every month after age 60.',
      hi: 'अभी थोड़ा मासिक योगदान दें, 60 की उम्र के बाद हर महीने ₹3,000 पेंशन पाएं।',
      or: 'ଏବେ ସାମାନ୍ୟ ଜମା କରନ୍ତୁ, ୬୦ ବର୍ଷ ପରେ ପ୍ରତିମାସ ୩,୦୦୦ ଟଙ୍କା ପେନସନ୍ ପାଆନ୍ତୁ |'
    },
    howToGet: {
      en: 'Enroll at nearest Common Service Center (CSC) or online at maandhan.in.',
      hi: 'नजदीकी सीएससी (CSC) पर जाएं या maandhan.in पर ऑनलाइन नामांकन करें।',
      or: 'ନିକଟସ୍ଥ CSC କେନ୍ଦ୍ର କିମ୍ବା maandhan.in ରେ ଆବେଦନ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['Farmers aged 18-40 with up to 2 hectares of cultivable land.'],
      hi: ['18-40 वर्ष के किसान जिनके पास 2 हेक्टेयर तक जमीन है।'],
      or: ['୧୮ ରୁ ୪୦ ବର୍ଷର କ୍ଷୁଦ୍ର ଚାଷୀ |']
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'Identity proof', hi: 'पहचान प्रमाण', or: 'ପରିଚୟ ପତ୍ର' } },
      { name: 'Bank Passbook', desc: { en: 'Bank details', hi: 'बैंक खाता विवरण', or: 'ବ୍ୟାଙ୍କ ଖାତା' } },
      { name: 'Land Records', desc: { en: 'Khasra / Khatauni', hi: 'खसरा / खतौनी', or: 'ଜମି ପଟ୍ଟା' } }
    ]
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'Agriculture & Farming',
    state: 'All States',
    official_link: 'https://pmfby.gov.in/',
    description: {
      en: 'Comprehensive crop insurance against natural calamities, pests, and diseases at lowest premium rates.',
      hi: 'न्यूनतम प्रीमियम दरों पर प्राकृतिक आपदाओं, कीटों और बीमारियों के खिलाफ व्यापक फसल बीमा।',
      or: 'ପ୍ରାକୃତିକ ବିପର୍ଯ୍ୟୟ ଏବଂ ରୋଗ ପୋକରୁ ଫସଲ ନଷ୍ଟ ପାଇଁ ବ୍ୟାପକ ଫସଲ ବୀମା ଯୋଜନା |'
    },
    benefits: {
      en: 'Full financial cover for crop loss with uniform low premium (1.5% Rabi, 2% Kharif).',
      hi: 'समान कम प्रीमियम (1.5% रबी, 2% खरीफ) पर फसल नुकसान के लिए पूर्ण वित्तीय कवर।',
      or: 'ସ୍ୱଳ୍ପ ପ୍ରିମିୟମରେ ଫସଲ କ୍ଷୟକ୍ଷତି ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ କ୍ଷତିପୂରଣ |'
    },
    eligibilityCriteria: {
      en: ['All farmers growing notified crops in notified areas.'],
      hi: ['अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान।'],
      or: ['ଅଧିସୂଚିତ ଅଞ୍ଚଳରେ ଚାଷ କରୁଥିବା ସମସ୍ତ କୃଷକ |']
    },
    simpleDescription: {
      en: 'Protect your crops from weather damage and natural disasters with government insurance.',
      hi: 'सरकारी बीमा के साथ अपनी फसलों को मौसम और प्राकृतिक आपदाओं से बचाएं।',
      or: 'ସରକାରୀ ବୀମା ସହିତ ଆପଣଙ୍କ ଫସଲକୁ ପ୍ରାକୃତିକ କ୍ଷତିରୁ ସୁରକ୍ଷିତ ରଖନ୍ତୁ |'
    },
    howToGet: {
      en: 'Enroll at pmfby.gov.in, via your bank branch, or at local CSC centers before the seasonal cutoff date.',
      hi: 'सीजन की अंतिम तिथि से पहले pmfby.gov.in पर, बैंक शाखा या सीएससी केंद्र पर आवेदन करें।',
      or: 'pmfby.gov.in କିମ୍ବା ବ୍ୟାଙ୍କ ଶାଖାରେ ନିର୍ଦ୍ଧାରିତ ତାରିଖ ପୂର୍ବରୁ ଆବେଦନ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['All landholding and tenant farmers cultivating notified crops.'],
      hi: ['अधिसूचित फसलें उगाने वाले सभी भूमिधारक और बटाईदार किसान।'],
      or: ['ଚାଷୀ ଏବଂ ଭାଗଚାଷୀମାନେ |']
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'Identity proof', hi: 'पहचान प्रमाण', or: 'ପରିଚୟ ପତ୍ର' } },
      { name: 'Land Record / LPC', desc: { en: 'Land Possession Certificate', hi: 'भूमि कब्जा प्रमाण पत्र', or: 'ଜମି ପଟ୍ଟା / ଚାଷ ପ୍ରମାଣପତ୍ର' } },
      { name: 'Sowing Certificate', desc: { en: 'Crop sowing proof', hi: 'बुआई प्रमाण पत्र', or: 'ବିହନ ବୁଣା ପ୍ରମାଣପତ୍ର' } }
    ]
  },
  {
    id: 'nmmss',
    name: 'National Means-cum-Merit Scholarship (NMMSS)',
    category: 'Education',
    state: 'All States',
    official_link: 'https://scholarships.gov.in/',
    description: {
      en: 'Scholarship of ₹12,000 per year to meritorious students of economically weaker sections from Class 9 to 12.',
      hi: 'आर्थिक रूप से कमजोर वर्ग के मेधावी छात्रों को कक्षा 9 से 12 तक प्रति वर्ष ₹12,000 की छात्रवृत्ति।',
      or: 'ମେଧାବୀ ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ ନବମ ରୁ ଦ୍ୱାଦଶ ଶ୍ରେଣୀ ପର୍ଯ୍ୟନ୍ତ ବାର୍ଷିକ ୧୨,୦୦୦ ଟଙ୍କା ଛାତ୍ରବୃତ୍ତି |'
    },
    benefits: {
      en: '₹12,000 per annum (₹1,000/month) transferred directly to the student\'s bank account.',
      hi: '₹12,000 प्रति वर्ष सीधे छात्र के बैंक खाते में स्थानांतरित।',
      or: 'ପ୍ରତିବର୍ଷ ୧୨,୦୦୦ ଟଙ୍କା ସିଧାସଳଖ ଛାତ୍ରଙ୍କ ବ୍ୟାଙ୍କ ଖାତାକୁ |'
    },
    eligibilityCriteria: {
      en: ['Class 9 students with family income <= ₹3.5 Lakh per annum and minimum 55% in Class 8.'],
      hi: ['कक्षा 8 में न्यूनतम 55% अंक और ₹3.5 लाख से कम वार्षिक पारिवारिक आय वाले कक्षा 9 के छात्र।'],
      or: ['ଅଷ୍ଟମ ଶ୍ରେଣୀରେ ୫୫% ମାର୍କ ଏବଂ ପାରିବାରିକ ଆୟ ୩.୫ ଲକ୍ଷରୁ କମ୍ ଥିବା ଛାତ୍ରଛାତ୍ରୀ |']
    },
    simpleDescription: {
      en: 'Scholarship giving ₹12,000 every year to help meritorious students finish high school.',
      hi: 'मेधावी छात्रों को हाई स्कूल पूरा करने में मदद करने के लिए हर साल ₹12,000 की छात्रवृत्ति।',
      or: 'ମେଧାବୀ ଛାତ୍ରଛାତ୍ରୀଙ୍କୁ ପାଠପଢା ଜାରି ରଖିବା ପାଇଁ ପ୍ରତିବର୍ଷ ୧୨,୦୦୦ ଟଙ୍କା ସହାୟତା |'
    },
    howToGet: {
      en: 'Apply online on the National Scholarship Portal (scholarships.gov.in).',
      hi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in) पर ऑनलाइन आवेदन करें।',
      or: 'ନ୍ୟାସନାଲ ସ୍କଲାରସିପ୍ ପୋର୍ଟାଲ୍ (scholarships.gov.in) ରେ ଆବେଦନ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['Meritorious students in government/aided schools from low-income families.'],
      hi: ['सरकारी/सहायता प्राप्त स्कूलों में पढ़ने वाले कम आय वाले मेधावी छात्र।'],
      or: ['ସରକାରୀ ବିଦ୍ୟାଳୟର ସ୍ୱଳ୍ପ ଆୟକାରୀ ମେଧାବୀ ଛାତ୍ରଛାତ୍ରୀ |']
    },
    requiredDocs: [
      { name: 'Class 8 Marksheet', desc: { en: 'Academic proof', hi: 'अंकतालिका', or: 'ମାର୍କସିଟ୍' } },
      { name: 'Income Certificate', desc: { en: 'Family income certificate', hi: 'आय प्रमाण पत्र', or: 'ଆୟ ପ୍ରମାଣପତ୍ର' } },
      { name: 'Aadhaar Card', desc: { en: 'Identity proof', hi: 'पहचान प्रमाण', or: 'ପରିଚୟ ପତ୍ର' } }
    ]
  },
  {
    id: 'student-scholarship',
    name: 'State Post-Matric & Higher Education Scholarship',
    category: 'Education',
    state: 'All States',
    official_link: 'https://scholarships.gov.in/',
    description: {
      en: 'Tuition reimbursement and maintenance allowance for post-secondary and college students from low-income families.',
      hi: 'कम आय वाले परिवारों के कॉलेज और उच्च शिक्षा के छात्रों के लिए ट्यूशन फीस प्रतिपूर्ति और वजीफा।',
      or: 'ସ୍ୱଳ୍ପ ଆୟକାରୀ ପରିବାରର ଉଚ୍ଚଶିକ୍ଷା ଓ କଲେଜ ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ ଶିକ୍ଷା ବୃତ୍ତି |'
    },
    benefits: {
      en: 'Full reimbursement of college tuition fees plus monthly living stipend.',
      hi: 'कॉलेज ट्यूशन फीस की पूरी प्रतिपूर्ति और मासिक जीवन निर्वाह भत्ता।',
      or: 'ସମ୍ପୂର୍ଣ୍ଣ କଲେଜ ଫିସ୍ ଛାଡ଼ ଏବଂ ମାସିକ ଖର୍ଚ୍ଚ ସହାୟତା |'
    },
    eligibilityCriteria: {
      en: ['Enrolled in recognized college/university with family income <= ₹2.5 Lakh per year.'],
      hi: ['मान्यता प्राप्त कॉलेज/विश्वविद्यालय में नामांकित छात्र जिनकी वार्षिक पारिवारिक आय <= ₹2.5 लाख है।'],
      or: ['ପାରିବାରିକ ଆୟ ୨.୫ ଲକ୍ଷରୁ କମ୍ ଥିବା କଲେଜ ଛାତ୍ରଛାତ୍ରୀ |']
    },
    simpleDescription: {
      en: 'The government pays your college fees and books if your family income is under ₹2.5 Lakh.',
      hi: 'यदि आपकी पारिवारिक आय ₹2.5 लाख से कम है तो सरकार आपकी कॉलेज फीस और किताबों का खर्च वहन करेगी।',
      or: 'ପାରିବାରିକ ଆୟ ୨.୫ ଲକ୍ଷରୁ କମ୍ ଥିଲେ ସରକାର ଆପଣଙ୍କ କଲେଜ ଫିସ୍ ବହନ କରିବେ |'
    },
    howToGet: {
      en: 'Register on your State Scholarship Portal or NSP at scholarships.gov.in.',
      hi: 'अपने राज्य छात्रवृत्ति पोर्टल या एनएसपी (scholarships.gov.in) पर पंजीकरण करें।',
      or: 'ରାଜ୍ୟ ସ୍କଲାରସିପ୍ ପୋର୍ଟାଲ୍ କିମ୍ବା scholarships.gov.in ରେ ପଞ୍ଜୀକରଣ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['Undergraduate, postgraduate, and diploma students.'],
      hi: ['स्नातक, स्नातकोत्तर और डिप्लोमा के छात्र।'],
      or: ['କଲେଜ ଏବଂ ଡିପ୍ଲୋମା ଛାତ୍ରଛାତ୍ରୀ |']
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'Identity proof', hi: 'पहचान प्रमाण', or: 'ପରିଚୟ ପତ୍ର' } },
      { name: 'Income Certificate', desc: { en: 'Revenue income certificate', hi: 'आय प्रमाण पत्र', or: 'ଆୟ ପ୍ରମାଣପତ୍ର' } },
      { name: 'College Admission Receipt', desc: { en: 'Active study proof', hi: 'दाखिला रसीद', or: 'କଲେଜ ଆଡମିଶନ ରସିଦ' } }
    ]
  },
  {
    id: 'pmegp',
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    category: 'Employment & Business',
    state: 'All States',
    official_link: 'https://www.kviconline.gov.in/pmegpeportal/',
    description: {
      en: 'Credit-linked subsidy program providing up to 35% government subsidy for starting new micro-enterprises in manufacturing or service sector.',
      hi: 'विनिर्माण या सेवा क्षेत्र में नए सूक्ष्म उद्यम शुरू करने के लिए 35% तक सरकारी सब्सिडी प्रदान करने वाला कार्यक्रम।',
      or: 'ନୂତନ ବ୍ୟବସାୟ ବା ଉଦ୍ୟୋଗ ଆରମ୍ଭ କରିବା ପାଇଁ ୩୫% ପର୍ଯ୍ୟନ୍ତ ସରକାରୀ ସବସିଡି ଯୋଜନା |'
    },
    benefits: {
      en: 'Bank loans up to ₹50 Lakh (Manufacturing) / ₹20 Lakh (Service) with 15%–35% government subsidy.',
      hi: '15%–35% सरकारी सब्सिडी के साथ ₹50 लाख (विनिर्माण) / ₹20 लाख (सेवा) तक का बैंक ऋण।',
      or: '୩୫% ପର୍ଯ୍ୟନ୍ତ ସବସିଡି ସହିତ ୫୦ ଲକ୍ଷ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ ବ୍ୟାଙ୍କ ଋଣ |'
    },
    eligibilityCriteria: {
      en: ['Any individual above 18 years of age. At least Class 8 pass for projects over ₹10 Lakh in manufacturing.'],
      hi: ['18 वर्ष से अधिक आयु का कोई भी व्यक्ति। विनिर्माण में ₹10 लाख से अधिक की परियोजनाओं के लिए 8वीं पास।'],
      or: ['୧୮ ବର୍ଷରୁ ଅଧିକ ବୟସର ଯେକୌଣସି ବ୍ୟକ୍ତି |']
    },
    simpleDescription: {
      en: 'Get a government-subsidized loan up to ₹50 Lakh to start your own shop, factory, or business.',
      hi: 'अपनी दुकान, कारखाना या व्यवसाय शुरू करने के लिए ₹50 लाख तक का सब्सिडी वाला ऋण प्राप्त करें।',
      or: 'ନିଜର ବ୍ୟବସାୟ ଆରମ୍ଭ କରିବାକୁ ସରକାରୀ ସବସିଡି ସହିତ ଋଣ ପାଆନ୍ତୁ |'
    },
    howToGet: {
      en: 'Apply online through the PMEGP e-Portal at kviconline.gov.in/pmegpeportal.',
      hi: 'kviconline.gov.in/pmegpeportal पर PMEGP ई-पोर्टल के माध्यम से ऑनलाइन आवेदन करें।',
      or: 'kviconline.gov.in/pmegpeportal ରେ ଅନଲାଇନ୍ ଆବେଦନ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['Aspiring entrepreneurs, self-help groups, unemployed youth.'],
      hi: ['उद्यमी, स्वयं सहायता समूह, बेरोजगार युवा।'],
      or: ['ନୂତନ ଉଦ୍ୟୋଗୀ ଏବଂ ବେକାର ଯୁବକଯୁବତୀ |']
    },
    requiredDocs: [
      { name: 'Aadhaar & PAN Card', desc: { en: 'Identity & tax proof', hi: 'पहचान और पैन कार्ड', or: 'ଆଧାର ଓ ପ୍ୟାନ୍ କାର୍ଡ' } },
      { name: 'Project Report', desc: { en: 'Business plan summary', hi: 'बिजनेस प्लान रिपोर्ट', or: 'ବ୍ୟବସାୟ ଯୋଜନା ରିପୋର୍ଟ' } },
      { name: 'Education Certificate', desc: { en: 'Class 8 or higher marksheet', hi: 'शैक्षिक प्रमाण पत्र', or: 'ଶିକ୍ଷାଗତ ପ୍ରମାଣପତ୍ର' } }
    ]
  },
  {
    id: 'pmmy',
    name: 'Pradhan Mantri Mudra Yojana (PMMY)',
    category: 'Employment & Business',
    state: 'All States',
    official_link: 'https://www.mudra.org.in/',
    description: {
      en: 'Collateral-free business loans up to ₹10 Lakh for small, micro, and retail enterprises under Shishu, Kishore, and Tarun categories.',
      hi: 'शिशु, किशोर और तरुण श्रेणियों के तहत छोटे, सूक्ष्म और खुदरा उद्यमों के लिए ₹10 लाख तक का संपार्श्विक-मुक्त ऋण।',
      or: 'କ୍ଷୁଦ୍ର ଏବଂ ମଧ୍ୟମ ବ୍ୟବସାୟୀଙ୍କ ପାଇଁ ୧୦ ଲକ୍ଷ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ ବିନା ବନ୍ଧକରେ ମୁଦ୍ରା ଋଣ |'
    },
    benefits: {
      en: 'Loans up to ₹50,000 (Shishu), up to ₹5 Lakh (Kishore), and up to ₹10 Lakh (Tarun) without collateral.',
      hi: 'बिना किसी गारंटी के ₹50,000 (शिशु), ₹5 लाख (किशोर), और ₹10 लाख (तरुण) तक का ऋण।',
      or: 'ବିନା କୌଣସି ଗ୍ୟାରେଣ୍ଟିରେ ୧୦ ଲକ୍ଷ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ ବ୍ୟବସାୟ ଋଣ |'
    },
    eligibilityCriteria: {
      en: ['Any Indian citizen with a business plan for non-farm income-generating activity.'],
      hi: ['गैर-कृषि आय सृजन गतिविधि के लिए व्यावसायिक योजना वाला कोई भी भारतीय नागरिक।'],
      or: ['ବ୍ୟବସାୟ କରୁଥିବା ଯେକୌଣସି ଭାରତୀୟ ନାଗରିକ |']
    },
    simpleDescription: {
      en: 'Get loans up to ₹10 Lakh from banks without needing to mortgage any property.',
      hi: 'किसी भी संपत्ति को गिरवी रखे बिना बैंकों से ₹10 लाख तक का व्यावसायिक ऋण प्राप्त करें।',
      or: 'ବିନା ବନ୍ଧକରେ ବ୍ୟାଙ୍କରୁ ୧୦ ଲକ୍ଷ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ ବ୍ୟବସାୟ ଋଣ ପାଆନ୍ତୁ |'
    },
    howToGet: {
      en: 'Apply through any commercial bank, RRB, small finance bank, or online at udyamimitra.in / mudra.org.in.',
      hi: 'किसी भी वाणिज्यिक बैंक, ग्रामीण बैंक या udyamimitra.in / mudra.org.in पर ऑनलाइन आवेदन करें।',
      or: 'ଯେକୌଣସି ବ୍ୟାଙ୍କ ଶାଖାରେ କିମ୍ବା udyamimitra.in ରେ ଆବେଦନ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['Shopkeepers, artisans, street vendors, small manufacturers, service businesses.'],
      hi: ['दुकानदार, कारीगर, छोटे निर्माता, सेवा व्यवसायी।'],
      or: ['ଦୋକାନୀ, କାରିଗର ଏବଂ କ୍ଷୁଦ୍ର ବ୍ୟବସାୟୀ |']
    },
    requiredDocs: [
      { name: 'Identity Proof', desc: { en: 'Aadhaar / Voter ID / PAN', hi: 'आधार / वोटर आईडी / पैन', or: 'ଆଧାର କିମ୍ବା ପ୍ୟାନ୍ କାର୍ଡ' } },
      { name: 'Business Address Proof', desc: { en: 'Rent agreement / Shop license', hi: 'दुकान या व्यापार का पता प्रमाण', or: 'ବ୍ୟବସାୟ ଠିକଣା ପ୍ରମାଣ' } }
    ]
  },
  {
    id: 'pmay-u',
    name: 'Pradhan Mantri Awas Yojana (Urban) – PMAY-U',
    category: 'Housing',
    state: 'All States',
    official_link: 'https://pmaymis.gov.in/',
    description: {
      en: 'Housing for All in urban areas providing financial assistance and interest subsidy up to ₹2.67 Lakh for building or buying a pucca house.',
      hi: 'शहरी क्षेत्रों में पक्का मकान बनाने या खरीदने के लिए ₹2.67 लाख तक की वित्तीय सहायता और ब्याज सब्सिडी।',
      or: 'ସହରାଞ୍ଚଳରେ ପକ୍କା ଘର ନିର୍ମାଣ ବା କ୍ରୟ ପାଇଁ ୨.୬୭ ଲକ୍ଷ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ ସରକାରୀ ସହାୟତା |'
    },
    benefits: {
      en: 'Interest subsidy up to 6.5% on home loans or direct grant of ₹1.5 Lakh for house construction.',
      hi: 'गृह ऋण पर 6.5% तक की ब्याज सब्सिडी या मकान निर्माण के लिए ₹1.5 लाख का सीधा अनुदान।',
      or: 'ଗୃହ ଋଣ ଉପରେ ୬.୫% ପର୍ଯ୍ୟନ୍ତ ସୁଧ ରିହାତି ଏବଂ ଆର୍ଥିକ ସହାୟତା |'
    },
    eligibilityCriteria: {
      en: ['EWS/LIG families with annual income <= ₹6 Lakh who do not own a pucca house anywhere in India.'],
      hi: ['₹6 लाख तक की वार्षिक आय वाले ईडब्ल्यूएस/एलआईजी परिवार जिनके पास भारत में कहीं भी पक्का मकान नहीं है।'],
      or: ['ପାରିବାରିକ ଆୟ ୬ ଲକ୍ଷରୁ କମ୍ ଏବଂ କୌଣସି ପକ୍କା ଘର ନଥିବା ପରିବାର |']
    },
    simpleDescription: {
      en: 'Get up to ₹2.67 Lakh government help to build or buy your first house in a city.',
      hi: 'शहर में अपना पहला पक्का घर बनाने या खरीदने के लिए ₹2.67 लाख तक की सरकारी मदद पाएं।',
      or: 'ସହରରେ ପକ୍କା ଘର ତିଆରି କରିବା ପାଇଁ ସରକାରଙ୍କ ତରଫରୁ ୨.୬୭ ଲକ୍ଷ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ ସହାୟତା |'
    },
    howToGet: {
      en: 'Apply online on pmaymis.gov.in or through your local municipal corporation / ULB office.',
      hi: 'pmaymis.gov.in पर ऑनलाइन या अपने स्थानीय नगर निगम / नगर पालिका कार्यालय में आवेदन करें।',
      or: 'pmaymis.gov.in କିମ୍ବା ସ୍ଥାନୀୟ ମ୍ୟୁନିସିପାଲିଟି ଅଫିସରେ ଆବେଦନ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['Urban families in EWS / LIG brackets without an existing pucca house.'],
      hi: ['शहरी परिवार जिनके पास पहले से कोई पक्का मकान नहीं है।'],
      or: ['ସହରାଞ୍ଚଳର ପକ୍କା ଘର ନଥିବା ଗରିବ ପରିବାର |']
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'Identity proof', hi: 'पहचान प्रमाण', or: 'ପରିଚୟ ପତ୍ର' } },
      { name: 'Income Certificate', desc: { en: 'Salary slip / Revenue certificate', hi: 'आय प्रमाण पत्र', or: 'ଆୟ ପ୍ରମାଣପତ୍ର' } },
      { name: 'Affidavit', desc: { en: 'No pucca house declaration', hi: 'पक्का मकान न होने का शपथ पत्र', or: 'ଘର ନଥିବା ସତ୍ୟପାଠ' } }
    ]
  },
  {
    id: 'pmay-g',
    name: 'Pradhan Mantri Awas Yojana (Gramin) – PMAY-G',
    category: 'Housing',
    state: 'All States',
    official_link: 'https://pmayg.nic.in/',
    description: {
      en: 'Financial assistance of ₹1.20 Lakh in plains and ₹1.30 Lakh in hilly/difficult areas for construction of a hygienic pucca house in rural areas.',
      hi: 'ग्रामीण क्षेत्रों में पक्के मकान के निर्माण के लिए मैदानी इलाकों में ₹1.20 लाख और पहाड़ी/कठिन क्षेत्रों में ₹1.30 लाख की वित्तीय सहायता।',
      or: 'ଗ୍ରାମାଞ୍ଚଳରେ ପକ୍କା ଘର ନିର୍ମାଣ ପାଇଁ ୧.୨୦ ଲକ୍ଷ ଟଙ୍କାର ଆର୍ଥିକ ସହାୟତା |'
    },
    benefits: {
      en: 'Direct grant of ₹1,20,000 to ₹1,30,000 plus 90–95 days of unskilled labor wages under MGNREGA.',
      hi: '₹1,20,000 से ₹1,30,000 का सीधा अनुदान और मनरेगा के तहत 90-95 दिनों की मजदूरी।',
      or: '୧.୨୦ ଲକ୍ଷ ଟଙ୍କା ସହାୟତା ସହିତ ମନରେଗା ମାଧ୍ୟମରେ ମଜୁରୀ |'
    },
    eligibilityCriteria: {
      en: ['Houseless families or households living in kutcha/dilapidated houses in rural areas listed in SECC.'],
      hi: ['ग्रामीण क्षेत्रों में कच्चे/जीर्ण-शीर्ण घरों में रहने वाले बेघर परिवार।'],
      or: ['ଗ୍ରାମାଞ୍ଚଳରେ କଚ୍ଚା ଘରେ ରହୁଥିବା ଗରିବ ପରିବାର |']
    },
    simpleDescription: {
      en: 'The government gives ₹1.20 Lakh directly to your bank account to build a pucca house in your village.',
      hi: 'गांव में पक्का घर बनाने के लिए सरकार सीधे आपके बैंक खाते में ₹1.20 लाख देती है।',
      or: 'ଗାଁରେ ପକ୍କା ଘର ତିଆରି କରିବା ପାଇଁ ସରକାର ସିଧାସଳଖ ବ୍ୟାଙ୍କ ଖାତାରେ ୧.୨୦ ଲକ୍ଷ ଟଙ୍କା ଦିଅନ୍ତି |'
    },
    howToGet: {
      en: 'Beneficiary lists are finalized by Gram Sabha. Contact your Gram Panchayat or BDO office.',
      hi: 'ग्राम सभा द्वारा लाभार्थी सूची को अंतिम रूप दिया जाता है। अपनी ग्राम पंचायत या बीडीओ कार्यालय से संपर्क करें।',
      or: 'ଗ୍ରାମ ପଞ୍ଚାୟତ କିମ୍ବା ବିଡ଼ିଓ (BDO) ଅଫିସ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['Rural homeless households or families living in zero/one/two room kutcha houses.'],
      hi: ['कच्चे मकानों में रहने वाले ग्रामीण गरीब परिवार।'],
      or: ['ଗ୍ରାମାଞ୍ଚଳର ବାସହୀନ ପରିବାର |']
    },
    requiredDocs: [
      { name: 'Aadhaar Card', desc: { en: 'Identity proof', hi: 'पहचान प्रमाण', or: 'ପରିଚୟ ପତ୍ର' } },
      { name: 'MGNREGA Job Card', desc: { en: 'Job card number', hi: 'मनरेगा जॉब कार्ड', or: 'ମନରେଗା ଜବ୍ କାର୍ଡ' } },
      { name: 'Bank Passbook', desc: { en: 'Bank account details', hi: 'बैंक खाता विवरण', or: 'ବ୍ୟାଙ୍କ ପାସବୁକ୍' } }
    ]
  },
  {
    id: 'teacher-welfare',
    name: 'National Teacher Welfare Fund',
    category: 'Education & Welfare',
    state: 'Delhi',
    official_link: 'https://edudel.nic.in/',
    description: {
      en: 'Welfare scheme providing financial relief and medical assistance to school teachers in distress.',
      hi: 'संकटग्रस्त स्कूली शिक्षकों को वित्तीय राहत और चिकित्सा सहायता प्रदान करने वाली कल्याणकारी योजना।',
      or: 'ସ୍କୁଲ ଶିକ୍ଷକମାନଙ୍କୁ ଆର୍ଥିକ ଓ ଚିକିତ୍ସା ସହାୟତା ପାଇଁ କଲ୍ୟାଣ ପାଣ୍ଠି |'
    },
    benefits: {
      en: 'Financial aid of up to ₹50,000 for medical emergencies or children higher education.',
      hi: 'चिकित्सा आपात स्थिति या बच्चों की उच्च शिक्षा के लिए ₹50,000 तक की वित्तीय सहायता।',
      or: 'ଚିକିତ୍ସା କିମ୍ବା ଉଚ୍ଚଶିକ୍ଷା ପାଇଁ ୫୦,୦୦୦ ଟଙ୍କା ପର୍ଯ୍ୟନ୍ତ ସହାୟତା |'
    },
    eligibilityCriteria: {
      en: ['Employed as a school teacher in recognized schools with at least 3 years of service.'],
      hi: ['कम से कम 3 साल की सेवा के साथ मान्यता प्राप्त स्कूलों में कार्यरत शिक्षक।'],
      or: ['କମ୍ ସେ କମ୍ ୩ ବର୍ଷ କାର୍ଯ୍ୟରତ ଥିବା ସ୍କୁଲ ଶିକ୍ଷକ |']
    },
    simpleDescription: {
      en: 'Special support fund giving financial aid to teachers facing emergencies.',
      hi: 'आपात स्थिति का सामना कर रहे शिक्षकों को वित्तीय सहायता देने वाला विशेष सहायता कोष।',
      or: 'ଜରୁରୀ ପରିସ୍ଥିତିରେ ଶିକ୍ଷକମାନଙ୍କୁ ସହାୟତା ପ୍ରଦାନ କରୁଥିବା ସ୍ୱତନ୍ତ୍ର ପାଣ୍ଠି |'
    },
    howToGet: {
      en: 'Submit application endorsed by School Principal to Directorate of Education (edudel.nic.in).',
      hi: 'स्कूल प्रिंसिपल द्वारा सत्यापित आवेदन शिक्षा निदेशालय को जमा करें।',
      or: 'ପ୍ରିନ୍ସିପାଲଙ୍କ ସୁପାରିଶ ସହିତ ଶିକ୍ଷା ବିଭାଗରେ ଆବେଦନ କରନ୍ତୁ |'
    },
    whoCanGet: {
      en: ['School teachers in verified financial or medical distress.'],
      hi: ['वित्तीय या चिकित्सा संकट का सामना कर रहे स्कूली शिक्षक।'],
      or: ['ସମସ୍ୟାରେ ଥିବା ସ୍କୁଲ ଶିକ୍ଷକମାନେ |']
    },
    requiredDocs: [
      { name: 'Employment ID Card', desc: { en: 'Teacher ID proof', hi: 'शिक्षक पहचान प्रमाण', or: 'ଶିକ୍ଷକ ପରିଚୟ ପତ୍ର' } },
      { name: 'Salary Slip', desc: { en: 'Income slip', hi: 'वेतन पर्ची', or: 'ଦରମା ରସିଦ' } }
    ]
  }
];
