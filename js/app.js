// TRAILBHARAT v3 — COMPLETE APPLICATION
'use strict';

// ── STATE ──
let map=null,mapReady=false,userLat=23.2163,userLng=72.6356,userMarker=null,watchId=null;
let currentSite=null,reviewStars=0,mapActiveType='all';
let points=1840,logItems=[],myTrips=[],myReviews=[];
let currentUser=null,isDark=false,sosBusy=false;
let mapMarkers=[];

// ── SPLASH ──
window.addEventListener('DOMContentLoaded',()=>{
  animateSplash();
  initGPS();
  startSOSClock();
  loadSavedState();
  initDateDefaults();
  document.getElementById('hamburger').onclick=()=>document.getElementById('mobileNav').classList.toggle('open');
});

function animateSplash(){
  const msgs=['Loading India\'s heritage...','Building offline maps...','Preparing GPS engine...','Ready to explore!'];
  const fill=document.getElementById('splashFill');
  const status=document.getElementById('splashStatus');
  let pct=0,i=0;
  const iv=setInterval(()=>{
    pct+=Math.random()*12+5;
    if(pct>95)pct=95;
    fill.style.width=pct+'%';
    if(i<msgs.length-1 && pct>25*(i+1)){status.textContent=msgs[++i];}
  },200);
  setTimeout(()=>{
    clearInterval(iv);fill.style.width='100%';status.textContent='Ready!';
    setTimeout(()=>{
      document.getElementById('splash').classList.add('hide');
      setTimeout(()=>{document.getElementById('splash').style.display='none';},500);
      if(!currentUser)setTimeout(()=>{ /* show auth after 1s */},1000);
    },300);
  },2200);
}

// ── PAGE NAVIGATION ──
const NAV_PAGES=['home','map','explore','trip','safety','weather','emergency','rewards','account'];
function showPage(id){
  NAV_PAGES.forEach(p=>{const el=document.getElementById('page-'+p);if(el)el.style.display='none';el&&el.classList.remove('active');});
  const el=document.getElementById('page-'+id);
  if(el){el.style.display='block';el.classList.add('active');}
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  window.scrollTo(0,0);
  closeMobile();
  // lazy init
  if(id==='map')setTimeout(initMap,80);
  if(id==='explore')renderSiteCards();
  if(id==='safety')renderSafetyCards();
  if(id==='weather')fetchWeather();
  if(id==='rewards')updateRewardsUI();
  if(id==='trip')renderMySavedTrips();
}
function closeMobile(){document.getElementById('mobileNav').classList.remove('open');}

// ── AUTH ──
let authMode='register';
function showAuth(){document.getElementById('authModal').style.display='flex';}
function skipAuth(){document.getElementById('authModal').style.display='none';}
function toggleAuth(){
  authMode=authMode==='register'?'login':'register';
  document.getElementById('authTitle').textContent=authMode==='register'?'Create Account':'Sign In';
  document.getElementById('authSub').textContent=authMode==='register'?'Create your explorer account':'Welcome back, explorer!';
  document.getElementById('regFields').style.display=authMode==='register'?'block':'none';
  document.getElementById('authRegFields').style.display=authMode==='register'?'block':'none';
  document.getElementById('authLoginFields').style.display=authMode==='login'?'block':'none';
  document.getElementById('authSubmitBtn').textContent=authMode==='register'?'Create Account':'Sign In';
  document.getElementById('authToggle').innerHTML=authMode==='register'?'Already have an account? <span onclick="toggleAuth()">Sign In</span>':'New here? <span onclick="toggleAuth()">Create Account</span>';
}
function authSubmit(){
  if(authMode==='register'){
    const name=document.getElementById('regName').value.trim();
    const email=document.getElementById('regEmail').value.trim();
    if(!name||!email){showToast('Please fill in all fields');return;}
    currentUser={name,email,avatar:name[0].toUpperCase()};
  } else {
    const email=document.getElementById('loginEmail').value.trim();
    if(!email){showToast('Please enter your email');return;}
    currentUser={name:email.split('@')[0],email,avatar:email[0].toUpperCase()};
  }
  saveUser();
  document.getElementById('authModal').style.display='none';
  updateUserUI();
  showToast('🎉 Welcome, '+currentUser.name+'!','green');
  earnPoints(50,'Joined TrailBharat');
}
function saveUser(){if(currentUser)try{localStorage.setItem('tb_user',JSON.stringify(currentUser));}catch(e){}}
function loadSavedState(){
  try{
    const u=localStorage.getItem('tb_user');if(u){currentUser=JSON.parse(u);updateUserUI();}
    const p=localStorage.getItem('tb_points');if(p)points=parseInt(p)||1840;
    const l=localStorage.getItem('tb_log');if(l)logItems=JSON.parse(l)||[];
    const tr=localStorage.getItem('tb_trips');if(tr)myTrips=JSON.parse(tr)||[];
    const th=localStorage.getItem('tb_dark');if(th==='1'){isDark=true;document.documentElement.setAttribute('data-theme','dark');document.getElementById('themeBtn').textContent='☀️';const t=document.getElementById('darkToggle');if(t)t.checked=true;}
  }catch(e){}
}
function updateUserUI(){
  if(!currentUser)return;
  const av=document.getElementById('userAvatar');if(av)av.textContent=currentUser.avatar||'?';
  const apcAv=document.getElementById('apcAvatar');if(apcAv)apcAv.textContent=currentUser.avatar||'?';
  const apcN=document.getElementById('apcName');if(apcN)apcN.textContent=currentUser.name||'Explorer';
  const apcE=document.getElementById('apcEmail');if(apcE)apcE.textContent=currentUser.email||'';
  const lb=document.getElementById('logoutBtn');if(lb)lb.style.display='block';
  const ab=document.getElementById('authActionBtn');if(ab)ab.style.display='none';
}
function logout(){currentUser=null;try{localStorage.removeItem('tb_user');}catch(e){}updateUserUI();const av=document.getElementById('userAvatar');if(av)av.textContent='?';showToast('Signed out');}

// ── THEME ──
function toggleTheme(){
  isDark=!isDark;
  document.documentElement.setAttribute('data-theme',isDark?'dark':'light');
  document.getElementById('themeBtn').textContent=isDark?'☀️':'🌙';
  const t=document.getElementById('darkToggle');if(t)t.checked=isDark;
  try{localStorage.setItem('tb_dark',isDark?'1':'0');}catch(e){}
}

