# Google Ads — HME Logistics

## 1. Créer le compte (à faire par vous, ~10 min)

1. Aller sur https://ads.google.com avec le compte Google de `contact@homemade-elogistics.com`.
2. Cliquer **« Passer en mode Expert »** (lien discret en bas de l'assistant) puis **« Créer un compte sans campagne »** : on évite ainsi qu'une campagne Performance Max soit créée et lancée automatiquement.
3. Pays France, fuseau Europe/Paris, devise EUR (la devise ne peut plus être modifiée ensuite).
4. Ajouter la facturation : les campagnes restent en pause tant que vous ne les activez pas.
5. Dans **Paramètres du compte**, activer **le marquage automatique** (gclid).

## 2. Importer les campagnes en brouillon (en pause)

Fichier : `hme-campagnes-google-ads-editor.csv` (6 campagnes, 11 groupes d'annonces, 112 mots-clés, annonces responsives).

1. Installer **Google Ads Editor** (gratuit) et se connecter au compte.
2. **Compte → Importer → À partir d'un fichier** → choisir le CSV.
3. Vérifier l'aperçu, puis **« Conserver »**. Ne pas cliquer sur **« Publier »** tant que les contrôles ci-dessous ne sont pas faits.
4. Contrôler dans chaque campagne : réseau **Recherche uniquement** (décocher Partenaires de recherche et Display), zone **France** (option « Présence »), langue **Français**.
5. Publier : toutes les campagnes arrivent avec le statut **Mise en veille**.

| Campagne | Budget/jour | Intention |
|---|---|---|
| Compléments alimentaires | 30 € | logisticien / entrepôt compléments |
| Cosmétique & Beauté | 30 € | logisticien cosmétique / coffrets |
| E-commerce santé bien-être | 20 € | parapharmacie, abonnements, Shopify (exact) |
| Changer de logisticien | 15 € | changement de prestataire, coûts |
| Concurrents | 10 € | Bigblue, Cubyn, Byrd, e-Logik (pas de marque concurrente dans les annonces) |
| Marque | 5 € | protection de la marque HME |

≈ 110 €/jour, soit environ 3 300 €/mois si tout est activé. Pour démarrer, nous recommandons d'activer seulement **Compléments, Cosmétique et Marque** (environ 2 000 €/mois).

Enchères : CPC manuel au lancement, avec un CPC max de 1,50 € à 2,50 €. Après environ 30 conversions, passer en **Maximiser les conversions** (avec un CPA cible). Mots-clés négatifs déjà inclus : emploi, formation, suivi colis, fabricant, marque blanche, etc.

## 3. Suivi des conversions (à faire après la création du compte)

Le site enregistre déjà la source Google Ads de chaque lead (gclid et UTM dans `script.js`, objet `HME_ATTR`) :
- le tag Systeme.io **`HME - SOURCE GOOGLE ADS`** est ajouté en plus du tag du formulaire ;
- la note du lead dans hme-crm contient la campagne, le mot-clé et le gclid.

Il reste à envoyer à Claude l'ID de conversion `AW-XXXXXXXXX` pour installer la balise Google sur le site, avec deux conversions :
- **Lead étape 1** (email saisi, calculette ou formulaire), en conversion secondaire ;
- **Diagnostic complet** (`diagnostic.html` envoyé), en conversion principale.

Ensuite, importer chaque semaine depuis hme-crm (via le gclid) les conversions hors ligne « RDV qualifié » et « Client signé ». Google optimisera alors les enchères sur les vrais clients plutôt que sur des emails.

## 4. Landing page de qualification (`/lp.html`)

Page dédiée aux visiteurs Google Ads : `lp.html`, `lp.css` et `lp.js` à la racine du site.

- **Formulaire en 3 étapes** : produits / CA / commandes, puis logistique actuelle / délai, puis contact.
- **Score du lead** (`scoreLead` dans `lp.js`) :
  - **FROID** : CA < 1 M€, ou produits « Autre », ou activité pas encore lancée ;
  - **CHAUD** : changement souhaité dès que possible ou sous 3 mois ;
  - **TIÈDE** : tous les autres cas.
- **Envoi du lead** :
  - Systeme.io, avec les tags `HME - LEAD GOOGLE ADS` (ou `HME - LEAD LANDING PAGE`) et `HME - LEAD CHAUD/TIEDE/FROID` ;
  - hme-crm, via `/api/sio` → `crmLead`, avec une note complète : réponses, score, campagne, mot-clé et gclid ;
  - un email de notification, dont l'objet commence par « 🔥 LEAD CHAUD » pour les leads chauds.
- **À configurer dans `LP_CONFIG`** (en haut de `lp.js`) :
  - `adsId` et les deux libellés de conversion. Tant qu'ils sont vides, la balise Google ne se charge pas ;
  - `bookingUrl` : lien de prise de rendez-vous proposé aux leads chauds. Vide, le bouton reste masqué.
- **Après la mise en production**, exécuter une fois le script `annonces-vers-landing.js` dans Google Ads : il fait pointer les 11 annonces vers `/lp.html`.

## État au 30/10/2026

- Compte 467-302-3390, rattaché au MCC 961-008-2188.
- 6 campagnes créées **en veille** par `creer-campagnes.js`.
- Script `Export suivi Claude` : alimente chaque jour la feuille « HME - Google Ads - Suivi ».
- Script `Éléments et horaires HME` exécuté le 30/10/2026 :
  - 5 accroches et l'extrait structuré « Types » ajoutés aux 6 campagnes ;
  - horaires de diffusion : lun→ven 7h-21h, sam 9h-18h, rien le dimanche ;
  - le résultat est consigné dans l'onglet « Journal scripts » de la feuille de suivi.
- Conversions : « Lead qualifié » (principale, `AW-18543734285/wEtuCInR5K4dEI3cq4pF`) et « Lead » (secondaire, `AW-18543734285/iidtCIzR5K4dEI3cq4pF`).
- Taggage automatique activé ; recommandations appliquées automatiquement désactivées.
