/* Landing Google Ads : les textes s'adaptent à l'annonce cliquée (?a=…).
   Le questionnaire, le calcul, l'envoi du lead et le Calendly viennent de /challenge/challenge.js (même moteur que Meta).
   Deux familles d'intention :
   - « payer moins » (changer, couts, concurrents) : la personne a déjà un logisticien → on parle de surcoût ;
   - « trouver un logisticien » (complements, sante, cosmetique, marque) : elle cherche un prestataire → on parle de son tarif. */
(function () {
  var A = {
    complements: {
      badge: 'Logisticien spécialisé compléments alimentaires',
      h1: 'Le logisticien des marques de <em>compléments alimentaires.</em>',
      lead: '<strong>2 minutes, 6 questions.</strong> Découvrez combien votre logistique vous coûterait chez un spécialiste : gélules, poudres, flacons, lots et DDM suivis.',
      submit: 'Voir mon tarif estimé',
      rTitle: 'Chez un logisticien spécialisé comme HME, votre logistique vous coûterait environ',
      rSub: 'de moins par an qu’un logisticien généraliste',
      faq: 'Estimer mon tarif'
    },
    sante: {
      badge: 'Logisticien spécialisé santé et bien-être',
      h1: 'Le logisticien des marques <em>santé et bien-être.</em>',
      lead: '<strong>2 minutes, 6 questions.</strong> Découvrez combien votre logistique vous coûterait chez un spécialiste, avec des process pensés pour vos produits.',
      submit: 'Voir mon tarif estimé',
      rTitle: 'Chez un logisticien spécialisé comme HME, votre logistique vous coûterait environ',
      rSub: 'de moins par an qu’un logisticien généraliste',
      faq: 'Estimer mon tarif'
    },
    cosmetique: {
      badge: 'Logisticien spécialisé cosmétique et beauté',
      h1: 'Le logisticien des marques <em>cosmétique et beauté.</em>',
      lead: '<strong>2 minutes, 6 questions.</strong> Découvrez combien votre logistique vous coûterait chez un spécialiste : flacons, coffrets, déballage soigné.',
      submit: 'Voir mon tarif estimé',
      rTitle: 'Chez un logisticien spécialisé comme HME, votre logistique vous coûterait environ',
      rSub: 'de moins par an qu’un logisticien généraliste',
      faq: 'Estimer mon tarif'
    },
    changer: {
      badge: 'Vous envisagez de changer de logisticien',
      h1: 'Avant de changer de logisticien, <em>sachez ce que vous payez en trop.</em>',
      lead: '<strong>2 minutes, 6 questions.</strong> À la fin, vous savez combien votre logisticien actuel vous coûte en trop chaque année.',
      submit: 'Voir ce que je paie en trop',
      faq: 'Calculer ce que je paie en trop'
    },
    couts: {
      badge: 'Coût logistique e-commerce',
      h1: 'Votre coût logistique par commande <em>est-il trop élevé ?</em>',
      lead: '<strong>2 minutes, 6 questions.</strong> À la fin, vous savez combien vous payez en trop chaque année, et vous pouvez calculer votre vrai coût par commande.',
      submit: 'Voir ce que je paie en trop',
      faq: 'Calculer ce que je paie en trop'
    },
    concurrents: {
      badge: 'Vous comparez les logisticiens e-commerce',
      h1: 'Avant de signer avec un logisticien généraliste, <em>comparez.</em>',
      lead: '<strong>2 minutes, 6 questions.</strong> Voyez ce qu’un logisticien spécialisé changerait sur votre facture.',
      submit: 'Voir la différence sur ma facture',
      faq: 'Comparer sur ma facture'
    }
  };
  var DEFAULT = {
    badge: 'Logisticien des grands comptes e-commerce',
    h1: 'Votre logistique, <em>calculée sur votre modèle.</em>',
    lead: '<strong>2 minutes, 6 questions.</strong> Découvrez combien votre logistique vous coûterait chez HME.',
    submit: 'Voir mon tarif estimé',
    rTitle: 'Chez un logisticien spécialisé comme HME, votre logistique vous coûterait environ',
    rSub: 'de moins par an qu’un logisticien généraliste',
    faq: 'Estimer mon tarif'
  };
  var params = new URLSearchParams(location.search);
  var key = params.get('a') || '';
  var c = A[key] || DEFAULT;

  /* Campagne Concurrents : on parle prix, sans secteur (choix d'Aurélien, 17/11/2026).
     Texte générique, sans jamais nommer le concurrent recherché (choix d'Aurélien, 20/11/2026) :
     nommer un concurrent à côté de « 1 € de moins » en ferait une publicité comparative qu'on ne peut pas prouver. */
  var isRivalPage = key === 'concurrents';
  if (isRivalPage) {
    c = {
      badge: 'Vous comparez les logisticiens e-commerce',
      h1: 'Déjà chez un logisticien, ou vous en cherchez un ? <em>Et si vous payiez 1 € de moins par commande ?</em>',
      lead: '<strong>2 minutes, 6 questions.</strong> À la fin, vous savez combien vous économiseriez chaque année, et ce que vous payez peut-être en trop aujourd’hui.',
      submit: 'Calculer mon économie',
      rTitle: 'Avec 1 € de moins par commande, vous économiseriez environ',
      rSub: 'chaque année sur votre logistique',
      faq: 'Calculer mon économie'
    };
  }
  function set(id, v, html) { var el = document.getElementById(id); if (el && v) { if (html) el.innerHTML = v; else el.textContent = v; } }
  set('aBadge', c.badge);
  set('aH1', c.h1, true);
  set('aLead', c.lead, true);
  set('rTitle', c.rTitle);
  set('rSub', c.rSub);
  set('aFaq', c.faq);
  var b = document.getElementById('submitBtn');
  if (b && c.submit) b.innerHTML = c.submit + ' <span aria-hidden="true">→</span>';
  if (isRivalPage) {
    document.title = 'Calculez votre économie logistique | HME Logistics';
    var why1 = document.querySelector('.why .w .w-txt span:not(.w-n)');
    if (why1) why1.textContent = 'Un logisticien généraliste prépare de la mode, des meubles, de l’électronique. Votre tarif est calculé pour cette moyenne, pas pour votre modèle.';
    var foot = document.querySelector('footer .wrap > span');
    if (foot) foot.textContent = '© 2026 HME Logistics · Logisticien spécialisé';
  }
  var stepLabel = document.getElementById('stepLabel'), dur = document.getElementById('aDur');
  if (stepLabel && dur && window.MutationObserver) {
    var sync = function () { dur.hidden = !/^Question/.test(stepLabel.textContent); };
    new MutationObserver(sync).observe(stepLabel, { childList: true, characterData: true, subtree: true });
    sync();
  }
  document.body.setAttribute('data-angle', key || 'defaut');
  if (window.gtag) window.gtag('event', 'lp_vue', { lp_variante: 'challenge', lp_angle: key || 'aucun' });
})();
