/* ==========================================================================
   BIT-TEX - CORE ENGINE (script.js)
   ========================================================================== */

let framesData = [];
let activeFrameIndex = 0;
let framesArray = [];
let isPlaying = false;
let currentFrameIndex = 0;
let animationRequestId = null;
let lastFrameTime = 0;
let activeFPS = 4;

const LIMITS = { FPS: 20, FRAMES: 200, LINES: 50, CHARS: 80 };
const SEPARATOR = "===ASCII_FRAME_BOUNDARY===";

// Configuración de escala y límite
const escalasPermitidas = [1, 2, 4, 8, 12];
let escalaSeleccionada = 4;
const LIMITE_PX = 1500;

// --- SELECCIÓN DE ELEMENTOS DEL DOM ---
const linesInput = document.getElementById('linesPerFrame');
const charsInput = document.getElementById('charsPerLine');
const fpsInput = document.getElementById('fps');

const activeCanvas = document.getElementById('activeCanvas');
const canvasTitle = document.getElementById('canvasTitle');
const timelineContainer = document.getElementById('timeline');
const display = document.getElementById('display');
const screenWrapper = document.getElementById('screenWrapper');
const statCurrent = document.getElementById('statCurrent');

const btnAddFrame = document.getElementById('btnAddFrame');
const btnDeleteFrame = document.getElementById('btnDeleteFrame');
const btnDuplicateFrame = document.getElementById('btnDuplicateFrame');

const btnPlayPause = document.getElementById('btnPlayPause');
const playPauseIcon = document.getElementById('playPauseIcon');
const btnSettingsTrigger = document.getElementById('btnSettingsTrigger');
const settingsDropdown = document.getElementById('settingsDropdown');

const modalSave = document.getElementById('modalSave');
const modalVault = document.getElementById('modalVault');
const modalInfo = document.getElementById('modalInfo');
const modalWelcome = document.getElementById('modalWelcome');
const modalGifLoading = document.getElementById('modalGifLoading');
const modalGifConfig = document.getElementById('modalGifConfig');

const btnSaveMenu = document.getElementById('btnSaveMenu');
const btnVaultMenu = document.getElementById('btnVaultMenu');
const btnInfoTrigger = document.getElementById('btnInfoTrigger');

const btnCloseSaveModal = document.getElementById('btnCloseSaveModal');
const btnCloseVaultModal = document.getElementById('btnCloseVaultModal');
const btnCloseInfoModal = document.getElementById('btnCloseInfoModal');
const btnCloseWelcomeModal = document.getElementById('btnCloseWelcomeModal');
const btnCloseConfigModal = document.getElementById('btnCloseConfigModal');

const btnExportTxt = document.getElementById('btnExportTxt');
const btnImportTxt = document.getElementById('btnImportTxt');
const btnSaveToVault = document.getElementById('btnSaveToVault');
const vaultSlotsContainer = document.getElementById('vaultSlotsContainer');

const btnExportGif = document.getElementById('btnExportGif');
const btnConfirmGif = document.getElementById('btnConfirmGif');
const gifAspectRatioSelect = document.getElementById('gifAspectRatio');

const gifScaleDisplay = document.getElementById('gifScaleDisplay');
const gifScaleDecrement = document.getElementById('gifScaleDecrement');
const gifScaleIncrement = document.getElementById('gifScaleIncrement');

const initialFrames = [
    ` [======] \n |  ||  | \n |  o   | \n |      | \n [======]`,
    ` [======] \n |      | \n |  o== | \n |      | \n [======]`,
    ` [======] \n |      | \n |  o   | \n |  ||  | \n [======]`,
    ` [======] \n |      | \n |==o   | \n |      | \n [======]`
];

// --- SPLASH ---
function ejecutarSplashScreen(callback) {
    const splash = document.getElementById('splashScreen');
    const progress = document.getElementById('splashProgress');
    const text = document.getElementById('splashText');
    let start = performance.now();
    function stepAnim(timestamp) {
        let elapsed = timestamp - start;
        if (elapsed <= 1500) {
            let p = elapsed / 1500;
            progress.style.width = `${Math.floor(p * 100)}%`;
            text.textContent = `> CARGANDO SISTEMAS... ${Math.floor(p * 100)}%`;
            requestAnimationFrame(stepAnim);
        } else {
            splash.classList.add('fade-out');
            if(callback) callback();
        }
    }
    requestAnimationFrame(stepAnim);
}

