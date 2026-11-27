/* Landing /estimation/ : variante B du test A/B.
   Un curseur (commandes par mois) + un email → « Recevoir la grille tarifaire ».
   La variante est choisie dans <head> (attribut data-variant sur <html>, ?v=a ou ?v=b pour forcer).
   Le lead part aux mêmes endroits que la variante A : Systeme.io (tag dédié), CRM, email interne, Google Ads. */
(function () {
  if (document.documentElement.getAttribute('data-variant') !== 'b') return;
  var form = document.getElementById('variantB');
  if (!form) return;

  var params = new URLSearchParams(location.search);
  var src = {
    angle: params.get('a') || '', utm_source: params.get('utm_source') || '', utm_campaign: params.get('utm_campaign') || '',
    utm_term: params.get('utm_term') || '', gclid: params.get('gclid') || '', fbclid: params.get('fbclid') || ''
  };
  var isMeta = /^(meta|facebook|fb|instagram|ig)$/i.test(src.utm_source) || !!src.fbclid;
  var channel = isMeta ? 'Meta Ads' : (src.gclid || /google/i.test(src.utm_source) ? 'Google Ads' : 'Site');
  var srcLabel = channel + ' Grille tarifaire' + (src.utm_campaign ? ' / ' + src.utm_campaign : '') + (src.utm_term ? ' / ' + src.utm_term : '') + (src.angle ? ' / angle : ' + src.angle : '');

  var NB = ' ';
  var nf = new Intl.NumberFormat('fr-FR');
  function num(n) { return nf.format(n).replace(/\s/g, NB); }
  function gt(name, p) { if (window.gtag) window.gtag('event', name, p || {}); }
  function step(name) { if (window.hmeTrack && window.hmeTrack.step) window.hmeTrack.step(name); }

  /* ── Textes de la page adaptés à la variante B (le titre vient toujours de l'annonce, via angles.js) ── */
  var lead = document.getElementById('aLead');
  if (lead) lead.innerHTML = '<strong>Indiquez votre volume, laissez votre email.</strong> Vous recevez notre grille tarifaire en 2 minutes.';
  var faqCta = document.querySelector('.faq a.btn');
  if (faqCta) { faqCta.setAttribute('href', '#variantB'); var t = document.getElementById('aFaq'); if (t) t.textContent = 'Recevoir la grille tarifaire'; }
  var faqs = document.querySelectorAll('.faq details');
  if (faqs[0]) faqs[0].querySelector('p').textContent = 'Non. Vous recevez la grille tarifaire par email. Si vous voulez aller plus loin, vous choisissez vous-même un créneau. Sinon, on ne vous dérange pas.';
  if (faqs[1]) faqs[1].hidden = true;

  /* ── Curseur ── */
  var slider = document.getElementById('bSlider'), out = document.getElementById('bVal');
  var moved = false;
  function volLabel(v) { return v >= 40000 ? '40' + NB + '000 et plus' : num(v); }
  function volPhrase(v) { return v >= 40000 ? '40' + NB + '000 commandes par mois et plus' : num(v) + ' commandes par mois'; }
  function paint() {
    var v = parseInt(slider.value, 10);
    out.textContent = volLabel(v);
    slider.style.setProperty('--p', ((v - slider.min) / (slider.max - slider.min) * 100) + '%');
  }
  function firstTouch() {
    if (moved) return;
    moved = true;
    step('1-curseur');
    gt('grille_curseur', { canal: channel });
    try { window.dispatchEvent(new Event('hme:consent-prompt')); } catch (e) {}
  }
  slider.addEventListener('input', function () { paint(); firstTouch(); });
  paint();

  /* ── Envoi ── */
  function post(body) {
    return fetch('/api/sio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).catch(function () { return {}; });
  }
  var err = document.getElementById('bErr'), emailIn = form.elements.email, btn = document.getElementById('bBtn');
  var sending = false, lead_ = null;
  emailIn.addEventListener('input', function () { emailIn.classList.remove('bad'); err.textContent = ''; });
  emailIn.addEventListener('focus', function () { try { window.dispatchEvent(new Event('hme:consent-prompt')); } catch (e) {} }, { once: true });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (sending) return;
    step('7-envoi-tente');
    var mail = emailIn.value.trim();
    var dom = (mail.split('@')[1] || '').toLowerCase();
    var FAKE = /^(test|example|exemple|email|mail|domain|domaine|aaa|abc|xxx)\.|(yopmail|mailinator|guerrillamail|tempmail|temp-mail|10minutemail|trashmail|jetable|getnada|sharklasers)\./;
    if (!mail || !emailIn.validity.valid || !/\.[a-z]{2,}$/.test(dom)) { emailIn.classList.add('bad'); err.textContent = 'Indiquez un email valide pour recevoir la grille tarifaire.'; emailIn.focus(); return; }
    if (FAKE.test(dom)) { emailIn.classList.add('bad'); err.textContent = 'Cette adresse ne recevra pas la grille. Indiquez votre email professionnel.'; emailIn.focus(); return; }
    sending = true;
    btn.disabled = true; btn.textContent = 'Envoi en cours…';

    var vol = parseInt(slider.value, 10);
    var qualified = vol >= 3000;
    var volTxt = volLabel(vol) + ' commandes/mois' + (moved ? '' : ' (curseur non déplacé)');
    var lines = [
      'Email    : ' + mail,
      'Volume   : ' + volTxt,
      'Cible    : ' + (qualified ? 'OUI' : 'non'),
      'Variante : B (curseur + email, grille tarifaire)',
      'Source   : ' + srcLabel
    ];
    var tasks = [
      post({ action: 'createContact', email: mail }).then(function (d) {
        if (d && d.id) return post({ action: 'addTag', contactId: d.id, tag: 'HME - LEAD GRILLE TARIFAIRE' });
      }),
      post({ action: 'crmLead', email: mail, note: '── GRILLE TARIFAIRE (' + channel + ') ──\n' + lines.join('\n') }),
      fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: 'a35060be-ea69-45cd-a6c4-abd3e2517de3',
          subject: (qualified ? '🎯 Lead QUALIFIÉ HME (' : '🎯 Nouveau lead HME (') + channel + ' Grille tarifaire) : ' + mail,
          from_name: 'HME Site Web', replyto: mail, to: 'aurelien+HME@famillia.fr',
          message: ['🎯 NOUVEAU LEAD HME : Grille tarifaire ' + channel + (qualified ? ' (dans la cible)' : ''), '📧 À FAIRE : envoyer la grille tarifaire à cette adresse, à la main. L\'écran promet « en 2 minutes » : le plus vite possible.', ''].concat(lines).join('\n')
        })
      }).catch(function () {})
    ];
    if (window.hmeTrack) tasks.push(qualified ? window.hmeTrack.leadQualified(mail) : window.hmeTrack.lead(mail));
    gt('grille_lead', { qualifie: qualified ? 'oui' : 'non', canal: channel });
    step('8-lead-envoye');
    await Promise.race([Promise.all(tasks), new Promise(function (r) { setTimeout(r, 2500); })]);

    lead_ = { email: mail, vol: vol, qualified: qualified };
    try { sessionStorage.setItem('hme_rdv', JSON.stringify({ nom: '', email: mail, marque: '', volume: volLabel(vol), vol: vol, qualified: qualified })); } catch (e2) {}
    document.getElementById('bDoneVol').textContent = volPhrase(vol);
    document.getElementById('bForm').classList.remove('on');
    document.getElementById('bDone').classList.add('on');
    form.scrollIntoView({ block: 'start' });
  });

  /* ── Agenda Calendly (même agenda que la variante A) ── */
  var calReady = null, booked = false;
  function loadCalendly() {
    if (calReady) return calReady;
    calReady = new Promise(function (resolve) {
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://assets.calendly.com/assets/external/widget.css'; document.head.appendChild(css);
      var s = document.createElement('script'); s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true;
      s.onload = resolve; s.onerror = resolve; document.head.appendChild(s);
    });
    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://calendly.com' || !e.data || e.data.event !== 'calendly.event_scheduled' || booked) return;
      booked = true;
      if (window.Calendly && window.Calendly.closePopupWidget) window.Calendly.closePopupWidget();
      document.getElementById('bDoneTitle').textContent = 'C’est réservé.';
      document.getElementById('bDoneText').textContent = 'Vous recevez la confirmation par email. Gardez votre dernière facture logistique sous la main pour l’échange.';
      document.getElementById('bBook').hidden = true;
      if (window.hmeTrack && window.hmeTrack.schedule) window.hmeTrack.schedule(lead_ ? lead_.email : '');
      gt('rdv_reserve', { source: src.utm_source || 'site', page: 'estimation-b' });
    });
    return calReady;
  }
  document.getElementById('bBook').addEventListener('click', function () {
    var q = new URLSearchParams({ hide_event_type_details: '1', hide_landing_page_details: '1', hide_gdpr_banner: '1', primary_color: 'd89a2b',
      utm_source: src.utm_source || 'site', utm_campaign: src.utm_campaign || '' });
    if (lead_) { q.set('email', lead_.email); q.set('a1', 'Grille tarifaire demandée | Volume : ' + volLabel(lead_.vol)); }
    var url = 'https://calendly.com/famillia-aurelien/homemade-elogistics-appel-de-30-minutes?' + q.toString();
    gt('grille_agenda', { canal: channel });
    loadCalendly().then(function () {
      if (window.Calendly && window.Calendly.initPopupWidget) window.Calendly.initPopupWidget({ url: url });
      else window.open(url, '_blank', 'noopener');
    });
  });

  if (window.gtag) window.gtag('event', 'lp_vue', { lp_variante: 'grille', lp_angle: src.angle || 'aucun' });
  step('0-vue');
})();
