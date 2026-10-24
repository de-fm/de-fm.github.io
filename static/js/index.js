// Numbers from the final T-RO version of the paper (segmentation, navigation, grasping, ladder climbing and
// inference-time tables). Classification and the zoo's linear-probe column come from the benchmark re-run with the
// public weights (github.com/leggedrobotics/defm, benchmarks/README.md); its segmentation numbers match the paper.

// ---------------------------------------------------------------- data
const SEG_DATASETS = ['ScanNet', 'SUN-RGBD', 'OFFSED', 'TartanGround', 'GraspNet-1B'];
const SEG = {
  L: {
    rows: [
      ['DeFM ViT-L/14', [38.26, 36.88, 57.15, 73.22, 27.57], true],
      ['DINOv3 ViT-L/16', [34.86, 39.23, 54.32, 68.61, 25.52]],
      ['C-RADIOv3 ViT-L/16', [31.17, 33.83, 55.40, 70.46, 24.65]],
      ['DAv2 ViT-L/14', [29.91, 32.68, 55.87, 67.25, 25.43]],
      ['DINOv2 ViT-L/14', [29.91, 32.71, 53.98, 65.88, 24.12]],
    ],
    takeaway: 'DeFM-L/14 is best on 4 of 5 datasets; DINOv3-L/16 leads on SUN-RGBD.',
  },
  S: {
    rows: [
      ['DeFM ViT-S/14', [33.79, 33.27, 58.10, 70.82, 20.53], true],
      ['DINOv3 ViT-S/16', [26.31, 26.55, 56.08, 63.59, 18.04]],
      ['DINOv2 ViT-S/14', [22.90, 23.77, 48.06, 61.83, 15.92]],
      ['DAv2 ViT-S/14', [22.28, 22.87, 47.63, 63.98, 14.22]],
      ['Theia DeiT-S/16', [19.56, 17.48, 41.56, 55.13, 11.11]],
    ],
    takeaway: 'DeFM-S/14 is best on all 5 datasets, up to +7.5 mIoU over the strongest ViT-S baseline.',
  },
  C: {
    rows: [
      ['DeFM ResNet-50 (26M)', [35.34, 32.19, 52.55, 70.89, 31.95], true],
      ['DeFM ResNet-34 (22M)', [33.87, 30.36, 52.21, 70.01, 27.86], true],
      ['DeFM ResNet-18 (12M)', [28.01, 25.97, 46.87, 65.49, 23.27], true],
      ['Utonia RE-PTv3 (137M)', [23.06, 20.70, 30.36, 59.79, 4.34]],
      ['Concerto PTv3-L (208M)', [21.52, 16.18, 32.25, 58.35, 4.44]],
    ],
    takeaway: 'Even the distilled DeFM ResNet-18 beats both point-cloud foundation models (run on unprojected depth) on every dataset.',
  },
};

const CLS_METRICS = ['Top-1 KNN', 'Top-5 KNN', 'Linear probe'];
const CLS = {
  L: {
    rows: [
      ['DeFM ViT-L/14', [64.76, 85.42, 72.76], true],
      ['DINOv3 ViT-L/16', [64.79, 84.00, 69.66]],
      ['DINOv2 ViT-L/14', [61.32, 81.51, 68.90]],
      ['C-RADIOv3 ViT-L/16', [55.87, 77.57, 63.99]],
    ],
    takeaway: 'DeFM-L/14 has the best Top-5 KNN and linear-probe accuracy; Top-1 KNN is a tie with DINOv3-L/16 (64.76 vs. 64.79).',
  },
  S: {
    rows: [
      ['DeFM ViT-S/14', [57.02, 79.37, 62.74], true],
      ['DINOv3 ViT-S/16', [49.45, 70.81, 50.95]],
      ['DINOv2 ViT-S/14', [48.10, 69.63, 54.97]],
      ['Theia DeiT-S/16', [28.82, 48.45, 33.36]],
    ],
    takeaway: 'DeFM-S/14 leads all three metrics, by 7.6 to 8.6 points over the strongest ViT-S baseline.',
  },
};

