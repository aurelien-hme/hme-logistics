# Résumé de la stratégie commerciale — HME Logistics

> Synthèse établie à partir du contenu actuel du site (`index.html`, `diagnostic.html`, `merci.html`, `partenaires.html`) et du tunnel de capture de leads (`script.js`, `api/sio.js`).

---

## 1. Positionnement

**Logisticien e-commerce hyper spécialisé santé, bien-être & beauté** — en opposition frontale aux logisticiens généralistes.

- **Promesse centrale :** « Arrêtez de confier votre rentabilité à un logisticien généraliste. »
- **Slogan :** « Votre marque est spécialisée. Votre logistique devrait l'être aussi. »
- **Ennemi désigné :** le *généralisme* — mutualisation de secteurs aux contraintes incompatibles (mode, bijoux, valises…), où le client « finance la complexité des autres ».
- **Méthode propriétaire :** le **Système Home Made®** (hyper spécialisation, chaînes logistiques dédiées, cellules opérationnelles dédiées, optimisation continue).
- **Légitimité fondateurs :** « Avant d'être logisticiens, nous étions e-commerçants comme vous » — 10+ ans d'e-commerce. Mantra : *« Si c'était notre marque, que ferions-nous ? »*

## 2. Cible (ICP)

Positionnement assumé de sélectivité : « Nous n'accompagnons pas tout le monde. Et c'est volontaire. » — « Top 1 % des e-commerçants ambitieux ».

| Critère | Profil idéal | Hors cible |
|---|---|---|
| Origine | Marques françaises | — |
| Chiffre d'affaires | 1 M€ – 25 M€ | < 1 M€ |
| Volume | 3 000 – 40 000 commandes/mois | — |
| Secteur | Compléments alimentaires, santé, bien-être, cosmétique, CBD | Frais, surgelé, très volumineux |
| Catalogue | < 25 SKU en moyenne | — |
| Modèle | Forte récurrence d'achat / abonnements | Modèle économique instable |
| Phase | Croissance, levée de fonds, préparation d'exit | Recherche d'un simple stockage |
| Posture | Logistique vue comme levier stratégique, partenariat long terme | Relation purement transactionnelle |

**Décideur visé :** fondateur·rice / dirigeant·e, sensible à la marge, à l'EBITDA et à la valorisation.

## 3. Proposition de valeur

L'argumentaire ne vend pas un prix au colis, il vend **de la rentabilité** :

1. **Économies :** jusqu'à **−30 %** de coûts logistiques, soit **100 k€ à 400 k€/an** selon volumes.
2. **Impact EBITDA direct :** « Chaque euro économisé en logistique arrive directement dans votre rentabilité » — sans acquisition, publicité ni recrutement.
3. **Valorisation / exit :** « Préparez votre exit dans les meilleures conditions ».
4. **Qualité :** jusqu'à **3× moins d'erreurs** et **3× moins de tickets SAV**.
5. **Charge mentale nulle :** onboarding et migration pilotés de A à Z par HME.
6. **Expérience client premium :** packaging sur mesure, suivi brandé, portail retours autonome.

**Triptyque « obsession » :** Protéger votre rentabilité · Accompagner votre croissance · Préparer votre futur exit.

## 4. Différenciation vs généralistes

| Critère | Généralistes | HME |
|---|---|---|
| Positionnement | Tous secteurs | Santé, bien-être & beauté |
| Chaîne logistique | Standardisée & mutualisée | Home Made® sur mesure |
| Prix | « Vous financez les autres » | « Le juste prix » |
| Équipes | Mutualisées | Cellules dédiées |
| Erreurs | Standard marché | Jusqu'à 3× moins |
| Engagement | Contrats longs et rigides | **Sans engagement** |
| Relation | Un numéro parmi d'autres | Partenaire long terme, interlocuteur sur WhatsApp |

**Objection prix/qualité traitée en FAQ :** « Nous ne sommes pas moins chers parce que nous faisons moins bien. Nous sommes plus performants parce que nous faisons moins de choses, mais beaucoup mieux. »

## 5. Preuves