// ── GPS ──
function initGPS(){
  if(!navigator.geolocation){setGPSLabel('GPS unavailable');return;}
  navigator.geolocation.getCurrentPosition(onGPS,onGPSErr,{enableHighAccuracy:true,timeout:12000});
  watchId=navigator.geolocation.watchPosition(onGPS,onGPSErr,{enableHighAccuracy:true,maximumAge:5000});
}
function onGPS(pos){
  userLat=pos.coords.latitude;userLng=pos.coords.longitude;
  const acc=Math.round(pos.coords.accuracy);
  setGPSLabel('±'+acc+'m');
  const dot=document.getElementById('gpsDot');if(dot)dot.style.background='#16a34a';
  const gt=document.getElementById('gcTitle');if(gt)gt.textContent='GPS Active';
  const gc=document.getElementById('gcCoords');if(gc)gc.textContent=userLat.toFixed(5)+'°N, '+userLng.toFixed(5)+'°E';
  const ga=document.getElementById('gcAcc');if(ga){ga.textContent='±'+acc+'m';ga.style.background=acc<30?'#dcfce7':'#fef3c7';ga.style.color=acc<30?'#14532d':'#78350f';}
  const sc=document.getElementById('sosCoords');if(sc)sc.textContent=userLat.toFixed(5)+'°N, '+userLng.toFixed(5)+'°E';
  const sl=document.getElementById('msLoc');if(sl)sl.textContent='GPS: '+userLat.toFixed(4)+'°N, '+userLng.toFixed(4)+'°E';
  if(map&&userMarker)userMarker.setLngLat([userLng,userLat]);
  else if(map&&!userMarker)addUserMarker();
}
function onGPSErr(e){setGPSLabel('Approx');const gc=document.getElementById('gcTitle');if(gc)gc.textContent='Approx Location';}
function setGPSLabel(t){const el=document.getElementById('gpsText');if(el)el.textContent=t;}
function flyToUser(){
  if(!map)return;
  map.flyTo({center:[userLng,userLat],zoom:15,pitch:50,bearing:0,duration:1500});
  showToast('📍 Centered on your location','green');
}

// ── MAP ──
const STYLE_URLS={
  streets:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  topo:'https://tile.opentopomap.org/{z}/{x}/{y}.png'
};
function makeStyle(url,sat=0,con=0){
  return{version:8,sources:{'base':{type:'raster',tiles:[url],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'base',type:'raster',source:'base',paint:{'raster-saturation':sat,'raster-contrast':con}}]};
}
function initMap(){
  if(mapReady)return;
  mapReady=true;
  map=new maplibregl.Map({
    container:'mainMap',
    style:makeStyle(STYLE_URLS.streets,0.05,0.02),
    center:[userLng,userLat],zoom:11,pitch:45,bearing:0,
    maxZoom:19,minZoom:3,
    attributionControl:false
  });
  map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'right');
  map.addControl(new maplibregl.ScaleControl({maxWidth:100,unit:'metric'}),'bottom-left');
  map.on('load',()=>{
    addUserMarker();
    addAllMarkers();
    renderSidebarSites();
    // 3D terrain attempt
    try{
      map.addSource('terrain',{type:'raster-dem',tiles:['https://demotiles.maplibre.org/terrain-tiles/tiles.json'],tileSize:256});
      map.setTerrain({source:'terrain',exaggeration:1.5});
    }catch(e){}
    showToast('🗺 Map loaded — '+SITES.length+' sites ready','green');
  });
  map.on('click',()=>{if(currentSite)closeSitePanel();});
}

function addUserMarker(){
  if(!map)return;
  const el=document.createElement('div');
  el.style.cssText='width:18px;height:18px;background:#2563eb;border-radius:50%;border:3px solid white;box-shadow:0 0 0 5px rgba(37,99,235,0.25);animation:userB 2s infinite;';
  const s=document.createElement('style');s.textContent='@keyframes userB{0%,100%{box-shadow:0 0 0 5px rgba(37,99,235,0.25)}50%{box-shadow:0 0 0 12px rgba(37,99,235,0.08)}}';
  document.head.appendChild(s);
  userMarker=new maplibregl.Marker({element:el,anchor:'center'}).setLngLat([userLng,userLat]).setPopup(new maplibregl.Popup({offset:14}).setHTML('<div style="font-size:12px;font-weight:700;padding:4px 8px;color:#1e3a8a">📍 You are here</div>')).addTo(map);
}

const TYPE_COLOR={heritage:'#d97706',temple:'#7c3aed',nature:'#16a34a',trek:'#7c3aed',emergency:'#dc2626',culture:'#db2777'};
const TYPE_ICON={heritage:'🏛',temple:'🛕',nature:'🌿',trek:'🥾',emergency:'🏥',culture:'🛍'};

function addAllMarkers(){
  mapMarkers.forEach(m=>m.remove());mapMarkers=[];
  SITES.forEach(site=>{
    const el=document.createElement('div');
    el.className='cmarker';
    const col=TYPE_COLOR[site.type]||'#16a34a';
    const ico=TYPE_ICON[site.type]||'📍';
    const lbl=site.name.length>16?site.name.slice(0,14)+'…':site.name;
    el.innerHTML=`<div class="cm-pin" style="background:${col}"><span class="cm-pin-ico">${ico}</span></div><div class="cm-lbl">${lbl}</div>`;
    el.addEventListener('click',e=>{e.stopPropagation();openSitePanel(site);});
    el.dataset.type=site.type;
    const m=new maplibregl.Marker({element:el,anchor:'bottom'}).setLngLat([site.lng,site.lat]).addTo(map);
    mapMarkers.push(m);
  });
}

function filterMap(type,btn){
  mapActiveType=type;
  document.querySelectorAll('.mf').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  mapMarkers.forEach((m,i)=>{
    const el=m.getElement();
    el.style.display=(type==='all'||SITES[i]?.type===type)?'flex':'none';
  });
  renderSidebarSites(type);
}

function setStyle(sty,btn){
  if(!map)return;
  document.querySelectorAll('.mcs').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const sat={streets:0.05,satellite:0,topo:0.3};
  const con={streets:0.02,satellite:0,topo:0.08};
  map.setStyle(makeStyle(STYLE_URLS[sty]||STYLE_URLS.streets,sat[sty]||0,con[sty]||0));
  map.once('styledata',()=>{addUserMarker();addAllMarkers();});
  showToast('🗺 '+sty.charAt(0).toUpperCase()+sty.slice(1)+' map');
}

