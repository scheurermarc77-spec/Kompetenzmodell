
(() => {
  const model = window.COMPETENCE_MODEL;
  const main = document.getElementById('main');
  const backBtn = document.getElementById('backBtn');
  const homeBtn = document.getElementById('homeBtn');
  const brandBtn = document.getElementById('brandBtn');
  const progress = document.getElementById('progress');

  const state = { domain: null, competency: null, item: null };

  const escapeHtml = (value) => String(value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");

  const totalIndicators = (competency) =>
    competency.items.reduce((n, item) => n + item.indicators.length, 0);

  const currentStep = () => state.item !== null ? 4 : state.competency !== null ? 3 : state.domain !== null ? 2 : 1;

  function setNav(){
    const step = currentStep();
    backBtn.classList.toggle('hidden', step === 1);
    homeBtn.classList.toggle('hidden', step === 1);
    progress.classList.toggle('hidden', step === 1);
    [...progress.children].forEach((el, i) => el.classList.toggle('active', i < step));
  }

  function scrollTop(){
    window.scrollTo({top:0, behavior:'instant'});
  }

  function pathHtml(parts){
    return `<div class="path">${parts.map((p,i) =>
      `${i ? '<i>›</i>' : ''}<b>${escapeHtml(p)}</b>`).join('')}</div>`;
  }

  function renderHome(){
    state.domain = state.competency = state.item = null;
    setNav();
    main.innerHTML = `
      <section class="hero">
        <p class="eyebrow">Stadtschulen und Betreuung Zug · Zyklus 3</p>
        <h1>${escapeHtml(model.title)}</h1>
        <p class="lead">${escapeHtml(model.subtitle)}</p>
      </section>
      <div class="grid domains">
        ${model.domains.map((d,i) => {
          const cls = i===0 ? 'personal' : i===1 ? 'social' : 'method';
          const letter = i===0 ? 'P' : i===1 ? 'S' : 'M';
          return `<button class="card domain-card" data-domain="${i}">
            <span class="domain-icon ${cls}">${letter}</span>
            <span class="card-body">
              <span class="card-title">${escapeHtml(d.name)}</span>
              <span class="card-subtitle">${escapeHtml(d.description)}</span>
              <span class="count">${d.competencies.length} Teilkompetenzen</span>
            </span>
            <span class="chevron">›</span>
          </button>`;
        }).join('')}
      </div>
      <div class="install-note"><strong>iPhone-Tipp:</strong> In Safari auf «Teilen» und danach «Zum Home-Bildschirm» tippen. Danach öffnet sich die App wie eine normale iPhone-App.</div>
    `;
    main.querySelectorAll('[data-domain]').forEach(btn => btn.addEventListener('click', () => {
      state.domain = Number(btn.dataset.domain);
      state.competency = state.item = null;
      renderCompetencies();
    }));
    scrollTop();
  }

  function renderCompetencies(){
    setNav();
    const domain = model.domains[state.domain];
    main.innerHTML = `
      ${pathHtml([domain.name])}
      <section class="hero">
        <p class="eyebrow">Schritt 2 von 4</p>
        <h2>${escapeHtml(domain.name)}</h2>
        <p class="lead">Wähle eine Teilkompetenz.</p>
      </section>
      <div class="grid">
        ${domain.competencies.map((c,i) => `<button class="card list-card" data-competency="${i}">
          <span class="card-body">
            <span class="card-title">${escapeHtml(c.name)}</span>
            <span class="card-subtitle">${c.items.length} Kompetenzbeschreibungen · ${totalIndicators(c)} Indikatoren</span>
          </span>
          <span class="chevron">›</span>
        </button>`).join('')}
      </div>
    `;
    main.querySelectorAll('[data-competency]').forEach(btn => btn.addEventListener('click', () => {
      state.competency = Number(btn.dataset.competency);
      state.item = null;
      renderStatements();
    }));
    scrollTop();
  }

  function renderStatements(filter=''){
    setNav();
    const domain = model.domains[state.domain];
    const competency = domain.competencies[state.competency];
    const q = filter.trim().toLocaleLowerCase('de-CH');
    const rows = competency.items
      .map((item,i)=>({item,i}))
      .filter(({item}) => !q || item.statement.toLocaleLowerCase('de-CH').includes(q) ||
        item.indicators.some(x => x.toLocaleLowerCase('de-CH').includes(q)));

    main.innerHTML = `
      ${pathHtml([domain.name, competency.name])}
      <section class="hero">
        <p class="eyebrow">Schritt 3 von 4</p>
        <h2>${escapeHtml(competency.name)}</h2>
        <p class="lead">Wähle eine Kompetenzbeschreibung.</p>
      </section>
      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input id="search" class="search" type="search" autocomplete="off" placeholder="Kompetenz oder Indikator suchen" value="${escapeHtml(filter)}">
      </div>
      <div class="grid" id="statementList">
        ${rows.length ? rows.map(({item,i}) => `<button class="card statement-card" data-item="${i}">
          <span class="index">${i+1}</span>
          <span class="card-body">
            <span class="card-title">${escapeHtml(item.statement)}</span>
            <span class="count">${item.indicators.length} Indikatoren</span>
          </span>
          <span class="chevron">›</span>
        </button>`).join('') : '<div class="empty">Keine Treffer gefunden.</div>'}
      </div>
    `;

    const search = document.getElementById('search');
    search.addEventListener('input', () => {
      const value = search.value;
      renderStatements(value);
      requestAnimationFrame(() => {
        const el = document.getElementById('search');
        el.focus();
        el.setSelectionRange(value.length, value.length);
      });
    });
    main.querySelectorAll('[data-item]').forEach(btn => btn.addEventListener('click', () => {
      state.item = Number(btn.dataset.item);
      renderIndicators();
    }));
    if (!filter) scrollTop();
  }

  function renderIndicators(){
    setNav();
    const domain = model.domains[state.domain];
    const competency = domain.competencies[state.competency];
    const item = competency.items[state.item];
    main.innerHTML = `
      ${pathHtml([domain.name, competency.name])}
      <section class="hero">
        <p class="eyebrow">Schritt 4 von 4 · Indikatoren</p>
        <h2>${escapeHtml(item.statement)}</h2>
        <span class="summary-badge">${item.indicators.length} beobachtbare Indikatoren</span>
      </section>
      <div class="indicator-box">
        <ol class="indicator-list">
          ${item.indicators.map((x,i)=>`<li><span class="indicator-num">${i+1}</span><span>${escapeHtml(x)}</span></li>`).join('')}
        </ol>
      </div>
    `;
    scrollTop();
  }

  function goBack(){
    if (state.item !== null){
      state.item = null;
      renderStatements();
    } else if (state.competency !== null){
      state.competency = null;
      renderCompetencies();
    } else if (state.domain !== null){
      renderHome();
    }
  }

  backBtn.addEventListener('click', goBack);
  homeBtn.addEventListener('click', renderHome);
  brandBtn.addEventListener('click', renderHome);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
  }

  renderHome();
})();
