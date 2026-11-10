/* ── HME : balise Google (Ads + Analytics) avec mode consentement v2 ──
   Rien n'est déposé tant que le visiteur n'a pas accepté.
   Conversions Google Ads :
   - hmeTrack.lead(email)          → « Lead » (étape 1 du formulaire, popup de sortie)
   - hmeTrack.leadQualified(email) → « Lead qualifié » (diagnostic complet)
*/
(function () {
  var ADS_ID = 'AW-18543734285';
  var GA4_ID = 'G-HR9MP6ENEP';
  var LABEL_LEAD = 'iidtCIzR5K4dEI3cq4pF';
  var LABEL_LEAD_QUALIFIED = 'wEtuCInR5K4dEI3cq4pF';
  var STORAGE_KEY = 'hme_consent';
  // Pixel Meta (jeu de données HME). Vide = Meta désactivé, rien n'est chargé.
  var META_PIXEL_ID = '2249712999295612';

  // ── Meta : file d'attente fbq, rien n'est envoyé avant le consentement ──
  if (META_PIXEL_ID) {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('consent', 'revoke');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
  function metaEvent(name, params) {
    if (!META_PIXEL_ID || !window.fbq) return;
    var id = name + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    window.fbq('track', name, params || {}, { eventID: id });
    return id;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved === 'granted') applyConsent('granted');

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ADS_ID;
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', ADS_ID);
  gtag('config', GA4_ID);

  function applyConsent(value) {
    if (META_PIXEL_ID && window.fbq) window.fbq('consent', value === 'granted' ? 'grant' : 'revoke');
    gtag('consent', 'update', {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value
    });
  }

  function saveConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    applyConsent(value);
  }

  // Envoie une conversion et attend sa confirmation (1,5 s max) avant une redirection
  function sendConversion(label, email) {
    return new Promise(function (resolve) {
      var done = false;
      function finish() { if (!done) { done = true; resolve(); } }
      if (email) gtag('set', 'user_data', { email: String(email).trim().toLowerCase() });
      gtag('event', 'conversion', {
        send_to: ADS_ID + '/' + label,
        value: 1.0,
        currency: 'EUR',
        event_callback: finish
      });
      setTimeout(finish, 1500);
    });
  }

  window.hmeTrack = {
    lead: function (email) { metaEvent('Lead'); return sendConversion(LABEL_LEAD, email); },
    leadQualified: function (email) { metaEvent('CompleteRegistration', { content_name: 'diagnostic', status: 'qualifie' }); return sendConversion(LABEL_LEAD_QUALIFIED, email); },
    schedule: function () { metaEvent('Schedule'); },
    openConsent: function () { showBanner(true); }
  };

  // ── Bandeau cookies ──
  function showBanner(force) {
    if (!force && saved) return;
    if (document.getElementById('hme-consent')) return;

    var css = document.createElement('style');
    css.textContent =
      '#hme-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:560px;margin:0 auto;' +
      'background:#0D1A2D;color:#F8F8F6;border:1px solid rgba(216,154,43,0.25);border-radius:12px;' +
      'box-shadow:0 4px 24px rgba(0,0,0,0.4);padding:18px 20px;font:14px/1.5 Inter,system-ui,sans-serif}' +
      '#hme-consent p{margin:0 0 14px}' +
      '#hme-consent .hc-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}' +
      '#hme-consent button{cursor:pointer;border-radius:8px;padding:9px 18px;font:600 14px Inter,system-ui,sans-serif}' +
      '#hme-consent .hc-refuse{background:transparent;color:#F8F8F6;border:1px solid rgba(248,248,246,0.25)}' +
      '#hme-consent .hc-accept{background:#D89A2B;color:#08111F;border:1px solid #D89A2B}' +
      '#hme-consent button:focus-visible{outline:2px solid #E8B84B;outline-offset:2px}';
    document.head.appendChild(css);

    var box = document.createElement('div');
    box.id = 'hme-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Préférences cookies');
    box.innerHTML =
      '<p>Nous utilisons des cookies de mesure d’audience et publicitaires (Google' + (META_PIXEL_ID ? ' et Meta' : '') + ') pour savoir quelles annonces vous ont amené ici. Vous pouvez les refuser, le site fonctionne de la même façon.</p>' +
      '<div class="hc-actions">' +
      '<button type="button" class="hc-refuse">Refuser</button>' +
      '<button type="button" class="hc-accept">Accepter</button>' +
      '</div>';
    document.body.appendChild(box);

    function close(value) {
      saved = value;
      saveConsent(value);
      box.remove();
    }
    box.querySelector('.hc-accept').addEventListener('click', function () { close('granted'); });
    box.querySelector('.hc-refuse').addEventListener('click', function () { close('denied'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { showBanner(false); });
  } else {
    showBanner(false);
  }
})();
