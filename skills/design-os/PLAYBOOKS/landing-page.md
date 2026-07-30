# Playbook — Landing page

Barre : Stripe-level clarity, brand-first, zéro AI-slop.  
Skills : DESIGN_OS → Frontend Design → Vercel Design → 21st → shadcn.

---

## Étapes

### 1. Besoin produit
- JTBD + audience + offre unique
- **1** conversion primaire (signup / demo / buy)
- Contenu réel (headline, preuve) — pas lorem

### 2. Références
1. **Mobbin** — landings / marketing mobile si pertinent
2. **Refero** — landings SaaS desktop (structure sections)
3. **Raylight** — mood typo/couleur (filtrer slop)
4. Gold : **Stripe** (+ Linear marketing si product-led)

### 3. Style
- Ancre primaire **Stripe** ou brand repo
- Hero budget : brand + 1 headline + 1 phrase + CTA group + **1** ancre visuelle full-bleed
- Interdit : stats strip, cards hero, badges flottants

### 4. Composants
1. **21st.dev** — hero, logo cloud sobre, pricing, FAQ, footer
2. **shadcn** — Button, Accordion, Dialog seulement si gap
3. **Spline** — seulement si 3D produit justifié + fallback

### 5. Audit
- [CHECKLIST_ANTI_SLOP.md](../CHECKLIST_ANTI_SLOP.md)
- **Vercel Design** `CHECKLIST.md` (obligatoire)
- Frontend Design pass anti-générique
- Option : Audit Design complet

### 6. Optimize
- Hiérarchie, contraste, CLS, focus, mobile, motion 2–3 max, a11y

---

## Do / Don’t

| Do | Don’t |
|----|-------|
| Une composition first viewport | Dashboard-like hero |
| Preuve visuelle produit | Texte+texte+texte |
| 1 CTA primaire | 15 CTAs |
| Sections = 1 job | Feature card grids infinies |