- **3 000 000+ colis** expédiés.
- **Cas client détaillé (Léna, fondatrice — ex-client d'un « leader du marché ») :**
  - Coût moyen/commande : 6,70 € → **5,69 €** (−15 %)
  - Erreurs transport : 3 % → **1,34 %**
  - Erreurs préparation : 0,5 % → **0,12 %**
  - Tickets SAV logistique divisés par 3
  - **+200 000 €/an** d'économies ; test de 90 jours en double logistique puis bascule à 100 %, sans temps d'arrêt
- **Logos / verbatims :** Florna (200 k€ économisés), Reborn21 (−24 % transport), Antheos (−28 %), Essenciel, K&S Parfum, L'Atelier Bambou, Le Temple des Oracles, Angels Universe.
- **Infrastructure :** 3 entrepôts en France, température maîtrisée, WMS propriétaire, portail client temps réel, capacité de pic à 20 000 commandes/jour, expédition J0.
- **Équipe incarnée :** Aurélien Pruvost (vision & développement), Audrey Pannequin (opérations), Laura Mansouri (relation partenaires), Quentin Boisseau (excellence opérationnelle).

## 6. Levée des freins au changement

- **Sans engagement** contractuel.
- **Migration industrialisée :** audit → cartographie des flux → paramétrage → transfert de stock → contrôles → validation → mise en production.
- **Onboarding en 6 étapes** (diagnostic, architecture, connexion technique, validation, réception stock, go live) « pratiquement transparent » pour le client.
- **Option double logistique** pendant une période test (cf. cas Léna).

## 7. Tunnel d'acquisition

Offre d'entrée unique et répétée sur toute la page : **diagnostic / calcul d'économies gratuit** (« En 2 minutes · Sans engagement · Résultat immédiat »).

```
Landing (index.html)
  ├─ Simulateur : volume de commandes (curseur 500 → 40 000+) + email/téléphone
  │     → estimation immédiate d'économies annuelles (fourchette)
  │     → tag SIO « HME - LEAD SITE WEB 1/2 » + webhook Make (relance email à +5 min)
  │
  ├─ Popup exit-intent (après 50 % de scroll / sortie souris)
  │     → tag SIO « HME - LEAD EXIT INTENT » + notification Web3Forms + CRM interne
  │
  ▼
Diagnostic étape 2 (diagnostic.html) — qualification
  Marque, contact, prestataire actuel, type de produits, contraintes (fragile, liquide,
  DLUO, batteries), nb SKU, articles/commande, zones & modes de livraison,
  défi principal, CA annuel, délai de changement
  → tag SIO « HME - LEAD SITE WEB 2/2 » + enrichissement CRM interne (hme-crm)
  ▼
Merci (merci.html) — gestion des attentes
  Analyse sous 2 h → estimation + grille tarifaire + plan d'action sous 24 h
  → appel de qualification de 30 min (optionnel) ; bouton « Parler à un expert »
```

**Logique :** micro-engagement à faible friction (un curseur + un email) → chiffre personnalisé qui crée l'envie → formulaire de qualification détaillé → prise en main humaine sous 24 h. Les champs CA, volume et délai permettent de scorer les leads selon l'ICP.

**Canal secondaire :** programme partenaires (`partenaires.html`) — transporteurs, éditeurs OMS/WMS, agences e-commerce, investisseurs/holdings, marques (co-branding, recommandation mutuelle), traité sous 48 h. Les holdings et agences sont des apporteurs potentiels de portefeuilles de marques.

## 8. Ton & leviers de persuasion

- **Exclusivité / rareté :** « Réservé aux marques françaises 1–25 M€ », section « Êtes-vous fait pour HME ? » avec critères d'exclusion.
- **Reframing financier :** parler EBITDA, marges et exit plutôt que coût par colis.
- **Ennemi commun :** le généraliste qui fait payer la complexité des autres.
- **Preuve sociale chiffrée** et cas avant/après.
- **Réduction du risque :** sans engagement, test en double logistique, onboarding piloté.
- **Proximité :** fondateurs ex-e-commerçants, interlocuteur dédié sur WhatsApp, téléphone direct en footer.

## 9. Points d'attention relevés sur le site

Incohérences à corriger pour la crédibilité commerciale :

- **Heure limite d'expédition J0 :** « avant 13h » (section features) vs « avant 11h » (footer).
- **Email de contact :** `contact@hme-logistics.com` (index) vs `contact@hme-logistics.fr` (partenaires, merci), alors que le domaine de production est `homemade-elogistics.com`.
- **Copyright :** © 2026 sur l'index, © 2025 sur les autres pages.
- **Liens footer** (Blog, Levée de fonds, Carrières, Contact, Mentions légales, Politique de confidentialité, CGV) : liens vides (`#`), aucune page correspondante dans le dépôt — les pages légales sont obligatoires pour un site B2B.
