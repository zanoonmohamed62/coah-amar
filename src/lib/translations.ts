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
    description: string;
    startBtn: string;
    meetBtn: string;
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
    vodafoneCash: string;
    instaPay: string;
    creditCard: string;
    vodafoneInfo: string;
    instaPayInfo: string;
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
      badge: "Elite Fitness Coaching",
      titleLine1: "BUILD THE BODY.",
      titleLine2: "BUILD THE SYSTEM.",
      description: "Not a generic PDF. A personalized coaching system built around your body, schedule, and goals.",
      startBtn: "Start Your Transformation",
      meetBtn: "Meet Coach Amar",
      stat1Value: "200+",
      stat1Label: "Clients Coached",
      stat2Value: "95%",
      stat2Label: "Completion Rate",
      stat3Value: "4.9★",
      stat3Label: "Client Rating",
      cardBadge: "Coach Amar",
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
      badge: "The Problem",
      title: "Why Generic Plans Fail",
      subtitle: "A plan built for everyone is built for no one. Your body is different. Your goals are different. Your system should be too.",
      genericTitleBadge: "The Generic Plan",
      genericHeading: "Same plan. Different person.",
      genericPoints: [
        "Same plan for everyone",
        "No adjustments for your body",
        "No nutrition guidance",
        "No accountability",
        "No progress tracking",
        "PDF you never open again",
      ],
      coachingTitleBadge: "Coach Amar System",
      coachingHeading: "Built around you. Adjusted continuously.",
      coachingPoints: [
        "Built around your body and goals",
        "Adjusted as you progress",
        "Personalized nutrition plan",
        "Direct coach accountability",
        "Weekly check-ins and monitoring",
        "Living system that evolves with you",
      ],
    },
    twoPaths: {
      badge: "Choose Your Path",
      title: "How Do You Want to Train?",
      subtitle: "Two offers. One goal. The difference is how much support you want around you.",
      offer1: {
        badge: "Offer 01",
        title: "TRAINING PLAN",
        sub: "Do It Yourself",
        price: "399",
        currency: "LE",
        type: "One-time",
        features: [
          "Complete training split",
          "Exercise selection & technique notes",
          "Sets, reps & rest periods",
          "Weekly progression structure",
          "Immediate digital delivery",
        ],
        btn: "Get The Plan — 399 LE",
        delivery: "Instant access after payment",
      },
      offer2: {
        badge: "Offer 02 · Most Popular",
        title: "PERSONAL COACHING",
        sub: "Full System · 3 Months",
        price: "1,399",
        currency: "LE",
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
        btn: "Start Coaching — 1,399 LE",
        renewal: "Renewal: 999 LE / 3 months",
      },
    },
    trainingDetail: {
      badge: "Offer 01 · 399 LE",
      titleLine1: "THE TRAINING",
      titleLine2: "PLAN",
      desc: "A structured, science-based training system you can follow independently. Built with the same methodology used in personal coaching — just without the ongoing guidance.",
      highlights: [
        { title: "Full Training Split", desc: "Push · Pull · Legs structured for maximum muscle growth" },
        { title: "Complete Exercise List", desc: "Every exercise with technique notes and alternatives" },
        { title: "Sets, Reps & Rest", desc: "Exact parameters for each lift — nothing left to guessing" },
        { title: "Progression Guide", desc: "How to advance week by week for continuous results" },
      ],
      btn: "Get The Plan — 399 LE",
      paymentInfo: "One-time payment\nInstant digital delivery",
      cardBadge: "One-Time",
      cardPrice: "399",
      cardCurrency: "LE",
      cardSub: "Instant Delivery",
    },
    coachingDetail: {
      badge: "Offer 02 · 1,399 LE · 3 Months",
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
        { label: "Active Clients", value: "200+" },
        { label: "Avg. Progress", value: "12 wks" },
      ],
      visualTitle: "You're Not Buying a PDF.",
      visualDesc: "You're getting a living system that adjusts every week based on your actual progress. Training, nutrition, supplements and cardio — all built around you and monitored closely.",
      feature1: "Weekly progress reviews with Coach Amar",
      feature2: "Direct messaging for questions & adjustments",
      feature3: "Renewal available after 3 months — 999 LE",
      btn: "START COACHING — 1,399 LE",
    },
    howItWorks: {
      badge: "Process",
      title: "How It Works",
      subtitle: "Simple, transparent, fully automated. From payment to plan — no waiting, no confusion.",
      planTrack: "Training Plan · 399 LE",
      coachingTrack: "Personal Coaching · 1,399 LE",
      planSteps: [
        { step: "01", title: "Purchase", desc: "One-time payment processed securely" },
        { step: "02", title: "Account Created", desc: "Access credentials sent instantly" },
        { step: "03", title: "Plan Delivered", desc: "Full training system unlocked in your dashboard" },
      ],
      coachingSteps: [
        { step: "01", title: "Purchase", desc: "Secure payment · Coaching period begins" },
        { step: "02", title: "Onboarding", desc: "Fill your assessment & goals questionnaire" },
        { step: "03", title: "Your Plan", desc: "Coach Amar builds your personalized system" },
        { step: "04", title: "Coaching Starts", desc: "Training, nutrition, supplements & cardio live" },
        { step: "05", title: "Weekly Progress", desc: "Check-ins, adjustments & ongoing refinement" },
        { step: "06", title: "Renew", desc: "Continue your transformation — 999 LE / 3 months" },
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
          a: "The Training Plan (399 LE) is a structured, science-based system built using proven methodology. It is not customized to your individual measurements. For fully personalized programming, Personal Coaching (1,399 LE) is the right choice.",
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
          a: "When your coaching period ends, a renewal option appears in your dashboard. You can continue for another 3 months at 999 LE. Coach Amar will have your full history and can build on your progress seamlessly.",
        },
        {
          q: "Can I renew coaching after the 3 months?",
          a: "Yes. Renewal is 999 LE for an additional 3 months and is only available to existing coaching clients. It is not a separate public offer — it appears in your dashboard as your period approaches expiration.",
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
      planBtn: "Start Your Plan — 399 LE",
      coachingBtn: "Work With Me — 1,399 LE",
      footerTag: "Personalized · Adjustable · Results-driven",
    },
    footer: {
      desc: "Personalized training, nutrition, and coaching built around your goals and your life.",
      navigate: "Navigate",
      offers: "Offers",
      planOffer: "Training Plan — 399 LE",
      coachingOffer: "Personal Coaching — 1,399 LE",
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
      plan1Price: "399 LE",
      plan1Desc: "Complete Push/Pull/Legs system, digital guide & progression framework.",
      plan2Title: "3-Month Personal Coaching",
      plan2Price: "1,399 LE",
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
      vodafoneCash: "Vodafone Cash / Mobile Wallets",
      instaPay: "InstaPay (IPN Transfer)",
      creditCard: "Debit / Credit Card (Visa/Mastercard)",
      vodafoneInfo: "Send transfer to: 01026048106 and send screenshot via WhatsApp.",
      instaPayInfo: "Transfer to InstaPay Username: amar.fitness@instapay",
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
      badge: "تدريب لياقة بدنية احترافي",
      titleLine1: "ابنِ جسمك المثالي.",
      titleLine2: "ابنِ نظامك المتكامل.",
      description: "مش مجرد ملف PDF عادي. نظام تدريب وتغذية متكامل مصمم خصيصاً لجسمك، جدول يومك، وأهدافك الرياضية.",
      startBtn: "ابدأ رحلة تحولك الآن",
      meetBtn: "تعرف على كوتش عمار",
      stat1Value: "+200",
      stat1Label: "متدرب حققوا أهدافهم",
      stat2Value: "95%",
      stat2Label: "نسبة الالتزام والنجاح",
      stat3Value: "4.9★",
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
      badge: "المشكلة الحقيقية",
      title: "ليه الجداول الجاهزة بتفشل؟",
      subtitle: "الجدول اللي معمول لأي حد.. مش مناسب لأي حد. جسمك مختلف، أهدافك مختلفة، ونظامك لازم يكون مفصل عليك أنت.",
      genericTitleBadge: "الأنظمة التقليدية الجاهزة",
      genericHeading: "نفس الجدول لكل الناس بدون تمييز",
      genericPoints: [
        "نفس التمرين لكل الأشخاص",
        "مفيش أي تعديل يناسب جسمك وإصاباتك",
        "بدون خطة تغذية محسوبة",
        "مفيش أي متابعة أو التزام",
        "بدون قياس تطور حقيقي للأوزان",
        "ملف PDF بتنزله وتنساه للأبد",
      ],
      coachingTitleBadge: "نظام كوتش عمار المخصص",
      coachingHeading: "مبني حواليك أنت.. وبيتعدل مع كل أسبوع",
      coachingPoints: [
        "مصمم خصيصاً لجسمك وهدفك",
        "تعديلات أسبوعية مستمرة حسب تطورك",
        "نظام غذائي وحساب سعرات وماكروز كامل",
        "متابعة مباشرة ومحاسبة من الكوتش",
        "تشيك إن أسبوعي لمتابعة الصور والأوزان",
        "نظام تفاعلي مرن يتطور مع حياتك",
      ],
    },
    twoPaths: {
      badge: "اختر مسارك",
      title: "عايز تبدأ تتمرن إزاي؟",
      subtitle: "باقتين، هدف واحد. الفرق الوحيد هو حجم المتابعة والدعم المباشر اللي محتاجه.",
      offer1: {
        badge: "العرض الأول",
        title: "خطة التدريب المتكاملة",
        sub: "التزم وطبق بنفسك",
        price: "399",
        currency: "ج.م",
        type: "دفع لمرة واحدة",
        features: [
          "تقسيمة تمارين كاملة (Push / Pull / Legs)",
          "اختيار التمارين وملاحظات الأداء الحركي",
          "تحديد المجموعات والتكرارات وفترات الراحة",
          "نظام زيادة الأحمال والتطور أسبوعياً",
          "استلام فوري للبرنامج مباشرة بعد الدفع",
        ],
        btn: "احصل على الخطة — ٣٩٩ ج.م",
        delivery: "وصول فوري للوحة التحكم بعد الدفع",
      },
      offer2: {
        badge: "العرض الثاني · الأكثر طلباً",
        title: "التدريب والمتابعة الشخصية",
        sub: "النظام المتكامل · ٣ شهور",
        price: "1,399",
        currency: "ج.م",
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
        btn: "ابدأ التدريب الآن — ١,٣٩٩ ج.م",
        renewal: "التجديد بعد ٣ شهور: ٩٩٩ ج.م فقط",
      },
    },
    trainingDetail: {
      badge: "العرض الأول · ٣٩٩ ج.م",
      titleLine1: "خطة التدريب",
      titleLine2: "المتكاملة",
      desc: "نظام تدريبي علمي ومنظم تقدر تطبقه بنفسك بكل ثقة. مبني بنفس المنهجية المتبعة في التدريب الشخصي، لكن بدون المتابعة الأسبوعية المستمرة.",
      highlights: [
        { title: "تقسيمة تمارين احترافية", desc: "Push · Pull · Legs مصممة لأعلى بناء عضلي وقوة" },
        { title: "قائمة تمارين شاملة", desc: "كل تمرين مشروح مع البدائل وتكنيك الأداء الصحيح" },
        { title: "المجموعات والعدات والراحة", desc: "أرقام محددة بدقة لكل تمرين بدون أي حيرة" },
        { title: "دليل زيادة الأوزان والتطور", desc: "إزاي تزود قوتك أسبوع ورا أسبوع لضمان النتائج" },
      ],
      btn: "احصل على الخطة — ٣٩٩ ج.م",
      paymentInfo: "دفع لمرة واحدة\nاستلام فوري ومباشر",
      cardBadge: "دفع لمرة واحدة",
      cardPrice: "399",
      cardCurrency: "ج.م",
      cardSub: "استلام فوري",
    },
    coachingDetail: {
      badge: "العرض الثاني · ١,٣٩٩ ج.م · ٣ شهور",
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
        { label: "متدرب نشط", value: "+200" },
        { label: "متوسط فترة التحول", value: "12 أسبوع" },
      ],
      visualTitle: "أنت مش بتشتري مجرد ملف PDF.",
      visualDesc: "أنت بتشترك في نظام حي بيتعدل كل أسبوع على أساس استجابة جسمك وتطورك الحقيقي. تمرين، تغذية، مكملات وكارديو — كلها متصممة ليك وتحت المتابعة الدقيقة.",
      feature1: "مراجعة أسبوعية مفصلة مع كوتش عمار",
      feature2: "شات مباشر لأي أسئلة وتعديلات سريعة",
      feature3: "إمكانية التجديد بعد ٣ شهور بسعر ٩٩٩ ج.م فقط",
      btn: "ابدأ التدريب الشخصي — ١,٣٩٩ ج.م",
    },
    howItWorks: {
      badge: "خطوات العمل",
      title: "كيف يعمل النظام؟",
      subtitle: "بسيط، واضح، ومؤتمت بالكامل. من لحظة الدفع وحتى استلام خطتك وبدء التمرين بدون أي تأخير.",
      planTrack: "خطة التدريب · ٣٩٩ ج.م",
      coachingTrack: "التدريب والمتابعة الشخصية · ١,٣٩٩ ج.م",
      planSteps: [
        { step: "01", title: "الطلب والدفع", desc: "دفع آمن وسريع عبر المحافظ الإلكترونية أو إنستاباي" },
        { step: "02", title: "تفعيل الحساب", desc: "إنشاء حسابك وإرسال بيانات الدخول فوراً" },
        { step: "03", title: "استلام الخطة", desc: "فتح نظام التدريب بالكامل على لوحة التحكم الخاصة بك" },
      ],
      coachingSteps: [
        { step: "01", title: "الاشتراك", desc: "دفع آمن وبداية فترة التدريب الـ ٣ شهور" },
        { step: "02", title: "استمارة التقييم", desc: "ملء استبيان القياسات، الهدف، التاريخ الصحي والرياضي" },
        { step: "03", title: "تصميم النظام", desc: "كوتش عمار يصمم نظامك المخصص (تمرين، دايت، مكملات)" },
        { step: "04", title: "انطلاق التدريب", desc: "بدء تطبيق الخطة والتواصل عبر الشات المباشر" },
        { step: "05", title: "التشيك إن الأسبوعي", desc: "مراجعة الصور والأوزان وتعديل البرنامج باستمرار" },
        { step: "06", title: "تجديد الاشتراك", desc: "إمكانية مواصلة التحول بخصم حصري ٩٩٩ ج.م / ٣ شهور" },
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
          q: "هل خطة التدريب (٣٩٩ ج.م) مخصصة لجسمي فقط؟",
          a: "خطة التدريب (٣٩٩ ج.م) هي نظام تدريبي علمي ومنظم تم بناؤه بأفضل المنهجيات المجربة، ولكنها غير مخصصة لقياساتك الفردية اليومية. إذا كنت تبحث عن خطة مخصصة 100% لجسمك مع دايت ومتابعة أسبوعية، فإن باقة التدريب الشخصي (١,٣٩٩ ج.م) هي الخيار المثالي.",
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
          a: "عند اقتراب انتهاء المدة، يظهر لك خيار التجديد داخل لوحة التحكم بسعر مخفض ٩٩٩ ج.م لـ ٣ شهور إضافية للاستمرار في تحقيق أهدافك بدون انقطاع.",
        },
        {
          q: "هل يمكنني تجديد المتابعة لاحقاً؟",
          a: "نعم، التجديد متاح لجميع المشتركين بسعر ٩٩٩ ج.م فقط لكل ٣ شهور إضافية مع الاحتفاظ بكافة بياناتك وسجلات تقدمك السابقة.",
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
      planBtn: "احصل على خطة التدريب — ٣٩٩ ج.م",
      coachingBtn: "اشترك في المتابعة الشخصية — ١,٣٩٩ ج.م",
      footerTag: "مخصص · مرن وقابل للتعديل · نتائج مضمونة",
    },
    footer: {
      desc: "أنظمة تدريب وتغذية ومتابعة شخصية احترافية مصممة خصيصاً لتحقيق أهدافك وبناء جسمك الرياضي.",
      navigate: "روابط سريعة",
      offers: "الباقات والعروض",
      planOffer: "خطة التدريب — ٣٩٩ ج.م",
      coachingOffer: "التدريب والمتابعة الشخصية — ١,٣٩٩ ج.م",
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
      plan1Price: "٣٩٩ ج.م",
      plan1Desc: "نظام Push/Pull/Legs متكامل، دليل التمرين وزيادة الأوزان مع لوحة تحكم فورية.",
      plan2Title: "التدريب والمتابعة الشخصية (٣ شهور)",
      plan2Price: "١,٣٩٩ ج.م",
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
      vodafoneCash: "فودافون كاش / المحافظ الإلكترونية",
      instaPay: "إنستاباي (تحويل فوري IPN)",
      creditCard: "بطاقة بنكية (فيزا / ماستركارد)",
      vodafoneInfo: "حوّل المبلغ إلى رقم: 01026048106 ثم أرسل إشعار التحويل عبر واتساب.",
      instaPayInfo: "التحويل عبر إنستاباي إلى المعرّف: amar.fitness@instapay",
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
