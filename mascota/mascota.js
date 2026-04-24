(function(){
  "use strict";

  // ---------- CONFIGURACIÓN EDITABLE ----------
  const FRAMES_POR_FILA = [
    8,  // fila 0: idle
    6,  // fila 1: sleep
    6,  // fila 2: bored
    6,  // fila 3: happy (1 toque)
    6,  // fila 4: excited (2 toques)
    6,  // fila 5: special (3 toques)
    6,  // fila 6: surprise (4 toques)
    8,  // fila 7: war_idle
    6,  // fila 8: war_battlecry (2 toques en guerra)
    6,  // fila 9: war_victory (4 toques en guerra)
  ];

  const FPS_POR_FILA = [
    8,   // idle
    4,   // sleep
    6,   // bored
    10,  // happy
    12,  // excited
    10,  // special
    8,   // surprise
    8,   // war_idle
    12,  // war_battlecry
    10   // war_victory
  ];

  // ---------- CONSTANTES ----------
  const FRAME_SIZE = 32;
  const CANVAS_SIZE = 320;
  const DOUBLE_TAP_WINDOW = 1800;
  const IDLE_CYCLE_DELAY = 5000;
  const IDLE_REPEAT_COUNT = 4;      // repeticiones para animaciones idle
  const TAP_REPEAT_COUNT = 2;       // repeticiones para animaciones por toque

  const ROWS = {
    idle: 0,
    sleep: 1,
    bored: 2,
    happy: 3,
    excited: 4,
    special: 5,
    surprise: 6,
    war_idle: 7,
    war_battlecry: 8,
    war_victory: 9
  };

  // ---------- ESTADO GLOBAL ----------
  let canvas, ctx;
  let fondoImg, plataformaImg;
  let spriteSheet = new Image();
  let modoGuerra = false;
  let currentVariante = 1;
  
  let currentRow = ROWS.idle;
  let currentFrame = 0;
  let animationLoop = null;
  let isPlayingSpecial = false;
  
  let tapCount = 0;
  let lastTapTime = 0;
  let tapTimer = null;
  
  let idleCycleTimer = null;
  let idleAnimations = [ROWS.idle, ROWS.bored, ROWS.sleep];
  
  let repeatRemaining = 0;
  let repeatRow = ROWS.idle;
  let isRepeating = false;
  
  let imagesLoaded = false;
  let pendingLoad = false;

  // ---------- INICIALIZACIÓN ----------
  function init() {
    canvas = document.getElementById('mascotaCanvas');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    fondoImg = document.getElementById('fondo');
    plataformaImg = document.getElementById('plataforma');
    
    // Mostrar texto de carga
    mostrarCarga(true);
    
    // Cargar variante guardada
    const savedVariante = localStorage.getItem('mascotaVariante');
    if (savedVariante) currentVariante = parseInt(savedVariante, 10);
    
    cargarSpriteSheet(currentVariante);
    
    // Escuchar mensajes de la página padre
    window.addEventListener('message', (event) => {
      if (!event.data) return;
      
      if (event.data.tipo === 'guerra') {
        modoGuerra = event.data.activo === true;
        actualizarFondoYGuerra();
        if (!isPlayingSpecial && !isRepeating) {
          reiniciarAnimacionIdle();
        }
      }
      
      if (event.data.tipo === 'cambiarVariante') {
        const nuevaVariante = event.data.variante;
        if (nuevaVariante >= 1 && nuevaVariante <= 3 && nuevaVariante !== currentVariante) {
          currentVariante = nuevaVariante;
          localStorage.setItem('mascotaVariante', nuevaVariante);
          cargarSpriteSheet(currentVariante);
        }
      }
    });
    
    // Eventos de toque
    canvas.addEventListener('click', manejarToque);
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        manejarToque();
      }
    }, { passive: false });
    
    // Avisar al padre que ya cargó
    window.parent.postMessage({ tipo: 'cargado' }, '*');
  }

  // ---------- CARGA DE SPRITESHEET ----------
  function cargarSpriteSheet(variante) {
    imagesLoaded = false;
    pendingLoad = true;
    mostrarCarga(true);
    
    spriteSheet.onload = () => {
      imagesLoaded = true;
      pendingLoad = false;
      mostrarCarga(false);
      if (!isPlayingSpecial && !isRepeating) {
        reiniciarAnimacionIdle();
      }
      iniciarCicloIdle();
    };
    spriteSheet.onerror = () => {
      console.error('Error al cargar spritesheet');
      mostrarCarga(false);
      ctx.fillStyle = '#f44336';
      ctx.font = 'bold 16px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('Error de carga', 160, 160);
    };
    spriteSheet.src = `/mascota/sprites/mascota-${variante}.png`;
  }

  function mostrarCarga(mostrar) {
    if (mostrar) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('Cargando...', 160, 160);
    } else {
      dibujarFrame();
    }
  }

  // ---------- MODO GUERRA ----------
  function actualizarFondoYGuerra() {
    const indicator = document.getElementById('estadoIndicator');
    if (modoGuerra) {
      fondoImg.src = '/mascota/sprites/fondo-guerra.png';
      plataformaImg.src = '/mascota/sprites/plataforma-guerra.png';
      indicator.classList.add('guerra');
      indicator.title = 'Modo guerra activo';
    } else {
      fondoImg.src = '/mascota/sprites/fondo.png';
      plataformaImg.src = '/mascota/sprites/plataforma.png';
      indicator.classList.remove('guerra');
      indicator.title = 'Modo normal';
    }
  }

  // ---------- DETECCIÓN DE TOQUES ----------
  function manejarToque() {
    const now = Date.now();
    detenerCicloIdle();
    
    // No interrumpir animaciones críticas de guerra
    if (isPlayingSpecial) {
      if (currentRow === ROWS.war_battlecry || currentRow === ROWS.war_victory) return;
    }
    
    if (now - lastTapTime < DOUBLE_TAP_WINDOW) {
      tapCount++;
    } else {
      tapCount = 1;
    }
    lastTapTime = now;
    
    if (tapTimer) clearTimeout(tapTimer);
    
    tapTimer = setTimeout(() => {
      ejecutarAnimacionPorToques(tapCount);
      tapCount = 0;
      tapTimer = null;
    }, DOUBLE_TAP_WINDOW);
  }

  function ejecutarAnimacionPorToques(count) {
    let row;
    if (modoGuerra) {
      if (count === 1) row = ROWS.happy;
      else if (count === 2) row = ROWS.war_battlecry;
      else if (count >= 3) row = ROWS.war_victory;
      else row = ROWS.war_idle;
    } else {
      if (count === 1) row = ROWS.happy;
      else if (count === 2) row = ROWS.excited;
      else if (count === 3) row = ROWS.special;
      else if (count >= 4) row = ROWS.surprise;
      else row = ROWS.idle;
    }
    
    playSpecialAnimation(row, TAP_REPEAT_COUNT);
  }

  // ---------- ANIMACIONES ----------
  function playSpecialAnimation(row, repeticiones = 1) {
    isPlayingSpecial = true;
    isRepeating = (repeticiones > 1);
    currentRow = row;
    currentFrame = 0;
    repeatRemaining = repeticiones - 1;
    repeatRow = row;
    
    const totalFrames = FRAMES_POR_FILA[row] || 8;
    const fps = FPS_POR_FILA[row] || 8;
    const frameDelay = 1000 / fps;
    
    if (animationLoop) cancelAnimationFrame(animationLoop);
    
    let lastTime = performance.now();
    
    function step(now) {
      if (!imagesLoaded) {
        animationLoop = requestAnimationFrame(step);
        return;
      }
      
      const elapsed = now - lastTime;
      
      if (elapsed >= frameDelay) {
        dibujarFrame();
        currentFrame++;
        lastTime = now;
      }
      
      if (currentFrame < totalFrames) {
        animationLoop = requestAnimationFrame(step);
      } else {
        // Terminó una repetición
        if (repeatRemaining > 0) {
          repeatRemaining--;
          currentFrame = 0;
          animationLoop = requestAnimationFrame(step);
        } else {
          isPlayingSpecial = false;
          isRepeating = false;
          reiniciarAnimacionIdle();
          iniciarCicloIdle();
        }
      }
    }
    
    animationLoop = requestAnimationFrame(step);
  }

  function iniciarAnimacion(row) {
    currentRow = row;
    currentFrame = 0;
    isPlayingSpecial = false;
    isRepeating = false;
    
    const totalFrames = FRAMES_POR_FILA[row] || 8;
    const fps = FPS_POR_FILA[row] || 8;
    const frameDelay = 1000 / fps;
    
    if (animationLoop) cancelAnimationFrame(animationLoop);
    
    let lastTime = performance.now();
    
    function loop(now) {
      if (!imagesLoaded) {
        animationLoop = requestAnimationFrame(loop);
        return;
      }
      
      const elapsed = now - lastTime;
      
      if (elapsed >= frameDelay) {
        dibujarFrame();
        currentFrame = (currentFrame + 1) % totalFrames;
        lastTime = now;
      }
      
      animationLoop = requestAnimationFrame(loop);
    }
    
    animationLoop = requestAnimationFrame(loop);
  }

  function reiniciarAnimacionIdle() {
    if (isPlayingSpecial || isRepeating) return;
    const row = modoGuerra ? ROWS.war_idle : ROWS.idle;
    iniciarAnimacion(row);
  }

  function dibujarFrame() {
    if (!imagesLoaded) return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const sx = currentFrame * FRAME_SIZE;
    const sy = currentRow * FRAME_SIZE;
    ctx.drawImage(
      spriteSheet,
      sx, sy, FRAME_SIZE, FRAME_SIZE,
      0, 0, CANVAS_SIZE, CANVAS_SIZE
    );
  }

  // ---------- CICLO DE IDLE ----------
  function iniciarCicloIdle() {
    detenerCicloIdle();
    programarSiguienteIdle();
  }

  function programarSiguienteIdle() {
    idleCycleTimer = setTimeout(() => {
      if (isPlayingSpecial || isRepeating || !imagesLoaded) {
        programarSiguienteIdle();
        return;
      }
      const randomRow = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
      playSpecialAnimation(randomRow, IDLE_REPEAT_COUNT);
    }, IDLE_CYCLE_DELAY);
  }

  function detenerCicloIdle() {
    if (idleCycleTimer) {
      clearTimeout(idleCycleTimer);
      idleCycleTimer = null;
    }
  }

  // ---------- ARRANCAR ----------
  init();
})();