"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Save, Eye, EyeOff, Upload, X, RefreshCw,
  Monitor, Smartphone, Loader2, ExternalLink,
  Image as ImageIcon, Link2, AlignLeft, Type,
  Globe, LayoutDashboard,
  AlertTriangle, CheckCircle2, Trash2,
  Home, ShieldCheck, AlertOctagon, Dumbbell, Flame, Target, ListChecks, UserCircle, TrendingUp, Star, HelpCircle, Bell,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { clearSiteContentCache } from "@/lib/use-site-content";
import Link from "next/link";
import { translations } from "@/lib/translations";

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
  icon: any;
  name: string;
  nameAr: string;
  fields: FieldDef[];
};

const SECTIONS: SectionDef[] = [
  {
    id: "hero",
    icon: Home,
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
    icon: ShieldCheck,
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
    icon: AlertOctagon,
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
    icon: Dumbbell,
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
    icon: Flame,
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
    icon: Target,
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
    icon: ListChecks,
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
    icon: UserCircle,
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
    icon: TrendingUp,
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
    icon: Star,
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
    icon: HelpCircle,
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
    icon: Bell,
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
    icon: Globe,
    name: "Navigation Bar",
    nameAr: "شريط التنقل",
    fields: [
      { id: "brand", label: "Brand Name", labelAr: "اسم البراند", type: "text" },
      { id: "plans", label: "Plans Link", labelAr: "رابط الباقات", type: "text" },
      { id: "coach", label: "Coach Link", labelAr: "رابط الكوتش", type: "text" },
      { id: "results", label: "Results Link", labelAr: "رابط النتائج", type: "text" },
      { id: "faq", label: "FAQ Link", labelAr: "رابط الأسئلة", type: "text" },
      { id: "startNow", label: "CTA Button", labelAr: "زر ابدأ الآن", type: "text" },
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

type ViewMode = "desktop" | "mobile";

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
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
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

  // Get a value from translations as fallback for empty DB fields
  // This makes the admin see the actual live site text in each field
  const getFallback = useCallback((sectionId: string, fieldId: string): string => {
    try {
      const t = translations[contentLang] as any;
      const sec = t[sectionId];
      if (!sec) return "";
      // Flat string
      if (typeof sec[fieldId] === "string") return sec[fieldId];
      // trust.items[0..4] → item1..item5
      if (sectionId === "trust" && fieldId.startsWith("item")) {
        const idx = parseInt(fieldId.replace("item", ""), 10) - 1;
        return Array.isArray(sec.items) ? sec.items[idx] ?? "" : "";
      }
      return "";
    } catch { return ""; }
  }, [contentLang]);

  // getVal: edit in progress → saved DB value → translations fallback
  const getDisplayVal = useCallback(
    (sectionId: string, fieldId: string): string =>
      edits[sectionId]?.[fieldId] ?? saved[sectionId]?.[fieldId] ?? getFallback(sectionId, fieldId),
    [edits, saved, getFallback]
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

  return (
    <>
      {/* Break out of AdminLayout's p-8 + overflow-y-auto */}
      <style>{`
        .cms-wrap { margin: -2rem; height: calc(100vh - 64px); display: flex; flex-direction: column; overflow: hidden; background: #0a0c10; }
        .cms-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px 12px; color: #f1f5f9; font-size: 13px; outline: none; transition: border-color .15s; }
        .cms-input:focus { border-color: var(--accent,#caf02b); }
        .cms-input::placeholder { color: rgba(255,255,255,0.22); }
        .cms-nav-item { display:flex; align-items:center; gap:8px; width:100%; padding:7px 10px; border-radius:6px; cursor:pointer; border:1px solid transparent; background:transparent; color:rgba(255,255,255,0.5); font-size:12px; font-weight:500; text-align:left; transition:all .12s; }
        .cms-nav-item:hover { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.85); }
        .cms-nav-item.act { background:rgba(202,240,43,0.1); border-color:rgba(202,240,43,0.25); color:var(--accent,#caf02b); }
      `}</style>
      <div className="cms-wrap">

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

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header style={{ height:52, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', background:'rgba(10,12,16,0.97)', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <LayoutDashboard size={15} color="var(--accent,#caf02b)" />
          <span style={{ fontSize:12, fontWeight:900, color:'#f1f5f9', textTransform:'uppercase', letterSpacing:'0.08em' }}>Website CMS</span>
          {dirtyCount > 0 && (
            <span style={{ fontSize:10, fontWeight:700, color:'#fbbf24', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)', padding:'2px 8px', borderRadius:99 }}>
              {dirtyCount} unsaved
            </span>
          )}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Language toggle */}
          <div style={{ display:'flex', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, overflow:'hidden', fontSize:11 }}>
            {(['en','ar'] as const).map(l => (
              <button key={l} onClick={() => setContentLang(l)} style={{ padding:'5px 12px', fontWeight:700, cursor:'pointer', border:'none', background: contentLang===l ? 'var(--accent,#caf02b)' : 'transparent', color: contentLang===l ? '#000' : 'rgba(255,255,255,0.5)', transition:'all .15s' }}>
                {l==='en' ? '🇬🇧 EN' : '🇪🇬 AR'}
              </button>
            ))}
          </div>
          {/* Preview toggle */}
          <button onClick={() => setShowPreview(p=>!p)} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:6, border:'1px solid', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .15s', ...(showPreview ? {background:'rgba(202,240,43,0.08)', borderColor:'rgba(202,240,43,0.3)', color:'var(--accent,#caf02b)'} : {background:'rgba(255,255,255,0.04)', borderColor:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)'}) }}>
            <Monitor size={13}/> Preview
          </button>
          <Link href="/" target="_blank" style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:6, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, textDecoration:'none', transition:'all .15s' }}>
            <ExternalLink size={12}/> Live
          </Link>
          <button onClick={saveAll} disabled={saving||dirtyCount===0} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 16px', background:'var(--accent,#caf02b)', color:'#000', border:'none', borderRadius:6, fontWeight:900, fontSize:12, cursor:'pointer', opacity: saving||dirtyCount===0 ? 0.4 : 1, transition:'opacity .15s' }}>
            {saving ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>}
            Save All {dirtyCount > 0 && <span style={{ background:'rgba(0,0,0,0.2)', fontSize:10, fontWeight:900, padding:'1px 6px', borderRadius:99 }}>{dirtyCount}</span>}
          </button>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>

        {/* ── Section Sidebar ───────────────────────────────── */}
        <aside style={{ width:196, flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.07)', background:'rgba(8,10,14,0.9)', display:'flex', flexDirection:'column', overflowY:'auto' }}>
          <div style={{ padding:'10px 10px 6px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(255,255,255,0.25)', margin:0 }}>Sections</p>
          </div>
          <nav style={{ flex:1, padding:6, display:'flex', flexDirection:'column', gap:1 }}>
            {SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              const sectionDirty = isDirty(section.id);
              const sectionHidden = isSectionHidden(section.id);
              return (
                <div key={section.id} style={{ display:'flex', alignItems:'center', gap:2 }}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`cms-nav-item ${isActive ? 'act' : ''}`}
                    style={{ flex:1, opacity: sectionHidden ? 0.4 : 1 }}
                  >
                    <section.icon size={13} style={{ flexShrink:0 }}/>
                    <span style={{ flex:1, textAlign:'left', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: sectionHidden ? 'line-through' : 'none' }}>
                      {isAdminArabic ? section.nameAr : section.name}
                    </span>
                    {sectionDirty && <span style={{ width:6, height:6, borderRadius:'50%', background:'#fbbf24', flexShrink:0 }}/>}
                  </button>
                  <button onClick={() => toggleVisibility(section.id)} style={{ padding:'4px 5px', borderRadius:4, background:'transparent', border:'none', cursor:'pointer', color: sectionHidden ? '#f87171' : 'rgba(255,255,255,0.2)', transition:'color .12s', flexShrink:0 }} title={sectionHidden?'Show':'Hide'}>
                    {sectionHidden ? <EyeOff size={11}/> : <Eye size={11}/>}
                  </button>
                </div>
              );
            })}
          </nav>
          <div style={{ padding:'8px 10px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', gap:5 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, color:'rgba(255,255,255,0.25)' }}><span style={{ width:6,height:6,borderRadius:'50%',background:'#fbbf24' }}/> Unsaved</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, color:'rgba(255,255,255,0.25)' }}><EyeOff size={9} color="#f87171"/> Hidden</div>
          </div>
        </aside>

        {/* ── Editor ─────────────────────────────────────────── */}
        <main style={{ width: showPreview ? 360 : undefined, flex: showPreview ? '0 0 360px' : 1, overflowY:'auto', minWidth:0, borderRight: showPreview ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
          <div style={{ padding:'20px 16px 48px' }}>

            {/* Section header */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <activeDef.icon size={20} color="var(--accent,#caf02b)"/>
                  <h2 style={{ fontSize:16, fontWeight:900, color:'#f1f5f9', margin:0 }}>
                    {isAdminArabic ? activeDef.nameAr : activeDef.name}
                  </h2>
                  {isDirty(activeDef.id) && (
                    <span style={{ fontSize:10, fontWeight:700, color:'#fbbf24', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)', padding:'2px 8px', borderRadius:99 }}>Unsaved</span>
                  )}
                </div>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', margin:0 }}>
                  Editing: <span style={{ color:'var(--accent,#caf02b)', fontWeight:700 }}>{contentLang==='en' ? 'English 🇬🇧' : 'Arabic 🇪🇬'}</span>
                </p>
              </div>
              <button onClick={() => toggleVisibility(activeDef.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:6, border:'1px solid', fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0, transition:'all .15s', ...(isSectionHidden(activeDef.id) ? {background:'rgba(239,68,68,0.1)', borderColor:'rgba(239,68,68,0.3)', color:'#f87171'} : {background:'rgba(16,185,129,0.08)', borderColor:'rgba(16,185,129,0.25)', color:'#34d399'}) }}>
                {isSectionHidden(activeDef.id) ? <><EyeOff size={13}/> Hidden</> : <><Eye size={13}/> Visible</>}
              </button>
            </div>

            <div style={{ height:1, background:'rgba(255,255,255,0.07)', marginBottom:20 }}/>

            {/* Fields */}
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {activeDef.fields.map((field) => {
                const val = getDisplayVal(activeDef.id, field.id);
                const savedVal = saved[activeDef.id]?.[field.id] ?? '';
                const isFromFallback = !edits[activeDef.id]?.[field.id] && !savedVal;
                const fieldDirty = edits[activeDef.id]?.[field.id] !== undefined;
                const fieldLabel = isAdminArabic ? field.labelAr : field.label;

                return (
                  <div key={field.id}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                      <span style={{ color:'rgba(255,255,255,0.3)' }}>
                        {field.type==='image' ? <ImageIcon size={11}/> : field.type==='url' ? <Link2 size={11}/> : field.type==='textarea' ? <AlignLeft size={11}/> : <Type size={11}/>}
                      </span>
                      <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{fieldLabel}</label>
                    {fieldDirty && <span style={{ width:6, height:6, borderRadius:'50%', background:'#fbbf24' }}/>}
                      {!fieldDirty && savedVal && <span style={{ fontSize:9, fontWeight:700, color:'#34d399' }}>SAVED</span>}
                      {!fieldDirty && !savedVal && val && <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)' }}>DEFAULT</span>}
                    </div>

                    {field.type === 'image' ? (
                      <ImageField value={val} onChange={(v) => setVal(activeDef.id, field.id, v)}/>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        dir={inputDir}
                        rows={4}
                        value={val}
                        onChange={(e) => setVal(activeDef.id, field.id, e.target.value)}
                        placeholder={isFromFallback ? '' : (field.hint || fieldLabel)}
                        className="cms-input"
                        style={{ resize:'vertical', lineHeight:1.6, opacity: isFromFallback && !fieldDirty ? 0.65 : 1 }}
                      />
                    ) : (
                      <div style={{ display:'flex', gap:6 }}>
                        <input
                          dir={field.type==='url' ? 'ltr' : inputDir}
                          type="text"
                          value={val}
                          onChange={(e) => setVal(activeDef.id, field.id, e.target.value)}
                          placeholder={isFromFallback ? '' : (field.hint || fieldLabel)}
                          className="cms-input"
                          style={{ opacity: isFromFallback && !fieldDirty ? 0.65 : 1 }}
                        />
                        {val && (
                          <button type="button" onClick={() => setVal(activeDef.id, field.id, '')} style={{ padding:'7px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.4)', cursor:'pointer', flexShrink:0 }} title="Clear">
                            <X size={12}/>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save / Discard */}
            <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={() => saveSection(activeDef.id)} disabled={saving||!isDirty(activeDef.id)} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 20px', background:'var(--accent,#caf02b)', color:'#000', border:'none', borderRadius:6, fontWeight:900, fontSize:12, cursor:'pointer', opacity: saving||!isDirty(activeDef.id) ? 0.4 : 1, transition:'opacity .15s' }}>
                {saving ? <Loader2 size={13} className="animate-spin"/> : <Save size={13}/>} Save Section
              </button>
              <button onClick={() => { setEdits(prev=>{ const n={...prev}; delete n[activeDef.id]; return n; }); setHiddenEdits(prev=>{ const n={...prev}; delete n[activeDef.id]; return n; }); }} disabled={!isDirty(activeDef.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:6, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:600, cursor:'pointer', opacity:!isDirty(activeDef.id)?0.35:1, transition:'opacity .15s' }}>
                <RefreshCw size={12}/> Discard
              </button>
            </div>
          </div>
        </main>

        {/* ── Preview Panel ──────────────────────────────────── */}
        {showPreview && (
          <aside style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, background:'#0d0f13' }}>
            {/* Toolbar */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(8,10,14,0.9)', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Monitor size={13} color="var(--accent,#caf02b)"/>
                <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.45)' }}>Live Preview</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                {(['desktop','mobile'] as ViewMode[]).map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)} style={{ padding:'4px 8px', borderRadius:5, border:'none', cursor:'pointer', background: viewMode===mode ? 'rgba(202,240,43,0.12)' : 'transparent', color: viewMode===mode ? 'var(--accent,#caf02b)' : 'rgba(255,255,255,0.3)', transition:'all .12s' }} title={mode}>
                    {mode==='desktop' ? <Monitor size={13}/> : <Smartphone size={13}/>}
                  </button>
                ))}
                <button onClick={() => setPreviewKey(k=>k+1)} style={{ padding:'4px 8px', borderRadius:5, border:'none', cursor:'pointer', background:'transparent', color:'rgba(255,255,255,0.3)', transition:'color .12s' }} title="Refresh">
                  <RefreshCw size={12}/>
                </button>
                <Link href="/" target="_blank" style={{ padding:'4px 8px', borderRadius:5, color:'rgba(255,255,255,0.3)', display:'flex', alignItems:'center' }}>
                  <ExternalLink size={12}/>
                </Link>
              </div>
            </div>
            {/* Frame */}
            <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:16, overflow:'hidden', background:'#141720' }}>
              <PreviewFrame key={previewKey} viewMode={viewMode}/>
            </div>
            <div style={{ padding:'5px 14px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(8,10,14,0.8)' }}>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.2)', textAlign:'center', margin:0 }}>Refreshes after save · ↺ to refresh manually</p>
            </div>
          </aside>
        )}
      </div>
    </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW FRAME — ResizeObserver-based scale calc
// ─────────────────────────────────────────────────────────────────────────────

function PreviewFrame({ viewMode }: { viewMode: "desktop" | "mobile" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const SITE_W = viewMode === "desktop" ? 1280 : 390;
  const SITE_H = viewMode === "desktop" ? 900 : 844;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / SITE_W, height / SITE_H, 1));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [SITE_W, SITE_H]);

  return (
    <div ref={containerRef} style={{ width:'100%', height:'100%', display:'flex', alignItems:'flex-start', justifyContent:'center', overflow:'hidden' }}>
      <div style={{ width: SITE_W * scale, height: SITE_H * scale, position:'relative', boxShadow:'0 8px 48px rgba(0,0,0,0.7)', borderRadius: viewMode==='mobile' ? 28 : 8, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
        <iframe
          src="/"
          title="Site Preview"
          style={{ position:'absolute', top:0, left:0, width:SITE_W, height:SITE_H, border:'none', transformOrigin:'top left', transform:`scale(${scale})` }}
        />
      </div>
    </div>
  );
}
