// Interactive explorer for precomputed DeFM-L/14 features (static/pca/, built by defm_pca_demo/tools/build_samples.py).
// Each sample has: rgb.jpg (optional), depth.jpg, pca.jpg (smoothly upsampled PCA) and feat.bin
// (int8, grid patches x K dims: rank-K projection of the unit-normalized features, so dot products ~ cosine).

const SPACE_URL = 'https://huggingface.co/spaces/manthanhp/DeFM-PCA';  // upload demo (Gradio, ZeroGPU)
const SPACE_EMBED = 'https://manthanhp-defm-pca.hf.space/?__theme=dark';
const BASE = 'static/pca/';

// sequential blue ramp (dark surface: low similarity recedes into the background, high is light)
const RAMP = ['#0d1b2e', '#0d366b', '#184f95', '#256abf', '#3987e5', '#6da7ec', '#9ec5f4', '#cde2fb', '#f4f8fe'];

(() => {
  const root = document.getElementById('explore');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const thumbs = $('xpThumbs'), input = $('xpInput'), pcaImg = $('xpPca'), simCanvas = $('xpSim');
  const inStage = $('xpInputStage'), featStage = $('xpFeatStage');
  const state = { samples: [], cur: null, view: 'rgb', feats: {}, query: null, pinned: false };

  const rampRGB = RAMP.map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
  const rampAt = t => {
    const x = Math.min(Math.max(t, 0), 1) * (rampRGB.length - 1), i = Math.min(Math.floor(x), rampRGB.length - 2), f = x - i;
    return rampRGB[i].map((c, k) => Math.round(c + (rampRGB[i + 1][k] - c) * f));
  };

  function describe(s) {
    const depth = s.depth === 'sensor' ? 'measured depth' : 'Depth Anything V2 depth (pseudo-metric, as in pretraining)';
    const n = s.group ? state.samples.filter(o => o.group === s.group).length : 1;
    const pca = n > 1 ? `PCA shared across the ${n} images of this series` : 'PCA per image';
    return `${s.source} · ${depth} · ${pca}${s.bg ? ' · background patches removed via the first component' : ''}`;
  }

  function drawPca(s) {
    const [gh, gw] = s.grid;
    simCanvas.width = gw;
    simCanvas.height = gh;
    pcaImg.src = `${BASE}${s.id}/pca.jpg`;
  }

  function showInput() {
    const s = state.cur;
    const view = s.rgb ? state.view : 'depth';
    input.src = `${BASE}${s.id}/${view}.jpg`;
    input.alt = `${s.title}: ${view === 'rgb' ? 'RGB image' : 'depth'}`;
    $('xpInputLabel').textContent = view === 'rgb' ? 'RGB (not used by DeFM)' : 'Depth input';
    $('xpInputToggle').querySelectorAll('button').forEach(b => {
      b.classList.toggle('is-active', b.dataset.view === view);
      b.disabled = b.dataset.view === 'rgb' && !s.rgb;
    });
  }

  async function features(s) {
    if (!state.feats[s.id]) {
      const buf = await (await fetch(`${BASE}${s.id}/feat.bin`)).arrayBuffer();
      const q = new Int8Array(buf), k = s.k, n = q.length / k, norms = new Float32Array(n);
      for (let p = 0; p < n; p++) {
        let acc = 0;
        for (let d = 0; d < k; d++) acc += q[p * k + d] * q[p * k + d];
        norms[p] = Math.sqrt(acc) || 1;
      }
      state.feats[s.id] = { q, norms, k, n };
    }
    return state.feats[s.id];
  }

  async function showSimilarity(u, v) {
    const s = state.cur;
    const [gh, gw] = s.grid;
    const i = Math.min(gh - 1, Math.floor(v * gh)), j = Math.min(gw - 1, Math.floor(u * gw));
    const f = await features(s);
    if (state.cur !== s) return;
    const qi = i * gw + j, { q, norms, k, n } = f;
    const sims = new Float32Array(n);
    let lo = Infinity, hi = -Infinity;
    for (let p = 0; p < n; p++) {
      let acc = 0;
      for (let d = 0; d < k; d++) acc += q[qi * k + d] * q[p * k + d];
      sims[p] = acc / (norms[qi] * norms[p]);
      if (p !== qi) { lo = Math.min(lo, sims[p]); hi = Math.max(hi, sims[p]); }
    }
    const ctx = simCanvas.getContext('2d'), im = ctx.createImageData(gw, gh);
    for (let p = 0; p < n; p++) {
      const c = rampAt((sims[p] - lo) / (hi - lo || 1));
      im.data.set([c[0], c[1], c[2], 255], p * 4);
    }
    ctx.putImageData(im, 0, 0);
    simCanvas.classList.remove('xp-hidden');
    pcaImg.classList.add('xp-hidden');
    $('xpLegend').classList.remove('xp-hidden');
    $('xpFeatLabel').textContent = 'Cosine similarity to the marked patch';
    [$('xpMarkerIn'), $('xpMarkerFeat')].forEach(m => {
      m.style.left = `${((j + 0.5) / gw) * 100}%`;
      m.style.top = `${((i + 0.5) / gh) * 100}%`;
      m.style.width = `${100 / gw}%`;
      m.style.height = `${100 / gh}%`;
      m.classList.add('visible');
    });
  }

  function clearSimilarity() {
    simCanvas.classList.add('xp-hidden');
    pcaImg.classList.remove('xp-hidden');
    $('xpLegend').classList.add('xp-hidden');
    $('xpFeatLabel').textContent = 'PCA of patch features';
    [$('xpMarkerIn'), $('xpMarkerFeat')].forEach(m => m.classList.remove('visible'));
    state.pinned = false;
  }

  function select(id) {
    const s = state.samples.find(o => o.id === id);
    if (!s) return;
    state.cur = s;
    clearSimilarity();
    const [h, w] = s.size;
    [inStage, featStage].forEach(st => (st.style.aspectRatio = `${w} / ${h}`));
    showInput();
    drawPca(s);
    $('xpTitle').textContent = s.title;
    $('xpMeta').textContent = describe(s);
    thumbs.querySelectorAll('.xp-thumb').forEach(t => {
      const on = t.dataset.id === id;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
    });
    features(s);  // prefetch for the first hover
  }

  function bindStage(stage) {
    const uv = e => {
      const r = stage.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
    };
    stage.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse' && !state.pinned) showSimilarity(...uv(e));
    });
    stage.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !state.pinned) clearSimilarity(); });
    stage.addEventListener('click', e => {  // click / tap pins the query patch; clicking again releases it
      if (state.pinned && e.pointerType === 'mouse') { state.pinned = false; showSimilarity(...uv(e)); return; }
      state.pinned = true;
      showSimilarity(...uv(e));
    });
  }

  function buildThumbs() {
    thumbs.innerHTML = state.samples.map(s => `
      <button class="xp-thumb" role="option" data-id="${s.id}" data-depth="${s.depth}" title="${s.title}">
        <img src="${BASE}${s.id}/${s.rgb ? 'rgb' : 'depth'}.jpg" alt="" loading="lazy">
        <img class="xp-thumb-pca" src="${BASE}${s.id}/pca.jpg" alt="" loading="lazy">
        <span>${s.title}</span>
      </button>`).join('');
    thumbs.querySelectorAll('.xp-thumb').forEach(t => t.addEventListener('click', () => select(t.dataset.id)));
  }

  function bindControls() {
    $('xpFilters').querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
      $('xpFilters').querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === chip));
      const f = chip.dataset.filter;
      thumbs.querySelectorAll('.xp-thumb').forEach(t => { t.hidden = f !== 'all' && t.dataset.depth !== f; });
    }));
    $('xpInputToggle').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      state.view = b.dataset.view;
      showInput();
    }));
    const tryOwn = $('xpTryOwn');
    if (SPACE_URL) {
      // embed the Space below the explorer; the iframe is only loaded on the first click
      const demo = $('xpDemo'), frame = $('xpDemoFrame');
      tryOwn.href = SPACE_URL;
      $('xpDemoOpen').href = SPACE_URL;
      tryOwn.addEventListener('click', e => {
        // on phones the stacked app is much taller than the frame: open the Space in a new tab instead
        if (window.matchMedia('(max-width: 720px)').matches) return;
        e.preventDefault();
        demo.hidden = !demo.hidden;
        if (!demo.hidden && !frame.src) frame.src = SPACE_EMBED;
        tryOwn.innerHTML = demo.hidden ? '<i class="fas fa-upload"></i> Try your own image'
                                       : '<i class="fas fa-times"></i> Hide upload demo';
        if (!demo.hidden) demo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    else {
      tryOwn.classList.add('is-disabled');
      tryOwn.removeAttribute('href');
      tryOwn.setAttribute('aria-disabled', 'true');
      tryOwn.innerHTML = '<i class="fas fa-upload"></i> Upload demo coming soon';
    }
  }

  fetch(`${BASE}samples.json`).then(r => r.json()).then(samples => {
    state.samples = samples;
    buildThumbs();
    bindControls();
    bindStage(inStage);
    bindStage(featStage);
    select(samples.find(s => s.id === 'anymal_ladder') ? 'anymal_ladder' : samples[0].id);
  });
})();
