/**
 * Script Google Ads (à exécuter UNE SEULE FOIS) — crée les campagnes Search HME EN PAUSE.
 * 1. Cliquer « Aperçu » : simulation, rien n'est créé ; vérifier les journaux.
 * 2. Si aucune erreur : « Exécuter ». Les campagnes déjà présentes (même nom) sont ignorées.
 * Aucune campagne n'est activée : c'est vous qui les activerez.
 */
const URL = "https://www.homemade-elogistics.com/";
const SUFFIX = "utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}";
const DESCRIPTIONS = [
  "Logisticien 100% spécialisé santé, bien-être & beauté. Jusqu'à 30% d'économies.",
  "Calculez en 2 min combien votre logisticien généraliste vous surfacture. Sans engagement.",
  "3M+ colis expédiés, 3x moins de tickets SAV, équipes dédiées. Marques de 1 à 25 M€ de CA.",
  "Analyse offerte de vos coûts logistiques. Bascule sans arrêt d'activité. Sans engagement."
];
const NEGATIFS = ["emploi", "recrutement", "offre d'emploi", "job", "stage", "alternance", "salaire", "cariste", "préparateur de commandes", "manutentionnaire", "intérim", "formation", "cours", "bts", "master", "école", "définition", "c'est quoi", "pdf", "mémoire", "gratuit", "suivi colis", "suivre colis", "déménagement", "particulier", "amazon fba", "wikipedia", "dropshipping", "fournisseur", "grossiste", "marque blanche", "fabricant", "acheter"];
const CAMPAGNES = [
  {
    "name": "HME | Search | Compléments alimentaires",
    "budget": 30,
    "path": [
      "logistique",
      "complements"
    ],
    "headlines": [
      "Logistique Compléments Alim.",
      "Logisticien Compléments",
      "Spécialiste Nutraceutique",
      "Jusqu'à -30% Sur Vos Coûts",
      "Calculez Vos Économies",
      "Gélules, Poudres, Piluliers",
      "100% Santé & Bien-être",
      "3x Moins de Tickets SAV",
      "Sans Engagement",
      "Analyse Logistique Offerte",
      "HME Logistics",
      "Marques de 1 à 25 M€ de CA",
      "Équipe Dédiée à Votre Marque",
      "3M+ Colis Expédiés",
      "Quittez le Généraliste"
    ],
    "adgroups": [
      {
        "name": "Logistique compléments alimentaires",
        "cpc": 2.5,
        "keywords": [
          [
            "logistique compléments alimentaires",
            "PHRASE"
          ],
          [
            "logistique compléments alimentaires",
            "EXACT"
          ],
          [
            "logisticien compléments alimentaires",
            "PHRASE"
          ],
          [
            "logisticien compléments alimentaires",
            "EXACT"
          ],
          [
            "entrepôt compléments alimentaires",
            "PHRASE"
          ],
          [
            "entrepôt compléments alimentaires",
            "EXACT"
          ],
          [
            "stockage compléments alimentaires",
            "PHRASE"
          ],
          [
            "stockage compléments alimentaires",
            "EXACT"
          ],
          [
            "préparation de commandes compléments alimentaires",
            "PHRASE"
          ],
          [
            "préparation de commandes compléments alimentaires",
            "EXACT"
          ],
          [
            "expédition compléments alimentaires",
            "PHRASE"
          ],
          [
            "expédition compléments alimentaires",
            "EXACT"
          ],
          [
            "logistique nutraceutique",
            "PHRASE"
          ],
          [
            "logistique nutraceutique",
            "EXACT"
          ],
          [
            "logistique nutrition sportive",
            "PHRASE"
          ],
          [
            "logistique nutrition sportive",
            "EXACT"
          ]
        ]
      },
      {
        "name": "Prestataire / externalisation compléments",
        "cpc": 2.5,
        "keywords": [
          [
            "prestataire logistique compléments alimentaires",
            "PHRASE"
          ],
          [
            "prestataire logistique compléments alimentaires",
            "EXACT"
          ],
          [
            "externaliser logistique compléments alimentaires",
            "PHRASE"
          ],
          [
            "externaliser logistique compléments alimentaires",
            "EXACT"
          ],
          [
            "e-logistique compléments alimentaires",
            "PHRASE"
          ],
          [
            "e-logistique compléments alimentaires",
            "EXACT"
          ],
          [
            "fulfillment compléments alimentaires",
            "PHRASE"
          ],
          [
            "fulfillment compléments alimentaires",
            "EXACT"
          ],
          [
            "logisticien e-commerce compléments alimentaires",
            "PHRASE"
          ],
          [
            "logisticien e-commerce compléments alimentaires",
            "EXACT"
          ]
        ]
      }
    ]
  },
  {
    "name": "HME | Search | Cosmétique & Beauté",
    "budget": 30,
    "path": [
      "logistique",
      "cosmetique"
    ],
    "headlines": [
      "Logistique Cosmétique",
      "Logisticien Cosmétique",
      "Logistique Produits de Beauté",
      "Spécialiste Beauté & Bien-être",
      "Jusqu'à -30% Sur Vos Coûts",
      "Calculez Vos Économies",
      "Flacons, Sérums, Coffrets",
      "3x Moins de Tickets SAV",
      "Sans Engagement",
      "Analyse Logistique Offerte",
      "HME Logistics",
      "Marques de 1 à 25 M€ de CA",
      "Équipe Dédiée à Votre Marque",
      "Expérience Unboxing Premium",
      "Quittez le Généraliste"
    ],
    "adgroups": [
      {
        "name": "Logistique cosmétique",
        "cpc": 2.5,
        "keywords": [
          [
            "logistique cosmétique",
            "PHRASE"
          ],
          [
            "logistique cosmétique",
            "EXACT"
          ],
          [
            "logisticien cosmétique",
            "PHRASE"
          ],
          [
            "logisticien cosmétique",
            "EXACT"
          ],
          [
            "entrepôt cosmétique",
            "PHRASE"
          ],
          [
            "entrepôt cosmétique",
            "EXACT"
          ],
          [
            "stockage cosmétique",
            "PHRASE"
          ],
          [
            "stockage cosmétique",
            "EXACT"
          ],
          [
            "logistique produits de beauté",
            "PHRASE"
          ],
          [
            "logistique produits de beauté",
            "EXACT"
          ],
          [
            "logisticien produits de beauté",
            "PHRASE"
          ],
          [
            "logisticien produits de beauté",
            "EXACT"
          ],
          [
            "préparation de commandes cosmétiques",
            "PHRASE"
          ],
          [
            "préparation de commandes cosmétiques",
            "EXACT"
          ],
          [
            "expédition cosmétiques",
            "PHRASE"
          ],
          [
            "expédition cosmétiques",
            "EXACT"
          ]
        ]
      },
      {
        "name": "E-commerce beauté / coffrets",
        "cpc": 2.5,
        "keywords": [
          [
            "logistique e-commerce cosmétique",
            "PHRASE"
          ],
          [
            "logistique e-commerce cosmétique",
            "EXACT"
          ],
          [
            "e-logistique beauté",
            "PHRASE"
          ],
          [
            "e-logistique beauté",
            "EXACT"
          ],
          [
            "prestataire logistique cosmétique",
            "PHRASE"
          ],
          [
            "prestataire logistique cosmétique",
            "EXACT"
          ],
          [
            "externaliser logistique cosmétique",
            "PHRASE"
          ],
          [
            "externaliser logistique cosmétique",
            "EXACT"
          ],
          [
            "fulfillment cosmétique",
            "PHRASE"
          ],
          [
            "fulfillment cosmétique",
            "EXACT"
          ],
          [
            "logistique coffrets beauté",
            "PHRASE"
          ],
          [
            "logistique coffrets beauté",
            "EXACT"
          ],
          [
            "logistique box beauté",
            "PHRASE"
          ],
          [
            "logistique box beauté",
            "EXACT"
          ]
        ]
      }
    ]
  },
  {
    "name": "HME | Search | E-commerce santé bien-être",
    "budget": 20,
    "path": [
      "logistique",
      "bien-etre"
    ],
    "headlines": [
      "Logistique Santé & Bien-être",
      "Logisticien E-commerce Expert",
      "Spécialiste Santé & Beauté",
      "Jusqu'à -30% Sur Vos Coûts",
      "Calculez Vos Économies",
      "Moins de 25 SKU ? Parfait.",
      "Pensé Pour l'Abonnement",
      "3x Moins de Tickets SAV",
      "Sans Engagement",
      "Analyse Logistique Offerte",
      "HME Logistics",
      "Marques de 1 à 25 M€ de CA",
      "Équipe Dédiée à Votre Marque",
      "3M+ Colis Expédiés",
      "Intégration Shopify"
    ],
    "adgroups": [
      {
        "name": "Santé / bien-être / parapharmacie",
        "cpc": 2.0,
        "keywords": [
          [
            "logistique bien-être",
            "PHRASE"
          ],
          [
            "logistique bien-être",
            "EXACT"
          ],
          [
            "logistique parapharmacie e-commerce",
            "PHRASE"
          ],
          [
            "logistique parapharmacie e-commerce",
            "EXACT"
          ],
          [
            "logisticien parapharmacie",
            "PHRASE"
          ],
          [
            "logisticien parapharmacie",
            "EXACT"
          ],
          [
            "logistique produits santé e-commerce",
            "PHRASE"
          ],
          [
            "logistique produits santé e-commerce",
            "EXACT"
          ],
          [
            "logistique produits naturels",
            "PHRASE"
          ],
          [
            "logistique produits naturels",
            "EXACT"
          ]
        ]
      },
      {
        "name": "Logisticien e-commerce (exact)",
        "cpc": 1.8,
        "keywords": [
          [
            "logisticien e-commerce",
            "EXACT"
          ],
          [
            "prestataire logistique e-commerce",
            "EXACT"
          ],
          [
            "externaliser logistique e-commerce",
            "EXACT"
          ],
          [
            "e-logisticien",
            "EXACT"
          ],
          [
            "logisticien shopify",
            "EXACT"
          ],
          [
            "logistique shopify",
            "EXACT"
          ],
          [
            "3pl france",
            "EXACT"
          ]
        ]
      },
      {
        "name": "Abonnements / box",
        "cpc": 2.0,
        "keywords": [
          [
            "logistique abonnement e-commerce",
            "PHRASE"
          ],
          [
            "logistique abonnement e-commerce",
            "EXACT"
          ],
          [
            "logistique box abonnement",
            "PHRASE"
          ],
          [
            "logistique box abonnement",
            "EXACT"
          ],
          [
            "logisticien box mensuelle",
            "PHRASE"
          ],
          [
            "logisticien box mensuelle",
            "EXACT"
          ]
        ]
      }
    ]
  },
  {
    "name": "HME | Search | Changer de logisticien",
    "budget": 15,
    "path": [
      "audit",
      "logistique"
    ],
    "headlines": [
      "Changer de Logisticien ?",
      "Votre Logisticien Vous Coûte",
      "Jusqu'à -30% Sur Vos Coûts",
      "Calculez Vos Économies",
      "Audit Logistique Offert",
      "Bascule Sans Arrêt d'Activité",
      "Test 90 Jours en Double Flux",
      "Spécialiste Santé & Beauté",
      "3x Moins de Tickets SAV",
      "Sans Engagement",
      "HME Logistics",
      "+200 000€/an Économisés",
      "Marques de 1 à 25 M€ de CA",
      "Équipe Dédiée sur WhatsApp",
      "Quittez le Généraliste"
    ],
    "adgroups": [
      {
        "name": "Changer de prestataire",
        "cpc": 2.0,
        "keywords": [
          [
            "changer de logisticien",
            "PHRASE"
          ],
          [
            "changer de logisticien",
            "EXACT"
          ],
          [
            "changer de prestataire logistique",
            "PHRASE"
          ],
          [
            "changer de prestataire logistique",
            "EXACT"
          ],
          [
            "trouver un logisticien e-commerce",
            "PHRASE"
          ],
          [
            "trouver un logisticien e-commerce",
            "EXACT"
          ],
          [
            "comparatif logisticien e-commerce",
            "PHRASE"
          ],
          [
            "comparatif logisticien e-commerce",
            "EXACT"
          ],
          [
            "meilleur logisticien e-commerce",
            "PHRASE"
          ],
          [
            "meilleur logisticien e-commerce",
            "EXACT"
          ]
        ]
      },
      {
        "name": "Coûts logistiques",
        "cpc": 1.8,
        "keywords": [
          [
            "réduire coûts logistiques e-commerce",
            "PHRASE"
          ],
          [
            "réduire coûts logistiques e-commerce",
            "EXACT"
          ],
          [
            "coût logistique e-commerce",
            "PHRASE"
          ],
          [
            "coût logistique e-commerce",
            "EXACT"
          ],
          [
            "tarif logisticien e-commerce",
            "PHRASE"
          ],
          [
            "tarif logisticien e-commerce",
            "EXACT"
          ],
          [
            "prix préparation de commande e-commerce",
            "PHRASE"
          ],
          [
            "prix préparation de commande e-commerce",
            "EXACT"
          ],
          [
            "audit logistique e-commerce",
            "PHRASE"
          ],
          [
            "audit logistique e-commerce",
            "EXACT"
          ]
        ]
      }
    ]
  },
  {
    "name": "HME | Search | Concurrents",
    "budget": 10,
    "path": [
      "alternative",
      "logisticien"
    ],
    "headlines": [
      "Alternative Spécialisée",
      "Logisticien Santé & Beauté",
      "Comparez Avant de Signer",
      "Jusqu'à -30% Sur Vos Coûts",
      "Calculez Vos Économies",
      "Pas un Généraliste",
      "Sans Engagement",
      "3x Moins de Tickets SAV",
      "HME Logistics",
      "Équipe Dédiée à Votre Marque",
      "Marques de 1 à 25 M€ de CA",
      "Analyse Logistique Offerte"
    ],
    "adgroups": [
      {
        "name": "Concurrents logistique e-commerce",
        "cpc": 1.5,
        "keywords": [
          [
            "bigblue logistique",
            "PHRASE"
          ],
          [
            "bigblue avis",
            "PHRASE"
          ],
          [
            "cubyn",
            "PHRASE"
          ],
          [
            "cubyn avis",
            "PHRASE"
          ],
          [
            "byrd logistique",
            "PHRASE"
          ],
          [
            "e-logik",
            "PHRASE"
          ]
        ]
      }
    ]
  },
  {
    "name": "HME | Search | Marque",
    "budget": 5,
    "path": [
      "hme",
      "logistics"
    ],
    "headlines": [
      "HME Logistics - Site Officiel",
      "Home Made E-Logistics",
      "Logisticien Santé & Beauté",
      "Calculez Vos Économies",
      "Jusqu'à -30% Sur Vos Coûts",
      "Sans Engagement",
      "Analyse Logistique Offerte",
      "3M+ Colis Expédiés"
    ],
    "adgroups": [
      {
        "name": "Marque HME",
        "cpc": 1.0,
        "keywords": [
          [
            "hme logistics",
            "PHRASE"
          ],
          [
            "hme logistics",
            "EXACT"
          ],
          [
            "homemade elogistics",
            "PHRASE"
          ],
          [
            "homemade elogistics",
            "EXACT"
          ],
          [
            "home made e-logistics",
            "PHRASE"
          ],
          [
            "home made e-logistics",
            "EXACT"
          ],
          [
            "hme logistique",
            "EXACT"
          ]
        ]
      }
    ]
  }
];