const NAV = {
  panels: ['Training', 'Industrial Hangar', 'Abandoned Cable', 'Modern City Downtown'],
  rows: [
    ['DeFM', [90.31, 92.67, 84.33, 79.00], true],
    ['VAE', [90.23, 89.67, 83.00, 73.67]],
    ['DINOv3', [83.64, 90.00, 74.67, 72.67]],
    ['ImageNet', [77.61, 50.00, 38.33, 65.00]],
  ],
};

const MANIP_PANELS = ['Training noise', 'Kinect noise'];
const MANIP = {
  frozen: {
    rows: [
      ['DeFM', [80.89, 48.60], true],
      ['VAE', [68.94, 2.19]],
      ['ImageNet', [65.76, 0.43]],
      ['DINOv3', [65.32, 20.75]],
    ],
    takeaway: 'Frozen DeFM reaches 80.9% of teacher performance vs. 68.9% for the best frozen baseline, and degrades least under unseen Kinect noise.',
  },
  ft: {
    rows: [
      ['DeFM', [89.36, 87.63], true],
      ['DINOv3', [82.43, 78.37]],
      ['VAE', [81.05, 3.79]],
      ['ImageNet', [79.50, 73.66]],
      ['Scratch', [77.74, 72.47]],
    ],
    takeaway: 'Fine-tuned DeFM is best under both noise models and barely drops under Kinect noise, while the fine-tuned VAE overfits to the training noise.',
  },
};

const LOCO = {
  panels: ['Climb success rate'],
  rows: [
    ['DeFM (frozen)', [90.14], true],
    ['VAE (frozen)', [89.75]],
    ['DINOv3 (frozen)', [89.59]],
    ['ImageNet (frozen)', [89.29]],
    ['CNN trained from scratch', [90.45]],
  ],
};

// [display name, family, params (M), linear probe (%), RTX 4090 ms, Orin ms, hub name]
const ZOO = [
  ['ViT-L/14', 'vit', '307.0', '72.76', '624.91', '72.82', 'defm_vit_l14'],
  ['ViT-S/14', 'vit', '22.1', '62.74', '63.76', '11.92', 'defm_vit_s14'],
  ['ResNet-50', 'resnet', '26.2', '62.56', '69.39', '17.79', 'defm_resnet50'],
  ['ResNet-34', 'resnet', '21.8', '54.78', '33.08', '13.54', 'defm_resnet34'],
  ['ResNet-18', 'resnet', '11.7', '51.57', '21.06', '8.67', 'defm_resnet18'],
  ['RegNetY-1.6GF', 'regnet', '12.4', '58.88', '44.25', '41.82', 'defm_regnet_y_1_6gf'],
  ['RegNetY-800MF', 'regnet', '6.3', '58.62', '25.21', '24.16', 'defm_regnet_y_800mf'],
  ['RegNetY-400MF', 'regnet', '4.1', '51.80', '17.27', '25.17', 'defm_regnet_y_400mf'],
  ['EfficientNet-B6', 'effnet', '28.98', '60.70', '150.98', '54.11', 'defm_efficientnet_b6'],
  ['EfficientNet-B4', 'effnet', '14.16', '56.24', '86.51', '39.67', 'defm_efficientnet_b4'],
  ['EfficientNet-B2', 'effnet', '4.95', '51.64', '46.12', '28.37', 'defm_efficientnet_b2'],
  ['EfficientNet-B0', 'effnet', '3.01', '47.17', '29.39', '21.04', 'defm_efficientnet_b0'],
];

// ---------------------------------------------------------------- charts
// Bar table: one row per model, one column per dataset/metric, bars on a shared zero-based axis.
// DeFM rows are emphasized, baselines stay neutral gray, and the best value per column is bold.
// round half up on the 2-decimal paper value (57.15 -> 57.2, as in Fig. 1); toFixed(1) would give 57.1
const oneDecimal = v => (Math.round(Math.round(v * 100) / 10) / 10).toFixed(1);

