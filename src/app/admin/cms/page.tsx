"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Save,
  Eye,
  Type,
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Monitor,
  LayoutTemplate,
  X,
  Languages,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { adminTranslations } from "@/lib/admin-translations";
import { clearSiteContentCache } from "@/lib/use-site-content";

// ─────────────────────────────────────────────────────────────
// Section & Field Definitions
// ─────────────────────────────────────────────────────────────

type FieldDef = {
  id: string;
  labelEn: string;
  labelAr: string;
  type: "text" | "textarea" | "image" | "url";
  hintEn?: string;
  hintAr?: string;
};

type SectionDef = {
  id: string;
  emoji: string;
  key: keyof typeof adminTranslations.en.cms.sections;
  fields: FieldDef[];
};

const SECTIONS: SectionDef[] = [
  {
    id: "hero",
    emoji: "🏠",
    key: "hero",
    fields: [
      { id: "badge", labelEn: "Badge Text", labelAr: "نص الشارة العلوية (Badge)", type: "text", hintEn: 'e.g. X "MÉTHODE"', hintAr: 'مثال: X "MÉTHODE"' },
      { id: "titleLine1", labelEn: "Headline Line 1", labelAr: "العنوان الرئيسي - السطر 1", type: "text", hintEn: "e.g. THE AMAR", hintAr: "مثال: THE AMAR" },
      { id: "titleLine2", labelEn: "Headline Line 2", labelAr: "العنوان الرئيسي - السطر 2", type: "text", hintEn: 'e.g. "X SPLIT"', hintAr: 'مثال: "X SPLIT"' },
      { id: "titleLine3", labelEn: "Headline Line 3", labelAr: "العنوان الرئيسي - السطر 3", type: "text", hintEn: "e.g. BUILD DIFFERENT", hintAr: "مثال: ابني جسمك بذكاء" },
      { id: "description", labelEn: "Hero Description", labelAr: "الوصف الترويجي أسفل العنوان", type: "textarea", hintEn: "Subheadline text below the main title", hintAr: "نص الوصف التوضيحي للنظام" },
      { id: "startBtn", labelEn: "Start Button Text", labelAr: "نص زر ابدأ الآن", type: "text", hintEn: "e.g. Start Your Transformation", hintAr: "مثال: ابدأ رحلة تحولك الآن" },
      { id: "meetBtn", labelEn: "Meet / Contact Button Text", labelAr: "نص زر التواصل", type: "text", hintEn: "e.g. Let's Talk", hintAr: "مثال: تواصل معي" },
      { id: "stat1Value", labelEn: "Stat 1 — Number", labelAr: "الرقم الإحصائي 1", type: "text", hintEn: "e.g. 100+", hintAr: "مثال: +100" },
      { id: "stat1Label", labelEn: "Stat 1 — Label", labelAr: "عنوان الإحصائية 1", type: "text", hintEn: "e.g. Clients Coached", hintAr: "مثال: متدرب وصل لهدفه" },
      { id: "stat2Value", labelEn: "Stat 2 — Number", labelAr: "الرقم الإحصائي 2", type: "text", hintEn: "e.g. 95%", hintAr: "مثال: 95%" },
      { id: "stat2Label", labelEn: "Stat 2 — Label", labelAr: "عنوان الإحصائية 2", type: "text", hintEn: "e.g. Completion Rate", hintAr: "مثال: نسبة الالتزام" },
      { id: "heroImage", labelEn: "Hero Image URL", labelAr: "رابط صورة الهيدر الرئيسية", type: "image", hintEn: "Paste image URL or Supabase storage link", hintAr: "ضع رابط الصورة المباشر هنا" },
    ],
  },
  {
    id: "trustStrip",
    emoji: "🤝",
    key: "trustStrip",
    fields: [
      { id: "value1_title", labelEn: "Value 1 — Title", labelAr: "الميزة 1 — العنوان", type: "text" },
      { id: "value1_sub", labelEn: "Value 1 — Subtitle", labelAr: "الميزة 1 — الوصف", type: "text" },
      { id: "value2_title", labelEn: "Value 2 — Title", labelAr: "الميزة 2 — العنوان", type: "text" },
      { id: "value2_sub", labelEn: "Value 2 — Subtitle", labelAr: "الميزة 2 — الوصف", type: "text" },
      { id: "value3_title", labelEn: "Value 3 — Title", labelAr: "الميزة 3 — العنوان", type: "text" },
      { id: "value3_sub", labelEn: "Value 3 — Subtitle", labelAr: "الميزة 3 — الوصف", type: "text" },
      { id: "value4_title", labelEn: "Value 4 — Title", labelAr: "الميزة 4 — العنوان", type: "text" },
      { id: "value4_sub", labelEn: "Value 4 — Subtitle", labelAr: "الميزة 4 — الوصف", type: "text" },
    ],
  },
  {
    id: "problem",
    emoji: "⚠️",
    key: "problem",
    fields: [
      { id: "badge", labelEn: "Section Badge", labelAr: "الشارة", type: "text" },
      { id: "title", labelEn: "Section Title", labelAr: "العنوان", type: "textarea" },
      { id: "subtitle", labelEn: "Section Subtitle", labelAr: "الوصف", type: "textarea" },
      { id: "genericTitleBadge", labelEn: "Generic PDF Badge", labelAr: "شارة الجداول العادية", type: "text" },
      { id: "genericHeading", labelEn: "Generic PDF Title", labelAr: "عنوان الجداول العادية", type: "text" },
      { id: "genericPoints", labelEn: "Generic PDF Points (1 per line)", labelAr: "نقاط الجداول العادية (نقطة كل سطر)", type: "textarea" },
      { id: "coachingTitleBadge", labelEn: "Amar App Badge", labelAr: "شارة تطبيق عمار", type: "text" },
      { id: "coachingHeading", labelEn: "Amar App Title", labelAr: "عنوان تطبيق عمار", type: "text" },
      { id: "coachingPoints", labelEn: "Amar App Points (1 per line)", labelAr: "نقاط تطبيق عمار (نقطة كل سطر)", type: "textarea" },
    ],
  },
  {
    id: "pricing",
    emoji: "💳",
    key: "pricing",
    fields: [
      { id: "badge", labelEn: "Section Badge", labelAr: "شارة القسم", type: "text" },
      { id: "title", labelEn: "Section Title", labelAr: "العنوان", type: "textarea" },
      { id: "subtitle", labelEn: "Section Subtitle", labelAr: "الوصف الفرعي", type: "textarea" },
      { id: "offer1_title", labelEn: "Plan 1 — Title", labelAr: "الباقة 1 — الاسم", type: "text" },
      { id: "offer1_sub", labelEn: "Plan 1 — Subtitle", labelAr: "الباقة 1 — الوصف المختصر", type: "text" },
      { id: "offer1_price", labelEn: "Plan 1 — Price", labelAr: "الباقة 1 — السعر", type: "text" },
      { id: "offer1_currency", labelEn: "Plan 1 — Currency Label", labelAr: "الباقة 1 — العملة", type: "text" },
      { id: "offer1_btn", labelEn: "Plan 1 — Button Text", labelAr: "الباقة 1 — نص الزر", type: "text" },
      { id: "offer2_title", labelEn: "Plan 2 — Title", labelAr: "الباقة 2 — الاسم", type: "text" },
      { id: "offer2_sub", labelEn: "Plan 2 — Subtitle", labelAr: "الباقة 2 — الوصف المختصر", type: "text" },
      { id: "offer2_price", labelEn: "Plan 2 — Price", labelAr: "الباقة 2 — السعر", type: "text" },
      { id: "offer2_currency", labelEn: "Plan 2 — Currency Label", labelAr: "الباقة 2 — العملة", type: "text" },
      { id: "offer2_btn", labelEn: "Plan 2 — Button Text", labelAr: "الباقة 2 — نص الزر", type: "text" },
      { id: "offer2_renewal", labelEn: "Plan 2 — Renewal Text", labelAr: "الباقة 2 — نص التجديد", type: "text" },
    ],
  },
  {
    id: "trainingDetail",
    emoji: "🏋️",
    key: "trainingDetail",
    fields: [
      { id: "badge", labelEn: "Section Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", labelEn: "Headline Line 1", labelAr: "العنوان - سطر 1", type: "text" },
      { id: "titleLine2", labelEn: "Headline Line 2", labelAr: "العنوان - سطر 2", type: "text" },
      { id: "desc", labelEn: "Description", labelAr: "الوصف", type: "textarea" },
      { id: "btn", labelEn: "CTA Button Text", labelAr: "نص زر الاشتراك", type: "text" },
      { id: "paymentInfo", labelEn: "Payment Info Note", labelAr: "ملاحظة الدفع", type: "text" },
      { id: "cardBadge", labelEn: "Card Badge", labelAr: "شارة البطاقة", type: "text" },
      { id: "cardPrice", labelEn: "Card Price", labelAr: "سعر البطاقة", type: "text" },
      { id: "cardCurrency", labelEn: "Card Currency", labelAr: "عملة البطاقة", type: "text" },
      { id: "cardSub", labelEn: "Card Subtitle", labelAr: "وصف البطاقة", type: "text" },
      { id: "highlight1_title", labelEn: "Highlight 1 Title", labelAr: "ميزة 1 - عنوان", type: "text" },
      { id: "highlight1_desc", labelEn: "Highlight 1 Desc", labelAr: "ميزة 1 - وصف", type: "text" },
      { id: "highlight2_title", labelEn: "Highlight 2 Title", labelAr: "ميزة 2 - عنوان", type: "text" },
      { id: "highlight2_desc", labelEn: "Highlight 2 Desc", labelAr: "ميزة 2 - وصف", type: "text" },
      { id: "highlight3_title", labelEn: "Highlight 3 Title", labelAr: "ميزة 3 - عنوان", type: "text" },
      { id: "highlight3_desc", labelEn: "Highlight 3 Desc", labelAr: "ميزة 3 - وصف", type: "text" },
      { id: "highlight4_title", labelEn: "Highlight 4 Title", labelAr: "ميزة 4 - عنوان", type: "text" },
      { id: "highlight4_desc", labelEn: "Highlight 4 Desc", labelAr: "ميزة 4 - وصف", type: "text" },
    ],
  },
  {
    id: "coachingDetail",
    emoji: "🎯",
    key: "coachingDetail",
    fields: [
      { id: "badge", labelEn: "Section Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", labelEn: "Headline Line 1", labelAr: "العنوان - سطر 1", type: "text" },
      { id: "titleLine2", labelEn: "Headline Line 2", labelAr: "العنوان - سطر 2", type: "text" },
      { id: "desc", labelEn: "Description", labelAr: "الوصف", type: "textarea" },
      { id: "visualTitle", labelEn: "Visual Box Title", labelAr: "عنوان مربع النظام", type: "text" },
      { id: "visualDesc", labelEn: "Visual Box Desc", labelAr: "وصف مربع النظام", type: "textarea" },
      { id: "feature1", labelEn: "Feature 1", labelAr: "الميزة 1", type: "text" },
      { id: "feature2", labelEn: "Feature 2", labelAr: "الميزة 2", type: "text" },
      { id: "feature3", labelEn: "Feature 3", labelAr: "الميزة 3", type: "text" },
      { id: "btn", labelEn: "CTA Button Text", labelAr: "نص زر الاشتراك", type: "text" },
      { id: "pillar1_title", labelEn: "Pillar 1 Title", labelAr: "الركن 1 - عنوان", type: "text" },
      { id: "pillar1_items", labelEn: "Pillar 1 Items (1 per line)", labelAr: "الركن 1 - عناصر", type: "textarea" },
      { id: "pillar2_title", labelEn: "Pillar 2 Title", labelAr: "الركن 2 - عنوان", type: "text" },
      { id: "pillar2_items", labelEn: "Pillar 2 Items (1 per line)", labelAr: "الركن 2 - عناصر", type: "textarea" },
      { id: "pillar3_title", labelEn: "Pillar 3 Title", labelAr: "الركن 3 - عنوان", type: "text" },
      { id: "pillar3_items", labelEn: "Pillar 3 Items (1 per line)", labelAr: "الركن 3 - عناصر", type: "textarea" },
      { id: "pillar4_title", labelEn: "Pillar 4 Title", labelAr: "الركن 4 - عنوان", type: "text" },
      { id: "pillar4_items", labelEn: "Pillar 4 Items (1 per line)", labelAr: "الركن 4 - عناصر", type: "textarea" },
      { id: "stat1_label", labelEn: "Stat 1 Label", labelAr: "إحصائية 1 - الوصف", type: "text" },
      { id: "stat1_value", labelEn: "Stat 1 Value", labelAr: "إحصائية 1 - القيمة", type: "text" },
      { id: "stat2_label", labelEn: "Stat 2 Label", labelAr: "إحصائية 2 - الوصف", type: "text" },
      { id: "stat2_value", labelEn: "Stat 2 Value", labelAr: "إحصائية 2 - القيمة", type: "text" },
      { id: "stat3_label", labelEn: "Stat 3 Label", labelAr: "إحصائية 3 - الوصف", type: "text" },
      { id: "stat3_value", labelEn: "Stat 3 Value", labelAr: "إحصائية 3 - القيمة", type: "text" },
    ],
  },
  {
    id: "experience",
    emoji: "📈",
    key: "experience",
    fields: [
      { id: "badge", labelEn: "Section Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", labelEn: "Headline Line 1", labelAr: "العنوان - سطر 1", type: "text" },
      { id: "titleLine2", labelEn: "Headline Line 2", labelAr: "العنوان - سطر 2", type: "text" },
      { id: "subtitle", labelEn: "Subtitle", labelAr: "الوصف الفرعي", type: "textarea" },
      { id: "metricsTraining", labelEn: "Metric: Training", labelAr: "مقياس: التدريب", type: "text" },
      { id: "metricsNutrition", labelEn: "Metric: Nutrition", labelAr: "مقياس: التغذية", type: "text" },
      { id: "metricsCardio", labelEn: "Metric: Cardio", labelAr: "مقياس: الكارديو", type: "text" },
      { id: "metricsCheckIn", labelEn: "Metric: Check-Ins", labelAr: "مقياس: المتابعة", type: "text" },
      { id: "metricsProgress", labelEn: "Metric: Progress", labelAr: "مقياس: التطور", type: "text" },
    ],
  },
  {
    id: "coach",
    emoji: "👤",
    key: "coach",
    fields: [
      { id: "name", labelEn: "Coach Name", labelAr: "اسم الكوتش", type: "text" },
      { id: "sub", labelEn: "Coach Title / Credentials", labelAr: "المسمى والشهادات", type: "text" },
      { id: "bio", labelEn: "Coach Biography", labelAr: "نبذة عن الكوتش", type: "textarea" },
      { id: "point1", labelEn: "Expertise Point 1", labelAr: "الميزة الأولى", type: "text" },
      { id: "point2", labelEn: "Expertise Point 2", labelAr: "الميزة الثانية", type: "text" },
      { id: "point3", labelEn: "Expertise Point 3", labelAr: "الميزة الثالثة", type: "text" },
      { id: "portraitImage", labelEn: "Coach Portrait Photo URL", labelAr: "رابط صورة الكوتش الشخصية", type: "image" },
      { id: "igUrl", labelEn: "Instagram Profile URL", labelAr: "رابط الانستجرام", type: "url" },
      { id: "ytUrl", labelEn: "YouTube Channel URL", labelAr: "رابط اليوتيوب", type: "url" },
      { id: "btn", labelEn: "CTA Button Text", labelAr: "نص الزر", type: "text" },
      { id: "ytBtn", labelEn: "YouTube Button Text", labelAr: "نص زر اليوتيوب", type: "text" },
    ],
  },
  {
    id: "howItWorks",
    emoji: "📋",
    key: "howItWorks",
    fields: [
      { id: "badge", labelEn: "Section Badge", labelAr: "الشارة", type: "text" },
      { id: "title", labelEn: "Section Title", labelAr: "عنوان القسم", type: "text" },
      { id: "subtitle", labelEn: "Section Subtitle", labelAr: "الوصف الفرعي", type: "textarea" },
      { id: "planTrack", labelEn: "Plan Track Label", labelAr: "عنوان مسار الجدول", type: "text" },
      { id: "coachingTrack", labelEn: "Coaching Track Label", labelAr: "عنوان مسار المتابعة", type: "text" },
      { id: "plan_step1_title", labelEn: "Plan Step 1 — Title", labelAr: "مسار الجدول الخطوة 1 — العنوان", type: "text" },
      { id: "plan_step1_desc", labelEn: "Plan Step 1 — Description", labelAr: "مسار الجدول الخطوة 1 — الشرح", type: "text" },
      { id: "plan_step2_title", labelEn: "Plan Step 2 — Title", labelAr: "مسار الجدول الخطوة 2 — العنوان", type: "text" },
      { id: "plan_step2_desc", labelEn: "Plan Step 2 — Description", labelAr: "مسار الجدول الخطوة 2 — الشرح", type: "text" },
      { id: "plan_step3_title", labelEn: "Plan Step 3 — Title", labelAr: "مسار الجدول الخطوة 3 — العنوان", type: "text" },
      { id: "plan_step3_desc", labelEn: "Plan Step 3 — Description", labelAr: "مسار الجدول الخطوة 3 — الشرح", type: "text" },
      { id: "coach_step1_title", labelEn: "Coach Step 1 — Title", labelAr: "مسار المتابعة الخطوة 1 — العنوان", type: "text" },
      { id: "coach_step1_desc", labelEn: "Coach Step 1 — Description", labelAr: "مسار المتابعة الخطوة 1 — الشرح", type: "text" },
      { id: "coach_step2_title", labelEn: "Coach Step 2 — Title", labelAr: "مسار المتابعة الخطوة 2 — العنوان", type: "text" },
      { id: "coach_step2_desc", labelEn: "Coach Step 2 — Description", labelAr: "مسار المتابعة الخطوة 2 — الشرح", type: "text" },
      { id: "coach_step3_title", labelEn: "Coach Step 3 — Title", labelAr: "مسار المتابعة الخطوة 3 — العنوان", type: "text" },
      { id: "coach_step3_desc", labelEn: "Coach Step 3 — Description", labelAr: "مسار المتابعة الخطوة 3 — الشرح", type: "text" },
      { id: "coach_step4_title", labelEn: "Coach Step 4 — Title", labelAr: "مسار المتابعة الخطوة 4 — العنوان", type: "text" },
      { id: "coach_step4_desc", labelEn: "Coach Step 4 — Description", labelAr: "مسار المتابعة الخطوة 4 — الشرح", type: "text" },
      { id: "coach_step5_title", labelEn: "Coach Step 5 — Title", labelAr: "مسار المتابعة الخطوة 5 — العنوان", type: "text" },
      { id: "coach_step5_desc", labelEn: "Coach Step 5 — Description", labelAr: "مسار المتابعة الخطوة 5 — الشرح", type: "text" },
      { id: "coach_step6_title", labelEn: "Coach Step 6 — Title", labelAr: "مسار المتابعة الخطوة 6 — العنوان", type: "text" },
      { id: "coach_step6_desc", labelEn: "Coach Step 6 — Description", labelAr: "مسار المتابعة الخطوة 6 — الشرح", type: "text" },
    ],
  },
  {
    id: "testimonials",
    emoji: "⭐",
    key: "testimonials",
    fields: [
      { id: "badge", labelEn: "Section Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", labelEn: "Headline Line 1", labelAr: "العنوان - سطر 1", type: "text" },
      { id: "titleLine2", labelEn: "Headline Line 2", labelAr: "العنوان - سطر 2", type: "text" },
      { id: "subtitle", labelEn: "Section Subtitle", labelAr: "الوصف الفرعي", type: "textarea" },
      { id: "t1_name", labelEn: "Review 1 — Client Name", labelAr: "التقييم 1 — اسم المشترك", type: "text" },
      { id: "t1_duration", labelEn: "Review 1 — Duration", labelAr: "التقييم 1 — مدة الاشتراك", type: "text" },
      { id: "t1_result", labelEn: "Review 1 — Result Badge", labelAr: "التقييم 1 — النتيجة المحققة", type: "text" },
      { id: "t1_text", labelEn: "Review 1 — Quote", labelAr: "التقييم 1 — نص الرأي", type: "textarea" },
      { id: "t2_name", labelEn: "Review 2 — Client Name", labelAr: "التقييم 2 — اسم المشترك", type: "text" },
      { id: "t2_duration", labelEn: "Review 2 — Duration", labelAr: "التقييم 2 — مدة الاشتراك", type: "text" },
      { id: "t2_result", labelEn: "Review 2 — Result Badge", labelAr: "التقييم 2 — النتيجة المحققة", type: "text" },
      { id: "t2_text", labelEn: "Review 2 — Quote", labelAr: "التقييم 2 — نص الرأي", type: "textarea" },
    ],
  },
  {
    id: "faq",
    emoji: "❓",
    key: "faq",
    fields: [
      { id: "q1", labelEn: "Question 1", labelAr: "السؤال 1", type: "text" },
      { id: "a1", labelEn: "Answer 1", labelAr: "الإجابة 1", type: "textarea" },
      { id: "q2", labelEn: "Question 2", labelAr: "السؤال 2", type: "text" },
      { id: "a2", labelEn: "Answer 2", labelAr: "الإجابة 2", type: "textarea" },
      { id: "q3", labelEn: "Question 3", labelAr: "السؤال 3", type: "text" },
      { id: "a3", labelEn: "Answer 3", labelAr: "الإجابة 3", type: "textarea" },
      { id: "q4", labelEn: "Question 4", labelAr: "السؤال 4", type: "text" },
      { id: "a4", labelEn: "Answer 4", labelAr: "الإجابة 4", type: "textarea" },
      { id: "q5", labelEn: "Question 5", labelAr: "السؤال 5", type: "text" },
      { id: "a5", labelEn: "Answer 5", labelAr: "الإجابة 5", type: "textarea" },
    ],
  },
  {
    id: "finalCta",
    emoji: "🔥",
    key: "finalCta",
    fields: [
      { id: "badge", labelEn: "Section Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", labelEn: "Headline Line 1", labelAr: "العنوان - سطر 1", type: "text" },
      { id: "titleLine2", labelEn: "Headline Line 2", labelAr: "العنوان - سطر 2", type: "text" },
      { id: "titleLine3", labelEn: "Headline Line 3", labelAr: "العنوان - سطر 3", type: "text" },
      { id: "subtitle", labelEn: "Subtitle", labelAr: "الوصف", type: "textarea" },
      { id: "planBtn", labelEn: "Plan Button Text", labelAr: "نص زر الجدول", type: "text" },
      { id: "coachingBtn", labelEn: "Coaching Button Text", labelAr: "نص زر المتابعة", type: "text" },
      { id: "footerTag", labelEn: "Footer Tag", labelAr: "نص سفلي", type: "text" },
    ],
  },
  {
    id: "nav",
    emoji: "🧭",
    key: "nav",
    fields: [
      { id: "brand", labelEn: "Brand Name (Logo)", labelAr: "اسم اللوجو", type: "text" },
      { id: "plans", labelEn: "Plans Link Text", labelAr: "رابط الباقات", type: "text" },
      { id: "coach", labelEn: "Coach Link Text", labelAr: "رابط عن الكوتش", type: "text" },
      { id: "results", labelEn: "Results Link Text", labelAr: "رابط النتائج", type: "text" },
      { id: "faq", labelEn: "FAQ Link Text", labelAr: "رابط الأسئلة", type: "text" },
      { id: "startNow", labelEn: "CTA Button Text", labelAr: "نص زر ابدأ الآن", type: "text" },
    ],
  },
  {
    id: "footer",
    emoji: "🔗",
    key: "footer",
    fields: [
      { id: "desc", labelEn: "Description", labelAr: "الوصف", type: "textarea" },
      { id: "navigate", labelEn: "Navigate Heading", labelAr: "عنوان التصفح", type: "text" },
      { id: "offers", labelEn: "Offers Heading", labelAr: "عنوان العروض", type: "text" },
      { id: "planOffer", labelEn: "Plan Offer Link Text", labelAr: "نص رابط باقة الجدول", type: "text" },
      { id: "coachingOffer", labelEn: "Coaching Offer Link Text", labelAr: "نص رابط باقة المتابعة", type: "text" },
      { id: "rights", labelEn: "Rights Reserved Text", labelAr: "نص حقوق النشر", type: "text" },
      { id: "tag", labelEn: "Footer Tag / Made By", labelAr: "توقيع المطور", type: "text" },
      { id: "instagram_url", labelEn: "Instagram URL", labelAr: "رابط انستجرام", type: "url" },
      { id: "tiktok_url", labelEn: "TikTok URL", labelAr: "رابط تيك توك", type: "url" },
      { id: "youtube_url", labelEn: "YouTube URL", labelAr: "رابط يوتيوب", type: "url" },
      { id: "whatsapp_url", labelEn: "WhatsApp URL", labelAr: "رابط واتساب", type: "url" },
    ],
  },
];

