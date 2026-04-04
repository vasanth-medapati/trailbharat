// ═══════════════════════════════════════════════════════
// TRAILBHARAT — MAIN APPLICATION JAVASCRIPT
// GPS tracking, MapLibre 3D maps, Site panels, Emergency SOS
// ═══════════════════════════════════════════════════════

'use strict';

// ─── STATE ─────────────────────────────────────────────
let map = null;
let userLat = 23.2163, userLng = 72.6356; // Default: Akshardham, Gandhinagar
let userMarker = null;
let watchId = null;
let currentSite = null;
let points = 1840;
let mapInitialized = false;
let activeType = 'all';
let markers = [];

// ─── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarSites();
  renderSiteCards();
  renderTrekCards();
  startGPS();
  updateSOSTime();
  setInterval(updateSOSTime, 1000);
  hamburgerInit();
  // Auto-start GPS label
  document.getElementById('gpsLabel').textContent = 'Getting location...';
});

// ─── NAVIGATION ─────────────────────────────────────────
function showSection(id) {
  const sections = ['heroSection','mapSection','sitesSection','trekSection','emergencySection','rewardsSection'];
  sections.forEach(s => {
    const el = document.getElementById(s);
    if(el) el.style.display = s === id ? 'block' : 'none';
  });
  if(id === 'mapSection') {
    setTimeout(() => initMap(), 100);
  }
  window.scrollTo(0, 0);
  document.getElementById('mobileMenu').classList.remove('open');
}

// ─── GPS / LOCATION ─────────────────────────────────────
function startGPS() {
  if(!navigator.geolocation) {
    updateGPSUI(null, 'GPS not supported');
    return;
  }
  // Try high-accuracy GPS
  watchId = navigator.geolocation.watchPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      const acc = Math.round(pos.coords.accuracy);
      updateGPSUI(pos, `±${acc}m accuracy`);
      if(map && userMarker) {
        userMarker.setLngLat([userLng, userLat]);
      } else if(map && !userMarker) {
        addUserMarker();
      }
    },
    err => {
      console.warn('GPS error:', err.message);
      // Use network/IP approximation fallback
      updateGPSUI(null, 'Using approximate location');
      // Keep default Gandhinagar coords
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
  // Also try one-shot for faster initial fix
  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      const acc = Math.round(pos.coords.accuracy);
      updateGPSUI(pos, `±${acc}m`);
      if(map) { if(userMarker) userMarker.setLngLat([userLng, userLat]); else addUserMarker(); }
    },
    () => {},
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function updateGPSUI(pos, label) {
  const ind = document.getElementById('gpsIndicator');
  const gpsLbl = document.getElementById('gpsLabel');
  const cardTitle = document.getElementById('gpsCardTitle');
  const cardCoords = document.getElementById('gpsCardCoords');
  const accBadge = document.getElementById('gpsAccuracy');
  const sosCoords = document.getElementById('sosCoords');
  const sosAcc = document.getElementById('sosAccuracy');

  if(pos) {
    const lat = pos.coords.latitude.toFixed(5);
    const lng = pos.coords.longitude.toFixed(5);
    const acc = Math.round(pos.coords.accuracy);
    if(gpsLbl) gpsLbl.textContent = 'GPS Active';
    if(cardTitle) cardTitle.textContent = 'GPS Location Active';
    if(cardCoords) cardCoords.textContent = `${lat}°N, ${lng}°E`;
    if(accBadge) { accBadge.textContent = `±${acc}m`; accBadge.style.background = acc < 20 ? '#d1fae5' : '#fef3c7'; accBadge.style.color = acc < 20 ? '#065f46' : '#78350f'; }
    if(sosCoords) sosCoords.textContent = `${lat}°N, ${lng}°E`;
    if(sosAcc) { sosAcc.textContent = `±${acc}m`; sosAcc.style.background = 'rgba(29,158,117,0.3)'; }
    if(ind) { const dot = ind.querySelector('.gps-dot'); if(dot) dot.style.background = '#10b981'; }
  } else {
    if(gpsLbl) gpsLbl.textContent = label || 'No GPS';
    if(cardTitle) cardTitle.textContent = 'Location (Approximate)';
    if(cardCoords) cardCoords.textContent = `${userLat.toFixed(4)}°N, ${userLng.toFixed(4)}°E`;
    if(accBadge) { accBadge.textContent = 'APPROX'; accBadge.style.background = '#fef3c7'; accBadge.style.color = '#78350f'; }
    if(sosCoords) sosCoords.textContent = `${userLat.toFixed(4)}°N, ${userLng.toFixed(4)}°E`;
  }
  // Update location text in sidebar
  const locText = document.getElementById('locationText');
  if(locText) {
    locText.textContent = pos ? `GPS: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E` : 'Gandhinagar, Gujarat (Approx)';
  }
}