// On narrow screens the same data is drawn as stacked panels (one per column) instead.
function renderBars(el, columns, rows, unit) {
  el._render = () => renderBars(el, columns, rows, unit);
  const max = Math.max(...rows.flatMap(r => r[1]));
  const domain = Math.min(100, Math.ceil(max / 10) * 10);
  const narrow = columns.length > 1 && el.clientWidth < 150 + columns.length * 110;
  const cell = (name, v, c) => {
    const best = oneDecimal(v) === oneDecimal(Math.max(...rows.map(r => r[1][c])));  // ties at the shown precision are all bold
    const tip = `<strong>${name}</strong><br>${columns[c]}: ${v.toFixed(2)}${unit}`;
    return `<div class="bt-cell" data-tip="${tip.replace(/"/g, '&quot;')}">` +
      `<span class="bt-track"><span class="bar" style="width:${Math.max((v / domain) * 100, 0.8)}%"></span></span>` +
      `<span class="bt-val${best ? ' best' : ''}">${oneDecimal(v)}</span></div>`;
  };
  const label = name => `<div class="bt-label">${name}</div>`;
  let html;
  if (narrow) {
    html = columns.map((col, c) =>
      `<div class="bt bt-stacked"><div class="bt-head">${col}</div>` +
      rows.map(([name, vals, ours]) => `<div class="bt-row${ours ? ' ours' : ''}">${label(name)}${cell(name, vals[c], c)}</div>`).join('') +
      `</div>`).join('');
  } else {
    const head = `<div class="bt-head"></div>` + columns.map(c => `<div class="bt-head">${c}</div>`).join('');
    const body = rows.map(([name, vals, ours]) =>
      `<div class="bt-row${ours ? ' ours' : ''}">${label(name)}${vals.map((v, c) => cell(name, v, c)).join('')}</div>`).join('');
    html = `<div class="bt" style="--cols:${columns.length}">${head}${body}</div>`;
  }
  el.innerHTML = html +
    `<div class="bt-axis">Bars start at 0; axis maximum ${domain}${unit.trim().startsWith('%') ? '%' : ''}.</div>`;
}

function rerenderOnResize() {
  let timer, lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;  // ignore mobile URL-bar height changes
    lastWidth = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(() => document.querySelectorAll('.chart').forEach(el => el._render && el._render()), 150);
  });
}

function setupChart(id, draw, initial) {
  const el = document.getElementById(`chart-${id}`);
  const takeaway = document.getElementById(`takeaway-${id}`);
  const show = group => {
    const t = draw(el, group);
    if (takeaway && t) takeaway.textContent = t;
  };
  document.querySelectorAll(`[data-chart-switch="${id}"] .chip`).forEach(chip => {
    chip.addEventListener('click', () => {
      chip.parentElement.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === chip));
      show(chip.dataset.group);
    });
  });
  show(initial);
}

function setupCharts() {
  setupChart('seg', (el, g) => { renderBars(el, SEG_DATASETS, SEG[g].rows, ' mIoU'); return SEG[g].takeaway; }, 'L');
  setupChart('cls', (el, g) => { renderBars(el, CLS_METRICS, CLS[g].rows, '%'); return CLS[g].takeaway; }, 'L');
  setupChart('nav', el => renderBars(el, NAV.panels, NAV.rows, '% SR'));
  setupChart('manip', (el, g) => { renderBars(el, MANIP_PANELS, MANIP[g].rows, '% of teacher'); return MANIP[g].takeaway; }, 'frozen');
  setupChart('loco', el => renderBars(el, LOCO.panels, LOCO.rows, '% SR'));
  rerenderOnResize();

  // one delegated tooltip for every bar cell and the dataset mix bar
  const tip = document.getElementById('tooltip');
  document.addEventListener('mousemove', e => {
    const target = e.target.closest('[data-tip]');
    if (!target) { tip.classList.remove('visible'); return; }
    tip.innerHTML = target.dataset.tip;
    tip.classList.add('visible');
    const pad = 14, w = tip.offsetWidth, h = tip.offsetHeight;
    let x = e.clientX + pad, y = e.clientY + pad;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = e.clientY - h - pad;
    tip.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// ---------------------------------------------------------------- tabs
function setupTabs() {
  document.querySelectorAll('[data-tabs]').forEach(list => {
    const group = list.dataset.tabs;
    list.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        list.querySelectorAll('.tab').forEach(t => t.classList.toggle('is-active', t === tab));
        document.querySelectorAll(`[data-panel^="${group}:"]`).forEach(panel => {
          const active = panel.dataset.panel === `${group}:${tab.dataset.tab}`;
          panel.classList.toggle('is-active', active);
          panel.querySelectorAll('video').forEach(v => (active ? v.play().catch(() => {}) : v.pause()));
          // charts in hidden panels were laid out at width 0; redraw at the real width
          if (active) panel.querySelectorAll('.chart').forEach(el => el._render && el._render());
        });
      });
    });
  });
}

