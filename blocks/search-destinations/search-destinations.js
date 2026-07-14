// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Alaska',
    description: "Cruise past glaciers, wildlife and snow-capped peaks of Alaska's Inside Passage and Gulf.",
    image_url: 'https://assets.princess.com/is/image/princesscruises/yakutat-bay-alaska-usa-yakutat-harbor-sunset?qlt=82&ts=1725294013006',
    category: 'Destination',
  },
  {
    name: 'Caribbean',
    description: 'Sail turquoise waters to sun-soaked islands and Princess Cays in the Caribbean.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/turtle-in-caribbean-snorkeling?qlt=82&ts=1726517619374',
    category: 'Destination',
  },
  {
    name: 'Australia & New Zealand',
    description: 'Discover the wildlife, coastlines and cities of Australia and New Zealand.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/melbourne-australia-wildlife-koala-healesville-animal-sanctuary?qlt=82&ts=1697265322714',
    category: 'Destination',
  },
  {
    name: 'Japan',
    description: 'Explore temples, culture and coastal cities on a cruise around Japan.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/sensoji-temple-asakusa-city-tokyo-japan-lady-kimono-dress?qlt=82&ts=1698797169578',
    category: 'Destination',
  },
  {
    name: 'Europe',
    description: 'Voyage to historic ports and scenic capitals across the Mediterranean and Northern Europe.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/stockholm-sweden-scenic-night-old-town-gamla-stan-architecture?qlt=82&ts=1697265584748',
    category: 'Destination',
  },
  {
    name: 'Hawaii',
    description: 'Cruise the Hawaiian Islands with waterfalls, volcanoes and tropical beaches.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/kauai-hawaii-wailua-twin-waterfalls-overlook?qlt=82&ts=1697265713818',
    category: 'Destination',
  },
  {
    name: 'World Cruise',
    description: 'Circumnavigate the globe on an epic multi-continent world cruise voyage.',
    image_url: 'https://assets.princess.com/is/image/princesscruises/panama-canal-lock-view-from-ship?qlt=82&ts=1697265855283',
    category: 'Destination',
  },
];

// Brand palette from BuildWidgetRequest — used to derive card info-strip background.
const PALETTE = ['#003595', '#ea0063', '#e60060', '#b6254f'];
const ACCENT_COLOR = '#003595';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.destinations — bare array outputSchema; key derived from actionName "search_destinations"
      items = structuredContent?.destinations || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderItems(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'search-destinations-carousel-wrap';

  const track = document.createElement('div');
  track.className = 'search-destinations-track';

  items.slice(0, 7).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'search-destinations-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'search-destinations-image';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.loading = 'lazy';
      img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }
    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'search-destinations-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'search-destinations-badge';
      badge.textContent = item.category;
      info.appendChild(badge);
    }

    const title = document.createElement('h3');
    title.className = 'search-destinations-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'search-destinations-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    const btn = document.createElement('button');
    btn.className = 'search-destinations-cta';
    btn.type = 'button';
    btn.textContent = 'View Cruises';
    btn.style.background = ACCENT_COLOR;
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Show me cruises to ${item.name}`);
      });
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `search-destinations-arrow search-destinations-arrow-${dir}`;
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    b.addEventListener('click', () => {
      const delta = dir === 'left' ? -236 : 236;
      track.scrollBy({ left: delta, behavior: 'smooth' });
    });
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        b.click();
      }
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const fade = document.createElement('div');
  fade.className = 'search-destinations-fade';
  fade.style.background = `linear-gradient(to right, transparent, ${theme?.bg ?? '#1a1a1a'}cc)`;
  wrapper.appendChild(fade);

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftArrow.style.display = atStart ? 'none' : '';
    rightArrow.style.display = atEnd ? 'none' : '';
    fade.style.display = atEnd ? 'none' : '';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