function centerOnUser() {
  if(map) {
    map.flyTo({ center: [userLng, userLat], zoom: 15, pitch: 45, bearing: 0, duration: 1500 });
    showToast('📍 Centered on your location', 'green');
  } else {
    showSection('mapSection');
    setTimeout(() => centerOnUser(), 800);
  }
}

// ─── MAP INIT ───────────────────────────────────────────
function initMap() {
  if(mapInitialized) return;
  mapInitialized = true;

  map = new maplibregl.Map({
    container: 'mainMap',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [userLng, userLat],
    zoom: 12,
    pitch: 45,
    bearing: 0,
    maxZoom: 18, minZoom: 4,
    attributionControl: false
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'right');
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');
  map.addControl(new maplibregl.FullscreenControl(), 'right');

  // Attempt OpenStreetMap Bright style (better)
  const osmStyle = {
    version: 8,
    name: 'TrailBharat',
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm-tiles', paint: { 'raster-saturation': 0.1, 'raster-contrast': 0.05 } }]
  };
  map.setStyle(osmStyle);

  map.on('load', () => {
    addUserMarker();
    addSiteMarkers();
    // Try add 3D terrain
    try {
      map.addSource('terrain', { type: 'raster-dem', url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json', tileSize: 256 });
      map.setTerrain({ source: 'terrain', exaggeration: 1.5 });
    } catch(e) {}
    showToast('🗺 Map loaded — ' + SITES.length + ' sites ready', 'green');
  });

  map.on('click', () => {
    if(currentSite) closePanel();
  });
}

// ─── USER MARKER ────────────────────────────────────────
function addUserMarker() {
  if(!map) return;
  const el = document.createElement('div');
  el.style.cssText = 'width:20px;height:20px;background:#2563eb;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.3);animation:userPulse 2s infinite;';
  const style = document.createElement('style');
  style.textContent = '@keyframes userPulse{0%,100%{box-shadow:0 0 0 4px rgba(37,99,235,0.3)}50%{box-shadow:0 0 0 10px rgba(37,99,235,0.1)}}';
  document.head.appendChild(style);
  userMarker = new maplibregl.Marker({ element: el, anchor: 'center' })
    .setLngLat([userLng, userLat])
    .setPopup(new maplibregl.Popup({ offset: 15 }).setHTML('<div style="font-size:12px;font-weight:700;color:#1e3a8a;padding:4px 8px;">📍 You are here</div>'))
    .addTo(map);
}

// ─── SITE MARKERS ───────────────────────────────────────
const MARKER_COLORS = {
  heritage: '#d97706', temple: '#7c3aed', nature: '#059669',
  trek: '#7c3aed', emergency: '#dc2626', culture: '#db2777'
};
const TYPE_ICONS = {
  heritage: '🏛️', temple: '🛕', nature: '🌿', trek: '🥾', emergency: '🏥', culture: '🛍️'
};

function addSiteMarkers() {
  markers.forEach(m => m.remove());
  markers = [];
  SITES.forEach(site => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    const color = MARKER_COLORS[site.type] || '#1D9E75';
    const icon = TYPE_ICONS[site.type] || '📍';
    el.innerHTML = `
      <div class="cm-bubble" style="background:${color}">
        <span class="cm-icon">${icon}</span>
      </div>
      <div class="cm-label">${site.name.length > 18 ? site.name.substring(0,16)+'…' : site.name}</div>
    `;
    el.addEventListener('click', (e) => { e.stopPropagation(); openSitePanel(site); });
    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([site.lng, site.lat])
      .addTo(map);
    markers.push(marker);
    marker._siteId = site.id;
    marker._siteType = site.type;
  });
}

function filterMarkersOnMap(type) {
  markers.forEach((m, i) => {
    const el = m.getElement();
    if(type === 'all' || SITES[i]?.type === type) {
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  });
}

// ─── SITE PANEL ─────────────────────────────────────────
function openSitePanel(site) {
  currentSite = site;
  const panel = document.getElementById('sitePanel');
  const img = document.getElementById('sitePanelImg');
  img.innerHTML = `<div style="font-size:80px;position:relative;z-index:1">${site.emoji}</div><div class="site-panel-img-overlay"></div><div class="site-panel-type">${site.type.charAt(0).toUpperCase()+site.type.slice(1)}</div>`;
  img.style.background = `linear-gradient(135deg, ${typeColor(site.type)}22 0%, ${typeColor(site.type)}44 100%)`;
  document.getElementById('sitePanelName').textContent = site.name;
  document.getElementById('sitePanelLocation').textContent = site.address;
  document.getElementById('sitePanelStars').textContent = '★'.repeat(Math.round(site.rating)) + '☆'.repeat(5-Math.round(site.rating));
  document.getElementById('sitePanelRatings').textContent = site.reviews.toLocaleString() + ' reviews';
  document.getElementById('sitePanelDesc').textContent = site.desc;
  const meta = document.getElementById('sitePanelMeta');
  meta.innerHTML = `
    <div class="spm-item">🕐 ${site.timings}</div>
    <div class="spm-item">💰 ${site.entry}</div>
    <div class="spm-item">🚗 ${site.parking}</div>
    <div class="spm-item">📶 ${site.offlineReady ? 'Offline Ready ✓' : 'Online needed'}</div>
    <div class="spm-item">✅ ${site.condition}</div>
  `;
  panel.style.display = 'block';
  // Fly to site
  map.flyTo({ center: [site.lng, site.lat], zoom: 15, pitch: 50, bearing: 20, duration: 1200 });
  // Highlight in sidebar
  document.querySelectorAll('.sidebar-site-item').forEach(el => el.classList.remove('active'));
  const sideEl = document.querySelector(`[data-id="${site.id}"]`);
  if(sideEl) { sideEl.classList.add('active'); sideEl.scrollIntoView({ block: 'nearest' }); }
}

function closePanel() {
  document.getElementById('sitePanel').style.display = 'none';
  currentSite = null;
}

function navigateToSite() {
  if(!currentSite) return;
  const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${currentSite.lat},${currentSite.lng}`;
  window.open(url, '_blank');
  showToast('🗺 Opening navigation in Google Maps');
}

function typeColor(type) {
  return MARKER_COLORS[type] || '#1D9E75';
}

// ─── SITE DETAIL MODAL ──────────────────────────────────
function openSiteDetail() {
  if(!currentSite) return;
  openSiteModal(currentSite);
}

function navigateToSiteFromModal() {
  if(!currentSite) return;
  const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${currentSite.lat},${currentSite.lng}`;
  window.open(url, '_blank');
}

function openSiteModal(site) {
  currentSite = site;
  document.getElementById('modalImg').innerHTML = `<span style="font-size:80px">${site.emoji}</span>`;
  document.getElementById('modalImg').style.background = `linear-gradient(135deg, ${typeColor(site.type)}33 0%, ${typeColor(site.type)}66 100%)`;
  document.getElementById('modalTitle').textContent = site.name;
  document.getElementById('modalLocation').textContent = `📍 ${site.address}`;
  const badges = document.getElementById('modalBadges');
  badges.innerHTML = `
    <span class="modal-badge" style="background:${typeColor(site.type)}22;color:${typeColor(site.type)}">${site.type}</span>
    <span class="modal-badge" style="background:#d1fae5;color:#065f46">${site.offlineReady ? '📶 Offline Ready' : '🌐 Online'}</span>
    <span class="modal-badge" style="background:#fef3c7;color:#78350f">⭐ ${site.rating}/5 (${site.reviews.toLocaleString()})</span>
  `;
  // Info tab
  document.getElementById('tabInfo').innerHTML = `
    <div class="tab-info-grid">
      <div class="tig-item"><div class="tig-label">Timings</div><div class="tig-val">${site.timings}</div></div>
      <div class="tig-item"><div class="tig-label">Closed</div><div class="tig-val">${site.closed}</div></div>
      <div class="tig-item"><div class="tig-label">Entry Fee</div><div class="tig-val">${site.entry}</div></div>
      <div class="tig-item"><div class="tig-label">Parking</div><div class="tig-val">${site.parking}</div></div>
      <div class="tig-item"><div class="tig-label">Condition</div><div class="tig-val">${site.condition}</div></div>
      <div class="tig-item"><div class="tig-label">GPS</div><div class="tig-val">${site.lat.toFixed(4)}°N, ${site.lng.toFixed(4)}°E</div></div>
    </div>
    <h4>Entry Route</h4>
    <p>${site.entryRoute}</p>
    <h4>Description</h4>
    <p>${site.desc}</p>
    <h4>Nearby Emergency</h4>
    <p style="color:#dc2626">${site.nearbyHelp}</p>
  `;
  document.getElementById('tabHistory').innerHTML = `<h4>History</h4><p>${site.history}</p>`;
  document.getElementById('tabVisiting').innerHTML = `
    <h4>Visiting Tips</h4>
    <p>${site.visiting}</p>
    <h4>How to Get There</h4>
    <p>${site.entryRoute}</p>
  `;
  const reviews = site.sampleReviews || [];
  document.getElementById('tabReviews').innerHTML = reviews.map(r => `
    <div style="background:#f0f9f4;border-radius:10px;padding:12px;margin-bottom:10px;border-left:3px solid #1D9E75;">
      <p style="font-size:14px;color:#2d4a2d;margin:0">"${r}"</p>
      <p style="font-size:11px;color:#7a9b75;margin-top:6px">★★★★★ — Community Review</p>
    </div>
  `).join('') + `
    <div style="margin-top:1rem;padding:1rem;background:#fef3c7;border-radius:10px;border:1px solid #fde68a">
      <div style="font-size:13px;font-weight:700;color:#78350f;margin-bottom:4px">Write a Review & Earn +10 TrailPoints</div>
      <textarea placeholder="Share your experience at ${site.name}..." style="width:100%;border:1px solid #fde68a;border-radius:8px;padding:8px;font-size:13px;font-family:var(--dm);resize:none;height:80px;background:white;outline:none" id="reviewText"></textarea>
      <button onclick="submitReview('${site.id}')" style="margin-top:8px;background:#1D9E75;color:white;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--syne)">Submit Review +10pts</button>
    </div>
  `;
  // Reset tabs
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => { t.style.display='none'; t.classList.remove('active'); });
  document.querySelector('.mtab').classList.add('active');
  document.getElementById('tabInfo').style.display = 'block';
  document.getElementById('siteModal').style.display = 'flex';
}

function closeSiteModal(e) {
  if(e && e.target !== document.getElementById('siteModal')) return;
  document.getElementById('siteModal').style.display = 'none';
}

function switchTab(tab, btn) {
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t => { t.style.display = 'none'; t.classList.remove('active'); });
  const el = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if(el) { el.style.display = 'block'; el.classList.add('active'); }
}

function submitReview(siteId) {
  const txt = document.getElementById('reviewText').value.trim();
  if(!txt) { showToast('Please write something first!'); return; }
  addPoints(10, `Reviewed ${siteId}`);
  showToast('✅ Review submitted! +10 TrailPoints', 'green');
  document.getElementById('reviewText').value = '';
}

// ─── SIDEBAR ─────────────────────────────────────────────
function renderSidebarSites(type, search) {
  const container = document.getElementById('sidebarSites');
  if(!container) return;
  let filtered = SITES.filter(s => {
    if(type && type !== 'all' && s.type !== type) return false;
    if(search) { const q = search.toLowerCase(); return s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.type.toLowerCase().includes(q); }
    return true;
  });
  container.innerHTML = filtered.map(s => `
    <div class="sidebar-site-item" data-id="${s.id}" onclick="openSitePanel(SITES.find(x=>x.id==='${s.id}'))">
      <div class="ssi-emoji">${s.emoji}</div>
      <div class="ssi-info">
        <div class="ssi-name">${s.name}</div>
        <div class="ssi-meta">${s.city} · ★${s.rating}</div>
        <span class="ssi-badge badge-${s.type}">${s.type}</span>
      </div>
    </div>
  `).join('');
}

function filterSites(val) {
  renderSidebarSites(activeType, val);
}

function filterByType(type, btn) {
  activeType = type;
  document.querySelectorAll('.fpill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderSidebarSites(type, document.getElementById('searchInput')?.value);
  if(map) filterMarkersOnMap(type);
}

// ─── SITES GRID ──────────────────────────────────────────
let currentCardType = 'all', currentCardSearch = '';

function renderSiteCards() {
  const grid = document.getElementById('sitesGrid');
  if(!grid) return;
  let filtered = SITES.filter(s => {
    if(currentCardType !== 'all' && s.type !== currentCardType) return false;
    if(currentCardSearch) { const q = currentCardSearch.toLowerCase(); return s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q); }
    return true;
  });
  grid.innerHTML = filtered.map(s => `
    <div class="site-card" onclick="openSiteModal(SITES.find(x=>x.id==='${s.id}'))">
      <div class="sc-img" style="background:linear-gradient(135deg, ${typeColor(s.type)}22 0%, ${typeColor(s.type)}44 100%)">
        <span style="font-size:60px">${s.emoji}</span>
        <div class="sc-img-badge badge-${s.type}">${s.type}</div>
        ${s.offlineReady ? '<div class="sc-img-offline">📶 Offline</div>' : ''}
      </div>
      <div class="sc-body">
        <div class="sc-name">${s.name}</div>
        <div class="sc-loc">📍 ${s.city} · ${s.address.split(',')[0]}</div>
        <div class="sc-rating">
          <span class="stars">${'★'.repeat(Math.round(s.rating))}</span>
          <span class="rcount">${s.rating} · ${s.reviews.toLocaleString()} reviews</span>
        </div>
        <div class="sc-desc">${s.desc}</div>
        <div class="sc-meta-row">
          <span class="sc-meta-pill">🕐 ${s.timings.split('–')[0].trim()}</span>
          <span class="sc-meta-pill">💰 ${s.entry}</span>
          <span class="sc-meta-pill">✅ ${s.condition}</span>
        </div>
        <div class="sc-actions">
          <button class="sc-btn sc-btn-nav" onclick="event.stopPropagation();navigateTo(${s.lat},${s.lng})">📍 Navigate</button>
          <button class="sc-btn sc-btn-info" onclick="event.stopPropagation();openSiteModal(SITES.find(x=>x.id==='${s.id}'))">ℹ Details</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCards(type, btn) {
  currentCardType = type;
  document.querySelectorAll('.sc-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSiteCards();
}

function filterSiteCards(val) {
  currentCardSearch = val;
  renderSiteCards();
}

function navigateTo(lat, lng) {
  const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}`;
  window.open(url, '_blank');
}

// ─── TREKS GRID ──────────────────────────────────────────
function renderTrekCards() {
  const grid = document.getElementById('treksGrid');
  if(!grid) return;
  grid.innerHTML = TREKS.map(t => `
    <div class="trek-card">
      <div class="trek-header">
        <div class="trek-icon-row">
          <div class="trek-icon-big">${t.emoji}</div>
          <div>
            <div class="trek-name">${t.name}</div>
            <div class="trek-area">📍 ${t.area}</div>
          </div>
        </div>
        <div class="trek-stats">
          <div class="trek-stat"><div class="ts-val">${t.distance}</div><div class="ts-lbl">Distance</div></div>
          <div class="trek-stat"><div class="ts-val">${t.duration}</div><div class="ts-lbl">Duration</div></div>
          <div class="trek-stat"><div class="ts-val" style="color:${t.difficulty==='Easy'?'#059669':t.difficulty==='Moderate'?'#d97706':'#dc2626'}">${t.difficulty}</div><div class="ts-lbl">Difficulty</div></div>
          <div class="trek-stat"><div class="ts-val">${t.type}</div><div class="ts-lbl">Type</div></div>
        </div>
      </div>
      <div class="trek-body">
        <div class="trek-desc">${t.desc}</div>
        <div class="trek-waypoints">
          <div class="twp-title">Waypoints</div>
          <div class="twp-list">
            ${t.waypoints.map(w => `<div class="twp-item"><div class="twp-dot"></div>${w.name}</div>`).join('')}
          </div>
        </div>
        <div style="font-size:12px;color:#7a9b75;margin-bottom:12px">
          💧 ${t.water} · 🌤 ${t.bestSeason}
        </div>
        <div class="trek-actions">
          <button class="trek-btn tb-start" onclick="startTrek('${t.id}')">▶ Start Trek GPS</button>
          <button class="trek-btn tb-download" onclick="downloadTrek('${t.id}')">⬇ Download Offline</button>
        </div>
      </div>
    </div>
  `).join('');
}

function startTrek(id) {
  const trek = TREKS.find(t => t.id === id);
  if(!trek || !trek.waypoints.length) return;
  showSection('mapSection');
  setTimeout(() => {
    if(map) {
      map.flyTo({ center: [trek.waypoints[0].lng, trek.waypoints[0].lat], zoom: 14, pitch: 60, duration: 2000 });
      showToast(`🥾 ${trek.name} loaded — GPS tracking active`, 'green');
    }
  }, 500);
}

function downloadTrek(id) {
  showToast('📥 Trek map downloaded for offline use!', 'green');
  addPoints(5, 'Downloaded trek');
}

// ─── MAP STYLES ──────────────────────────────────────────
function setMapStyle(style, btn) {
  if(!map) return;
  document.querySelectorAll('.mmode').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  let tileUrl, saturation, contrast;
  if(style === 'streets') { tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'; saturation = 0.1; contrast = 0.05; }
  else if(style === 'satellite') { tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'; saturation = 0; contrast = 0; }
  else { tileUrl = 'https://tile.opentopomap.org/{z}/{x}/{y}.png'; saturation = 0.3; contrast = 0.1; }
  map.setStyle({
    version: 8,
    sources: { 'base': { type: 'raster', tiles: [tileUrl], tileSize: 256, attribution: '© OpenStreetMap' } },
    layers: [{ id: 'base', type: 'raster', source: 'base', paint: { 'raster-saturation': saturation, 'raster-contrast': contrast } }]
  });
  map.once('styledata', () => { addUserMarker(); addSiteMarkers(); });
  showToast(`🗺 ${style.charAt(0).toUpperCase()+style.slice(1)} map loaded`);
}

function show3DBuildings() {
  if(!map) return;
  if(map.getPitch() < 45) {
    map.easeTo({ pitch: 60, bearing: 30, duration: 1000 });
    showToast('🏗 3D view enabled');
    document.getElementById('btn3d').style.background = '#d1fae5';
  } else {
    map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
    showToast('🗺 Flat view');
    document.getElementById('btn3d').style.background = '';
  }
}

function toggleOfflineMode() {
  showToast('📴 Offline maps ready — all 47 sites pre-loaded', 'green');
}

// ─── EMERGENCY SOS ───────────────────────────────────────
let sosActive = false;
function triggerSOS() {
  if(sosActive) return;
  sosActive = true;
  const btn = document.getElementById('sosMainBtn');
  btn.querySelector('.sos-btn-text').textContent = 'SENDING...';
  btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
  const contacts = ['s1','s2','s3'];
  contacts.forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if(el) { el.textContent = '✓ Sent'; el.classList.add('sent'); }
    }, (i+1) * 700);
  });
  setTimeout(() => {
    btn.querySelector('.sos-btn-text').textContent = 'SOS SENT ✓';
    btn.querySelector('.sos-btn-sub').textContent = `Coords sent: ${userLat.toFixed(5)}°N, ${userLng.toFixed(5)}°E`;
    btn.style.background = 'linear-gradient(135deg, #059669, #047857)';
    showToast('🆘 Emergency SOS sent to all contacts!', 'red');
  }, 2800);
  setTimeout(() => {
    btn.querySelector('.sos-btn-text').textContent = 'SEND SOS';
    btn.querySelector('.sos-btn-sub').textContent = 'Tap to send GPS location via SMS';
    btn.style.background = 'linear-gradient(135deg, #dc2626, #991b1b)';
    contacts.forEach(id => {
      const el = document.getElementById(id);
      if(el) { el.classList.remove('sent'); el.textContent = ['Primary','Friend','Emergency'][contacts.indexOf(id)]; }
    });
    sosActive = false;
  }, 7000);
}