function comprobarUsuarioNuevo() {
    if (!localStorage.getItem('ascii_has_visited')) {
        abrirModal(modalWelcome);
        localStorage.setItem('ascii_has_visited', 'true');
    }
}

// --- GESTIÓN DE MODALES ---
function abrirModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    if (isPlaying) togglePlayPause();
}

function cerrarModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
}

// --- EVENTOS DE MODALES ---
btnSettingsTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsDropdown.classList.toggle('open');
});
document.addEventListener('click', () => settingsDropdown.classList.remove('open'));
settingsDropdown.addEventListener('click', (e) => e.stopPropagation());

btnSaveMenu.addEventListener('click', () => abrirModal(modalSave));
btnVaultMenu.addEventListener('click', () => { renderizarBaul(); abrirModal(modalVault); });
btnInfoTrigger.addEventListener('click', () => { settingsDropdown.classList.remove('open'); abrirModal(modalInfo); });

btnCloseSaveModal.addEventListener('click', () => cerrarModal(modalSave));
btnCloseVaultModal.addEventListener('click', () => cerrarModal(modalVault));
btnCloseInfoModal.addEventListener('click', () => cerrarModal(modalInfo));
btnCloseWelcomeModal.addEventListener('click', () => cerrarModal(modalWelcome));
btnCloseConfigModal.addEventListener('click', () => cerrarModal(modalGifConfig));

// --- CONTROL DE ENTRADAS ---
function clampInputs() {
    if (parseInt(fpsInput.value) > LIMITS.FPS) fpsInput.value = LIMITS.FPS;
    if (parseInt(linesInput.value) > LIMITS.LINES) linesInput.value = LIMITS.LINES;
    if (parseInt(charsInput.value) > LIMITS.CHARS) charsInput.value = LIMITS.CHARS;
}
[linesInput, charsInput, fpsInput].forEach(input => {
    input.addEventListener('change', clampInputs);
});

// --- CANVAS ACTIVO ---
activeCanvas.addEventListener('input', () => { validarCanvas(); });

function cargarLienzoActivo() {
    activeCanvas.value = framesData[activeFrameIndex] || "";
    canvasTitle.textContent = `LIENZO #${activeFrameIndex + 1}`;
}

// --- TIMELINE ---
function renderizarTimeline() {
    timelineContainer.innerHTML = '';
    framesData.forEach((_, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'frame-thumb';
        thumb.dataset.index = index;
        if (!isPlaying && index === activeFrameIndex) {
            thumb.classList.add('active');
        }
        thumb.addEventListener('click', () => {
            if (isPlaying) togglePlayPause();
            activeFrameIndex = index;
            cargarLienzoActivo();
            renderizarTimeline();
            actualizarStats(activeFrameIndex);
            display.textContent = framesArray[activeFrameIndex];
            autoEscalarVisor();
        });
        timelineContainer.appendChild(thumb);
    });
}

