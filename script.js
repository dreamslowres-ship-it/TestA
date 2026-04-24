(function(){
  "use strict";

  // ================== CONFIGURACIÓN ==================
  const WEEKLY_PASSWORD = "$$$RK";
  const SHOP_LOGO_PATH = "";

  // ================== FUNCIONES AUXILIARES ==================
  function getBoliviaTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * -4));
  }

  function getNextFridayBolivia() {
    const now = getBoliviaTime();
    const friday = new Date(now);
    friday.setHours(0,0,0,0);
    let days = (5 - now.getDay() + 7) % 7;
    if(days===0 && now.getHours()>=0) days=7;
    friday.setDate(now.getDate()+days);
    return friday;
  }

  // ================== SPLASH SCREEN ==================
  function initSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if(!splash) return;
    
    setTimeout(() => {
      splash.classList.add('hidden');
      setTimeout(() => {
        splash.style.display = 'none';
      }, 600);
    }, 2800);
  }

  // ================== SISTEMA DE ENTRADA ==================
  const entryModal = document.getElementById('entryModal');
  const appContent = document.getElementById('appContent');
  const entryPasswordInput = document.getElementById('entryPassword');
  const entrySubmitBtn = document.getElementById('entrySubmitBtn');
  const entryError = document.getElementById('entryError');

  function saveWeeklyPassword() {
    localStorage.setItem('starry_weekly_password', WEEKLY_PASSWORD);
    localStorage.setItem('starry_password_expiry', getNextFridayBolivia().toISOString());
  }

  function checkWeeklyPassword() {
    const storedPass = localStorage.getItem('starry_weekly_password');
    const storedExpiry = localStorage.getItem('starry_password_expiry');
    const now = getBoliviaTime();
    let need = true;
    if(storedPass && storedExpiry && now < new Date(storedExpiry) && storedPass === WEEKLY_PASSWORD) need = false;
    if(need) { 
      entryModal.style.display = 'flex'; 
      appContent.style.display = 'none'; 
    }
    else { 
      entryModal.style.display = 'none'; 
      appContent.style.display = 'block'; 
      initSplashScreen();
      initAll(); 
    }
  }

  function checkEntryPassword() {
    if(entryPasswordInput.value.trim() === WEEKLY_PASSWORD) {
      saveWeeklyPassword();
      entryModal.style.display = 'none';
      appContent.style.display = 'block';
      initSplashScreen();
      initAll();
    } else {
      entryError.textContent = 'Contraseña incorrecta. Intenta de nuevo.';
      entryError.style.animation = 'shake 0.4s ease';
      setTimeout(() => {
        entryError.style.animation = '';
      }, 400);
    }
  }
  
  if(entrySubmitBtn) entrySubmitBtn.onclick = checkEntryPassword;
  if(entryPasswordInput) {
    entryPasswordInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') checkEntryPassword();
    });
  }

  // ================== TEMAS ==================
  const THEMES = {
    autumn: { name:"Autumn", vars:{ void:"#0f0501", deep:"#1f0f04", card:"#2f1a08", card2:"#40260c", v1:"#b45309", v2:"#d97706", v3:"#f59e0b", v4:"#fbbf24", silver:"#fffbeb", mist:"#fed7aa", gold:"#fcd34d", border:"rgba(217,119,6,.28)", glow:"rgba(180,83,9,.55)", heroGradient1:"rgba(180,83,9,.2)", heroGradient2:"#1f0f04", heroGradient3:"#0f0501", heroGlow:"rgba(217,119,6,0.2)", heroAfter:"rgba(180,83,9,.12)", heroShadow:"rgba(180,83,9,.1)", ruleBorder:"rgba(217,119,6,.07)", starColor1:"rgba(251,191,36,.7)", starColor2:"rgba(251,191,36,.5)", starColor3:"rgba(251,191,36,.8)", starColor4:"rgba(251,191,36,.4)", starColor5:"rgba(251,191,36,.6)", starColor6:"rgba(251,191,36,.9)", accentRgb:"251,191,36" } },
    sakura: { name:"Sakura", vars:{ void:"#1a0f1a", deep:"#2d1f2a", card:"#3d2a38", card2:"#4f3547", v1:"#d946ef", v2:"#f0abfc", v3:"#f5d0fe", v4:"#fae8ff", silver:"#fff0fa", mist:"#f0abfc", gold:"#fde047", border:"rgba(217,70,239,.22)", glow:"rgba(217,70,239,.4)", heroGradient1:"rgba(217,70,239,.2)", heroGradient2:"#3d2a38", heroGradient3:"#1a0f1a", heroGlow:"rgba(240,171,252,0.2)", heroAfter:"rgba(217,70,239,.12)", heroShadow:"rgba(217,70,239,.1)", ruleBorder:"rgba(240,171,252,.07)", starColor1:"rgba(250,232,255,.7)", starColor2:"rgba(250,232,255,.5)", starColor3:"rgba(250,232,255,.8)", starColor4:"rgba(250,232,255,.4)", starColor5:"rgba(250,232,255,.6)", starColor6:"rgba(250,232,255,.9)", accentRgb:"250,232,255" } },
    ember: { name:"Ember", vars:{ void:"#0a0408", deep:"#140a10", card:"#1a0f16", card2:"#22141e", v1:"#b91c1c", v2:"#dc2626", v3:"#ef4444", v4:"#f87171", silver:"#fef3c7", mist:"#a8a29e", gold:"#fbbf24", border:"rgba(220,38,38,.2)", glow:"rgba(185,28,28,.5)", heroGradient1:"rgba(185,28,28,.2)", heroGradient2:"#1a0f16", heroGradient3:"#0a0408", heroGlow:"rgba(220,38,38,0.2)", heroAfter:"rgba(185,28,28,.12)", heroShadow:"rgba(185,28,28,.1)", ruleBorder:"rgba(220,38,38,.07)", starColor1:"rgba(248,113,113,.7)", starColor2:"rgba(248,113,113,.5)", starColor3:"rgba(248,113,113,.8)", starColor4:"rgba(248,113,113,.4)", starColor5:"rgba(248,113,113,.6)", starColor6:"rgba(248,113,113,.9)", accentRgb:"248,113,113" } },
    frost: { name:"Frost", vars:{ void:"#020617", deep:"#0f172a", card:"#1e293b", card2:"#334155", v1:"#2563eb", v2:"#3b82f6", v3:"#60a5fa", v4:"#93c5fd", silver:"#f1f5f9", mist:"#94a3b8", gold:"#facc15", border:"rgba(59,130,246,.2)", glow:"rgba(37,99,235,.4)", heroGradient1:"rgba(37,99,235,.2)", heroGradient2:"#1e293b", heroGradient3:"#020617", heroGlow:"rgba(59,130,246,0.2)", heroAfter:"rgba(37,99,235,.12)", heroShadow:"rgba(37,99,235,.1)", ruleBorder:"rgba(59,130,246,.07)", starColor1:"rgba(147,197,253,.7)", starColor2:"rgba(147,197,253,.5)", starColor3:"rgba(147,197,253,.8)", starColor4:"rgba(147,197,253,.4)", starColor5:"rgba(147,197,253,.6)", starColor6:"rgba(147,197,253,.9)", accentRgb:"147,197,253" } },
    carbon: { name:"Carbon Black", vars:{ void:"#050505", deep:"#0f0f0f", card:"#1a1a1a", card2:"#262626", v1:"#d4af37", v2:"#fbbf24", v3:"#fcd34d", v4:"#fde68a", silver:"#f5f5f5", mist:"#a3a3a3", gold:"#d4af37", border:"rgba(212,175,55,.25)", glow:"rgba(212,175,55,.5)", heroGradient1:"rgba(212,175,55,.15)", heroGradient2:"#1a1a1a", heroGradient3:"#050505", heroGlow:"rgba(212,175,55,0.25)", heroAfter:"rgba(212,175,55,.1)", heroShadow:"rgba(212,175,55,.08)", ruleBorder:"rgba(212,175,55,.06)", starColor1:"rgba(212,175,55,.6)", starColor2:"rgba(212,175,55,.4)", starColor3:"rgba(212,175,55,.7)", starColor4:"rgba(212,175,55,.3)", starColor5:"rgba(212,175,55,.5)", starColor6:"rgba(212,175,55,.8)", accentRgb:"212,175,55" } },
    royalCarbon: { name:"Royal Carbon", vars:{ void:"#020105", deep:"#080410", card:"#0f0820", card2:"#160c30", v1:"#ffd700", v2:"#ffed4a", v3:"#fff4a3", v4:"#fff9d6", silver:"#fffdf5", mist:"#ffd700", gold:"#ffd700", border:"rgba(255,215,0,.3)", glow:"rgba(255,215,0,.6)", heroGradient1:"rgba(255,215,0,.18)", heroGradient2:"#0f0820", heroGradient3:"#020105", heroGlow:"rgba(255,215,0,0.3)", heroAfter:"rgba(255,215,0,.12)", heroShadow:"rgba(255,215,0,.1)", ruleBorder:"rgba(255,215,0,.08)", starColor1:"rgba(255,215,0,.7)", starColor2:"rgba(255,215,0,.5)", starColor3:"rgba(255,215,0,.8)", starColor4:"rgba(255,215,0,.4)", starColor5:"rgba(255,215,0,.6)", starColor6:"rgba(255,215,0,.9)", accentRgb:"255,215,0" } }
  };

  function applyTheme(key) {
    const t = THEMES[key];
    if(!t) return;
    const root = document.documentElement;
    Object.entries(t.vars).forEach(([k,v])=>root.style.setProperty(`--${k}`, v));
    localStorage.setItem('starry-theme', key);
    updateStars(t.vars);
    
    // Activar efecto visual del tema
    triggerThemeEffect(key, t.vars);
    
    const toast = document.createElement('div');
    toast.className = 'theme-toast';
    toast.textContent = `Tema ${t.name} activado`;
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(),1600);
  }

  function updateStars(vars) {
    const stars = document.querySelector('.stars-bg');
    if(!stars) return;
    const g = `radial-gradient(1.5px 1.5px at 15% 12%, ${vars.starColor1} 0%, transparent 100%), radial-gradient(1px 1px at 62% 8%, ${vars.starColor2} 0%, transparent 100%), radial-gradient(1.2px 1.2px at 80% 22%, ${vars.starColor3} 0%, transparent 100%), radial-gradient(1.8px 1.8px at 33% 35%, ${vars.starColor4} 0%, transparent 100%), radial-gradient(1px 1px at 91% 47%, ${vars.starColor5} 0%, transparent 100%), radial-gradient(1.5px 1.5px at 7% 58%, ${vars.starColor6} 0%, transparent 100%), radial-gradient(1.2px 1.2px at 55% 65%, ${vars.starColor5} 0%, transparent 100%), radial-gradient(1px 1px at 73% 78%, ${vars.starColor4} 0%, transparent 100%), radial-gradient(1.8px 1.8px at 24% 82%, ${vars.starColor2} 0%, transparent 100%), radial-gradient(1.2px 1.2px at 44% 91%, ${vars.starColor3} 0%, transparent 100%), radial-gradient(1px 1px at 88% 94%, ${vars.starColor1} 0%, transparent 100%), radial-gradient(1.5px 1.5px at 3% 97%, ${vars.starColor6} 0%, transparent 100%)`;
    stars.style.backgroundImage = g;
  }

  // ================== EFECTOS VISUALES POR TEMA (MEJORADOS) ==================
  function triggerThemeEffect(themeKey, vars) {
    const layer = document.getElementById('themeEffectLayer');
    if(!layer) return;
    layer.innerHTML = '';
    layer.classList.add('active');
    
    const color1 = vars.v3 || '#f59e0b';
    const color2 = vars.v4 || '#fbbf24';
    const accent = vars.accentRgb || '251,191,36';
    
    let particleCount = 0;
    let createParticle = null;
    
    switch(themeKey) {
      case 'autumn':
        particleCount = 20;
        createParticle = () => {
          const el = document.createElement('div');
          el.className = 'theme-particle spark';
          el.style.background = `radial-gradient(circle, ${color1}, ${color2})`;
          el.style.boxShadow = `0 0 12px ${color1}`;
          el.style.left = Math.random() * 100 + '%';
          el.style.animation = `floatUp ${1.8 + Math.random()*2}s ease-out forwards`;
          el.style.width = el.style.height = (4 + Math.random()*10) + 'px';
          return el;
        };
        break;
      case 'sakura':
        particleCount = 35;
        createParticle = () => {
          const el = document.createElement('div');
          el.className = 'theme-particle petal';
          const hue = 330 + Math.random() * 30;
          el.style.background = `radial-gradient(circle at 30% 30%, hsl(${hue}, 80%, 85%), hsl(${hue}, 70%, 70%))`;
          el.style.boxShadow = `0 0 20px rgba(255, 192, 203, 0.8)`;
          el.style.left = Math.random() * 100 + '%';
          el.style.animation = `swayDown ${3 + Math.random()*4}s ease-in-out forwards`;
          el.style.width = (8 + Math.random()*15) + 'px';
          el.style.height = (8 + Math.random()*15) + 'px';
          el.style.transform = `rotate(${Math.random()*360}deg)`;
          return el;
        };
        break;
      case 'ember':
        particleCount = 25;
        createParticle = () => {
          const el = document.createElement('div');
          el.className = 'theme-particle ember';
          el.style.background = `radial-gradient(circle, #ff4500, ${color1})`;
          el.style.boxShadow = `0 0 15px #ff4500`;
          el.style.left = Math.random() * 100 + '%';
          el.style.animation = `floatUp ${1.5 + Math.random()*2}s ease-out forwards`;
          el.style.width = (5 + Math.random()*10) + 'px';
          el.style.height = (5 + Math.random()*10) + 'px';
          return el;
        };
        break;
      case 'frost':
        particleCount = 40;
        createParticle = () => {
          const el = document.createElement('div');
          el.className = 'theme-particle snow';
          el.style.background = `radial-gradient(circle at 25% 25%, #ffffff, #bae6fd)`;
          el.style.boxShadow = `0 0 25px rgba(255, 255, 255, 0.9)`;
          el.style.left = Math.random() * 100 + '%';
          el.style.animation = `driftSlow ${4 + Math.random()*5}s linear forwards`;
          el.style.width = (6 + Math.random()*12) + 'px';
          el.style.height = (6 + Math.random()*12) + 'px';
          el.style.opacity = 0.8 + Math.random()*0.2;
          return el;
        };
        break;
      case 'carbon':
        particleCount = 15;
        createParticle = () => {
          const el = document.createElement('div');
          el.className = 'theme-particle carbon';
          el.style.background = `radial-gradient(circle, #555, #222)`;
          el.style.left = Math.random() * 100 + '%';
          el.style.animation = `floatUp ${2 + Math.random()*3}s ease-out forwards`;
          el.style.width = (6 + Math.random()*8) + 'px';
          el.style.height = (6 + Math.random()*8) + 'px';
          return el;
        };
        break;
      case 'royalCarbon':
        particleCount = 18;
        createParticle = () => {
          const el = document.createElement('div');
          el.className = 'theme-particle royal';
          el.style.background = `radial-gradient(circle, ${color1}, ${color2})`;
          el.style.boxShadow = `0 0 20px ${color1}`;
          el.style.left = Math.random() * 100 + '%';
          el.style.animation = `floatUp ${1.8 + Math.random()*2.5}s ease-out forwards`;
          el.style.width = (4 + Math.random()*8) + 'px';
          el.style.height = (4 + Math.random()*8) + 'px';
          return el;
        };
        break;
      default: break;
    }
    
    if(createParticle) {
      for(let i=0; i<particleCount; i++) {
        setTimeout(() => {
          const p = createParticle();
          layer.appendChild(p);
          setTimeout(() => p.remove(), 8000);
        }, i * 60);
      }
    }
    
    // Neblina general sutil
    const fog = document.createElement('div');
    fog.className = 'theme-fog';
    fog.style.background = `radial-gradient(ellipse at 50% 50%, rgba(${accent},0.2) 0%, transparent 80%)`;
    layer.appendChild(fog);
    setTimeout(() => fog.remove(), 5000);
    
    setTimeout(() => layer.classList.remove('active'), 5000);
  }

  // ================== DRAWER (TEMAS) ==================
  function initDrawer() {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawerOverlay');
    const toggleBtn = document.getElementById('drawerToggleBtn');
    const closeBtn = document.getElementById('closeDrawerBtn');
    if(!drawer) return;
    const openDrawer = () => { drawer.classList.add('open'); overlay.classList.add('active'); };
    const closeDrawer = () => { drawer.classList.remove('open'); overlay.classList.remove('active'); };
    if(toggleBtn) toggleBtn.addEventListener('click', openDrawer);
    if(closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if(overlay) overlay.addEventListener('click', closeDrawer);
    
    const themeGrid = document.getElementById('themeGrid');
    if(themeGrid) {
      themeGrid.innerHTML = '';
      Object.keys(THEMES).forEach(key => {
        const btn = document.createElement('button');
        btn.textContent = THEMES[key].name;
        btn.className = 'theme-opt-drawer';
        btn.addEventListener('click', () => {
          applyTheme(key);
          closeDrawer();
        });
        themeGrid.appendChild(btn);
      });
    }
  }

  // ================== SCROLL PROGRESS ==================
  function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if(!progressBar) return;
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }

  // ================== CONTADOR DE GUERRA (con comunicación a mascota) ==================
  const warDays = [3,6,0];
  const warStartHour = 18, warEndHour = 22;
  
  // Referencia al iframe de la mascota
  let mascotaIframe = null;
  let lastWarState = false;
  let iframeCargado = false;
  
  function sendWarStateToMascota(isActive) {
    if (!mascotaIframe) {
      mascotaIframe = document.getElementById('mascotaIframe');
    }
    if (mascotaIframe && mascotaIframe.contentWindow && iframeCargado) {
      mascotaIframe.contentWindow.postMessage({
        tipo: 'guerra',
        activo: isActive
      }, '*');
    }
  }
  
  function sendVarianteToMascota(variante) {
    if (!mascotaIframe) {
      mascotaIframe = document.getElementById('mascotaIframe');
    }
    if (mascotaIframe && mascotaIframe.contentWindow && iframeCargado) {
      mascotaIframe.contentWindow.postMessage({
        tipo: 'cambiarVariante',
        variante: variante
      }, '*');
    }
  }
  
  function updateWarCountdown() {
    const now = getBoliviaTime();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour*60+currentMinute;
    const isWarDay = warDays.includes(currentDay);
    const isWithin = (currentTimeMinutes >= warStartHour*60 && currentTimeMinutes < warEndHour*60);
    const isActive = isWarDay && isWithin;
    
    const warTabBtn = document.querySelector('.tab-btn[data-view="guerras"]');
    const warStatusBadge = document.getElementById('warStatusBadge');
    const warTimer = document.getElementById('warTimer');
    const warNextInfo = document.getElementById('warNextInfo');
    
    if(warTabBtn) isActive ? warTabBtn.classList.add('war-glow') : warTabBtn.classList.remove('war-glow');
    
    // Notificar a la mascota si cambió el estado de guerra
    if (isActive !== lastWarState) {
      lastWarState = isActive;
      sendWarStateToMascota(isActive);
    }
    
    if(isActive) {
      if(warStatusBadge) warStatusBadge.innerHTML = "GUERRA ACTIVA AHORA";
      const end = new Date(now); end.setHours(warEndHour,0,0,0);
      let diff = end-now;
      if(diff<0) diff=0;
      const h = Math.floor(diff/3600000);
      const m = Math.floor((diff%3600000)/60000);
      if(warTimer) warTimer.innerHTML = `${h.toString().padStart(2,'0')}h ${m.toString().padStart(2,'0')}m`;
      if(warNextInfo) warNextInfo.innerHTML = "La guerra termina en";
    } else {
      if(warStatusBadge) warStatusBadge.innerHTML = "PRÓXIMA GUERRA";
      let next = new Date(now);
      let found = false;
      for(let i=0;i<=7;i++) {
        let d = new Date(now); d.setDate(now.getDate()+i);
        if(warDays.includes(d.getDay())) {
          let start = new Date(d); start.setHours(warStartHour,0,0,0);
          if(!(d.getTime()===now.getTime() && currentTimeMinutes>=warStartHour*60)) {
            next = start; found=true; break;
          }
        }
      }
      if(!found) {
        let days = (7-currentDay)%7;
        if(days===0 && currentTimeMinutes>=warStartHour*60) days=7;
        next = new Date(now); next.setDate(now.getDate()+days); next.setHours(warStartHour,0,0,0);
      }
      let diff = next-now;
      if(diff>0) {
        let days = Math.floor(diff/(86400000));
        let hours = Math.floor((diff%86400000)/3600000);
        let mins = Math.floor((diff%3600000)/60000);
        if(warTimer) warTimer.innerHTML = `${days}d ${hours.toString().padStart(2,'0')}h ${mins.toString().padStart(2,'0')}m`;
      }
      if(warNextInfo) warNextInfo.innerHTML = "Próxima guerra en";
    }
  }

  // ================== CÓDIGO DE HONOR (TEXTO COMPLETO) ==================
  function renderHonorContent() {
    const container = document.getElementById('honorContent');
    if(!container) return;
    const reglas = [
      { titulo:'Guerras', desc:'Mínimo 2 participaciones semanales obligatorias en guerra. Tu contribución es vital para el clan.' },
      { titulo:'Respeto', desc:'Cero toxicidad. Respetamos a todos nuestros compañeros dentro y fuera del clan.' },
      { titulo:'Actividad', desc:'Inactividad mayor a 4 días sin aviso previo resulta en expulsión automática.' },
      { titulo:'Comunicación', desc:'Participa en el grupo de WhatsApp. La coordinación es esencial para ganar.' },
      { titulo:'Aporte', desc:'Se espera participación diaria. Un guerrero activo es un guerrero valioso.' },
      { titulo:'Faltas', desc:'Máximo 2 faltas por semana. Acumular más faltas puede resultar en sanciones o expulcion inmediata.' },
      { titulo:'contexto', desc:'Romper alguna de las reglas de honor anteriores puede ocacionar o falta o expulcion.' }
    ];
    
    let html = '';
    reglas.forEach(r => {
      html += `<p><strong>${r.titulo}</strong> ${r.desc}</p>`;
    });
    container.innerHTML = html;
  }

  // ================== JERARQUÍA ==================
  function renderJerarquia() {
    const selector = document.getElementById('rankSelector');
    const detail = document.getElementById('rankDetail');
    if(!selector || !detail) return;
    const ranks = [
      { id:'lider', nombre:'Líder', descripcion:'Fundador y máxima autoridad del clan. Toma decisiones estratégicas finales y gestiona alianzas con otros clanes.', perks:'Decisión Final | Alianzas | Reclutamiento VIP | Gestión General' },
      { id:'colider', nombre:'Colíder', descripcion:'Brazo derecho del líder. Gestiona reclutamiento de nuevos miembros, coordina guerras de clan y aplica sanciones.', perks:'Reclutamiento | Coordinación | Sanciones | Moderación' },
      { id:'elite', nombre:'Decano', descripcion:'Núcleo competitivo del clan. Participan en guerras prioritarias, proponen estrategias y actúan como mentores.', perks:'Guerras Prioritarias | Voto Estratégico | Mentoría | Privilegios' },
      { id:'recluta', nombre:'Recluta', descripcion:'Período de prueba de 1 semana. Debes demostrar habilidad en combate y actitud positiva hacia el clan.', perks:'Prueba 7 Días | Participación Limitada | Capacitación' }
    ];
    selector.innerHTML = ranks.map(r => `<button class="rank-btn" data-rank="${r.id}">${r.nombre}</button>`).join('');
    const showRank = (id) => {
      const r = ranks.find(rr=>rr.id===id);
      if(r) {
        const perks = r.perks.split('|').map(p=>`<span class="perk">${p.trim()}</span>`).join('');
        detail.innerHTML = `<h3>${r.nombre}</h3><p>${r.descripcion}</p><div class="rk-perks">${perks}</div>`;
      }
    };
    selector.querySelectorAll('.rank-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selector.querySelectorAll('.rank-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        showRank(btn.dataset.rank);
      });
    });
    if(selector.querySelector('.rank-btn')) {
      selector.querySelector('.rank-btn').classList.add('active');
      showRank('lider');
    }
  }

  // ================== SHOP MODAL ==================
  function initShopModal() {
    const modal = document.getElementById('shopModal');
    const openBtn = document.getElementById('shopModalBtn');
    const closeBtn = document.getElementById('closeShopModal');
    
    if(openBtn && modal && closeBtn) {
      openBtn.addEventListener('click', () => modal.style.display = 'flex');
      closeBtn.addEventListener('click', () => modal.style.display = 'none');
      modal.addEventListener('click', (e) => { if(e.target === modal) modal.style.display = 'none'; });
    }
  }

  // ================== BIO SIMULATOR MODAL ==================
  function initBioSimModal() {
    const modal = document.getElementById('bioSimModal');
    const openBtn = document.getElementById('bioSimBtn');
    const closeBtn = document.getElementById('closeBioSimModal');
    
    if(openBtn && modal && closeBtn) {
      openBtn.addEventListener('click', () => modal.style.display = 'flex');
      closeBtn.addEventListener('click', () => modal.style.display = 'none');
      modal.addEventListener('click', (e) => { if(e.target === modal) modal.style.display = 'none'; });
    }
  }

  // ================== WAR INFORMED (REDIRECCIÓN A PÁGINA INDEPENDIENTE) ==================
  function initWarInformed() {
    const warBtn = document.getElementById('warInformedBtn');
    if(warBtn) {
      warBtn.addEventListener('click', () => {
        window.location.href = './warinformed/';
      });
    }
  }

  // ================== SINCRONIZACIÓN DE TEMA CON IFRAMES ==================
  function setupThemeSync() {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.tipo === 'solicitarTema') {
        const iframe = event.source.frameElement;
        if (iframe && iframe.contentWindow) {
          const styles = getComputedStyle(document.documentElement);
          const themeVars = {};
          const varNames = ['void', 'deep', 'card', 'card2', 'v1', 'v2', 'v3', 'v4', 'silver', 'mist', 'gold', 'border', 'glow', 'heroGradient1', 'heroGradient2', 'heroGradient3', 'heroGlow', 'heroAfter', 'heroShadow', 'ruleBorder', 'starColor1', 'starColor2', 'starColor3', 'starColor4', 'starColor5', 'starColor6', 'accentRgb'];
          varNames.forEach(name => {
            themeVars[name] = styles.getPropertyValue(`--${name}`).trim();
          });
          iframe.contentWindow.postMessage({ tipo: 'setTema', variables: themeVars }, '*');
        }
      }
    });
  }

  // ================== MODO DUAL: LOGO / MASCOTA (CONTROL DESDE DRAWER) ==================
  const MODO_STORAGE_KEY = 'rk_modo_inicio';
  const VARIANTE_STORAGE_KEY = 'mascotaVariante';
  const MODO_LOGO = 'logo';
  const MODO_MASCOTA = 'mascota';
  
  let currentModo = MODO_LOGO;
  let currentVariante = 1;
  const modoLogoDiv = document.getElementById('modoLogo');
  const modoMascotaDiv = document.getElementById('modoMascota');
  const drawerToggleBtn = document.getElementById('drawerToggleModoBtn');
  const modoIcon = drawerToggleBtn?.querySelector('.modo-icon');
  const modoText = drawerToggleBtn?.querySelector('.modo-text');
  const variantesSelector = document.getElementById('variantesSelector');
  const varianteBtns = document.querySelectorAll('.variante-opt');
  
  function actualizarBotonDrawer() {
    if (!drawerToggleBtn) return;
    if (currentModo === MODO_MASCOTA) {
      if (modoIcon) modoIcon.textContent = '☬';
      if (modoText) modoText.textContent = 'Cambiar a Logo';
      if (variantesSelector) variantesSelector.style.display = 'block';
    } else {
      if (modoIcon) modoIcon.textContent = '🐾';
      if (modoText) modoText.textContent = 'Cambiar a Mascota';
      if (variantesSelector) variantesSelector.style.display = 'none';
    }
  }
  
  function actualizarVarianteActiva(variante) {
    varianteBtns.forEach(btn => {
      const val = parseInt(btn.dataset.variante, 10);
      if (val === variante) {
        btn.classList.add('activo');
      } else {
        btn.classList.remove('activo');
      }
    });
  }
  
  function setModo(modo) {
    if (!modoLogoDiv || !modoMascotaDiv) return;
    
    if (modo === MODO_MASCOTA) {
      modoLogoDiv.style.display = 'none';
      modoMascotaDiv.style.display = 'block';
      currentModo = MODO_MASCOTA;
      
      // Enviar estado inicial al iframe cuando esté listo (se hace en el onload)
    } else {
      modoLogoDiv.style.display = 'block';
      modoMascotaDiv.style.display = 'none';
      currentModo = MODO_LOGO;
    }
    
    actualizarBotonDrawer();
    localStorage.setItem(MODO_STORAGE_KEY, modo);
  }
  
  function toggleModo() {
    setModo(currentModo === MODO_LOGO ? MODO_MASCOTA : MODO_LOGO);
  }
  
  function cambiarVariante(variante) {
    if (variante === currentVariante) return;
    currentVariante = variante;
    localStorage.setItem(VARIANTE_STORAGE_KEY, variante);
    actualizarVarianteActiva(variante);
    
    // Enviar mensaje a la mascota si está en modo mascota y el iframe está cargado
    if (currentModo === MODO_MASCOTA) {
      sendVarianteToMascota(variante);
    }
  }
  
  function initModoDual() {
    if (!modoLogoDiv || !modoMascotaDiv || !drawerToggleBtn) return;
    
    // Recuperar variante guardada
    const savedVariante = localStorage.getItem(VARIANTE_STORAGE_KEY);
    if (savedVariante) {
      currentVariante = parseInt(savedVariante, 10);
    }
    actualizarVarianteActiva(currentVariante);
    
    // Configurar botones de variante
    varianteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const variante = parseInt(btn.dataset.variante, 10);
        cambiarVariante(variante);
      });
    });
    
    const savedModo = localStorage.getItem(MODO_STORAGE_KEY);
    if (savedModo === MODO_MASCOTA || savedModo === MODO_LOGO) {
      setModo(savedModo);
    } else {
      setModo(MODO_LOGO);
    }
    
    drawerToggleBtn.addEventListener('click', toggleModo);
    
    // Referencia al iframe y configuración de carga
    mascotaIframe = document.getElementById('mascotaIframe');
    if (mascotaIframe) {
      mascotaIframe.addEventListener('load', () => {
        iframeCargado = true;
        // Enviar estado inicial de guerra y variante
        const now = getBoliviaTime();
        const currentDay = now.getDay();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeMinutes = currentHour*60+currentMinute;
        const isWarDay = warDays.includes(currentDay);
        const isWithin = (currentTimeMinutes >= warStartHour*60 && currentTimeMinutes < warEndHour*60);
        const isActive = isWarDay && isWithin;
        lastWarState = isActive;
        sendWarStateToMascota(isActive);
        sendVarianteToMascota(currentVariante);
      });
    }
    
    // Forzar envío del estado de guerra inicial sin esperar al intervalo
    const now = getBoliviaTime();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour*60+currentMinute;
    const isWarDay = warDays.includes(currentDay);
    const isWithin = (currentTimeMinutes >= warStartHour*60 && currentTimeMinutes < warEndHour*60);
    const isActive = isWarDay && isWithin;
    lastWarState = isActive;
  }

  // ================== NAVEGACIÓN ==================
  function initNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.view');
    tabs.forEach(btn=>{
      btn.addEventListener('click',()=>{
        const target = btn.dataset.view;
        tabs.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        views.forEach(v=>v.classList.remove('active'));
        const activeView = document.getElementById('view-'+target);
        if(activeView) activeView.classList.add('active');
        window.scrollTo({top:0,behavior:'smooth'});
      });
    });
  }

  // ================== TOGGLES DE GUERRA ==================
  function initWarToggles() {
    document.querySelectorAll('.war-expand-btn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        const panelId = btn.dataset.expand;
        const panel = document.getElementById('war-' + panelId);
        if(panel) {
          const isOpen = panel.style.display !== 'none';
          document.querySelectorAll('.war-panel').forEach(p => p.style.display = 'none');
          document.querySelectorAll('.war-expand-btn').forEach(b => b.style.opacity = '1');
          if(!isOpen) {
            panel.style.display = 'block';
            btn.style.opacity = '0.7';
          }
        }
      });
    });
  }

  // ================== INICIALIZACIÓN GENERAL ==================
  function initAll() {
    const savedTheme = localStorage.getItem('starry-theme');
    if(savedTheme && THEMES[savedTheme]) applyTheme(savedTheme);
    else applyTheme('royalCarbon');
    
    initDrawer();
    initScrollProgress();
    renderHonorContent();
    renderJerarquia();
    initShopModal();
    initBioSimModal();
    initWarInformed();       // NUEVO: Redirige a WAR INFORMED
    setupThemeSync();
    // initChatCenter();     // Desactivado
    initModoDual();
    initWarToggles();
    setInterval(updateWarCountdown,1000);
    updateWarCountdown();
    initNavigation();
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
    
    if('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{ if(e.isIntersecting){ e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; } });
      }, { threshold:0.1, rootMargin:'20px' });
      document.querySelectorAll('.rank-detail, .war-info-card, .shop-access-card').forEach(el=>{
        if(el) {
          el.style.opacity='0'; el.style.transform='translateY(15px)'; el.style.transition='opacity 0.6s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
          obs.observe(el);
        }
      });
    }
  }

  checkWeeklyPassword();
})();