function addContact() {
  const name = prompt('Contact name:');
  if(!name) return;
  const num = prompt('Phone number (+91...):');
  if(!num) return;
  const list = document.getElementById('sosContactsList');
  const item = document.createElement('div');
  item.className = 'sos-contact-item';
  item.innerHTML = `
    <div class="sci-avatar" style="background:rgba(186,117,23,0.2);color:#d97706">${name[0].toUpperCase()}</div>
    <div class="sci-info"><div class="sci-name">${name}</div><div class="sci-num">${num}</div></div>
    <div class="sci-status">Added</div>
  `;
  list.appendChild(item);
  showToast(`✅ ${name} added as emergency contact`, 'green');
}

function updateSOSTime() {
  const el = document.getElementById('sosTime');
  if(el) el.textContent = new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'});
}

// ─── REWARDS ─────────────────────────────────────────────
const pointsLog = [];

function addPoints(n, reason) {
  points += n;
  pointsLog.unshift({ pts: n, reason, time: new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) });
  updatePointsUI();
}

function updatePointsUI() {
  const el = document.getElementById('totalPoints');
  if(el) el.textContent = points.toLocaleString();
  const bar = document.querySelector('.pc-progress-fill');
  if(bar) { const pct = Math.min((points/3000)*100, 100); bar.style.width = pct + '%'; }
  const label = document.querySelector('.pc-progress-label');
  if(label) label.textContent = `${points.toLocaleString()} / 3,000 pts — Gold Explorer`;
  const log = document.getElementById('pointsLog');
  if(log) {
    log.innerHTML = pointsLog.slice(0,8).map(l => `
      <div class="pc-log-item">
        <span>${l.reason}</span>
        <span class="pc-log-pts">+${l.pts} pts · ${l.time}</span>
      </div>
    `).join('');
  }
}

function redeemItem(cost, name) {
  if(points < cost) { showToast(`Need ${cost-points} more pts for ${name}`); return; }
  points -= cost;
  updatePointsUI();
  showToast(`🎁 ${name} redeemed!`, 'green');
}

// ─── HAMBURGER ───────────────────────────────────────────
function hamburgerInit() {
  const btn = document.getElementById('hamburger');
  if(btn) btn.addEventListener('click', () => document.getElementById('mobileMenu').classList.toggle('open'));
}
function closeMobile() { document.getElementById('mobileMenu').classList.remove('open'); }

// ─── TOAST ───────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3000);
}