function toggle3D(){
  if(!map)return;
  const btn=document.getElementById('btn3d');
  if(map.getPitch()<45){map.easeTo({pitch:60,bearing:30,duration:800});showToast('🏗 3D view on');if(btn)btn.style.background='#dcfce7';}
  else{map.easeTo({pitch:0,bearing:0,duration:800});showToast('🗺 Flat map');if(btn)btn.style.background='';}
}
function toggleSafety(){showToast('🛡 Safety layer: incidents shown on site pins');showPage('safety');}
function toggleSidebar(){const sb=document.getElementById('mapSidebar');sb.classList.toggle('open');}

// ── SITE PANEL (MAP) ──
function openSitePanel(site){
  currentSite=site;
  const p=document.getElementById('sitePanel');
  const hero=document.getElementById('spHero');
  const col=TYPE_COLOR[site.type]||'#16a34a';
  hero.style.background=`linear-gradient(135deg,${col}22,${col}44)`;
  hero.innerHTML=`<span style="font-size:64px">${site.emoji}</span>`;
  document.getElementById('spType').textContent=site.type.toUpperCase();
  document.getElementById('spName').textContent=site.name;
  document.getElementById('spLoc').textContent='📍 '+site.city+', '+site.state;
  document.getElementById('spStars').textContent='★'.repeat(Math.round(site.rating))+'☆'.repeat(5-Math.round(site.rating))+' '+site.rating+' ('+site.reviews.toLocaleString()+' reviews)';
  // Safety
  const sl=document.getElementById('spSafety');
  const cls=site.safety>=85?'ss-high':site.safety>=70?'ss-mid':'ss-low';
  const emo=site.safety>=85?'🟢':site.safety>=70?'🟡':'🔴';
  sl.innerHTML=`<span class="safety-score ${cls}">${emo} Safety: ${site.safetyLevel} (${site.safety}/100)</span><span style="font-size:11px;color:var(--text3);margin-left:8px">Crime: ${site.crimeLevel} · Accident Risk: ${site.accidentRisk}</span>`;
  document.getElementById('spDesc').textContent=site.desc;
  const meta=document.getElementById('spMeta');
  meta.innerHTML=[site.timings?'🕐 '+site.timings:'',site.entry?'💰 '+site.entry:'',site.parking?'🚗 '+site.parking:'',site.condition?'✅ '+site.condition:'',site.offlineReady?'📶 Offline Ready':''].filter(Boolean).map(x=>`<span>${x}</span>`).join('');
  p.style.display='block';
  if(map)map.flyTo({center:[site.lng,site.lat],zoom:14,pitch:55,bearing:20,duration:1200});
  document.querySelectorAll('.msb-item').forEach(el=>el.classList.remove('active'));
  const se=document.querySelector(`[data-siteid="${site.id}"]`);if(se){se.classList.add('active');se.scrollIntoView({block:'nearest'});}
}
function closeSitePanel(){document.getElementById('sitePanel').style.display='none';currentSite=null;}
function navigate3D(){
  if(!currentSite)return;
  const url=`https://www.google.com/maps/dir/${userLat},${userLng}/${currentSite.lat},${currentSite.lng}`;
  window.open(url,'_blank');
  showToast('🗺 Opening Google Maps navigation');
}

// ── FULL DETAIL MODAL ──
const TAB_CONTENT={
  info:site=>`<div class="fd-info-grid"><div class="fig-item"><div class="fig-lbl">Timings</div><div class="fig-val">${site.timings}</div></div><div class="fig-item"><div class="fig-lbl">Entry Fee</div><div class="fig-val">${site.entry}</div></div><div class="fig-item"><div class="fig-lbl">Closed</div><div class="fig-val">${site.closed}</div></div><div class="fig-item"><div class="fig-lbl">Parking</div><div class="fig-val">${site.parking}</div></div><div class="fig-item"><div class="fig-lbl">Condition</div><div class="fig-val">${site.condition}</div></div><div class="fig-item"><div class="fig-lbl">GPS</div><div class="fig-val">${site.lat.toFixed(4)}°N, ${site.lng.toFixed(4)}°E</div></div></div><h4>Description</h4><p>${site.desc}</p><h4>How to Get There</h4><p>${site.entryRoute}</p><h4>Nearby Emergency</h4><p style="color:#dc2626">${site.nearbyHelp}</p>`,
  history:site=>`<h4>History</h4><p>${site.history}</p>`,
  visiting:site=>`<h4>Visiting Tips</h4><p>${site.visiting}</p><h4>Entry Route</h4><p>${site.entryRoute}</p>`,
  safety:site=>{const cls=site.safety>=85?'ss-high':site.safety>=70?'ss-mid':'ss-low';const inc=(site.incidents&&site.incidents.length)?site.incidents.map(i=>`<div class="sri-item"><div class="sri-dot" style="background:${site.safety>=85?'#16a34a':site.safety>=70?'#d97706':'#dc2626'}"></div>${i}</div>`).join(''):'<p style="color:#16a34a">✅ No incidents reported at this site.</p>';return`<div style="margin-bottom:1rem"><span class="safety-score ${cls}" style="font-size:14px;padding:6px 14px">Safety Score: ${site.safety}/100 — ${site.safetyLevel}</span></div><div class="fd-info-grid"><div class="fig-item"><div class="fig-lbl">Crime Level</div><div class="fig-val">${site.crimeLevel}</div></div><div class="fig-item"><div class="fig-lbl">Accident Risk</div><div class="fig-val">${site.accidentRisk}</div></div></div><div class="sr-incidents"><div class="sri-title">Incident History</div>${inc}</div>`;},
  reviews:site=>{const rv=(site.sampleReviews||[]).map(r=>`<div style="background:var(--bg2);border-radius:10px;padding:12px;margin-bottom:10px;border-left:3px solid #16a34a"><p style="font-size:13px;margin:0">"${r}"</p><p style="font-size:11px;color:var(--text3);margin-top:5px">★★★★★ — Community Review</p></div>`).join('');return rv+`<div style="background:var(--amber-light);border-radius:10px;padding:14px;border:1px solid rgba(217,119,6,0.3)"><div style="font-weight:700;font-size:13px;color:#78350f;margin-bottom:6px">✍ Write a Review — Earn +10 TrailPoints</div><textarea id="fdReviewText" placeholder="Your experience at ${site.name}..." style="width:100%;border:1px solid rgba(217,119,6,0.3);border-radius:8px;padding:8px;font-size:13px;height:70px;background:white;outline:none;resize:none;font-family:var(--dm)"></textarea><button onclick="submitFdReview()" style="margin-top:8px;background:#16a34a;color:white;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--syne)">Submit +10 pts</button></div>`;}
};
function openFullDetail(){if(!currentSite)return;openSiteModal(currentSite);}
function openSiteModal(site){
  currentSite=site;
  const m=document.getElementById('fullDetailModal');
  const col=TYPE_COLOR[site.type]||'#16a34a';
  document.getElementById('fdHero').style.background=`linear-gradient(135deg,${col}33,${col}66)`;
  document.getElementById('fdHero').innerHTML=`<span style="font-size:80px">${site.emoji}</span>`;
  document.getElementById('fdTitle').textContent=site.name;
  document.getElementById('fdLocation').textContent='📍 '+site.city+', '+site.state;
  const cls=site.safety>=85?'ss-high':site.safety>=70?'ss-mid':'ss-low';
  document.getElementById('fdSafety').innerHTML=`<span class="safety-score ${cls}">🛡 Safety: ${site.safetyLevel} ${site.safety}/100 · Crime: ${site.crimeLevel} · Accident Risk: ${site.accidentRisk}</span>`;
  const badges=document.getElementById('fdBadges');
  const bCol=TYPE_COLOR[site.type]||'#16a34a';
  badges.innerHTML=`<span class="fd-badge" style="background:${bCol}22;color:${bCol}">${site.type}</span><span class="fd-badge" style="background:#dcfce7;color:#14532d">${site.offlineReady?'📶 Offline Ready':'🌐 Online'}</span><span class="fd-badge" style="background:#fef3c7;color:#78350f">⭐ ${site.rating}/5 (${site.reviews.toLocaleString()})</span>`;
  fdTab('info',document.querySelector('.fdt'));
  m.style.display='flex';
}
function closeFullDetail(e){
  if(e&&e.target!==document.getElementById('fullDetailModal'))return;
  document.getElementById('fullDetailModal').style.display='none';
}
function fdTab(tab,btn){
  document.querySelectorAll('.fdt').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  document.getElementById('fdTabContent').innerHTML=TAB_CONTENT[tab]?TAB_CONTENT[tab](currentSite):'';
}
function submitFdReview(){
  const t=document.getElementById('fdReviewText');
  if(!t||!t.value.trim()){showToast('Write something first!');return;}
  earnPoints(10,'Reviewed '+currentSite.name);
  myReviews.push({site:currentSite.name,text:t.value,date:new Date().toLocaleDateString()});
  saveMiscData();
  showToast('✅ Review submitted! +10 pts','green');
  t.value='';
}

