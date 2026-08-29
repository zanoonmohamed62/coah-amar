export type Language = "en" | "ar";

export interface TranslationSchema {
  dir: "ltr" | "rtl";
  nav: {
    brand: string;
    plans: string;
    coach: string;
    results: string;
    faq: string;
    startNow: string;
    login: string;
    langSwitch: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3?: string;
    description: string;
    startBtn: string;
    meetBtn: string;
    appBtn?: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
    cardBadge: string;
    cardTitle: string;
  };
  trust: {
    items: string[];
  };
  problem: {
    badge: string;
    title: string;
    subtitle: string;
    genericTitleBadge: string;
    genericHeading: string;
    genericPoints: string[];
    coachingTitleBadge: string;
    coachingHeading: string;
    coachingPoints: string[];
  };
  twoPaths: {
    badge: string;
    title: string;
    subtitle: string;
    offer1: {
      badge: string;
      title: string;
      sub: string;
      price: string;
      currency: string;
      type: string;
      features: string[];
      btn: string;
      delivery: string;
    };
    offer2: {
      badge: string;
      title: string;
      sub: string;
      price: string;
      currency: string;
      type: string;
      features: string[];
      btn: string;
      renewal: string;
    };
  };
  trainingDetail: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    desc: string;
    highlights: Array<{ title: string; desc: string }>;
    btn: string;
    paymentInfo: string;
    cardBadge: string;
    cardPrice: string;
    cardCurrency: string;
    cardSub: string;
  };
  coachingDetail: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    desc: string;
    pillars: Array<{ title: string; items: string[] }>;
    clientStats: Array<{ label: string; value: string }>;
    visualTitle: string;
    visualDesc: string;
    feature1: string;
    feature2: string;
    feature3: string;
    btn: string;
  };
  howItWorks: {
    badge: string;
    title: string;
    subtitle: string;
    planTrack: string;
    coachingTrack: string;
    planSteps: Array<{ step: string; title: string; desc: string }>;
    coachingSteps: Array<{ step: string; title: string; desc: string }>;
  };
  coach: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    name: string;
    sub: string;
    bio: string;
    points: string[];
    btn: string;
    igBtn: string;
    ytBtn?: string;
    card1: string;
    card2: string;
    card3: string;
  };
  experience: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    weeks: Array<{
      week: string;
      label: string;
      training: { completed: number; total: number; label: string };
      nutrition: { value: string; label: string };
      cardio: { value: string; label: string };
      checkin: string;
      progress: string;
    }>;
    metricsTraining: string;
    metricsNutrition: string;
    metricsCardio: string;
    metricsCheckIn: string;
    metricsProgress: string;
  };
  testimonials: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    list: Array<{
      name: string;
      duration: string;
      result: string;
      text: string;
    }>;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
    items: Array<{ q: string; a: string }>;
  };
  finalCta: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    subtitle: string;
    planBtn: string;
    coachingBtn: string;
    footerTag: string;
  };
  footer: {
    desc: string;
    navigate: string;
    offers: string;
    planOffer: string;
    coachingOffer: string;
    rights: string;
    tag: string;
  };
  checkout: {
    pageTitle: string;
    badge: string;
    heading: string;
    subheading: string;
    planSelectorTitle: string;
    plan1Title: string;
    plan1Price: string;
    plan1Desc: string;
    plan2Title: string;
    plan2Price: string;
    plan2Badge: string;
    plan2Desc: string;
    clientDetailsTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    goalLabel: string;
    goalOptions: string[];
    levelLabel: string;
    levelOptions: string[];
    notesLabel: string;
    notesPlaceholder: string;
    paymentTitle: string;
    instaPay: string;
    payPal: string;
    telda: string;
    instaPayInfo: string;
    payPalInfo: string;
    teldaInfo: string;
    summaryTitle: string;
    subtotal: string;
    taxes: string;
    freeTax: string;
    total: string;
    guarantee: string;
    submitBtn: string;
    submittingBtn: string;
    successTitle: string;
    successMessage: string;
    whatsappBtn: string;
    backHome: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    dir: "ltr",
    nav: {
      brand: "Coach Amar",
      plans: "Plans",
      coach: "Coach",
      results: "Results",
      faq: "FAQ",
      startNow: "Start Now",
      login: "Login",
      langSwitch: "العربية",
    },
    hero: {
      badge: 'X "MÉTHODE"',
      titleLine1: "THE AMAR",
      titleLine2: '"X SPLIT"',
      titleLine3: "BUILD DIFFERENT",
      description: "Hybrid training — old school training, modern progression. Built around your body, schedule, and goals.",
      startBtn: "Start Your Transformation",
      meetBtn: "Let's Talk",
      appBtn: "Open Customer App",
      stat1Value: "100+",
      stat1Label: "Clients Coached",
      stat2Value: "4+",
      stat2Label: "Years Experience",
      stat3Value: "0",
      stat3Label: "Client Rating",
      cardBadge: "Amar Fitness",
      cardTitle: "1-on-1 Personal Coaching",
    },
    trust: {
      items: [
        "PERSONALIZED",
        "STRUCTURED",
        "DATA-DRIVEN",
        "CONSISTENT",
        "PROGRESSIVE",
        "SCIENTIFIC",
        "RESULTS-FOCUSED",
        "ACCOUNTABLE",
      ],
    },
    problem: {
      badge: "The Science of Progression",
      title: "Why Random Workouts Fail You",
      subtitle: "Walking into the gym without a proven scientific system wastes months of effort. Whether you follow the Amar X Split independently or train with full coaching & nutrition — real results demand structure.",
      genericTitleBadge: "Random & Copied Routines",
      genericHeading: "Wasted effort. Zero real progression.",
      genericPoints: [
        "Unstructured workouts without a proven 7-day split",
        "No progressive overload tracking week to week",
        "Guessing sets, rep ranges, and rest intervals",
        "Ignoring weak points and recovery needs",
        "Uncalculated nutrition and random eating habits",
        "Stuck at the same strength and physique for months",
      ],
      coachingTitleBadge: "The Amar Performance System",
      coachingHeading: "Precision Training + Strategic Nutrition.",
      coachingPoints: [
        "Amar X Split (7-Day Blueprint): Complete hypertrophic structure",
        "Science-backed progressive overload system for constant growth",
        "Dedicated weak-point prioritization methodology",
        "Personalized nutrition & calculated macros (with Coaching)",
        "Weekly check-ins, adjustments & direct follow-up (with Coaching)",
        "Total clarity every workout — zero guesswork, guaranteed progression",
      ],
    },
    twoPaths: {
      badge: "Start Your Journey",
      title: "How Do You Want to Train?",
      subtitle: "Two offers. One goal. Choose your path.",
      offer1: {
        badge: "Offer 01",
        title: "AMAR X SPLIT",
        sub: "Do It Yourself",
        price: "499",
        currency: "EGP / 19 €",
        type: "One-time",
        features: [
          "Complete 7-day training structure",
          "Sets & rep ranges",
          "Weak-point priority system",
          "Rest time rules",
          "Progressive overload rule",
          "Training log & progress tracking",
        ],
        btn: "Get The Split",
        delivery: "Instant access after payment",
      },
      offer2: {
        badge: "Offer 02 · Most Popular",
        title: "PERSONAL COACHING",
        sub: "Full System · 3 Months",
        price: "2,499",
        currency: "EGP / 119 €",
        type: "3 Months",
        features: [
          "Customized training split",
          "Personalized nutrition & macro plan",
          "Supplement guidance & timing",
          "3 months personal follow-up",
          "Weekly check-ins & adjustments",
          "Direct coach communication",
          "Cardio programming",
          "Progress monitoring",
        ],
        btn: "Start Coaching — 2,499 EGP / 119 €",
        renewal: "Renewal: 1,999 EGP / 99 € / 3 months",
      },
    },
    trainingDetail: {
      badge: "Offer 01 · 499 LE / 19 €",
      titleLine1: "THE AMAR",
      titleLine2: "X SPLIT",
      desc: "A complete 7-day training structure you can follow independently. Built with the same methodology used in personal coaching — just without the ongoing guidance.",
      highlights: [
        { title: "Complete 7-Day Structure", desc: "Full training split with exercise selection for muscle growth" },
        { title: "Sets, Reps & Rest Ranges", desc: "Exact parameters for each lift — nothing left to guessing" },
        { title: "Weak-Point Priority System", desc: "Identify and target your weak points for balanced progress" },
        { title: "Progressive Overload Rules", desc: "How to advance week by week for continuous results" },
      ],
      btn: "Get The Split — 499 LE / 19 €",
      paymentInfo: "One-time payment\nInstant digital delivery",
      cardBadge: "One-Time",
      cardPrice: "499",
      cardCurrency: "LE / 19 €",
      cardSub: "Instant Delivery",
    },
    coachingDetail: {
      badge: "Offer 02 · 2,499 LE / 119 € · 3 Months",
      titleLine1: "PERSONAL COACHING —",
      titleLine2: "THE FULL SYSTEM",
      desc: "Not just a plan. A complete performance system built around you, adjusted as you progress, and guided by someone who does this every day.",
      pillars: [
        {
          title: "Training",
          items: ["Customized training split", "Exercise selection", "Sets, reps & rest", "Progression system", "Cardio programming"],
        },
        {
          title: "Nutrition",
          items: ["Personalized calorie target", "Macro structure", "Full diet plan", "Food alternatives", "Adjustments over time"],
        },
        {
          title: "Supplements",
          items: ["Personalized supplement stack", "Timing guidance", "Ongoing adjustments", "Budget-friendly options"],
        },
        {
          title: "Follow-Up",
          items: ["3 months personal coaching", "Weekly progress check-ins", "Training adjustments", "Nutrition adjustments", "Direct coach access"],
        },
      ],
      clientStats: [
        { label: "Active Clients", value: "100+" },
        { label: "Avg. Progress", value: "12 wks" },
      ],
      visualTitle: "You're Not Buying a PDF.",
      visualDesc: "You're getting a living system that adjusts every week based on your actual progress. Training, nutrition, supplements and cardio — all built around you and monitored closely.",
      feature1: "Weekly progress reviews with Coach Amar",
      feature2: "Direct messaging for questions & adjustments",
      feature3: "Renewal available after 3 months — 1,999 LE / 99 €",
      btn: "START COACHING — 2,499 LE / 119 €",
    },
    howItWorks: {
      badge: "Process",
      title: "How It Works",
      subtitle: "Simple, transparent, fully automated. From payment to plan — no waiting, no confusion.",
      planTrack: "Training Plan · 499 LE / 19 €",
      coachingTrack: "Personal Coaching · 2,499 LE / 119 €",
      planSteps: [
        { step: "01", title: "Purchase", desc: "One-time payment processed securely" },
        { step: "02", title: "Account Created", desc: "Access credentials sent instantly" },
        { step: "03", title: "Plan Delivered", desc: "Full 7-day split & training system unlocked in your dashboard" },
      ],
      coachingSteps: [
        { step: "01", title: "Purchase", desc: "Secure payment · Coaching period begins" },
        { step: "02", title: "Onboarding", desc: "Fill your assessment & goals questionnaire" },
        { step: "03", title: "Your Plan", desc: "Coach Amar builds your personalized system" },
        { step: "04", title: "Coaching Starts", desc: "Training, nutrition, supplements & cardio live" },
        { step: "05", title: "Weekly Progress", desc: "Check-ins, adjustments & ongoing refinement" },
        { step: "06", title: "Renew", desc: "Continue your transformation — 1,999 LE / 99 € / 3 months" },
      ],
    },
    coach: {
      badge: "Meet Your Coach",
      titleLine1: "MORE THAN A",
      titleLine2: "WORKOUT PLAN.",
      name: "Coach Amar",
      sub: "Certified Fitness Coach · Sports Nutritionist",
      bio: "I don't sell cookie-cutter routines. Over the past 4+ years, I've developed a coaching methodology that prioritizes sustainability, progressive overload, and bio-individual nutrition. Every client receives my direct attention — not an assistant, not an automated bot.",
      points: [
        "Specialized in body recomposition and strength development",
        "Evidence-based approach combining training science with practical execution",
        "Hands-on weekly monitoring with tailored micro-adjustments",
      ],
      btn: "Start Coaching With Amar",
      igBtn: "Follow on Instagram",
      ytBtn: "YouTube Channel",
      card1: "Personal Coaching",
      card2: "Training Science",
      card3: "Results Focus",
    },
    experience: {
      badge: "The Journey",
      titleLine1: "Your 12-Week",
      titleLine2: "Coaching Experience",
      subtitle: "See exactly what happens across your 3-month coaching period.",
      weeks: [
        {
          week: "Week 01",
          label: "Foundation",
          training: { completed: 2, total: 4, label: "Days Training" },
          nutrition: { value: "2,400 kcal", label: "Daily Target" },
          cardio: { value: "2×/wk", label: "Low intensity" },
          checkin: "End of Week 1",
          progress: "Onboarding complete",
        },
        {
          week: "Week 04",
          label: "Building Phase",
          training: { completed: 4, total: 5, label: "Days Training" },
          nutrition: { value: "2,600 kcal", label: "Adjusted up" },
          cardio: { value: "3×/wk", label: "Moderate" },
          checkin: "Photos + Weight submitted",
          progress: "−2.1 kg body weight",
        },
        {
          week: "Week 08",
          label: "Peak Phase",
          training: { completed: 5, total: 5, label: "Days Training" },
          nutrition: { value: "2,350 kcal", label: "Refined macros" },
          cardio: { value: "4×/wk", label: "Mixed intensity" },
          checkin: "Mid-program review",
          progress: "Strength +14% · Weight −5 kg",
        },
        {
          week: "Week 12",
          label: "Final Phase",
          training: { completed: 5, total: 5, label: "Days Training" },
          nutrition: { value: "2,200 kcal", label: "Final phase" },
          cardio: { value: "5×/wk", label: "Peak protocol" },
          checkin: "Final transformation check",
          progress: "Goal achieved — renew?",
        },
      ],
      metricsTraining: "Training",
      metricsNutrition: "Nutrition",
      metricsCardio: "Cardio",
      metricsCheckIn: "Next Check-in",
      metricsProgress: "Progress",
    },
    testimonials: {
      badge: "Results",
      titleLine1: "Real Results.",
      titleLine2: "Real People.",
      subtitle: "Transformation feedback and testimonials from clients who committed to the system.",
      list: [
        {
          name: "Ahmed M.",
          duration: "3-Month Coaching",
          result: "−8 kg · Strength +20%",
          text: "I've tried so many programs before. This was the first time I actually had someone adjusting my plan weekly. The nutrition guidance alone changed everything for me.",
        },
        {
          name: "Omar K.",
          duration: "Training Plan",
          result: "Consistent 6 months",
          text: "The plan is incredibly structured. I knew exactly what to do every day. Went from no structure to training 5x a week consistently. Worth every pound.",
        },
        {
          name: "Karim T.",
          duration: "3-Month Coaching · Renewed",
          result: "−12 kg total · 2 cycles",
          text: "The check-ins kept me accountable like nothing else. Coach Amar adjusts everything based on your actual progress, not just a formula. Renewed for another cycle immediately.",
        },
        {
          name: "Youssef A.",
          duration: "Personal Coaching",
          result: "Body recomposition",
          text: "Lost fat, gained muscle simultaneously. The personalized approach made the difference — my previous coach gave me the exact same plan as everyone else.",
        },
      ],
    },
    faq: {
      badge: "FAQ",
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about the plans, coaching, and how we work together.",
      items: [
        {
          q: "Is the training plan personalized to me?",
          a: "The Training Plan (499 LE / 19 €) is a structured, science-based system built using proven methodology. It is not customized to your individual measurements. For fully personalized programming, Personal Coaching (2,499 LE / 119 €) is the right choice.",
        },
        {
          q: "How do I receive the training plan after payment?",
          a: "The process is fully automated. After payment confirmation, your account is created and the training plan is instantly unlocked in your dashboard. You will also receive an email with your access details. No waiting, no manual steps.",
        },
        {
          q: "What is included in personal coaching?",
          a: "Personal Coaching includes a fully customized training split, personalized nutrition plan (calories, macros, meal plan), supplement guidance, cardio programming, and 3 months of direct follow-up with Coach Amar including weekly check-ins and ongoing adjustments.",
        },
        {
          q: "How does the 3-month coaching work?",
          a: "After payment you complete an onboarding questionnaire. Coach Amar then builds your personalized system (training, nutrition, supplements, cardio). Weekly check-ins track your progress and everything is adjusted based on your actual results.",
        },
        {
          q: "What happens after the 3 months end?",
          a: "When your coaching period ends, a renewal option appears in your dashboard. You can continue for another 3 months at 1,999 LE / 99 €. Coach Amar will have your full history and can build on your progress seamlessly.",
        },
        {
          q: "Can I renew coaching after the 3 months?",
          a: "Yes. Renewal is 1,999 LE / 99 € for an additional 3 months and is only available to existing coaching clients. It is not a separate public offer — it appears in your dashboard as your period approaches expiration.",
        },
        {
          q: "Can beginners join? Do I need gym experience?",
          a: "Yes. Both offers are available regardless of experience level. During onboarding (for coaching), you provide your current fitness level and Coach Amar builds your program accordingly. Beginners, intermediate and advanced athletes all benefit from the personalization.",
        },
        {
          q: "How do the weekly check-ins work?",
          a: "Each week you submit your weight, progress photos, and any notes through your client dashboard. Coach Amar reviews your submission, evaluates your progress, and updates your training, nutrition, or cardio as needed. You then receive updated plans and a coach message.",
        },
      ],
    },
    finalCta: {
      badge: "Ready?",
      titleLine1: "YOUR GOAL.",
      titleLine2: "YOUR SYSTEM.",
      titleLine3: "YOUR NEXT LEVEL.",
      subtitle: "Stop searching for the right plan. Start building the right system — built specifically for your body, your goals, and your life.",
      planBtn: "Get The Split — 499 LE / 19 €",
      coachingBtn: "Work With Me — 2,499 LE / 119 €",
      footerTag: "Personalized · Adjustable · Results-driven",
    },
    footer: {
      desc: "Personalized training, nutrition, and coaching built around your goals and your life.",
      navigate: "Navigate",
      offers: "Offers",
      planOffer: "Training Plan — 499 LE / 19 €",
      coachingOffer: "Personal Coaching — 2,499 LE / 119 €",
      rights: "Coach Amar. All rights reserved.",
      tag: "Premium Fitness Coaching",
    },
    checkout: {
      pageTitle: "Secure Order Checkout",
      badge: "Checkout",
      heading: "Complete Your Order",
      subheading: "Select your package and payment method to get started immediately.",
      planSelectorTitle: "Select Your Plan",
      plan1Title: "Training Plan",
      plan1Price: "499 LE / 19 €",
      plan1Desc: "Complete 7-day training split, digital guide & progression framework.",
      plan2Title: "3-Month Personal Coaching",
      plan2Price: "2,499 LE / 119 €",
      plan2Badge: "Recommended",
      plan2Desc: "Full custom diet, training, supplements, cardio & weekly 1-on-1 check-ins.",
      clientDetailsTitle: "Client Details",
      nameLabel: "Full Name",
      namePlaceholder: "Ahmed Mohamed",
      phoneLabel: "Phone / WhatsApp Number",
      phonePlaceholder: "01012345678",
      emailLabel: "Email Address",
      emailPlaceholder: "ahmed@example.com",
      goalLabel: "Primary Goal",
      goalOptions: [
        "Fat Loss & Definition",
        "Muscle Building & Bulking",
        "Body Recomposition",
        "Strength & Athletic Performance",
      ],
      levelLabel: "Fitness Experience",
      levelOptions: [
        "Beginner (< 1 year)",
        "Intermediate (1 - 3 years)",
        "Advanced (3+ years)",
      ],
      notesLabel: "Injuries or Dietary Preferences (Optional)",
      notesPlaceholder: "e.g., knee issues, lactose intolerance, specific schedule...",
      paymentTitle: "Payment Method",
      instaPay: "InstaPay (IPN Transfer)",
      payPal: "PayPal (International & Fast)",
      telda: "Telda (Instant Transfer)",
      instaPayInfo: "Transfer to InstaPay Username: amar.fitness@instapay",
      payPalInfo: "Send payment via PayPal to: amar.fitness@paypal.me",
      teldaInfo: "Send transfer to Telda username: @amar.fitness",
      summaryTitle: "Order Summary",
      subtotal: "Subtotal",
      taxes: "Taxes & Fees",
      freeTax: "0 LE",
      total: "Total",
      guarantee: "100% Satisfaction & Direct Delivery Guarantee",
      submitBtn: "Complete Order & Activate Now",
      submittingBtn: "Processing Order...",
      successTitle: "Order Confirmed Successfully!",
      successMessage: "Thank you! Your order has been registered. Coach Amar will contact you on WhatsApp right away to start your onboarding.",
      whatsappBtn: "Contact Coach Amar on WhatsApp",
      backHome: "Back to Home Page",
    },
  },
  ar: {
    dir: "rtl",
    nav: {
      brand: "كوتش عمار",
      plans: "الباقات",
      coach: "عن الكوتش",
      results: "النتائج",
      faq: "الأسئلة الشائعة",
      startNow: "ابدأ الآن",
      login: "تسجيل الدخول",
      langSwitch: "English",
    },
    hero: {
      badge: 'X "MÉTHODE"',
      titleLine1: "THE AMAR",
      titleLine2: '“X SPLIT”',
      titleLine3: "BUILD DIFFERENT",
      description: "مش مجرد ملف PDF عادي. نظام تدريب وتغذية متكامل مصمم خصيصاً لجسمك، جدول يومك، وأهدافك الرياضية.",
      startBtn: "ابدأ رحلة تحولك الآن",
      meetBtn: "Let's Talk",
      appBtn: "تطبيق المتدربين X App",
      stat1Value: "+100",
      stat1Label: "متدرب حققوا أهدافهم",
      stat2Value: "95%",
      stat2Label: "نسبة الالتزام والنجاح",
      stat3Value: "0",
      stat3Label: "تقييم المشتركين",
      cardBadge: "كوتش عمار",
      cardTitle: "تدريب شخصي ومتابعة خاصة 1-على-1",
    },
    trust: {
      items: [
        "مخصص لجسمك",
        "منظم باحترافية",
        "مبني على أرقام وبيانات",
        "استمرارية مضمونة",
        "تطور تدريجي",
        "أسس علمية حديثة",
        "تركيز على النتائج",
        "متابعة ومحاسبة مستمرة",
      ],
    },
    problem: {
      badge: "العلم والتطوير",
      title: "ليه التمرين العشوائي مبيجيبش نتيجة؟",
      subtitle: "دخول الجيم بدون منظومة علمية واضحة هو أكبر مضيعة للوقت والمجهود. سواء طبقت جدول Amar X Split بنفسك أو انضممت للتدريب الشامل مع التغذية — النتائج الحقيقية تحتاج نظاماً مدروساً.",
      genericTitleBadge: "الأسلوب العشوائي والأنظمة المنسوخة",
      genericHeading: "مجهود شاق وتعب.. بدون بناء عضلي حقيقي",
      genericPoints: [
        "تمرين عشوائي يومياً بدون هيكل 7 أيام منظم",
        "غياب قواعد زيادة الأحمال (Progressive Overload) أسبوعياً",
        "تخمين المجموعات والعدات وفترات الراحة بين التمارين",
        "إهمال نقاط الضعف والاستشفاء العضلي الصحيح",
        "تغذية عشوائية بدون حساب دقيق للسعرات والماكروز",
        "ثبات الأوزان وشكل الجسم لشهور طويلة بدون أي تطور",
      ],
      coachingTitleBadge: "منظومة Coach Amar العلمية",
      coachingHeading: "هيكل تدريبي احترافي + تغذية دقيقة وموجهة",
      coachingPoints: [
        "جدول Amar X Split متكامل (7 أيام): تقسيم علمي لأعلى نمو عضلي",
        "نظام زيادة أحمال وتطور أسبوعي محسوب بالأرقام",
        "منهجية تركيز وتقوية نقاط الضعف العضلية بدقة",
        "خطة تغذية محسوبة السعرات والماكروز بالجرام (مع باقة الكوتشينج)",
        "متابعة أسبوعية مباشرة وتعديل مستمر للخطط (مع باقة الكوتشينج)",
        "وضوح كامل في كل تمرين — وداعاً للحيرة والعشوائية في الجيم",
      ],
    },
    twoPaths: {
      badge: "ابدأ رحلتك",
      title: "عايز تبدأ تتمرن إزاي؟",
      subtitle: "باقتين، هدف واحد. الفرق الوحيد هو حجم المتابعة والدعم المباشر اللي محتاجه.",
      offer1: {
        badge: "العرض الأول",
        title: "عمار X سبليت",
        sub: "التزم وطبق بنفسك",
        price: "٤٩٩",
        currency: "ج.م / 19 €",
        type: "دفع لمرة واحدة",
        features: [
          "تقسيمة تمارين كاملة 7 أيام",
          "اختيار التمارين وملاحظات الأداء الحركي",
          "تحديد المجموعات والتكرارات وفترات الراحة",
          "نظام تركيز على نقاط الضعف",
          "نظام زيادة الأحمال والتطور أسبوعياً",
          "استلام فوري للبرنامج مباشرة بعد الدفع",
        ],
        btn: "احصل على السبليت — ٤٩٩ ج.م / 19 €",
        delivery: "وصول فوري للوحة التحكم بعد الدفع",
      },
      offer2: {
        badge: "العرض الثاني · الأكثر طلباً",
        title: "التدريب والمتابعة الشخصية",
        sub: "النظام المتكامل · ٣ شهور",
        price: "٢,٤٩٩",
        currency: "ج.م / 119 €",
        type: "لمدة ٣ شهور",
        features: [
          "برنامج تدريب مخصص بالكامل لجسمك وهدفك",
          "خطة تغذية محسوبة السعرات والماكروز",
          "توجيهات المكملات والجرعات وأوقاتها",
          "متابعة شخصية مستمرة لمدة ٣ شهور",
          "تشيك إن أسبوعي وتعديلات على الخطة",
          "تواصل مباشر مع كوتش عمار للاستفسارات",
          "برنامج الكارديو واللياقة القلبية",
          "مراقبة دقيقة للأوزان والقياسات",
        ],
        btn: "ابدأ التدريب الآن — ٢,٤٩٩ ج.م / 119 €",
        renewal: "التجديد بعد ٣ شهور: ١,٩٩٩ ج.م / 99 € فقط",
      },
    },
    trainingDetail: {
      badge: "العرض الأول · ٤٩٩ ج.م / 19 €",
      titleLine1: "عمار",
      titleLine2: "X سبليت",
      desc: "نظام تدريبي علمي ومنظم على 7 أيام تقدر تطبقه بنفسك بكل ثقة. مبني بنفس المنهجية المتبعة في التدريب الشخصي، لكن بدون المتابعة الأسبوعية المستمرة.",
      highlights: [
        { title: "تقسيمة تمارين 7 أيام كاملة", desc: "برنامج مصمم لأعلى بناء عضلي وقوة" },
        { title: "المجموعات والعدات وفترات الراحة", desc: "أرقام محددة بدقة لكل تمرين بدون أي حيرة" },
        { title: "نظام تركيز نقاط الضعف", desc: "حدد نقاط الضعف وركز عليها للنتائج السريعة" },
        { title: "دليل زيادة الأوزان والتطور", desc: "إزاي تزود قوتك أسبوع ورا أسبوع لضمان النتائج" },
      ],
      btn: "احصل على السبليت — ٤٩٩ ج.م / 19 €",
      paymentInfo: "دفع لمرة واحدة\nاستلام فوري ومباشر",
      cardBadge: "دفع لمرة واحدة",
      cardPrice: "٤٩٩",
      cardCurrency: "ج.م / 19 €",
      cardSub: "استلام فوري",
    },
    coachingDetail: {
      badge: "العرض الثاني · ٢,٤٩٩ ج.م / 119 € · ٣ شهور",
      titleLine1: "التدريب الشخصي —",
      titleLine2: "النظام المتكامل",
      desc: "مش مجرد جدول تمارين. ده نظام أداء متكامل مبني حول جسمك وظروفك، بيتعدل أسبوعياً حسب نتايجك، وتحت إشراف كوتش متخصص كل يوم.",
      pillars: [
        {
          title: "التدريب",
          items: ["تقسيمة تدريب مخصصة", "اختيار التمارين المناسبة", "المجموعات والعدات والراحة", "نظام التطور وزيادة الأحمال", "برنامج الكارديو"],
        },
        {
          title: "التغذية",
          items: ["سعرات محسوبة بالجرام", "تقسيم البروتين والكارب والدهون", "دايت بلان مرن ومحبب", "بدائل لكل الأكلات", "تعديلات دورية حسب الوزن"],
        },
        {
          title: "المكملات",
          items: ["كورس مكملات مناسب لهدفك", "مواعيد وجرعات المكملات", "تعديلات حسب الحاجة", "بدائل اقتصادية وفعالة"],
        },
        {
          title: "المتابعة",
          items: ["٣ شهور تدريب شخصي", "تشيك إن أسبوعي بالصور والوزن", "تعديل التمارين دورياً", "تعديل الدايت أسبوعياً", "تواصل مباشر مع الكوتش"],
        },
      ],
      clientStats: [
        { label: "متدرب نشط", value: "+100" },
        { label: "متوسط فترة التحول", value: "12 أسبوع" },
      ],
      visualTitle: "أنت مش بتشتري مجرد ملف PDF.",
      visualDesc: "أنت بتشترك في نظام حي بيتعدل كل أسبوع على أساس استجابة جسمك وتطورك الحقيقي. تمرين، تغذية، مكملات وكارديو — كلها متصممة ليك وتحت المتابعة الدقيقة.",
      feature1: "مراجعة أسبوعية مفصلة مع كوتش عمار",
      feature2: "شات مباشر لأي أسئلة وتعديلات سريعة",
      feature3: "إمكانية التجديد بعد ٣ شهور بسعر ١,٩٩٩ ج.م / 99 € فقط",
      btn: "ابدأ التدريب الشخصي — ٢,٤٩٩ ج.م / 119 €",
    },
    howItWorks: {
      badge: "خطوات العمل",
      title: "كيف يعمل النظام؟",
      subtitle: "بسيط، واضح، ومؤتمت بالكامل. من لحظة الدفع وحتى استلام خطتك وبدء التمرين بدون أي تأخير.",
      planTrack: "خطة التدريب · ٤٩٩ ج.م / 19 €",
      coachingTrack: "التدريب والمتابعة الشخصية · ٢,٤٩٩ ج.م / 119 €",
      planSteps: [
        { step: "01", title: "الطلب والدفع", desc: "دفع آمن وسريع عبر المحافظ الإلكترونية أو إنستاباي" },
        { step: "02", title: "تفعيل الحساب", desc: "إنشاء حسابك وإرسال بيانات الدخول فوراً" },
        { step: "03", title: "استلام السبليت", desc: "فتح نظام التدريب الكامل على لوحة التحكم الخاصة بك" },
      ],
      coachingSteps: [
        { step: "01", title: "الاشتراك", desc: "دفع آمن وبداية فترة التدريب الـ ٣ شهور" },
        { step: "02", title: "استمارة التقييم", desc: "ملء استبيان القياسات، الهدف، التاريخ الصحي والرياضي" },
        { step: "03", title: "تصميم النظام", desc: "كوتش عمار يصمم نظامك المخصص (تمرين، دايت، مكملات)" },
        { step: "04", title: "انطلاق التدريب", desc: "بدء تطبيق الخطة والتواصل عبر الشات المباشر" },
        { step: "05", title: "التشيك إن الأسبوعي", desc: "مراجعة الصور والأوزان وتعديل البرنامج باستمرار" },
        { step: "06", title: "تجديد الاشتراك", desc: "إمكانية مواصلة التحول بخصم حصري ١,٩٩٩ ج.م / 99 € / ٣ شهور" },
      ],
    },
    coach: {
      badge: "مدربك الشخصي",
      titleLine1: "أكثر من مجرد",
      titleLine2: "جدول تمارين.",
      name: "كوتش عمار",
      sub: "مدرب لياقة بدنية معتمد · أخصائي تغذية رياضية",
      bio: "مش بقدّم جداول جاهزة أو مكررة. على مدار أكتر من 4 سنين طوّرت منهجية تدريب بتعتمد على أسس علمية للاستمرارية، وزيادة الأحمال التدريجية، والتغذية الدقيقة المناسبة لطبيعة كل جسم. كل متدرب بيحصل على متابعتي واهتمامي المباشر.",
      points: [
        "متخصص في إعادة تشكيل الجسم (Body Recomposition) وزيادة القوة والكتلة العضلية",
        "منهجية علمية مجربة تدمج بين علوم الفسيولوجيا والتطبيق العملي في الجيم",
        "متابعة أسبوعية دقيقة وتعديلات فورية على البرامج",
      ],
      btn: "اشترك الآن مع كوتش عمار",
      igBtn: "تابعني على إنستجرام",
      ytBtn: "قناة اليوتيوب",
      card1: "تدريب شخصي 1-على-1",
      card2: "علوم التدريب الحديثة",
      card3: "تركيز على النتيجة (12 أسبوع)",
    },
    experience: {
      badge: "الرحلة الكاملة",
      titleLine1: "تجربتك التدريبية",
      titleLine2: "على مدار ١٢ أسبوع",
      subtitle: "شوف بالتفصيل إيه اللي هيحصل معاك خلال فترة التدريب والمتابعة.",
      weeks: [
        {
          week: "الأسبوع 01",
          label: "مرحلة التأسيس",
          training: { completed: 2, total: 4, label: "أيام التمرين" },
          nutrition: { value: "2,400 سعرة", label: "الهدف اليومي" },
          cardio: { value: "مرتين/أسبوع", label: "شدة خفيفة" },
          checkin: "نهاية الأسبوع الأول",
          progress: "اكتمال استمارة التقييم والبداية",
        },
        {
          week: "الأسبوع 04",
          label: "مرحلة البناء والتقدم",
          training: { completed: 4, total: 5, label: "أيام التمرين" },
          nutrition: { value: "2,600 سعرة", label: "تعديل السعرات" },
          cardio: { value: "3 مرات/أسبوع", label: "شدة متوسطة" },
          checkin: "إرسال صور التطور والميزان",
          progress: "خسارة 2.1 كجم دهون ونشاط أعلى",
        },
        {
          week: "الأسبوع 08",
          label: "مرحلة الذروة والنتائج",
          training: { completed: 5, total: 5, label: "أيام التمرين" },
          nutrition: { value: "2,350 سعرة", label: "ضبط الماكروز" },
          cardio: { value: "4 مرات/أسبوع", label: "كارديو مدمج" },
          checkin: "مراجعة منتصف البرنامج",
          progress: "زيادة القوة +14% وخسارة 5 كجم",
        },
        {
          week: "الأسبوع 12",
          label: "المرحلة النهائية والتحول",
          training: { completed: 5, total: 5, label: "أيام التمرين" },
          nutrition: { value: "2,200 سعرة", label: "الخطة النهائية" },
          cardio: { value: "5 مرات/أسبوع", label: "أعلى كثافة" },
          checkin: "مراجعة التحول النهائي",
          progress: "تحقيق الهدف المطلوب وجاهز للتجديد",
        },
      ],
      metricsTraining: "التدريب",
      metricsNutrition: "التغذية",
      metricsCardio: "الكارديو",
      metricsCheckIn: "التشيك إن القادم",
      metricsProgress: "مستوى التقدم",
    },
    testimonials: {
      badge: "نتائج المشتركين",
      titleLine1: "نتائج حقيقية.",
      titleLine2: "لأشخاص حقيقيين.",
      subtitle: "آراء وقصص نجاح من متدربين التزموا بالنظام وحققوا أهدافهم.",
      list: [
        {
          name: "أحمد م.",
          duration: "اشتراك ٣ شهور متابعة",
          result: "−8 كجم · زيادة القوة 20%",
          text: "جربت برامج كتير جداً قبل كده. دي كانت أول مرة ألاقي مدرب بيعدل لي النظام أسبوعياً فعلاً. توجيهات التغذية لوحدها غيرت شكل جسمي وطاقتي تماماً.",
        },
        {
          name: "عمر ك.",
          duration: "خطة التدريب",
          result: "استمرارية 6 شهور",
          text: "الخطة منظمة لأبعد حد. بقيت عارف بالظبط هعمل إيه كل يوم في الجيم. من عدم انتظام لتمرين 5 أيام في الأسبوع بثبات. تستاهل كل قرش.",
        },
        {
          name: "كريم ت.",
          duration: "متابعة ٣ شهور · تم التجديد",
          result: "−12 كجم في دورتين",
          text: "التشيك إن الأسبوعي خلاني ملتزم جداً. كوتش عمار بيعدل كل حاجة على أساس تقدمك الفعلي مش مجرد معادلة ثابتة. جددت فوراً لدورة تانية.",
        },
        {
          name: "يوسف ع.",
          duration: "تدريب ومتابعة شخصية",
          result: "إعادة تشكيل الجسم بالكامل",
          text: "خسرت دهون وزدت عضل في نفس الوقت. المتابعة المخصصة هي اللي صنعت الفارق — كوتشي القديم كان مديني نفس جدول باقي الناس في الجيم.",
        },
      ],
    },
    faq: {
      badge: "الأسئلة الشائعة",
      title: "كل ما تود معرفته",
      subtitle: "إجابات واضحة على كل الأسئلة المتعلقة بالباقات وطريقة التدريب والمتابعة.",
      items: [
        {
          q: "هل خطة التدريب (٣٩٩ ج.م / 19 €) مخصصة لجسمي فقط؟",
          a: "خطة التدريب (٤٩٩ ج.م / 19 €) هي نظام تدريبي علمي ومنظم تم بناؤه بأفضل المنهجيات المجربة، ولكنها غير مخصصة لقياساتك الفردية اليومية. إذا كنت تبحث عن خطة مخصصة 100% لجسمك مع دايت ومتابعة أسبوعية، فإن باقة التدريب الشخصي (٢,٤٩٩ ج.م / 119 €) هي الخيار المثالي.",
        },
        {
          q: "كيف أستلم الخطة التدريبية بعد إتمام الدفع؟",
          a: "العملية مؤتمتة بالكامل. بمجرد تأكيد الدفع، يتم إنشاء حسابك فوراً وفتح الخطة التدريبية داخل لوحة التحكم الخاصة بك مع إرسال بيانات الدخول، بدون أي انتظار.",
        },
        {
          q: "ماذا تشمل باقة التدريب والمتابعة الشخصية؟",
          a: "تشمل برنامج تدريبي مخصص بالكامل، خطة تغذية محسوبة السعرات والماكروز، توجيهات المكملات، برنامج الكارديو، ومتابعة شخصية مباشرة لمدة ٣ شهور مع كوتش عمار عبر التشيك إن الأسبوعي والشات المباشر.",
        },
        {
          q: "كيف تتم المتابعة خلال الـ ٣ شهور؟",
          a: "بعد الدفع تقوم بملء استمارة التقييم الشاملة. يقوم كوتش عمار بتصميم خطتك المتكاملة، ويتم التواصل أسبوعياً لتقييم الوزن والصور وتحديث التمارين والدايت حسب استجابة جسمك.",
        },
        {
          q: "ماذا يحدث بعد انتهاء فترة الـ ٣ شهور؟",
          a: "عند اقتراب انتهاء المدة، يظهر لك خيار التجديد داخل لوحة التحكم بسعر مخفض ١,٩٩٩ ج.م / 99 € لـ ٣ شهور إضافية للاستمرار في تحقيق أهدافك بدون انقطاع.",
        },
        {
          q: "هل يمكنني تجديد المتابعة لاحقاً؟",
          a: "نعم، التجديد متاح لجميع المشتركين بسعر ١,٩٩٩ ج.م / 99 € فقط لكل ٣ شهور إضافية مع الاحتفاظ بكافة بياناتك وسجلات تقدمك السابقة.",
        },
        {
          q: "هل الباقات مناسبة للمبتدئين في الجيم؟",
          a: "نعم بالتأكيد! البرامج مصممة لتناسب جميع المستويات سواء كنت مبتدئاً أو متوسطاً أو متقدماً. في باقة المتابعة، يتم تصميم التمارين والأحمال بناءً على مستواك الحالي تماماً.",
        },
        {
          q: "كيف يعمل التشيك إن (Check-in) الأسبوعي؟",
          a: "كل أسبوع تقوم برفع وزنك وصور التطور وأي ملاحظات عبر لوحة التحكم. كوتش عمار يقوم بمراجعة تقريرك وتحديث خطة التغذية أو التمرين وتوجيهك بالخطوات القادمة.",
        },
      ],
    },
    finalCta: {
      badge: "جاهز تبدأ؟",
      titleLine1: "هدفك الرياضي.",
      titleLine2: "نظامك المصمم ليك.",
      titleLine3: "مستواك القادم.",
      subtitle: "كفاية تضييع وقت في البحث عن خطط عشوائية. ابدأ دلوقتي مع نظام حقيقي مبني خصيصاً لجسمك، أهدافك، وحياتك.",
      planBtn: "احصل على السبليت — ٤٩٩ ج.م / 19 €",
      coachingBtn: "اشترك في المتابعة الشخصية — ٢,٤٩٩ ج.م / 119 €",
      footerTag: "مخصص · مرن وقابل للتعديل · نتائج مضمونة",
    },
    footer: {
      desc: "أنظمة تدريب وتغذية ومتابعة شخصية احترافية مصممة خصيصاً لتحقيق أهدافك وبناء جسمك الرياضي.",
      navigate: "روابط سريعة",
      offers: "الباقات والعروض",
      planOffer: "خطة التدريب — ٤٩٩ ج.م / 19 €",
      coachingOffer: "التدريب والمتابعة الشخصية — ٢,٤٩٩ ج.م / 119 €",
      rights: "كوتش عمار. جميع الحقوق محفوظة.",
      tag: "تدريب لياقة بدنية احترافي",
    },
    checkout: {
      pageTitle: "إتمام الطلب والدفع الآمن",
      badge: "صفحة الدفع",
      heading: "أكمل بيانات اشتراكك",
      subheading: "اختر باقتك وطريقة الدفع المفضلة للبدء الفوري مع كوتش عمار.",
      planSelectorTitle: "اختر باقتك التدريبية",
      plan1Title: "خطة التدريب المتكاملة",
      plan1Price: "٤٩٩ ج.م / 19 €",
      plan1Desc: "نظام 7 أيام كامل، دليل التمرين وزيادة الأوزان مع لوحة تحكم فورية.",
      plan2Title: "التدريب والمتابعة الشخصية (٣ شهور)",
      plan2Price: "٢,٤٩٩ ج.م / 119 €",
      plan2Badge: "الأكثر طلباً",
      plan2Desc: "دايت مخصص، جدول تمرين مفصل، كورس مكملات، كارديو، ومتابعة أسبوعية مباشرة مع الكوتش.",
      clientDetailsTitle: "بيانات المشترك",
      nameLabel: "الاسم بالكامل",
      namePlaceholder: "أحمد محمد",
      phoneLabel: "رقم الهاتف / الواتساب",
      phonePlaceholder: "01012345678",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "ahmed@example.com",
      goalLabel: "هدفك الأساسي",
      goalOptions: [
        "حرق الدهون والتنشيف",
        "بناء العضلات والضخامة",
        "إعادة تشكيل الجسم (خسارة دهون وبناء عضل)",
        "زيادة القوة واللياقة البدنية العامة",
      ],
      levelLabel: "مستواك الحالي في التمرين",
      levelOptions: [
        "مبتدئ (أقل من سنة)",
        "متوسط (من سنة إلى ٣ سنوات)",
        "متقدم (أكثر من ٣ سنوات)",
      ],
      notesLabel: "أي إصابات أو تفضيلات غذائية (اختياري)",
      notesPlaceholder: "مثال: حساسية ألبان، إصابة سابقة في الركبة، مواعيد خاصة...",
      paymentTitle: "طريقة الدفع",
      instaPay: "إنستاباي (تحويل فوري IPN)",
      payPal: "باي بال (PayPal للدفع الدولي)",
      telda: "تيلدا (Telda تحويل فوري)",
      instaPayInfo: "التحويل عبر إنستاباي إلى المعرّف: amar.fitness@instapay",
      payPalInfo: "الدفع عبر PayPal على: amar.fitness@paypal.me",
      teldaInfo: "التحويل عبر تطبيق تيلدا على المعرّف: amar.fitness@",
      summaryTitle: "ملخص الطلب",
      subtotal: "المجموع الفرعي",
      taxes: "الرسوم والضرائب",
      freeTax: "٠ ج.م",
      total: "الإجمالي",
      guarantee: "ضمان الجودة والتفعيل الفوري والمباشر",
      submitBtn: "تأكيد الطلب وتفعيل الاشتراك الآن",
      submittingBtn: "جاري تأكيد وتسجيل الطلب...",
      successTitle: "تم تسجيل طلبك بنجاح!",
      successMessage: "شكراً لك! تم استلام بياناتك وتأكيد طلبك. كوتش عمار سيتواصل معك عبر الواتساب فوراً لبدء تقييمك واستلام خطتك.",
      whatsappBtn: "تواصل مع كوتش عمار عبر الواتساب",
      backHome: "العودة للصفحة الرئيسية",
    },
  },
};