const FRANCE = 'geoTargetConstants/2250';
const FRANCAIS = 'languageConstants/1002';

function main() {
  const cid = AdsApp.currentAccount().getCustomerId().replace(/-/g, '');
  let tmp = -1;
  const nextId = () => tmp--;

  CAMPAGNES.forEach(c => {
    const exists = AdsApp.search(
      "SELECT campaign.id FROM campaign WHERE campaign.name = '" + c.name.replace(/'/g, "\\'") + "' AND campaign.status != 'REMOVED'"
    ).hasNext();
    if (exists) { Logger.log('Déjà présente, ignorée : ' + c.name); return; }

    const ops = [];
    const budget = 'customers/' + cid + '/campaignBudgets/' + nextId();
    const campaign = 'customers/' + cid + '/campaigns/' + nextId();

    ops.push({ campaignBudgetOperation: { create: {
      resourceName: budget, name: 'Budget - ' + c.name,
      amountMicros: c.budget * 1000000, deliveryMethod: 'STANDARD', explicitlyShared: false } } });

    ops.push({ campaignOperation: { create: {
      resourceName: campaign, name: c.name, status: 'PAUSED',
      advertisingChannelType: 'SEARCH',
      manualCpc: { enhancedCpcEnabled: false },
      campaignBudget: budget,
      networkSettings: { targetGoogleSearch: true, targetSearchNetwork: false,
                         targetContentNetwork: false, targetPartnerSearchNetwork: false },
      geoTargetTypeSetting: { positiveGeoTargetType: 'PRESENCE' },
      finalUrlSuffix: SUFFIX,
      containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING' } } });

    ops.push({ campaignCriterionOperation: { create: { campaign: campaign, location: { geoTargetConstant: FRANCE } } } });
    ops.push({ campaignCriterionOperation: { create: { campaign: campaign, language: { languageConstant: FRANCAIS } } } });
    NEGATIFS.forEach(n => ops.push({ campaignCriterionOperation: { create: {
      campaign: campaign, negative: true, keyword: { text: n, matchType: 'PHRASE' } } } }));

    c.adgroups.forEach(ag => {
      const adGroup = 'customers/' + cid + '/adGroups/' + nextId();
      ops.push({ adGroupOperation: { create: {
        resourceName: adGroup, campaign: campaign, name: ag.name, status: 'ENABLED',
        type: 'SEARCH_STANDARD', cpcBidMicros: Math.round(ag.cpc * 1000000) } } });
      ag.keywords.forEach(k => ops.push({ adGroupCriterionOperation: { create: {
        adGroup: adGroup, status: 'ENABLED', keyword: { text: k[0], matchType: k[1] } } } }));
      ops.push({ adGroupAdOperation: { create: {
        adGroup: adGroup, status: 'ENABLED',
        ad: { finalUrls: [URL], responsiveSearchAd: {
          headlines: c.headlines.map(t => ({ text: t })),
          descriptions: DESCRIPTIONS.map(t => ({ text: t })),
          path1: c.path[0], path2: c.path[1] } } } } });
    });

    const results = AdsApp.mutateAll(ops, { partialFailure: false });
    const errors = [];
    results.forEach(r => { if (!r.isSuccessful()) errors.push(...r.getErrorMessages()); });
    if (errors.length) {
      Logger.log('ÉCHEC ' + c.name + ' :\n' + Array.from(new Set(errors)).join('\n'));
    } else {
      Logger.log('OK (en pause) : ' + c.name + ' — ' + ops.length + ' éléments');
    }
  });
}