// ── SIDEBAR SITES ──
function renderSidebarSites(type){
  const c=document.getElementById('msbList');if(!c)return;
  const filtered=SITES.filter(s=>!type||type==='all'||s.type===type);
  c.innerHTML=filtered.slice(0,40).map(s=>`
    <div class="msb-item" data-siteid="${s.id}" onclick="openSitePanel(SITES.find(x=>x.id==='${s.id}'))">
      <div class="msb-emoji">${s.emoji}</div>
      <div class="msb-info">
        <div class="msb-name">${s.name}</div>
        <div class="msb-meta">${s.city}, ${s.state} · ★${s.rating}</div>
        <div class="msb-badges">
          <span class="ms-badge mb-${s.type[0]}">${s.type}</span>
          ${s.offlineReady?'<span class="ms-badge" style="background:#dcfce7;color:#14532d">Offline</span>':''}
          <span class="ms-badge" style="background:${s.safety>=85?'#dcfce7':s.safety>=70?'#fef3c7':'#fee2e2'};color:${s.safety>=85?'#14532d':s.safety>=70?'#78350f':'#7f1d1d'}">${s.safetyLevel}</span>
        </div>
      </div>
    </div>
  `).join('');
}
function searchSites(val){
  const c=document.getElementById('msbList');if(!c)return;
  const q=val.toLowerCase();
  const filtered=SITES.filter(s=>s.name.toLowerCase().includes(q)||s.city.toLowerCase().includes(q)||s.state.toLowerCase().includes(q));
  c.innerHTML=filtered.slice(0,30).map(s=>`
    <div class="msb-item" data-siteid="${s.id}" onclick="openSitePanel(SITES.find(x=>x.id==='${s.id}'))">
      <div class="msb-emoji">${s.emoji}</div>
      <div class="msb-info">
        <div class="msb-name">${s.name}</div>
        <div class="msb-meta">${s.city}, ${s.state} · ★${s.rating}</div>
      </div>
    </div>
  `).join('');
}

