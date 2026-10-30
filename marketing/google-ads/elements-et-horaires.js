/**
 * Script Google Ads (à exécuter UNE SEULE FOIS) — complète les 6 campagnes « HME | Search | … » :
 *   - accroches (callouts) et extrait structuré « Types »,
 *   - horaires de diffusion : lun→ven 7h-21h, sam 9h-18h, pas le dimanche.
 * Ne modifie ni les budgets ni les statuts : les campagnes restent en pause.
 * 1. « Aperçu » pour vérifier les journaux, 2. « Exécuter ».
 * Relancé par erreur, il ignore ce qui existe déjà.
 */
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

function main() {
  const cid = AdsApp.currentAccount().getCustomerId().replace(/-/g, '');

  const campaigns = [];
  const rows = AdsApp.search(
    "SELECT campaign.resource_name, campaign.name FROM campaign " +
    "WHERE campaign.name LIKE 'HME | Search |%' AND campaign.status != 'REMOVED'"
  );
  while (rows.hasNext()) {
    const c = rows.next().campaign;
    campaigns.push({ rn: c.resourceName, name: c.name });
  }
  if (!campaigns.length) { Logger.log('Aucune campagne « HME | Search | … » trouvée.'); return; }

  // Ce qui existe déjà, pour ne rien créer en double
  const hasSchedule = {};
  const sched = AdsApp.search(
    "SELECT campaign_criterion.campaign FROM campaign_criterion " +
    "WHERE campaign_criterion.type = 'AD_SCHEDULE' AND campaign.name LIKE 'HME | Search |%'"
  );
  while (sched.hasNext()) hasSchedule[sched.next().campaignCriterion.campaign] = true;

  const hasAsset = {};
  const linked = AdsApp.search(
    "SELECT campaign_asset.campaign, campaign_asset.field_type FROM campaign_asset " +
    "WHERE campaign_asset.field_type IN ('CALLOUT', 'STRUCTURED_SNIPPET') " +
    "AND campaign_asset.status != 'REMOVED' AND campaign.name LIKE 'HME | Search |%'"
  );
  while (linked.hasNext()) {
    const ca = linked.next().campaignAsset;
    hasAsset[ca.campaign + '|' + ca.fieldType] = true;
  }

  const ops = [];
  let tmp = -1;
  const assetRn = () => 'customers/' + cid + '/assets/' + (tmp--);

  const needCallouts = campaigns.filter(c => !hasAsset[c.rn + '|CALLOUT']);
  const needSnippet = campaigns.filter(c => !hasAsset[c.rn + '|STRUCTURED_SNIPPET']);

  if (needCallouts.length) {
    ACCROCHES.forEach(text => {
      const rn = assetRn();
      ops.push({ assetOperation: { create: { resourceName: rn, calloutAsset: { calloutText: text } } } });
      needCallouts.forEach(c => ops.push({ campaignAssetOperation: { create: {
        campaign: c.rn, asset: rn, fieldType: 'CALLOUT' } } }));
    });
  }
  if (needSnippet.length) {
    const rn = assetRn();
    ops.push({ assetOperation: { create: { resourceName: rn, structuredSnippetAsset: EXTRAIT } } });
    needSnippet.forEach(c => ops.push({ campaignAssetOperation: { create: {
      campaign: c.rn, asset: rn, fieldType: 'STRUCTURED_SNIPPET' } } }));
  }
  campaigns.filter(c => !hasSchedule[c.rn]).forEach(c => {
    HORAIRES.forEach(([day, start, end]) => ops.push({ campaignCriterionOperation: { create: {
      campaign: c.rn,
      adSchedule: { dayOfWeek: day, startHour: start, startMinute: 'ZERO', endHour: end, endMinute: 'ZERO' }
    } } }));
  });

  if (!ops.length) { Logger.log('Rien à faire : accroches, extrait et horaires déjà en place.'); return; }

  const errors = [];
  AdsApp.mutateAll(ops, { partialFailure: false })
    .forEach(r => { if (!r.isSuccessful()) errors.push(...r.getErrorMessages()); });
  if (errors.length) {
    Logger.log('ÉCHEC :\n' + Array.from(new Set(errors)).join('\n'));
  } else {
    Logger.log('OK : ' + needCallouts.length + ' campagnes avec accroches, ' +
      needSnippet.length + ' avec extrait structuré, ' +
      campaigns.filter(c => !hasSchedule[c.rn]).length + ' avec horaires (' + ops.length + ' éléments).');
  }
}