// ---------------------------------------------------------------- video player (navigation)
function setupPlayers() {
  document.querySelectorAll('[data-player]').forEach(player => {
    const video = player.querySelector('video');
    const caption = player.querySelector('.player-caption');
    player.querySelectorAll('.player-item').forEach(item => {
      item.addEventListener('click', () => {
        player.querySelectorAll('.player-item').forEach(i => i.classList.toggle('is-active', i === item));
        video.src = item.dataset.src;
        caption.textContent = item.dataset.caption;
        video.play().catch(() => {});
      });
    });
  });
}

// play videos inside tabs only while they are on screen (the teaser autoplays on its own)
function setupVideoVisibility() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting && target.offsetParent !== null) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.tab-panel video').forEach(v => observer.observe(v));
}

// ---------------------------------------------------------------- model zoo
function setupZoo() {
  const body = document.getElementById('zooBody');
  body.innerHTML = ZOO.map(([name, family, params, lin, gpu, orin, hub]) => `
    <tr data-family="${family}">
      <td><strong>DeFM ${name}</strong></td>
      <td class="num">${params}</td>
      <td class="num">${lin}</td>
      <td class="num">${gpu}</td>
      <td class="num">${orin}</td>
      <td class="hub-cell"><code class="hub">${hub}</code>
        <a class="dl" href="https://huggingface.co/leggedrobotics/defm/resolve/main/${hub}.pth" title="Download checkpoint" aria-label="Download ${hub}.pth"><i class="fas fa-download"></i></a></td>
    </tr>`).join('');
  document.querySelectorAll('#zooFilter .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#zooFilter .chip').forEach(c => c.classList.toggle('is-active', c === chip));
      const f = chip.dataset.family;
      body.querySelectorAll('tr').forEach(tr => { tr.hidden = f !== 'all' && tr.dataset.family !== f; });
    });
  });
}

// ---------------------------------------------------------------- misc UI
function setupCopy() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = document.getElementById(btn.dataset.copy).textContent;
      const label = btn.querySelector('span');
      const done = () => {
        btn.classList.add('copied');
        label.textContent = 'Copied';
        setTimeout(() => { btn.classList.remove('copied'); label.textContent = 'Copy'; }, 2000);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {});
    });
  });
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

function setupNav() {
  const nav = document.getElementById('topnav');
  const links = document.getElementById('navLinks');
  const toggle = nav.querySelector('.nav-toggle');
  const moreBtn = nav.querySelector('.more-works-btn');
  const moreMenu = document.getElementById('moreWorks');
  const toTop = document.querySelector('.to-top');

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

  moreBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = moreMenu.classList.toggle('open');
    moreBtn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', e => { if (!e.target.closest('.more-works')) moreMenu.classList.remove('open'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { moreMenu.classList.remove('open'); closeLightbox(); }
  });

  // highlight the section currently in view
  const sections = [...links.querySelectorAll('a')].map(a => document.querySelector(a.getAttribute('href')));
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
    toTop.classList.toggle('visible', window.scrollY > 600);
    let current = null;
    sections.forEach(s => { if (s && s.getBoundingClientRect().top < 120) current = s.id; });
    links.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function setupLightbox() {
  const box = document.getElementById('lightbox');
  const img = box.querySelector('img');
  document.querySelectorAll('img[data-zoom]').forEach(el => {
    el.addEventListener('click', () => {
      img.src = el.src;
      img.alt = el.alt;
      box.classList.add('open');
    });
  });
  box.addEventListener('click', closeLightbox);
}

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupTabs();
  setupCharts();
  setupPlayers();
  setupVideoVisibility();
  setupZoo();
  setupCopy();
  setupLightbox();
});
