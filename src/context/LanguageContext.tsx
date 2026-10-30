/**
 * CivicLens AI - Multilingual Language Context & Translation Dictionary
 * Supports English, Hindi, Gujarati, Marathi, Bengali, Tamil
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SupportedLanguage = 'English' | 'Hindi' | 'Gujarati' | 'Marathi' | 'Bengali' | 'Tamil';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

// Comprehensive translations for UI elements across all 6 languages
const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  English: {
    // Brand & Slogan
    'app.name': 'CIVICLENS AI',
    'app.tagline': 'Understand • Verify • Act',
    'app.track': 'Civic Pulse & Digital Governance',

    // Nav
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.howItWorks': 'How It Works',
    'nav.transparency': 'Civic Transparency',
    'nav.schemes': 'Schemes',
    'nav.policies': 'Policies',
    'nav.about': 'About',
    'nav.signIn': 'Sign In',
    'nav.getStarted': 'Get Started',
    'nav.dashboard': 'Dashboard',
    'nav.signOut': 'Sign Out',
    'nav.adminHub': 'Admin Desk',
    'nav.citizenHub': 'Citizen Hub',

    // Hero
    'hero.badge': 'Powered by Gemini 3.8',
    'hero.title1': 'Government Information.',
    'hero.title2': 'Finally Within Everyone\'s Reach.',
    'hero.desc': 'Understand public policies, verify information, report civic issues, and access essential public services — all through one intelligent platform.',
    'hero.ctaExplore': 'Explore Civic Intelligence',
    'hero.ctaHow': 'See How It Works',
    'hero.instantDemo': 'Instant Demo Exploration (Pre-configured Profiles):',
    'hero.demoCitizen': 'Citizen (Priya Patel)',
    'hero.demoOfficer': 'Civic Officer (V. Sharma)',
    'hero.demoAdmin': 'Administrator (Dr. Sen)',

    // Four Pillars
    'pillars.badge': 'Intelligent Governance Architecture',
    'pillars.title': 'Four Pillars of Democratic Civic Empowerment',
    'pillars.subtitle': 'Designed to bridge the systemic gap between complex public paperwork, municipal departments, and everyday citizens.',
    'pillar.policy.title': 'AI Policy Explainer',
    'pillar.policy.desc': 'Upload official gazettes and notifications. Generates simple summaries, eligibility checks, required documents, and citations.',
    'pillar.scheme.title': 'Government Scheme Explorer',
    'pillar.scheme.desc': 'Find central and state welfare programs. Match your profile against criteria to discover eligible subsidies and grants.',
    'pillar.grievance.title': 'Civic Grievance Intelligence',
    'pillar.grievance.desc': 'Report potholes, water ruptures, broken streetlights, or waste. Gemini multimodal AI categorizes severity and routes to municipal divisions.',
    'pillar.fact.title': 'Fact Verification Engine',
    'pillar.fact.desc': 'Verify viral messages, WhatsApp forwarded claims, and rumors against official government gazettes, PIB clarifications, and verified public databases.',

    // Stats
    'stats.reports': 'Grievances Triaged & Tracked',
    'stats.resolution': 'Verified Resolution Rate',
    'stats.time': 'Average Municipal Action Time',
    'stats.grounded': 'Citation Grounded AI Explanations',

    // Citizen Dashboard
    'dash.greeting': 'Good day',
    'dash.subtitle': 'Your civic intelligence, all in one place. Track municipal grievances, explore eligible government benefits, and verify public circulars.',
    'dash.activeReports': 'My Active Reports',
    'dash.resolvedIssues': 'Resolved Issues',
    'dash.savedSchemes': 'Saved Schemes',
    'dash.trackedServices': 'Tracked Services',
    'dash.reportIssue': 'Report Civic Issue',
    'dash.explainPolicy': 'Explain Policy',
    'dash.myGrievances': 'My Civic Grievance Reports',
    'dash.publicApplications': 'Public Service Applications',
    'dash.aiHub': 'Civic AI Intelligence Hub',
    'dash.viewAll': 'View All',

    // Sidebar items
    'menu.overview': 'Overview',
    'menu.policyExplainer': 'Policy Explainer',
    'menu.schemeExplorer': 'Scheme Explorer',
    'menu.reportIssue': 'Report an Issue',
    'menu.trackGrievances': 'Track Grievances',
    'menu.civicMap': 'Civic Issue Map',
    'menu.factVerification': 'Fact Verification',
    'menu.myApplications': 'My Applications',
    'menu.notifications': 'Notifications',
    'menu.profile': 'My Profile',
    'menu.settings': 'Settings',

    // Theme & Lang
    'theme.toggle': 'Toggle Light/Dark Theme',
    'lang.select': 'Select Language',
  },

  Hindi: {
    // Brand & Slogan
    'app.name': 'सिविक-लेंस AI',
    'app.tagline': 'समझें • सत्यापित करें • कार्रवाई करें',
    'app.track': 'नागरिक नब्ज और डिजिटल सुशासन',

    // Nav
    'nav.home': 'होम',
    'nav.features': 'विशेषताएं',
    'nav.howItWorks': 'यह कैसे काम करता है',
    'nav.transparency': 'नागरिक पारदर्शिता',
    'nav.schemes': 'सरकारी योजनाएं',
    'nav.policies': 'नीतियां व अधिसूचनाएं',
    'nav.about': 'हमारे बारे में',
    'nav.signIn': 'लॉग इन करें',
    'nav.getStarted': 'शुरू करें',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.signOut': 'लॉग आउट',
    'nav.adminHub': 'प्रशासनिक डेस्क',
    'nav.citizenHub': 'नागरिक केंद्र',

    // Hero
    'hero.badge': 'जेमिनी 3.8 द्वारा संचालित',
    'hero.title1': 'सरकारी जानकारी।',
    'hero.title2': 'अब हर नागरिक की पहुंच में।',
    'hero.desc': 'सार्वजनिक नीतियों को सरल भाषा में समझें, वायरल दावों की पुष्टि करें, नागरिक समस्याएं दर्ज करें और आवश्यक सार्वजनिक सेवाओं का लाभ उठाएं।',
    'hero.ctaExplore': 'नागरिक बुद्धिमत्ता का अन्वेषण करें',
    'hero.ctaHow': 'प्रक्रिया देखें',
    'hero.instantDemo': 'तत्काल डेमो प्रोफाइल का उपयोग करें:',
    'hero.demoCitizen': 'नागरिक (प्रिया पटेल)',
    'hero.demoOfficer': 'नागरिक अधिकारी (वी. शर्मा)',
    'hero.demoAdmin': 'प्रशासक (डॉ. सेन)',

    // Four Pillars
    'pillars.badge': 'बुद्धिमान शासन संरचना',
    'pillars.title': 'नागरिक सशक्तिकरण के चार मुख्य स्तंभ',
    'pillars.subtitle': 'जटिल सरकारी कागजी कार्रवाई, नगर निगम विभागों और आम नागरिकों के बीच की दूरी को पाटने के लिए निर्मित।',
    'pillar.policy.title': 'एआई नीति व्याख्याता',
    'pillar.policy.desc': 'सरकारी राजपत्र और परिपत्र अपलोड करें। 6 भाषाओं में सरल सारांश, पात्रता जांच और आवश्यक दस्तावेजों की सूची पाएं।',
    'pillar.scheme.title': 'सरकारी योजना खोजक',
    'pillar.scheme.desc': 'केंद्र और राज्य की कल्याणकारी योजनाओं को खोजें और अपनी पात्रता का त्वरित मूल्यांकन कराएं।',
    'pillar.grievance.title': 'नागरिक शिकायत समाधान',
    'pillar.grievance.desc': 'गड्ढों, पानी के रिसाव, स्ट्रीटलाइट या कचरे की फोटो अपलोड करें। एआई तुरंत गंभीरता तय कर संबंधित विभाग को भेजता है।',
    'pillar.fact.title': 'तथ्य सत्यापन इंजन',
    'pillar.fact.desc': 'व्हाट्सएप पर फैलने वाले फर्जी दावों और अफवाहों को आधिकारिक राजपत्र व पीआईबी बुलेटिन से सत्यापित करें।',

    // Stats
    'stats.reports': 'सुलझाई गई नागरिक समस्याएं',
    'stats.resolution': 'सत्यापित समाधान दर',
    'stats.time': 'औसत नगर निगम प्रतिक्रिया समय',
    'stats.grounded': 'प्रमाणित संदर्भ सहित एआई व्याख्याएं',

    // Citizen Dashboard
    'dash.greeting': 'नमस्ते',
    'dash.subtitle': 'आपकी संपूर्ण नागरिक जानकारी एक ही स्थान पर। अपनी शिकायतों की स्थिति देखें और कल्याणकारी योजनाओं की पात्रता जांचें।',
    'dash.activeReports': 'सक्रिय शिकायतें',
    'dash.resolvedIssues': 'समाधान हो चुकी समस्याएं',
    'dash.savedSchemes': 'सहेजी गई योजनाएं',
    'dash.trackedServices': 'ट्रैक की जा रही सेवाएं',
    'dash.reportIssue': 'समस्या की रिपोर्ट करें',
    'dash.explainPolicy': 'नीति समझें',
    'dash.myGrievances': 'मेरी नागरिक शिकायतें',
    'dash.publicApplications': 'सार्वजनिक सेवा आवेदन',
    'dash.aiHub': 'नागरिक एआई इंटेलिजेंस हब',
    'dash.viewAll': 'सभी देखें',

    // Sidebar items
    'menu.overview': 'अवलोकन',
    'menu.policyExplainer': 'नीति व्याख्याता',
    'menu.schemeExplorer': 'योजना खोजक',
    'menu.reportIssue': 'शिकायत दर्ज करें',
    'menu.trackGrievances': 'शिकायत ट्रैक करें',
    'menu.civicMap': 'नागरिक समस्या मानचित्र',
    'menu.factVerification': 'तथ्य सत्यापन',
    'menu.myApplications': 'मेरे आवेदन',
    'menu.notifications': 'सूचनाएं',
    'menu.profile': 'मेरी प्रोफ़ाइल',
    'menu.settings': 'सेटिंग्स',

    // Theme & Lang
    'theme.toggle': 'डार्क/लाइट थीम बदलें',
    'lang.select': 'भाषा चुनें',
  },

  Gujarati: {
    // Brand & Slogan
    'app.name': 'સિવિકલેન્સ AI',
    'app.tagline': 'સમજો • ચકાસો • પગલાં લો',
    'app.track': 'નાગરિક નબજ અને ડિજિટલ સુશાસન',

    // Nav
    'nav.home': 'હોમ',
    'nav.features': 'વિશેષતાઓ',
    'nav.howItWorks': 'કેવી રીતે કાર્ય કરે છે',
    'nav.transparency': 'નાગરિક પારદર્શિતા',
    'nav.schemes': 'સરકારી યોજનાઓ',
    'nav.policies': 'નીતિઓ',
    'nav.about': 'અમારા વિશે',
    'nav.signIn': 'સાઇન ઇન',
    'nav.getStarted': 'શરૂઆત કરો',
    'nav.dashboard': 'ડૅશબોર્ડ',
    'nav.signOut': 'લૉગ આઉટ',
    'nav.adminHub': 'વહીવટી ડેસ્ક',
    'nav.citizenHub': 'નાગરિક કેન્દ્ર',

    // Hero
    'hero.badge': 'જેમિની 3.8 દ્વારા સંચાલિત',
    'hero.title1': 'સરકારી માહિતી.',
    'hero.title2': 'હવે દરેક નાગરિકની પહોંચમાં.',
    'hero.desc': 'સરકારી નીતિઓને સરળ ભાષામાં સમજો, માહિતીની સત્યતા ચકાસો, નાગરિક ફરિયાદો નોંધાવો અને આવશ્યક સેવાઓ મેળવો.',
    'hero.ctaExplore': 'નાગરિક બુદ્ધિમત્તા અન્વેષણ કરો',
    'hero.ctaHow': 'પ્રક્રિયા જુઓ',
    'hero.instantDemo': 'તાત્કાલિક ડેમો પ્રોફાઇલ દ્વારા તપાસો:',
    'hero.demoCitizen': 'નાગરિક (પ્રિયા પટેલ)',
    'hero.demoOfficer': 'નાગરિક અધિકારી (વી. શર્મા)',
    'hero.demoAdmin': 'વહીવટકર્તા (ડૉ. સેન)',

    // Four Pillars
    'pillars.badge': 'બુદ્ધિશાળી સુશાસન માળખું',
    'pillars.title': 'નાગરિક સશક્તિકરણના ચાર મુખ્ય સ્તંભ',
    'pillars.subtitle': 'જટિલ સરકારી કાગળકામ, નગરપાલિકા વિભાગો અને નાગરિકો વચ્ચેના અંતરને દૂર કરવા માટે નિર્મિત.',
    'pillar.policy.title': 'AI નીતિ સમજૂતીકાર',
    'pillar.policy.desc': 'સત્તાવાર ગેઝેટ અપલોડ કરો. સરળ ભાષામાં સારાંશ, પાત્રતા અને જરૂરી પુરાવાની યાદી મેળવો.',
    'pillar.scheme.title': 'સરકારી યોજના સંશોધક',
    'pillar.scheme.desc': 'તમારી પ્રોફાઇલ સાથે સરકારી કલ્યાણકારી યોજનાઓની પાત્રતાની તાત્કાલિક સરખામણી કરો.',
    'pillar.grievance.title': 'નાગરિક ફરિયાદ નિવારણ',
    'pillar.grievance.desc': 'ખાડા, પાણીની ગળતર કે સ્ટ્રીટલાઇટની તસવીર અપલોડ કરો. AI સંબંધિત મ્યુનિસિપલ વિભાગને આપમેળે સૂચિત કરશે.',
    'pillar.fact.title': 'સત્યતા ચકાસણી એન્જિન',
    'pillar.fact.desc': 'વાયરલ અફવાઓ અને વોટ્સએપ મેસેજને સત્તાવાર ગેઝેટ અને PIB ના બુલેટિન દ્વારા ચકાસો.',

    // Stats
    'stats.reports': 'નોંધાયેલી નાગરિક ફરિયાદો',
    'stats.resolution': 'સફળ ઉકેલ દર',
    'stats.time': 'સરેરાશ નિકાલ સમય',
    'stats.grounded': 'સંદર્ભ સાથે સચોટ AI સમજૂતી',

    // Citizen Dashboard
    'dash.greeting': 'નમસ્તે',
    'dash.subtitle': 'તમામ નાગરિક માહિતી એક જ સ્થળે. તમારી ફરિયાદોની પ્રગતિ અને યોજનાઓની પાત્રતા તપાસો.',
    'dash.activeReports': 'ચાલુ ફરિયાદો',
    'dash.resolvedIssues': 'ઉકેલાયેલી સમસ્યાઓ',
    'dash.savedSchemes': 'સાચવેલી યોજનાઓ',
    'dash.trackedServices': 'ટ્રેક કરેલી સેવાઓ',
    'dash.reportIssue': 'સમસ્યા નોંધાવો',
    'dash.explainPolicy': 'નીતિ સમજો',
    'dash.myGrievances': 'મારી ફરિયાદો',
    'dash.publicApplications': 'સરકારી સેવા અરજીઓ',
    'dash.aiHub': 'સિવિક AI ઇન્ટેલિજન્સ હબ',
    'dash.viewAll': 'બધું જુઓ',

    // Sidebar items
    'menu.overview': 'ઝાંખી',
    'menu.policyExplainer': 'નીતિ સમજૂતી',
    'menu.schemeExplorer': 'યોજના શોધક',
    'menu.reportIssue': 'ફરિયાદ નોંધાવો',
    'menu.trackGrievances': 'ફરિયાદ ટ્રેકિંગ',
    'menu.civicMap': 'સમસ્યા નકશો',
    'menu.factVerification': 'સત્ય ચકાસણી',
    'menu.myApplications': 'મારી અરજીઓ',
    'menu.notifications': 'સૂચનાઓ',
    'menu.profile': 'મારી પ્રોફાઇલ',
    'menu.settings': 'સેટિંગ્સ',

    // Theme & Lang
    'theme.toggle': 'થીમ બદલો (ડાર્ક/લાઇટ)',
    'lang.select': 'ભાષા પસંદ કરો',
  },

  Marathi: {
    'app.name': 'सिव्हिकलेन्स AI',
    'app.tagline': 'समजा • पडताळा • कृती करा',
    'app.track': 'नागरी स्पंदन आणि डिजिटल सुशासन',

    'nav.home': 'मुख्यपृष्ठ',
    'nav.features': 'वैशिष्ट्ये',
    'nav.howItWorks': 'हे कसे चालते',
    'nav.transparency': 'नागरी पारदर्शकता',
    'nav.schemes': 'सरकारी योजना',
    'nav.policies': 'धोरणे व राजपत्र',
    'nav.about': 'आमच्याबद्दल',
    'nav.signIn': 'लॉगिन',
    'nav.getStarted': 'सुरू करा',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.signOut': 'लॉग आऊट',
    'nav.adminHub': 'प्रशासक डेस्क',
    'nav.citizenHub': 'नागरिक केंद्र',

    'hero.badge': 'जेमिनी ३.८ द्वारे समर्थित',
    'hero.title1': 'शासकीय माहिती.',
    'hero.title2': 'आता प्रत्येकाच्या आवाक्यात.',
    'hero.desc': 'सार्वजनिक धोरणे सोप्या भाषेत समजून घ्या, सत्यता पडताळा, नागरी तक्रारींची नोंद करा आणि सरकारी सेवा मिळवा.',
    'hero.ctaExplore': 'नागरी बुद्धिमत्ता एक्सप्लोर करा',
    'hero.ctaHow': 'प्रक्रिया पहा',
    'hero.instantDemo': 'डेमो खात्याद्वारे थेट लॉगिन:',
    'hero.demoCitizen': 'नागरिक (प्रिया पटेल)',
    'hero.demoOfficer': 'नागरी अधिकारी (व्ही. शर्मा)',
    'hero.demoAdmin': 'प्रशासक (डॉ. सेन)',

    'pillars.badge': 'डिजिटल सुशासन प्रणाली',
    'pillars.title': 'नागरी सक्षमीकरणाचे चार मजबूत आधारस्तंभ',
    'pillars.subtitle': 'प्रशासकीय क्लिष्ट कागदपत्रे आणि नागरिकांमधील दरी मिटवण्यासाठी डिझाइन केलेले.',
    'pillar.policy.title': 'AI धोरण स्पष्टीकरणकर्ता',
    'pillar.policy.desc': 'सरकारी आदेश अपलोड करा आणि सोप्या भाषेत नियम, कागदपत्रे आणि अधिकार जाणून घ्या.',
    'pillar.scheme.title': 'सरकारी योजना शोधक',
    'pillar.scheme.desc': 'तुमच्या वयोमर्यादा व उत्पन्नानुसार पात्र शासकीय योजनांची माहिती मिळवा.',
    'pillar.grievance.title': 'नागरी तक्रार निवारण',
    'pillar.grievance.desc': 'रस्त्यावरील खड्डे, पाण्याची गळती किंवा पथदिव्यांचे फोटो अपलोड करून संबंधित प्रभागाकडे थेट पाठवा.',
    'pillar.fact.title': 'सत्य पडताळणी यंत्रणा',
    'pillar.fact.desc': 'व्हाट्सॲपवरील व्हायरल अफवांचे शासकीय राजपत्रांद्वारे सत्य विश्लेषण करा.',

    'stats.reports': 'नोंदवलेल्या नागरी समस्या',
    'stats.resolution': 'निवारण दर',
    'stats.time': 'सरासरी निवारण वेळ',
    'stats.grounded': 'अधिकृत संदर्भासह स्पष्टीकरण',

    'dash.greeting': 'नमस्कार',
    'dash.subtitle': 'आपली सर्व नागरी माहिती एकाच ठिकाणी. समस्यांचा पाठपुरावा करा आणि शासकीय योजनांचा लाभ घ्या.',
    'dash.activeReports': 'सक्रिय तक्रारी',
    'dash.resolvedIssues': 'सोडवलेल्या समस्या',
    'dash.savedSchemes': 'जतन केलेल्या योजना',
    'dash.trackedServices': 'ट्रॅक केलेले अर्ज',
    'dash.reportIssue': 'तक्रार नोंदवा',
    'dash.explainPolicy': 'धोरण समजून घ्या',
    'dash.myGrievances': 'माझ्या तक्रारी',
    'dash.publicApplications': 'शासकीय सेवा अर्ज',
    'dash.aiHub': 'नागरी AI बुद्धिमत्ता केंद्र',
    'dash.viewAll': 'सर्व पहा',

    'menu.overview': 'आढावा',
    'menu.policyExplainer': 'धोरण स्पष्टीकरण',
    'menu.schemeExplorer': 'योजना शोधक',
    'menu.reportIssue': 'तक्रार नोंदवा',
    'menu.trackGrievances': 'तक्रार ट्रॅक करा',
    'menu.civicMap': 'नागरी नकाशा',
    'menu.factVerification': 'सत्यता पडताळणी',
    'menu.myApplications': 'माझे अर्ज',
    'menu.notifications': 'सूचना',
    'menu.profile': 'माझे प्रोफाईल',
    'menu.settings': 'सेटिंग्ज',

    'theme.toggle': 'डार्क / लाइट थीम बदला',
    'lang.select': 'भाषा निवडा',
  },

  Bengali: {
    'app.name': 'সিভিকলেন্স AI',
    'app.tagline': 'বুঝুন • যাচাই করুন • পদক্ষেপ নিন',
    'app.track': 'নাগরিক চেতনা ও ডিজিটাল সুশাসন',

    'nav.home': 'হোম',
    'nav.features': 'বৈশিষ্ট্যসমূহ',
    'nav.howItWorks': 'কীভাবে কাজ করে',
    'nav.transparency': 'নাগরিক স্বচ্ছতা',
    'nav.schemes': 'সরকারি প্রকল্প',
    'nav.policies': 'নীতিমালা',
    'nav.about': 'আমাদের সম্পর্কে',
    'nav.signIn': 'লগ ইন',
    'nav.getStarted': 'শুরু করুন',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.signOut': 'লগ আউট',
    'nav.adminHub': 'প্রশাসনিক ডেস্ক',
    'nav.citizenHub': 'নাগরিক কেন্দ্র',

    'hero.badge': 'জেমিনি ৩.৮ চালিত',
    'hero.title1': 'সরকারি তথ্য।',
    'hero.title2': 'অবশেষে সবার হাতের নাগালে।',
    'hero.desc': 'সরকারি নীতি সহজে বুঝুন, তথ্য যাচাই করুন, নাগরিক সমস্যা জানান এবং প্রয়োজনীয় জনসেবা পান।',
    'hero.ctaExplore': 'নাগরিক বুদ্ধিমত্তা অন্বেষণ করুন',
    'hero.ctaHow': 'প্রক্রিয়া দেখুন',
    'hero.instantDemo': 'তাত্ক্ষণিক ডেমো প্রোফাইল নির্বাচন করুন:',
    'hero.demoCitizen': 'নাগরিক (প্রিয়া প্যাটেল)',
    'hero.demoOfficer': 'নাগরিক কর্মকর্তা (ভি. শর্মা)',
    'hero.demoAdmin': 'প্রশাসক (ড. সেন)',

    'pillars.badge': 'স্মার্ট সুশাসন ব্যবস্থা',
    'pillars.title': 'নাগরিক ক্ষমতায়নের চারটি প্রধান স্তম্ভ',
    'pillars.subtitle': 'জটিল সরকারি নিয়ম এবং সাধারণ নাগরিকদের মধ্যকার দূরত্ব ঘোচানোর উদ্যোগ।',
    'pillar.policy.title': 'AI নীতি ব্যাখ্যাকারী',
    'pillar.policy.desc': 'অফিসিয়াল গেজেট আপলোড করুন এবং সহজ ভাষায় যোগ্যতা ও নিয়মের বিবরণ জানুন।',
    'pillar.scheme.title': 'সরকারি প্রকল্প সন্ধান',
    'pillar.scheme.desc': 'আপনার প্রোফাইলের সাথে মানানসই সরকারি অনুদান ও প্রকল্পের তালিকা খুঁজুন।',
    'pillar.grievance.title': 'নাগরিক অভিযোগ প্রতিকার',
    'pillar.grievance.desc': 'ভাঙা রাস্তা, জলের পাইপ বা আলোর সমস্যার ছবি আপলোড করুন। এআই তাৎক্ষণিক ব্যবস্থা নেবে।',
    'pillar.fact.title': 'তথ্য যাচাইকরণ ইঞ্জিন',
    'pillar.fact.desc': 'হোয়াটসঅ্যাপে ছড়ানো ভুয়ো খবর ও গুজবের সরকারি গেজেট ভিত্তিক নিরপেক্ষ সত্যতা যাচাই।',

    'stats.reports': 'গৃহীত নাগরিক অভিযোগ',
    'stats.resolution': 'সমাধানের হার',
    'stats.time': 'গড় সমাধানের সময়',
    'stats.grounded': 'উৎস ভিত্তিক এআই ব্যাখ্যা',

    'dash.greeting': 'সুপ্রভাত',
    'dash.subtitle': 'আপনার সব নাগরিক তথ্য এক জায়গায়। অভিযোগের অগ্রগতি ট্র্যাক করুন এবং প্রকল্পের জন্য আবেদন করুন।',
    'dash.activeReports': 'চলমান অভিযোগ',
    'dash.resolvedIssues': 'মীমাংসিত সমস্যা',
    'dash.savedSchemes': 'সংরক্ষিত প্রকল্প',
    'dash.trackedServices': 'ট্র্যাক করা পরিষেবা',
    'dash.reportIssue': 'অভিযোগ দায়ের করুন',
    'dash.explainPolicy': 'নীতি বুঝুন',
    'dash.myGrievances': 'আমার অভিযোগসমূহ',
    'dash.publicApplications': 'জনসেবা আবেদন',
    'dash.aiHub': 'সিভিক AI বুদ্ধিমত্তা কেন্দ্র',
    'dash.viewAll': 'সব দেখুন',

    'menu.overview': 'ওভারভিউ',
    'menu.policyExplainer': 'নীতি ব্যাখ্যাকারী',
    'menu.schemeExplorer': 'প্রকল্প সন্ধান',
    'menu.reportIssue': 'অভিযোগ দায়ের',
    'menu.trackGrievances': 'অভিযোগ ট্র্যাকিং',
    'menu.civicMap': 'নাগরিক মানচিত্র',
    'menu.factVerification': 'তথ্য যাচাই',
    'menu.myApplications': 'আমার আবেদন',
    'menu.notifications': 'বিজ্ঞপ্তি',
    'menu.profile': 'আমার প্রোফাইল',
    'menu.settings': 'সেটিংস',

    'theme.toggle': 'ডার্ক / লাইট থিম পরিবর্তন করুন',
    'lang.select': 'ভাষা নির্বাচন করুন',
  },

  Tamil: {
    'app.name': 'சிவிக்லென்ஸ் AI',
    'app.tagline': 'புரிந்துகொள்ளுங்கள் • சரிபாருங்கள் • செயல்படுங்கள்',
    'app.track': 'குடிமக்கள் நாடி & டிஜிட்டல் நல்லாட்சி',

    'nav.home': 'முகப்பு',
    'nav.features': 'அம்சங்கள்',
    'nav.howItWorks': 'எவ்வாறு செயல்படுகிறது',
    'nav.transparency': 'குடிமக்கள் வெளிப்படைத்தன்மை',
    'nav.schemes': 'அரசு திட்டங்கள்',
    'nav.policies': 'கொள்கைகள்',
    'nav.about': 'எங்களைப் பற்றி',
    'nav.signIn': 'உள்நுழைக',
    'nav.getStarted': 'தொடங்குங்கள்',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.signOut': 'வெளியேறு',
    'nav.adminHub': 'நிர்வாக மேசை',
    'nav.citizenHub': 'குடிமக்கள் மையம்',

    'hero.badge': 'ஜெமினி 3.8 மூலம் இயக்கப்படுகிறது',
    'hero.title1': 'அரசாங்க தகவல்கள்.',
    'hero.title2': 'இனி அனைவரின் கைக்குள்ளும்.',
    'hero.desc': 'பொதுக் கொள்கைகளைப் புரிந்து கொள்ளுங்கள், தகவல்களைச் சரிபாருங்கள், நகராட்சிப் புகார்களைப் பதிவு செய்யுங்கள்.',
    'hero.ctaExplore': 'குடிமக்கள் நுண்ணறிவை ஆராயுங்கள்',
    'hero.ctaHow': 'செயல்முறையை பார்க்க',
    'hero.instantDemo': 'டெமோ கணக்குகள் மூலம் உள்நுழைக:',
    'hero.demoCitizen': 'குடிமகன் (பிரியா படேல்)',
    'hero.demoOfficer': 'அதிகாரி (வி. சர்மா)',
    'hero.demoAdmin': 'நிர்வாகி (டாக்டர் சென்)',

    'pillars.badge': 'புத்திசாலித்தனமான ஆளுகை',
    'pillars.title': 'குடிமக்கள் அதிகாரமளித்தலின் நான்கு தூண்கள்',
    'pillars.subtitle': 'அரசு ஆவணங்களுக்கும் பொதுமக்களுக்கும் இடையிலான இடைவெளியைக் குறைக்க உருவாக்கப்பட்டது.',
    'pillar.policy.title': 'AI கொள்கை விளக்க உரை',
    'pillar.policy.desc': 'அரசாணை ஆவணங்களை எளிய தமிழில் தகுதிகள் மற்றும் ஆவணங்களின் பட்டியலாகப் பெறுங்கள்.',
    'pillar.scheme.title': 'அரசு நலத்திட்ட ஆய்வாளர்',
    'pillar.scheme.desc': 'உங்கள் வயது மற்றும் வருமானத்திற்கு ஏற்ப அரசு மானியங்கள் மற்றும் நலத்திட்டங்களை கண்டறியுங்கள்.',
    'pillar.grievance.title': 'குடிமக்கள் குறைதீர்ப்பு',
    'pillar.grievance.desc': 'குழிகள், நீர் கசிவு அல்லது தெருவிளக்கு பழுது ஆகியவற்றை படம் எடுத்து புகாரளிக்கவும்.',
    'pillar.fact.title': 'உண்மை சரிபார்ப்பு என்ஜின்',
    'pillar.fact.desc': 'வாட்ஸ்அப் வதந்திகளை அதிகாரப்பூர்வ அரசிதழ்கள் மூலம் துல்லியமாகச் சரிபாருங்கள்.',

    'stats.reports': 'தீர்க்கப்பட்ட புகார்கள்',
    'stats.resolution': 'தீர்வு விகிதம்',
    'stats.time': 'சராசரி பதில் நேரம்',
    'stats.grounded': 'சான்றளிக்கப்பட்ட விளக்கங்கள்',

    'dash.greeting': 'வணக்கம்',
    'dash.subtitle': 'உங்கள் அனைத்து குடிமக்கள் சேவைகளும் ஒரே இடத்தில். உங்கள் புகார்களைக் கண்காணித்து நலத்திட்டங்களை அணுகவும்.',
    'dash.activeReports': 'நடப்புப் புகார்கள்',
    'dash.resolvedIssues': 'தீர்க்கப்பட்ட பிரச்சனைகள்',
    'dash.savedSchemes': 'சேமிக்கப்பட்ட திட்டங்கள்',
    'dash.trackedServices': 'கண்காணிக்கப்படும் சேவைகள்',
    'dash.reportIssue': 'புகார் அளிக்க',
    'dash.explainPolicy': 'கொள்கை விளக்கம்',
    'dash.myGrievances': 'எனது புகார்கள்',
    'dash.publicApplications': 'பொது சேவை விண்ணப்பங்கள்',
    'dash.aiHub': 'குடிமக்கள் AI மையம்',
    'dash.viewAll': 'அனைத்தையும் காண்க',

    'menu.overview': 'கண்ணோட்டம்',
    'menu.policyExplainer': 'கொள்கை விளக்கம்',
    'menu.schemeExplorer': 'திட்டங்கள்',
    'menu.reportIssue': 'புகார் அளி',
    'menu.trackGrievances': 'புகார் நிலை',
    'menu.civicMap': 'வரைபடம்',
    'menu.factVerification': 'உண்மை சரிபார்ப்பு',
    'menu.myApplications': 'விண்ணப்பங்கள்',
    'menu.notifications': 'அறிவிப்புகள்',
    'menu.profile': 'எனது சுயவிவரம்',
    'menu.settings': 'அமைப்புகள்',

    'theme.toggle': 'தீம் மாற்றவும் (டார்க்/லைட்)',
    'lang.select': 'மொழியைத் தேர்ந்தெடுக்கவும்',
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  languages: LanguageOption[];
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('civiclens_language');
    return (saved as SupportedLanguage) || 'English';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('civiclens_language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    const currentDict = TRANSLATIONS[language];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    // Fallback to English dictionary
    const engDict = TRANSLATIONS['English'];
    if (engDict && engDict[key]) {
      return engDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages: LANGUAGES, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