function resaltarFrameTimeline(index) {
    const thumbs = timelineContainer.querySelectorAll('.frame-thumb');
    thumbs.forEach((thumb, i) => {
        thumb.classList.remove('active', 'playback-active');
        if (i === index) {
            thumb.classList.add('playback-active');
            thumb.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    });
}

function actualizarStats(indexMostrar) {
    statCurrent.textContent = `${indexMostrar + 1}/${framesData.length}`;
}

// --- ESCALADO AUTOMÁTICO DEL VISOR ---
function autoEscalarVisor() {
    display.style.transform = 'scale(1)';
    const contenedorW = screenWrapper.clientWidth - 20;
    const contenedorH = screenWrapper.clientHeight - 20;
    const textoW = display.offsetWidth;
    const textoH = display.offsetHeight;
    if (textoW === 0 || textoH === 0) return;
    const escalaFinal = Math.min(contenedorW / textoW, contenedorH / textoH);
    display.style.transform = `scale(${escalaFinal})`;
}
window.addEventListener('resize', autoEscalarVisor);

// --- VALIDACIÓN DEL TEXTO EN EL EDITOR ---
function validarCanvas() {
    let linesPerFrame = parseInt(linesInput.value) || 5;
    let charsPerLine = parseInt(charsInput.value) || 10;
    let lines = activeCanvas.value.split('\n');
    if (lines.length > linesPerFrame) lines = lines.slice(0, linesPerFrame);
    const nuevoTexto = lines.map(line => line.substring(0, charsPerLine)).join('\n');
    activeCanvas.value = nuevoTexto;
    framesData[activeFrameIndex] = activeCanvas.value;
    if (!isPlaying) {
        compilarAnimacion();
        display.textContent = framesArray[activeFrameIndex];
        autoEscalarVisor();
    }
}

// --- COMPILACIÓN DE FRAMES ---
function compilarAnimacion() {
    let linesPerFrame = parseInt(linesInput.value) || 5;
    let charsPerLine = parseInt(charsInput.value) || 10;
    framesArray = framesData.map(frameText => {
        let lines = frameText.split('\n');
        while (lines.length < linesPerFrame) lines.push('');
        return lines.map(line => line.substring(0, charsPerLine).padEnd(charsPerLine, ' ')).join('\n');
    });
}

// --- REPRODUCTOR ---
function togglePlayPause() {
    if (!isPlaying) {
        if (framesData.length === 0) return;
        clampInputs();
        compilarAnimacion();
        activeFPS = Math.min(parseInt(fpsInput.value) || 4, LIMITS.FPS);
        isPlaying = true;
        screenWrapper.classList.add('playing');
        playPauseIcon.className = "btn-sprite sprite-pausa"; // CORREGIDO
        lastFrameTime = performance.now();
        renderizarTimeline();
        resaltarFrameTimeline(0);
        animationRequestId = requestAnimationFrame(animate);
    } else {
        isPlaying = false;
        cancelAnimationFrame(animationRequestId);
        screenWrapper.classList.remove('playing');
        playPauseIcon.className = "btn-sprite sprite-play";
        currentFrameIndex = 0;
        volverAlEditor();
        const thumbs = timelineContainer.querySelectorAll('.frame-thumb');
        thumbs.forEach(t => t.classList.remove('playback-active'));
        renderizarTimeline();
    }
}
btnPlayPause.addEventListener('click', togglePlayPause);

function animate(timestamp) {
    if (!isPlaying) return;
    const interval = 1000 / activeFPS;
    const elapsed = timestamp - lastFrameTime;
    if (elapsed > interval) {
        lastFrameTime = timestamp - (elapsed % interval);
        display.textContent = framesArray[currentFrameIndex];
        resaltarFrameTimeline(currentFrameIndex);
        currentFrameIndex = (currentFrameIndex + 1) % framesArray.length;
    }
    animationRequestId = requestAnimationFrame(animate);
}

function volverAlEditor() {
    renderizarTimeline();
    display.textContent = framesArray[activeFrameIndex];
    actualizarStats(activeFrameIndex);
}

// --- EDICIÓN DE FOTOGRAMAS ---
btnAddFrame.addEventListener('click', () => {
    framesData.push("");
    activeFrameIndex = framesData.length - 1;
    cargarLienzoActivo();
    renderizarTimeline();
    actualizarStats(activeFrameIndex);
});
btnDuplicateFrame.addEventListener('click', () => {
    framesData.splice(activeFrameIndex + 1, 0, framesData[activeFrameIndex]);
    activeFrameIndex++;
    cargarLienzoActivo();
    renderizarTimeline();
    actualizarStats(activeFrameIndex);
});
btnDeleteFrame.addEventListener('click', () => {
    if (framesData.length <= 1) {
        framesData[0] = "";
    } else {
        framesData.splice(activeFrameIndex, 1);
        if (activeFrameIndex >= framesData.length) activeFrameIndex = framesData.length - 1;
    }
    cargarLienzoActivo();
    renderizarTimeline();
    actualizarStats(activeFrameIndex);
});

// --- EXPORTAR / IMPORTAR TXT ---
btnExportTxt.addEventListener('click', () => {
    const payload = [`${linesInput.value},${charsInput.value},${fpsInput.value}`, ...framesData].join(SEPARATOR);
    const blob = new Blob([payload], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `bittex_${Date.now()}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    cerrarModal(modalSave);
});

btnImportTxt.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const chunks = evt.target.result.split(SEPARATOR);
            const meta = chunks[0].split(',');
            linesInput.value = meta[0] || 5;
            charsInput.value = meta[1] || 10;
            fpsInput.value = meta[2] || 4;
            framesData = chunks.slice(1);
            cargarLienzoActivo();
            compilarAnimacion();
            renderizarTimeline();
            display.textContent = framesArray[0];
            cerrarModal(modalSave);
        } catch (err) {
            alert('Error al leer el archivo. Asegúrate de que sea un archivo válido.');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

// --- EXPORTAR GIF CON STEPPER ---
function calcularBase() {
    const anchoChars = parseInt(charsInput.value) || 10;
    const altoChars = parseInt(linesInput.value) || 5;
    const baseFontSize = 16;
    const lineHeight = baseFontSize * 1.15;
    const charWidth = baseFontSize * 0.6;
    const baseW = anchoChars * charWidth;
    const baseH = altoChars * lineHeight;
    const margen = 20;
    return { baseW, baseH, margen };
}

function obtenerEscalasValidas() {
    const { baseW, baseH, margen } = calcularBase();
    return escalasPermitidas.filter(factor => {
        const w = Math.round(baseW * factor + margen * factor);
        const h = Math.round(baseH * factor + margen * factor);
        return w <= LIMITE_PX && h <= LIMITE_PX;
    });
}

function actualizarStepper() {
    const validas = obtenerEscalasValidas();
    if (validas.length === 0) {
        escalaSeleccionada = 1;
    } else {
        if (!validas.includes(escalaSeleccionada)) {
            escalaSeleccionada = validas[0];
        }
    }
    gifScaleDisplay.textContent = `${escalaSeleccionada}×`;
    gifScaleDecrement.disabled = validas.indexOf(escalaSeleccionada) <= 0;
    gifScaleIncrement.disabled = validas.indexOf(escalaSeleccionada) >= validas.length - 1;
    actualizarResolucionGif();
}

function actualizarResolucionGif() {
    const anchoChars = parseInt(charsInput.value) || 10;
    const altoChars = parseInt(linesInput.value) || 5;
    const aspect = gifAspectRatioSelect.value || 'square';
    const factor = escalaSeleccionada || 4;
    const baseFontSize = 16;
    const lineHeight = baseFontSize * 1.15;
    const charWidth = baseFontSize * 0.6;
    const contentW = anchoChars * charWidth * factor;
    const contentH = altoChars * lineHeight * factor;
    const margen = 20 * factor;

    let canvasW, canvasH;
    if (aspect === 'square') {
        const maxDim = Math.max(contentW, contentH);
        canvasW = canvasH = maxDim + margen;
    } else {
        canvasW = contentW + margen;
        canvasH = contentH + margen;
    }
    canvasW = Math.round(canvasW);
    canvasH = Math.round(canvasH);

    const resText = document.getElementById('gifResolutionText');
    const warning = document.getElementById('gifResolutionWarning');
    resText.textContent = `${canvasW} × ${canvasH} PX`;
    if (canvasW > LIMITE_PX || canvasH > LIMITE_PX) {
        warning.style.display = 'inline';
    } else {
        warning.style.display = 'none';
    }
}

gifScaleDecrement.addEventListener('click', () => {
    const validas = obtenerEscalasValidas();
    const idx = validas.indexOf(escalaSeleccionada);
    if (idx > 0) {
        escalaSeleccionada = validas[idx - 1];
        actualizarStepper();
    }
});

gifScaleIncrement.addEventListener('click', () => {
    const validas = obtenerEscalasValidas();
    const idx = validas.indexOf(escalaSeleccionada);
    if (idx < validas.length - 1) {
        escalaSeleccionada = validas[idx + 1];
        actualizarStepper();
    }
});

gifAspectRatioSelect.addEventListener('change', () => {
    actualizarStepper();
});

btnExportGif.addEventListener('click', () => {
    cerrarModal(modalSave);
    actualizarStepper();
    abrirModal(modalGifConfig);
});

btnConfirmGif.addEventListener('click', () => {
    const config = {
        escala: escalaSeleccionada || 4,
        aspectRatio: gifAspectRatioSelect.value || 'square'
    };

    compilarAnimacion();
    const datosParaGif = {
        frames: framesArray,
        width: parseInt(charsInput.value),
        height: parseInt(linesInput.value),
        fps: parseInt(fpsInput.value)
    };

    cerrarModal(modalGifConfig);
    abrirModal(modalGifLoading);

    setTimeout(() => {
        if (typeof window.procesarGIF === 'function') {
            window.procesarGIF(datosParaGif, (exito) => {
                cerrarModal(modalGifLoading);
                if (!exito) alert('Error al generar el GIF.');
            }, config);
        } else {
            cerrarModal(modalGifLoading);
            alert('La librería GIF no está disponible. Asegúrate de tener los archivos en la carpeta js/');
        }
    }, 150);
});

// --- BAÚL DE LA APP ---
function obtenerDatosBaul() {
    return JSON.parse(localStorage.getItem('ascii_vault_slots')) || [];
}

btnSaveToVault.addEventListener('click', () => {
    let baul = obtenerDatosBaul();
    if (baul.length >= 4) {
        alert('Máximo 4 slots alcanzados. Elimina alguno para guardar este proyecto.');
        return;
    }
    baul.push({
        id: Date.now(),
        fecha: new Date().toLocaleTimeString(),
        lines: linesInput.value,
        chars: charsInput.value,
        fps: fpsInput.value,
        frames: [...framesData]
    });
    localStorage.setItem('ascii_vault_slots', JSON.stringify(baul));
    cerrarModal(modalSave);
});

function renderizarBaul() {
    vaultSlotsContainer.innerHTML = '';
    const baul = obtenerDatosBaul();
    if (baul.length === 0) {
        vaultSlotsContainer.innerHTML = '<p style="color:#666;">No hay proyectos guardados.</p>';
        return;
    }
    baul.forEach((slot, index) => {
        const item = document.createElement('div');
        item.className = 'vault-slot-item';
        item.innerHTML = `
            <span>Slot #${index+1} (${slot.fecha})</span>
            <div style="display:flex; gap:6px;">
                <button class="btn btn-small" onclick="cargarSlotBaul(${slot.id})">Abrir</button>
                <button class="btn btn-small btn-danger" onclick="eliminarSlotBaul(${slot.id})">Borrar</button>
            </div>
        `;
        vaultSlotsContainer.appendChild(item);
    });
}

window.cargarSlotBaul = function(id) {
    const baul = obtenerDatosBaul();
    const slot = baul.find(s => s.id === id);
    if (!slot) return;
    linesInput.value = slot.lines;
    charsInput.value = slot.chars;
    fpsInput.value = slot.fps;
    framesData = [...slot.frames];
    activeFrameIndex = 0;
    cargarLienzoActivo();
    compilarAnimacion();
    renderizarTimeline();
    display.textContent = framesArray[0];
    cerrarModal(modalVault);
};

window.eliminarSlotBaul = function(id) {
    if (!confirm('¿Eliminar este slot permanentemente?')) return;
    let baul = obtenerDatosBaul();
    baul = baul.filter(s => s.id !== id);
    localStorage.setItem('ascii_vault_slots', JSON.stringify(baul));
    renderizarBaul();
};

// --- INICIALIZACIÓN ---
function iniciarApp() {
    framesData = [...initialFrames];
    cargarLienzoActivo();
    compilarAnimacion();
    renderizarTimeline();
    display.textContent = framesArray[0];
    comprobarUsuarioNuevo();
    setTimeout(autoEscalarVisor, 50);
}

ejecutarSplashScreen(iniciarApp);