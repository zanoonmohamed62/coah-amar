"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Save, Eye, EyeOff, Upload, X, RefreshCw,
  Monitor, Check, Loader2, ExternalLink,
  Image as ImageIcon, Link2, AlignLeft, Type,
  Globe, LayoutDashboard,
  AlertTriangle, CheckCircle2, Trash2, Columns2,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { clearSiteContentCache } from "@/lib/use-site-content";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────
// FIELD & SECTION DEFINITIONS
// ─────────────────────────────────────────────────────────────

type FieldType = "text" | "textarea" | "image" | "url";

type FieldDef = {
  id: string;
  label: string;     // shown in English always (admin UI)
  labelAr: string;   // shown when admin lang = Arabic
  type: FieldType;
  hint?: string;
};

type SectionDef = {
  id: string;
  emoji: string;
  name: string;
  nameAr: string;
  fields: FieldDef[];
};

const SECTIONS: SectionDef[] = [
  {
    id: "hero",
    emoji: "🏠",
    name: "Hero",
    nameAr: "الهيدر",
    fields: [
      { id: "badge", label: "Badge Text", labelAr: "نص الشارة", type: "text" },
      { id: "titleLine1", label: "Title Line 1", labelAr: "العنوان سطر 1", type: "text" },
      { id: "titleLine2", label: "Title Line 2", labelAr: "العنوان سطر 2", type: "text" },
      { id: "titleLine3", label: "Title Line 3", labelAr: "العنوان سطر 3", type: "text" },
      { id: "description", label: "Description", labelAr: "الوصف", type: "textarea" },
      { id: "startBtn", label: "Start Button Text", labelAr: "نص زر البداية", type: "text" },
      { id: "meetBtn", label: "Contact Button Text", labelAr: "نص زر التواصل", type: "text" },
      { id: "stat1Value", label: "Stat 1 - Number", labelAr: "الإحصائية 1 - الرقم", type: "text" },
      { id: "stat1Label", label: "Stat 1 - Label", labelAr: "الإحصائية 1 - الوصف", type: "text" },
      { id: "stat2Value", label: "Stat 2 - Number", labelAr: "الإحصائية 2 - الرقم", type: "text" },
      { id: "stat2Label", label: "Stat 2 - Label", labelAr: "الإحصائية 2 - الوصف", type: "text" },
      { id: "heroImage", label: "Hero Photo", labelAr: "صورة الهيدر", type: "image" },
      { id: "cardBadge", label: "Card Badge", labelAr: "شارة البطاقة", type: "text" },
      { id: "cardTitle", label: "Card Title", labelAr: "عنوان البطاقة", type: "text" },
    ],
  },
  {
    id: "trust",
    emoji: "✅",
    name: "Trust Strip",
    nameAr: "شريط الثقة",
    fields: [
      { id: "item1", label: "Item 1", labelAr: "عنصر 1", type: "text" },
      { id: "item2", label: "Item 2", labelAr: "عنصر 2", type: "text" },
      { id: "item3", label: "Item 3", labelAr: "عنصر 3", type: "text" },
      { id: "item4", label: "Item 4", labelAr: "عنصر 4", type: "text" },
      { id: "item5", label: "Item 5", labelAr: "عنصر 5", type: "text" },
    ],
  },
  {
    id: "problem",
    emoji: "❌",
    name: "Problem Section",
    nameAr: "قسم المشكلة",
    fields: [
      { id: "badge", label: "Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", label: "Title Line 1", labelAr: "العنوان سطر 1", type: "text" },
      { id: "titleLine2", label: "Title Line 2", labelAr: "العنوان سطر 2", type: "text" },
      { id: "subtitle", label: "Subtitle", labelAr: "الوصف الفرعي", type: "textarea" },
      { id: "leftTitle", label: "Left Column Title", labelAr: "عنوان العمود الأيسر", type: "text" },
      { id: "leftPoints", label: "Left Points (1 per line)", labelAr: "نقاط الأيسر (سطر لكل نقطة)", type: "textarea" },
      { id: "rightTitle", label: "Right Column Title", labelAr: "عنوان العمود الأيمن", type: "text" },
      { id: "rightPoints", label: "Right Points (1 per line)", labelAr: "نقاط الأيمن (سطر لكل نقطة)", type: "textarea" },
    ],
  },
  {
    id: "trainingDetail",
    emoji: "🏋️",
    name: "Training Plan Detail",
    nameAr: "تفاصيل جدول التمرين",
    fields: [
      { id: "badge", label: "Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", label: "Title Line 1", labelAr: "العنوان سطر 1", type: "text" },
      { id: "titleLine2", label: "Title Line 2", labelAr: "العنوان سطر 2", type: "text" },
      { id: "desc", label: "Description", labelAr: "الوصف", type: "textarea" },
      { id: "highlight1_title", label: "Highlight 1 Title", labelAr: "ميزة 1 - عنوان", type: "text" },
      { id: "highlight1_desc", label: "Highlight 1 Desc", labelAr: "ميزة 1 - وصف", type: "textarea" },
      { id: "highlight2_title", label: "Highlight 2 Title", labelAr: "ميزة 2 - عنوان", type: "text" },
      { id: "highlight2_desc", label: "Highlight 2 Desc", labelAr: "ميزة 2 - وصف", type: "textarea" },
      { id: "highlight3_title", label: "Highlight 3 Title", labelAr: "ميزة 3 - عنوان", type: "text" },
      { id: "highlight3_desc", label: "Highlight 3 Desc", labelAr: "ميزة 3 - وصف", type: "textarea" },
      { id: "highlight4_title", label: "Highlight 4 Title", labelAr: "ميزة 4 - عنوان", type: "text" },
      { id: "highlight4_desc", label: "Highlight 4 Desc", labelAr: "ميزة 4 - وصف", type: "textarea" },
      { id: "btn", label: "Button Text", labelAr: "نص الزر", type: "text" },
      { id: "paymentInfo", label: "Payment Info", labelAr: "معلومات الدفع", type: "textarea" },
      { id: "cardBadge", label: "Card Badge", labelAr: "شارة البطاقة", type: "text" },
      { id: "cardPrice", label: "Card Price", labelAr: "سعر البطاقة", type: "text" },
      { id: "cardCurrency", label: "Card Currency", labelAr: "عملة البطاقة", type: "text" },
      { id: "cardSub", label: "Card Subtitle", labelAr: "وصف البطاقة الفرعي", type: "text" },
    ],
  },
  {
    id: "coachingDetail",
    emoji: "🔥",
    name: "Coaching Detail",
    nameAr: "تفاصيل المتابعة",
    fields: [
      { id: "badge", label: "Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", label: "Title Line 1", labelAr: "العنوان سطر 1", type: "text" },
      { id: "titleLine2", label: "Title Line 2", labelAr: "العنوان سطر 2", type: "text" },
      { id: "desc", label: "Description", labelAr: "الوصف", type: "textarea" },
      { id: "p1_title", label: "Pillar 1 Title", labelAr: "المحور 1 - عنوان", type: "text" },
      { id: "p1_desc", label: "Pillar 1 Desc", labelAr: "المحور 1 - وصف", type: "textarea" },
      { id: "p2_title", label: "Pillar 2 Title", labelAr: "المحور 2 - عنوان", type: "text" },
      { id: "p2_desc", label: "Pillar 2 Desc", labelAr: "المحور 2 - وصف", type: "textarea" },
      { id: "p3_title", label: "Pillar 3 Title", labelAr: "المحور 3 - عنوان", type: "text" },
      { id: "p3_desc", label: "Pillar 3 Desc", labelAr: "المحور 3 - وصف", type: "textarea" },
      { id: "p4_title", label: "Pillar 4 Title", labelAr: "المحور 4 - عنوان", type: "text" },
      { id: "p4_desc", label: "Pillar 4 Desc", labelAr: "المحور 4 - وصف", type: "textarea" },
      { id: "stat1_label", label: "Stat 1 Label", labelAr: "إحصائية 1 - وصف", type: "text" },
      { id: "stat1_value", label: "Stat 1 Value", labelAr: "إحصائية 1 - قيمة", type: "text" },
      { id: "stat2_label", label: "Stat 2 Label", labelAr: "إحصائية 2 - وصف", type: "text" },
      { id: "stat2_value", label: "Stat 2 Value", labelAr: "إحصائية 2 - قيمة", type: "text" },
      { id: "stat3_label", label: "Stat 3 Label", labelAr: "إحصائية 3 - وصف", type: "text" },
      { id: "stat3_value", label: "Stat 3 Value", labelAr: "إحصائية 3 - قيمة", type: "text" },
      { id: "visualTitle", label: "Visual Title", labelAr: "عنوان الصورة", type: "text" },
      { id: "visualDesc", label: "Visual Description", labelAr: "وصف الصورة", type: "textarea" },
      { id: "feature1", label: "Feature 1", labelAr: "الميزة 1", type: "text" },
      { id: "feature2", label: "Feature 2", labelAr: "الميزة 2", type: "text" },
      { id: "feature3", label: "Feature 3", labelAr: "الميزة 3", type: "text" },
      { id: "btn", label: "Button Text", labelAr: "نص الزر", type: "text" },
      { id: "paymentInfo", label: "Payment Info", labelAr: "معلومات الدفع", type: "textarea" },
      { id: "cardBadge", label: "Card Badge", labelAr: "شارة البطاقة", type: "text" },
      { id: "cardTitle", label: "Card Title", labelAr: "عنوان البطاقة", type: "text" },
      { id: "cardPrice", label: "Card Price", labelAr: "سعر البطاقة", type: "text" },
      { id: "cardCurrency", label: "Card Currency", labelAr: "عملة البطاقة", type: "text" },
      { id: "cardSub", label: "Card Subtitle", labelAr: "وصف البطاقة الفرعي", type: "text" },
    ],
  },
  {
    id: "pricing",
    emoji: "💰",
    name: "Plans & Pricing",
    nameAr: "الباقات والأسعار",
    fields: [
      { id: "badge", label: "Badge", labelAr: "الشارة", type: "text" },
      { id: "title", label: "Section Title", labelAr: "عنوان القسم", type: "text" },
      { id: "subtitle", label: "Subtitle", labelAr: "الوصف الفرعي", type: "textarea" },
      { id: "offer1_title", label: "Offer 1 - Title", labelAr: "الباقة 1 - العنوان", type: "text" },
      { id: "offer1_sub", label: "Offer 1 - Subtitle", labelAr: "الباقة 1 - الوصف", type: "text" },
      { id: "offer1_price", label: "Offer 1 - Price", labelAr: "الباقة 1 - السعر", type: "text" },
      { id: "offer1_currency", label: "Offer 1 - Currency", labelAr: "الباقة 1 - العملة", type: "text" },
      { id: "offer1_features", label: "Offer 1 - Features (1 per line)", labelAr: "الباقة 1 - المميزات", type: "textarea" },
      { id: "offer1_btn", label: "Offer 1 - Button Text", labelAr: "الباقة 1 - الزر", type: "text" },
      { id: "offer2_title", label: "Offer 2 - Title", labelAr: "الباقة 2 - العنوان", type: "text" },
      { id: "offer2_sub", label: "Offer 2 - Subtitle", labelAr: "الباقة 2 - الوصف", type: "text" },
      { id: "offer2_price", label: "Offer 2 - Price", labelAr: "الباقة 2 - السعر", type: "text" },
      { id: "offer2_currency", label: "Offer 2 - Currency", labelAr: "الباقة 2 - العملة", type: "text" },
      { id: "offer2_features", label: "Offer 2 - Features (1 per line)", labelAr: "الباقة 2 - المميزات", type: "textarea" },
      { id: "offer2_btn", label: "Offer 2 - Button Text", labelAr: "الباقة 2 - الزر", type: "text" },
      { id: "offer2_renewal", label: "Offer 2 - Renewal Text", labelAr: "الباقة 2 - نص التجديد", type: "text" },
    ],
  },
  {
    id: "howItWorks",
    emoji: "📋",
    name: "How It Works",
    nameAr: "كيف يعمل",
    fields: [
      { id: "badge", label: "Badge", labelAr: "الشارة", type: "text" },
      { id: "title", label: "Title", labelAr: "العنوان", type: "text" },
      { id: "subtitle", label: "Subtitle", labelAr: "الوصف الفرعي", type: "textarea" },
      { id: "planTrack", label: "Plan Track Label", labelAr: "عنوان مسار الجدول", type: "text" },
      { id: "coachingTrack", label: "Coaching Track Label", labelAr: "عنوان مسار المتابعة", type: "text" },
      { id: "plan_step1_title", label: "Plan Step 1 - Title", labelAr: "الجدول خطوة 1 - عنوان", type: "text" },
      { id: "plan_step1_desc", label: "Plan Step 1 - Description", labelAr: "الجدول خطوة 1 - شرح", type: "text" },
      { id: "plan_step2_title", label: "Plan Step 2 - Title", labelAr: "الجدول خطوة 2 - عنوان", type: "text" },
      { id: "plan_step2_desc", label: "Plan Step 2 - Description", labelAr: "الجدول خطوة 2 - شرح", type: "text" },
      { id: "plan_step3_title", label: "Plan Step 3 - Title", labelAr: "الجدول خطوة 3 - عنوان", type: "text" },
      { id: "plan_step3_desc", label: "Plan Step 3 - Description", labelAr: "الجدول خطوة 3 - شرح", type: "text" },
      { id: "coach_step1_title", label: "Coaching Step 1 - Title", labelAr: "المتابعة خطوة 1 - عنوان", type: "text" },
      { id: "coach_step1_desc", label: "Coaching Step 1 - Description", labelAr: "المتابعة خطوة 1 - شرح", type: "text" },
      { id: "coach_step2_title", label: "Coaching Step 2 - Title", labelAr: "المتابعة خطوة 2 - عنوان", type: "text" },
      { id: "coach_step2_desc", label: "Coaching Step 2 - Description", labelAr: "المتابعة خطوة 2 - شرح", type: "text" },
      { id: "coach_step3_title", label: "Coaching Step 3 - Title", labelAr: "المتابعة خطوة 3 - عنوان", type: "text" },
      { id: "coach_step3_desc", label: "Coaching Step 3 - Description", labelAr: "المتابعة خطوة 3 - شرح", type: "text" },
      { id: "coach_step4_title", label: "Coaching Step 4 - Title", labelAr: "المتابعة خطوة 4 - عنوان", type: "text" },
      { id: "coach_step4_desc", label: "Coaching Step 4 - Description", labelAr: "المتابعة خطوة 4 - شرح", type: "text" },
      { id: "coach_step5_title", label: "Coaching Step 5 - Title", labelAr: "المتابعة خطوة 5 - عنوان", type: "text" },
      { id: "coach_step5_desc", label: "Coaching Step 5 - Description", labelAr: "المتابعة خطوة 5 - شرح", type: "text" },
      { id: "coach_step6_title", label: "Coaching Step 6 - Title", labelAr: "المتابعة خطوة 6 - عنوان", type: "text" },
      { id: "coach_step6_desc", label: "Coaching Step 6 - Description", labelAr: "المتابعة خطوة 6 - شرح", type: "text" },
    ],
  },
  {
    id: "coach",
    emoji: "👤",
    name: "Coach Section",
    nameAr: "قسم الكوتش",
    fields: [
      { id: "name", label: "Coach Name", labelAr: "اسم الكوتش", type: "text" },
      { id: "sub", label: "Title / Credentials", labelAr: "المسمى والشهادات", type: "text" },
      { id: "bio", label: "Biography", labelAr: "نبذة عن الكوتش", type: "textarea" },
      { id: "point1", label: "Expertise Point 1", labelAr: "الميزة 1", type: "text" },
      { id: "point2", label: "Expertise Point 2", labelAr: "الميزة 2", type: "text" },
      { id: "point3", label: "Expertise Point 3", labelAr: "الميزة 3", type: "text" },
      { id: "portraitImage", label: "Portrait Photo", labelAr: "الصورة الشخصية", type: "image" },
      { id: "igUrl", label: "Instagram URL", labelAr: "رابط الانستجرام", type: "url" },
      { id: "ytUrl", label: "YouTube URL", labelAr: "رابط اليوتيوب", type: "url" },
      { id: "btn", label: "CTA Button Text", labelAr: "نص الزر", type: "text" },
    ],
  },
  {
    id: "experience",
    emoji: "📈",
    name: "Experience Timeline",
    nameAr: "الجدول الزمني",
    fields: [
      { id: "badge", label: "Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", label: "Title Line 1", labelAr: "العنوان سطر 1", type: "text" },
      { id: "titleLine2", label: "Title Line 2", labelAr: "العنوان سطر 2", type: "text" },
      { id: "subtitle", label: "Subtitle", labelAr: "الوصف الفرعي", type: "textarea" },
      { id: "metricsProgress", label: "Metric: Progress", labelAr: "مقياس التقدم", type: "text" },
      { id: "metricsTraining", label: "Metric: Training", labelAr: "مقياس التدريب", type: "text" },
      { id: "metricsNutrition", label: "Metric: Nutrition", labelAr: "مقياس التغذية", type: "text" },
      { id: "metricsCardio", label: "Metric: Cardio", labelAr: "مقياس الكارديو", type: "text" },
      { id: "metricsCheckIn", label: "Metric: Check-Ins", labelAr: "مقياس المتابعة", type: "text" },
    ],
  },
  {
    id: "testimonials",
    emoji: "⭐",
    name: "Testimonials",
    nameAr: "التقييمات",
    fields: [
      { id: "badge", label: "Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", label: "Title Line 1", labelAr: "العنوان سطر 1", type: "text" },
      { id: "titleLine2", label: "Title Line 2", labelAr: "العنوان سطر 2", type: "text" },
      { id: "subtitle", label: "Subtitle", labelAr: "الوصف الفرعي", type: "textarea" },
      { id: "t1_name", label: "Review 1 - Name", labelAr: "التقييم 1 - الاسم", type: "text" },
      { id: "t1_duration", label: "Review 1 - Duration", labelAr: "التقييم 1 - المدة", type: "text" },
      { id: "t1_result", label: "Review 1 - Result Badge", labelAr: "التقييم 1 - النتيجة", type: "text" },
      { id: "t1_text", label: "Review 1 - Quote", labelAr: "التقييم 1 - الرأي", type: "textarea" },
      { id: "t1_image", label: "Review 1 - Photo (optional)", labelAr: "التقييم 1 - الصورة", type: "image" },
      { id: "t2_name", label: "Review 2 - Name", labelAr: "التقييم 2 - الاسم", type: "text" },
      { id: "t2_duration", label: "Review 2 - Duration", labelAr: "التقييم 2 - المدة", type: "text" },
      { id: "t2_result", label: "Review 2 - Result Badge", labelAr: "التقييم 2 - النتيجة", type: "text" },
      { id: "t2_text", label: "Review 2 - Quote", labelAr: "التقييم 2 - الرأي", type: "textarea" },
      { id: "t2_image", label: "Review 2 - Photo (optional)", labelAr: "التقييم 2 - الصورة", type: "image" },
      { id: "t3_name", label: "Review 3 - Name", labelAr: "التقييم 3 - الاسم", type: "text" },
      { id: "t3_duration", label: "Review 3 - Duration", labelAr: "التقييم 3 - المدة", type: "text" },
      { id: "t3_result", label: "Review 3 - Result Badge", labelAr: "التقييم 3 - النتيجة", type: "text" },
      { id: "t3_text", label: "Review 3 - Quote", labelAr: "التقييم 3 - الرأي", type: "textarea" },
      { id: "t3_image", label: "Review 3 - Photo (optional)", labelAr: "التقييم 3 - الصورة", type: "image" },
    ],
  },
  {
    id: "faq",
    emoji: "❓",
    name: "FAQ",
    nameAr: "الأسئلة الشائعة",
    fields: [
      { id: "badge", label: "Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", label: "Title Line 1", labelAr: "العنوان سطر 1", type: "text" },
      { id: "titleLine2", label: "Title Line 2", labelAr: "العنوان سطر 2", type: "text" },
      { id: "q1", label: "Q1 - Question", labelAr: "س1 - السؤال", type: "text" },
      { id: "a1", label: "Q1 - Answer", labelAr: "س1 - الإجابة", type: "textarea" },
      { id: "q2", label: "Q2 - Question", labelAr: "س2 - السؤال", type: "text" },
      { id: "a2", label: "Q2 - Answer", labelAr: "س2 - الإجابة", type: "textarea" },
      { id: "q3", label: "Q3 - Question", labelAr: "س3 - السؤال", type: "text" },
      { id: "a3", label: "Q3 - Answer", labelAr: "س3 - الإجابة", type: "textarea" },
      { id: "q4", label: "Q4 - Question", labelAr: "س4 - السؤال", type: "text" },
      { id: "a4", label: "Q4 - Answer", labelAr: "س4 - الإجابة", type: "textarea" },
      { id: "q5", label: "Q5 - Question", labelAr: "س5 - السؤال", type: "text" },
      { id: "a5", label: "Q5 - Answer", labelAr: "س5 - الإجابة", type: "textarea" },
    ],
  },
  {
    id: "finalCta",
    emoji: "🔔",
    name: "Final CTA",
    nameAr: "الدعوة الأخيرة",
    fields: [
      { id: "badge", label: "Badge", labelAr: "الشارة", type: "text" },
      { id: "titleLine1", label: "Title Line 1", labelAr: "العنوان سطر 1", type: "text" },
      { id: "titleLine2", label: "Title Line 2", labelAr: "العنوان سطر 2", type: "text" },
      { id: "subtitle", label: "Subtitle", labelAr: "الوصف الفرعي", type: "textarea" },
      { id: "ctaBtn", label: "CTA Button Text", labelAr: "نص الزر الرئيسي", type: "text" },
      { id: "secondaryBtn", label: "Secondary Button Text", labelAr: "نص الزر الثانوي", type: "text" },
    ],
  },
  {
    id: "nav",
    emoji: "🧭",
    name: "Navigation Bar",
    nameAr: "شريط التنقل",
    fields: [
      { id: "brand", label: "Brand Name", labelAr: "اسم البراند", type: "text" },
      { id: "plans", label: "Plans Link Text", labelAr: "نص رابط الباقات", type: "text" },
      { id: "coach", label: "Coach Link Text", labelAr: "نص رابط الكوتش", type: "text" },
      { id: "results", label: "Results Link Text", labelAr: "نص رابط النتائج", type: "text" },
      { id: "faq", label: "FAQ Link Text", labelAr: "نص رابط الأسئلة", type: "text" },
      { id: "startNow", label: "CTA Button Text", labelAr: "نص زر ابدأ الآن", type: "text" },
    ],
  },
  {
    id: "footer",
    emoji: "🔗",
    name: "Footer",
    nameAr: "الفوتر",
    fields: [
      { id: "desc", label: "Brand Description", labelAr: "وصف البراند", type: "textarea" },
      { id: "navigate", label: "Navigation Heading", labelAr: "عنوان التصفح", type: "text" },
      { id: "offers", label: "Offers Heading", labelAr: "عنوان العروض", type: "text" },
      { id: "planOffer", label: "Plan Offer Link Text", labelAr: "نص رابط الجدول", type: "text" },
      { id: "coachingOffer", label: "Coaching Offer Link Text", labelAr: "نص رابط المتابعة", type: "text" },
      { id: "rights", label: "Copyright Text", labelAr: "حقوق النشر", type: "text" },
      { id: "tag", label: "Footer Tag", labelAr: "توقيع المطور", type: "text" },
      { id: "instagram_url", label: "Instagram URL", labelAr: "رابط انستجرام", type: "url" },
      { id: "tiktok_url", label: "TikTok URL", labelAr: "رابط تيك توك", type: "url" },
      { id: "youtube_url", label: "YouTube URL", labelAr: "رابط يوتيوب", type: "url" },
      { id: "whatsapp_url", label: "WhatsApp URL", labelAr: "رابط واتساب", type: "url" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type ContentMap = Record<string, Record<string, string>>;
type HiddenMap = Record<string, boolean>;
type UpdatePayload = { sectionId: string; fieldId: string; lang: "en" | "ar"; value: string };

// ─────────────────────────────────────────────────────────────
// IMAGE FIELD COMPONENT
// ─────────────────────────────────────────────────────────────

function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadErr("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/cms/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        setUploadErr(data.error || "Upload failed");
      }
    } catch {
      setUploadErr("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          dir="ltr"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or /assets/image.jpg"
          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--accent)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none font-mono transition-colors"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-sm text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Upload
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-2.5 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-sm transition-colors"
            title="Remove image"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {uploadErr && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle size={11} /> {uploadErr}
        </p>
      )}

      {value && (
        <div className="relative rounded-sm overflow-hidden border border-[var(--border)] bg-[var(--bg-base)] aspect-video max-h-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.15"; }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-black/90 text-white rounded-sm transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN CMS PAGE
// ─────────────────────────────────────────────────────────────

export default function CMSPage() {
  const { isArabic: isAdminArabic } = useLanguage();

  const [contentLang, setContentLang] = useState<"en" | "ar">("en");
  const [saved, setSaved] = useState<ContentMap>({});
  const [edits, setEdits] = useState<ContentMap>({});
  const [hiddenSaved, setHiddenSaved] = useState<HiddenMap>({});
  const [hiddenEdits, setHiddenEdits] = useState<HiddenMap>({});
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load content ──────────────────────────────────────────
  const loadContent = useCallback(async () => {
    try {
      const res = await fetch(`/api/site-content?lang=${contentLang}`);
      const { content } = await res.json();
      const map: ContentMap = content || {};
      setSaved(map);
      setEdits({});
      const hid: HiddenMap = {};
      SECTIONS.forEach((s) => { hid[s.id] = map[s.id]?.["_hidden"] === "1"; });
      setHiddenSaved(hid);
      setHiddenEdits({});
    } catch {}
  }, [contentLang]);

  useEffect(() => { loadContent(); }, [loadContent]);

  // ── Helpers ───────────────────────────────────────────────
  const getVal = useCallback(
    (sectionId: string, fieldId: string): string =>
      edits[sectionId]?.[fieldId] ?? saved[sectionId]?.[fieldId] ?? "",
    [edits, saved]
  );

  const setVal = useCallback((sectionId: string, fieldId: string, value: string) => {
    setEdits((prev) => ({ ...prev, [sectionId]: { ...(prev[sectionId] || {}), [fieldId]: value } }));
  }, []);

  const isSectionHidden = useCallback(
    (sectionId: string): boolean => hiddenEdits[sectionId] ?? hiddenSaved[sectionId] ?? false,
    [hiddenEdits, hiddenSaved]
  );

  const toggleVisibility = useCallback(
    (sectionId: string) => {
      setHiddenEdits((prev) => {
        const current = prev[sectionId] ?? hiddenSaved[sectionId] ?? false;
        return { ...prev, [sectionId]: !current };
      });
    },
    [hiddenSaved]
  );

  const isDirty = useCallback(
    (sectionId: string): boolean =>
      Object.keys(edits[sectionId] || {}).length > 0 || hiddenEdits[sectionId] !== undefined,
    [edits, hiddenEdits]
  );

  const dirtyCount = SECTIONS.filter((s) => isDirty(s.id)).length;

  const showToast = useCallback((type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Build update payload for a section ───────────────────
  const buildPayload = useCallback(
    (sectionId: string): UpdatePayload[] => {
      const updates: UpdatePayload[] = [];
      const sectionEdits = edits[sectionId] || {};
      for (const [fieldId, value] of Object.entries(sectionEdits)) {
        updates.push({ sectionId, fieldId, lang: contentLang, value });
      }
      if (hiddenEdits[sectionId] !== undefined) {
        const hidVal = hiddenEdits[sectionId] ? "1" : "0";
        updates.push({ sectionId, fieldId: "_hidden", lang: "en", value: hidVal });
        updates.push({ sectionId, fieldId: "_hidden", lang: "ar", value: hidVal });
      }
      return updates;
    },
    [edits, hiddenEdits, contentLang]
  );

  // ── Save section ──────────────────────────────────────────
  const saveSection = useCallback(
    async (sectionId: string) => {
      const updates = buildPayload(sectionId);
      if (updates.length === 0) { showToast("ok", "Nothing to save."); return; }
      setSaving(true);
      try {
        const res = await fetch("/api/admin/cms/batch", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });
        if (!res.ok) throw new Error();
        clearSiteContentCache();
        await loadContent();
        setPreviewKey((k) => k + 1);
        showToast("ok", "Saved and published!");
      } catch {
        showToast("err", "Save failed - please try again.");
      } finally {
        setSaving(false);
      }
    },
    [buildPayload, loadContent, showToast]
  );

  // ── Save all ──────────────────────────────────────────────
  const saveAll = useCallback(async () => {
    const updates: UpdatePayload[] = [];
    SECTIONS.forEach((s) => updates.push(...buildPayload(s.id)));
    if (updates.length === 0) { showToast("ok", "Nothing to save."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error();
      clearSiteContentCache();
      await loadContent();
      setPreviewKey((k) => k + 1);
      showToast("ok", `All changes saved! (${updates.length} updates)`);
    } catch {
      showToast("err", "Save all failed - please try again.");
    } finally {
      setSaving(false);
    }
  }, [buildPayload, loadContent, showToast]);

  const activeDef = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];
  const inputDir = contentLang === "ar" ? "rtl" : "ltr";

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[var(--bg-base)]">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-sm border text-sm font-semibold shadow-2xl transition-all ${
          toast.type === "ok"
            ? "bg-emerald-950 border-emerald-500/50 text-emerald-300"
            : "bg-red-950 border-red-500/50 text-red-300"
        }`}>
          {toast.type === "ok" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-2.5">
          <LayoutDashboard size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
            Website CMS
          </span>
          {dirtyCount > 0 && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              {dirtyCount} {dirtyCount === 1 ? "section" : "sections"} with unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Content language */}
          <div className="flex items-center border border-[var(--border)] rounded-sm overflow-hidden text-xs bg-[var(--bg-elevated)]">
            <button
              onClick={() => setContentLang("en")}
              className={`px-3 py-1.5 font-bold transition-colors ${contentLang === "en" ? "bg-[var(--accent)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >EN 🇬🇧</button>
            <button
              onClick={() => setContentLang("ar")}
              className={`px-3 py-1.5 font-bold transition-colors ${contentLang === "ar" ? "bg-[var(--accent)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >AR 🇪🇬</button>
          </div>

          <button
            onClick={() => setShowPreview((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-bold transition-all ${
              showPreview
                ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]"
                : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Columns2 size={13} />
            Preview
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all"
          >
            <ExternalLink size={13} /> Live Site
          </Link>

          <button
            onClick={saveAll}
            disabled={saving || dirtyCount === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-sm bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black font-black text-xs transition-all disabled:opacity-40 shadow-lg shadow-[var(--accent)]/20"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save All
            {dirtyCount > 0 && (
              <span className="bg-black/20 text-[10px] font-black px-1.5 py-0.5 rounded-full">{dirtyCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--bg-card)] overflow-y-auto flex flex-col">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Sections</p>
          </div>

          <nav className="flex-1 p-2 space-y-0.5">
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              const sectionDirty = isDirty(section.id);
              const sectionHidden = isSectionHidden(section.id);

              return (
                <div
                  key={section.id}
                  className={`group flex items-center rounded-sm border transition-all ${
                    isActive
                      ? "bg-[var(--accent)]/10 border-[var(--accent)]/30"
                      : "border-transparent hover:bg-[var(--bg-elevated)]"
                  } ${sectionHidden ? "opacity-50" : ""}`}
                >
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className="flex-1 flex items-center gap-2 px-2.5 py-2 text-start min-w-0"
                  >
                    <span className="text-sm leading-none shrink-0">{section.emoji}</span>
                    <span className={`text-xs font-semibold truncate ${
                      isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
                    } ${sectionHidden ? "line-through" : ""}`}>
                      {isAdminArabic ? section.nameAr : section.name}
                    </span>
                    {sectionDirty && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }}
                    className={`mr-1.5 p-1 rounded transition-colors ${
                      sectionHidden
                        ? "text-red-400 hover:text-red-300"
                        : "text-[var(--text-muted)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100"
                    }`}
                    title={sectionHidden ? "Show section" : "Hide section"}
                  >
                    {sectionHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              );
            })}
          </nav>

          <div className="p-3 border-t border-[var(--border)] space-y-1.5 shrink-0">
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Unsaved changes
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
              <EyeOff size={10} className="text-red-400" />
              Hidden section
            </div>
          </div>
        </aside>

        {/* ── Editor ────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto p-6 space-y-5">

            {/* Section header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xl">{activeDef.emoji}</span>
                  <h2 className="text-base font-black text-[var(--text-primary)]">
                    {isAdminArabic ? activeDef.nameAr : activeDef.name}
                  </h2>
                  {isDirty(activeDef.id) && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      Unsaved
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Editing: <span className="text-[var(--accent)] font-bold">{contentLang === "en" ? "English 🇬🇧" : "Arabic 🇪🇬"}</span>
                </p>
              </div>

              {/* Visibility toggle */}
              <button
                onClick={() => toggleVisibility(activeDef.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-sm border text-xs font-bold transition-all shrink-0 ${
                  isSectionHidden(activeDef.id)
                    ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                }`}
              >
                {isSectionHidden(activeDef.id) ? (
                  <><EyeOff size={12} /> Section is Hidden</>
                ) : (
                  <><Eye size={12} /> Section Visible</>
                )}
              </button>
            </div>

            <div className="h-px bg-[var(--border)]" />

            {/* Fields */}
            <div className="space-y-4">
              {activeDef.fields.map((field) => {
                const val = getVal(activeDef.id, field.id);
                const savedVal = saved[activeDef.id]?.[field.id] ?? "";
                const fieldDirty = edits[activeDef.id]?.[field.id] !== undefined;
                const fieldLabel = isAdminArabic ? field.labelAr : field.label;

                return (
                  <div key={field.id}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[var(--text-muted)]">
                        {field.type === "image" ? <ImageIcon size={11} /> :
                         field.type === "url" ? <Link2 size={11} /> :
                         field.type === "textarea" ? <AlignLeft size={11} /> :
                         <Type size={11} />}
                      </span>
                      <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                        {fieldLabel}
                      </label>
                      {fieldDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      {!fieldDirty && savedVal && (
                        <span className="text-[9px] text-emerald-500 font-bold">SAVED</span>
                      )}
                    </div>

                    {field.type === "image" ? (
                      <ImageField
                        value={val}
                        onChange={(v) => setVal(activeDef.id, field.id, v)}
                      />
                    ) : field.type === "textarea" ? (
                      <textarea
                        dir={inputDir}
                        rows={4}
                        value={val}
                        onChange={(e) => setVal(activeDef.id, field.id, e.target.value)}
                        placeholder={field.hint || fieldLabel}
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--accent)] rounded-sm px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none resize-y transition-colors leading-relaxed"
                      />
                    ) : (
                      <div className="flex gap-2">
                        <input
                          dir={field.type === "url" ? "ltr" : inputDir}
                          type="text"
                          value={val}
                          onChange={(e) => setVal(activeDef.id, field.id, e.target.value)}
                          placeholder={field.hint || fieldLabel}
                          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] focus:border-[var(--accent)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none transition-colors"
                        />
                        {val && (
                          <button
                            type="button"
                            onClick={() => setVal(activeDef.id, field.id, "")}
                            className="px-2.5 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-red-400 rounded-sm transition-colors"
                            title="Clear"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save / Discard */}
            <div className="pt-4 border-t border-[var(--border)] flex items-center gap-3">
              <button
                onClick={() => saveSection(activeDef.id)}
                disabled={saving || !isDirty(activeDef.id)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black font-black text-xs rounded-sm transition-all disabled:opacity-40 shadow-lg shadow-[var(--accent)]/20"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save Section
              </button>

              <button
                onClick={() => {
                  setEdits((prev) => { const n = { ...prev }; delete n[activeDef.id]; return n; });
                  setHiddenEdits((prev) => { const n = { ...prev }; delete n[activeDef.id]; return n; });
                }}
                disabled={!isDirty(activeDef.id)}
                className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold text-xs rounded-sm transition-all disabled:opacity-30"
              >
                <RefreshCw size={12} /> Discard
              </button>
            </div>
          </div>
        </main>

        {/* ── Preview Panel ─────────────────────────────────── */}
        {showPreview && (
          <aside className="w-[400px] shrink-0 border-l border-[var(--border)] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-card)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                <Monitor size={13} className="text-[var(--accent)]" />
                Live Preview
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewKey((k) => k + 1)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors rounded"
                  title="Refresh preview"
                >
                  <RefreshCw size={12} />
                </button>
                <Link href="/" target="_blank" className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors rounded">
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden bg-[var(--bg-base)]">
              <iframe
                key={previewKey}
                src="/"
                className="absolute inset-0 border-0"
                style={{
                  width: "167%",
                  height: "167%",
                  transform: "scale(0.6)",
                  transformOrigin: "top left",
                }}
                title="Site Preview"
              />
            </div>
            <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-card)]">
              <p className="text-[10px] text-[var(--text-muted)] text-center">
                Refreshes after save — click ↺ to manually refresh
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
