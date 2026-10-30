/**
 * Script Google Ads (à exécuter UNE FOIS, après la mise en ligne de lp.html) :
 * fait pointer toutes les annonces des campagnes « HME | Search | … » vers la landing page.
 * 1. « Aperçu » pour vérifier dans les journaux, 2. « Exécuter ».
 */
const LANDING = 'https://www.homemade-elogistics.com/lp.html';

function main() {
  const rows = AdsApp.search(
    "SELECT ad_group_ad.ad.resource_name, ad_group_ad.ad.final_urls, campaign.name " +
    "FROM ad_group_ad WHERE campaign.name LIKE 'HME | Search |%' AND ad_group_ad.status != 'REMOVED'"
  );
  const ops = [];
  while (rows.hasNext()) {
    const row = rows.next();
    const ad = row.adGroupAd.ad;
    if ((ad.finalUrls || [])[0] === LANDING) continue;
    ops.push({ adOperation: { update: { resourceName: ad.resourceName, finalUrls: [LANDING] }, updateMask: 'final_urls' } });
  }
  if (!ops.length) { Logger.log('Toutes les annonces pointent déjà vers ' + LANDING); return; }

  const errors = [];
  AdsApp.mutateAll(ops).forEach(r => { if (!r.isSuccessful()) errors.push(...r.getErrorMessages()); });
  Logger.log(errors.length
    ? 'ÉCHEC :\n' + Array.from(new Set(errors)).join('\n')
    : 'OK : ' + ops.length + ' annonces redirigées vers ' + LANDING);
}