type ContentMap = Record<string, Record<string, string>>;

export default function CMSPage() {
  const { lang: adminLang, isArabic: isAdminArabic } = useLanguage();
  const t = adminTranslations[adminLang].cms;

  // Language of the content currently being edited: "en" or "ar"
  const [contentLang, setContentLang] = useState<"en" | "ar">("en");
  const [saved, setSaved] = useState<ContentMap>({});
  const [edits, setEdits] = useState<ContentMap>({});
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [previewWidth, setPreviewWidth] = useState<"full" | "mobile">("mobile");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load content for active contentLang from DB
  const loadContent = useCallback(async (langToLoad: "en" | "ar") => {
    try {
      const res = await fetch(`/api/site-content?lang=${langToLoad}`);
      const d = await res.json();
      const map: ContentMap = d.content || {};
      setSaved(map);
      setEdits(map);
    } catch {}
  }, []);

  useEffect(() => {
    loadContent(contentLang);
  }, [contentLang, loadContent]);

  function getVal(sectionId: string, fieldId: string) {
    return edits[sectionId]?.[fieldId] ?? saved[sectionId]?.[fieldId] ?? "";
  }

  function setVal(sectionId: string, fieldId: string, value: string) {
    setEdits((d) => ({ ...d, [sectionId]: { ...(d[sectionId] || {}), [fieldId]: value } }));
  }

  function isDirty(sectionId: string, fieldId: string) {
    const current = edits[sectionId]?.[fieldId] ?? "";
    const original = saved[sectionId]?.[fieldId] ?? "";
    return current !== original;
  }

  const sectionHasDirty = (sectionId: string) => {
    const section = SECTIONS.find((s) => s.id === sectionId);
    return section?.fields.some((f) => isDirty(sectionId, f.id)) ?? false;
  };

  // Save all fields in the current section for the selected contentLang
  async function saveSection() {
    setSaving(true);
    const section = SECTIONS.find((s) => s.id === activeSection)!;
    try {
      for (const field of section.fields) {
        const value = getVal(activeSection, field.id);
        await fetch("/api/admin/cms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: activeSection,
            fieldId: field.id,
            lang: contentLang,
            value,
            draft: false,
          }),
        });
      }

      setSaved((prev) => ({
        ...prev,
        [activeSection]: { ...(prev[activeSection] || {}), ...(edits[activeSection] || {}) },
      }));

      // Bust the module-level cache so live site picks up new content
      clearSiteContentCache(contentLang);

      setSaveMsg(t.savedMsg);
      setTimeout(() => setSaveMsg(null), 3000);

      // Refresh the preview iframe
      refreshPreview();
    } catch {
      setSaveMsg("Error saving. Try again.");
    }
    setSaving(false);
  }

  const refreshPreview = () => {
    if (iframeRef.current) {
      // Reload iframe with the current language
      iframeRef.current.src = `/?t=${Date.now()}`;
    }
  };

  const currentSection = SECTIONS.find((s) => s.id === activeSection)!;
  const currentSectionMeta = t.sections[currentSection.key];

  return (
    <div className="flex h-[calc(100vh-5.5rem)] -m-8 overflow-hidden">
      {/* ─── LEFT PANEL: Section Nav + Fields ─── */}
      <div className="w-[430px] shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--bg-card)]">
        {/* Header & Language Selector */}
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
              <LayoutTemplate size={16} className="text-[var(--accent)]" /> {t.title}
            </h2>
          </div>

          {/* Content Language Switcher */}
          <div className="flex items-center justify-between bg-[var(--bg-base)] p-1 rounded-sm border border-[var(--border)]">
            <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1 px-2">
              <Languages size={13} className="text-[var(--accent)]" /> {t.contentLang}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setContentLang("en")}
                className={`px-3 py-1 text-xs font-bold rounded-sm transition-all ${
                  contentLang === "en"
                    ? "bg-[var(--accent)] text-black shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                English 🇬🇧
              </button>
              <button
                type="button"
                onClick={() => setContentLang("ar")}
                className={`px-3 py-1 text-xs font-bold rounded-sm transition-all ${
                  contentLang === "ar"
                    ? "bg-[var(--accent)] text-black shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                العربية 🇪🇬
              </button>
            </div>
          </div>
        </div>

        {/* Section Pills */}
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-base)] shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {SECTIONS.map((s) => {
              const dirty = sectionHasDirty(s.id);
              const active = activeSection === s.id;
              const label = t.sections[s.key]?.label || s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold transition-all ${
                    active
                      ? "bg-[var(--accent)] text-black"
                      : "bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)]"
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span>{label}</span>
                  {dirty && !active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Description */}
        <div className="px-5 py-2.5 border-b border-[var(--border)] bg-[var(--bg-base)] shrink-0">
          <p className="text-xs text-[var(--text-muted)]">
            <span className="font-bold text-[var(--text-primary)]">
              {currentSection.emoji} {currentSectionMeta?.label}
            </span>
            {" — "}
            {currentSectionMeta?.desc}
          </p>
        </div>

        {/* Field Editors */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {currentSection.fields.map((field) => {
            const val = getVal(activeSection, field.id);
            const dirty = isDirty(activeSection, field.id);
            const fieldLabel = isAdminArabic ? field.labelAr : field.labelEn;
            const fieldHint = contentLang === "ar" ? field.hintAr : field.hintEn;
            const inputDir = contentLang === "ar" ? "rtl" : "ltr";

            return (
              <div key={field.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    {field.type === "image" && <ImageIcon size={12} className="text-blue-400" />}
                    {field.type === "url" && <ExternalLink size={12} className="text-purple-400" />}
                    {field.type === "text" && <Type size={12} className="text-[var(--accent)]" />}
                    {field.type === "textarea" && <Type size={12} className="text-emerald-400" />}
                    {fieldLabel}
                  </label>
                  {dirty && (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                      {t.unsavedBadge}
                    </span>
                  )}
                </div>

                {field.type === "textarea" ? (
                  <textarea
                    dir={inputDir}
                    rows={3}
                    value={val}
                    onChange={(e) => setVal(activeSection, field.id, e.target.value)}
                    placeholder={fieldHint || fieldLabel}
                    className={`w-full bg-[var(--bg-elevated)] border rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none resize-y transition-colors ${
                      dirty ? "border-amber-500/50 focus:border-amber-400" : "border-[var(--border)] focus:border-[var(--border-accent)]"
                    }`}
                  />
                ) : field.type === "image" ? (
                  <div className="space-y-2">
                    <input
                      dir="ltr"
                      value={val}
                      onChange={(e) => setVal(activeSection, field.id, e.target.value)}
                      placeholder={fieldHint || "https://..."}
                      className={`w-full bg-[var(--bg-elevated)] border rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none font-mono transition-colors ${
                        dirty ? "border-amber-500/50 focus:border-amber-400" : "border-[var(--border)] focus:border-[var(--border-accent)]"
                      }`}
                    />
                    {val && (
                      <div className="relative rounded-sm overflow-hidden border border-[var(--border)] bg-[var(--bg-base)] aspect-video">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={val}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setVal(activeSection, field.id, "")}
                          className="absolute top-2 right-2 p-1 bg-black/60 rounded text-white hover:bg-black/80 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] text-[var(--text-muted)]">
                      💡 {t.supabaseHint}
                    </p>
                  </div>
                ) : (
                  <input
                    dir={inputDir}
                    type={field.type === "url" ? "url" : "text"}
                    value={val}
                    onChange={(e) => setVal(activeSection, field.id, e.target.value)}
                    placeholder={fieldHint || fieldLabel}
                    className={`w-full bg-[var(--bg-elevated)] border rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none transition-colors ${
                      dirty ? "border-amber-500/50 focus:border-amber-400" : "border-[var(--border)] focus:border-[var(--border-accent)]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Save Footer */}
        <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--bg-elevated)] shrink-0 space-y-2">
          {saveMsg && (
            <div className={`text-xs font-bold px-3 py-2 rounded-sm border ${
              saveMsg.includes("✓")
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              {saveMsg}
            </div>
          )}
          <button
            onClick={saveSection}
            disabled={saving}
            className="w-full py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Save size={14} />
            {saving ? t.saving : t.saveBtn(`${currentSection.emoji} ${currentSectionMeta?.label || activeSection}`)}
          </button>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Live Site Preview ─── */}
      <div className="flex-1 flex flex-col bg-[var(--bg-base)] overflow-hidden">
        {/* Preview Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] shrink-0">
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-[var(--accent)]" />
            <span className="text-sm font-bold text-[var(--text-primary)]">{t.livePreview}</span>
            <span className="text-[10px] text-[var(--text-muted)] ml-1 bg-[var(--bg-base)] border border-[var(--border)] px-2 py-0.5 rounded-full">
              {t.reflectsPublished}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewWidth("full")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-sm border text-xs font-semibold transition-colors ${
                previewWidth === "full"
                  ? "border-[var(--border-accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title={t.desktopPreview}
            >
              <Monitor size={13} />
              <span>{t.desktopPreview}</span>
            </button>
            <button
              onClick={() => setPreviewWidth("mobile")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-sm border text-xs font-semibold transition-colors ${
                previewWidth === "mobile"
                  ? "border-[var(--border-accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title={t.mobilePreview}
            >
              <Smartphone size={13} />
              <span>{t.mobilePreview}</span>
            </button>
            <div className="w-px h-5 bg-[var(--border)]" />
            <button
              onClick={refreshPreview}
              className="p-1.5 rounded-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-colors cursor-pointer"
              title={t.refresh}
            >
              <RefreshCw size={14} />
            </button>
            <a
              href="/"
              target="_blank"
              className="p-1.5 rounded-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--border-accent)] transition-colors"
              title={t.openFullSite}
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Preview Frame */}
        <div className={`flex-1 flex justify-center bg-[#07090e] overflow-auto ${previewWidth === "mobile" ? "py-6" : ""}`}>
          <div
            className={`h-full bg-white transition-all ${
              previewWidth === "mobile" ? "w-[390px] rounded-2xl shadow-2xl overflow-hidden border border-slate-700/60" : "w-full"
            }`}
          >
            <iframe
              ref={iframeRef}
              src="/"
              className="w-full h-full border-0"
              title="Website Preview"
            />
          </div>
        </div>

        {/* Preview Footer Hint */}
        <div className="px-5 py-2 border-t border-[var(--border)] bg-[var(--bg-elevated)] shrink-0 flex items-center justify-between">
          <p className="text-[10px] text-[var(--text-muted)]">
            ℹ️ {t.hintText}
          </p>
          <a
            href="/"
            target="_blank"
            className="text-[10px] text-[var(--accent)] hover:underline font-semibold flex items-center gap-1"
          >
            {t.openFullSite} <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
