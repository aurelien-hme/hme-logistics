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
