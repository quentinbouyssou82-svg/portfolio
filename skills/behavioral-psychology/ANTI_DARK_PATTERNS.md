# Anti Dark Patterns

Garde-fous **obligatoires**. Tout levier efficace + trompeur = **interdit**.

Réf. utiles : darkpatterns.org (Brignull), Apple App Store Review (subscriptions, misleading), FTC deception principles — **cadre**, pas citation inventée.

---

## Interdits absolus

| Pattern | Exemple | Alternative éthique |
|---------|---------|---------------------|
| **Manipulation abusive** | Guilt, shame, fear pour forcer l’action | Clarifier bénéfice + laisser choisir |
| **Pièges d’abonnement** | Cancel caché, « free » qui charge sans consent clair | Prix, période, renew, cancel **évidents** |
| **Compteurs fake** | « 12 personnes regardent » inventé | Social proof **vrai** ou aucun |
| **Notifs trompeuses** | Badge / push qui ment sur le contenu | Notif = contenu réel + opt-in |
| **Lying UX** | Bouton X qui confirme l’achat ; confirmshaming | Labels honnêtes ; exit clair |
| **Fake urgency / scarcity** | Timer qui reset ; « dernier stock » faux | Urgence réelle (fin d’offre datée) ou rien |
| **Roach motel** | Facile d’entrer, impossible de sortir | Symétrie entrée/sortie |
| **Forced continuity** | Trial → paid sans rappel clair | Reminder avant charge + restore |
| **Obstruction** | Friction volontaire pour bloquer le churn | Écouter raison + offrir pause / plan down |
| **Misdirection** | Visual hierarchy qui cache le prix | Prix & termes au même niveau de clarté |
| **Friend spam** | Contacter le carnet sans consent | Consent explicite, prévisualisation |
| **Addiction forcée** | Infinite scroll + reward non stop sans off-ramp | Caps, pauses, delayed reward (Lembke-style) |

---

## Zones grises → règles

| Zone | OK si… | KO si… |
|------|--------|--------|
| **Loss aversion** | Perte de progrès **réel** choisi (crédits non dépensés) | Menace artificielle, punition opaque |
| **Streaks** | Soft freeze / recovery / grace | Shame + perte totale irréversible sans warning |
| **Variable reward** | Feedback utile + curiosité dosée | Slot-machine, lootboxes addictives |
| **Social proof** | Vrais users / vrais counts | Bots, chiffres inventés |
| **Commitment** | Engagement explicite, réversible | Signature piège avant prix caché |
| **Scarcity** | Limite produit réelle (ex. free = 3 apps) | Fake « seats left » |
| **Anchoring** | Ancre = vrai plan / vrai prix marché | Prix barré fictif permanent |
| **Sunk cost** | Montrer l’investissement pour motiver **avec** autonomie | « Tu as déjà payé, tu ne peux pas partir » |

---

## Checklist avant ship (behavior)

- [ ] Aucun mensonge factuel (prix, counts, timers, notifs)
- [ ] Cancel / restore / leave accessibles
- [ ] Opt-in push & tracking
- [ ] Trial/renew expliqués en langage clair
- [ ] Rewards liés à une action réelle de l’user
- [ ] Off-ramp : pause, break, mode doux
- [ ] Enfant / vulnerable users : prudence accrue (pas de leviers agressifs)
- [ ] Behavior Audit passé si feature engagement-critique

---

## Phrase de décision

> « Est-ce que je serais à l’aise d’expliquer ce pattern à un régulateur **et** à l’utilisateur en une phrase honnête ? »

Non → supprimer ou redesign éthique.
