# Playbook — Auth

Barre : friction minimale, trust, a11y formulaires — look **Stripe** / système.

---

## Étapes

### 1. Besoin produit
- Login / signup / SSO / magic link / MFA
- Erreurs et recovery (forgot password)
- Redirection post-auth

### 2. Références
1. **Mobbin** — auth mobile
2. **Refero** — auth desktop SaaS
3. Skip Raylight sauf brand login wall
4. Gold : Stripe, Linear, Notion (calm)

### 3. Style
- Centré sur le formulaire ; branding discret
- Pas d’illustration AI ; pas de glass
- Messages d’erreur humains + recovery

### 4. Composants
1. **21st** — layouts auth premium **si** match + adaptable
2. **shadcn** — Form, Input, Button, Checkbox (souvent suffisant)
3. OAuth buttons sobres, pas 6 providers égaux sans besoin

### 5. Audit
- a11y labels, autocomplete, focus, contraste
- Anti-slop
- Vercel si page marketing-login hybride

### 6. Optimize
- Clavier, mobile keyboards (email/password), loading states, rate-limit UX

---

## Do / Don’t

| Do | Don’t |
|----|-------|
| 1 chemin principal | 5 méthodes égales clutter |
| Erreurs actionnables | « Invalid » sans next step |
| Legal links discrets | Mur de texte légal avant email |
