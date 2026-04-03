let map = null;
let currentLocation = null;
let userMarker = null;
let siteMarkers = [];
let allSites = [...SITES];
let allTreks = [...TREKS];
let filteredSites = allSites;
let selectedSite = null;

function initializeMap() {
  if (map) return;
  map = new maplibregl.Map({
    container: 'mainMap',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [72.5700, 23.0700],
    zoom: 11
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.on('load', () => {
    console.log('✓ Map loaded');
    startGPS();
    renderAllMarkers();
  });
}

function startGPS() {
  if (!navigator.geolocation) return;

  navigator.geolocation.watchPosition((position) => {
    const { latitude, longitude, accuracy } = position.coords;
    currentLocation = { lat: latitude, lng: longitude, accuracy };

    document.getElementById('gpsCardTitle').textContent = 'GPS Signal Acquired';
    document.getElementById('gpsCardCoords').textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    document.getElementById('gpsAccuracy').textContent = `±${accuracy.toFixed(0)}m`;
    document.getElementById('gpsLabel').textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    if (userMarker) {
      userMarker.setLngLat([longitude, latitude]);
    } else {
      const el = document.createElement('div');
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.background = '#1D9E75';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      userMarker = new maplibregl.Marker({ element: el }).setLngLat([longitude, latitude]).addTo(map);
    }
  }, (error) => console.error(error), { enableHighAccuracy: true });
}

function renderAllMarkers() {
  filteredSites.forEach(site => addSiteMarker(site));
}

function addSiteMarker(site) {
  if (!map) return;
  const color = { heritage: '#d97706', temple: '#ec4899', nature: '#1D9E75', trek: '#2563eb' }[site.type] || '#1D9E75';
  
  const el = document.createElement('div');
  el.style.cursor = 'pointer';
  el.innerHTML = `<div style="width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(0,0,0,0.25); border: 2px solid white; font-size: 18px;"><div style="transform: rotate(45deg);">${site.emoji}</div></div>`;
  
  el.addEventListener('click', () => {
    selectedSite = site;
    showSitePanel(site);
  });

  new maplibregl.Marker({ element: el }).setLngLat([site.lng, site.lat]).addTo(map);
}

function showSitePanel(site) {
  const panel = document.getElementById('sitePanel');
  document.getElementById('sitePanelImg').innerHTML = `<div style="font-size: 80px;">${site.emoji}</div>`;
  document.getElementById('sitePanelName').textContent = site.name;
  document.getElementById('sitePanelLocation').textContent = `📍 ${site.address}`;
  document.getElementById('sitePanelDesc').textContent = site.desc;
  const stars = '★'.repeat(Math.floor(site.rating)) + '☆'.repeat(5 - Math.floor(site.rating));
  document.getElementById('sitePanelStars').textContent = stars;
  document.getElementById('sitePanelRatings').textContent = `${site.rating} (${site.reviews})`;
  panel.style.display = 'block';
}

function closePanel() {
  document.getElementById('sitePanel').style.display = 'none';
}

function navigateToSite() {
  if (!selectedSite || !currentLocation) return;
  const url = `https://maps.google.com/?saddr=${currentLocation.lat},${currentLocation.lng}&daddr=${selectedSite.lat},${selectedSite.lng}`;
  window.open(url, '_blank');
}

function openSiteDetail() {
  if (!selectedSite) return;
  const modal = document.getElementById('siteModal');
  document.getElementById('modalImg').innerHTML = `<div style="font-size: 120px;">${selectedSite.emoji}</div>`;
  document.getElementById('modalTitle').textContent = selectedSite.name;
  document.getElementById('modalLocation').textContent = selectedSite.address;
  document.getElementById('tabInfo').innerHTML = `<p>${selectedSite.desc}</p><p><strong>Timings:</strong> ${selectedSite.timings}</p>`;
  modal.style.display = 'flex';
}

function closeSiteModal(event) {
  if (event && event.target.id !== 'siteModal') return;
  document.getElementById('siteModal').style.display = 'none';
}

function filterByType(type, element) {
  filteredSites = type === 'all' ? allSites : allSites.filter(s => s.type === type);
  document.querySelectorAll('.fpill').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  siteMarkers.forEach(({ marker }) => marker.remove());
  siteMarkers = [];
  renderAllMarkers();
}

function filterSites(query) {
  const q = query.toLowerCase();
  filteredSites = allSites.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
  siteMarkers.forEach(({ marker }) => marker.remove());
  siteMarkers = [];
  renderAllMarkers();
}

function centerOnUser() {
  if (!currentLocation || !map) return;
  map.flyTo({ center: [currentLocation.lng, currentLocation.lat], zoom: 15, duration: 1500 });
  showToast('Centered on your location', 'green');
}

function setMapStyle(style, element) {
  if (map) map.setStyle('https://demotiles.maplibre.org/style.json');
  document.querySelectorAll('.mmode').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
}

function show3DBuildings() {
  if (!map) return;
  const btn = document.getElementById('btn3d');
  if (btn.style.background !== 'rgb(29, 158, 117)') {
    map.setPitch(45);
    btn.style.background = '#1D9E75';
    btn.style.color = 'white';
  } else {
    map.setPitch(0);
    btn.style.background = 'white';
  }
}

function renderSitesGrid() {
  const grid = document.getElementById('sitesGrid');
  grid.innerHTML = '';
  allSites.forEach(site => {
    const card = document.createElement('div');
    card.className = 'site-card';
    const stars = '★'.repeat(Math.floor(site.rating)) + '☆'.repeat(5 - Math.floor(site.rating));
    card.innerHTML = `
      <div style="font-size: 60px; margin-bottom: 10px;">${site.emoji}</div>
      <div class="sc-name">${site.name}</div>
      <div class="sc-loc">📍 ${site.city}</div>
      <div>${stars} ${site.rating}</div>
      <div class="sc-desc">${site.desc}</div>
      <button class="sc-btn" onclick="navigateCardSite('${site.id}')">Navigate</button>
    `;
    grid.appendChild(card);
  });
}

function navigateCardSite(siteId) {
  selectedSite = allSites.find(s => s.id === siteId);
  navigateToSite();
}

function renderTreksGrid() {
  const grid = document.getElementById('treksGrid');
  grid.innerHTML = '';
  allTreks.forEach(trek => {
    const card = document.createElement('div');
    card.className = 'trek-card';
    card.innerHTML = `
      <div class="trek-name">${trek.emoji} ${trek.name}</div>
      <div>📍 ${trek.area}</div>
      <div>${trek.distance} • ${trek.duration} • ${trek.difficulty}</div>
      <div class="sc-desc">${trek.desc}</div>
    `;
    grid.appendChild(card);
  });
}

function triggerSOS() {
  if (!currentLocation) {
    showToast('Waiting for GPS...', 'red');
    return;
  }
  const { lat, lng, accuracy } = currentLocation;
  const msg = `🆘 SOS: ${lat.toFixed(6)}, ${lng.toFixed(6)} ±${accuracy.toFixed(0)}m https://maps.google.com/?q=${lat},${lng}`;
  console.log(msg);
  showToast('🆘 SOS Sent!', 'green');
}

function addPoints(points, action) {
  const el = document.getElementById('totalPoints');
  const current = parseInt(el.textContent.replace(/,/g, '')) || 0;
  el.textContent = (current + points).toLocaleString();
  showToast(`+${points} pts: ${action}`, 'green');
}

function showSection(sectionId) {
  document.querySelectorAll('.full-section').forEach(s => s.style.display = 'none');
  const hero = document.getElementById('heroSection');
  if (hero) hero.style.display = 'none';

  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'block';
    if (sectionId === 'mapSection') {
      setTimeout(() => {
        if (!map) initializeMap();
        if (map && map.resize) map.resize();
      }, 100);
    } else if (sectionId === 'sitesSection') {
      renderSitesGrid();
    } else if (sectionId === 'trekSection') {
      renderTreksGrid();
    }
  }
  closeMobile();
}

function closeMobile() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.remove('open');
}

function showToast(message, type = 'green') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 TrailBharat ready!');
  renderSitesGrid();
  renderTreksGrid();
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', toggleMenu);
  const mainMap = document.getElementById('mainMap');
  if (mainMap) mainMap.addEventListener('click', initializeMap, { once: true });
});
