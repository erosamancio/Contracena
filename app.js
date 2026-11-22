(() => {
  'use strict';

  const CHAVE = 'contracena.v1';
  const RECENTES = 30;
  const CENAS_MARATONA = 5;
  const CORES = { capa: '#F4C531', rotina: '#7FC9B4', encontro: '#F4A3BE', novela: '#E0553A', trabalho: '#7FA6E8', absurdo: '#B4D84A', picante: '#F08A3A', quente: '#F2706B', tinta: '#15100E' };

  const idDe = (c) => c.c + ':' + c.t;
  const PORID = new Map(CENAS.map((c) => [idDe(c), c]));
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // ── estado salvo ──
  const padrao = () => ({
    nomes: { ela: '', ele: '' },
    cats: Object.fromEntries(Object.entries(CATEGORIAS).map(([k, v]) => [k, !v.off])),
    modo: 'rapida',
    tempo: 180,
    hist: [],
    notas: {},
    favs: [],
    folheto: 0,
  });
  let salvo;
  try { salvo = Object.assign(padrao(), JSON.parse(localStorage.getItem(CHAVE)) || {}); }
  catch { salvo = padrao(); }
  const guardar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(salvo)); } catch {} };

  // ── estado da rodada ──
  const rodada = {
    cena: null, trocada: false, segundaVez: false,
    pulados: [], revUsadas: new Set(), revDaCena: false,
    passo: 0, lidos: [false, false],
    seg: 0, timer: null, pausado: false,
    nota: 0, venc: null,
    maratona: { n: 0, ela: 0, ele: 0 },
  };

  // encolhe o título até caber na largura, palavra por palavra
  function caber(el, max, min) {
    if (!el || !el.clientWidth) return;
    let t = max;
    el.style.fontSize = t + 'px';
    while (t > min && el.scrollWidth > el.clientWidth + 1) { t -= 2; el.style.fontSize = t + 'px'; }
  }
  const ajustarTitulos = () => {
    caber($('.capa-titulo'), 112, 40);
    caber($('#cena-titulo'), 50, 24);
  };
  window.addEventListener('resize', ajustarTitulos);
  document.fonts?.ready.then(ajustarTitulos);

  const nome = (q) => salvo.nomes[q] || (q === 'ela' ? 'Ela' : 'Ele');

  // ── navegação ──
  let telaAtual = 'capa';
  function ir(tela, cor) {
    $$('.tela').forEach((s) => { s.hidden = s.dataset.tela !== tela; });
    telaAtual = tela;
    const c = cor || (['cena', 'papel', 'palco', 'fim'].includes(tela) && rodada.cena ? rodada.cena.c : 'capa');
    document.body.dataset.cor = c;
    $('meta[name="theme-color"]').content = CORES[tela === 'papel' ? 'tinta' : c];
    if (tela !== 'palco') pararRelogio();
    if (tela === 'capa') pintarCapa();
    if (tela === 'clima') pintarClima();
    if (tela === 'repertorio') pintarRepertorio();
    ajustarTitulos();
    window.scrollTo(0, 0);
    const foco = document.querySelector(`[data-tela="${tela}"] h1, [data-tela="${tela}"] h2`);
    if (foco) { foco.setAttribute('tabindex', '-1'); foco.focus({ preventScroll: true }); }
  }

  function pintarNomes() {
    $$('.n-ela').forEach((e) => { e.textContent = nome('ela'); });
    $$('.n-ele').forEach((e) => { e.textContent = nome('ele'); });
  }

  // ── sorteio ──
  const catAtiva = (k) => {
    const d = CATEGORIAS[k]?.dentro;
    return !!salvo.cats[k] && (!d || !!salvo.cats[d]);
  };
  function ativas() { return CENAS.filter((c) => catAtiva(c.c)); }

  function pesoCategoria(cat) {
    const notas = Object.entries(salvo.notas).filter(([id]) => id.startsWith(cat + ':')).map(([, n]) => n);
    if (!notas.length) return 1;
    const media = notas.reduce((a, b) => a + b, 0) / notas.length;
    return 0.6 + media * 0.3; // 0,9 a 1,5
  }

  function sortear() {
    const pool = ativas();
    if (!pool.length) return null;
    const jogadas = new Set(salvo.hist);
    const recentes = new Set(salvo.hist.slice(-RECENTES));
    const pulados = new Set(rodada.pulados);
    let cand = pool.filter((c) => !jogadas.has(idDe(c)) && !pulados.has(idDe(c)));
    if (!cand.length) {
      // baralho acabou: embaralha de novo, mas segura as mais recentes
      salvo.hist = salvo.hist.slice(-RECENTES);
      guardar();
      cand = pool.filter((c) => !recentes.has(idDe(c)) && !pulados.has(idDe(c)));
    }
    if (!cand.length) {
      const metade = new Set(salvo.hist.slice(-Math.floor(pool.length / 2)));
      cand = pool.filter((c) => !metade.has(idDe(c)));
    }
    if (!cand.length) cand = pool;
    const pesos = cand.map((c) => pesoCategoria(c.c));
    let r = Math.random() * pesos.reduce((a, b) => a + b, 0);
    for (let i = 0; i < cand.length; i++) { r -= pesos[i]; if (r <= 0) return cand[i]; }
    return cand[cand.length - 1];
  }

  function abrirCena(cena, { segundaVez = false } = {}) {
    if (!cena) { avisoSemCategoria(); return; }
    rodada.cena = cena;
    rodada.segundaVez = segundaVez;
    rodada.trocada = segundaVez;
    rodada.revDaCena = false;
    rodada.nota = 0;
    rodada.venc = null;
    if (!segundaVez) { salvo.folheto += 1; guardar(); }

    const cat = CATEGORIAS[cena.c];
    $('#cena-num').textContent = 'Folheto nº ' + String(salvo.folheto).padStart(3, '0');
    $('#cena-cat').textContent = cat.nome;
    $('#cena-titulo').textContent = cena.t;
    $('#cena-gravura').innerHTML = gravuraSVG(cena.c);
    $('#cena-lugar').textContent = cena.l;
    $('#cena-sit').textContent = cena.s;
    $('#cena-troca').hidden = !segundaVez;
    pintarFav();
    pintarNomes();
    ir('cena');
    const tela = $('[data-tela="cena"]');
    tela.classList.remove('imprimindo');
    void tela.offsetWidth;
    tela.classList.add('imprimindo');
  }

  function avisoSemCategoria() {
    ir('clima');
    const lista = $('#lista-cats');
    lista.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 300 });
  }

  function papeis() {
    const c = rodada.cena;
    return rodada.trocada ? { ela: c.ele, ele: c.ela } : { ela: c.ela, ele: c.ele };
  }

  // ── papel secreto ──
  function iniciarPapeis() {
    rodada.passo = 0;
    rodada.lidos = [false, false];
    mostrarPapel();
    ir('papel');
  }
  function mostrarPapel() {
    const quem = rodada.passo === 0 ? 'ela' : 'ele';
    const p = papeis()[quem];
    $('#papel-passo').textContent = `Papel ${rodada.passo + 1} de 2`;
    $('#papel-nome').textContent = nome(quem);
    $('#papel-quem').textContent = p[0];
    $('#papel-quer').textContent = p[1];
    $('#papel-seg').textContent = p[2];
    const prox = $('#btn-papel-prox');
    prox.disabled = !rodada.lidos[rodada.passo];
    prox.textContent = rodada.passo === 0 ? `Já li, passar para ${nome('ele')}` : 'Já li, começar a cena';
    $('[data-tela="papel"]').classList.remove('revelado');
  }
  function revelar(sim) {
    const tela = $('[data-tela="papel"]');
    tela.classList.toggle('revelado', sim);
    $('#papel-carta').setAttribute('aria-hidden', String(!sim));
    if (sim) {
      rodada.lidos[rodada.passo] = true;
      $('#btn-papel-prox').disabled = false;
    }
  }
  const segurar = $('#btn-segurar');
  segurar.addEventListener('pointerdown', (e) => { e.preventDefault(); try { segurar.setPointerCapture(e.pointerId); } catch {} revelar(true); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => segurar.addEventListener(ev, () => revelar(false)));
  segurar.addEventListener('contextmenu', (e) => e.preventDefault());
  segurar.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); revelar(true); } });
  segurar.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') revelar(false); });

  $('#btn-papel-prox').addEventListener('click', () => {
    if (rodada.passo === 0) { rodada.passo = 1; mostrarPapel(); $('#papel-nome').focus?.(); }
    else iniciarPalco();
  });

  // ── em cena ──
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  function iniciarPalco() {
    rodada.seg = salvo.tempo;
    rodada.pausado = false;
    $('#palco-titulo').textContent = rodada.cena.t;
    $('#reviravolta').hidden = true;
    $('#palco-rotulo').textContent = 'Em cena';
    $('#btn-pausa').textContent = 'Pausar';
    $('#btn-pausa').hidden = salvo.tempo === 0;
    ir('palco');
    pintarRelogio();
    if (salvo.tempo > 0) rodarRelogio();
    try { navigator.wakeLock?.request('screen').then((l) => { rodada.lock = l; }).catch(() => {}); } catch {}
  }
  function pintarRelogio() {
    const r = $('#relogio');
    if (salvo.tempo === 0) { r.textContent = 'Livre'; r.classList.remove('pouco'); r.style.fontSize = 'clamp(72px, 24vw, 120px)'; return; }
    r.style.fontSize = '';
    r.textContent = fmt(Math.max(rodada.seg, 0));
    r.classList.toggle('pouco', rodada.seg <= 10 && rodada.seg > 0);
  }
  function rodarRelogio() {
    pararRelogio();
    rodada.timer = setInterval(() => {
      if (rodada.pausado) return;
      rodada.seg -= 1;
      pintarRelogio();
      if (rodada.seg <= 0) {
        pararRelogio();
        $('#palco-rotulo').textContent = 'Fim do tempo';
        navigator.vibrate?.([200, 100, 200, 100, 400]);
        setTimeout(() => { if (telaAtual === 'palco') encerrar(); }, 1600);
      }
    }, 1000);
  }
  function pararRelogio() {
    clearInterval(rodada.timer); rodada.timer = null;
    try { rodada.lock?.release(); rodada.lock = null; } catch {}
  }
  function reviravolta() {
    let txt;
    if (rodada.cena.r && !rodada.revDaCena) { txt = rodada.cena.r; rodada.revDaCena = true; }
    else {
      let livres = REVIRAVOLTAS.filter((r) => !rodada.revUsadas.has(r));
      if (!livres.length) { rodada.revUsadas.clear(); livres = REVIRAVOLTAS; }
      txt = livres[Math.floor(Math.random() * livres.length)];
      rodada.revUsadas.add(txt);
    }
    const box = $('#reviravolta');
    box.hidden = true; void box.offsetWidth;
    $('#rev-texto').textContent = txt;
    box.hidden = false;
    navigator.vibrate?.(60);
  }

  // ── fim ──
  function encerrar() {
    pararRelogio();
    const p = papeis();
    $('#fim-titulo').textContent = rodada.cena.t;
    $('#seg-ela').textContent = p.ela[2];
    $('#seg-ele').textContent = p.ele[2];
    const mar = salvo.modo === 'maratona';
    $('#bloco-vencedor').hidden = !mar;
    $$('#escolha-vencedor button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    pintarEstrelas(salvo.notas[idDe(rodada.cena)] || 0);
    rodada.nota = salvo.notas[idDe(rodada.cena)] || 0;
    const id = idDe(rodada.cena);
    if (!rodada.segundaVez) {
      salvo.hist = salvo.hist.filter((h) => h !== id).concat(id).slice(-400);
      guardar();
    }
    const btn = $('#btn-proxima');
    if (salvo.modo === 'troca' && !rodada.segundaVez) btn.textContent = 'Agora troquem os papéis';
    else if (mar) btn.textContent = rodada.maratona.n + 1 >= CENAS_MARATONA ? 'Ver o placar' : `Próxima (${rodada.maratona.n + 1} de ${CENAS_MARATONA})`;
    else btn.textContent = 'Próxima cena';
    pintarNomes();
    ir('fim');
  }
  function pintarEstrelas(n) {
    $$('#estrelas button').forEach((b) => {
      const v = +b.dataset.nota;
      b.classList.toggle('cheia', v <= n);
      b.setAttribute('aria-checked', String(v === n));
    });
  }
  $('#estrelas').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    rodada.nota = +b.dataset.nota;
    salvo.notas[idDe(rodada.cena)] = rodada.nota;
    guardar();
    pintarEstrelas(rodada.nota);
  });
  $('#escolha-vencedor').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    rodada.venc = b.dataset.venc;
    $$('#escolha-vencedor button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  });

  function proxima() {
    if (salvo.modo === 'troca' && !rodada.segundaVez) { abrirCena(rodada.cena, { segundaVez: true }); return; }
    if (salvo.modo === 'maratona') {
      const m = rodada.maratona;
      if (rodada.venc === 'ela') m.ela += 1;
      else if (rodada.venc === 'ele') m.ele += 1;
      else if (rodada.venc === 'empate') { m.ela += 1; m.ele += 1; }
      m.n += 1;
      if (m.n >= CENAS_MARATONA) { mostrarPlacar(); return; }
    }
    rodada.pulados = [];
    abrirCena(sortear());
  }
  function mostrarPlacar() {
    const m = rodada.maratona;
    $('#pl-ela').textContent = m.ela;
    $('#pl-ele').textContent = m.ele;
    let t;
    if (m.ela > m.ele) t = `${nome('ela')} leva a noite`;
    else if (m.ele > m.ela) t = `${nome('ele')} leva a noite`;
    else t = 'Empate. Desempate amanhã';
    $('#placar-titulo').textContent = t;
    pintarNomes();
    ir('placar', 'capa');
  }

  // ── favoritas ──
  function pintarFav() {
    const on = salvo.favs.includes(idDe(rodada.cena));
    const b = $('#btn-fav');
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? 'Tirar das favoritas' : 'Guardar nas favoritas');
  }
  $('#btn-fav').addEventListener('click', () => {
    const id = idDe(rodada.cena);
    salvo.favs = salvo.favs.includes(id) ? salvo.favs.filter((f) => f !== id) : [id, ...salvo.favs];
    guardar(); pintarFav();
  });

  // ── capa ──
  function pintarCapa() {
    pintarNomes();
    const nomes = Object.entries(CATEGORIAS).filter(([k]) => catAtiva(k)).map(([, v]) => v.nome);
    let clima;
    if (!nomes.length) clima = 'Nenhum tipo de cena escolhido. Toque em Clima da noite.';
    else if (nomes.length === Object.keys(CATEGORIAS).length) clima = 'Hoje vale tudo, até as mais quentes.';
    else clima = 'Hoje: ' + (nomes.length > 1 ? nomes.slice(0, -1).join(', ') + ' e ' + nomes.at(-1) : nomes[0]) + '.';
    const modos = { rapida: '', maratona: ' Modo maratona.', troca: ' Com troca de papéis.' };
    $('#capa-clima').textContent = clima + modos[salvo.modo];
    $("#capa-contagem").textContent = `${ativas().length} cenas`;
  }

  // ── clima ──
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M4 12 L10 18 L20 6"/></svg>';
  function pintarClima() {
    $('#nome-ela').value = salvo.nomes.ela;
    $('#nome-ele').value = salvo.nomes.ele;
    const totais = {};
    CENAS.forEach((c) => { totais[c.c] = (totais[c.c] || 0) + 1; });
    $('#lista-cats').innerHTML = Object.entries(CATEGORIAS).map(([k, v]) => v.dentro ? `
      <li class="cat cat-sub ${salvo.cats[v.dentro] ? '' : 'inativa'}" data-dentro="${v.dentro}"><label style="--cor:var(--p-${k})">
        <input type="checkbox" value="${k}" ${salvo.cats[k] ? 'checked' : ''} ${salvo.cats[v.dentro] ? '' : 'tabindex="-1"'}>
        <span><b>Incluir as mais quentes (+18)</b><i>${v.sub}</i></span>
        <span class="marca" aria-hidden="true">${CHECK}</span>
      </label></li>` : `
      <li class="cat"><label style="--cor:var(--p-${k})">
        <span class="amostra" aria-hidden="true">${iconeSVG(k)}</span>
        <input type="checkbox" value="${k}" ${salvo.cats[k] ? 'checked' : ''}>
        <span><b>${v.nome}</b><i>${v.sub}</i></span>
        <span class="marca" aria-hidden="true">${CHECK}</span>
      </label></li>`).join('');
    $$('input[name="modo"]').forEach((i) => { i.checked = i.value === salvo.modo; });
    $$('input[name="tempo"]').forEach((i) => { i.checked = +i.value === salvo.tempo; });
  }
  $('#lista-cats').addEventListener('change', (e) => {
    salvo.cats[e.target.value] = e.target.checked; guardar();
    $$('#lista-cats [data-dentro]').forEach((li) => {
      const on = !!salvo.cats[li.dataset.dentro];
      li.classList.toggle('inativa', !on);
      li.querySelector('input').tabIndex = on ? 0 : -1;
    });
  });
  $('#op-modo').addEventListener('change', (e) => { salvo.modo = e.target.value; rodada.maratona = { n: 0, ela: 0, ele: 0 }; guardar(); });
  $('#op-tempo').addEventListener('change', (e) => { salvo.tempo = +e.target.value; guardar(); });
  ['ela', 'ele'].forEach((q) => {
    $('#nome-' + q).addEventListener('input', (e) => { salvo.nomes[q] = e.target.value.trim(); guardar(); pintarNomes(); });
  });

  // ── repertório ──
  function itemCena(id, extra) {
    const c = PORID.get(id); if (!c) return '';
    return `<li><button data-abrir="${encodeURIComponent(id)}"><span>${c.t}</span><small>${extra || CATEGORIAS[c.c].nome}</small></button></li>`;
  }
  function pintarRepertorio() {
    const jog = new Set(salvo.hist);
    $('#lista-restam').innerHTML = Object.entries(CATEGORIAS).filter(([k, v]) => !v.dentro || catAtiva(k)).map(([k, v]) => {
      const todas = CENAS.filter((c) => c.c === k);
      const faltam = todas.filter((c) => !jog.has(idDe(c))).length;
      return `<li style="--cor:var(--p-${k})"><span class="amostra" aria-hidden="true">${iconeSVG(k)}</span><span>${v.nome}</span><b>${faltam} de ${todas.length}</b></li>`;
    }).join('');
    $('#lista-favs').innerHTML = salvo.favs.map((id) => itemCena(id)).join('') || '<li class="vazio">Toque no coração de uma cena para guardar aqui.</li>';
    const ult = salvo.hist.slice(-15).reverse();
    $('#lista-hist').innerHTML = ult.map((id) => itemCena(id, '★'.repeat(salvo.notas[id] || 0) || CATEGORIAS[PORID.get(id)?.c]?.nome)).join('') || '<li class="vazio">Nenhuma cena jogada ainda.</li>';
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-abrir]');
    if (a) { abrirCena(PORID.get(decodeURIComponent(a.dataset.abrir))); }
  });

  // ── ações ──
  const ACOES = {
    sortear: () => { rodada.pulados = []; if (salvo.modo === 'maratona' && rodada.maratona.n >= CENAS_MARATONA) rodada.maratona = { n: 0, ela: 0, ele: 0 }; abrirCena(sortear()); },
    pular: () => { rodada.pulados.push(idDe(rodada.cena)); rodada.pulados = rodada.pulados.slice(-15); abrirCena(sortear()); },
    papeis: iniciarPapeis,
    rev: reviravolta,
    pausa: () => {
      rodada.pausado = !rodada.pausado;
      $('#btn-pausa').textContent = rodada.pausado ? 'Continuar' : 'Pausar';
      $('#palco-rotulo').textContent = rodada.pausado ? 'Pausado' : 'Em cena';
    },
    encerrar,
    proxima,
    'nova-maratona': () => { rodada.maratona = { n: 0, ela: 0, ele: 0 }; rodada.pulados = []; abrirCena(sortear()); },
    zerar: () => {
      if (!confirm('Apagar o histórico de cenas jogadas, notas e favoritas?')) return;
      salvo.hist = []; salvo.notas = {}; salvo.favs = []; salvo.folheto = 0; guardar(); pintarRepertorio();
    },
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-acao]');
    if (a && ACOES[a.dataset.acao]) { ACOES[a.dataset.acao](); return; }
    const n = e.target.closest('[data-ir]');
    if (n) ir(n.dataset.ir);
  });

  // ── instalar ──
  let pedidoInstalar = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); pedidoInstalar = e; $('#btn-instalar').hidden = false; });
  $('#btn-instalar').addEventListener('click', async () => {
    if (!pedidoInstalar) return;
    pedidoInstalar.prompt();
    await pedidoInstalar.userChoice.catch(() => {});
    pedidoInstalar = null; $('#btn-instalar').hidden = true;
  });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  ir('capa');
})();
