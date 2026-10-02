(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // === Header: sfondo allo scroll + menu mobile ===
  const header = document.querySelector('.site-header');
  const onHeaderScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();

  const toggle = document.querySelector('.menu-toggle');
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? toggle.dataset.close : toggle.dataset.open);
  });
  document.querySelectorAll('.nav > a').forEach((a) => {
    a.addEventListener('click', () => document.body.classList.remove('menu-open'));
  });

  // === Reveal on scroll (blur -> nitido) ===
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  const observeReveals = (root) => root.querySelectorAll('.appear').forEach((el) => revealObserver.observe(el));
  observeReveals(document);

  // === Hero: il cavo che si aggroviglia ===
  const hero = document.querySelector('.hero');
  const heroSvg = hero.querySelector('.hero-svg');
  const heroPath = heroSvg.querySelector('path');
  const heroCaption = hero.querySelector('.hero-caption');
  let heroLen = 0;
  let heroStart = 0;
  let introDone = reduceMotion;

  function seeded(seed) {
    return function () {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  // Catmull-Rom -> cubic bezier, per una linea morbida "disegnata a mano"
  function smoothPath(pts) {
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  }

  function buildCable() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mobile = w < 720;
    heroSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const rand = seeded(7);
    const cx = w * (mobile ? 0.5 : 0.5);
    const cy = h * (mobile ? 0.36 : 0.42);
    const r = Math.min(w, h) * (mobile ? 0.3 : 0.24);

    // il cavo entra da sinistra (o dall'alto su mobile)
    const lead = mobile
      ? [[w * 0.55, -20], [w * 0.57, h * 0.06], [w * 0.52, h * 0.14]]
      : [[-20, h * 0.5], [w * 0.08, h * 0.47], [w * 0.2, h * 0.53], [w * 0.32, h * 0.64]];

    const loop = [];
    let angle = mobile ? -Math.PI / 2 : Math.PI * 0.75;
    for (let i = 0; i < 34; i++) {
      angle += 1.05 + rand() * 0.75;
      const rad = r * (0.3 + rand() * 0.75) * (i < 4 ? 1.1 : 1);
      loop.push([cx + Math.cos(angle) * rad * 1.35, cy + Math.sin(angle) * rad]);
    }

    const leadPath = smoothPath(lead.concat(loop.slice(0, 1)));
    heroPath.setAttribute('d', leadPath);
    const leadLen = heroPath.getTotalLength();

    heroPath.setAttribute('d', smoothPath(lead.concat(loop)));
    heroLen = heroPath.getTotalLength();
    heroStart = Math.min(0.6, (leadLen / heroLen) + 0.08);
    heroPath.style.strokeDasharray = heroLen;

    // la battuta compare accanto al groviglio
    if (heroCaption) {
      heroCaption.style.left = mobile ? `${w * 0.1}px` : `${Math.min(cx + r * 1.4, w - 280)}px`;
      heroCaption.style.top = mobile ? `${cy + r * 1.15}px` : `${cy + r * 0.9}px`;
    }
  }

  function heroProgress() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    return clamp(-rect.top / total, 0, 1);
  }

  function drawCable() {
    if (!introDone) return;
    const p = heroProgress();
    const drawn = reduceMotion ? 1 : heroStart + (1 - heroStart) * p;
    heroPath.style.strokeDashoffset = heroLen * (1 - drawn);
    if (heroCaption) heroCaption.classList.toggle('is-visible', drawn > 0.97);
  }

  buildCable();
  if (!reduceMotion) {
    // intro: disegna la prima parte del cavo al caricamento
    heroPath.style.strokeDashoffset = heroLen;
    heroPath.getBoundingClientRect();
    heroPath.style.transition = 'stroke-dashoffset 1800ms ease-out 300ms';
    heroPath.style.strokeDashoffset = heroLen * (1 - heroStart);
    setTimeout(() => {
      heroPath.style.transition = 'stroke-dashoffset 120ms linear';
      introDone = true;
      drawCable();
    }, 2150);
  }
  drawCable();

  // === Cosa posso offrirti: il cavo collega le illustrazioni ===
  const offer = document.querySelector('.offer-section');
  const offerSvg = offer.querySelector('.offer-line');
  const offerPath = offerSvg.querySelector('path');
  let offerLen = 0;

  function buildOffer() {
    const box = offer.getBoundingClientRect();
    const w = box.width;
    const h = box.height;
    offerSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const center = (sel) => {
      const r = offer.querySelector(sel).getBoundingClientRect();
      return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2, r.width / 2];
    };
    const [x1, y1, r1] = center('.offer-1 img');
    const [x2, y2, r2] = center('.offer-2 img');
    const [x3, y3, r3] = center('.offer-3 img');

    let pts;
    if (w < 960) {
      // mobile: il cavo scende a zig-zag tra le illustrazioni
      pts = [[w * 0.5, -20], [x1 - r1 * 1.4, y1 - r1 * 1.6], [x1, y1], [x1 + r1 * 1.2, (y1 + y2) / 2],
        [x2, y2], [x2 - r2 * 1.4, (y2 + y3) / 2], [x3, y3], [x3 + r3 * 0.6, h + 20]];
    } else {
      pts = [[-20, y2 - r2 * 2.2], [x2 - r2 * 2.4, y2 + r2 * 0.6], [x2, y2],
        [(x2 + x1) / 2 - r1, (y2 + y1) / 2], [x1 - r1 * 0.4, y1 + r1 * 0.2], [x1, y1],
        [x1 + r1 * 1.4, y1 + r1 * 2.2], [x3 - r3 * 1.6, y3 - r3 * 0.2], [x3, y3],
        [x3 + r3 * 1.8, y3 + r3 * 1.6], [w + 20, y3 + r3 * 0.6]];
    }
    offerPath.setAttribute('d', smoothPath(pts));
    offerLen = offerPath.getTotalLength();
    offerPath.style.strokeDasharray = offerLen;
  }

  function drawOffer() {
    const rect = offer.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = reduceMotion ? 1 : clamp((vh * 0.85 - rect.top) / (rect.height * 0.85), 0, 1);
    offerPath.style.strokeDashoffset = offerLen * (1 - p);
  }

  buildOffer();
  drawOffer();
  window.addEventListener('load', () => { buildOffer(); drawOffer(); });

  // === Loop di scroll ===
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      drawCable();
      drawOffer();
      ticking = false;
    });
  }, { passive: true });

  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    // su mobile la barra dell'indirizzo cambia l'altezza: rigenera solo se cambia la larghezza
    if (window.innerWidth === lastWidth && window.innerWidth < 720) return;
    lastWidth = window.innerWidth;
    buildCable();
    heroPath.style.transition = 'none';
    drawCable();
    buildOffer();
    drawOffer();
  });

  // === Lavori: modale dettaglio ===
  const modal = document.getElementById('workModal');
  document.querySelectorAll('.work-card').forEach((card) => {
    card.addEventListener('click', () => {
      const d = card.dataset;
      modal.querySelector('.modal-img img').src = d.image;
      modal.querySelector('.modal-img img').alt = d.title;
      modal.querySelector('h3').textContent = d.title;
      modal.querySelector('.desc').textContent = d.description;
      modal.querySelector('[data-field="client"]').textContent = d.client;
      modal.querySelector('[data-field="completed"]').textContent = d.completed;
      modal.querySelector('[data-field="skills"]').textContent = d.skills;
      const link = modal.querySelector('.modal-link');
      if (d.projectLink) {
        link.href = d.projectLink;
        link.hidden = false;
      } else {
        link.hidden = true;
      }
      modal.showModal();
    });
  });
  modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  // === Testimonianze: frecce ===
  // === Frecce per i caroselli (testimonianze, percorso) ===
  document.querySelectorAll('[data-scroll-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const scroller = document.querySelector(btn.dataset.scrollTarget);
      const item = scroller.firstElementChild;
      const step = item ? item.offsetWidth + 24 : 400;
      scroller.scrollBy({ left: step * Number(btn.dataset.dir), behavior: 'smooth' });
    });
  });

  // === Blog ===
  const postsList = document.getElementById('blog-articles');
  const locale = document.documentElement.lang || 'it';
  fetch('/assets/blog/posts.json', { cache: 'no-store' })
    .then((res) => res.json())
    .then((articles) => {
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));
      articles.forEach((article) => {
        const a = document.createElement('a');
        a.className = 'post appear';
        a.href = article.link;
        a.target = '_blank';
        a.rel = 'noopener';

        const date = document.createElement('span');
        date.className = 'date';
        date.textContent = new Date(article.date).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });

        const body = document.createElement('div');
        body.className = 'body';
        const title = document.createElement('h3');
        title.textContent = article.title;
        const desc = document.createElement('p');
        desc.textContent = article.description;
        body.append(title, desc);

        const thumb = document.createElement('div');
        thumb.className = 'thumb';
        const img = document.createElement('img');
        img.src = article.image;
        img.alt = '';
        img.loading = 'lazy';
        thumb.append(img);

        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.textContent = '→';

        a.append(date, body, thumb, arrow);
        postsList.append(a);
      });
      observeReveals(postsList);
    })
    .catch((error) => console.error('Error loading blog posts:', error));

  // === Pacchetti sviluppo: prezzi e link Stripe ===
  const pricingConfig = window.softwareDevelopmentPricing || {};
  document.querySelectorAll('[data-software-dev-price]').forEach((node) => {
    const plan = pricingConfig[node.getAttribute('data-software-dev-price')];
    if (plan && typeof plan.price === 'number') {
      node.textContent = `€${plan.price.toLocaleString('en-US')}`;
    }
  });
  document.querySelectorAll('[data-software-dev-checkout]').forEach((node) => {
    const plan = pricingConfig[node.getAttribute('data-software-dev-checkout')];
    if (plan && typeof plan.stripeLink === 'string' && plan.stripeLink.startsWith('https://')) {
      node.setAttribute('href', plan.stripeLink);
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    } else {
      node.setAttribute('href', '#contatti');
    }
  });

  // === Mailto offuscato ===
  document.querySelectorAll('.js-mailto').forEach((el) => {
    const user = el.dataset.u || '';
    const domain = el.dataset.d || '';
    if (!user || !domain) return;
    const params = [];
    if (el.dataset.subject) params.push(`subject=${encodeURIComponent(el.dataset.subject)}`);
    if (el.dataset.body) params.push(`body=${encodeURIComponent(el.dataset.body)}`);
    el.setAttribute('href', `mailto:${user}@${domain}${params.length ? '?' + params.join('&') : ''}`);
  });
})();
