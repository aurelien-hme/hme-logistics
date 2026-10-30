/**
 * Script Google Ads (à exécuter UNE SEULE FOIS) — complète les 6 campagnes « HME | Search | … » :
 *   - accroches (callouts) et extrait structuré « Types »,
 *   - horaires de diffusion : lun→ven 7h-21h, sam 9h-18h, pas le dimanche.
 * Ne modifie ni les budgets ni les statuts : les campagnes restent en pause.
 * Les trois parties sont indépendantes ; le résultat (ou l'erreur exacte) est écrit
 * dans l'onglet « Journal scripts » de la feuille « HME - Google Ads - Suivi ».
 * Relancé, il ignore ce qui existe déjà.
 */
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1HlQCIhJORnPb6lmK9ijLeQG0A2J2DRviLP-NhErWuPs/edit';
const ACCROCHES = [
  'Sans engagement',
  "Jusqu'à 30 % d'économies",
  'Équipe dédiée',
  '3M+ colis expédiés',
  'Expert santé & beauté'
];
const EXTRAIT = {
  header: 'Types',
  values: ['Compléments alimentaires', 'Cosmétiques', 'Coffrets', 'Abonnements', 'Poudres & gélules']
};
const HORAIRES = [
  ['MONDAY', 7, 21], ['TUESDAY', 7, 21], ['WEDNESDAY', 7, 21], ['THURSDAY', 7, 21], ['FRIDAY', 7, 21],
  ['SATURDAY', 9, 18]
];
const FILTRE = "campaign.name LIKE 'HME | Search |%' AND campaign.status != 'REMOVED'";

const journal = [];
function note(partie, message) {
  journal.push([new Date(), AdsApp.getExecutionInfo().isPreview() ? 'Aperçu' : 'Exécution', partie, message]);
  Logger.log(partie + ' : ' + message);
}

function collect(query, fn) {
  const out = [];
  const rows = AdsApp.search(query);
  while (rows.hasNext()) out.push(fn(rows.next()));
  return out;
}

function apply(partie, ops) {
  if (!ops.length) { note(partie, 'déjà en place, rien à faire'); return; }
  const results = AdsApp.mutateAll(ops, { partialFailure: true });
  const errors = [];
  let ok = 0;
  results.forEach(r => { if (r.isSuccessful()) ok++; else errors.push(...r.getErrorMessages()); });
  note(partie, errors.length
    ? 'ÉCHEC partiel (' + ok + '/' + ops.length + ' OK) : ' + Array.from(new Set(errors)).join(' | ')
    : 'OK (' + ops.length + ' éléments)');
}

function run(partie, fn) {
  try { fn(); } catch (e) { note(partie, 'ERREUR : ' + (e && e.message ? e.message : e)); }
}

function main() {
  const cid = AdsApp.currentAccount().getCustomerId().replace(/-/g, '');
  let tmp = -1;
  const assetRn = () => 'customers/' + cid + '/assets/' + (tmp--);

  let campaigns = [];
  run('Campagnes', () => {
    campaigns = collect('SELECT campaign.resource_name FROM campaign WHERE ' + FILTRE,
      row => row.campaign.resourceName);
    note('Campagnes', campaigns.length + ' campagne(s) trouvée(s)');
  });

  if (campaigns.length) {
    const linked = (fieldType) => {
      const set = {};
      collect("SELECT campaign_asset.campaign FROM campaign_asset WHERE campaign_asset.field_type = '" +
        fieldType + "' AND campaign_asset.status != 'REMOVED' AND " + FILTRE,
        row => row.campaignAsset.campaign).forEach(c => { set[c] = true; });
      return campaigns.filter(c => !set[c]);
    };

    run('Accroches', () => {
      const need = linked('CALLOUT');
      const ops = [];
      if (need.length) ACCROCHES.forEach(text => {
        const rn = assetRn();
        ops.push({ assetOperation: { create: { resourceName: rn, calloutAsset: { calloutText: text } } } });
        need.forEach(c => ops.push({ campaignAssetOperation: { create: { campaign: c, asset: rn, fieldType: 'CALLOUT' } } }));
      });
      apply('Accroches', ops);
    });

    run('Extrait structuré', () => {
      const need = linked('STRUCTURED_SNIPPET');
      const ops = [];
      if (need.length) {
        const rn = assetRn();
        ops.push({ assetOperation: { create: { resourceName: rn, structuredSnippetAsset: EXTRAIT } } });
        need.forEach(c => ops.push({ campaignAssetOperation: { create: { campaign: c, asset: rn, fieldType: 'STRUCTURED_SNIPPET' } } }));
      }
      apply('Extrait structuré', ops);
    });

    run('Horaires', () => {
      const has = {};
      collect("SELECT campaign_criterion.campaign FROM campaign_criterion WHERE campaign_criterion.type = 'AD_SCHEDULE' AND " + FILTRE,
        row => row.campaignCriterion.campaign).forEach(c => { has[c] = true; });
      const ops = [];
      campaigns.filter(c => !has[c]).forEach(c => HORAIRES.forEach(([day, start, end]) =>
        ops.push({ campaignCriterionOperation: { create: { campaign: c,
          adSchedule: { dayOfWeek: day, startHour: start, startMinute: 'ZERO', endHour: end, endMinute: 'ZERO' } } } })));
      apply('Horaires', ops);
    });
  }

  try {
    const ss = SpreadsheetApp.openByUrl(SHEET_URL);
    const sheet = ss.getSheetByName('Journal scripts') || ss.insertSheet('Journal scripts');
    if (!sheet.getLastRow()) sheet.appendRow(['Date', 'Mode', 'Partie', 'Résultat']);
    journal.forEach(r => sheet.appendRow(r));
  } catch (e) {
    Logger.log('Journal non écrit dans la feuille : ' + e.message);
  }
}
