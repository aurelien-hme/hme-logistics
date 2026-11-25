/* Challenge HME (landing Meta Ads)
   6 questions → email → résultat (la « friandise » n'apparaît qu'à la fin)
   Lead à l'email, Lead qualifié si dans la cible, Schedule à la réservation Calendly. */
(function () {
  var params = new URLSearchParams(location.search);
  var src = {
    angle: params.get('a') || '', utm_source: params.get('utm_source') || '', utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '', utm_term: params.get('utm_term') || '', fbclid: params.get('fbclid') || '', gclid: params.get('gclid') || ''
  };
  var isMeta = /^(meta|facebook|fb|instagram|ig)$/i.test(src.utm_source) || !!src.fbclid;
  var channel = isMeta ? 'Meta Ads' : (src.gclid || /google/i.test(src.utm_source) ? 'Google Ads' : 'Site');
  var srcLabel = channel + ' Challenge' + (src.utm_campaign ? ' / ' + src.utm_campaign : '') + (src.utm_content ? ' / pub : ' + src.utm_content : '') + (src.utm_term ? ' / ' + src.utm_term : '');
  try { sessionStorage.setItem('hme_src', JSON.stringify(src)); } catch (e) {}

  var LBL = {
    volume: { 500: 'Moins de 1 000', 2000: '1 000 à 3 000', 4000: '3 000 à 5 000', 7500: '5 000 à 10 000', 20000: '10 000 à 30 000', 40000: 'Plus de 30 000' },
    secteur: { complements: 'Compléments alimentaires', sante: 'Santé, bien-être', beaute: 'Cosmétique, beauté', autre: 'Autre' },
    sku: { '<25': 'Moins de 25', '25-50': '25 à 50', '50-100': '50 à 100', '>100': 'Plus de 100' },
    articles: { 1: '1 article', 2: '2 articles', 3: '3 articles', 4: '4 et plus' },
    gestion: { logisticien: 'Un logisticien', interne: 'En interne', mixte: 'Un peu des deux' },
    irritant: { cout: 'Le coût', erreurs: 'Les erreurs et le SAV', visibilite: 'Le manque de visibilité', pics: 'Les pics et la croissance', verif: 'Rien de grave, vérifie' }
  };
  var NB = ' ';
  var nf = new Intl.NumberFormat('fr-FR');
  function eur(n) { return nf.format(n).replace(/\s/g, NB) + NB + '€'; }
  function lbl(k, v) { return (LBL[k] && LBL[k][v]) || v || '—'; }

  var screens = Array.prototype.slice.call(document.querySelectorAll('.q'));
  var QUESTIONS = 6;
  var idx = 0;
  var answers = {};
  var fill = document.getElementById('fill'), stepLabel = document.getElementById('stepLabel'), back = document.getElementById('back');
  var card = document.getElementById('challenge');
  var started = false;

  function gt(name, p) { if (window.gtag) window.gtag('event', name, p || {}); }

  function show(i) {
    idx = Math.max(0, Math.min(i, screens.length - 1));
    screens.forEach(function (s, k) { s.classList.toggle('on', k === idx); });
    var s = screens[idx];
    var type = s.dataset.type;
    if (type === 'single') {
      stepLabel.textContent = 'Question ' + (idx + 1) + ' sur ' + QUESTIONS;
      fill.style.width = Math.round(((idx + 1) / (QUESTIONS + 1)) * 100) + '%';
    } else if (type === 'form') {
      stepLabel.textContent = 'Dernière étape';
      fill.style.width = '92%';
    } else {
      document.getElementById('progress').hidden = true;
    }
    back.hidden = idx === 0 || type === 'result';
    var v = answers[s.dataset.key];
    s.querySelectorAll('.opt').forEach(function (o) { o.setAttribute('role', 'radio'); o.setAttribute('aria-checked', String(o.dataset.v === v)); });
    // En mode tunnel, chaque écran repart du haut, sans animation de défilement
    if (document.body.classList.contains('funnel')) window.scrollTo(0, 0);
    if (type === 'form') {
      var em = s.querySelector('input[type=email]');
      if (em && window.matchMedia('(pointer: fine)').matches) setTimeout(function () { em.focus({ preventScroll: true }); }, 80);
    }
  }

  screens.forEach(function (s) {
    s.querySelectorAll('.opt').forEach(function (o) {
      o.addEventListener('click', function () {
        answers[s.dataset.key] = o.dataset.v;
        s.querySelectorAll('.opt').forEach(function (x) { x.setAttribute('aria-checked', String(x === o)); });
        if (!started) {
          started = true;
          // Tunnel : on masque tout le reste de la page, il ne reste que le questionnaire
          document.body.classList.add('funnel');
          gt('challenge_debut', { canal: channel });
          // Le bandeau cookies n'apparaît qu'après la première réponse (voir hme-tracking.js)
          try { window.dispatchEvent(new Event('hme:consent-prompt')); } catch (e) {}
        }
        gt('challenge_question', { etape: idx + 1, cle: s.dataset.key });
        setTimeout(function () { show(idx + 1); }, 220);
      });
    });
  });
  back.addEventListener('click', function () { show(idx - 1); });

  /* ── Calcul : 1 € de moins par commande en moyenne, ajusté aux réponses ── */
  function estimate() {
    var vol = parseInt(answers.volume, 10) || 0;
    var fa = { 1: 0.8, 2: 1, 3: 1.2, 4: 1.4 }[answers.articles] || 1;
    var fs = { '<25': 1, '25-50': 1, '50-100': 0.8, '>100': 0.6 }[answers.sku] || 1;
    var central = Math.round(vol * 12 * fa * fs / 1000) * 1000;
    return {
      vol: vol, fa: fa, fs: fs, central: central,
      low: Math.round(central * 0.7 / 1000) * 1000,
      high: Math.round(central * 1.3 / 1000) * 1000
    };
  }
  function isQualified() {
    var vol = parseInt(answers.volume, 10) || 0;
    return vol >= 3000 && answers.sku !== '>100';
  }

  /* ── Envoi ── */
  function post(body) {
    return fetch('/api/sio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).catch(function () { return {}; });
  }

  var form = document.getElementById('contactForm');
  var err = document.getElementById('err');
  var sending = false;
  form.querySelectorAll('input').forEach(function (inp) { inp.addEventListener('input', function () { inp.classList.remove('bad'); err.textContent = ''; }); });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (sending) return;
    var emailIn = form.elements.email;
    var mail = emailIn.value.trim();
    var dom = (mail.split('@')[1] || '').toLowerCase();
    var FAKE = /^(test|example|exemple|email|mail|domain|domaine|aaa|abc|xxx)\.|(yopmail|mailinator|guerrillamail|tempmail|temp-mail|10minutemail|trashmail|jetable|getnada|sharklasers)\./;
    if (!mail || !emailIn.validity.valid || !/\.[a-z]{2,}$/.test(dom)) { emailIn.classList.add('bad'); err.textContent = 'Indiquez un email valide pour recevoir votre estimation.'; emailIn.focus(); return; }
    if (FAKE.test(dom)) { emailIn.classList.add('bad'); err.textContent = 'Cette adresse ne recevra pas votre estimation. Indiquez votre email professionnel.'; emailIn.focus(); return; }
    sending = true;
    var btn = document.getElementById('submitBtn');
    btn.disabled = true; btn.textContent = 'Calcul en cours…';

    var who = { email: mail, prenom: form.elements.prenom.value.trim(), marque: form.elements.marque.value.trim(), tel: form.elements.tel.value.trim() };
    var est = estimate();
    var qualified = isQualified();
    var lines = [
      'Email       : ' + who.email,
      'Prénom      : ' + (who.prenom || '—'),
      'Marque      : ' + (who.marque || '—'),
      'Téléphone   : ' + (who.tel || '—'),
      'Volume      : ' + lbl('volume', answers.volume) + ' commandes/mois',
      'Secteur     : ' + lbl('secteur', answers.secteur),
      'Références  : ' + lbl('sku', answers.sku),
      'Articles/cmd: ' + lbl('articles', answers.articles),
      'Logistique  : ' + lbl('gestion', answers.gestion),
      'Irritant    : ' + lbl('irritant', answers.irritant),
      'Résultat    : ' + eur(est.central) + ' / an (' + eur(est.low) + ' à ' + eur(est.high) + ')',
      'Cible       : ' + (qualified ? 'OUI' : 'non'),
      'Source      : ' + srcLabel + (src.fbclid ? '\nfbclid : ' + src.fbclid : '')
    ];
    var tasks = [
      post({ action: 'createContact', email: mail, phone: who.tel }).then(function (d) {
        if (d && d.id) return post({ action: 'addTag', contactId: d.id, tag: isMeta ? 'HME - LEAD META CHALLENGE' : 'HME - LEAD CHALLENGE' });
      }),
      post({ action: 'crmLead', email: mail, note: '── CHALLENGE (' + channel + ') ──\n' + lines.join('\n') }).then(function (d) { if (d && d.id) crmId = d.id; }),
      fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: 'a35060be-ea69-45cd-a6c4-abd3e2517de3',
          subject: (qualified ? '🎯 Lead QUALIFIÉ HME (' : '🎯 Nouveau lead HME (') + channel + ' Challenge) : ' + (who.marque || mail),
          from_name: 'HME Site Web', replyto: mail, to: 'aurelien+HME@famillia.fr',
          message: ['🎯 NOUVEAU LEAD HME : Challenge ' + channel + (qualified ? ' (dans la cible)' : ''), '📧 À FAIRE : envoyer son estimation par email (promise à l\'écran), idéalement dans l\'heure.', ''].concat(lines).join('\n')
        })
      }).catch(function () {})
    ];
    if (window.hmeTrack) tasks.push(qualified ? window.hmeTrack.leadQualified(mail) : window.hmeTrack.lead(mail));
    gt('challenge_lead', { qualifie: qualified ? 'oui' : 'non', canal: channel });
    await Promise.race([Promise.all(tasks), new Promise(function (r) { setTimeout(r, 2500); })]);

    try { sessionStorage.setItem('hme_rdv', JSON.stringify({ nom: who.prenom, email: mail, marque: who.marque, volume: lbl('volume', answers.volume), vol: est.vol, qualified: qualified })); } catch (e2) {}
    renderResult(est, qualified, who);
    lead = { who: who, est: est, qualified: qualified };
    showKey('result');
  });

  /* ── Résultat ── */
  var crmId = null, lead = null;
  function showKey(k) { for (var n = 0; n < screens.length; n++) if (screens[n].dataset.key === k) return show(n); }

  function renderResult(est, qualified, who) {
    var low = est.vol < 1000;
    document.getElementById('rKicker').textContent = who.prenom ? who.prenom + ', voici votre résultat' : 'Voici votre résultat';
    document.getElementById('rAmt').textContent = eur(est.central);
    document.getElementById('rRange').textContent = 'Entre ' + eur(est.low) + ' et ' + eur(est.high) + ' selon votre grille actuelle';
    var adj = [];
    if (est.fa !== 1) adj.push('ajusté pour ' + lbl('articles', answers.articles) + ' par commande');
    if (est.fs !== 1) adj.push('ajusté pour un catalogue de ' + lbl('sku', answers.sku).toLowerCase() + ' références');
    document.getElementById('rCalc').innerHTML =
      '<b>' + nf.format(est.vol).replace(/\s/g, NB) + ' commandes</b> par mois × <b>1 €</b> de moins par commande en moyenne × <b>12 mois</b>' +
      (adj.length ? '<br>' + adj.join(', ') : '');
    document.getElementById('rNote').textContent = answers.gestion === 'interne'
      ? 'Vous préparez en interne : ce chiffre compare avec un logisticien généraliste. Votre coût interne réel se calcule ensemble.'
      : 'Estimation indicative. Le chiffre exact se calcule sur votre facture.';
    if (low) document.getElementById('rLow').hidden = false;
    else if (answers.sku !== '>100') document.getElementById('rNext').hidden = false;
    else document.getElementById('rHigh').hidden = false;
  }

  /* ── Option 2 : 3 questions de plus ── */
  var precis = {};
  document.getElementById('choiceForm').addEventListener('click', function () { gt('challenge_option', { choix: 'questions' }); showKey('precis'); });
  document.getElementById('choiceCal').addEventListener('click', function () { gt('challenge_option', { choix: 'agenda' }); openCalendly(); });
  var precisForm = document.getElementById('precisForm'), errPrecis = document.getElementById('errPrecis');
  precisForm.querySelectorAll('input').forEach(function (i) { i.addEventListener('input', function () { i.classList.remove('bad'); errPrecis.textContent = ''; }); });
  precisForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var cmd = parseInt(String(precisForm.elements.cmd.value).replace(/\s/g, ''), 10);
    var montant = parseFloat(String(precisForm.elements.montant.value).replace(/\s/g, '').replace(',', '.'));
    if (!(cmd > 0)) { precisForm.elements.cmd.classList.add('bad'); errPrecis.textContent = 'Indiquez votre nombre de commandes du mois dernier.'; return; }
    if (!(montant > 0)) { precisForm.elements.montant.classList.add('bad'); errPrecis.textContent = 'Indiquez le montant approximatif de votre facture.'; return; }
    precis = { cmd: cmd, montant: montant, logisticien: precisForm.elements.logisticien.value.trim(), cpc: montant / cmd };
    document.getElementById('cpcAmt').textContent = precis.cpc.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + NB + '€';
    document.getElementById('cpcNote').textContent = nf.format(montant).replace(/\s/g, NB) + NB + '€ HT ÷ ' + nf.format(cmd).replace(/\s/g, NB) + ' commandes. C’est le chiffre que votre logisticien ne vous montre jamais.';
    gt('challenge_precis', { canal: channel });
    showKey('facture');
  });

  /* ── Facture (facultative) + envoi ── */
  var fileIn = document.getElementById('fileIn'), drop = document.getElementById('drop'), errFile = document.getElementById('errFile');
  fileIn.addEventListener('change', function () {
    errFile.textContent = '';
    var f = fileIn.files[0];
    drop.classList.toggle('has', !!f);
    document.getElementById('dropTxt').innerHTML = f ? '<strong>' + f.name.replace(/[<>&]/g, '') + '</strong><span>' + Math.round(f.size / 1024) + ' Ko · prête à envoyer</span>' : '<strong>Choisir ma facture</strong><span>PDF ou photo, 4 Mo maximum</span>';
  });
  var finSending = false;
  async function finish(withFile) {
    if (finSending || !lead) return;
    var f = withFile ? fileIn.files[0] : null;
    if (withFile && !f) { errFile.textContent = 'Choisissez votre facture, ou envoyez sans facture.'; return; }
    if (f && f.size > 4 * 1024 * 1024) { errFile.textContent = 'Fichier trop lourd (4 Mo maximum). Une photo ou un PDF compressé suffit.'; return; }
    finSending = true;
    var btn = document.getElementById('factureBtn'); btn.disabled = true; btn.textContent = f ? 'Envoi de la facture…' : 'Envoi…';
    var link = '';
    if (f) {
      try {
        var r = await fetch('/api/facture-upload', { method: 'POST', headers: { 'Content-Type': f.type || 'application/pdf', 'X-Lead-Email': lead.who.email }, body: f });
        var d = await r.json().catch(function () { return {}; });
        if (r.ok && d.link) link = d.link;
        else { finSending = false; btn.disabled = false; btn.innerHTML = 'Recevoir mon devis sous 24 h <span aria-hidden="true">→</span>'; errFile.textContent = r.status === 415 ? 'Format non accepté : PDF, JPG ou PNG.' : 'L’envoi a échoué. Réessayez, ou envoyez sans facture.'; return; }
      } catch (e2) { finSending = false; btn.disabled = false; btn.innerHTML = 'Recevoir mon devis sous 24 h <span aria-hidden="true">→</span>'; errFile.textContent = 'L’envoi a échoué. Réessayez, ou envoyez sans facture.'; return; }
    }
    var w = lead.who;
    var cpcTxt = precis.cpc ? precis.cpc.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €' : '—';
    var lines = [
      'Prénom     : ' + (w.prenom || '—'), 'Marque     : ' + (w.marque || '—'), 'Email      : ' + w.email, 'Téléphone  : ' + (w.tel || '—'),
      'Commandes (mois dernier) : ' + (precis.cmd ? nf.format(precis.cmd) : '—'),
      'Facture HT (mois dernier): ' + (precis.montant ? nf.format(precis.montant) + ' €' : '—'),
      'Coût par commande actuel : ' + cpcTxt,
      'Logisticien actuel       : ' + (precis.logisticien || '—'),
      'Estimation challenge     : ' + eur(lead.est.central) + ' / an',
      'Facture                  : ' + (link || 'non envoyée'),
      'Source     : ' + srcLabel
    ];
    var tasks = [
      post(crmId ? { action: 'crmLead', crmId: crmId, note: '── DEMANDE DE DEVIS PRÉCIS (Challenge) ──\n' + lines.join('\n') } : { action: 'crmLead', email: w.email, note: '── DEMANDE DE DEVIS PRÉCIS (Challenge) ──\n' + lines.join('\n') }),
      fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: 'a35060be-ea69-45cd-a6c4-abd3e2517de3',
          subject: '📄 Devis précis demandé HME' + (link ? ' (facture jointe)' : '') + ' : ' + (w.marque || w.email) + ' · ' + cpcTxt + '/cmd',
          from_name: 'HME Site Web', replyto: w.email, to: 'aurelien+HME@famillia.fr',
          message: ['📄 DEMANDE DE DEVIS PRÉCIS, à envoyer sous 24 h', ''].concat(lines).join('\n')
        })
      }).catch(function () {})
    ];
    gt('challenge_devis', { facture: link ? 'oui' : 'non', canal: channel });
    await Promise.race([Promise.all(tasks), new Promise(function (r2) { setTimeout(r2, 2500); })]);
    document.getElementById('dTitle').textContent = (w.prenom ? w.prenom + ', votre' : 'Votre') + ' devis précis arrive sous 24 h.';
    document.getElementById('dText').textContent = link
      ? 'Nous avons bien reçu votre facture. Un expert HME la compare ligne par ligne et vous envoie votre devis par email.'
      : 'Un expert HME prépare votre devis à partir de vos chiffres et vous l’envoie par email. Vous pourrez nous transmettre votre facture en réponse.';
    showKey('done');
  }
  document.getElementById('factureForm').addEventListener('submit', function (e) { e.preventDefault(); finish(true); });
  document.getElementById('noFile').addEventListener('click', function () { finish(false); });

  /* ── Agenda Calendly en plein écran ── */
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
      document.getElementById('dTitle').textContent = 'C’est réservé' + (lead && lead.who.prenom ? ', ' + lead.who.prenom : '') + '.';
      document.getElementById('dText').textContent = 'Vous recevez la confirmation par email. Gardez votre dernière facture logistique sous la main pour l’échange.';
      document.getElementById('bookBtn').hidden = true;
      showKey('done');
      if (window.hmeTrack && window.hmeTrack.schedule) window.hmeTrack.schedule(lead ? lead.who.email : '');
      gt('rdv_reserve', { source: src.utm_source || 'site', page: 'challenge' });
    });
    return calReady;
  }
  function calendlyUrl() {
    var w = lead ? lead.who : {}, est = lead ? lead.est : { central: 0 };
    var resume = ['Challenge HME rempli', w.marque && ('Marque : ' + w.marque), 'Volume : ' + lbl('volume', answers.volume),
      'Secteur : ' + lbl('secteur', answers.secteur), 'Références : ' + lbl('sku', answers.sku), 'Logistique : ' + lbl('gestion', answers.gestion),
      'Résultat : ' + eur(est.central) + '/an', w.tel && ('Tél : ' + w.tel), precis.cpc && ('Coût/cmd : ' + precis.cpc.toFixed(2) + ' €')].filter(Boolean).join(' | ');
    // Masque le panneau de gauche (photo, logo du compte, description) : plus de logo Famillia
    var q = new URLSearchParams({ hide_event_type_details: '1', hide_landing_page_details: '1', hide_gdpr_banner: '1', primary_color: 'd89a2b',
      utm_source: src.utm_source || 'site', utm_campaign: src.utm_campaign || '', utm_content: src.utm_content || '' });
    if (w.prenom) q.set('name', w.prenom);
    if (w.email) q.set('email', w.email);
    q.set('a1', resume);
    return 'https://calendly.com/famillia-aurelien/homemade-elogistics-appel-de-30-minutes?' + q.toString();
  }
  function openCalendly() {
    var url = calendlyUrl();
    gt('challenge_agenda', { canal: channel });
    loadCalendly().then(function () {
      if (window.Calendly && window.Calendly.initPopupWidget) window.Calendly.initPopupWidget({ url: url });
      else window.open(url, '_blank', 'noopener');
    });
  }
  document.getElementById('bookBtn').addEventListener('click', openCalendly);
  var highCal = document.getElementById('highCal'); if (highCal) highCal.addEventListener('click', openCalendly);
  document.getElementById('contactForm').addEventListener('submit', function () { setTimeout(loadCalendly, 1500); });

  show(0);
})();
