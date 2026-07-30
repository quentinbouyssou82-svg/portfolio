# Behavioral economics — leviers classiques

Cadre : économie comportementale (Kahneman & Tversky *prospect theory*, Thaler, Cialdini pour social proof — **concepts établis**, pas d’études inventées).

Usage éthique uniquement → [ANTI_DARK_PATTERNS.md](../ANTI_DARK_PATTERNS.md).

---

## Leviers (liste requise)

### Loss aversion
- Pertes pèsent plus que gains équivalents (prospect theory)
- **OK :** montrer crédits / streak **réels** en jeu si l’user choisit de « dépenser »
- **KO :** menaces inventées, fear-based retention

### Endowment effect
- On valorise plus ce qu’on « possède »
- **OK :** carte / profil / progrès nominatif, ownership symbolique
- **KO :** fake ownership pour bloquer le churn

### Sunk cost
- Tendance à continuer à cause de l’investissement passé
- **OK :** rappeler le progrès pour motiver **avec** choix libre
- **KO :** « tu as déjà payé, tu dois rester »

### Commitment
- Engagement public / écrit augmente suivi (consistency)
- **OK :** pledge explicite, goals user-defined, réversible
- **KO :** signature avant prix caché ; commitment piège

### Social proof
- On imite les pairs (Cialdini)
- **OK :** vrais amis, vrais classements, témoignages vérifiables
- **KO :** compteurs fake, « 10k users online » inventé

### Scarcity
- Rareté perçue ↑ désir
- **OK :** limite produit réelle (free = N apps, seats plan)
- **KO :** timers qui reset, stock fictif

### Anchoring
- Première info ancre le jugement (prix, stats)
- **OK :** ancre = vrai plan annuel / vraie baseline « temps scrollé »
- **KO :** prix barré fictif permanent

### Framing
- Même fait, framing gain vs perte change le choix
- **OK :** « 1.9 ans récupérés » si calcul transparent
- **KO :** framing trompeur / chiffres non sourcés

---

## Autres utiles (bonus)

| Concept | Usage produit |
|---------|---------------|
| Default bias | Defaults sains (focus duration raisonnable) |
| Present bias | Rendre le futur gain visible *maintenant* (preview) |
| Goal gradient | Plus on est proche, plus on accélère — montrer proximité |
| Peak-end rule | Soigner pic + fin de session (feedback de clôture) |

---

## Usage agent

Pour chaque levier proposé : **mécanisme → preuve UX → risque éthique → alternative**.
Max 2–3 leviers BE par feature (éviter soupçon de manipulation).