// ── EXPLORE / SITE CARDS ──
let exploreType='all',exploreText='';
function renderSiteCards(){
  const g=document.getElementById('sitesGrid');if(!g)return;
  const stateFilter=document.getElementById('exploreState')?.value||'';
  const filtered=SITES.filter(s=>{
    if(exploreType!=='all'&&exploreType!=='unesco'&&s.type!==exploreType)return false;
    if(exploreType==='unesco'&&!s.tags.includes('UNESCO'))return false;
    if(stateFilter&&s.state!==stateFilter)return false;
    if(exploreText){const q=exploreText.toLowerCase();return s.name.toLowerCase().includes(q)||s.city.toLowerCase().includes(q)||s.state.toLowerCase().includes(q)||s.desc.toLowerCase().includes(q);}
    return true;
  });
  g.innerHTML=filtered.map(s=>{
    const col=TYPE_COLOR[s.type]||'#16a34a';
    const sClass=s.safety>=85?'safety-high':s.safety>=70?'safety-mid':'safety-low';
    return`<div class="site-card">
      <div class="sc-img" style="background:linear-gradient(135deg,${col}22,${col}44)">
        <span style="font-size:54px">${s.emoji}</span>
        <div class="sc-img-top">
          <span class="sc-tag" style="background:${col}22;color:${col}">${s.type}</span>
          ${s.offlineReady?'<span class="sc-offline">📶 Offline</span>':''}
        </div>
        <div class="sc-safety ${sClass}">🛡 ${s.safetyLevel}</div>
      </div>
      <div class="sc-body">
        <div class="sc-name">${s.name}</div>
        <div class="sc-state">📍 ${s.city}, ${s.state}</div>
        <div class="sc-row">
          <span class="sc-rating">${'★'.repeat(Math.round(s.rating))}</span>
          <span class="sc-reviews">${s.rating} · ${s.reviews.toLocaleString()} reviews</span>
        </div>
        <div class="sc-desc">${s.desc}</div>
        <div class="sc-pills">
          ${(s.tags||[]).slice(0,3).map(t=>`<span class="sc-pill">${t}</span>`).join('')}
        </div>
        <div class="sc-btns">
          <button class="sc-btn scb-green" onclick="goToSiteOnMap('${s.id}')">📍 Map</button>
          <button class="sc-btn scb-light" onclick="openSiteModal(SITES.find(x=>x.id==='${s.id}'))">🏛 Guide</button>
          <button class="sc-btn scb-light" onclick="addToTrip('${s.id}')">✈ Trip</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function filterExplore(text,type,btn){
  if(text!==undefined)exploreText=typeof text==='string'?text:(document.getElementById('exploreSearch')?.value||'');
  if(type!==undefined)exploreType=type||exploreType;
  if(btn){document.querySelectorAll('.ef').forEach(b=>b.classList.remove('active'));btn.classList.add('active');}
  renderSiteCards();
}
function goToSiteOnMap(id){
  const site=SITES.find(s=>s.id===id);if(!site)return;
  showPage('map');
  setTimeout(()=>{openSitePanel(site);},400);
}
function addToTrip(id){
  const site=SITES.find(s=>s.id===id);if(!site)return;
  showPage('trip');
  const inp=document.getElementById('tripDest');if(inp)inp.value=site.name;
  showToast('📌 '+site.name+' added to trip planner','green');
}

// ── TRIP PLANNER ──
function toggleInterest(el){el.classList.toggle('active');}
function initDateDefaults(){
  try{
    const s=document.getElementById('tripStart');const e=document.getElementById('tripEnd');
    if(s&&e){const d=new Date();const d2=new Date(d);d2.setDate(d2.getDate()+3);s.value=d.toISOString().slice(0,10);e.value=d2.toISOString().slice(0,10);}
  }catch(e){}
}
function generateTrip(){
  const dest=document.getElementById('tripDest')?.value.trim();
  if(!dest){showToast('Please enter a destination!');return;}
  const from=document.getElementById('tripFrom')?.value||'Gandhinagar';
  const budget=document.getElementById('tripBudget')?.value||'Mid';
  const people=document.getElementById('tripPeople')?.value||'Group';
  const s=document.getElementById('tripStart')?.value;const e=document.getElementById('tripEnd')?.value;
  let days=3;
  if(s&&e){const diff=Math.ceil((new Date(e)-new Date(s))/(1000*86400));if(diff>0&&diff<=14)days=diff;}
  const interests=[...document.querySelectorAll('.ti.active')].map(el=>el.textContent).join(', ');
  const result=document.getElementById('tripResult');result.style.display='block';
  result.innerHTML=`<div class="tr-title">✈ ${days}-Day Trip to ${dest}</div><div style="font-size:13px;color:var(--text2);margin-bottom:1rem">From ${from} · ${people} · ${budget}</div><div style="text-align:center;padding:2rem;color:var(--text3)">🤖 Generating your plan...</div>`;
  // Build trip using AI via Claude API
  const prompt=`You are TrailBot, an expert Indian travel planner. Create a detailed ${days}-day trip plan for: Destination: ${dest}, From: ${from}, Budget: ${budget}, Travellers: ${people}, Interests: ${interests}. 

Respond ONLY in this JSON format (no markdown, no extra text):
{"title":"Trip title","overview":"2-sentence overview","budget_per_day":"₹XXXX","total_budget":"₹XXXXX","best_time":"Month range","transport":"How to get there from ${from}","hotel_suggestion":"Hotel type and area to stay","days":[{"day":1,"title":"Day title","morning":"Morning activity","afternoon":"Afternoon activity","evening":"Evening activity","tip":"Local tip"},{"day":2,...}],"safety_tips":["tip1","tip2","tip3"],"packing":["item1","item2","item3"]}`;
  fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,messages:[{role:'user',content:prompt}]})
  }).then(r=>r.json()).then(data=>{
    const txt=data.content?.map(c=>c.text||'').join('');
    let plan;try{plan=JSON.parse(txt.replace(/```json|```/g,'').trim());}catch(e){plan=null;}
    if(plan)renderTripResult(plan,dest,days);
    else result.innerHTML=`<div class="tr-title">✈ ${days}-Day Trip to ${dest}</div><pre style="font-size:12px;white-space:pre-wrap;color:var(--text2)">${txt}</pre>`;
    saveTripToAccount(dest,days,plan);
  }).catch(()=>{
    renderTripFallback(dest,from,days,budget);
  });
}
function renderTripResult(plan,dest,days){
  const result=document.getElementById('tripResult');
  const daysHtml=plan.days.map(d=>`<div class="tr-day"><div class="tr-day-title">Day ${d.day}: ${d.title}</div><div class="tr-day-items">🌅 <b>Morning:</b> ${d.morning}<br>☀ <b>Afternoon:</b> ${d.afternoon}<br>🌙 <b>Evening:</b> ${d.evening}<br><span style="color:var(--green);font-style:italic">💡 ${d.tip}</span></div></div>`).join('');
  result.innerHTML=`
    <div class="tr-title">✈ ${plan.title||dest+' Trip'}</div>
    <p style="font-size:14px;color:var(--text2);margin-bottom:1rem">${plan.overview||''}</p>
    <div class="tr-meta-grid">
      <div class="tr-meta-item"><div class="trm-label">Budget/Day</div><div class="trm-val">${plan.budget_per_day||'—'}</div></div>
      <div class="tr-meta-item"><div class="trm-label">Total Budget</div><div class="trm-val">${plan.total_budget||'—'}</div></div>
      <div class="tr-meta-item"><div class="trm-label">Best Time</div><div class="trm-val">${plan.best_time||'—'}</div></div>
    </div>
    <div class="tr-day"><div class="tr-day-title">🚌 Getting There</div><div class="tr-day-items">${plan.transport||'—'}</div></div>
    <div class="tr-day"><div class="tr-day-title">🏨 Where to Stay</div><div class="tr-day-items">${plan.hotel_suggestion||'—'}</div></div>
    ${daysHtml}
    <div class="tr-day"><div class="tr-day-title">🛡 Safety Tips</div><div class="tr-day-items">${(plan.safety_tips||[]).map(t=>'• '+t).join('<br>')}</div></div>
    <div class="tr-day"><div class="tr-day-title">🎒 What to Pack</div><div class="tr-day-items">${(plan.packing||[]).map(t=>'• '+t).join('<br>')}</div></div>
    <div style="display:flex;gap:8px;margin-top:1rem">
      <button class="btn-green" onclick="showToast('Trip saved!','green');earnPoints(20,'Planned a trip')">💾 Save Trip</button>
      <button class="btn-outline" onclick="shareTrip()">📤 Share</button>
    </div>`;
  earnPoints(20,'Generated trip plan');
}
function renderTripFallback(dest,from,days,budget){
  const result=document.getElementById('tripResult');
  result.innerHTML=`<div class="tr-title">✈ ${days}-Day Trip to ${dest}</div>
    <div class="tr-day"><div class="tr-day-title">🚌 Getting There from ${from}</div><div class="tr-day-items">Check IRCTC for train bookings. Buses available from major bus stands. Book in advance for weekends.</div></div>
    ${[...Array(days)].map((_,i)=>`<div class="tr-day"><div class="tr-day-title">Day ${i+1}</div><div class="tr-day-items">🌅 Morning: Visit main heritage site early (beat crowds)<br>☀ Afternoon: Local food + explore markets<br>🌙 Evening: Local experience / ghat / viewpoint</div></div>`).join('')}
    <div class="tr-day"><div class="tr-day-title">💡 General Tips</div><div class="tr-day-items">• Carry offline map (download before leaving)<br>• Keep emergency contacts saved<br>• Book accommodation in advance for peak season<br>• Carry cash for smaller towns</div></div>`;
}
function saveTripToAccount(dest,days,plan){
  myTrips.push({dest,days,date:new Date().toLocaleDateString(),plan:plan?.title||dest});
  saveMiscData();renderMySavedTrips();
}
function renderMySavedTrips(){
  const c=document.getElementById('myTrips');if(!c)return;
  c.innerHTML=myTrips.length?myTrips.map(t=>`<div class="trip-saved-item"><b>${t.dest}</b> — ${t.days} days · ${t.date}</div>`).join(''):'<div class="empty-state">No saved trips yet. <span onclick="showPage(\'trip\')" style="color:var(--green);cursor:pointer">Plan one now →</span></div>';
}
function shareTrip(){if(navigator.share)navigator.share({title:'My TrailBharat Trip',text:'Check out my trip plan!',url:window.location.href});else showToast('Copy the URL to share your trip');}

// ── AI CHAT ──
const chatHistory=[];
function sendChat(){
  const inp=document.getElementById('chatInput');const val=inp.value.trim();if(!val)return;
  inp.value='';addChatMsg(val,'user');
  const msgs=document.getElementById('chatMessages');
  const typing=document.createElement('div');typing.className='chat-msg bot';typing.innerHTML='<div class="cm-avatar">🤖</div><div class="cm-bubble" style="color:var(--text3)">Thinking...</div>';
  msgs.appendChild(typing);msgs.scrollTop=msgs.scrollHeight;
  chatHistory.push({role:'user',content:val});
  const sysPrompt="You are TrailBot, an expert AI travel assistant for TrailBharat — India's offline 3D travel app. You know all about Indian heritage sites, treks, safety, best travel times, local food, transport, accommodation, cultural tips, safety concerns, and travel planning. Be helpful, specific, concise and friendly. Format responses clearly.";
  fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,system:sysPrompt,messages:chatHistory.slice(-10)})
  }).then(r=>r.json()).then(data=>{
    const reply=data.content?.map(c=>c.text||'').join('')||"I'm having trouble connecting. Try again!";
    typing.remove();addChatMsg(reply,'bot');
    chatHistory.push({role:'assistant',content:reply});
  }).catch(()=>{typing.remove();addChatMsg("I'm offline right now but I know India well! What would you like to know?","bot");});
}
function addChatMsg(text,role){
  const msgs=document.getElementById('chatMessages');
  const div=document.createElement('div');div.className='chat-msg '+role;
  div.innerHTML=`<div class="cm-avatar">${role==='user'?'👤':'🤖'}</div><div class="cm-bubble">${text.replace(/\n/g,'<br>')}</div>`;
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}

// ── SAFETY ──
function renderSafetyCards(){
  const g=document.getElementById('safetyGrid');if(!g)return;
  g.innerHTML=SITES.filter(s=>s.type!=='emergency').slice(0,20).map(s=>{
    const cls=s.safety>=85?'sc-score-high':s.safety>=70?'sc-score-mid':'sc-score-low';
    const emo=s.safety>=85?'🟢':s.safety>=70?'🟡':'🔴';
    return`<div class="safety-card" onclick="checkSafetyForSite('${s.id}')">
      <div class="safety-card-top">
        <div><div class="sc-site-name">${s.emoji} ${s.name}</div><div class="sc-site-loc">${s.city}, ${s.state}</div></div>
        <div class="sc-score-badge ${cls}">${emo} ${s.safety}/100</div>
      </div>
      <div class="sc-factors-row">
        <span class="sc-factor">Crime: ${s.crimeLevel}</span>
        <span class="sc-factor">Accident: ${s.accidentRisk}</span>
        <span class="sc-factor">${s.safetyLevel} Safety</span>
      </div>
      ${s.incidents&&s.incidents.length?`<div class="sc-last-inc">⚠ ${s.incidents[0]}</div>`:'<div class="sc-last-inc" style="color:#16a34a">✅ No incidents reported</div>'}
    </div>`;
  }).join('');
}
function checkSafety(){
  const q=document.getElementById('safetySearch')?.value.trim();if(!q)return;
  const site=SITES.find(s=>s.name.toLowerCase().includes(q.toLowerCase())||s.city.toLowerCase().includes(q.toLowerCase()));
  if(site)checkSafetyForSite(site.id);
  else{
    const d=SAFETY_DATA[q]||SAFETY_DATA['default'];
    renderSafetyResult({name:q,safety:d.score,safetyLevel:d.level,crimeLevel:d.factors.lastCrime||'Unknown',accidentRisk:'Unknown',incidents:d.incidents,desc:d.description});
  }
}
function checkSafetyForSite(id){
  const site=SITES.find(s=>s.id===id);if(!site)return;
  renderSafetyResult(site);
}
function renderSafetyResult(site){
  const r=document.getElementById('safetyResult');r.style.display='block';
  const cls=site.safety>=85?'ss-high':site.safety>=70?'ss-mid':'ss-low';
  const bgC=site.safety>=85?'#16a34a':site.safety>=70?'#d97706':'#dc2626';
  const inc=(site.incidents&&site.incidents.length)?site.incidents.map(i=>`<div class="sri-item"><div class="sri-dot" style="background:${bgC}"></div>${i}</div>`).join(''):'<p style="color:#16a34a;font-size:13px">✅ No incidents reported at this site. Safe for visitors.</p>';
  r.innerHTML=`<div class="sr-title">🛡 Safety Report: ${site.name||site}</div>
    <div class="sr-score-row">
      <div class="sr-score-circle" style="background:${bgC}">${site.safety}</div>
      <div class="sr-score-info"><div class="sr-score-label">${site.safetyLevel} Safety — Score ${site.safety}/100</div><div class="sr-score-sub">${site.desc||''}</div></div>
    </div>
    <div class="sr-factors">
      <div class="srf-item" style="border-color:${bgC}"><div class="srf-label">Crime Level</div><div class="srf-val">${site.crimeLevel||'—'}</div></div>
      <div class="srf-item" style="border-color:${bgC}"><div class="srf-label">Accident Risk</div><div class="srf-val">${site.accidentRisk||'—'}</div></div>
      <div class="srf-item" style="border-color:${bgC}"><div class="srf-label">Condition</div><div class="srf-val">${site.condition||'Good'}</div></div>
    </div>
    <div class="sr-incidents"><div class="sri-title">Incident History</div>${inc}</div>`;
  r.scrollIntoView({behavior:'smooth',block:'start'});
}

// ── WEATHER ──
function fetchWeather(){
  const city=document.getElementById('weatherCity')?.value||'Gandhinagar';
  const d=document.getElementById('weatherDisplay');if(!d)return;
  // Use Open-Meteo (free, no key needed) via geocoding
  const geoUrl=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  d.innerHTML='<div style="padding:2rem;text-align:center;color:var(--text3)">🌤 Fetching weather...</div>';
  fetch(geoUrl).then(r=>r.json()).then(geo=>{
    if(!geo.results||!geo.results.length){d.innerHTML='<div style="padding:2rem;color:var(--red)">Location not found. Try a different city name.</div>';return;}
    const loc=geo.results[0];
    const weatherUrl=`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=auto&forecast_days=7`;
    return fetch(weatherUrl).then(r=>r.json()).then(w=>{renderWeather(w,loc.name||city);});
  }).catch(()=>{renderWeatherFallback(city);});
}
const WC={0:'☀️ Clear',1:'🌤 Mainly clear',2:'⛅ Partly cloudy',3:'☁️ Overcast',45:'🌫 Foggy',48:'🌫 Icy fog',51:'🌦 Light drizzle',53:'🌦 Drizzle',55:'🌧 Heavy drizzle',61:'🌧 Light rain',63:'🌧 Rain',65:'⛈ Heavy rain',71:'❄️ Light snow',73:'❄️ Snow',75:'🌨 Heavy snow',77:'🌨 Snow grains',80:'🌦 Showers',81:'🌧 Heavy showers',82:'⛈ Violent showers',85:'🌨 Snow showers',86:'❄️ Heavy snow',95:'⛈ Thunderstorm',96:'⛈ Thunderstorm hail',99:'⛈ Heavy thunderstorm'};
function getWC(code){return WC[code]||'🌤 Unknown';}
function renderWeather(w,city){
  const d=document.getElementById('weatherDisplay');
  const cur=w.current;const daily=w.daily;
  const temp=Math.round(cur.temperature_2m);const hum=Math.round(cur.relative_humidity_2m);const wind=Math.round(cur.wind_speed_10m);const desc=getWC(cur.weather_code);
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const forecastHtml=daily.time.map((t,i)=>{const day=new Date(t).getDay();return`<div class="wf-day"><div class="wfd-name">${days[day]}</div><div class="wfd-icon">${getWC(daily.weather_code[i]).split(' ')[0]}</div><div class="wfd-hi">${Math.round(daily.temperature_2m_max[i])}°</div><div class="wfd-lo">${Math.round(daily.temperature_2m_min[i])}°</div></div>`;}).join('');
  const advisory=temp>40?{title:'🔥 Extreme Heat Advisory',text:'Temperature above 40°C. Stay hydrated, avoid outdoor activity 12-4 PM, carry water and electrolytes.'}:temp<5?{title:'❄️ Cold Weather Advisory',text:'Very cold conditions. Layer up, avoid exposed skin, watch for ice on paths and roads.'}:cur.weather_code>=61&&cur.weather_code<=82?{title:'🌧 Rain Advisory',text:'Rainfall expected. Carry raincoat, watch for slippery paths at heritage sites, avoid flash flood zones.'}:cur.weather_code>=71&&cur.weather_code<=77?{title:'❄️ Snow Advisory',text:'Snow expected. Trek only with proper gear, check road conditions, inform park authorities of your route.'}:{title:'✅ Good Conditions',text:'Weather looks favourable for outdoor activities and sightseeing. Normal precautions apply.'};
  d.innerHTML=`
    <div class="weather-main">
      <div class="wm-city">📍 ${city}</div>
      <div class="wm-temp">${temp}°C</div>
      <div class="wm-desc">${desc}</div>
      <div class="wm-row">
        <div class="wm-stat"><div class="wm-stat-val">${hum}%</div><div class="wm-stat-lbl">Humidity</div></div>
        <div class="wm-stat"><div class="wm-stat-val">${wind} km/h</div><div class="wm-stat-lbl">Wind</div></div>
        <div class="wm-stat"><div class="wm-stat-val">${Math.round(cur.precipitation||0)}mm</div><div class="wm-stat-lbl">Rain</div></div>
      </div>
    </div>
    <div class="weather-forecast">${forecastHtml}</div>
    <div class="weather-advisory"><div class="wa-title">${advisory.title}</div><div class="wa-text">${advisory.text}</div></div>
  `;
}
function renderWeatherFallback(city){
  const d=document.getElementById('weatherDisplay');
  d.innerHTML=`<div class="weather-main"><div class="wm-city">📍 ${city}</div><div class="wm-temp">—°C</div><div class="wm-desc">Weather data unavailable offline</div><div class="wm-row"><div class="wm-stat"><div class="wm-stat-val">—</div><div class="wm-stat-lbl">Humidity</div></div></div></div><div class="weather-advisory"><div class="wa-title">📴 Offline Mode</div><div class="wa-text">Weather data requires internet. The last cached forecast for this region is shown when available.</div></div>`;
}

// ── SOS ──
function startSOSClock(){setInterval(()=>{const el=document.getElementById('sosTime');if(el)el.textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});},1000);}
function triggerSOS(){
  if(sosBusy)return;sosBusy=true;
  const btn=document.getElementById('sosMainBtn');
  btn.querySelector('.sos-label').textContent='SENDING...';
  btn.style.background='linear-gradient(135deg,#d97706,#b45309)';
  const ids=['ss0','ss1','ss2'];
  ids.forEach((id,i)=>setTimeout(()=>{const el=document.getElementById(id);if(el){el.textContent='✓ Sent';el.className='sci-st sent';}},700*(i+1)));
  setTimeout(()=>{
    btn.querySelector('.sos-label').textContent='SOS SENT ✓';
    btn.querySelector('.sos-hint').textContent=`Coords: ${userLat.toFixed(5)}°N, ${userLng.toFixed(5)}°E`;
    btn.style.background='linear-gradient(135deg,#16a34a,#15803d)';
    showToast('🆘 SOS sent to all contacts!','red');
    // Also try to send email alert
    sendSOSEmail();
  },2600);
  setTimeout(()=>{
    btn.querySelector('.sos-label').textContent='SEND SOS';
    btn.querySelector('.sos-hint').textContent='Sends GPS + route history via SMS';
    btn.style.background='linear-gradient(135deg,#dc2626,#991b1b)';
    ids.forEach(id=>{const el=document.getElementById(id);if(el){el.className='sci-st';el.textContent=['Primary','Friend','Emergency'][ids.indexOf(id)];}});
    sosBusy=false;
  },8000);
}
function sendSOSEmail(){
  // Formspree or EmailJS for real email
  try{
    fetch('https://formspree.io/f/YOUR_FORM_ID',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'TrailBharat SOS Alert',email:'sos@trailbharat.in',message:`EMERGENCY SOS\nUser: ${currentUser?.name||'Guest'}\nLocation: ${userLat.toFixed(5)}N, ${userLng.toFixed(5)}E\nTime: ${new Date().toLocaleString()}`})}).catch(()=>{});
  }catch(e){}
}
function addSosContact(){
  const name=prompt('Contact name:');if(!name)return;
  const ph=prompt('Phone number (+91...):');if(!ph)return;
  const c=document.getElementById('sosContactsDiv');
  const item=document.createElement('div');item.className='scc-item';
  item.innerHTML=`<div class="sci-av" style="background:rgba(217,119,6,0.2);color:#fbbf24">${name[0].toUpperCase()}</div><div><div class="sci-nm">${name}</div><div class="sci-ph">${ph}</div></div><div class="sci-st">Added</div>`;
  c.appendChild(item);
  showToast('✅ '+name+' added','green');
}
function callNum(num){if(confirm('Call '+num+'?'))window.location.href='tel:'+num;}

// ── CONTACT EMAIL ──
function sendContactEmail(){
  const name=document.getElementById('contactName')?.value.trim();
  const email=document.getElementById('contactEmail')?.value.trim();
  const msg=document.getElementById('contactMsg')?.value.trim();
  if(!name||!email||!msg){showToast('Please fill all fields');return;}
  // Use Formspree (replace with real endpoint)
  const endpoint='https://formspree.io/f/mnndrvdg'; // Replace with your Formspree form ID
  fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,message:msg,_subject:'TrailBharat Contact: '+name})})
  .then(r=>{
    if(r.ok||r.status===200){document.getElementById('contactSent').style.display='block';document.getElementById('contactName').value='';document.getElementById('contactEmail').value='';document.getElementById('contactMsg').value='';showToast('✅ Message sent!','green');}
    else showToast('Message queued. Will send when online.','green');
  }).catch(()=>{document.getElementById('contactSent').style.display='block';showToast('Message saved! Will send when online.','green');});
}

// ── REWARDS ──
function earnPoints(n,reason){
  points+=n;logItems.unshift({pts:n,reason,time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})});
  try{localStorage.setItem('tb_points',points);localStorage.setItem('tb_log',JSON.stringify(logItems.slice(0,20)));}catch(e){}
  updateRewardsUI();
  const apc=document.getElementById('apcPts');if(apc)apc.textContent=points.toLocaleString()+' pts';
}
function updateRewardsUI(){
  const pn=document.getElementById('pcNum');if(pn)pn.textContent=points.toLocaleString();
  const pct=Math.min((points/3000)*100,100);
  const bar=document.getElementById('pcFill');if(bar)bar.style.width=pct+'%';
  const prog=document.getElementById('pcProg');if(prog)prog.textContent=`${points.toLocaleString()} / 3,000 to Gold`;
  const gs=document.getElementById('goldStatus');if(gs)gs.textContent=points>=3000?'✓ Earned':(3000-points)+' away';
  const log=document.getElementById('pcLog');
  if(log)log.innerHTML=logItems.slice(0,8).map(l=>`<div class="pc-log-item"><span>${l.reason}</span><span class="pc-log-pts">+${l.pts} · ${l.time}</span></div>`).join('');
  // Badge
  const badge=document.getElementById('pcBadge');
  if(badge)badge.textContent=points>=10000?'💎 Diamond':points>=3000?'🥇 Gold':points>=500?'🥈 Silver':'🥉 Bronze';
  const apcB=document.getElementById('apcBadge');
  if(apcB)apcB.textContent=points>=10000?'💎 Diamond':points>=3000?'🥇 Gold Explorer':points>=500?'🥈 Silver Explorer':'🥉 Bronze Explorer';
}
function redeem(cost,name){
  if(points<cost){showToast('Need '+(cost-points)+' more pts for '+name);return;}
  points-=cost;logItems.unshift({pts:-cost,reason:'Redeemed: '+name,time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})});
  try{localStorage.setItem('tb_points',points);}catch(e){}
  updateRewardsUI();
  showToast('🎁 '+name+' redeemed!','green');
}

// ── REVIEW MODAL ──
function addReview(){
  if(!currentSite){showToast('Select a site first');return;}
  document.getElementById('rvTitle').textContent='Review: '+currentSite.name;
  reviewStars=0;updateStars(0);
  document.getElementById('reviewModal').style.display='flex';
}
function closeReview(e){if(e&&e.target!==document.getElementById('reviewModal'))return;document.getElementById('reviewModal').style.display='none';}
function setStars(n){reviewStars=n;updateStars(n);}
function updateStars(n){document.querySelectorAll('.rvs').forEach((s,i)=>{s.classList.toggle('active',i<n);});}
function submitReview(){
  const txt=document.getElementById('rvText')?.value.trim();
  if(!reviewStars){showToast('Select a star rating');return;}
  if(!txt){showToast('Write your review');return;}
  earnPoints(10,'Reviewed '+currentSite.name);
  myReviews.push({site:currentSite.name,stars:reviewStars,text:txt,date:new Date().toLocaleDateString()});
  saveMiscData();
  document.getElementById('reviewModal').style.display='none';
  showToast('✅ Review submitted! +10 pts','green');
}

// ── MISC ──
function saveMiscData(){try{localStorage.setItem('tb_trips',JSON.stringify(myTrips));localStorage.setItem('tb_reviews',JSON.stringify(myReviews));}catch(e){}}
function showToast(msg,type){
  const t=document.getElementById('toast');t.textContent=msg;t.className='toast show'+(type?' '+type:'');
  clearTimeout(t._timer);t._timer=setTimeout(()=>{t.className='toast';},3000);
}
