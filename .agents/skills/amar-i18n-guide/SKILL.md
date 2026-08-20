---
name: amar-i18n-guide
description: Cheat sheet and guidelines for managing multi-language (English and Arabic) translations.
---

# THE AMMAR Platform — i18n & Translation Guide

## 1. Structure
- File: `src/lib/translations.ts`.
- Schema: `TranslationSchema` interface defines type safety for all dictionary keys.
- Language record: `translations.en` and `translations.ar`.

## 2. Rules for Modifying Text
- **Never hardcode strings** in `.tsx` components.
- Always add/modify keys in `TranslationSchema` first if adding a new key.
- Provide matching high-quality translations in both `translations.en` and `translations.ar`.
- Arabic strings use RTL grammar conventions.
- Access via `const { t, isArabic } = useLanguage();`.
