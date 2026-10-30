/**
 * Script Google Ads — export quotidien vers Google Sheets pour le suivi par Claude.
 *
 * Installation : Google Ads → Outils → Actions groupées → Scripts → « + »
 * 1. Coller ce script, SHEET_URL pointe déjà vers « HME - Google Ads - Suivi »
 * 2. Autoriser, cliquer « Aperçu » pour tester, puis « Exécuter »
 * 3. Fréquence : tous les jours, 6h
 *
 * Lecture seule : ce script ne modifie aucune campagne.
 */
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1HlQCIhJORnPb6lmK9ijLeQG0A2J2DRviLP-NhErWuPs/edit';
const PERIODE = 'LAST_30_DAYS';

const ONGLETS = {
  'Campagnes': `
    SELECT segments.date, campaign.name, campaign.status,
           metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc,
           metrics.cost_micros, metrics.conversions, metrics.cost_per_conversion,
           metrics.search_impression_share
    FROM campaign
    WHERE segments.date DURING ${PERIODE}
    ORDER BY segments.date DESC`,
  'Mots-clés': `
    SELECT campaign.name, ad_group.name, ad_group_criterion.keyword.text,
           ad_group_criterion.keyword.match_type, ad_group_criterion.status,
           ad_group_criterion.quality_info.quality_score,
           metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc,
           metrics.cost_micros, metrics.conversions
    FROM keyword_view
    WHERE segments.date DURING ${PERIODE}
    ORDER BY metrics.cost_micros DESC`,
  'Termes de recherche': `
    SELECT campaign.name, ad_group.name, search_term_view.search_term,
           search_term_view.status, metrics.impressions, metrics.clicks,
           metrics.cost_micros, metrics.conversions
    FROM search_term_view
    WHERE segments.date DURING ${PERIODE}
    ORDER BY metrics.impressions DESC`,
  'Annonces': `
    SELECT campaign.name, ad_group.name, ad_group_ad.ad.id,
           ad_group_ad.status, ad_group_ad.policy_summary.approval_status,
           metrics.impressions, metrics.clicks, metrics.ctr, metrics.conversions
    FROM ad_group_ad
    WHERE segments.date DURING ${PERIODE}`,
  'Jours et heures': `
    SELECT segments.day_of_week, segments.hour,
           metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
    FROM campaign
    WHERE segments.date DURING ${PERIODE}`,
};

function main() {
  const ss = SpreadsheetApp.openByUrl(SHEET_URL);
  Object.keys(ONGLETS).forEach(nom => {
    const sheet = ss.getSheetByName(nom) || ss.insertSheet(nom);
    sheet.clearContents();
    AdsApp.report(ONGLETS[nom]).exportToSheet(sheet);
  });

  const info = ss.getSheetByName('Infos') || ss.insertSheet('Infos');
  info.clearContents();
  info.appendRow(['Dernière mise à jour', new Date()]);
  info.appendRow(['Compte', AdsApp.currentAccount().getCustomerId()]);
  info.appendRow(['Période', PERIODE]);
  info.appendRow(['Note', 'cost_micros / 1 000 000 = coût en €']);
}
