/* Landing pages Google Ads HME (variantes A et B)
   - Pastille adaptée à la campagne : ?a=complements|changer|couts|concurrents|cosmetique|sante
   - Paliers de volume + estimation en direct, puis email → /diagnostic.html
   - La variante (data-variant sur <body>) part dans la source du lead */
(function () {
  document.documentElement.classList.add('js-rv');
  var params = new URLSearchParams(location.search);
  var variant = document.body.getAttribute('data-variant') || 'A';
  var NB = ' ';

  /* Pastille « Réservé aux grands comptes · … » selon la campagne */
  var ANGLES = {
    complements: 'Marques de compléments alimentaires',
    changer: 'Vous envisagez de changer de logisticien',
    couts: 'Marques santé dont la logistique coûte trop cher',
    concurrents: 'Comparez avant de signer avec un généraliste',
    cosmetique: 'Marques de cosmétique & beauté',
    sante: 'Marques santé & bien-être'
  };
  var angle = params.get('a');
  var whoAngle = document.getElementById('whoAngle');
  if (whoAngle && angle && ANGLES[angle]) whoAngle.textContent = ANGLES[angle];

  /* Source du lead, transmise au diagnostic puis au CRM */
  var src = { angle: angle || '', utm_source: params.get('utm_source') || '', utm_campaign: params.get('utm_campaign') || '', utm_content: params.get('utm_content') || '', utm_term: params.get('utm_term') || '', gclid: params.get('gclid') || '', fbclid: params.get('fbclid') || '' };
  var isMeta = /^(meta|facebook|fb|instagram|ig)$/i.test(src.utm_source) || !!src.fbclid;
  var channel = isMeta ? 'Meta Ads' : 'Google Ads';
  var srcLabel = isMeta
    ? channel + ' LP ' + variant + (src.utm_campaign ? ' / ' + src.utm_campaign : '') + (src.utm_content ? ' / pub : ' + src.utm_content : (angle ? ' / ' + angle : ''))
    : channel + ' LP ' + variant + (src.utm_campaign ? ' / ' + src.utm_campaign : (angle ? ' / ' + angle : '')) + (src.utm_term ? ' / mot-clé : ' + src.utm_term : '');
  try { sessionStorage.setItem('hme_src', JSON.stringify(src)); } catch (e) {}
  if (window.gtag) {
    window.gtag('set', 'user_properties', { lp_variante: variant });
    window.gtag('event', 'lp_vue', { lp_variante: variant, lp_angle: angle || 'aucun' });
  }

  var nf = new Intl.NumberFormat('fr-FR');
  function range(v) { return { low: Math.round(v * 0.5 * 12 / 500) * 500, high: Math.round(v * 1.5 * 12 / 500) * 500 }; }
  function fmtRange(r) { return nf.format(r.low) + ' à ' + nf.format(r.high) + NB + '€'; }
  var LABELS = {
    250: 'Moins de 500', 1500: '500 à 2' + NB + '500', 3750: '2' + NB + '500 à 5' + NB + '000',
    7500: '5' + NB + '000 à 10' + NB + '000', 20000: '10' + NB + '000 à 30' + NB + '000', 35000: 'Plus de 30' + NB + '000'
  };

  /* Volume choisi, partagé entre tous les formulaires de la page */
  var currentVol = 7500;
  function renderAll() {
    document.querySelectorAll('[data-chips] .chip').forEach(function (c) {
      c.setAttribute('aria-pressed', String(parseInt(c.dataset.vol, 10) === currentVol));
    });
    document.querySelectorAll('[data-result]').forEach(function (box) {
      var amt = box.querySelector('[data-amt]');
      if (currentVol < 500) {
        box.classList.add('low');
        amt.textContent = 'En dessous de 500 commandes par mois, HME n’est probablement pas le bon partenaire : nous vous le dirons honnêtement.';
      } else {
        box.classList.remove('low');
        amt.textContent = fmtRange(range(currentVol));
      }
    });
  }
  document.querySelectorAll('[data-chips] .chip').forEach(function (c) {
    c.addEventListener('click', function () { currentVol = parseInt(c.dataset.vol, 10); renderAll(); });
  });
  renderAll();

  /* Envoi : étape 1 puis questionnaire */
  function post(body) {
    return fetch('/api/sio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).catch(function () { return {}; });
  }
  var sending = false;
  document.querySelectorAll('.lp-form').forEach(function (form) {
    var email = form.querySelector('input[type=email]');
    var err = form.querySelector('[data-err]');
    var btnText = form.querySelector('[data-btn]');
    var btn = form.querySelector('button[type=submit]');
    email.addEventListener('input', function () { email.classList.remove('err'); err.classList.remove('on'); });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (sending) return;
      var mail = email.value.trim();
      if (!mail || !email.validity.valid) { email.classList.add('err'); err.classList.add('on'); email.focus(); return; }
      sending = true;
      btn.disabled = true;
      btnText.textContent = 'Calcul en cours…';

      var v = currentVol, r = range(v);
      var orderLabel = LABELS[v] + ' commandes/mois';
      var lowVol = v < 500;
      try {
        sessionStorage.setItem('hme_diag_step1', JSON.stringify({ email: mail, orders: orderLabel, vol: v, savingsLow: lowVol ? 0 : r.low, savingsHigh: lowVol ? 0 : r.high, source: srcLabel }));
      } catch (e2) {}

      var estim = lowVol ? 'non estimé (moins de 500 commandes/mois)' : fmtRange(r) + ' / an';
      var note = 'Source : ' + srcLabel + '\nVolume : ' + orderLabel + '\nSurcoût estimé : ' + estim + (src.gclid ? '\ngclid : ' + src.gclid : '') + (src.fbclid ? '\nfbclid : ' + src.fbclid : '');
      var tasks = [
        post({ action: 'createContact', email: mail, phone: '' }).then(function (d) {
          if (d && d.id) { try { sessionStorage.setItem('hme_sio_id', d.id); } catch (e3) {} return post({ action: 'addTag', contactId: d.id, tag: 'HME - LEAD GOOGLE ADS 1/2' }); }
        }),
        post({ action: 'crmLead', email: mail, note: note }).then(function (d) { if (d && d.id) { try { sessionStorage.setItem('hme_crm_id', d.id); } catch (e4) {} } }),
        fetch('https://api.web3forms.com/submit', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: 'a35060be-ea69-45cd-a6c4-abd3e2517de3', subject: '🎯 Nouveau lead HME (' + channel + ' ' + variant + ') : ' + mail,
            from_name: 'HME Site Web', replyto: mail, to: 'aurelien+HME@famillia.fr',
            message: ['🎯 NOUVEAU LEAD HME : landing page ' + channel + ' ' + variant + ' (étape 1)', '', 'Email     : ' + mail, 'Volume    : ' + orderLabel, 'Surcoût   : ' + estim, 'Source    : ' + srcLabel].join('\n')
          })
        }).catch(function () {})
      ];
      if (window.hmeTrack) tasks.push(window.hmeTrack.lead(mail));
      await Promise.race([Promise.all(tasks), new Promise(function (res) { setTimeout(res, 4000); })]);
      window.location.href = '/diagnostic.html';
    });
  });

  /* Bloc « Cochez ce qui vous parle » (page A) */
  var msg = document.getElementById('mirrorMsg');
  var mirrorTracked = false;
  function mirrorUpdate() {
    if (!msg) return;
    var n = document.querySelectorAll('.mirror-item[aria-checked="true"]').length;
    if (n === 0) msg.textContent = 'Cochez au moins une phrase pour voir votre diagnostic.';
    else if (n <= 2) msg.innerHTML = '<span>' + n + ' sur 6.</span> Vous payez probablement plus que nécessaire. Vérifiez combien.';
    else if (n <= 4) msg.innerHTML = '<span>' + n + ' sur 6.</span> Vous financez la complexité des autres clients de votre logisticien.';
    else msg.innerHTML = '<span>' + n + ' sur 6.</span> Votre logistique vous coûte clairement de la marge. Chiffrons-la.';
    if (n > 0 && !mirrorTracked && window.gtag) { mirrorTracked = true; window.gtag('event', 'miroir_interaction'); }
  }
  document.querySelectorAll('.mirror-item').forEach(function (it) {
    function toggle() { it.setAttribute('aria-checked', it.getAttribute('aria-checked') === 'true' ? 'false' : 'true'); mirrorUpdate(); }
    it.addEventListener('click', toggle);
    it.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
  });

  /* Défilement vers le formulaire du haut */
  var heroEmail = document.querySelector('[data-form="hero"] input[type=email]');
  var target = document.getElementById('estimation');
  document.querySelectorAll('[data-scroll]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (heroEmail) setTimeout(function () { heroEmail.focus({ preventScroll: true }); }, 650);
    });
  });

  /* Apparitions au défilement et barre mobile */
  var sticky = document.getElementById('stickyCta');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('on'); io.unobserve(en.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
    if (sticky) {
      var visible = new Set();
      var stickyIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
        sticky.classList.toggle('show', visible.size === 0);
      });
      document.querySelectorAll('.quiz').forEach(function (q) { stickyIo.observe(q); });
    }
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('on'); });
  }

  document.querySelectorAll('[data-track="phone"]').forEach(function (a) {
    a.addEventListener('click', function () { if (window.gtag) window.gtag('event', 'clic_telephone', { lp_variante: variant }); });
  });
})();
