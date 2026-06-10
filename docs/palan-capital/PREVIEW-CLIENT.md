# Preview client — Palan Capital

Document interne pour préparer le call client. Toutes les infos proviennent du site actuel ([palan-capital.netlify.app](https://palan-capital.netlify.app)).

## URL de preview

| Environnement | URL |
|---------------|-----|
| Local | `npm run dev` → `/demos/palan-capital` |
| Staging | À déployer sur Vercel (prochaine étape optionnelle) |

## Ce qu’on montre au client

1. **Accueil** — hero, juridictions, expertises, convictions, audiences, CTA
2. **4 pages métiers** — dirigeants, patrimoines, fonds, investisseurs
3. **Cabinet** — bio Julien Guiraud + photo (reprise du site actuel)
4. **Contact** — formulaire fonctionnel (sans envoi email configuré)
5. **Mentions légales** — contenu repris + section confidentialité

## Améliorations vs site actuel (à présenter)

- Site **100 % responsive** (mobile-first)
- Menu hamburger + CTA contact visible
- Contrastes texte améliorés (accessibilité)
- Formulaire avec validation + consentement RGPD
- Bandeau cookies
- Favicon + metadata SEO
- Base technique Next.js (maintenable, évolutive)

## Ce qu’on ne prétend pas savoir

On n’invente rien au-delà du site source :

- Pas de logos partenaires affichés (Décathlon, etc.) — **à valider**
- Pas de domaine final configuré — **à valider**
- Pas d’envoi email réel — **à configurer plus tard**
- Agréments « en cours » — texte repris tel quel du site actuel
- Photo fondateur — reprise du site actuel (qualité limitée)

## 8 points à valider au call (30 min max)

1. Palette : conserver navy / gold / ivory ?
2. Mobile-first : OK ?
3. Email de réception du formulaire ?
4. Calendly ou formulaire seul ?
5. Logos partenaires autorisés ?
6. Domaine + accès DNS ?
7. Qui valide les retours (délai 24–48 h) ?
8. Date de mise en production

**Règle :** sans retour sous 24 h → on continue sur les hypothèses (`HYPOTHESES.md`).

## Pages à parcourir ensemble (5 min)

```
/demos/palan-capital              → accueil
/demos/palan-capital/dirigeants   → page métier type
/demos/palan-capital/cabinet      → fondateur
/demos/palan-capital/contact      → formulaire
```

Tester sur **iPhone** (ou DevTools mobile) avant le call.

## Après validation client

- [ ] Retours visuels (1 round)
- [ ] Config email (Resend ou autre)
- [ ] Domaine production
- [ ] Retirer `noindex` pour la prod
- [ ] Déploiement final
