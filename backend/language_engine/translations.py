# -*- coding: utf-8 -*-
from typing import Dict, Any

SCHEME_EXPLANATIONS: Dict[str, Dict[str, Dict[str, Any]]] = {
    "pmjay": {
        "en": {
            "title": "Free Healthcare Insurance (Ayushman Bharat)",
            "explanation": "This scheme gives you and your family free hospital treatment up to ₹5 Lakh every year. It is meant to help poor and low-income families get treatment without worrying about money.",
            "how_to_get": "You can get treatment at any government hospital and selected private hospitals. An 'Ayushman Card' will be issued to your family.",
            "who_can_get": "Poor families, unorganized workers, and low-income households. Institutional employees or high taxpayers are not eligible.",
            "missing_prompt": "We need your family ration card details or SECC list status to check if your family is registered."
        },
        "hi": {
            "title": "मुफ़्त स्वास्थ्य बीमा (आयुष्मान भारत)",
            "explanation": "यह योजना आपको और आपके परिवार को हर साल ₹5 लाख तक का मुफ्त अस्पताल इलाज देती है। इसका उद्देश्य गरीब और कम आय वाले परिवारों को बिना पैसों की चिंता किए इलाज में मदद करना है।",
            "how_to_get": "आप किसी भी सरकारी अस्पताल और चुनिंदा निजी अस्पतालों में इलाज करा सकते हैं। आपके परिवार को एक 'आयुष्मान कार्ड' दिया जाएगा।",
            "who_can_get": "गरीब परिवार, असंगठित मजदूर और कम आय वाले परिवार। सरकारी नौकरी वाले या टैक्स भरने वाले इसके पात्र नहीं हैं।",
            "missing_prompt": "हमें यह जांचने के लिए आपके परिवार के राशन कार्ड या SECC सूची की स्थिति की आवश्यकता है कि आपका परिवार पंजीकृत है या नहीं।"
        },
        "or": {
            "title": "ମାଗଣା ସ୍ୱାସ୍ଥ୍ୟ ବୀମା (ଆୟୁଷ୍ମାନ ଭାରତ)",
            "explanation": "ଏହି ଯୋଜନା ଆପଣଙ୍କୁ ଏବଂ ଆପଣଙ୍କ ପରିବାରକୁ ପ୍ରତିବର୍ଷ ₹୫ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ ମାଗଣା ଚିକିତ୍ସା ସୁବିଧା ଦେଇଥାଏ | ଏହାର ଉଦ୍ଦେଶ୍ୟ ହେଉଛି ଗରିବ ପରିବାରକୁ ବିନା ପଇସା ଚିନ୍ତାରେ ଚିକିତ୍ସା କରାଇବାରେ ସାହାଯ୍ୟ କରିବା |",
            "how_to_get": "ଆପଣ ଯେକୌଣସି ସରକାରୀ ଏବଂ ମନୋନୀତ ବେସରକାରୀ ହସ୍ପିଟାଲରେ ଚିକିତ୍ସା କରାଇପାରିବେ | ଆପଣଙ୍କ ପରିବାରକୁ ଏକ 'ଆୟୁଷ୍ମାନ କାର୍ଡ' ପ୍ରଦାନ କରାଯିବ |",
            "who_can_get": "ଗରିବ ପରିବାର, ଅସଂଗଠିତ ଶ୍ରମିକ ଏବଂ କମ୍ ଆୟକାରୀ ପରିବାର |",
            "missing_prompt": "ଆପଣଙ୍କର ରାସନ କାର୍ଡ କିମ୍ବା SECC ତାଲିକା ଯାଞ୍ଚ କରିବା ଆବଶ୍ୟକ |"
        }
    },
    "pmjjby": {
        "en": {
            "title": "Government Life Insurance Scheme (PMJJBY)",
            "explanation": "This is a low-cost life insurance scheme. If the insured person unfortunately passes away, the family receives financial support of ₹2 Lakh.",
            "how_to_get": "The premium of ₹436 is automatically deducted from your linked bank account once a year.",
            "who_can_get": "Any person aged between 18 and 50 years who has a bank account.",
            "missing_prompt": "Please link your savings bank account and submit the auto-debit consent form."
        },
        "hi": {
            "title": "सरकारी जीवन बीमा योजना (PMJJBY)",
            "explanation": "यह एक बहुत ही कम खर्च वाली जीवन बीमा योजना है। यदि बीमाधारक व्यक्ति की किसी कारणवश मृत्यु हो जाती है, तो उनके परिवार को ₹2 लाख की आर्थिक सहायता मिलती है।",
            "how_to_get": "साल में एक बार ₹436 की किस्त आपके बैंक खाते से अपने आप कट जाती है।",
            "who_can_get": "18 से 50 वर्ष की आयु का कोई भी व्यक्ति जिसके पास बैंक खाता हो।",
            "missing_prompt": "कृपया अपना बचत बैंक खाता लिंक करें और ऑटो-डेबिट सहमति फॉर्म जमा करें।"
        },
        "or": {
            "title": "ସରକାରୀ ଜୀବନ ବୀମା ଯୋଜନା (PMJJBY)",
            "explanation": "ଏହା ଏକ କମ୍ ଖର୍ଚ୍ଚର ଜୀବନ ବୀମା ଯୋଜନା | ଯଦି ବୀମାଭୁକ୍ତ ବ୍ୟକ୍ତିଙ୍କର ମୃତ୍ୟୁ ହୁଏ, ତେବେ ପରିବାରକୁ ₹୨ ଲକ୍ଷର ଆର୍ଥିକ ସହାୟତା ମିଳିଥାଏ |",
            "how_to_get": "ବର୍ଷକୁ ଥରେ ₹୪୩୬ ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତାରୁ ଆପେ ଆପେ କଟିଯିବ |",
            "who_can_get": "୧୮ ରୁ ୫୦ ବର୍ଷ ବୟସର ଯେକୌଣସି ବ୍ୟକ୍ତି ଯାହାଙ୍କର ବ୍ୟାଙ୍କ ଖାତା ଅଛି |",
            "missing_prompt": "ଦୟାକରି ଆପଣଙ୍କର ବ୍ୟାଙ୍କ ସଞ୍ଚୟ ଖାତା ସହିତ ଅଟୋ-ଡେବିଟ୍ ସମ୍ମତି ପ୍ରଦାନ କରନ୍ତୁ |"
        }
    },
    "pmsby": {
        "en": {
            "title": "Accident Insurance Scheme (PMSBY)",
            "explanation": "This scheme gives accident insurance at an extremely low cost (just ₹20 per year). If an accident causes death or permanent disability, ₹2 Lakh is paid to the family.",
            "how_to_get": "You can enroll through your bank. A small yearly premium of ₹20 is auto-debited from your bank account.",
            "who_can_get": "All individuals between the ages of 18 and 70 years who have a bank account.",
            "missing_prompt": "We need to verify if you have an active savings bank account for auto-debit."
        },
        "hi": {
            "title": "दुर्घटना बीमा योजना (PMSBY)",
            "explanation": "यह योजना बहुत ही कम खर्च (केवल ₹20 प्रति वर्ष) पर दुर्घटना बीमा प्रदान करती है। यदि दुर्घटना में मृत्यु या स्थायी विकलांगता हो जाती है, तो परिवार को ₹2 लाख का भुगतान किया जाता है।",
            "how_to_get": "आप अपने बैंक के माध्यम से पंजीकरण करा सकते हैं। ₹20 का छोटा वार्षिक प्रीमियम आपके खाते से अपने आप कट जाता है।",
            "who_can_get": "18 से 70 वर्ष की आयु के सभी व्यक्ति जिनके पास एक बैंक खाता है।",
            "missing_prompt": "हमें यह जांचने की आवश्यकता है कि क्या आपके पास ऑटो-डेबिट के लिए एक सक्रिय बचत बैंक खाता है।"
        },
        "or": {
            "title": "ଦୁର୍ଘଟଣା ବୀମା ଯୋଜନା (PMSBY)",
            "explanation": "ଏହି ଯୋଜନା ଅତି କମ୍ ଖର୍ଚ୍ଚରେ (ବର୍ଷକୁ ମାତ୍ର ₹୨୦) ଦୁର୍ଘଟଣା ବୀମା ପ୍ରଦାନ କରେ | ଯଦି ଦୁର୍ଘଟଣା ଯୋଗୁଁ ମୃତ୍ୟୁ କିମ୍ବା ସମ୍ପୂର୍ଣ୍ଣ ଅକ୍ଷମତା ହୁଏ, ତେବେ ପରିବାରକୁ ₹୨ ଲକ୍ଷ ଦିଆଯାଏ |",
            "how_to_get": "ଆପଣ ନିଜ ବ୍ୟାଙ୍କ ଜରିଆରେ ଏଥିରେ ଯୋଗ ଦେଇପାରିବେ | ବାର୍ଷିକ ₹୨୦ କିସ୍ତି ବ୍ୟାଙ୍କ ଖାତାରୁ କଟିବ |",
            "who_can_get": "୧୮ ରୁ ୭୦ ବର୍ଷ ବୟସର ସମସ୍ତ ବ୍ୟକ୍ତି ଯାହାଙ୍କର ବ୍ୟାଙ୍କ ସଞ୍ଚୟ ଖାତା ଅଛି |",
            "missing_prompt": "ଆପଣଙ୍କର ସଞ୍ଚୟ ବ୍ୟାଙ୍କ ଖାତା ଯାଞ୍ଚ କରିବା ଆବଶ୍ୟକ |"
        }
    },
    "pm-kisan": {
        "en": {
            "title": "Farmer Income Support (PM-KISAN)",
            "explanation": "This scheme provides financial help to farmers. The government deposits ₹6,000 every year directly into the bank accounts of land-owning farmers.",
            "how_to_get": "The money is sent in three parts of ₹2,000 each, once every four months.",
            "who_can_get": "Farmers who own cultivable land in their names. Higher professionals and income taxpayers are excluded.",
            "missing_prompt": "We need your land possession certificate (LPC) or land revenue records to verify ownership."
        },
        "hi": {
            "title": "किसान सम्मान निधि (PM-KISAN)",
            "explanation": "यह योजना किसानों को आर्थिक मदद देती है। सरकार हर साल ₹6,000 सीधे उन किसानों के बैंक खातों में ट्रांसफर करती है जिनके नाम पर खेती की जमीन है।",
            "how_to_get": "यह पैसा हर चार महीने में ₹2,000 की तीन बराबर किश्तों में भेजा जाता है।",
            "who_can_get": "वे किसान जिनके नाम पर खेती योग्य भूमि है। डॉक्टर, इंजीनियर या आयकरदाता किसान इसके पात्र नहीं हैं।",
            "missing_prompt": "स्वामित्व की पुष्टि के लिए हमें आपके भूमि कब्जा प्रमाण पत्र (LPC) या राजस्व रिकॉर्ड की आवश्यकता है।"
        },
        "or": {
            "title": "କୃଷକ ସହାୟତା ନିଧି (PM-KISAN)",
            "explanation": "ଏହି ଯୋଜନା ଚାଷୀମାନଙ୍କୁ ଆର୍ଥିକ ସହାୟତା ପ୍ରଦାନ କରେ | ସରକାର ପ୍ରତିବର୍ଷ ₹୬,୦୦୦ ସିଧାସଳଖ ଚାଷୀଙ୍କ ବ୍ୟାଙ୍କ ଖାତାରେ ଜମା କରନ୍ତି |",
            "how_to_get": "ଏହି ଟଙ୍କା ପ୍ରତି ୪ ମାସରେ ₹୨,୦୦୦ ଲେଖାଏଁ ତିନୋଟି କିସ୍ତିରେ ମିଳିଥାଏ |",
            "who_can_get": "ଯେଉଁ ଚାଷୀଙ୍କ ନାମରେ ଚାଷ ଜମି ଅଛି | ଆୟକର ଦେଉଥିବା ବ୍ୟକ୍ତି ଏଥିରୁ ବାଦ୍ ପଡ଼ିବେ |",
            "missing_prompt": "ଆପଣଙ୍କର ଜମି ମାଲିକାନା ରେକର୍ଡ ଯାଞ୍ଚ କରିବା ଆବଶ୍ୟକ |"
        }
    },
    "pmkmy": {
        "en": {
            "title": "Farmer Monthly Pension Scheme (PMKMY)",
            "explanation": "This is a pension scheme for small farmers. After turning 60 years of age, you will get a guaranteed monthly pension of ₹3,000.",
            "how_to_get": "You contribute a small monthly sum (₹55 to ₹200) depending on your entry age, and the government contributes the same amount.",
            "who_can_get": "Small and marginal farmers aged between 18 and 40 years with cultivable land up to 2 hectares.",
            "missing_prompt": "We need to verify your small/marginal farmer landholding certificate."
        },
        "hi": {
            "title": "किसान पेंशन योजना (PMKMY)",
            "explanation": "यह छोटे किसानों के लिए एक पेंशन योजना है। 60 वर्ष की आयु पूरी करने के बाद, आपको ₹3,000 की मासिक पेंशन की गारंटी मिलेगी।",
            "how_to_get": "आप अपनी प्रवेश आयु के अनुसार हर महीने एक छोटा योगदान (₹55 से ₹200) देते हैं, और इतनी ही राशि सरकार भी देती है।",
            "who_can_get": "18 से 40 वर्ष की आयु वाले छोटे और सीमांत किसान जिनके पास 2 हेक्टेयर तक की खेती योग्य भूमि है।",
            "missing_prompt": "हमें आपके लघु/सीमांत किसान होने के भूमि प्रमाण पत्र की आवश्यकता है।"
        },
        "or": {
            "title": "ଚାଷୀ ପେନସନ ଯୋଜନା (PMKMY)",
            "explanation": "ଏହା ଛୋଟ ଚାଷୀଙ୍କ ପାଇଁ ଏକ ପେନସନ ଯୋଜନା | ୬୦ ବର୍ଷ ବୟସ ପରେ ପ୍ରତିମାସରେ ₹୩,୦00 ପେନସନ ମିଳିବ |",
            "how_to_get": "ଆପଣଙ୍କ ବୟସ ଅନୁସାରେ ମାସିକ ₹୫୫ ରୁ ₹୨୦୦ ଜମା କରିବେ, ସମାନ ପରିମାଣ ସରକାର ମଧ୍ୟ ଦେବେ |",
            "who_can_get": "୧୮ ରୁ ୪୦ ବର୍ଷର ଛୋଟ ଚାଷୀ ଯାହାଙ୍କର ୨ ହେକ୍ଟରରୁ କମ୍ ଚାଷ ଜମି ଅଛି |",
            "missing_prompt": "ଆପଣଙ୍କର କୃଷକ ପ୍ରମାଣପତ୍ର ଓ ଜମି ପରିମାଣ ଯାଞ୍ଚ କରିବା ଆବଶ୍ୟକ |"
        }
    },
    "pmfby": {
        "en": {
            "title": "Crop Insurance Scheme (PMFBY)",
            "explanation": "This scheme protects farmers from crop losses. If your crops are damaged due to natural disasters like floods, droughts, or pests, the insurance pays for your loss.",
            "how_to_get": "Register your crops before the sowing season. You pay a very low premium (1.5% to 5%) and the government pays the rest.",
            "who_can_get": "All farmers growing notified crops in notified areas.",
            "missing_prompt": "We need crop sowing certificate and land location documents."
        },
        "hi": {
            "title": "फसल बीमा योजना (PMFBY)",
            "explanation": "यह योजना किसानों को फसल के नुकसान से बचाती है। यदि बाढ़, सूखे या कीड़ों के कारण आपकी फसल बर्बाद हो जाती है, तो बीमा कंपनी नुकसान की भरपाई करती है।",
            "how_to_get": "बुवाई के मौसम से पहले अपनी फसलों का पंजीकरण कराएं। आप बहुत कम प्रीमियम (1.5% से 5%) देते हैं और बाकी सरकार देती है।",
            "who_can_get": "अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान।",
            "missing_prompt": "हमें फसल बुवाई प्रमाण पत्र और भूमि स्थान के दस्तावेजों की आवश्यकता है।"
        },
        "or": {
            "title": "ଫସଲ ବୀମା ଯୋଜନା (PMFBY)",
            "explanation": "ଏହି ଯୋଜନା ଚାଷୀଙ୍କୁ ଫସଲ ନଷ୍ଟରୁ ସୁରକ୍ଷା ଦିଏ | ଯଦି ବନ୍ୟା, ମରୁଡ଼ି ବା ପୋକ ଯୋଗୁଁ ଫସଲ ନଷ୍ଟ ହୁଏ, ତେବେ ବୀମା ଟଙ୍କା ମିଳିଥାଏ |",
            "how_to_get": "ଫସଲ ବୁଣିବା ପୂର୍ବରୁ ପଞ୍ଜୀକରଣ କରନ୍ତୁ, ଆପଣଙ୍କୁ ବହୁତ କମ୍ ବୀମା କିସ୍ତି ଦେବାକୁ ପଡ଼ିବ |",
            "who_can_get": "ନିର୍ଦ୍ଦିଷ୍ଟ ଅଞ୍ଚଳରେ ଚାଷ କରୁଥିବା ସମସ୍ତ ଚାଷୀ |",
            "missing_prompt": "ଫସଲ ବୁଣା ପ୍ରମାଣପତ୍ର ଓ ବ୍ୟାଙ୍କ ବିବରଣୀ ଆବଶ୍ୟକ |"
        }
    },
    "nmmss": {
        "en": {
            "title": "School Merit Scholarship (NMMSS)",
            "explanation": "This scheme gives a scholarship of ₹12,000 every year to bright students from poor families so they can continue studying after Class 8.",
            "how_to_get": "Apply through the National Scholarship Portal (NSP). Students must pass a merit exam.",
            "who_can_get": "Class 9 students of government schools whose family income is below ₹3.5 Lakh per year.",
            "missing_prompt": "We need Class 9 school enrollment proof and Class 8 marksheet."
        },
        "hi": {
            "title": "स्कूल मेधावी छात्रवृत्ति (NMMSS)",
            "explanation": "यह योजना गरीब परिवारों के होनहार छात्रों को हर साल ₹12,000 की छात्रवृत्ति देती है ताकि वे कक्षा 8 के बाद अपनी पढ़ाई जारी रख सकें।",
            "how_to_get": "राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) के माध्यम से आवेदन करें। छात्रों को एक परीक्षा पास करनी होती है।",
            "who_can_get": "सरकारी स्कूलों के कक्षा 9 के छात्र जिनके परिवार की वार्षिक आय ₹3.5 लाख से कम है।",
            "missing_prompt": "हमें कक्षा 9 में स्कूल पंजीकरण के प्रमाण और कक्षा 8 की अंकतालिका की आवश्यकता है।"
        },
        "or": {
            "title": "ମେଧାବୃତ୍ତି ଯୋଜନା (NMMSS)",
            "explanation": "ଏହି ଯୋଜନା ଗରିବ ପରିବାରର ମେଧାବୀ ଛାତ୍ରଛାତ୍ରୀଙ୍କୁ ପ୍ରତିବର୍ଷ ₹୧୨,୦୦୦ ମେଧାବୃତ୍ତି ଦିଏ ଯେପରି ସେମାନେ ପାଠପଢ଼ା ଜାରି ରଖିପାରିବେ |",
            "how_to_get": "ଜାତୀୟ ସ୍କଲାରସିପ୍ ପୋର୍ଟାଲ୍ (NSP) ମାଧ୍ୟମରେ ଆବେଦନ କରନ୍ତୁ |",
            "who_can_get": "ସରକାରୀ ବିଦ୍ୟାଳୟର ନବମ ଶ୍ରେଣୀ ଛାତ୍ରଛାତ୍ରୀ ଯେଉଁମାନଙ୍କ ପରିବାରର ଆୟ ବର୍ଷକୁ ₹୩.୫ ଲକ୍ଷରୁ କମ୍ |",
            "missing_prompt": "ଅଷ୍ଟମ ଶ୍ରେଣୀ ମାର୍କସିଟ୍ ଏବଂ ନବମ ଶ୍ରେଣୀ ନାମଲେଖା ପ୍ରମାଣପତ୍ର ଆବଶ୍ୟକ |"
        }
    },
    "csss": {
        "en": {
            "title": "College Student Scholarship (CSSS)",
            "explanation": "This scheme provides financial aid to merit students from low-income families to support their college or university expenses.",
            "how_to_get": "Apply online on the National Scholarship Portal (NSP) after your Class 12 board results.",
            "who_can_get": "Regular college students who scored in the top 20% in Class 12 and have a family income under ₹4.5 Lakh.",
            "missing_prompt": "We need your Class 12 marksheet and college admission receipt."
        },
        "hi": {
            "title": "कॉलेज छात्रवृत्ति योजना (CSSS)",
            "explanation": "यह योजना कम आय वाले परिवारों के मेधावी छात्रों को उनके कॉलेज या विश्वविद्यालय के खर्चों में मदद के लिए वित्तीय सहायता प्रदान करती है।",
            "how_to_get": "कक्षा 12 के बोर्ड परिणामों के बाद राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर ऑनलाइन आवेदन करें।",
            "who_can_get": "नियमित कॉलेज के छात्र जिन्होंने कक्षा 12 में शीर्ष 20% अंक प्राप्त किए हैं और पारिवारिक आय ₹4.5 लाख से कम है।",
            "missing_prompt": "हमें आपकी कक्षा 12 की अंकतालिका और कॉलेज में प्रवेश की रसीद की आवश्यकता है।"
        },
        "or": {
            "title": "କଲେଜ ଛାତ୍ରବୃତ୍ତି ଯୋଜନା (CSSS)",
            "explanation": "ଏହି ଯୋଜନା କମ୍ ଆୟକାରୀ ପରିବାରର ମେଧାବୀ ଛାତ୍ରଛାତ୍ରୀଙ୍କୁ କଲେଜ ପାଠପଢ଼ା ଖର୍ଚ୍ଚ ପାଇଁ ଆର୍ଥିକ ସହାୟତା ଦିଏ |",
            "how_to_get": "ଦ୍ୱାଦଶ ଶ୍ରେଣୀ ପରୀକ୍ଷା ଫଳ ବାହାରିବା ପରେ NSP ପୋର୍ଟାଲରେ ଆବେଦନ କରନ୍ତୁ |",
            "who_can_get": "ଦ୍ୱାଦଶ ଶ୍ରେଣୀ ପରୀକ୍ଷାରେ ଭଲ ନମ୍ବର ରଖିଥିବା ନିୟମିତ କଲେଜ ଛାତ୍ରଛାତ୍ରୀ |",
            "missing_prompt": "ଦ୍ୱାଦଶ ଶ୍ରେଣୀ ମାର୍କସିଟ୍ ଏବଂ କଲେଜ ନାମଲେଖା ରସିଦ ଆବଶ୍ୟକ |"
        }
    },
    "rte": {
        "en": {
            "title": "Free Private School Seats (RTE EWS Quota)",
            "explanation": "This quota lets children from poorer families get free admission in nearby private schools, with 25% seats reserved for them.",
            "how_to_get": "Register your child on your state's online RTE admission portal during the admission season.",
            "who_can_get": "Children aged between 3 and 7 years belonging to disadvantaged groups or weaker income sections.",
            "missing_prompt": "We need the child's birth certificate and family income certificate."
        },
        "hi": {
            "title": "मुफ़्त प्राइवेट स्कूल दाखिला (RTE EWS कोटा)",
            "explanation": "यह कोटा गरीब परिवारों के बच्चों को नजदीकी प्राइवेट स्कूलों में मुफ्त दाखिला दिलाने में मदद करता है, जिसमें उनके लिए 25% सीटें आरक्षित होती हैं।",
            "how_to_get": "दाखिले के मौसम में अपने राज्य के ऑनलाइन RTE पोर्टल पर अपने बच्चे का पंजीकरण करें।",
            "who_can_get": "3 से 7 वर्ष की आयु के बच्चे जो आर्थिक रूप से कमजोर वर्ग या वंचित समूह से आते हैं।",
            "missing_prompt": "हमें बच्चे के जन्म प्रमाण पत्र और परिवार के आय प्रमाण पत्र की आवश्यकता है।"
        },
        "or": {
            "title": "ମାଗଣା ପ୍ରାଇଭେଟ୍ ସ୍କୁଲ ଶିକ୍ଷା (RTE EWS)",
            "explanation": "ଏହି ଯୋଜନାରେ ଗରିବ ପରିବାରର ପିଲାମାନେ ପ୍ରାଇଭେଟ୍ ସ୍କୁଲରେ ମାଗଣାରେ ପଢ଼ିପାରିବେ, ସେମାନଙ୍କ ପାଇଁ ୨୫% ସିଟ୍ ସଂରକ୍ଷିତ ଥାଏ |",
            "how_to_get": "ରାଜ୍ୟର RTE ଆଡମିଶନ ପୋର୍ଟାଲ ଜରିଆରେ ପଞ୍जୀକରଣ କରନ୍ତୁ |",
            "who_can_get": "୩ ରୁ ୭ ବର୍ଷ ବୟସର ପିଲା ଯେଉଁମାନେ ଆର୍ଥିକ ଅନଗ୍ରସର ଶ୍ରେଣୀର |",
            "missing_prompt": "ପିଲାର ଜନ୍ମ ପ୍ରମାଣପତ୍ର ଓ ଆୟ ପ୍ରମାଣପତ୍ର ଆବଶ୍ୟକ |"
        }
    },
    "pmsym": {
        "en": {
            "title": "Unorganized Workers Pension (PM-SYM)",
            "explanation": "This pension scheme helps workers in small or informal jobs. After you turn 60, you will receive a guaranteed monthly pension of ₹3,000.",
            "how_to_get": "You contribute a small monthly amount (₹55 to ₹200) based on your age, and the government deposits a matching contribution.",
            "who_can_get": "Unorganized workers (like street vendors, rickshaw pullers, laborers) aged 18 to 40 with monthly income below ₹15,000.",
            "missing_prompt": "We need to verify that you are not enrolled in EPFO/ESIC schemes and do not pay income tax."
        },
        "hi": {
            "title": "असंगठित श्रमिक पेंशन योजना (PM-SYM)",
            "explanation": "यह योजना छोटे या अनौपचारिक काम करने वाले मजदूरों के लिए है। 60 वर्ष की आयु के बाद, आपको हर महीने ₹3,000 की पेंशन मिलेगी।",
            "how_to_get": "आप अपनी आयु के अनुसार हर महीने एक छोटी राशि (₹55 से ₹200) जमा करते हैं, और सरकार भी उतनी ही राशि जमा करती है।",
            "who_can_get": "18 से 40 वर्ष की आयु के असंगठित श्रमिक (जैसे रेहड़ी-पटरी वाले, रिक्शा चालक, मजदूर) जिनकी मासिक आय ₹15,000 से कम हो।",
            "missing_prompt": "हमें यह पुष्टि करने की आवश्यकता है कि आप EPFO/ESIC योजनाओं में शामिल नहीं हैं और आयकर नहीं भरते हैं।"
        },
        "or": {
            "title": "ଶ୍ରମିକ ପେନସନ ଯୋଜନା (PM-SYM)",
            "explanation": "ଛୋଟ କାମ କରୁଥିବା ଶ୍ରମିକମାନଙ୍କ ପାଇଁ ଏହି ପେନସନ ଯୋଜନା | ୬୦ ବର୍ଷ ବୟସ ପରେ ପ୍ରତିମାସରେ ₹୩,୦୦୦ ପେନସନ ମିଳିବ |",
            "how_to_get": "ବୟସ ଅନୁସାରେ ମାସିକ କିଛି ଟଙ୍କା (₹୫୫ ରୁ ₹୨୦୦) ଜମା କରିବେ, ସରକାର ମଧ୍ୟ ସମାନ ପରିମାଣ ଦେବେ |",
            "who_can_get": "୧୮ ରୁ ୪୦ ବର୍ଷ ବୟସର ଅସଂଗଠିତ ଶ୍ରମିକ ଯେଉଁମାନଙ୍କ ମାସିକ ଆୟ ₹୧୫,୦୦0 ରୁ କମ୍ |",
            "missing_prompt": "ଆପଣ EPFO/ESIC କିମ୍ବା ଆୟକରଦାତା ନହୋଇଥିବା ଆବଶ୍ୟକ |"
        }
    },
    "apy": {
        "en": {
            "title": "Atal Monthly Pension Scheme (APY)",
            "explanation": "This scheme helps you save for old age. You can get a guaranteed monthly pension of ₹1,000 to ₹5,000 after you turn 60, based on your contributions.",
            "how_to_get": "You subscribe through your bank, and contributions are auto-debited monthly from your savings bank account.",
            "who_can_get": "All Indian citizens aged between 18 and 40 years. You must not be an income taxpayer.",
            "missing_prompt": "We need to verify your savings account status and confirm you do not pay income tax."
        },
        "hi": {
            "title": "अटल पेंशन योजना (APY)",
            "explanation": "यह योजना आपको बुढ़ापे के लिए बचत करने में मदद करती है। 60 वर्ष के होने के बाद, आपको आपके योगदान के आधार पर ₹1,000 से ₹5,000 की मासिक पेंशन की गारंटी मिलती है।",
            "how_to_get": "आप अपने बैंक के माध्यम से पंजीकरण करते हैं, और किस्त आपके बचत खाते से हर महीने कटती है।",
            "who_can_get": "18 से 40 वर्ष की आयु के सभी भारतीय नागरिक। आप आयकरदाता नहीं होने चाहिए।",
            "missing_prompt": "हमें आपके बचत खाते की स्थिति की जांच करने और आयकर न भरने की पुष्टि करने की आवश्यकता है।"
        },
        "or": {
            "title": "ଅଟଳ ପେନସନ ଯୋଜନା (APY)",
            "explanation": "ବାର୍ଦ୍ଧକ୍ୟ ଅବସ୍ଥା ପାଇଁ ଏହା ଏକ ପେନସନ ସଞ୍ଚୟ ଯୋଜନା | ୬୦ ବର୍ଷ ବୟସ ପରେ ପ୍ରତିମାସରେ ₹୧,୦୦୦ ରୁ ₹୫,୦୦୦ ପର୍ଯ୍ୟନ୍ତ ଗ୍ୟାରେଣ୍ଟି ପେନସନ ମିଳିବ |",
            "how_to_get": "ବ୍ୟାଙ୍କ ଜରିଆରେ ଖାତା ଖୋଲି ମାସିକ କିସ୍ତି ଜମା କରିପାରିବେ |",
            "who_can_get": "୧୮ ରୁ ୪୦ ବର୍ଷ ବୟସର ଯେକୌଣସି ନାଗରିକ ଯିଏ ଆୟକର ଦେଉନାହାନ୍ତି |",
            "missing_prompt": "ଆପଣ ଆୟକର ଦେଉନଥିବା ସମ୍ପର୍କରେ ଘୋଷଣାନାମା ଆବଶ୍ୟକ |"
        }
    },
    "pm-vishwakarma": {
        "en": {
            "title": "Artisan & Craftsmen Support (PM Vishwakarma)",
            "explanation": "This scheme supports traditional artisans (like carpenters, tailors, potters). It gives you training, a digital certificate, ₹15,000 to buy tools, and low-interest loans.",
            "how_to_get": "Register at pmvishwakarma.gov.in or your local CSC, followed by verification of your trade skill.",
            "who_can_get": "Artisans aged 18+ working in one of the 18 recognized traditional trades.",
            "missing_prompt": "We need information about your specific artisan craft or trade."
        },
        "hi": {
            "title": "कारीगर और शिल्पकार सहायता (पीएम विश्वकर्मा)",
            "explanation": "यह योजना पारंपरिक कारीगरों (जैसे बढ़ई, दर्जी, कुम्हार) की मदद करती है। यह आपको ट्रेनिंग, डिजिटल प्रमाणपत्र, औजार खरीदने के लिए ₹15,000 और कम ब्याज पर ऋण देती है।",
            "how_to_get": "पीएम विश्वकर्मा पोर्टल या अपने स्थानीय CSC पर पंजीकरण करें, जिसके बाद आपके कौशल का सत्यापन किया जाएगा।",
            "who_can_get": "18 वर्ष से अधिक आयु के कारीगर जो 18 अधिसूचित पारंपरिक व्यवसायों में से किसी एक में काम करते हैं।",
            "missing_prompt": "हमें आपके विशिष्ट पारंपरिक व्यवसाय या कला की जानकारी चाहिए।"
        },
        "or": {
            "title": "କାରିଗର ସହାୟତା (PM Vishwakarma)",
            "explanation": "ଏହି ଯୋଜନା ପାରମ୍ପରିକ କାରିଗରଙ୍କୁ (ଯେପରି ବଢ଼େଇ, ତେଲି, କୁମ୍ଭାର) ତାଲିମ, ସାର୍ଟିଫିକେଟ୍, ଉପକରଣ କିଣିବାକୁ ₹୧୫,୦୦୦ ଏବଂ କମ୍ ସୁଧରେ ଋଣ ଦିଏ |",
            "how_to_get": "ପୋର୍ଟାଲ କିମ୍ବା CSC କେନ୍ଦ୍ରରେ ନିଜ ଟ୍ରେଡ୍ ପଞ୍ଜୀକରଣ କରନ୍ତୁ |",
            "who_can_get": "୧୮ ରୁ ଅଧିକ ବୟସ୍କ ପାରମ୍ପରିକ କାରିଗର |",
            "missing_prompt": "ଆପଣ କେଉଁ କାରିଗର କାମ କରନ୍ତି ତାହାର ପ୍ରମାଣପତ୍ର ଆବଶ୍ୟକ |"
        }
    },
    "pmsvanidhi": {
        "en": {
            "title": "Street Vendor Working Loan (PM SVANidhi)",
            "explanation": "This scheme helps street vendors restart their business. It provides a loan of ₹10,000 without requiring any security or collateral.",
            "how_to_get": "Apply online or via local municipal bodies with your Vendor ID card.",
            "who_can_get": "Street vendors and hawkers operating in urban or semi-urban areas.",
            "missing_prompt": "We need your Street Vending Certificate or ULB Vending Card."
        },
        "hi": {
            "title": "रेहड़ी-पटरी विक्रेता ऋण योजना (पीएम स्वनिधि)",
            "explanation": "यह योजना रेहड़ी-पटरी और ठेला लगाने वाले विक्रेताओं को अपना काम शुरू करने में मदद करती है। यह बिना किसी गारंटी या सुरक्षा के ₹10,000 का प्रारंभिक ऋण प्रदान करती है।",
            "how_to_get": "अपने वेंडर आईडी कार्ड के साथ ऑनलाइन या स्थानीय नगर निकायों के माध्यम से आवेदन करें।",
            "who_can_get": "शहरी या अर्ध-शहरी क्षेत्रों में काम करने वाले स्ट्रीट वेंडर्स और फेरीवाले।",
            "missing_prompt": "हमें आपके स्ट्रीट वेंडिंग प्रमाणपत्र या ULB वेंडिंग कार्ड की आवश्यकता है।"
        },
        "or": {
            "title": "ପଥପାର୍ଶ୍ୱ ବ୍ୟବସାୟୀ ଋଣ ଯୋଜନା (PM SVANidhi)",
            "explanation": "ଏହି ଯୋଜନା ରାସ୍ତାକଡ଼ ବ୍ୟବସାୟୀଙ୍କୁ ବ୍ୟବସାୟ ବଢ଼ାଇବାକୁ ବିନା କୌଣସି ଗ୍ୟାରେଣ୍ଟିରେ ₹୧୦,୦୦୦ ପର୍ଯ୍ୟନ୍ତ ପ୍ରାରମ୍ଭିକ ଋଣ ଦିଏ |",
            "how_to_get": "ବ୍ୟବସାୟୀ ପରିଚୟ ପତ୍ର ସହ ବ୍ୟାଙ୍କ ବା ପୌରପାଳିକା ଜରିଆରେ ଆବେଦନ କରନ୍ତୁ |",
            "who_can_get": "ପଥପାର୍ଶ୍ୱ ବ୍ୟବସାୟୀ ବା ଫେରିବାଲା |",
            "missing_prompt": "ଆପଣଙ୍କର ପୌର ସଂସ୍ଥା ପ୍ରଦତ୍ତ ବ୍ୟବସାୟୀ ପରିଚୟ ପତ୍ର ଆବଶ୍ୟକ |"
        }
    },
    "pmay": {
        "en": {
            "title": "Affordable Housing Scheme (PMAY)",
            "explanation": "This scheme helps you build or buy your own house. It gives direct financial grants and home loan interest discounts (subsidies) to low-income families.",
            "how_to_get": "Apply through your local municipality, Gram Panchayat, or register on the PMAY online portal.",
            "who_can_get": "Families who do not own a concrete (pucca) house anywhere in India and fit the income category.",
            "missing_prompt": "We need family income proof and an affidavit confirming you do not own a pucca house."
        },
        "hi": {
            "title": "किफायती आवास योजना (PMAY)",
            "explanation": "यह योजना आपको अपना खुद का पक्का घर बनाने या खरीदने में मदद करती है। यह कम आय वाले परिवारों को सीधे सरकारी सहायता और गृह ऋण पर ब्याज में छूट देती है।",
            "how_to_get": "अपनी स्थानीय नगर पालिका, ग्राम पंचायत के माध्यम से आवेदन करें या PMAY ऑनलाइन पोर्टल पर पंजीकरण करें।",
            "who_can_get": "वे परिवार जिनके पास पूरे भारत में कहीं भी अपना पक्का घर नहीं है और जो निर्धारित आय वर्ग में आते हैं।",
            "missing_prompt": "हमें परिवार के आय प्रमाण पत्र और इस बात की घोषणा की आवश्यकता है कि आपके पास कोई पक्का मकान नहीं है।"
        },
        "or": {
            "title": "ପକ୍କାଘର ଯୋଜନା (PMAY)",
            "explanation": "ଏହି ଯୋଜନା ଆପଣଙ୍କୁ ନିଜର ପକ୍କାଘର ତିଆରି କରିବା ପାଇଁ ସରକାରୀ ଆର୍ଥିକ ସହାୟତା ଏବଂ ଗୃହ ଋଣ ଉପରେ ସୁଧ ରିହାତି ଦିଏ |",
            "how_to_get": "ସ୍ଥାନୀୟ ପଞ୍ଚାୟତ ବା ପୌରପାଳିକା ଜରିଆରେ କିମ୍ବା ଅନଲାଇନ୍ ପୋର୍ଟାଲରେ ଆବେଦନ କରନ୍ତु |",
            "who_can_get": "ଯେଉଁମାନଙ୍କର ଭାରତରେ କୌଣସି ପକ୍କାଘର ନାହିଁ |",
            "missing_prompt": "ଆପଣଙ୍କର ପକ୍କାଘର ନଥିବା ସମ୍ପର୍କରେ ଘୋଷଣାନାମା ଆବଶ୍ୟକ |"
        }
    }
}
